## Context

The LTI platform already supports editing (`PATCH`) and deleting (`DELETE`) interviews, plus listing them in the Candidate Details pane. There is no endpoint or UI to **create** a new interview. This change adds the create operation following the same Domain-Driven Design layered architecture and conventions established by the edit/delete features.

The `Interview` domain entity (`backend/src/domain/models/Interview.ts`) and the `Interview` table (`schema.prisma`) already exist. The entity's `save()` method already branches on the presence of `id`: it **inserts** when `id` is absent and **updates** when present. Therefore no schema migration and no new persistence primitive are required — `createInterview` simply constructs an `Interview` with no `id` and calls `save()`.

An interview always belongs to an **Application** (a candidate's participation in a specific position's process). The create endpoint is nested under the candidate (`/candidates/{candidateId}/interviews`) for UI ergonomics, but the interview is attached to a specific `applicationId` supplied in the body, which must be validated to belong to that candidate.

Relevant existing code to mirror:
- `validateInterviewUpdateData` and `validateAssignCandidateToPositionData` (allow-list pattern) in `validator.ts`.
- `updateInterview` / `deleteInterview` in `interviewService.ts` (lookup + business-rule validation + domain error messages).
- `updateInterviewController` in `interviewController.ts` (param parsing, validator call, domain-error → HTTP mapping).
- The edit modal and `updateInterview` service call on the frontend.

## Goals / Non-Goals

**Goals:**
- Add `POST /candidates/{candidateId}/interviews` returning `201` with the created interview.
- Enforce required fields and foreign-key ownership integrity before any DB write (application↔candidate, step↔position flow, active employee).
- Reuse existing validation rules for `score`, `notes`, `result`, and `interviewDate`.
- Provide an "Add interview" UI per application that reuses the edit-form controls and is fully internationalized (en/es).
- Keep error shape (`{ message, error }`) and status codes consistent with edit/delete.

**Non-Goals:**
- No authentication/authorization (none exists in the codebase; not added here).
- No schema migration or change to the `Interview` entity.
- No bulk interview creation (single create only).
- No interview rescheduling/audit-log features (covered by edit; out of scope here).
- No change to existing edit/delete/list behavior.

## Decisions

### 1. Nested route under candidate, application supplied in body
**Decision**: Endpoint is `POST /candidates/{candidateId}/interviews`; `applicationId` is a **required** body field validated to belong to the path `candidateId`.

**Rationale**: Matches the UI (recruiters act from a candidate's detail pane) and the sibling edit/delete routes, while preserving the true ownership model (interview → application). Validating `application.candidateId === candidateId` prevents cross-candidate/cross-process corruption.

**Alternatives considered**: `POST /applications/{applicationId}/interviews` — truer to the model but mismatched with the existing candidate-scoped routes and the UI entry point.

### 2. Reuse the domain `save()` insert path
**Decision**: `createInterview` builds `new Interview({...})` without an `id` and calls `save()`.

**Rationale**: `save()` already implements insert when `id` is absent; reusing it avoids duplicating persistence logic and keeps DDD encapsulation. No new repository method needed.

**Alternatives considered**: Direct Prisma `create` in the service — bypasses the domain model and violates the layering used everywhere else.

### 3. Required-field validation with an allow-list
**Decision**: `validateInterviewCreateData` requires `applicationId`, `interviewStepId`, `employeeId`, `interviewDate`; treats `result`, `score`, `notes` as optional; and rejects any unexpected field (allow-list), mirroring `validateAssignCandidateToPositionData`.

**Rationale**: Create needs the FK fields present (unlike the partial-update validator where all are optional). The allow-list prevents silent acceptance of typo'd or malicious fields and returns `400`.

**Alternatives considered**: Reuse `validateInterviewUpdateData` as-is — rejected because it makes the required FK fields optional, which is wrong for create.

### 4. Business-rule validation order and error mapping
**Decision**: In the service, validate in this order, throwing domain errors with stable messages: candidate exists (`not found` → 404); application exists and `application.candidateId === candidateId` (`not found` / `does not belong` → 404); interview step exists (`not found` → 404) and belongs to the position's `interviewFlowId` (`does not belong to the position's interview flow` → 400); employee exists (`not found` → 404) and `isActive` (`is not active` → 400). The controller maps message substrings to status codes exactly as `updateInterviewController` does.

**Rationale**: Consistency with edit/delete; fail before any write; keep `{ message, error }` shape.

### 5. `result` defaults to `Pending`
**Decision**: When `result` is omitted, persist `Pending`. When provided, it must be one of `Pending` / `Passed` / `Failed` (or `null`).

**Rationale**: Matches the ticket's acceptance criteria and the interview lifecycle default.

### 6. Route ordering
**Decision**: Register `POST /:candidateId/interviews` **before** any `/:id` route in `candidateRoutes.ts`.

**Rationale**: Express matches routes in registration order; placing the nested interview route first prevents `/:id` from shadowing `:candidateId`.

### 7. Frontend create modal reuses the edit form
**Decision**: Add an "Add interview" action per application section that opens a React Bootstrap modal reusing the edit modal's controls (date/time `datetime-local`, step scoped to the application's flow, employee, result, score star-rating, notes), converting `datetime-local` → ISO before submit. On success, append the created interview to that application's list and show a success message; on validation error, keep the modal open with inline errors; disable the submit during the request.

**Rationale**: Maximizes reuse with the proven edit UX, keeps the two flows visually consistent, and scopes the step dropdown correctly to the chosen application's interview flow.

**Alternatives considered**: A separate page or inline form — more navigation/clutter, less consistent with the existing edit modal.

### 8. Internationalization
**Decision**: Add only the missing create keys (`interviews.createTitle`, `interviews.addInterview`, `interviews.createSuccess`, `interviews.failedToCreate`) to `en.json`/`es.json` and reuse existing field-label keys. No hardcoded strings.

**Rationale**: The edit feature already scaffolded shared field labels; only create-specific copy is missing.

## Risks / Trade-offs

**[Risk] Cross-candidate/cross-process data corruption** → Mitigation: validate `application.candidateId === candidateId` and `interviewStep.interviewFlowId === position.interviewFlowId` before writing.

**[Risk] Route shadowing by `/:id`** → Mitigation: register the nested route first; cover with an integration test.

**[Risk] datetime-local ↔ ISO conversion / timezone drift** → Mitigation: reuse the edit feature's conversion helper; convert to ISO 8601 (UTC) before submit; validate ISO server-side.

**[Risk] Step dropdown showing steps from the wrong flow** → Mitigation: scope step options to the selected application's position interview flow.

**[Trade-off] Bounded extra lookups (candidate, application, position, step, employee) vs. integrity** → Accept a few indexed point lookups to guarantee FK ownership; no N+1 (single insert, bounded reads).

**[Trade-off] New dedicated create validator vs. reusing the update validator** → Accept a small amount of duplication to get correct required-field semantics for create.

## Migration Plan

**Deployment steps:**
1. Deploy backend (validator, service, controller, route) — no DB migration (existing `Interview` table/`save()` insert path).
2. Deploy frontend (service method, create modal, i18n keys).
3. Verify endpoint reachable and `201` on a valid create.

**Rollback:** Revert backend and frontend changes; the create endpoint and "Add interview" action disappear while edit/delete/list remain functional. No data migration to roll back.

**Testing strategy:** TDD unit tests (validator, service happy path + every error branch, controller status mapping); integration test for `POST /candidates/:candidateId/interviews`; manual curl matrix with DB restoration; frontend component test + Playwright E2E for open/validation/success/cancel/error.

## Open Questions

- Should `applicationId` selection be hidden when "Add interview" is launched from within a specific application section (pre-selected and locked) vs. shown as a dropdown? Assumption: pre-select the launching application's context; still send `applicationId` in the body.
- Should audit logging be added for interview creation? Out of scope (future enhancement).
- Should concurrent-creation/idempotency protection be added? Out of scope; not required by current usage.
