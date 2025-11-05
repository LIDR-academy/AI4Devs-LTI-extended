# User Story: Position Update Feature

## User Story

**As a** recruiter,  
**I want to** update details of open positions,  
**So that** I can maintain accurate and up-to-date information in the talent tracking system.

## Description

Authorized users must be able to edit information of existing positions, including title, description, status, application deadline, and other relevant details. This functionality allows maintaining position information current and reflecting any changes in job requirements or position details.

## Technical Specification - Position Update Feature

### Overview

The position update functionality has been implemented as a comprehensive REST API endpoint with a responsive web interface. The implementation follows a clean architecture pattern with domain models, service layer, and presentation controllers.

### Database Fields Updateable

Based on the `Position` model from `prisma/schema.prisma`, the following fields are editable:

**Required Fields (validated when provided):**
- `title` (string, max 100 chars) - Position title
- `description` (string) - Brief position description  
- `location` (string) - Job location
- `jobDescription` (string) - Detailed job description

**Optional Fields:**
- `status` (enum: `Open`, `Contratado`, `Cerrado`, `Borrador`) - Position status (default: `Borrador`)
- `isVisible` (boolean) - Public visibility flag (default: false)
- `requirements` (string, nullable) - Job requirements
- `responsibilities` (string, nullable) - Job responsibilities
- `salaryMin` (number, >= 0, nullable) - Minimum salary
- `salaryMax` (number, >= salaryMin, nullable) - Maximum salary
- `employmentType` (string, nullable) - Employment type
- `benefits` (string, nullable) - Benefits description
- `companyDescription` (string, nullable) - Company description
- `applicationDeadline` (DateTime, future date, nullable) - Application deadline
- `contactInfo` (string, nullable) - Contact information
- `companyId` (integer, min 1) - Associated company ID (validated if provided)
- `interviewFlowId` (integer, min 1) - Associated interview flow ID (validated if provided)

### API Endpoint

**Primary Endpoint:**
```
PUT /positions/:id
```

**Content-Type:** `application/json`

**Request Body Schema:**
```json
{
  "title": "Senior Software Engineer",
  "description": "Lead development team",
  "location": "Madrid, Spain",
  "jobDescription": "Detailed job description...",
  "status": "Open",
  "isVisible": true,
  "requirements": "5+ years experience",
  "responsibilities": "Team leadership",
  "salaryMin": 50000,
  "salaryMax": 70000,
  "employmentType": "Full-time",
  "benefits": "Health insurance",
  "companyDescription": "Tech company",
  "applicationDeadline": "2024-12-31T23:59:59.000Z",
  "contactInfo": "hr@company.com",
  "companyId": 1,
  "interviewFlowId": 1
}
```

**Response Codes:**
- `200` - Position updated successfully
  ```json
  {
    "message": "Position updated successfully",
    "data": { /* updated position object */ }
  }
  ```
- `400` - Validation error or invalid reference data
  ```json
  {
    "message": "Validation error" | "Invalid reference data" | "Invalid position ID format" | "No data provided for update",
    "error": "Error message details"
  }
  ```
- `404` - Position not found
  ```json
  {
    "message": "Position not found",
    "error": "Position not found"
  }
  ```
- `500` - Internal server error
  ```json
  {
    "message": "Error updating position",
    "error": "Error details"
  }
  ```

### Files to Modify

**Backend Files:**

1. **`src/presentation/controllers/positionController.ts`**
   - `updatePosition` method handles HTTP request/response
   - Validates position ID format (must be valid number)
   - Validates request body is not empty
   - Handles error responses with appropriate status codes
   - Maps validation errors to HTTP 400 responses

2. **`src/application/services/positionService.ts`**
   - `updatePositionService` method implements business logic
   - Validates position exists using `Position.findOne(positionId)`
   - Calls `validatePositionUpdate` for input validation
   - Verifies `companyId` and `interviewFlowId` exist in database if provided
   - Uses domain model `Position` class to save updates
   - Returns updated position object

3. **`src/application/validator.ts`**
   - `validatePositionUpdate` function implements comprehensive validation:
     - Title: Required if provided, 1-100 characters, non-empty string
     - Description: Required if provided, non-empty string
     - Location: Required if provided, non-empty string
     - JobDescription: Required if provided, non-empty string
     - Status: Must be one of: `Open`, `Contratado`, `Cerrado`, `Borrador`
     - isVisible: Must be boolean
     - companyId: Must be positive integer if provided
     - interviewFlowId: Must be positive integer if provided
     - salaryMin: Must be >= 0 if provided
     - salaryMax: Must be >= 0 if provided
     - salaryMin <= salaryMax if both provided
     - applicationDeadline: Must be valid date, cannot be in the past
     - employmentType: Must be non-empty string if provided
     - Text fields (requirements, responsibilities, benefits, companyDescription, contactInfo): Must be strings if provided

4. **`src/domain/models/Position.ts`**
   - `Position` class with `save()` method handles updates via Prisma
   - `findOne()` static method retrieves position by ID
   - Constructor handles data initialization and defaults

5. **`src/routes/positionRoutes.ts`**
   - Route definition: `router.put('/:id', updatePosition)`

**Frontend Files:**

1. **`src/components/EditPosition.js`**
   - Complete edit form component with all fields
   - Fetches position data on mount using `positionService.getPositionById(id)`
   - Formats date for input field (converts ISO to date string)
   - Handles form state with controlled inputs
   - Transforms data before submission:
     - Converts empty strings to `null` for optional fields
     - Converts salary fields to integers
     - Converts date to ISO string format
     - Filters out empty required fields
   - Displays success/error messages
   - Navigates to `/positions` after successful update
   - Shows loading spinner during fetch and save operations
   - Route: `/positions/:id/edit`

2. **`src/services/positionService.js`**
   - `updatePosition(id, positionData)` method sends PUT request to API
   - Uses axios with base URL `http://localhost:3010`
   - Handles errors and re-throws for component handling

3. **`src/components/Positions.tsx`**
   - Includes "Editar" button that navigates to `/positions/:id/edit`
   - Button located in position card component

4. **`src/App.js`**
   - Route definition: `<Route path="/positions/:id/edit" element={<EditPosition />} />`

### Validation Rules

**Server-side Validation (implemented in `validatePositionUpdate`):**

- **Title**: If provided, required, 1-100 characters, non-empty string
  - Error: `"El título es obligatorio y debe ser una cadena válida"` or `"El título no puede exceder 100 caracteres"`
- **Description**: If provided, required, non-empty string
  - Error: `"La descripción es obligatoria y debe ser una cadena válida"`
- **Location**: If provided, required, non-empty string
  - Error: `"La ubicación es obligatoria y debe ser una cadena válida"`
- **JobDescription**: If provided, required, non-empty string
  - Error: `"La descripción del trabajo es obligatoria y debe ser una cadena válida"`
- **Status**: Must be valid enum value (`Open`, `Contratado`, `Cerrado`, `Borrador`)
  - Error: `"Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador"`
- **isVisible**: Must be boolean
  - Error: `"isVisible debe ser un valor booleano"`
- **companyId**: Must be positive integer if provided
  - Error: `"companyId debe ser un número entero positivo"`
- **interviewFlowId**: Must be positive integer if provided
  - Error: `"interviewFlowId debe ser un número entero positivo"`
- **salaryMin**: Must be >= 0 if provided
  - Error: `"El salario mínimo debe ser un número válido mayor o igual a 0"`
- **salaryMax**: Must be >= 0 if provided
  - Error: `"El salario máximo debe ser un número válido mayor o igual a 0"`
- **salaryMin <= salaryMax**: If both provided, minimum cannot exceed maximum
  - Error: `"El salario mínimo no puede ser mayor que el máximo"`
- **applicationDeadline**: Must be valid date, cannot be in the past
  - Error: `"Fecha límite inválida"` or `"La fecha límite no puede ser anterior a hoy"`
- **employmentType**: Must be non-empty string if provided
  - Error: `"El tipo de empleo debe ser una cadena válida"`
- **Text fields**: Must be strings if provided (requirements, responsibilities, benefits, companyDescription, contactInfo)

**Client-side Validation:**
- HTML5 form validation for required fields
- Real-time user feedback through error messages
- Form submission prevention until valid
- Date picker ensures valid date format
- Number inputs for salary fields with min="0"

### Security Requirements

**Authentication:**
- Currently no authentication middleware implemented (marked as `@access Public` in controller)
- Future: JWT token validation should be added

**Authorization:**
- No authorization checks implemented (all users can update any position)
- Future: Position edit permissions should be verified

**Input Sanitization:**
- Prisma ORM handles SQL injection prevention through parameterized queries
- Text inputs are validated but not sanitized (should be added)

**XSS Prevention:**
- React automatically escapes content in JSX
- Input validation prevents malicious content

### Performance Requirements

- API response time: Not explicitly measured, but optimized with direct Prisma queries
- Database queries: Single query for position update, additional queries only for company/interviewFlow validation if provided
- Form auto-save: Not implemented (original requirement not fulfilled)
- Loading states: Implemented with React Bootstrap Spinner component

### Testing Requirements

**Unit Tests To Implement:**

1. **`src/presentation/controllers/__tests__/positionController.test.ts`**
   - Comprehensive test suite for `updatePosition` controller
   - **Successful cases:**
     - Valid data update
     - Partial updates (status only)
     - Salary updates
     - Boolean isVisible field
     - applicationDeadline updates
     - Complex update with all fields
   - **Validation error cases:**
     - Invalid position ID format
     - Empty request body
     - Null request body
     - Validation errors from service (empty title, invalid status, salary range)
   - **Not found error cases:**
     - Position not found (404)
   - **Reference validation error cases:**
     - Company not found (400)
     - Interview flow not found (400)
   - **Server error cases:**
     - Unexpected errors (500)
     - Non-Error exceptions
   - **Edge cases:**
     - Negative position ID
     - Zero position ID
     - Large position ID
     - Complex update data

### Documentation Updates

**API Documentation:**
- `documentation/api-spec.yml` - Should be updated with PUT /positions/:id endpoint specification

**Data Model:**
- `documentation/DataModel.md` - Should be reviewed to ensure Position model documentation is current

### Definition of Done

✅ **Development:**
- [ ] Backend API endpoint implemented with full validation (`PUT /positions/:id`)
- [ ] Frontend form component created (`EditPosition.js`)
- [ ] All database fields properly handled
- [ ] Error handling implemented (client & server)
- [ ] Route integration (`/positions/:id/edit`)
- [ ] Authentication/authorization enforced (not implemented)

✅ **Testing:**
- [ ] Controller unit tests written and passing (>90% coverage for controller)
- [ ] Service layer unit tests (not implemented)
- [ ] Validator unit tests (not implemented)
- [ ] Integration tests implemented (not implemented)
- [ ] Manual testing completed
- [ ] Edge cases tested (validation, permissions - partially)

✅ **Documentation:**
- [ ] API specification updated (should be done)
- [ ] Code documentation added (JSDoc comments present in controller)
- [ ] Data model documentation reviewed (should be done)

✅ **Quality:**
- [ ] Code review completed
- [ ] Security review passed (authentication missing)
- [ ] Performance requirements met (not measured)
- [ ] No linting errors
- [ ] TypeScript compilation successful

✅ **Deployment:**
- [ ] No database migrations needed (schema already supports all fields)
- [ ] Environment configuration updated (if needed)
- [ ] Feature flag enabled (routed and accessible)

### Acceptance Criteria

**AC1: As a recruiter, I can update position title and description**
- Given I navigate to `/positions/:id/edit`
- When I modify title and description fields
- Then changes are saved and reflected immediately (navigation to positions list after 2 seconds)

**AC2: As a recruiter, I can change position status**
- Given a position in any status
- When I select a new status from dropdown (`Borrador`, `Open`, `Cerrado`, `Contratado`)
- Then status updates and affects position visibility

**AC3: As a recruiter, I can set salary ranges**
- Given I'm editing a position
- When I enter min/max salary values
- Then system validates min <= max constraint (server-side validation)

**AC4: As a user, I receive clear validation feedback**
- Given invalid input data
- When I attempt to save
- Then specific validation errors are displayed (Spanish error messages from backend)

**AC5: As a system, I maintain data integrity**
- Given position update request
- When referenced company/interview flow doesn't exist
- Then update is rejected with appropriate error (400 status with "Invalid reference data")

### Non-Functional Requirements

**Usability:**
- Form provides clear validation messages
- Loading states during fetch and save operations
- Success message displayed after update

**Performance:**
- Updates complete within reasonable time (not explicitly measured)
- Efficient database queries (single update query, optional validation queries)

**Reliability:**
- Proper error handling implemented
- Error messages displayed to user

**Security:**
- Authentication required (not implemented - marked as public)
- Input validation implemented
- XSS protection (React default)
- SQL injection prevention (Prisma ORM)

**Maintainability:**
- Clean code structure (domain models, services, controllers)
- Comprehensive controller tests
- TypeScript types used

**Scalability:**
- Efficient database queries
- No blocking operations

### Implementation Notes

**Key Implementation Decisions:**
1. **Partial Updates**: The implementation supports partial updates - only fields provided in the request body are updated
2. **Optional Field Handling**: Empty strings are converted to `null` for optional fields on the frontend
3. **Date Handling**: Dates are converted from ISO format to date string for input field, and back to ISO for API
4. **Error Messages**: Validation errors are in Spanish to match the original user story language
5. **Status Default**: Default status is `Borrador` (Draft) if not provided
6. **Navigation**: After successful update, user is redirected to positions list after 2 seconds
7. **Validation Strategy**: Validation only occurs for fields that are provided (`!== undefined`), allowing partial updates