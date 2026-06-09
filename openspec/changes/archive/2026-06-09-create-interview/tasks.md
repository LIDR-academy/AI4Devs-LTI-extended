## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/SCRUM-86-create-interview` from the base branch
- [x] 0.2 Verify branch creation and current branch status

## 1. Backend: Validator Tests (TDD)

- [x] 1.1 Write failing tests for `validateInterviewCreateData` - valid full payload (all fields)
- [x] 1.2 Write failing tests for `validateInterviewCreateData` - valid minimal payload (required fields only, `result` omitted)
- [x] 1.3 Write failing tests for `validateInterviewCreateData` - missing required `applicationId` (400)
- [x] 1.4 Write failing tests for `validateInterviewCreateData` - missing required `interviewStepId` (400)
- [x] 1.5 Write failing tests for `validateInterviewCreateData` - missing required `employeeId` (400)
- [x] 1.6 Write failing tests for `validateInterviewCreateData` - missing required `interviewDate` (400)
- [x] 1.7 Write failing tests for `validateInterviewCreateData` - non-integer FK fields (applicationId/interviewStepId/employeeId)
- [x] 1.8 Write failing tests for `validateInterviewCreateData` - invalid `interviewDate` format (non-ISO 8601)
- [x] 1.9 Write failing tests for `validateInterviewCreateData` - score out of range (< 0, > 5) and null allowed
- [x] 1.10 Write failing tests for `validateInterviewCreateData` - notes length > 1000 and null allowed
- [x] 1.11 Write failing tests for `validateInterviewCreateData` - result invalid value and valid values (Pending/Passed/Failed)
- [x] 1.12 Write failing tests for `validateInterviewCreateData` - unexpected/extra field rejected (allow-list)

## 2. Backend: Validator Implementation

- [x] 2.1 Implement `validateInterviewCreateData` in `validator.ts` - basic structure with allow-list of expected fields
- [x] 2.2 Require `applicationId`, `interviewStepId`, `employeeId`, `interviewDate` (all positive integers / valid date)
- [x] 2.3 Validate `interviewDate` is valid ISO 8601 format
- [x] 2.4 Validate optional `score` (integer 0-5 inclusive or null)
- [x] 2.5 Validate optional `notes` (string max 1000 characters or null)
- [x] 2.6 Validate optional `result` (one of Pending/Passed/Failed or null; defaults to Pending downstream)
- [x] 2.7 Reject any field not in the allow-list with a clear error
- [x] 2.8 Run validator tests and verify all pass

## 3. Backend: Service Tests (TDD)

- [x] 3.1 Write failing tests for `createInterview` - successful creation with all fields
- [x] 3.2 Write failing tests for `createInterview` - successful creation with minimal fields (result defaults to Pending)
- [x] 3.3 Write failing tests for `createInterview` - candidate not found (404)
- [x] 3.4 Write failing tests for `createInterview` - application not found (404)
- [x] 3.5 Write failing tests for `createInterview` - application does not belong to candidate (404)
- [x] 3.6 Write failing tests for `createInterview` - interview step not found (404)
- [x] 3.7 Write failing tests for `createInterview` - interview step does not belong to position's flow (400)
- [x] 3.8 Write failing tests for `createInterview` - employee not found (404)
- [x] 3.9 Write failing tests for `createInterview` - employee is not active (400)
- [x] 3.10 Write failing tests for `createInterview` - database/persistence error handling (500)

## 4. Backend: Service Implementation

- [x] 4.1 Add `createInterview(candidateId, interviewData)` to `interviewService.ts`
- [x] 4.2 Validate candidate exists (404 if not)
- [x] 4.3 Validate application exists and `application.candidateId === candidateId` (404 if not / not owned)
- [x] 4.4 Validate interview step exists (404) and belongs to the application's position's `interviewFlowId` (400)
- [x] 4.5 Validate employee exists (404) and is active `isActive = true` (400)
- [x] 4.6 Apply `result` default of `Pending` when omitted
- [x] 4.7 Construct `new Interview({...})` without `id` and persist via `save()` (insert path)
- [x] 4.8 Add error handling for persistence errors (500)
- [x] 4.9 Return the created interview object
- [x] 4.10 Run service tests and verify all pass

## 5. Backend: Controller Tests (TDD)

- [x] 5.1 Write failing tests for `createInterviewController` - successful creation (201 response)
- [x] 5.2 Write failing tests for `createInterviewController` - invalid candidate ID format (400)
- [x] 5.3 Write failing tests for `createInterviewController` - body validation error (400)
- [x] 5.4 Write failing tests for `createInterviewController` - candidate not found (404)
- [x] 5.5 Write failing tests for `createInterviewController` - application not found / not owned by candidate (404)
- [x] 5.6 Write failing tests for `createInterviewController` - interview step not found (404)
- [x] 5.7 Write failing tests for `createInterviewController` - interview step not in flow (400)
- [x] 5.8 Write failing tests for `createInterviewController` - employee not found (404)
- [x] 5.9 Write failing tests for `createInterviewController` - employee not active (400)
- [x] 5.10 Write failing tests for `createInterviewController` - server error (500)

## 6. Backend: Controller Implementation

- [x] 6.1 Add `createInterviewController` to `interviewController.ts`
- [x] 6.2 Extract and validate `candidateId` from URL params (400 if NaN)
- [x] 6.3 Extract interview data from request body
- [x] 6.4 Integrate validator call (`validateInterviewCreateData`) → 400 on throw
- [x] 6.5 Integrate service call (`createInterview`)
- [x] 6.6 Add success response `201 Created` with the created interview
- [x] 6.7 Map domain errors to HTTP status: `not found` → 404; `is not active` / `does not belong to the position's interview flow` → 400; else 500
- [x] 6.8 Use try-catch consistent with `updateInterviewController` and the `{ message, error }` shape
- [x] 6.9 Run controller tests and verify all pass

## 7. Backend: Route and Integration

- [x] 7.1 Import `createInterviewController` in `candidateRoutes.ts`
- [x] 7.2 Register `router.post('/:candidateId/interviews', createInterviewController)`
- [x] 7.3 Ensure the route is registered BEFORE any `/:id` route to avoid route shadowing
- [x] 7.4 Write integration test for `POST /candidates/:candidateId/interviews` (success + key error cases)
- [x] 7.5 Verify route registration and endpoint accessibility

## 8. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 8.1 Review existing interview-related unit tests (edit/delete) for compatibility
- [x] 8.2 Review existing candidate- and application-related unit tests
- [x] 8.3 Update existing tests if necessary to remain compatible with the new create functionality
- [x] 8.4 Verify no existing tests are broken by the new changes
- [x] 8.5 Ensure existing test coverage is maintained

## 9. Backend: Run Unit Tests and Verify Database State (MANDATORY)

- [x] 9.1 Capture pre-test database baseline for impacted entities (Interview counts, etc.)
- [x] 9.2 Run targeted unit tests for changed modules (validator, service, controller)
- [x] 9.3 Run the required broader backend test suite and record totals/failures/runtime
- [x] 9.4 Verify post-test database state and restore if needed
- [x] 9.5 Create report `specs/create-interview/reports/YYYY-MM-DD-step-9-unit-test-and-db-verification.md`
- [x] 9.6 Mark step complete only after tests pass and the report exists

## 10. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 10.1 Ensure the backend server is running and DB connection is active
- [x] 10.2 Test POST success (full payload) → 201, verify created interview, then delete the created record to restore DB
- [x] 10.3 Test POST success (minimal payload, result defaults to Pending) → 201, then restore DB
- [x] 10.4 Test 400 - invalid candidateId format
- [x] 10.5 Test 400 - missing required field / unexpected field / invalid score / notes too long / invalid result
- [x] 10.6 Test 404 - candidate not found; application not found / not owned by candidate; step not found; employee not found
- [x] 10.7 Test 400 - step not in position's flow; employee not active
- [x] 10.8 Document all curl commands and responses in `specs/create-interview/reports/` (e.g., `CURL_TESTING.md`)
- [x] 10.9 Verify database state matches pre-test state after cleanup

## 11. Frontend: Service Method

- [x] 11.1 Add `createInterview(candidateId, interviewData)` to `frontend/src/services/interviewService.js`
- [x] 11.2 Use axios `POST` to `/candidates/${candidateId}/interviews`
- [x] 11.3 Reuse the same error-extraction pattern as `updateInterview`
- [x] 11.4 Return the created interview object

## 12. Frontend: CandidateDetails Component Enhancement

- [x] 12.1 Add an "Add interview" action per application section (label from `interviews.addInterview`)
- [x] 12.2 Add state for the create modal (`creatingForApplication`, `createInterviewData`, `createLoading`, `createError`)
- [x] 12.3 On click, open the create modal with the application context pre-set
- [x] 12.4 Build the create modal (React Bootstrap) titled `interviews.createTitle`, reusing edit-form controls:
  - [x] 12.4.1 Application context (pre-selected for the launching application)
  - [x] 12.4.2 Interview Date & Time (`datetime-local` input)
  - [x] 12.4.3 Interview Step (dropdown scoped to the application's position interview flow)
  - [x] 12.4.4 Employee (dropdown of active employees)
  - [x] 12.4.5 Result (dropdown: Pending/Passed/Failed; default Pending)
  - [x] 12.4.6 Score (star rating 0-5)
  - [x] 12.4.7 Notes (textarea, max 1000 characters)
- [x] 12.5 Implement submit: validate, convert `datetime-local` → ISO, call `createInterview()`, show loading/disabled state
- [x] 12.6 On success: close modal, append the new interview to that application's list, show `interviews.createSuccess`
- [x] 12.7 On validation error: keep modal open with inline errors
- [x] 12.8 On network/server error: show `interviews.failedToCreate`
- [x] 12.9 Implement Cancel: close modal without API call, reset form state and errors
- [x] 12.10 Ensure modal accessibility (keyboard navigation, focus management, aria-labels)

## 13. Frontend: i18n Keys

- [x] 13.1 Add `interviews.createTitle`, `interviews.addInterview`, `interviews.createSuccess`, `interviews.failedToCreate` to `frontend/src/i18n/locales/en.json`
- [x] 13.2 Add the same keys (Spanish) to `frontend/src/i18n/locales/es.json`
- [x] 13.3 Reuse existing field-label keys (application, selectApplication, dateTime, step, employee, result, score, notes, saving, save)
- [x] 13.4 Verify no hardcoded UI strings remain in the create modal

## 14. Frontend: Component Testing

- [x] 14.1 Test "Add interview" action appears per application
- [x] 14.2 Test clicking the action opens the create modal with application context and empty fields
- [x] 14.3 Test form validation (required fields, score range, notes length)
- [x] 14.4 Test successful create appends the interview and shows the success message
- [x] 14.5 Test Cancel closes the modal without an API call
- [x] 14.6 Test error handling and display

## 15. Frontend: E2E Testing with Playwright MCP (MANDATORY - AGENT MUST EXECUTE)

- [x] 15.1 Ensure frontend and backend servers are running and DB is in a known state
- [x] 15.2 Navigate to a candidate's details and open the "Add interview" modal
- [x] 15.3 Fill the form and submit; verify 201, modal close, new interview in the list, and success message
- [x] 15.4 Test validation errors keep the modal open
- [x] 15.5 Test cancel closes the modal without creating
- [x] 15.6 Restore database state (delete the created interview) and document outcomes in `specs/create-interview/reports/`

## 16. Update Technical Documentation (MANDATORY)

- [x] 16.1 Add `post:` for `/candidates/{candidateId}/interviews` to `docs/api-spec.yml` (responses 201/400/404/500)
- [x] 16.2 Add `CreateInterviewRequest` schema (`additionalProperties: false`; required: applicationId, interviewStepId, employeeId, interviewDate; optional: result, score, notes)
- [x] 16.3 Reuse `InterviewResponse` for the 201 response body
- [x] 16.4 Document path parameter `candidateId` and example request/response
- [x] 16.5 Confirm `docs/data-model.md` needs no change (Interview already documented); note if otherwise
- [x] 16.6 Mirror API changes in `openspec/specs/api-spec.yml` if applicable (no `openspec/specs/api-spec.yml` file exists; not applicable)

## 17. Final Verification

- [x] 17.1 Run full backend test suite - all green; verify coverage threshold for new code ✅ (248 tests pass, 4 pre-existing suite failures unrelated to this feature)
- [x] 17.2 Run frontend build/tests - no ESLint/TypeScript errors ✅ (build succeeds; pre-existing PositionDetails.js unused-var warning not introduced by this feature; 26 frontend tests pass, 1 pre-existing suite failure)
- [x] 17.3 Manual end-to-end testing - complete create workflow ✅ (Playwright MCP E2E, Test 1 PASS)
- [x] 17.4 Manual testing - error scenarios (400/404/500) ✅ (curl tests in section 10; validation errors via E2E Test 3)
- [x] 17.5 Verify acceptance criteria from SCRUM-86 are met:
  - [x] 17.5.1 `POST /candidates/{candidateId}/interviews` implemented and returns 201 on valid create ✅
  - [x] 17.5.2 Required-field, value, and business-rule validation enforced with correct status codes ✅
  - [x] 17.5.3 FK ownership enforced (application↔candidate, step↔flow, active employee) ✅
  - [x] 17.5.4 Error shape `{ message, error }` consistent with edit/delete ✅
  - [x] 17.5.5 Frontend "Add interview" action + create modal works, fully i18n'd (en/es) ✅
  - [x] 17.5.6 No hardcoded UI strings; backend fully typed; DDD layering respected ✅
  - [x] 17.5.7 API documentation updated ✅
