## Why

Recruiters can already **edit** (`PATCH`) and **delete** (`DELETE`) interviews, but there is no way to **create** a new interview from the system. Today recruiters track upcoming evaluation meetings outside the platform, which leads to incomplete records and a fragmented recruitment workflow. SCRUM-86 closes this gap by letting recruiters schedule a new interview for a candidate, against a specific application (the candidate's participation in a position's process), directly from the Candidate Details pane.

## What Changes

- **New Backend API Endpoint**: `POST /candidates/{candidateId}/interviews` creates a new interview for one of the candidate's applications and returns `201 Created` with the created interview.
- **New Backend Validation**: `validateInterviewCreateData()` enforces required fields (`applicationId`, `interviewStepId`, `employeeId`, `interviewDate`), optional-field rules (`result`, `score`, `notes`), and rejects unexpected fields via an allow-list.
- **New Backend Service Method**: `createInterview(candidateId, interviewData)` enforces business rules — candidate exists; application exists and belongs to the candidate; interview step exists and belongs to the application's position's interview flow; employee exists and is active — then persists via the existing `Interview.save()` insert path.
- **New Backend Controller**: `createInterviewController` parses/validates `candidateId`, runs body validation, maps domain errors to HTTP status codes, and returns `201`.
- **New Route**: `POST /:candidateId/interviews` registered in `candidateRoutes.ts` **before** `/:id` to avoid route shadowing.
- **New Frontend Service Method**: `createInterview(candidateId, interviewData)` in `interviewService.js`.
- **Enhanced Frontend UI**: An "Add interview" action per application section in `CandidateDetails.js`, opening a create modal that reuses the edit form controls (application context, date/time, step scoped to the flow, employee, result, score, notes), converts `datetime-local` → ISO before submit, appends the new interview on success, and shows inline validation/loading states.
- **i18n**: Add the missing create keys (`interviews.createTitle`, `interviews.addInterview`, `interviews.createSuccess`, `interviews.failedToCreate`) to `en.json` and `es.json`, reusing existing field labels. No hardcoded UI strings.
- **Documentation**: Add the `post:` operation under `/candidates/{candidateId}/interviews` and a `CreateInterviewRequest` schema (`additionalProperties: false`) to the API spec; reuse `InterviewResponse` for the body.

**No schema migration required** — the `Interview` entity already exists in `schema.prisma` and `domain/models/Interview.ts`, and `save()` already supports insert when no `id` is present.

## Capabilities

### New Capabilities
- `create-interview`: Create a new interview for a candidate against one of their applications via REST API and the Candidate Details UI, with full server-side validation, foreign-key ownership enforcement (application↔candidate, step↔position flow, active employee), and i18n.

### Modified Capabilities
_None._ The `Interview` data model and existing edit/delete capabilities are unchanged; this change only adds the create operation.

## Impact

**Backend:**
- `backend/src/application/validator.ts` — add `validateInterviewCreateData()`.
- `backend/src/application/services/interviewService.ts` — add `createInterview()`.
- `backend/src/presentation/controllers/interviewController.ts` — add `createInterviewController`.
- `backend/src/routes/candidateRoutes.ts` — register `POST /:candidateId/interviews` before `/:id`.
- `backend/src/domain/models/Interview.ts` — no change (`save()` already supports insert).
- Test suites: new validator, service, controller unit tests + integration test for the endpoint.

**Frontend:**
- `frontend/src/services/interviewService.js` — add `createInterview()`.
- `frontend/src/components/CandidateDetails.js` — add "Add interview" action + create modal, state management, ISO conversion, success/error handling.
- `frontend/src/i18n/locales/en.json` & `es.json` — add missing create keys.

**Documentation:**
- `docs/api-spec.yml` — add `post:` for `/candidates/{candidateId}/interviews` (`201`/`400`/`404`/`500`) and `CreateInterviewRequest` schema.
- `docs/data-model.md` — no change (Interview already documented).

**Security / NFR:** Endpoints remain `Public` (no auth layer exists; none added). All input validated/sanitized server-side; error shape `{ message, error }` and status codes match the existing edit/delete endpoints; single insert with bounded lookups (no N+1).

**No Breaking Changes** — purely additive; existing endpoints and data structures are untouched.
