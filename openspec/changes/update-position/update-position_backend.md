# Backend Implementation Plan: update-position Position Update Feature

## 1. Overview

This implementation plan covers the backend development for the Position Update feature, which enables authorized users to edit information of existing positions using a PATCH endpoint that supports partial updates. The implementation follows Domain-Driven Design (DDD) principles with a layered architecture, ensuring type safety, proper validation, and comprehensive error handling.

### Architecture Principles
- **Domain-Driven Design (DDD)**: Clear separation between Domain, Application, and Presentation layers
- **Clean Architecture**: Each layer has distinct responsibilities and dependencies flow inward
- **Type Safety**: Full TypeScript typing throughout the codebase
- **Test-Driven Development (TDD)**: Write tests first, then implement functionality
- **Partial Update Support**: Only provided fields are updated; unprovided fields retain their current values

### Current Implementation Status
The following components are already implemented:
- ✅ `validatePositionUpdateData` function in `validator.ts`
- ✅ `updatePositionService` function in `positionService.ts`
- ✅ `updatePosition` controller in `positionController.ts`
- ✅ `PATCH /positions/:id` route in `positionRoutes.ts`
- ✅ Basic unit tests for service and controller layers

This plan ensures all requirements are met, tests are comprehensive, and documentation is complete.

## 2. Architecture Context

### Layers Involved

**Domain Layer** (`backend/src/domain/models/Position.ts`):
- `Position` class with constructor and `save()` method
- Static factory method `findOne(id: number)` for entity retrieval
- Domain entity encapsulates business logic and persistence

**Application Layer** (`backend/src/application/`):
- `positionService.ts`: Contains `updatePositionService` business logic
- `validator.ts`: Contains `validatePositionUpdateData` validation logic
- Services orchestrate business operations and delegate to domain models

**Presentation Layer** (`backend/src/presentation/`):
- `positionController.ts`: Contains `updatePosition` HTTP request handler
- Handles request/response formatting and error mapping

**Infrastructure Layer**:
- Prisma ORM handles database operations through domain model's `save()` method
- Express.js framework for HTTP handling

### Components/Files Referenced

**Existing Files to Review/Update**:
- `backend/src/domain/models/Position.ts` - Domain entity (verify `save()` supports updates)
- `backend/src/application/services/positionService.ts` - Service implementation
- `backend/src/application/validator.ts` - Validation logic
- `backend/src/presentation/controllers/positionController.ts` - Controller implementation
- `backend/src/routes/positionRoutes.ts` - Route definition
- `backend/src/application/services/positionService.test.ts` - Service tests
- `backend/src/presentation/controllers/positionController.test.ts` - Controller tests

**Documentation Files to Update**:
- `ai-specs/specs/api-spec.yml` - API specification
- `ai-specs/specs/data-model.md` - Data model documentation

## 3. Implementation Steps

### Step 0: Create Feature Branch (MANDATORY - FIRST STEP)

- **Action**: Create and switch to a new feature branch following the development workflow
- **Branch Naming**: `feature/update-position-backend` (required, separate from general task branches)
- **Implementation Steps**:
  1. Ensure you're on the latest `main` or `develop` branch (or appropriate base branch)
  2. Pull latest changes: `git pull origin [base-branch]`
  3. Create new branch: `git checkout -b feature/update-position-backend`
  4. Verify branch creation: `git branch`
- **Notes**: This must be the FIRST step before any code changes. Refer to `openspec/config.yaml` and `ai-specs/specs/backend-standards.mdc` section "Development Workflow" for specific branch naming conventions and workflow rules.

### Step 1: Review and Verify Validator Implementation

- **File**: `backend/src/application/validator.ts`
- **Action**: Review existing `validatePositionUpdateData` function and ensure it covers all validation requirements
- **Function Signature**: `validatePositionUpdateData(positionData: any): void`
- **Implementation Steps**:
  1. **Verify Immutable Field Validation**:
     - Check that `id`, `companyId`, and `interviewFlowId` are rejected with appropriate error messages
     - Verify error message format: `"[field] field cannot be updated"`
  
  2. **Verify Field Type Validation**:
     - `title`: string, max 100 chars, cannot be empty
     - `description`: string, cannot be empty
     - `location`: string, cannot be empty
     - `jobDescription`: string, cannot be empty
     - `status`: string, must be one of: "Draft", "Open", "Contratado", "Cerrado", "Borrador"
     - `isVisible`: boolean
     - `salaryMin`: number, >= 0
     - `salaryMax`: number, >= 0
     - `applicationDeadline`: string (ISO 8601 format)
     - Optional fields: `requirements`, `responsibilities`, `employmentType`, `benefits`, `companyDescription`, `contactInfo`
  
  3. **Verify Business Rule Validation**:
     - If both `salaryMin` and `salaryMax` are provided, `salaryMax` must be >= `salaryMin`
     - `applicationDeadline` must be valid ISO 8601 date-time string and parseable
  
  4. **Verify Empty String Handling**:
     - Core fields (`title`, `description`, `location`, `jobDescription`) cannot be empty strings
     - Error messages should be descriptive: `"[field] cannot be empty"`
  
  5. **Verify Partial Update Support**:
     - All fields are optional (only provided fields are validated)
     - Function should not throw errors for missing optional fields
- **Dependencies**: None
- **Implementation Notes**: The validator should throw `Error` with descriptive messages. All validation must happen before any database operations.

### Step 2: Review and Verify Service Implementation

- **File**: `backend/src/application/services/positionService.ts`
- **Action**: Review existing `updatePositionService` function and ensure it implements all business logic correctly
- **Function Signature**: `updatePositionService(positionId: number, updateData: any): Promise<any>`
- **Implementation Steps**:
  1. **Verify Position Existence Check**:
     - Use `Position.findOne(positionId)` to retrieve existing position
     - If position not found, throw `new Error('Position not found')`
     - Store the existing position for merging
  
  2. **Verify Partial Update Logic**:
     - Only update fields that are provided in `updateData`
     - Use `if (updateData.field !== undefined)` pattern for each updatable field
     - Handle `applicationDeadline` date conversion (string to Date object if needed)
     - Preserve existing values for fields not provided
  
  3. **Verify Business Rule Validation**:
     - After applying updates, validate salary range: `salaryMax >= salaryMin` if both provided
     - Throw error with message: `'salaryMax must be greater than or equal to salaryMin'`
  
  4. **Verify Save Operation**:
     - Call `existingPosition.save()` to persist changes
     - The `save()` method in Position model should handle updates (checks for `id` presence)
     - Return the updated position data
  
  5. **Verify Error Handling**:
     - Catch and re-throw domain errors (e.g., "Position not found")
     - Catch database errors and wrap in generic error message
     - Log errors for debugging: `console.error('Error updating position:', error)`
- **Dependencies**: 
  - `Position` domain model from `../../domain/models/Position`
- **Implementation Notes**: The service should handle partial updates correctly. The Position model's `save()` method already supports updates when `id` is present.

### Step 3: Review and Verify Controller Implementation

- **File**: `backend/src/presentation/controllers/positionController.ts`
- **Action**: Review existing `updatePosition` controller and ensure it handles all HTTP scenarios correctly
- **Function Signature**: `updatePosition(req: Request, res: Response): Promise<void>`
- **Implementation Steps**:
  1. **Verify Parameter Parsing**:
     - Parse `positionId` from `req.params.id` using `parseInt()`
     - Validate ID format: if `isNaN(positionId)`, return 400 with message: `'Invalid position ID format'`
  
  2. **Verify Validation Call**:
     - Call `validatePositionUpdateData(req.body)` before service call
     - Catch validation errors and return 400 status with appropriate error message
  
  3. **Verify Service Call**:
     - Call `updatePositionService(positionId, req.body)`
     - Handle successful response: return 200 status with updated position JSON
  
  4. **Verify Error Response Mapping**:
     - **400 Bad Request**: Invalid ID format, validation errors, immutable field attempts
       - Error messages containing: `'cannot be updated'`, `'must be'`, `'cannot be empty'`, `'must not exceed'`, `'must be one of'`
     - **404 Not Found**: Position not found
       - Error message: `'Position not found'`
     - **500 Internal Server Error**: Server/database errors
       - Generic error message: `'Error updating position'`
  
  5. **Verify Response Format**:
     - Success (200): Return updated position object directly
     - Error (400/404/500): Return `{ message: string, error: string }` format
- **Dependencies**:
  - `updatePositionService` from `../../application/services/positionService`
  - `validatePositionUpdateData` from `../../application/validator`
  - Express `Request` and `Response` types
- **Implementation Notes**: Controller should be thin - delegate to service and validator. All error handling should map domain errors to appropriate HTTP status codes.

### Step 4: Verify Route Registration

- **File**: `backend/src/routes/positionRoutes.ts`
- **Action**: Verify PATCH route is properly registered
- **Implementation Steps**:
  1. **Verify Route Definition**:
     - Route should be: `router.patch('/:id', updatePosition)`
     - Route should be registered before other routes that might conflict (e.g., `/:id/candidates`)
     - Import `updatePosition` controller from `../presentation/controllers/positionController`
  
  2. **Verify Route Order**:
     - Specific routes (e.g., `/:id/candidates`) should come before parameterized routes if applicable
     - Current order appears correct: `/:id` comes after `/` but before `/:id/candidates`
- **Dependencies**: 
  - `updatePosition` controller
- **Implementation Notes**: The route is already registered. Verify it's in the correct position to avoid route conflicts.

### Step 5: Write Comprehensive Unit Tests

- **File**: `backend/src/application/services/positionService.test.ts` and `backend/src/presentation/controllers/positionController.test.ts`
- **Action**: Ensure all test scenarios are covered according to testing standards
- **Implementation Steps**:

#### 5.1 Validator Tests (if not already complete)
Create or update `backend/src/application/__tests__/validator.test.ts`:

1. **Successful Cases**:
   - Valid partial update with single field
   - Valid partial update with multiple fields
   - Valid full update with all fields
   - Valid update with optional fields (requirements, responsibilities, etc.)
   - Valid update with null values for optional fields

2. **Validation Errors**:
   - Invalid field types (title as number, isVisible as string, etc.)
   - Field length constraints (title > 100 chars)
   - Empty string rejection (title, description, location, jobDescription)
   - Invalid status enum value
   - Invalid boolean value for isVisible
   - Negative salary values
   - Invalid date format for applicationDeadline
   - Invalid ISO 8601 format for applicationDeadline

3. **Immutable Field Rejection**:
   - Attempt to update `id` field
   - Attempt to update `companyId` field
   - Attempt to update `interviewFlowId` field
   - Attempt to update multiple immutable fields

4. **Business Rule Validation**:
   - `salaryMax < salaryMin` when both provided
   - Valid salary range (salaryMax >= salaryMin)

5. **Edge Cases**:
   - Empty request body (should be valid - no updates)
   - Undefined vs null handling
   - Very long strings for optional fields
   - Date parsing edge cases (invalid dates, timezone issues)

#### 5.2 Service Tests (Review and Enhance)
Update `backend/src/application/services/positionService.test.ts`:

1. **Successful Cases**:
   - Partial update with single field
   - Partial update with multiple fields
   - Full update with all fields
   - Update preserving existing values for unprovided fields
   - Update with date conversion (string to Date)

2. **Not Found**:
   - Position ID doesn't exist
   - Position ID is 0 or negative

3. **Business Rule Validation**:
   - Salary range validation (salaryMax < salaryMin)
   - Salary range validation (salaryMax >= salaryMin) - should succeed

4. **Server Errors**:
   - Database connection errors
   - Prisma update errors
   - Save method failures

5. **Edge Cases**:
   - Update with empty updateData object
   - Update with only optional fields
   - Update with null values for optional fields

#### 5.3 Controller Tests (Review and Enhance)
Update `backend/src/presentation/controllers/positionController.test.ts`:

1. **Successful Cases**:
   - Successful update returns 200 with updated position
   - Valid ID format parsing
   - Correct service and validator calls

2. **Validation Errors**:
   - Invalid ID format (non-numeric string)
   - Validation errors from validator (400 status)
   - Immutable field attempts (400 status)
   - Multiple validation errors

3. **Not Found**:
   - Position not found (404 status)
   - Correct error message format

4. **Server Errors**:
   - Database errors (500 status)
   - Service errors (500 status)
   - Unexpected errors (500 status)

5. **Edge Cases**:
   - Missing request body
   - Empty request body
   - Invalid JSON in request body
   - Very large request body

- **Dependencies**: 
  - Jest testing framework
  - Mock implementations for Position model, Prisma client
- **Implementation Notes**: Follow AAA pattern (Arrange-Act-Assert). Use descriptive test names: `should_[expected_behavior]_when_[condition]`. Mock all external dependencies. Ensure 90% test coverage threshold is met.

### Step 6: Review and Update Existing Unit Tests (MANDATORY)

- **Action**: Analyze existing unit tests to identify which ones need updates due to code changes
- **Implementation Steps**:
  1. **Identify Affected Tests**: Review all existing unit tests in the project to determine which tests may be affected by the position update implementation:
     - Tests for `getPositionByIdService` - verify they still work correctly
     - Tests for `getAllPositionsService` - verify they still work correctly
     - Tests for other position-related services - verify no regressions
     - Tests for position controller GET endpoints - verify they still work correctly
     - Integration tests that may be impacted by position update functionality
  
  2. **Review Test Coverage**: Check if existing tests still cover all edge cases and scenarios after the changes:
     - Verify GET endpoints still work correctly
     - Verify no breaking changes to existing functionality
     - Ensure tests align with any changes to Position model
  
  3. **Update Tests**: Modify existing tests as needed to:
     - Reflect new behavior or requirements (if any)
     - Fix broken assertions due to API changes (if any)
     - Update mock data or expectations (if needed)
     - Ensure tests align with validation rules
  
  4. **Document Changes**: Note which tests were updated and why
- **Notes**: This step is MANDATORY. All existing tests must be reviewed and updated if necessary before considering the implementation complete. Do not skip this validation.

### Step 7: Run Unit Tests and Verify Database State (MANDATORY)

- **Action**: Execute all unit tests and ensure database state is properly restored after tests
- **Implementation Steps**:
  1. **Run All Unit Tests**: Execute the test suite for the modified components:
     - Run validator tests: `npm test -- validator.test.ts`
     - Run service tests: `npm test -- positionService.test.ts`
     - Run controller tests: `npm test -- positionController.test.ts`
     - Run all related tests: `npm test`
     - Capture the full test report output
  
  2. **Verify Test Results**: 
     - Check that all tests pass (green status)
     - Review any failing tests and error messages
     - Identify root causes of failures
  
  3. **Fix Failing Tests**: 
     - Address any test failures by fixing:
       - Implementation bugs
       - Incorrect test assertions
       - Missing test setup/teardown
       - Database state issues
  
  4. **Verify Database State Restoration**:
     - Ensure all tests that modify database values properly restore the database to its original state
     - Verify that test cleanup/teardown hooks are working correctly
     - Check that database transactions are properly rolled back (if using transaction-based testing)
     - Confirm that test fixtures are properly reset between tests
     - **Important**: Since unit tests should mock database operations, verify that mocks are properly reset between tests
  
  5. **Show Test Report**: Display the complete test execution report including:
     - Total number of tests run
     - Number of passing tests
     - Number of failing tests (must be 0)
     - Test coverage metrics (should meet 90% threshold)
     - Execution time
  
  6. **Re-run Tests**: After fixing any issues, re-run the test suite to confirm all tests pass
  
  7. **Generate Coverage Report**:
     - Run: `npm run test:coverage`
     - Verify coverage meets 90% threshold for branches, functions, lines, and statements
     - Review coverage report for any uncovered code paths
- **Dependencies**: 
  - Test framework (Jest)
  - Test cleanup/teardown mechanisms
  - Mock utilities
- **Notes**: 
  - This step is MANDATORY and must be completed before marking implementation as done
  - All tests must pass (0 failures)
  - Test coverage must meet 90% threshold
  - Database state must be properly managed (mocks should be reset between tests)
  - Test report must be shown and verified
  - Do not proceed to next steps if tests are failing or coverage is below threshold

### Step 8: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- **Action**: Manually test all new endpoints using curl commands and restore database state for CREATE/UPDATE/DELETE operations
- **Implementation Steps**:
  1. **Prepare Test Environment**:
     - Ensure the backend server is running: `cd backend && npm run dev`
     - Verify database connection is active
     - Note the current database state (identify a test position ID to use)
     - Document the original position data for restoration
  
  2. **Test PATCH Endpoint - Successful Partial Update**:
     - Create curl command: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"title": "Updated Title"}'`
     - Execute curl command and capture response
     - Verify response status code (200)
     - Verify response body contains updated position with new title
     - Verify other fields remain unchanged
     - **Restore Database State**: Revert the title back to original value
  
  3. **Test PATCH Endpoint - Successful Full Update**:
     - Create curl command with multiple fields: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"title": "New Title", "description": "New Description", "status": "Open", "isVisible": true}'`
     - Execute curl command and capture response
     - Verify response status code (200)
     - Verify response body contains all updated fields
     - **Restore Database State**: Revert all updated fields back to original values
  
  4. **Test PATCH Endpoint - Validation Errors**:
     - Test invalid ID format: `curl -X PATCH http://localhost:3010/positions/invalid -H "Content-Type: application/json" -d '{"title": "Test"}'`
     - Verify response status code (400)
     - Test title too long: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"title": "'$(python3 -c "print('a'*101)")'"}'`
     - Verify response status code (400)
     - Test empty title: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"title": ""}'`
     - Verify response status code (400)
     - Test invalid status: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"status": "InvalidStatus"}'`
     - Verify response status code (400)
     - Test invalid salary range: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"salaryMin": 80000, "salaryMax": 50000}'`
     - Verify response status code (400)
  
  5. **Test PATCH Endpoint - Immutable Field Attempts**:
     - Test companyId update: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"companyId": 2}'`
     - Verify response status code (400)
     - Test interviewFlowId update: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"interviewFlowId": 2}'`
     - Verify response status code (400)
     - Test id update: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"id": 999}'`
     - Verify response status code (400)
  
  6. **Test PATCH Endpoint - Not Found**:
     - Test non-existent position: `curl -X PATCH http://localhost:3010/positions/99999 -H "Content-Type: application/json" -d '{"title": "Test"}'`
     - Verify response status code (404)
     - Verify error message format
  
  7. **Test PATCH Endpoint - Optional Fields**:
     - Test update with optional fields: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"requirements": "New requirements", "benefits": "New benefits"}'`
     - Verify response status code (200)
     - Verify optional fields are updated
     - **Restore Database State**: Revert optional fields to original values
  
  8. **Test PATCH Endpoint - Date Field**:
     - Test applicationDeadline update: `curl -X PATCH http://localhost:3010/positions/1 -H "Content-Type: application/json" -d '{"applicationDeadline": "2026-12-31T23:59:59Z"}'`
     - Verify response status code (200)
     - Verify date is correctly parsed and stored
     - **Restore Database State**: Revert applicationDeadline to original value
  
  9. **Document All Tests**:
     - Document all curl commands used
     - Document all responses received (status codes and body)
     - Document database state restoration actions
     - Include examples of successful and error responses
     - Create a `CURL_TESTING.md` file in the change directory with all test results
- **Dependencies**:
  - Backend server running
  - Database access for state restoration
  - curl command-line tool
- **Notes**:
  - This step is MANDATORY for all new endpoints
  - **The agent MUST execute all curl commands itself** - never ask the user to run tests
  - All UPDATE operations must restore database to original state after testing
  - Document all curl commands and responses for future reference
  - Verify that database state matches pre-test state after cleanup
  - Do not skip manual testing even if unit tests pass
  - **Task completion in tasks.md can only be marked after successful execution of all curl tests**

### Step 9: Update Technical Documentation (MANDATORY)

- **Action**: Review and update technical documentation according to changes made
- **Implementation Steps**:
  1. **Review Changes**: Analyze all code changes made during implementation
     - Validator function `validatePositionUpdateData`
     - Service function `updatePositionService`
     - Controller function `updatePosition`
     - Route definition `PATCH /positions/:id`
  
  2. **Identify Documentation Files**: Determine which documentation files need updates based on:
     - Data model changes → Update `ai-specs/specs/data-model.md`
     - API endpoint changes → Update `ai-specs/specs/api-spec.yml`
     - Standards/libraries/config changes → Update relevant `*-standards.mdc` files (if needed)
  
  3. **Update API Specification** (`ai-specs/specs/api-spec.yml`):
     - Add or update `PATCH /positions/{id}` endpoint definition
     - Include complete request/response schemas
     - Document all possible error responses (400, 404, 500)
     - Add example requests and responses
     - Document partial update behavior
     - Document immutable fields
     - Follow OpenAPI 3.0 specification format
  
  4. **Update Data Model Documentation** (`ai-specs/specs/data-model.md`):
     - Update Position model section with update operation details
     - Document immutable fields (`id`, `companyId`, `interviewFlowId`)
     - Document validation rules for updates
     - Document partial update support
     - Document error responses
     - Include examples of update operations
  
  5. **Verify Documentation**: 
     - Confirm all changes are accurately reflected
     - Check that documentation follows established structure
     - Ensure all examples are correct and tested
     - Verify English language usage throughout
  
  6. **Report Updates**: Document which files were updated and what changes were made
- **References**: 
  - Follow process described in `ai-specs/specs/documentation-standards.mdc`
  - All documentation must be written in English
- **Notes**: This step is MANDATORY before considering the implementation complete. Do not skip documentation updates.

## 4. Implementation Order

The implementation should follow this sequential order:

1. **Step 0**: Create Feature Branch (MANDATORY - FIRST STEP)
2. **Step 1**: Review and Verify Validator Implementation
3. **Step 2**: Review and Verify Service Implementation
4. **Step 3**: Review and Verify Controller Implementation
5. **Step 4**: Verify Route Registration
6. **Step 5**: Write Comprehensive Unit Tests
7. **Step 6**: Review and Update Existing Unit Tests (MANDATORY)
8. **Step 7**: Run Unit Tests and Verify Database State (MANDATORY)
9. **Step 8**: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)
10. **Step 9**: Update Technical Documentation (MANDATORY)

**MANDATORY Steps** (must be included and completed):
- Step 0: Create Feature Branch (must be FIRST step)
- Step 6: Review and Update Existing Unit Tests
- Step 7: Run Unit Tests and Verify Database State
- Step 8: Manual Endpoint Testing with curl (agent must execute)
- Step 9: Update Technical Documentation

## 5. Testing Checklist

Post-implementation verification checklist:

### MANDATORY Validations

- [ ] All existing unit tests have been reviewed and updated if necessary
- [ ] All new unit tests have been created and are passing
- [ ] All unit tests have been executed and the full test report has been reviewed
- [ ] All test failures have been fixed (0 failures required)
- [ ] Test coverage meets 90% threshold for branches, functions, lines, and statements
- [ ] Database state is properly restored after all tests that modify database values (mocks are reset)
- [ ] Test cleanup/teardown mechanisms are working correctly
- [ ] All new endpoints have been manually tested using curl
- [ ] All curl commands and responses have been documented
- [ ] Database state has been restored after testing UPDATE endpoints
- [ ] Error cases have been tested manually (validation errors, 404, immutable field attempts, etc.)
- [ ] API specification has been updated with PATCH endpoint documentation
- [ ] Data model documentation has been updated with update operation details

### Test Coverage Requirements

- **Validator Tests**: All validation scenarios covered (valid data, invalid types, length constraints, enum validation, business rules, immutable fields)
- **Service Tests**: All business logic scenarios covered (partial updates, full updates, not found, business rules, database errors)
- **Controller Tests**: All HTTP scenarios covered (success, validation errors, not found, server errors, edge cases)

## 6. Error Response Format

### Error Response Structure

All error responses follow this JSON structure:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Code Mapping

- **200 OK**: Successful update
  ```json
  {
    "id": 1,
    "companyId": 1,
    "interviewFlowId": 1,
    "title": "Updated Position Title",
    ...
  }
  ```

- **400 Bad Request**: Invalid input data or validation errors
  ```json
  {
    "message": "Validation error",
    "error": "title must not exceed 100 characters"
  }
  ```

- **400 Bad Request**: Attempt to update immutable fields
  ```json
  {
    "message": "Validation error",
    "error": "companyId field cannot be updated"
  }
  ```

- **404 Not Found**: Position does not exist
  ```json
  {
    "message": "Position not found",
    "error": "Position not found"
  }
  ```

- **500 Internal Server Error**: Server error
  ```json
  {
    "message": "Error updating position",
    "error": "Database connection failed"
  }
  ```

## 7. Partial Update Support

### Behavior

The PATCH endpoint supports partial updates:
- Only provided fields in the request body are updated
- Unprovided fields retain their current values in the database
- All fields in the request body are optional
- If a field is provided, it must meet validation rules

### Examples

**Partial Update (Single Field)**:
```json
// Request
PATCH /positions/1
{
  "title": "New Title"
}

// Response: Only title is updated, all other fields remain unchanged
```

**Partial Update (Multiple Fields)**:
```json
// Request
PATCH /positions/1
{
  "title": "New Title",
  "status": "Open",
  "isVisible": true
}

// Response: Only provided fields are updated
```

**Full Update (All Fields)**:
```json
// Request
PATCH /positions/1
{
  "title": "New Title",
  "description": "New Description",
  "status": "Open",
  "isVisible": true,
  "location": "Barcelona",
  "jobDescription": "New Job Description",
  ...
}

// Response: All provided fields are updated
```

## 8. Dependencies

### External Libraries and Tools

- **Express.js**: Web application framework (already installed)
- **Prisma Client**: Type-safe database client (already installed)
- **TypeScript**: Type-safe development (already installed)
- **Jest**: Testing framework (already installed)
- **curl**: Command-line tool for manual testing (system tool)

### Internal Dependencies

- **Position Domain Model**: `backend/src/domain/models/Position.ts`
- **Validator Module**: `backend/src/application/validator.ts`
- **Position Service**: `backend/src/application/services/positionService.ts`
- **Position Controller**: `backend/src/presentation/controllers/positionController.ts`
- **Position Routes**: `backend/src/routes/positionRoutes.ts`

## 9. Notes

### Important Reminders

1. **Language Requirement**: All code, comments, error messages, and documentation must be in English (per project standards in `CLAUDE.md` and `AGENTS.md`).

2. **Partial Updates**: The PATCH endpoint supports partial updates - only provided fields are updated. This is a key feature that must be maintained.

3. **Immutable Fields**: The fields `id`, `companyId`, and `interviewFlowId` cannot be updated. Attempting to update these fields must return a 400 error.

4. **Validation Order**: Validation should happen before any database operations. The validator should be called in the controller before the service.

5. **Error Handling**: All errors should be properly caught and mapped to appropriate HTTP status codes. Domain errors should be preserved with descriptive messages.

6. **Test Coverage**: All code must meet the 90% test coverage threshold for branches, functions, lines, and statements.

7. **Database State**: In manual testing, always restore the database to its original state after UPDATE operations.

8. **Type Safety**: All code must be fully typed with TypeScript. Avoid using `any` type; use specific types or `unknown` if needed.

### Business Rules

1. **Immutable Fields**: `companyId` and `interviewFlowId` cannot be updated after position creation (business rule).

2. **Partial Updates**: Only provided fields are updated. Unprovided fields retain their current values.

3. **Empty String Handling**: Core required fields (`title`, `description`, `location`, `jobDescription`) cannot be set to empty strings.

4. **Salary Range Validation**: If both `salaryMin` and `salaryMax` are provided, `salaryMax` must be >= `salaryMin`.

5. **Status Enum**: Status must match exactly one of the valid enum values: "Draft", "Open", "Contratado", "Cerrado", "Borrador" (case-sensitive).

6. **Date Validation**: `applicationDeadline` must be a valid ISO 8601 date-time string and parseable as a Date object.

### Constraints

- No database migration required - using existing Position table structure
- Backward compatibility: This feature does not break existing GET endpoints or functionality
- Performance: API response time should be < 500ms for successful updates, < 200ms for validation errors

## 10. Next Steps After Implementation

After completing the backend implementation:

1. **Frontend Integration**: Frontend team can implement the UI components for position editing
2. **E2E Testing**: Complete end-to-end testing with frontend integration
3. **Code Review**: Submit for code review following project standards
4. **Integration Testing**: Test with other system components
5. **Performance Testing**: Verify response times meet requirements
6. **Documentation Review**: Ensure all documentation is accurate and complete

## 11. Implementation Verification

Final verification checklist:

### Code Quality
- [ ] All code follows DDD layered architecture principles
- [ ] All code is fully typed (TypeScript strict mode)
- [ ] All code follows project coding standards
- [ ] ESLint validation passes
- [ ] TypeScript compiles without errors
- [ ] No `any` types used (except where necessary with proper justification)

### Functionality
- [ ] PATCH endpoint accepts partial position data updates
- [ ] Only provided fields are updated (partial update support)
- [ ] Immutable fields (`companyId`, `interviewFlowId`) cannot be updated
- [ ] All updates are validated according to business rules
- [ ] Appropriate HTTP status codes are returned (200, 400, 404, 500)
- [ ] Error messages are descriptive and consistent

### Testing
- [ ] All existing unit tests reviewed and updated if necessary
- [ ] All new unit tests created and passing
- [ ] Full test suite executed with 0 failures
- [ ] Test report shown and verified
- [ ] Test coverage meets 90% threshold (branches, functions, lines, statements)
- [ ] Database state properly restored after all tests (mocks reset)
- [ ] Test cleanup/teardown verified to work correctly
- [ ] All new endpoints manually tested with curl
- [ ] All curl commands and responses documented
- [ ] Database state restored after UPDATE endpoint testing
- [ ] Error cases tested manually (validation errors, 404, immutable field attempts, etc.)

### Integration
- [ ] Route is properly registered and accessible
- [ ] Controller properly handles HTTP requests/responses
- [ ] Service properly handles business logic
- [ ] Validator properly validates input data
- [ ] Domain model properly handles persistence
- [ ] No breaking changes to existing functionality

### Documentation Updates Completed
- [ ] API specification updated with PATCH endpoint (`ai-specs/specs/api-spec.yml`)
- [ ] Data model documentation updated (`ai-specs/specs/data-model.md`)
- [ ] All documentation written in English
- [ ] Examples and error responses documented
- [ ] Immutable fields documented
- [ ] Validation rules documented

---

**Plan Created**: This implementation plan provides a comprehensive guide for implementing and verifying the Position Update feature backend. Follow the steps sequentially and ensure all mandatory steps are completed before marking the implementation as done.
