# Backend Implementation Plan: SCRUM-10 Position Update Feature

## Overview

This document outlines the step-by-step implementation plan for the Position Update feature (SCRUM-10) in the backend. The implementation follows Domain-Driven Design (DDD) layered architecture principles, ensuring proper separation of concerns across Presentation, Application, and Domain layers.

The feature enables authorized users to update existing position information through a REST API endpoint (`PUT /positions/:id`), supporting partial updates with comprehensive validation, error handling, and reference data verification.

## Architecture Context

**Layers Involved:**
- **Presentation Layer** (`src/presentation/controllers/positionController.ts`): HTTP request/response handling
- **Application Layer** (`src/application/services/positionService.ts`): Business logic orchestration
- **Application Layer** (`src/application/validator.ts`): Input validation
- **Domain Layer** (`src/domain/models/Position.ts`): Domain entity with persistence logic
- **Infrastructure Layer**: Prisma ORM for database operations (implicit)

**Components Referenced:**
- `Position` domain model (existing)
- `Company` domain model (for validation)
- `InterviewFlow` domain model (for validation)
- Position routes (`src/routes/positionRoutes.ts`)

## Implementation Steps

### Step 0: Create Feature Branch

- **Action**: Create and switch to a new feature branch following the development workflow
- **Branch Naming**: `feature/SCRUM-10-backend` (required suffix `-backend` to separate backend work from frontend)
- **Implementation Steps**:
  1. Ensure you're on the latest `main` or `develop` branch (or appropriate base branch)
  2. Pull latest changes: `git pull origin [base-branch]`
  3. Create new branch: `git checkout -b feature/SCRUM-10-backend`
  4. Verify branch creation: `git branch`
- **Notes**: This must be the FIRST step before any code changes. Refer to `ai-specs/specs/backend-standards.mdc` section "Development Workflow" for specific branch naming conventions and workflow rules. The `-backend` suffix is mandatory to allow parallel frontend development without conflicts.

### Step 1: Create Validation Function

- **File**: `backend/src/application/validator.ts`
- **Action**: Implement `validatePositionUpdate` function with comprehensive validation rules
- **Function Signature**: 
  ```typescript
  export const validatePositionUpdate = (data: any): void
  ```
- **Implementation Steps**:
  1. **Validate Position ID Format** (if provided in data, though typically comes from route params):
     - Must be a positive integer (>= 1)
     - Throw error: `"Position ID must be a positive integer"` if invalid
  2. **Validate Required Fields** (only if provided):
     - **Title**: If provided, must be non-empty string, 1-100 characters
       - Error: `"El título es obligatorio y debe ser una cadena válida"` (if empty/invalid)
       - Error: `"El título no puede exceder 100 caracteres"` (if > 100 chars)
     - **Description**: If provided, must be non-empty string
       - Error: `"La descripción es obligatoria y debe ser una cadena válida"`
     - **Location**: If provided, must be non-empty string
       - Error: `"La ubicación es obligatoria y debe ser una cadena válida"`
     - **JobDescription**: If provided, must be non-empty string
       - Error: `"La descripción del trabajo es obligatoria y debe ser una cadena válida"`
  3. **Validate Status Enum**:
     - If provided, must be one of: `"Open"`, `"Contratado"`, `"Cerrado"`, `"Borrador"`
     - Error: `"Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador"`
  4. **Validate Boolean Fields**:
     - **isVisible**: If provided, must be boolean type
       - Error: `"isVisible debe ser un valor booleano"`
  5. **Validate Reference IDs**:
     - **companyId**: If provided, must be positive integer (>= 1)
       - Error: `"companyId debe ser un número entero positivo"`
     - **interviewFlowId**: If provided, must be positive integer (>= 1)
       - Error: `"interviewFlowId debe ser un número entero positivo"`
  6. **Validate Salary Fields**:
     - **salaryMin**: If provided, must be number >= 0
       - Error: `"El salario mínimo debe ser un número válido mayor o igual a 0"`
     - **salaryMax**: If provided, must be number >= 0
       - Error: `"El salario máximo debe ser un número válido mayor o igual a 0"`
     - **salaryMin <= salaryMax**: If both provided, minimum cannot exceed maximum
       - Error: `"El salario mínimo no puede ser mayor que el máximo"`
  7. **Validate Date Fields**:
     - **applicationDeadline**: If provided, must be valid date string or Date object, cannot be in the past
       - Error: `"Fecha límite inválida"` (if invalid date format)
       - Error: `"La fecha límite no puede ser anterior a hoy"` (if date is in the past)
  8. **Validate Optional String Fields**:
     - **employmentType**: If provided, must be non-empty string
       - Error: `"El tipo de empleo debe ser una cadena válida"`
     - **requirements**, **responsibilities**, **benefits**, **companyDescription**, **contactInfo**: If provided, must be strings (can be empty strings, but must be string type)
- **Dependencies**: None (pure validation function)
- **Implementation Notes**: 
  - Validation only occurs for fields that are provided (`!== undefined`), allowing partial updates
  - Use `typeof` checks for type validation
  - For date validation, convert to Date object and compare with `new Date()` to check if in past
  - Follow existing validation patterns in the file (similar to `validateCandidateData`)
  - Error messages are in Spanish as per ticket requirements

### Step 2: Create Service Method

- **File**: `backend/src/application/services/positionService.ts`
- **Action**: Implement `updatePositionService` function that orchestrates the position update business logic
- **Function Signature**:
  ```typescript
  export const updatePositionService = async (positionId: number, updateData: any): Promise<Position>
  ```
- **Implementation Steps**:
  1. **Validate Position Exists**:
     - Use `Position.findOne(positionId)` to retrieve existing position
     - If position not found, throw `new Error('Position not found')`
     - Store the existing position for merging
  2. **Validate Input Data**:
     - Call `validatePositionUpdate(updateData)` from validator
     - This will throw errors for invalid data (propagate to controller)
  3. **Validate Reference Data** (if provided in updateData):
     - **If `companyId` is provided**:
       - Use `Company.findOne(updateData.companyId)` to verify company exists
       - If not found, throw `new Error('Invalid reference data: Company not found')`
     - **If `interviewFlowId` is provided**:
       - Use `InterviewFlow.findOne(updateData.interviewFlowId)` to verify interview flow exists
       - If not found, throw `new Error('Invalid reference data: Interview flow not found')`
  4. **Merge Update Data with Existing Position**:
     - Create a new Position instance with merged data:
       - Use existing position data as base
       - Override with updateData fields (only provided fields)
       - Handle date conversion for `applicationDeadline` if provided
  5. **Save Updated Position**:
     - Call `position.save()` method (this handles Prisma update)
     - Return the updated position object
  6. **Error Handling**:
     - Catch Prisma errors and re-throw with appropriate messages
     - Ensure all errors are Error instances for proper handling in controller
- **Dependencies**: 
  - Import `Position` from `../../domain/models/Position`
  - Import `Company` from `../../domain/models/Company`
  - Import `InterviewFlow` from `../../domain/models/InterviewFlow`
  - Import `validatePositionUpdate` from `../validator`
- **Implementation Notes**:
  - Service should only handle business logic, not HTTP concerns
  - Use domain models for data access (not direct Prisma calls)
  - Support partial updates by only updating provided fields
  - Ensure position ID is set on the Position instance before calling `save()` for update operation

### Step 3: Create Controller Method

- **File**: `backend/src/presentation/controllers/positionController.ts`
- **Action**: Implement `updatePosition` controller function to handle HTTP PUT requests
- **Function Signature**:
  ```typescript
  export const updatePosition = async (req: Request, res: Response): Promise<void>
  ```
- **Implementation Steps**:
  1. **Extract and Validate Position ID**:
     - Extract `positionId` from `req.params.id`
     - Parse to integer: `const positionId = parseInt(req.params.id)`
     - Validate format: If `isNaN(positionId)` or `positionId <= 0`, return 400 with message `"Invalid position ID format"`
  2. **Validate Request Body**:
     - Check if `req.body` is empty (no properties or null/undefined)
     - If empty, return 400 with message `"No data provided for update"`
  3. **Call Service Layer**:
     - Call `updatePositionService(positionId, req.body)`
     - Await the result
  4. **Handle Success Response**:
     - Return 200 status with JSON:
       ```json
       {
         "message": "Position updated successfully",
         "data": { /* updated position object */ }
       }
       ```
  5. **Handle Error Responses**:
     - **Validation Errors**: Catch errors with message containing validation error text, return 400:
       ```json
       {
         "message": "Validation error",
         "error": "Error message details"
       }
       ```
     - **Not Found Errors**: Catch errors with message `"Position not found"`, return 404:
       ```json
       {
         "message": "Position not found",
         "error": "Position not found"
       }
       ```
     - **Reference Validation Errors**: Catch errors with message containing `"Invalid reference data"`, return 400:
       ```json
       {
         "message": "Invalid reference data",
         "error": "Error message details"
       }
       ```
     - **Server Errors**: Catch all other errors, return 500:
       ```json
       {
         "message": "Error updating position",
         "error": "Error details"
       }
       ```
  6. **Error Type Handling**:
     - Check `error instanceof Error` for proper error message extraction
     - Handle non-Error exceptions by converting to string
- **Dependencies**:
  - Import `Request, Response` from `express`
  - Import `updatePositionService` from `../../application/services/positionService`
- **Implementation Notes**:
  - Controller should be thin - delegate all business logic to service
  - Follow existing controller patterns (see `getPositionById` for reference)
  - Use consistent error response format matching other controllers
  - All error messages and responses in English (except validation error details which are in Spanish per ticket)

### Step 4: Add Route

- **File**: `backend/src/routes/positionRoutes.ts`
- **Action**: Add PUT route for position update endpoint
- **Implementation Steps**:
  1. **Import Controller**:
     - Add `updatePosition` to the existing import from `../presentation/controllers/positionController`
  2. **Add Route Definition**:
     - Add route: `router.put('/:id', updatePosition)`
     - Place after GET routes but before other routes (maintain RESTful ordering)
     - Ensure route parameter `:id` matches other routes in the file
- **Dependencies**: 
  - `updatePosition` controller (imported in Step 3)
- **Implementation Notes**:
  - Route should be placed logically with other position routes
  - Follow RESTful conventions (PUT for updates)
  - Route parameter name `:id` must match what controller expects (`req.params.id`)

### Step 5: Write Unit Tests

- **File**: `backend/src/presentation/controllers/__tests__/positionController.test.ts`
- **Action**: Create comprehensive test suite for `updatePosition` controller method
- **Test Structure**: Follow AAA pattern (Arrange-Act-Assert) and existing test patterns
- **Implementation Steps**:

#### 5.1 Test Setup
1. **Mock Dependencies**:
   - Mock `updatePositionService` from `../../application/services/positionService`
   - Use `jest.mock()` at the top of the test file
2. **Test Fixtures**:
   - Create mock request with `params: { id: '1' }` and `body: { ... }`
   - Create mock response with `status` and `json` methods
   - Use `beforeEach` to clear mocks and reset fixtures

#### 5.2 Successful Cases
1. **Valid Data Update**:
   - Test updating with valid position data
   - Verify service called with correct parameters
   - Verify 200 response with success message and data
2. **Partial Update (Status Only)**:
   - Test updating only status field
   - Verify partial update works correctly
3. **Salary Update**:
   - Test updating salaryMin and salaryMax
   - Verify salary range validation works
4. **Boolean Field Update**:
   - Test updating `isVisible` field
   - Verify boolean handling
5. **Application Deadline Update**:
   - Test updating `applicationDeadline` with future date
   - Verify date handling
6. **Complex Update**:
   - Test updating all fields at once
   - Verify comprehensive update works

#### 5.3 Validation Error Cases
1. **Invalid Position ID Format**:
   - Test with `id: 'invalid'` → expect 400
   - Test with `id: '0'` → expect 400 (if validation requires > 0)
   - Test with `id: '-1'` → expect 400
   - Test with missing id → expect 400
2. **Empty Request Body**:
   - Test with `body: {}` → expect 400 "No data provided for update"
   - Test with `body: null` → expect 400
   - Test with `body: undefined` → expect 400
3. **Validation Errors from Service**:
   - Mock service to throw validation errors:
     - Empty title → expect 400 "Validation error"
     - Invalid status → expect 400
     - Invalid salary range (min > max) → expect 400
     - Invalid date (past date) → expect 400

#### 5.4 Not Found Error Cases
1. **Position Not Found**:
   - Mock service to throw `new Error('Position not found')`
   - Verify 404 response with appropriate message

#### 5.5 Reference Validation Error Cases
1. **Company Not Found**:
   - Mock service to throw `new Error('Invalid reference data: Company not found')`
   - Verify 400 response with "Invalid reference data" message
2. **Interview Flow Not Found**:
   - Mock service to throw `new Error('Invalid reference data: Interview flow not found')`
   - Verify 400 response with "Invalid reference data" message

#### 5.6 Server Error Cases
1. **Unexpected Errors**:
   - Mock service to throw generic `new Error('Database error')`
   - Verify 500 response
2. **Non-Error Exceptions**:
   - Mock service to throw string or null
   - Verify 500 response with proper error handling

#### 5.7 Edge Cases
1. **Negative Position ID**: Test with `id: '-1'`
2. **Zero Position ID**: Test with `id: '0'`
3. **Large Position ID**: Test with very large number
4. **Complex Update Data**: Test with all optional fields
5. **Null/Undefined Fields**: Test handling of null values in update data
6. **Date Edge Cases**: Test with various date formats and edge dates

- **Dependencies**: 
  - Jest testing framework
  - Express Request/Response types
  - Mock service layer
- **Implementation Notes**:
  - Follow existing test patterns from `positionController.test.ts`
  - Use descriptive test names: `should_[expected_behavior]_when_[condition]`
  - Maintain 90% coverage threshold
  - All test descriptions and assertions in English
  - Use `describe` blocks to group related tests
  - Clear mocks in `beforeEach` for test isolation

### Step 6: Update Technical Documentation

- **Action**: Review and update technical documentation according to changes made
- **Implementation Steps**:
  1. **Review Changes**: Analyze all code changes made during implementation
  2. **Identify Documentation Files**: Determine which documentation files need updates:
     - **API Specification** → Update `ai-specs/specs/api-spec.yml` with PUT /positions/:id endpoint
     - **Data Model** → Review `ai-specs/specs/data-model.md` to ensure Position model documentation is current
  3. **Update API Specification** (`ai-specs/specs/api-spec.yml`):
     - Add PUT `/positions/{id}` endpoint specification:
       - Method: PUT
       - Path: `/positions/{id}`
       - Summary: Update position details
       - Parameters: `id` (path parameter, integer, required)
       - Request body: Position update schema (all fields optional except validation rules)
       - Responses:
         - 200: Success response with updated position
         - 400: Validation error or invalid reference data
         - 404: Position not found
         - 500: Server error
     - Add request/response schemas if needed
  4. **Review Data Model Documentation** (`ai-specs/specs/data-model.md`):
     - Verify Position model fields are accurately documented
     - Ensure updateable fields are clearly indicated
     - Verify field types and constraints match implementation
  5. **Verify Documentation**: 
     - Confirm all changes are accurately reflected
     - Check that documentation follows established structure
     - Ensure all content is in English
  6. **Report Updates**: Document which files were updated and what changes were made
- **References**: 
  - Follow process described in `ai-specs/specs/documentation-standards.mdc`
  - All documentation must be written in English
- **Notes**: This step is MANDATORY before considering the implementation complete. Do not skip documentation updates.

## Implementation Order

1. **Step 0**: Create Feature Branch (`feature/SCRUM-10-backend`)
2. **Step 1**: Create Validation Function (`validatePositionUpdate` in `validator.ts`)
3. **Step 2**: Create Service Method (`updatePositionService` in `positionService.ts`)
4. **Step 3**: Create Controller Method (`updatePosition` in `positionController.ts`)
5. **Step 4**: Add Route (`PUT /:id` in `positionRoutes.ts`)
6. **Step 5**: Write Unit Tests (comprehensive test suite in `positionController.test.ts`)
7. **Step 6**: Update Technical Documentation (`api-spec.yml` and review `data-model.md`)

## Testing Checklist

After implementation, verify:

- [ ] All unit tests pass (90% coverage threshold met)
- [ ] Controller tests cover all scenarios:
  - [ ] Successful updates (full and partial)
  - [ ] Validation errors (all field validations)
  - [ ] Not found errors
  - [ ] Reference validation errors
  - [ ] Server errors
  - [ ] Edge cases
- [ ] Manual testing completed:
  - [ ] Update position with valid data
  - [ ] Update position with invalid data (validation errors)
  - [ ] Update non-existent position (404 error)
  - [ ] Update with invalid companyId (400 error)
  - [ ] Update with invalid interviewFlowId (400 error)
  - [ ] Partial updates work correctly
- [ ] TypeScript compilation successful (no type errors)
- [ ] No linting errors
- [ ] Code follows project standards and patterns

## Error Response Format

All error responses follow this structure:

```json
{
  "message": "Error category description",
  "error": "Specific error details"
}
```

**HTTP Status Code Mapping:**
- `200` - Position updated successfully
- `400` - Validation error, invalid position ID format, invalid reference data, or no data provided
- `404` - Position not found
- `500` - Internal server error

## Partial Update Support

The implementation supports partial updates:
- Only fields provided in the request body are updated
- Fields not provided remain unchanged
- Validation only applies to fields that are provided (`!== undefined`)
- Empty request body is rejected (400 error)

## Dependencies

**External Libraries:**
- `express` - HTTP framework
- `@prisma/client` - Database ORM (used through domain models)
- `jest` - Testing framework

**Internal Dependencies:**
- `Position` domain model (`src/domain/models/Position.ts`)
- `Company` domain model (`src/domain/models/Company.ts`)
- `InterviewFlow` domain model (`src/domain/models/InterviewFlow.ts`)
- Validator module (`src/application/validator.ts`)

## Notes

**Important Reminders:**
1. **Language Requirements**: All code, comments, error messages (except validation details), and documentation must be in English. Validation error messages are in Spanish as per ticket requirements.
2. **Type Safety**: Use strict TypeScript typing throughout. Avoid `any` where possible.
3. **Error Handling**: All errors must be Error instances for proper handling in controllers.
4. **Validation Strategy**: Validation only occurs for provided fields, enabling partial updates.
5. **Domain Model Usage**: Always use domain models (`Position.findOne()`, `Company.findOne()`, etc.) for data access, not direct Prisma calls.
6. **Test Coverage**: Maintain 90% coverage threshold for branches, functions, lines, and statements.
7. **Branch Naming**: Use `feature/SCRUM-10-backend` (mandatory `-backend` suffix).
8. **Status Default**: Default status is `"Borrador"` (Draft) if not provided, but for updates, only update if provided.
9. **Date Handling**: Convert date strings to Date objects for validation and storage.
10. **Reference Validation**: Always validate `companyId` and `interviewFlowId` exist in database if provided in update data.

**Business Rules:**
- Position must exist before update
- Company and InterviewFlow must exist if referenced in update
- Salary minimum cannot exceed maximum
- Application deadline cannot be in the past
- Status must be one of the valid enum values
- Title cannot exceed 100 characters

**Architecture Constraints:**
- Follow DDD layered architecture (no Prisma in services, no business logic in controllers)
- Use domain models for all data access
- Controllers are thin - delegate to services
- Services orchestrate business logic and use validators
- Domain models encapsulate persistence logic

## Next Steps After Implementation

1. **Code Review**: Submit for code review following project standards
2. **Integration Testing**: Test with frontend implementation (if available)
3. **Documentation Review**: Ensure all documentation is up-to-date
4. **Merge to Main**: After approval, merge `feature/SCRUM-10-backend` to main/develop branch
5. **Deployment**: Deploy to staging/production following deployment procedures

## Implementation Verification

**Final Verification Checklist:**

- [ ] **Code Quality**:
  - [ ] TypeScript compilation successful
  - [ ] No linting errors
  - [ ] Code follows DDD architecture principles
  - [ ] Proper separation of concerns (Presentation/Application/Domain layers)
  - [ ] Error handling implemented at all layers

- [ ] **Functionality**:
  - [ ] PUT endpoint responds correctly
  - [ ] Partial updates work
  - [ ] Validation works for all fields
  - [ ] Reference validation works (companyId, interviewFlowId)
  - [ ] Error responses are correct

- [ ] **Testing**:
  - [ ] All unit tests pass
  - [ ] 90% coverage threshold met
  - [ ] All test scenarios covered
  - [ ] Edge cases tested

- [ ] **Integration**:
  - [ ] Route properly registered
  - [ ] Controller properly integrated
  - [ ] Service properly integrated
  - [ ] Validator properly integrated

- [ ] **Documentation**:
  - [ ] API specification updated
  - [ ] Data model documentation reviewed
  - [ ] Code comments added where needed
  - [ ] All documentation in English

