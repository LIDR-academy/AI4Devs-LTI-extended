## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/SCRUM-4-backend` from main/master branch
- [x] 0.2 Verify branch creation and current branch status

## 1. Backend: Validator Tests (TDD)

- [x] 1.1 Write failing tests for `validateInterviewDeletion` - valid deletion data scenarios (candidateId, interviewId, reason)
- [x] 1.2 Write failing tests for `validateInterviewDeletion` - missing reason field
- [x] 1.3 Write failing tests for `validateInterviewDeletion` - empty reason string
- [x] 1.4 Write failing tests for `validateInterviewDeletion` - reason exceeds 500 characters
- [x] 1.5 Write failing tests for `validateInterviewDeletion` - invalid candidateId format (non-numeric)
- [x] 1.6 Write failing tests for `validateInterviewDeletion` - invalid interviewId format (non-numeric)
- [x] 1.7 Write failing tests for `validateInterviewDeletion` - reason with valid length (1-500 characters)

## 2. Backend: Validator Implementation

- [x] 2.1 Implement `validateInterviewDeletion` function in `validator.ts` - basic structure and parameter extraction
- [x] 2.2 Add validation for candidateId (required, must be numeric)
- [x] 2.3 Add validation for interviewId (required, must be numeric)
- [x] 2.4 Add validation for reason (required, non-empty string, max 500 characters)
- [x] 2.5 Run validator tests and verify all pass

## 3. Backend: Service Tests (TDD)

- [x] 3.1 Write failing tests for `deleteInterview` - successful deletion of pending interview
- [x] 3.2 Write failing tests for `deleteInterview` - candidate not found (404)
- [x] 3.3 Write failing tests for `deleteInterview` - interview not found (404)
- [x] 3.4 Write failing tests for `deleteInterview` - interview does not belong to candidate (404)
- [x] 3.5 Write failing tests for `deleteInterview` - attempt to delete completed interview with "Passed" result (422)
- [x] 3.6 Write failing tests for `deleteInterview` - attempt to delete completed interview with "Failed" result (422)
- [x] 3.7 Write failing tests for `deleteInterview` - database error handling (500)
- [x] 3.8 Write failing tests for `deleteInterview` - deletion of pending interview (result is null or "Pending")

## 4. Backend: Service Implementation

- [x] 4.1 Implement `deleteInterview` function in `interviewService.ts` - check candidate existence
- [x] 4.2 Add logic to check interview existence and ownership (belongs to candidate)
- [x] 4.3 Add business rule validation - prevent deletion of completed interviews (result is "Passed" or "Failed")
- [x] 4.4 Add logic to permanently delete interview from database using repository
- [x] 4.5 Add error handling for database errors
- [x] 4.6 Add logging for audit trail (log deletion with interview ID, candidate ID, reason, timestamp)
- [x] 4.7 Run service tests and verify all pass

## 5. Backend: Controller Tests (TDD)

- [x] 5.1 Write failing tests for `deleteInterviewController` - successful deletion (200)
- [x] 5.2 Write failing tests for `deleteInterviewController` - invalid candidateId format (400)
- [x] 5.3 Write failing tests for `deleteInterviewController` - invalid interviewId format (400)
- [x] 5.4 Write failing tests for `deleteInterviewController` - candidate not found (404)
- [x] 5.5 Write failing tests for `deleteInterviewController` - interview not found (404)
- [x] 5.6 Write failing tests for `deleteInterviewController` - validation errors (missing reason, empty reason, reason too long) (400)
- [x] 5.7 Write failing tests for `deleteInterviewController` - completed interview deletion attempt (422)
- [x] 5.8 Write failing tests for `deleteInterviewController` - server errors (500)

## 6. Backend: Controller Implementation

- [x] 6.1 Implement `deleteInterviewController` function in `interviewController.ts` - parse request parameters (candidateId, interviewId)
- [x] 6.2 Extract deletion reason from request body
- [x] 6.3 Add ID format validation (candidateId and interviewId must be numeric)
- [x] 6.4 Integrate validator call for deletion data validation
- [x] 6.5 Integrate service call for deletion logic
- [x] 6.6 Add error handling with appropriate HTTP status codes (400, 404, 422, 500)
- [x] 6.7 Return appropriate success response (200) with success message
- [x] 6.8 Run controller tests and verify all pass

## 7. Backend: Route and Integration

- [x] 7.1 Add DELETE route in `candidateRoutes.ts` for `/:candidateId/interviews/:interviewId` connecting to `deleteInterviewController`
- [x] 7.2 Ensure route is placed correctly to avoid conflicts with other routes
- [x] 7.3 Verify route registration and middleware application

## 8. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 8.1 Review all existing interview-related unit tests (interviewController.test.ts, interviewService.test.ts)
- [x] 8.2 Update existing tests if necessary to ensure compatibility with new deletion functionality
- [x] 8.3 Verify no existing tests are broken by the new changes
- [x] 8.4 Ensure all existing interview creation and update tests still pass

## 9. Backend: Run Unit Tests and Verify Database State (MANDATORY)

- [x] 9.1 Run full backend test suite and verify 0 failures (1 pre-existing failure in candidateController unrelated to deletion)
- [x] 9.2 Generate and review test coverage report - verify 90% coverage threshold met for new deletion code (interviewController.ts: 95% coverage)
- [x] 9.3 Verify database state is properly restored after all tests
- [x] 9.4 Verify all CREATE/UPDATE/DELETE operations restore database to original state
- [x] 9.5 Document test results and coverage metrics

## 10. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 10.1 Ensure backend server is running on localhost:3010
- [x] 10.2 Test successful deletion - DELETE pending interview with valid reason
- [x] 10.3 Test validation error - DELETE without reason field (400)
- [x] 10.4 Test validation error - DELETE with empty reason (400)
- [x] 10.5 Test validation error - DELETE with reason exceeding 500 characters (400)
- [x] 10.6 Test 404 error - DELETE with non-existent candidateId (404)
- [x] 10.7 Test 404 error - DELETE with non-existent interviewId (404)
- [x] 10.8 Test 404 error - DELETE with interview not belonging to candidate (404) - Verified via service tests
- [x] 10.9 Test business rule violation - DELETE completed interview with "Passed" result (422)
- [x] 10.10 Test business rule violation - DELETE completed interview with "Failed" result (422)
- [x] 10.11 Test invalid ID format - DELETE with non-numeric candidateId (400)
- [x] 10.12 Test invalid ID format - DELETE with non-numeric interviewId (400)
- [x] 10.13 Verify interview is permanently removed from database after successful deletion
- [x] 10.14 Verify deleted interview is no longer accessible via GET endpoints
- [x] 10.15 Document all curl commands executed and their responses (see CURL_TESTING.md)
- [x] 10.16 Restore database state after testing (test interviews deleted as expected, no restoration needed)

**Manual Testing Commands:**
```bash
# Successful deletion of pending interview
curl -X DELETE http://localhost:3010/candidates/1/interviews/1 -H "Content-Type: application/json" -d '{"reason":"Interview cancelled by candidate"}'

# Validation error - missing reason
curl -X DELETE http://localhost:3010/candidates/1/interviews/1 -H "Content-Type: application/json" -d '{}'

# Validation error - empty reason
curl -X DELETE http://localhost:3010/candidates/1/interviews/1 -H "Content-Type: application/json" -d '{"reason":""}'

# Validation error - reason too long
curl -X DELETE http://localhost:3010/candidates/1/interviews/1 -H "Content-Type: application/json" -d '{"reason":"'$(printf 'a%.0s' {1..501})'"}'

# 404 error - candidate not found
curl -X DELETE http://localhost:3010/candidates/99999/interviews/1 -H "Content-Type: application/json" -d '{"reason":"Test"}'

# 404 error - interview not found
curl -X DELETE http://localhost:3010/candidates/1/interviews/99999 -H "Content-Type: application/json" -d '{"reason":"Test"}'

# 422 error - attempt to delete completed interview
curl -X DELETE http://localhost:3010/candidates/1/interviews/2 -H "Content-Type: application/json" -d '{"reason":"Test"}'

# Invalid ID format - non-numeric candidateId
curl -X DELETE http://localhost:3010/candidates/invalid/interviews/1 -H "Content-Type: application/json" -d '{"reason":"Test"}'

# Invalid ID format - non-numeric interviewId
curl -X DELETE http://localhost:3010/candidates/1/interviews/invalid -H "Content-Type: application/json" -d '{"reason":"Test"}'
```

## 11. Frontend: Service Method

- [x] 11.1 Add `deleteInterview(candidateId, interviewId, reason)` method to `frontend/src/services/interviewService.js`
- [x] 11.2 Implement DELETE request to `/candidates/:candidateId/interviews/:interviewId` endpoint with reason in request body
- [x] 11.3 Add error handling and throw appropriately with error messages
- [x] 11.4 Test API integration manually in browser console

## 12. Frontend: Delete Confirmation Modal Component

- [x] 12.1 Create or update delete confirmation modal component (can be integrated into CandidateDetails or separate component)
- [x] 12.2 Add text input field for deletion reason (required)
- [x] 12.3 Add "Cancel" button to close modal without deletion
- [x] 12.4 Add "Delete" button to confirm deletion
- [x] 12.5 Add validation to prevent deletion without reason (disable Delete button or show error)
- [x] 12.6 Add loading state during deletion API call
- [x] 12.7 Add error message display for API errors
- [x] 12.8 Add success feedback after successful deletion

## 13. Frontend: CandidateDetails Component Updates

- [x] 13.1 Add delete button/icon next to each pending interview in the interviews list
- [x] 13.2 Hide or disable delete button for completed interviews (result is "Passed" or "Failed")
- [x] 13.3 Add click handler to open delete confirmation modal
- [x] 13.4 Implement deletion logic - call deleteInterview service method on confirmation
- [x] 13.5 Remove interview from UI immediately after successful deletion (optimistic update)
- [x] 13.6 Refresh candidate details from API after deletion to ensure consistency
- [x] 13.7 Handle error cases - display error message and keep interview in list if deletion fails

## 14. Frontend: E2E Testing with Playwright MCP (MANDATORY if applicable - AGENT MUST EXECUTE)

- [x] 14.1 Ensure frontend and backend servers are running
- [x] 14.2 Navigate to candidate details page using Playwright MCP browser_navigate
- [x] 14.3 Verify delete button is visible for pending interviews
- [x] 14.4 Verify delete button is hidden/disabled for completed interviews
- [x] 14.5 Click delete button for a pending interview
- [x] 14.6 Verify confirmation modal opens with reason input field
- [x] 14.7 Test cancel action - click Cancel button and verify modal closes without deletion
- [x] 14.8 Test deletion flow - enter reason and click Delete button
- [x] 14.9 Verify interview is removed from UI after successful deletion
- [x] 14.10 Verify candidate details refresh after deletion
- [x] 14.11 Test error scenario - attempt to delete completed interview (if possible) - Verified via UI: delete buttons not shown for completed interviews
- [x] 14.12 Test validation - attempt to delete without reason (if UI prevents this) - Verified: Delete button disabled until reason entered
- [x] 14.13 Restore test environment - recreate deleted test interview if needed (test interview deleted as expected, no restoration needed)
- [x] 14.14 Document E2E test scenarios and outcomes (see E2E_TEST_REPORT.md)

## 15. Update Technical Documentation (MANDATORY)

- [x] 15.1 Add DELETE `/candidates/{candidateId}/interviews/{interviewId}` endpoint to `ai-specs/specs/api-spec.yml`
- [x] 15.2 Include request body schema with reason field (required, string, max 500 characters)
- [x] 15.3 Document response schemas (200 success, 400 validation errors, 404 not found, 422 business rule violation, 500 server error)
- [x] 15.4 Add example requests and responses to API spec
- [x] 15.5 Document business rule: completed interviews cannot be deleted
- [x] 15.6 Document validation rules: reason required, non-empty, max 500 characters
- [x] 15.7 Update Interview model section in `ai-specs/specs/data-model.md` with deletion operation details (if applicable)
- [x] 15.8 Document deletion audit trail requirements (logging)

## 16. Final Verification

- [x] 16.1 Run full backend test suite - verify 90% coverage threshold met for new deletion code (interviewController.ts: 95% coverage)
- [x] 16.2 Run frontend E2E tests if applicable - verify all pass (E2E tests completed via Playwright MCP - all passed)
- [x] 16.3 Manual end-to-end testing - complete deletion workflow (documented in section 10 and CURL_TESTING.md)
- [x] 16.4 Manual testing - error scenarios (validation, 404, 422, etc.) (documented in section 10 and CURL_TESTING.md)
- [x] 16.5 Verify all ESLint errors resolved (No ESLint errors)
- [x] 16.6 Verify TypeScript compiles without errors (Build successful)
- [x] 16.7 Code review checklist - verify all acceptance criteria met
- [x] 16.8 Verify deletion audit trail logging is working correctly (logging implemented in interviewService.ts, verified in unit tests)
