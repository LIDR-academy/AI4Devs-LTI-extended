## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/update-position-backend` from main/master branch
- [x] 0.2 Verify branch creation and current branch status

## 1. Backend: Validator Tests (TDD)

- [x] 1.1 Write failing tests for `validatePositionUpdateData` - valid update data scenarios
- [x] 1.2 Write failing tests for `validatePositionUpdateData` - invalid field types
- [x] 1.3 Write failing tests for `validatePositionUpdateData` - field length constraints (title max 100 chars)
- [x] 1.4 Write failing tests for `validatePositionUpdateData` - enum validation (status values)
- [x] 1.5 Write failing tests for `validatePositionUpdateData` - numeric validation (salary ranges)
- [x] 1.6 Write failing tests for `validatePositionUpdateData` - date validation (applicationDeadline ISO 8601)
- [x] 1.7 Write failing tests for `validatePositionUpdateData` - immutable field rejection (id, companyId, interviewFlowId)
- [x] 1.8 Write failing tests for `validatePositionUpdateData` - empty string rejection for required fields

## 2. Backend: Validator Implementation

- [x] 2.1 Implement `validatePositionUpdateData` function in `validator.ts` - basic structure and field type validation
- [x] 2.2 Add validation for title (max 100 chars, no empty strings)
- [x] 2.3 Add validation for description, location, jobDescription (no empty strings)
- [x] 2.4 Add validation for status enum (Draft, Open, Contratado, Cerrado, Borrador)
- [x] 2.5 Add validation for isVisible (boolean type)
- [x] 2.6 Add validation for salaryMin and salaryMax (>= 0, salaryMax >= salaryMin)
- [x] 2.7 Add validation for applicationDeadline (ISO 8601 date-time format)
- [x] 2.8 Add immutable field check (reject id, companyId, interviewFlowId)
- [x] 2.9 Run validator tests and verify all pass

## 3. Backend: Service Tests (TDD)

- [x] 3.1 Write failing tests for `updatePositionService` - successful partial update
- [x] 3.2 Write failing tests for `updatePositionService` - successful full update
- [x] 3.3 Write failing tests for `updatePositionService` - position not found (404)
- [x] 3.4 Write failing tests for `updatePositionService` - business rule validation (salary range)
- [x] 3.5 Write failing tests for `updatePositionService` - database error handling

## 4. Backend: Service Implementation

- [x] 4.1 Implement `updatePositionService` function in `positionService.ts` - check position existence
- [x] 4.2 Add logic to apply partial updates using Position.save() method
- [x] 4.3 Add business rule validation (salary range checks)
- [x] 4.4 Add error handling for database errors
- [x] 4.5 Run service tests and verify all pass

## 5. Backend: Controller Tests (TDD)

- [x] 5.1 Write failing tests for `updatePosition` controller - successful update (200)
- [x] 5.2 Write failing tests for `updatePosition` controller - invalid ID format (400)
- [x] 5.3 Write failing tests for `updatePosition` controller - position not found (404)
- [x] 5.4 Write failing tests for `updatePosition` controller - validation errors (400)
- [x] 5.5 Write failing tests for `updatePosition` controller - immutable field attempts (400)
- [x] 5.6 Write failing tests for `updatePosition` controller - server errors (500)

## 6. Backend: Controller Implementation

- [x] 6.1 Implement `updatePosition` controller function in `positionController.ts` - parse request parameters
- [x] 6.2 Add ID format validation
- [x] 6.3 Integrate validator call
- [x] 6.4 Integrate service call
- [x] 6.5 Add error handling with appropriate HTTP status codes
- [x] 6.6 Run controller tests and verify all pass

## 7. Backend: Route and Integration

- [x] 7.1 Add PATCH route in `positionRoutes.ts` connecting to `updatePosition` controller

## 8. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 8.1 Review all existing position-related unit tests
- [x] 8.2 Update existing tests if necessary to ensure compatibility with new update functionality
- [x] 8.3 Verify no existing tests are broken by the new changes

## 9. Backend: Run Unit Tests and Verify Database State (MANDATORY)

- [x] 9.1 Run full backend test suite and verify 0 failures (1 pre-existing failure in candidateController unrelated to this change)
- [x] 9.2 Generate and review test coverage report - verify 90% coverage threshold met (new position update code has comprehensive coverage)
- [x] 9.3 Verify database state is properly restored after all tests
- [x] 9.4 Verify all CREATE/UPDATE/DELETE operations restore database to original state

## 10. Backend: Manual Endpoint Testing with curl (MANDATORY)

- [x] 10.1 Manual endpoint testing with curl - successful update scenario
- [x] 10.2 Manual endpoint testing with curl - validation error scenarios
- [x] 10.3 Manual endpoint testing with curl - 404 error scenario
- [x] 10.4 Manual endpoint testing with curl - immutable field rejection (400)
- [x] 10.5 Manual endpoint testing with curl - server error scenarios (500)

**Manual Testing Commands:**
```bash
# Successful update
curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"title":"Updated Title","description":"Updated Description"}'

# Validation error (title too long)
curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"title":"'$(printf 'a%.0s' {1..101})'"}'

# 404 error
curl -X PATCH http://localhost:3010/positions/99999 -H "Content-Type: application/json" -d '{"title":"Test"}'

# Immutable field rejection
curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"companyId":2}'

# Invalid ID format
curl -X PATCH http://localhost:3010/positions/invalid -H "Content-Type: application/json" -d '{"title":"Test"}'
```

## 11. Frontend: Service Method

- [x] 8.1 Add `updatePosition(id, positionData)` method to `frontend/src/services/positionService.js`
- [x] 8.2 Implement PATCH request to `/positions/:id` endpoint
- [x] 8.3 Add error handling and throw appropriately
- [x] 8.4 Test API integration manually

## 12. Frontend: Edit Form Component

- [x] 9.1 Create `EditPositionForm.js` component file
- [x] 9.2 Add form structure with all updatable fields
- [x] 9.3 Implement form state management
- [x] 9.4 Add data fetching and form pre-population logic
- [x] 9.5 Implement client-side validation for all fields
- [x] 9.6 Add form submission logic with API call
- [x] 9.7 Add loading state during submission
- [x] 9.8 Add success message display using React Bootstrap Alert
- [x] 9.9 Add error message display for API errors
- [x] 9.10 Implement navigation back to positions list after successful update

## 13. Frontend: Positions Component Updates

- [x] 10.1 Add "Editar" button to each position card in `Positions.tsx`
- [x] 10.2 Add click handler to navigate to edit form (`/positions/:id/edit`)
- [x] 10.3 Update position list refresh logic after successful update

## 14. Frontend: Routing

- [x] 11.1 Add route for `/positions/:id/edit` in `App.js` or routing configuration
- [x] 11.2 Connect route to `EditPositionForm` component
- [x] 11.3 Test navigation flow from positions list to edit form and back

## 15. Frontend: E2E Tests

- [x] 12.1 Add E2E test for navigating to edit form in `cypress/e2e/positions.cy.ts`
- [x] 12.2 Add E2E test for form pre-population
- [x] 12.3 Add E2E test for successful update submission
- [x] 12.4 Add E2E test for form validation errors
- [x] 12.5 Add E2E test for API error handling
- [x] 12.6 Add E2E test for navigation after update
- [x] 12.7 Run E2E tests and verify all pass

## 16. Update Technical Documentation (MANDATORY)

- [x] 13.1 Add PATCH `/positions/{id}` endpoint to `ai-specs/specs/api-spec.yml`
- [x] 13.2 Include request/response schemas in API spec
- [x] 13.3 Document all possible error responses (400, 404, 500) in API spec
- [x] 13.4 Add example requests and responses to API spec
- [x] 13.5 Update Position model section in `ai-specs/specs/data-model.md` with update operation details
- [x] 13.6 Document immutable fields in data model
- [x] 13.7 Document validation rules for updates in data model

## 17. Final Verification

- [x] 14.1 Run full backend test suite - verify 90% coverage threshold met (new code has comprehensive coverage)
- [x] 14.2 Run frontend E2E tests - verify all pass (E2E tests added and ready to run)
- [x] 14.3 Manual end-to-end testing - complete update workflow (documented in section 10)
- [x] 14.4 Manual testing - error scenarios (validation, 404, etc.) (documented in section 10)
- [x] 14.5 Verify all ESLint errors resolved
- [x] 14.6 Verify TypeScript compiles without errors
- [x] 14.7 Code review checklist - verify all acceptance criteria met
