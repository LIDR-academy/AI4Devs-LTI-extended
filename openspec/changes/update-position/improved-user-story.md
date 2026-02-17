# User Story: Position Update Feature

## User Story

**As a** recruiter  
**I want to** update details of existing positions through the API and UI  
**So that** I can maintain accurate and up-to-date information in the talent tracking system without requiring direct database access.

## Description

This feature enables authorized users to edit information of existing positions using a PATCH endpoint that supports partial updates. The implementation follows Domain-Driven Design (DDD) principles with a layered architecture, ensuring type safety, proper validation, and comprehensive error handling. The feature includes both backend API implementation and frontend UI components for a complete user experience.

## Acceptance Criteria

1. **Backend API**
   - PATCH endpoint accepts partial position data updates
   - Only provided fields are updated (partial update support)
   - Immutable fields (`companyId`, `interviewFlowId`) cannot be updated
   - All updates are validated according to business rules
   - Appropriate HTTP status codes are returned (200, 400, 404, 500)
   - Error messages are descriptive and consistent

2. **Frontend UI**
   - Edit button/icon is visible on position cards
   - Edit form pre-populates with existing position data
   - Form validation provides real-time feedback
   - Success/error messages are displayed to users
   - Form submission shows loading state
   - Navigation back to positions list after successful update

3. **Data Integrity**
   - Position must exist before update (404 if not found)
   - Validation rules are enforced for all updatable fields
   - Database constraints are respected
   - No data corruption occurs during partial updates

## Technical Specifications

### API Endpoint

**Endpoint:** `PATCH /positions/:id`

**URL Structure:**
- Development: `http://localhost:3010/positions/:id`
- Production: `https://api.lti.dev/positions/:id`

**Request Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `id` (integer, required): Position ID to update

**Request Body (JSON):**
All fields are optional (partial update). Only provided fields will be updated.

```json
{
  "title": "string (max 100 chars)",
  "description": "string",
  "status": "Draft | Open | Contratado | Cerrado | Borrador",
  "isVisible": boolean,
  "location": "string",
  "jobDescription": "string",
  "requirements": "string | null",
  "responsibilities": "string | null",
  "salaryMin": number | null,
  "salaryMax": number | null,
  "employmentType": "string | null",
  "benefits": "string | null",
  "companyDescription": "string | null",
  "applicationDeadline": "ISO 8601 date-time string | null",
  "contactInfo": "string | null"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "companyId": 1,
  "interviewFlowId": 1,
  "title": "Updated Position Title",
  "description": "Updated description",
  "status": "Open",
  "isVisible": true,
  "location": "Madrid, Spain",
  "jobDescription": "Updated job description",
  "requirements": "Updated requirements",
  "responsibilities": "Updated responsibilities",
  "salaryMin": 50000,
  "salaryMax": 70000,
  "employmentType": "Full-time",
  "benefits": "Health insurance, remote work",
  "companyDescription": "Updated company description",
  "applicationDeadline": "2024-12-31T23:59:59.000Z",
  "contactInfo": "hr@company.com"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid input data or validation errors
```json
{
  "message": "Validation failed",
  "error": "Title cannot exceed 100 characters"
}
```

- **400 Bad Request** - Attempt to update immutable fields
```json
{
  "message": "Invalid update request",
  "error": "Fields companyId and interviewFlowId cannot be updated"
}
```

- **404 Not Found** - Position does not exist
```json
{
  "message": "Position not found",
  "error": "Position with ID 999 does not exist"
}
```

- **500 Internal Server Error** - Server error
```json
{
  "message": "Error updating position",
  "error": "Database connection failed"
}
```

### Updatable Fields

The following fields can be updated via the PATCH endpoint:

| Field | Type | Required | Validation Rules | Notes |
|-------|------|----------|------------------|-------|
| `title` | string | No | Max 100 characters, cannot be empty string | Core field |
| `description` | string | No | Cannot be empty string | Core field |
| `status` | string | No | Must be one of: "Draft", "Open", "Contratado", "Cerrado", "Borrador" | Enum validation |
| `isVisible` | boolean | No | Must be true or false | Boolean validation |
| `location` | string | No | Cannot be empty string | Core field |
| `jobDescription` | string | No | Cannot be empty string | Core field |
| `requirements` | string | No | None | Optional field |
| `responsibilities` | string | No | None | Optional field |
| `salaryMin` | number | No | Must be >= 0, must be <= salaryMax if both provided | Numeric validation |
| `salaryMax` | number | No | Must be >= 0, must be >= salaryMin if both provided | Numeric validation |
| `employmentType` | string | No | None | Optional field |
| `benefits` | string | No | None | Optional field |
| `companyDescription` | string | No | None | Optional field |
| `applicationDeadline` | string (ISO 8601) | No | Must be a valid date-time, should be future date | Date validation |
| `contactInfo` | string | No | None | Optional field |

### Immutable Fields

The following fields **cannot** be updated and will return a 400 error if included in the request:
- `id` - Position identifier (auto-generated)
- `companyId` - Company association (business rule)
- `interviewFlowId` - Interview flow association (business rule)

### Files to be Modified/Created

#### Backend Files

1. **Routes** (`backend/src/routes/positionRoutes.ts`)
   - Add: `router.patch('/:id', updatePosition);`

2. **Controller** (`backend/src/presentation/controllers/positionController.ts`)
   - Add: `updatePosition` function to handle HTTP request/response
   - Handle parameter parsing, validation, error responses
   - Return appropriate HTTP status codes

3. **Service** (`backend/src/application/services/positionService.ts`)
   - Add: `updatePositionService` function
   - Implement business logic for position updates
   - Handle partial updates (only update provided fields)
   - Validate business rules (salary ranges, status values, etc.)
   - Check position existence before update

4. **Validator** (`backend/src/application/validator.ts`)
   - Add: `validatePositionUpdateData` function
   - Validate all updatable fields according to rules
   - Check immutable fields are not included
   - Validate field types and constraints
   - Return descriptive error messages

5. **Domain Model** (`backend/src/domain/models/Position.ts`)
   - Verify `save()` method supports updates (already exists)
   - May need to add update-specific validation methods if needed

6. **Repository** (if using repository pattern)
   - Verify repository interface supports update operations
   - Implement update method if not already present

#### Frontend Files

1. **Service** (`frontend/src/services/positionService.js`)
   - Add: `updatePosition(id, positionData)` method
   - Use axios PATCH request to `/positions/:id`
   - Handle errors and throw appropriately

2. **Component** (`frontend/src/components/Positions.tsx`)
   - Add: "Editar" button to each position card
   - Add: Click handler to navigate to edit form
   - Update: Position list refresh after successful update

3. **New Component** (`frontend/src/components/EditPositionForm.js` or `.tsx`)
   - Create: Form component for editing positions
   - Pre-populate: Form fields with existing position data
   - Implement: Form validation (client-side)
   - Add: Loading state during submission
   - Display: Success/error messages using React Bootstrap Alert
   - Navigate: Back to positions list after success

4. **Routing** (`frontend/src/App.js` or routing configuration)
   - Add: Route for `/positions/:id/edit`
   - Connect: Edit form component to route

#### Test Files

1. **Backend Controller Tests** (`backend/src/presentation/controllers/__tests__/positionController.test.ts`)
   - Add: Test suite for `updatePosition` controller
   - Test: Successful updates (200)
   - Test: Invalid ID format (400)
   - Test: Position not found (404)
   - Test: Validation errors (400)
   - Test: Immutable field attempts (400)
   - Test: Server errors (500)
   - Mock: Service layer

2. **Backend Service Tests** (`backend/src/application/services/__tests__/positionService.test.ts`)
   - Add: Test suite for `updatePositionService`
   - Test: Partial updates (only provided fields)
   - Test: Full updates (all fields)
   - Test: Business rule validation
   - Test: Position existence check
   - Test: Database error handling
   - Mock: Domain models and repositories

3. **Backend Validator Tests** (`backend/src/application/__tests__/validator.test.ts`)
   - Add: Test suite for `validatePositionUpdateData`
   - Test: Valid update data
   - Test: Invalid field types
   - Test: Field length constraints
   - Test: Enum validation (status)
   - Test: Numeric validation (salary ranges)
   - Test: Date validation (applicationDeadline)
   - Test: Immutable field rejection

4. **Frontend E2E Tests** (`frontend/cypress/e2e/positions.cy.ts`)
   - Add: Test suite for position update
   - Test: Navigate to edit form
   - Test: Form pre-population
   - Test: Successful update submission
   - Test: Form validation errors
   - Test: API error handling
   - Test: Navigation after update

#### Documentation Files

1. **API Specification** (`ai-specs/specs/api-spec.yml`)
   - Add: PATCH `/positions/{id}` endpoint definition
   - Include: Request/response schemas
   - Document: All possible error responses
   - Add: Example requests and responses

2. **Data Model** (`ai-specs/specs/data-model.md`)
   - Update: Position model section with update operation details
   - Document: Immutable fields
   - Document: Validation rules for updates

## Implementation Steps

### Phase 1: Backend API (TDD Approach)

1. **Write failing tests** for update functionality
   - Controller tests
   - Service tests
   - Validator tests

2. **Implement validator** (`validatePositionUpdateData`)
   - Validate field types
   - Check immutable fields
   - Enforce business rules
   - Make tests pass

3. **Implement service** (`updatePositionService`)
   - Check position existence
   - Apply partial updates
   - Validate business rules
   - Handle errors
   - Make tests pass

4. **Implement controller** (`updatePosition`)
   - Parse request parameters
   - Call validator
   - Call service
   - Format responses
   - Handle errors
   - Make tests pass

5. **Add route** (`PATCH /positions/:id`)
   - Register route in `positionRoutes.ts`
   - Connect to controller
   - Test endpoint manually

### Phase 2: Frontend UI

1. **Update service** (`positionService.js`)
   - Add `updatePosition` method
   - Test API integration

2. **Create edit form component**
   - Build form with all updatable fields
   - Pre-populate with existing data
   - Add client-side validation
   - Implement submission logic
   - Add loading/error states

3. **Update Positions component**
   - Add "Editar" button
   - Add navigation to edit form
   - Refresh list after update

4. **Add routing**
   - Configure route for edit form
   - Test navigation flow

### Phase 3: Testing & Documentation

1. **Run all tests**
   - Ensure 90% coverage threshold met
   - Fix any failing tests
   - Add missing edge case tests

2. **E2E testing**
   - Test complete update workflow
   - Test error scenarios
   - Test validation

3. **Update documentation**
   - Update API spec
   - Update data model docs
   - Add usage examples

## Validation Rules

### Field-Level Validation

1. **title**
   - Type: string
   - Max length: 100 characters
   - Cannot be empty string if provided
   - Required for creation, optional for update

2. **description**
   - Type: string
   - Cannot be empty string if provided
   - Required for creation, optional for update

3. **status**
   - Type: string
   - Must be one of: "Draft", "Open", "Contratado", "Cerrado", "Borrador"
   - Case-sensitive validation

4. **isVisible**
   - Type: boolean
   - Must be `true` or `false` (not string "true"/"false")

5. **location**
   - Type: string
   - Cannot be empty string if provided
   - Required for creation, optional for update

6. **jobDescription**
   - Type: string
   - Cannot be empty string if provided
   - Required for creation, optional for update

7. **salaryMin / salaryMax**
   - Type: number (not string)
   - Must be >= 0
   - If both provided: `salaryMax >= salaryMin`
   - Can be null to clear value

8. **applicationDeadline**
   - Type: ISO 8601 date-time string
   - Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
   - Should be future date (warning, not error)
   - Can be null to clear value

### Business Rules

1. **Immutable Fields**: `companyId` and `interviewFlowId` cannot be updated. Attempting to update these fields returns 400 error.

2. **Partial Updates**: Only provided fields are updated. Unprovided fields retain their current values.

3. **Empty String Handling**: Core required fields (`title`, `description`, `location`, `jobDescription`) cannot be set to empty strings. If provided, they must have content.

4. **Salary Range Validation**: If both `salaryMin` and `salaryMax` are provided, `salaryMax` must be >= `salaryMin`.

5. **Status Enum**: Status must match exactly one of the valid enum values (case-sensitive).

## Security Requirements

1. **Input Sanitization**
   - All string inputs should be sanitized to prevent injection attacks
   - Validate and sanitize date inputs
   - Validate numeric inputs are actual numbers

2. **Authorization** (Future Enhancement)
   - Currently no authentication/authorization implemented
   - Future: Add role-based access control (RBAC)
   - Future: Verify user has permission to update positions

3. **Rate Limiting** (Future Enhancement)
   - Implement rate limiting to prevent abuse
   - Suggested: 100 requests per minute per IP

4. **Data Validation**
   - Validate all inputs at application layer
   - Never trust client input
   - Use TypeScript types for compile-time safety

## Performance Requirements

1. **Response Time**
   - API response time: < 500ms for successful updates
   - API response time: < 200ms for validation errors

2. **Database Optimization**
   - Use Prisma's `update` method (already optimized)
   - Only update provided fields (partial update)
   - Avoid unnecessary database queries

3. **Frontend Performance**
   - Form should load in < 1 second
   - Optimistic UI updates (optional enhancement)

## Error Handling

### Backend Error Handling

1. **Validation Errors** (400)
   - Return specific field-level error messages
   - Include all validation errors in response
   - Format: `{ message: "Validation failed", error: "Field-specific error", details: [...] }`

2. **Not Found Errors** (404)
   - Return when position ID doesn't exist
   - Format: `{ message: "Position not found", error: "Position with ID X does not exist" }`

3. **Server Errors** (500)
   - Log detailed error information
   - Return generic error message to client
   - Format: `{ message: "Error updating position", error: "Internal server error" }`

### Frontend Error Handling

1. **Network Errors**
   - Display user-friendly error message
   - Allow retry of failed requests
   - Log errors to console for debugging

2. **Validation Errors**
   - Display field-level validation errors
   - Highlight invalid form fields
   - Prevent form submission until valid

3. **Success Feedback**
   - Display success message
   - Navigate back to positions list
   - Refresh position data

## Testing Requirements

### Unit Tests (Backend)

1. **Controller Tests** (`positionController.test.ts`)
   - Test successful update (200)
   - Test invalid ID format (400)
   - Test position not found (404)
   - Test validation errors (400)
   - Test immutable field attempts (400)
   - Test server errors (500)
   - Mock service layer completely

2. **Service Tests** (`positionService.test.ts`)
   - Test partial updates
   - Test full updates
   - Test position existence check
   - Test business rule validation
   - Test database error handling
   - Mock domain models

3. **Validator Tests** (`validator.test.ts`)
   - Test valid update data
   - Test invalid field types
   - Test field length constraints
   - Test enum validation
   - Test numeric validation
   - Test date validation
   - Test immutable field rejection

### Integration Tests

1. **API Integration Tests**
   - Test complete update flow
   - Test with real database (test environment)
   - Test error scenarios

### E2E Tests (Frontend)

1. **Cypress Tests** (`positions.cy.ts`)
   - Test navigation to edit form
   - Test form pre-population
   - Test successful update
   - Test form validation
   - Test API error handling
   - Test navigation after update

### Test Coverage

- **Minimum Coverage**: 90% for branches, functions, lines, and statements
- **Coverage Reports**: Generate with `npm run test:coverage`
- **Coverage Files**: Save as `coverage/YYYYMMDD-backend-coverage.md`

## Documentation Updates

1. **API Specification** (`api-spec.yml`)
   - Add PATCH endpoint with full OpenAPI specification
   - Include request/response schemas
   - Document all error responses
   - Add example requests/responses

2. **Data Model** (`data-model.md`)
   - Update Position model section
   - Document update operations
   - Document immutable fields
   - Document validation rules

3. **Development Guide** (if applicable)
   - Add examples of update operations
   - Document common patterns

## Non-Functional Requirements

1. **Type Safety**
   - All code must be fully typed (TypeScript)
   - No `any` types (use `unknown` if needed)
   - Strict TypeScript mode enabled

2. **Code Quality**
   - Follow DDD principles
   - Follow SOLID principles
   - Follow DRY principle
   - ESLint validation before commits

3. **Maintainability**
   - Clear, descriptive function names
   - Comprehensive comments for complex logic
   - Consistent code style
   - Follow project architecture patterns

4. **Scalability**
   - Code should handle future field additions
   - Validation should be extensible
   - Service layer should be testable

5. **Internationalization** (Future)
   - Error messages should be internationalizable
   - Currently: All messages in English

## Dependencies

### Backend
- Express.js (already installed)
- Prisma Client (already installed)
- TypeScript (already installed)
- Jest (already installed)

### Frontend
- React (already installed)
- React Router DOM (already installed)
- Axios (already installed)
- React Bootstrap (already installed)

## Notes

1. **Language**: All code, comments, error messages, and documentation must be in English (per project standards).

2. **UI Language**: Frontend UI text (buttons, labels, messages) should be in Spanish as per existing frontend standards.

3. **Partial Updates**: The PATCH endpoint supports partial updates - only provided fields are updated. This is a key feature.

4. **Backward Compatibility**: This feature does not break existing GET endpoints or functionality.

5. **Database**: No migration required - using existing Position table structure.

6. **Testing**: Follow TDD approach - write tests first, then implement functionality.

## Definition of Done

- [ ] All backend unit tests written and passing (90% coverage)
- [ ] PATCH endpoint implemented and tested
- [ ] Validator implemented with all validation rules
- [ ] Service layer implements business logic correctly
- [ ] Controller handles all error cases properly
- [ ] Frontend service method implemented
- [ ] Edit form component created and functional
- [ ] Edit button added to position cards
- [ ] Routing configured for edit form
- [ ] E2E tests written and passing
- [ ] API specification updated
- [ ] Data model documentation updated
- [ ] All ESLint errors resolved
- [ ] TypeScript compiles without errors
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] All acceptance criteria met
