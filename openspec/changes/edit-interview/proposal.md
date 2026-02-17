## Why

Recruiters currently cannot modify interview details after creation, requiring manual tracking outside the system when schedule changes occur. This creates operational inefficiencies, incomplete audit trails, and makes it difficult to keep interview information up-to-date throughout the recruitment process. The system needs a PATCH endpoint and frontend UI to enable recruiters to edit interview details such as date, time, interview step, employee, score, notes, and result, ensuring accurate tracking when changes arise in the agenda.

## What Changes

- **New Backend API Endpoint**: PATCH `/candidates/{candidateId}/interviews/{interviewId}` endpoint for updating interview details with partial update support
- **Enhanced Backend Service Layer**: Interview service with `updateInterview()` method for business logic validation and interview updates
- **Enhanced Backend Controller**: Interview controller with `updateInterviewController()` for handling PATCH requests and responses
- **Enhanced Validation**: Interview update data validation including business rules (interview ownership, active employees, valid interview steps, score ranges) with all fields optional for partial updates
- **Enhanced Frontend UI**: Update CandidateDetails component with edit icon (pen) next to each interview, edit modal with pre-filled form, and save/cancel functionality
- **New Frontend Service Method**: `updateInterview()` method in interviewService for API communication
- **Comprehensive Testing**: Unit tests for controller, service, and validator layers with 90% coverage requirement, including partial update scenarios
- **Documentation Updates**: API specification updates for the new interview update endpoint

## Capabilities

### New Capabilities
- `edit-interview`: Capability to update existing interview details through API and UI, supporting partial updates of interview date, interview step, employee, score, notes, and result with comprehensive validation and business rule enforcement

### Modified Capabilities
- `create-interview`: The existing interview creation capability is extended to support updates. The interview data model and validation rules remain consistent, but new update operations are added without changing existing create behavior.

## Impact

**Backend Impact:**
- `backend/src/application/validator.ts`: Add `validateInterviewUpdateData()` function
- `backend/src/application/services/interviewService.ts`: Add `updateInterview()` function
- `backend/src/presentation/controllers/interviewController.ts`: Add `updateInterviewController()` function
- `backend/src/routes/candidateRoutes.ts`: Add PATCH route for `/:candidateId/interviews/:interviewId`
- Test files: New comprehensive test suites for update operations covering partial updates, validation, and business rules

**Frontend Impact:**
- `frontend/src/components/CandidateDetails.js`: Add edit icon, edit modal component, state management for editing, and form pre-filling logic
- `frontend/src/services/interviewService.js`: Add `updateInterview()` service method
- Form validation and error handling for interview update workflow
- UI/UX enhancements for edit functionality with modal interactions

**Documentation Impact:**
- `ai-specs/specs/api-spec.yml`: Add PATCH `/candidates/{candidateId}/interviews/{interviewId}` endpoint specification with request/response schemas, validation rules, and error responses
- `ai-specs/specs/data-model.md`: Update Interview model section to document update operation behavior (if needed)

**No Breaking Changes**: This feature extends existing functionality without modifying current endpoints or data structures. The Interview domain model already exists and update operations follow the same validation rules as creation, with all fields optional for partial updates.
