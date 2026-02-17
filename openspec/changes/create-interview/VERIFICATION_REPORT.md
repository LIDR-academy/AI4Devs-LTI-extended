# Verification Report: create-interview

**Date:** February 17, 2026  
**Schema:** spec-driven  
**Artifacts:** proposal, design, specs, tasks

---

## Summary

| Dimension     | Status |
|--------------|--------|
| Completeness | 128/128 tasks marked complete; **3 CRITICAL gaps** in actual implementation |
| Correctness  | Requirements implemented in code but **routes and full form not wired** |
| Coherence    | Design followed where code exists; **routing and frontend form incomplete** |

---

## 1. CRITICAL (Must fix before archive)

### 1.1 Interview routes not registered

- **Issue:** The POST (and PATCH/DELETE) interview endpoints are **not registered** in the Express app. `createInterviewController` exists in `backend/src/presentation/controllers/interviewController.ts` but is **never imported or used** in any route file.
- **Evidence:** `backend/src/routes/candidateRoutes.ts` only defines `GET /`, `POST /`, `GET /:id`, `PUT /:id`. There is no `router.post('/:candidateId/interviews', createInterviewController)` or similar.
- **Impact:** `POST /candidates/{candidateId}/interviews` returns 404. E2E and manual testing could not have passed against this codebase unless run with a different route setup.
- **Recommendation:** In `backend/src/routes/candidateRoutes.ts`, import `createInterviewController` (and `updateInterviewController`, `deleteInterviewController` if part of this change). Add `router.post('/:candidateId/interviews', createInterviewController)` **before** the `router.get('/:id', ...)` route so `:candidateId` is not captured by `:id`. Then add PATCH and DELETE for `/:candidateId/interviews/:interviewId` if required by this change.

### 1.2 GET /employees not mounted

- **Issue:** The GET `/employees` endpoint is **not mounted** in the Express app. `employeeRoutes` and `getActiveEmployees` exist in `backend/src/routes/employeeRoutes.ts` and `backend/src/presentation/controllers/employeeController.ts`, but `backend/src/index.ts` does not use `employeeRoutes`.
- **Evidence:** `index.ts` only has `app.use('/candidates', candidateRoutes)`, `app.use('/positions', positionRoutes)`, and `app.post('/upload', ...)`. No `app.use('/employees', employeeRoutes)`.
- **Impact:** GET `/employees` returns 404. The spec requirement "GET endpoint at `/employees` that returns all active employees" is not satisfied at runtime.
- **Recommendation:** In `backend/src/index.ts`, add `import employeeRoutes from './routes/employeeRoutes'` and `app.use('/employees', employeeRoutes)` (before or after other route mounts).

### 1.3 CandidateDetails form does not match spec

- **Issue:** The frontend interview creation form in `frontend/src/components/CandidateDetails.js` does **not** implement the spec. It only has notes and score; it does not include application selector, interview step selector, employee selector, or interview date. It does not call `createInterview` from `interviewService.js` and does not send required fields (applicationId, interviewStepId, employeeId, interviewDate).
- **Evidence:** `CandidateDetails.js` uses local state `newInterview: { notes, score }`, a single `fetch(..., { method: 'POST', body: JSON.stringify(newInterview) })`, and Spanish labels ("Registrar Nueva Entrevista", "Notas", "Puntuación", "Registrar"). No application/step/employee/date fields or `interviewService.createInterview` usage.
- **Spec requirement:** "Form SHALL include fields for application selection, interview step selection, employee selection, interview date, score, and notes" and "SHALL send a POST request to `/candidates/{candidateId}/interviews`" with the provided data.
- **Recommendation:** Implement the full form per `openspec/changes/create-interview/specs/create-interview/spec.md` (Requirement "Frontend interview creation form" and scenarios): application dropdown, interview step dropdown (dependent on application), employee dropdown (from GET `/employees`), interview date (date-only, ISO 8601 with 00:00:00Z), score (0–5 or 1–5 stars per spec), notes with character counter. Use `createInterview(candidateId, interviewData)` from `frontend/src/services/interviewService.js`. Use English labels and follow existing React Bootstrap patterns. If the E2E report was produced by another branch/version, align this file with that implementation.

---

## 2. WARNING (Should fix)

### 2.1 Design vs routing

- **Issue:** Design states "Add POST route in candidateRoutes.ts" and "Place route before `/:id` route". Implementation of the route handler exists; only the wiring in `candidateRoutes.ts` is missing. Once 1.1 is fixed, design adherence is satisfied.
- **Recommendation:** After adding the routes (see 1.1), confirm route order so `/:candidateId/interviews` and `/:candidateId/interviews/:interviewId` are registered before `/:id`.

### 2.2 Scenario coverage – score 1–5 vs 0–5

- **Issue:** Spec scenario "Form validation - score range" says "the score range SHALL be validated as 1-5 (not 0-5 in the UI, though 0 is technically valid in the API)". Backend validator and API use 0–5. No inconsistency if UI uses 1–5 and API accepts 0–5; just ensure the full form (when implemented) documents or maps 1–5 UI to 0–5 if needed.
- **Recommendation:** When implementing the full form, document whether the UI sends 1–5 or 0–5 and that the API accepts 0–5 per spec.

### 2.3 E2E report vs current code

- **Issue:** E2E_TEST_REPORT.md describes a form with Application, Interview Step, Employee dropdown (5 employees), Date/Time, Result, Score stars, Notes, and "Create Interview" button, and states all tests passed. The current `CandidateDetails.js` does not provide that UI or use the interview service. This suggests the report was generated against a different codebase or branch.
- **Recommendation:** Either restore the implementation that matches the E2E report or re-run E2E after fixing 1.1, 1.2, and 1.3 and update the report.

---

## 3. SUGGESTION (Nice to fix)

### 3.1 Language and labels

- **Issue:** Project rules require "English only" for technical artifacts. `CandidateDetails.js` uses Spanish for the interview section ("Detalles del Candidato", "Registrar Nueva Entrevista", "Notas", "Puntuación", "Registrar", "Cargando").
- **Recommendation:** When updating the form (1.3), use English labels and messages (e.g. "Candidate details", "Create interview", "Notes", "Score", "Submit", "Loading") for consistency with AGENTS.md/CLAUDE.md.

### 3.2 Single source of interview creation

- **Issue:** CandidateDetails currently uses inline `fetch` for POST to `/candidates/${candidate.id}/interviews` instead of `interviewService.createInterview`. The service exists and is specified; using it would centralize error handling and URL/config.
- **Recommendation:** Use `createInterview(candidateId, interviewData)` from `interviewService.js` in the form submit handler (after implementing the full form).

---

## Checks performed

- **Tasks:** Read `tasks.md`; all 128 tasks are marked `[x]`.
- **Spec:** Read `openspec/changes/create-interview/specs/create-interview/spec.md`; extracted requirements and scenarios.
- **Design:** Read `design.md`; noted decisions (POST endpoint, validator, service, Interview.save(), form in CandidateDetails).
- **Code:** Searched for `createInterviewController`, `validateInterviewData`, `createInterview`, `candidateRoutes`, `employeeRoutes`, `app.use`, and inspected `CandidateDetails.js`, `interviewService.js`, `interviewController.ts`, `interviewService.ts`, `validator.ts`, `employeeController.ts`, `employeeRoutes.ts`, `candidateRoutes.ts`, `index.ts`, `api-spec.yml`.
- **Skipped:** No separate design adherence pass beyond routing and form; pattern consistency only briefly noted.

---

## Final assessment

**Critical issues:** 3 (routes not registered, GET /employees not mounted, CandidateDetails form does not match spec).

**Fix before archiving:** Resolve the three CRITICAL items: register interview routes in `candidateRoutes.ts`, mount `employeeRoutes` in `index.ts`, and implement the full interview creation form in `CandidateDetails.js` per the delta spec. Re-run manual and E2E tests after changes and, if needed, update E2E_TEST_REPORT.md.

After these fixes, the change will be **ready for archive** from a verification perspective; address WARNINGs and SUGGESTIONs as appropriate for the project.
