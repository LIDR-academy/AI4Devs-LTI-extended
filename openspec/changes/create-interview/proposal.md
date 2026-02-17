## Why

Recruiters currently cannot create or schedule interviews for candidates through the system, requiring manual tracking outside the application. This creates operational inefficiencies, incomplete audit trails, and makes it difficult to track interview progress for candidate applications. The system needs a POST endpoint and frontend UI to enable recruiters to create interviews, schedule evaluation meetings, and record interview results, ensuring complete tracking of the recruitment process.

## What Changes

- **New Backend API Endpoint**: POST `/candidates/{candidateId}/interviews` endpoint for creating interviews associated with candidate applications
- **New Backend Service Layer**: Interview service with business logic for validation and interview creation
- **New Backend Controller**: Interview controller for handling HTTP requests and responses
- **New Backend Repository Interface**: Interview repository interface following domain-driven design patterns
- **Enhanced Validation**: Interview data validation including business rules (active employees, valid interview steps, score ranges)
- **Enhanced Frontend Form**: Update CandidateDetails component with comprehensive interview creation form including application selector, interview step selector, employee selector, date picker, score input, and notes field
- **New Frontend Service**: Interview service method for API communication
- **Comprehensive Testing**: Unit tests for controller, service, and validator layers with 90% coverage requirement
- **Documentation Updates**: API specification updates for the new interview creation endpoint

## Capabilities

### New Capabilities
- `create-interview`: Capability to create interviews for candidates through API and UI, associating interviews with applications, interview steps, employees, and including scheduling information, scores, and notes with comprehensive validation

### Modified Capabilities
<!-- No existing capabilities are being modified - this is a new feature that extends the existing interview management capabilities -->

## Impact

**Backend Impact:**
- `backend/src/presentation/controllers/interviewController.ts`: New controller file for interview operations
- `backend/src/application/services/interviewService.ts`: New service file for interview business logic
- `backend/src/domain/repositories/IInterviewRepository.ts`: New or updated repository interface
- `backend/src/application/validator.ts`: Add `validateInterviewData` function
- `backend/src/routes/candidateRoutes.ts`: Add POST route for `/:candidateId/interviews`
- Test files: New comprehensive test suites for controller and service layers

**Frontend Impact:**
- `frontend/src/components/CandidateDetails.js`: Enhance existing component with interview creation form
- `frontend/src/services/interviewService.js` or `candidateService.js`: Add interview creation service method
- Form validation and error handling for interview creation workflow

**Documentation Impact:**
- `ai-specs/specs/api-spec.yml`: Add POST `/candidates/{candidateId}/interviews` endpoint specification with request/response schemas and validation rules

**No Breaking Changes**: This feature extends existing functionality without modifying current endpoints or data structures. The Interview domain model already exists in the system.
