# Create Interview – Change List

All changes tied to the **Create Interview for Candidate** feature (`create-interview.md`). For files that also contain edit/delete interview or other features, only the **create-interview** parts are described.

---

## 1. Files created (only create-interview or create-interview portion)

| File | Create-interview part |
|------|------------------------|
| `backend/src/presentation/controllers/interviewController.ts` | **Create only:** `createInterviewController` (handles `POST /candidates/:candidateId/interviews`), plus imports of `createInterview` and `validateInterviewData`. The rest of the file (update/delete controllers) is for other features. |
| `backend/src/application/services/interviewService.ts` | **Create only:** `createInterview(candidateId, interviewData)` (full function). The rest (`updateInterview`, `deleteInterview`) is for other features. |
| `backend/src/presentation/controllers/__tests__/interviewController.test.ts` | **Create only:** All tests that target `createInterviewController` (success 201, validation errors, not found, invalid IDs, etc.). Omit tests for `updateInterviewController` and `deleteInterviewController`. |
| `backend/src/application/services/__tests__/interviewService.test.ts` | **Create only:** All tests that target `createInterview` (success, candidate/application/step/employee validation, score/notes/date validation, repository usage). Omit tests for `updateInterview` and `deleteInterview`. |
| `backend/src/presentation/controllers/employeeController.ts` | **Supporting create-interview:** Added to serve active employees for the create-interview form (employee selector). Entire file is used by this feature. |
| `backend/src/routes/employeeRoutes.ts` | **Supporting create-interview:** Routes for the employees endpoint used by the create-interview form. Entire file is used by this feature. |
| `frontend/src/services/interviewService.js` | **Create only:** `createInterview(candidateId, interviewData)` (the function that POSTs to `/candidates/${candidateId}/interviews`). The rest (`updateInterview`, `deleteInterview`) is for other features. |

---

## 2. Files modified (create-interview part only)

| File | Create-interview part only |
|------|----------------------------|
| `backend/src/application/validator.ts` | **Create only:** `validateInterviewData(_candidateId, data)` (required fields, types, ISO date, score 0–5, notes max 1000). Helpers used only by it: `isValidISO8601DateTime`, `REQUIRED_INTEGER_MSG`. Do **not** include `validateInterviewUpdateData` or `validateInterviewDeletion` (edit/delete). |
| `backend/src/routes/candidateRoutes.ts` | **Create only:** `router.post('/:candidateId/interviews', createInterviewController)` and the import of `createInterviewController`. Do **not** include the PATCH/DELETE interview routes or imports of `updateInterviewController` / `deleteInterviewController`. |
| `backend/src/domain/models/Candidate.ts` | **Create-interview related:** In `findOne`, the `applications.include.interviews` block so that after creating an interview the candidate details can show the updated list (id, applicationId, interviewStepId, employeeId, interviewDate, score, notes, interviewStep; `result` is used by the edit UI but the same include supports create’s “refresh list after create”). |
| `backend/src/domain/models/Interview.ts` | **Create-interview related:** No code change required by the spec; existing `save()` already handles create when `id` is absent (branch that calls `prisma.interview.create`). Used as-is for create. |
| `backend/src/index.ts` | **Create-interview related:** Registration of employee routes: `import employeeRoutes` and `app.use('/employees', employeeRoutes)`, so the create-interview form can load active employees. |
| `frontend/src/components/CandidateDetails.js` | **Create only:** (1) State for create form: `formData` (applicationId, interviewStepId, employeeId, interviewDate, score, notes), `validationErrors`, `submitLoading`. (2) Fetch of interview steps and employees for the create form. (3) Create-form validation and submit handler that calls `createInterview(candidate.id, payload)` and refreshes candidate/applications so the new interview appears. (4) The “Create new interview” UI: application selector, interview step, employee, date, score, notes, “Create interview” button. (5) Import and use of `createInterview` from `interviewService`. Do **not** include: edit modal, `editFormData`, `updateInterview`, Edit button, result badge, or any delete-related UI/logic. |
| `ai-specs/specs/api-spec.yml` | **Create only:** Path ` /candidates/{candidateId}/interviews` with **post** (summary “Create interview for candidate”), request body `CreateInterviewRequest`, responses 201/400/404/500, and component schema **CreateInterviewRequest** (applicationId, interviewStepId, employeeId, interviewDate, score, notes; required: applicationId, interviewStepId, employeeId, interviewDate). Do **not** include the PATCH/DELETE operations under ` /candidates/{candidateId}/interviews/{interviewId}` or schemas UpdateInterviewRequest / DeleteInterviewRequest. **InterviewResponse** is shared; create-interview only needs the 201 response to reference it. |

---

## 3. Summary

- **New files:** Controller and service for create, their unit tests, employee controller/routes (for the form), and frontend interview service (create function).
- **Modified files:** Validator (create validation only), candidate routes (POST interview only), Candidate/Interview models (include and save used for create), index (employee routes), CandidateDetails (create form and flow only), api-spec (POST + CreateInterviewRequest only).

This list isolates the **create-interview** scope; anything for update interview, delete interview, or other changes is explicitly excluded from the “create-interview part” descriptions above.

---

## 4. Partial commits (only create-interview changes)

Yes. You can commit only the create-interview parts of mixed files using **interactive staging**.

### How: stage by hunk

1. **Interactive add**  
   From the repo root:
   ```bash
   git add -p backend/src/application/validator.ts
   git add -p backend/src/routes/candidateRoutes.ts
   # ... repeat for each mixed file
   ```
2. For each **hunk**, Git will ask:  
   `Stage this hunk [y,n,q,a,d,e,?]?`  
   - **y** = stage this hunk (use for create-interview hunks)  
   - **n** = do not stage (use for edit/delete or unrelated hunks)  
   - **e** = manually edit the hunk (to split or trim lines before staging)  
   - **?** = show help for all options  

3. **Commit** only what you staged:
   ```bash
   git commit -m "feat(create-interview): add create interview endpoint and form"
   ```

### Per-file notes (mixed files)

| File | Partial-commit approach |
|------|-------------------------|
| `validator.ts` | Stage hunks for `isValidISO8601DateTime`, `REQUIRED_INTEGER_MSG`, and `validateInterviewData` only. Say **n** to hunks for `validateInterviewUpdateData` and `validateInterviewDeletion`. |
| `candidateRoutes.ts` | Stage the hunk that adds `createInterviewController` import and `router.post('/:candidateId/interviews', ...)`. Say **n** to hunks that add `updateInterviewController`, `deleteInterviewController`, and PATCH/DELETE routes. |
| `interviewController.ts` | Stage hunks for `createInterviewController` and its imports (`createInterview`, `validateInterviewData`). Say **n** to hunks for `updateInterviewController`, `deleteInterviewController`, and their imports. |
| `interviewService.ts` | Stage the hunk(s) that add the `createInterview` function. Say **n** to hunks for `updateInterview` and `deleteInterview`. |
| `interviewController.test.ts` / `interviewService.test.ts` | Stage only the describe/it blocks that test the create controller or `createInterview`. Use **n** for update/delete tests, or **e** to trim a block to only create tests. |
| `frontend/src/services/interviewService.js` | Stage the `createInterview` function and its JSDoc. Say **n** to `updateInterview` and `deleteInterview`. |
| `CandidateDetails.js` | Many hunks; stage those that add create form state, create form UI (including Result dropdown), `createInterview` usage, and create-related validation. Say **n** to edit modal, delete modal, `updateInterview`, and delete handlers. |
| `api-spec.yml` | Stage the block for `POST /candidates/{candidateId}/interviews` and the `CreateInterviewRequest` schema. Say **n** to PATCH/DELETE operations and UpdateInterviewRequest/DeleteInterviewRequest. |

### Limitations

- **Shared hunks**: If one hunk contains both create and edit/delete changes (e.g. a single import line that lists create + update + delete), use **e** to edit the hunk and leave only the create-related lines, or stage the whole hunk and accept that the commit includes that shared line.
- **Whole-file features**: Files that are 100% create-interview (e.g. `employeeController.ts`, `employeeRoutes.ts`) can be committed in full with `git add <file>`.
- **Order of commits**: If you want a clean history, commit create-interview first (partial adds as above), then commit the remaining changes in a follow-up commit (or on another branch).
