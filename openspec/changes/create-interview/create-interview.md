# Create Interview for Candidate (SCRUM-2)

## User Story

**As a** human resources recruiter  
**I want to** create new interviews for candidates who have applied to positions  
**So that** I can record upcoming evaluation meetings in the system, track the interview process for each candidate's application, and maintain a complete audit trail of all interview activities.

## Description

Recruiters need to schedule and record interviews for candidates who have applied to positions. Each interview must be associated with a specific candidate's application, an interview step (from the position's interview flow), an employee who will conduct the interview, and include scheduling information (date and time). The system should allow recording interview scores (0-5) and notes after the interview is conducted.

**Important Note**: While the endpoint is structured as `/candidates/{candidateId}/interviews`, interviews are actually associated with Applications in the data model. The request body must include an `applicationId` to properly link the interview to a specific application. The `candidateId` in the URL path is used for validation to ensure the application belongs to the specified candidate.

## Endpoint Specification

### Request

**Method**: `POST`  
**URL**: `/candidates/{candidateId}/interviews`  
**Base URL**: `http://localhost:3010` (development)  
**Content-Type**: `application/json`

**Path Parameters**:
- `candidateId` (integer, required): The ID of the candidate for whom the interview is being created. Must be a valid integer and the candidate must exist in the database.

**Request Body** (JSON):
```json
{
  "applicationId": 1,
  "interviewStepId": 2,
  "employeeId": 3,
  "interviewDate": "2026-02-15T10:00:00Z",
  "score": 4,
  "notes": "Candidate demonstrated strong technical skills and good communication."
}
```

**Request Body Fields**:
- `applicationId` (integer, required): The ID of the application this interview belongs to. Must exist and belong to the candidate specified in the URL path.
- `interviewStepId` (integer, required): The ID of the interview step from the position's interview flow. Must be a valid step for the application's position.
- `employeeId` (integer, required): The ID of the employee who will conduct the interview. Must exist and be active (`isActive = true`).
- `interviewDate` (string, required, ISO 8601 format): Date and time when the interview will be conducted. Must be a valid date-time in ISO 8601 format (e.g., "2026-02-15T10:00:00Z"). Can be in the past for recording completed interviews or in the future for scheduling.
- `score` (integer, optional, nullable, range: 0-5): Numeric score or rating from the interview. Can be null for scheduled interviews that haven't been conducted yet. If provided, must be an integer between 0 and 5 (inclusive).
- `notes` (string, optional, nullable): Interview notes and feedback. Can be null or empty. If provided, must be a string with maximum 1000 characters.

### Response

**Success Response** (201 Created):
```json
{
  "id": 1,
  "applicationId": 1,
  "interviewStepId": 2,
  "employeeId": 3,
  "interviewDate": "2026-02-15T10:00:00.000Z",
  "result": null,
  "score": 4,
  "notes": "Candidate demonstrated strong technical skills and good communication."
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request data, validation errors, or business rule violations
  ```json
  {
    "message": "Validation error",
    "error": "Score must be between 0 and 5"
  }
  ```

- `404 Not Found`: Candidate, application, interview step, or employee not found
  ```json
  {
    "message": "Resource not found",
    "error": "Application not found or does not belong to the specified candidate"
  }
  ```

- `500 Internal Server Error`: Server-side errors
  ```json
  {
    "message": "Internal server error",
    "error": "An unexpected error occurred"
  }
  ```

## Validation Rules

### Required Field Validation

1. **Candidate Validation**:
   - Candidate with `candidateId` must exist in the database
   - If candidate doesn't exist, return 404 Not Found

2. **Application Validation**:
   - `applicationId` must be provided and be a valid integer
   - Application must exist in the database
   - Application must belong to the candidate specified in the URL path (`candidateId`)
   - If application doesn't exist or doesn't belong to candidate, return 404 Not Found

3. **Interview Step Validation**:
   - `interviewStepId` must be provided and be a valid integer
   - Interview step must exist in the database
   - Interview step must belong to the interview flow associated with the application's position
   - If interview step doesn't exist or doesn't belong to position's flow, return 404 Not Found

4. **Employee Validation**:
   - `employeeId` must be provided and be a valid integer
   - Employee must exist in the database
   - Employee must be active (`isActive = true`)
   - If employee doesn't exist or is not active, return 404 Not Found

5. **Interview Date Validation**:
   - `interviewDate` must be provided
   - Must be a valid ISO 8601 date-time string
   - Must be parseable into a valid Date object
   - If invalid format, return 400 Bad Request

### Optional Field Validation

1. **Score Validation**:
   - If provided, must be an integer
   - Must be between 0 and 5 (inclusive)
   - Can be null for scheduled interviews
   - If out of range, return 400 Bad Request with message "Score must be between 0 and 5"

2. **Notes Validation**:
   - If provided, must be a string
   - Must not exceed 1000 characters
   - Can be null or empty string
   - If exceeds maximum length, return 400 Bad Request

## Files to Create

### Backend Files

1. **`backend/src/presentation/controllers/interviewController.ts`** (new file)
   - Controller for handling interview creation requests
   - Function: `createInterviewController(req: Request, res: Response, next: NextFunction)`
   - Handles HTTP request/response, calls service layer
   - Error handling with appropriate HTTP status codes
   - Extracts `candidateId` from URL params
   - Extracts interview data from request body
   - Returns 201 Created with interview data on success

2. **`backend/src/application/services/interviewService.ts`** (new file)
   - Service layer for interview business logic
   - Function: `createInterview(candidateId: number, interviewData: CreateInterviewRequest): Promise<Interview>`
   - Orchestrates validation and database operations
   - Uses repositories from domain layer
   - Validates all business rules
   - Creates interview using Interview domain model

3. **`backend/src/domain/repositories/IInterviewRepository.ts`** (if not exists)
   - Repository interface for interview data access
   - Method: `create(interviewData: Interview): Promise<Interview>`
   - Follows repository pattern from domain layer

4. **`backend/src/presentation/controllers/__tests__/interviewController.test.ts`** (new file)
   - Unit tests for interview controller
   - Test cases: success scenarios, validation errors, not found errors, database errors
   - Mock service layer
   - Follow AAA pattern (Arrange-Act-Assert)
   - Maintain 90% test coverage

5. **`backend/src/application/services/__tests__/interviewService.test.ts`** (new file)
   - Unit tests for interview service
   - Test cases: business logic validation, repository interactions
   - Mock repositories and domain models
   - Follow AAA pattern
   - Maintain 90% test coverage

### Files to Modify

1. **`backend/src/application/validator.ts`**
   - Add function: `validateInterviewData(candidateId: number, interviewData: any): void`
   - Validates all interview fields according to validation rules
   - Throws validation errors with descriptive messages
   - Validates candidate exists
   - Validates application exists and belongs to candidate
   - Validates interview step exists and belongs to position's flow
   - Validates employee exists and is active
   - Validates score range (0-5) if provided
   - Validates notes length if provided

2. **`backend/src/routes/candidateRoutes.ts`**
   - Add POST route: `router.post('/:candidateId/interviews', createInterviewController)`
   - Import `createInterviewController` from interview controller
   - Place route before `/:id` route to avoid route conflicts

3. **`backend/src/domain/models/Interview.ts`** (if needed)
   - Ensure Interview model has all required methods
   - Verify `save()` method handles creation correctly
   - Ensure constructor properly initializes all fields

4. **`ai-specs/specs/api-spec.yml`**
   - Add endpoint specification for `POST /candidates/{candidateId}/interviews`
   - Add request body schema: `CreateInterviewRequest`
   - Add response schema: `InterviewResponse`
   - Add error response examples
   - Document all validation rules

## Implementation Steps

### Backend Implementation

1. **Create Interview Service** (`interviewService.ts`):
   - Implement `createInterview` function
   - Validate candidate exists using CandidateRepository
   - Validate application exists and belongs to candidate using ApplicationRepository
   - Validate interview step exists and belongs to position's flow using InterviewStepRepository
   - Validate employee exists and is active using EmployeeRepository
   - Validate interview date format
   - Validate score range (0-5) if provided
   - Validate notes length if provided
   - Create interview record using Interview domain model
   - Save interview using InterviewRepository
   - Return created interview

2. **Create Interview Controller** (`interviewController.ts`):
   - Extract `candidateId` from URL params (`req.params.candidateId`)
   - Extract interview data from request body (`req.body`)
   - Call `validateInterviewData` from validator
   - Call `createInterview` from service
   - Return 201 Created with interview data
   - Handle errors with appropriate HTTP status codes (400, 404, 500)
   - Use try-catch with error middleware

3. **Add Validation** (`validator.ts`):
   - Implement `validateInterviewData` function
   - Validate all required fields are present
   - Validate field types and formats
   - Validate business rules (active employee, valid interview step, etc.)
   - Validate score range (0-5)
   - Validate notes length (max 1000 characters)
   - Throw descriptive validation errors

4. **Add Route** (`candidateRoutes.ts`):
   - Add POST route for `/:candidateId/interviews`
   - Connect to `createInterviewController`
   - Place before `/:id` route to avoid conflicts

5. **Update API Specification** (`api-spec.yml`):
   - Add endpoint documentation under `/candidates/{id}/interviews` path
   - Add request body schema with all fields
   - Add response schema
   - Add error response examples
   - Document validation rules

### Frontend Implementation

1. **Update CandidateDetails Component** (`frontend/src/components/CandidateDetails.js`):
   - Fetch candidate's applications on component load (already available in `candidateDetails.applications`)
   - Add state for selected application
   - Fetch interview steps for selected application's position
   - Fetch active employees (may need new endpoint or use existing data)
   - Add form fields:
     - Application selector (dropdown)
     - Interview step selector (dropdown, filtered by selected application's position)
     - Employee selector (dropdown, filtered by active employees)
     - Interview date picker (date and time input)
     - Score input (0-5, star rating or number input)
     - Notes textarea
   - Implement form validation:
     - All required fields must be filled
     - Score must be between 0 and 5
     - Notes must not exceed 1000 characters
   - Update submit handler to send complete data:
     - Include `applicationId`, `interviewStepId`, `employeeId`, `interviewDate`, `score`, `notes`
   - Add error handling:
     - Display error messages to user
     - Handle 400, 404, 500 errors appropriately
     - Show success message on successful creation
   - Update UI after successful creation:
     - Refresh candidate details to show new interview
     - Reset form
     - Optionally keep panel open or close it

2. **Create/Update Interview Service** (`frontend/src/services/interviewService.js` or update `candidateService.js`):
   - Implement `createInterview(candidateId, interviewData)` function
   - Use axios for HTTP requests
   - Handle errors appropriately
   - Return formatted response
   - Follow service layer architecture patterns

3. **Follow Frontend Best Practices**:
   - Use controlled components for all form inputs
   - Implement loading states during API calls
   - Disable submit button during submission
   - Use React Bootstrap components (Form, Form.Group, Form.Control, Button, Alert)
   - Add proper error messages using Alert component
   - Follow English-only naming conventions
   - Use TypeScript for new components if possible 

## Testing Requirements

### Backend Unit Tests

1. **Controller Tests** (`interviewController.test.ts`):
   - Test successful interview creation (201 response)
   - Test missing required fields (400 response)
   - Test invalid candidate ID (404 response)
   - Test invalid application ID (404 response)
   - Test application doesn't belong to candidate (404 response)
   - Test invalid interview step ID (404 response)
   - Test interview step doesn't belong to position (404 response)
   - Test invalid employee ID (404 response)
   - Test inactive employee (404 response)
   - Test invalid score range (400 response)
   - Test invalid notes length (400 response)
   - Test invalid date format (400 response)
   - Test database errors (500 response)
   - Mock service layer completely
   - Follow AAA pattern
   - Maintain 90% coverage

2. **Service Tests** (`interviewService.test.ts`):
   - Test successful interview creation
   - Test candidate validation
   - Test application validation
   - Test interview step validation
   - Test employee validation
   - Test score validation (0-5 range)
   - Test notes validation (max 1000 characters)
   - Test date validation
   - Test repository interactions
   - Mock all repositories
   - Follow AAA pattern
   - Maintain 90% coverage

3. **Validator Tests** (add to `validator.test.ts` or create new file):
   - Test all validation rules
   - Test required field validation
   - Test field type validation
   - Test business rule validation
   - Test score range validation
   - Test notes length validation

### Frontend Tests

1. **Component Tests** (Cypress E2E or React Testing Library):
   - Test form rendering with all fields
   - Test form submission with valid data
   - Test form validation (required fields, score range, notes length)
   - Test error handling (API errors)
   - Test success flow (interview created, form reset, UI updated)
   - Test application selector updates interview steps
   - Test score input (0-5 range)

2. **Service Tests**:
   - Test API call with correct data
   - Test error handling
   - Test response formatting

## Documentation Requirements

1. **API Documentation** (`ai-specs/specs/api-spec.yml`):
   - Complete endpoint specification
   - Request/response schemas
   - Error response examples
   - Validation rules documentation

2. **Code Documentation**:
   - Add JSDoc comments to all functions
   - Document function parameters and return types
   - Document business logic and validation rules
   - Use English for all comments and documentation

## Non-Functional Requirements

### Security

1. **Input Validation**:
   - Validate all inputs at the application layer
   - Sanitize data to prevent injection attacks
   - Use TypeScript for type safety

2. **Error Handling**:
   - Don't expose sensitive information in error messages
   - Return generic error messages for 500 errors
   - Log detailed errors server-side only

### Performance

1. **Database Queries**:
   - Use Prisma's `include` to fetch related data efficiently
   - Avoid N+1 queries
   - Use transactions for related operations if needed

2. **API Response**:
   - Return created interview data immediately
   - Don't fetch full candidate details in response (only return interview)

### Maintainability

1. **Code Organization**:
   - Follow DDD layered architecture
   - Use repository pattern for data access
   - Separate concerns (controller, service, repository)
   - Follow SOLID principles

2. **Error Messages**:
   - Use descriptive, user-friendly error messages
   - Provide actionable feedback to users
   - Log detailed errors for debugging

## Acceptance Criteria

- [ ] Backend endpoint `POST /candidates/{candidateId}/interviews` is implemented and functional
- [ ] All required fields are validated (applicationId, interviewStepId, employeeId, interviewDate)
- [ ] Score validation works correctly (0-5 range)
- [ ] Notes validation works correctly (max 1000 characters)
- [ ] All business rules are enforced (candidate exists, application belongs to candidate, etc.)
- [ ] Frontend form includes all required fields
- [ ] Frontend form validation works correctly
- [ ] Frontend successfully creates interviews via API
- [ ] Error handling works on both frontend and backend
- [ ] Unit tests achieve 90% coverage for backend
- [ ] API documentation is updated
- [ ] All code follows project standards (English-only, TypeScript, DDD architecture)
- [ ] Form follows frontend best practices (controlled components, loading states, error messages)

## Notes

- The score range is 0-5 as specified in the original user story
- The existing form in CandidateDetails component needs to be enhanced with additional fields
- Interviews are linked to Applications, not directly to Candidates
- The endpoint URL structure uses `/candidates/{candidateId}/interviews` for RESTful design, but the actual relationship is through Applications
- All validation must ensure data integrity and business rule compliance
