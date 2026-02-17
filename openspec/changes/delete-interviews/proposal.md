## Why

Recruiters currently cannot delete or cancel interviews that are no longer needed, requiring manual tracking outside the system when interviews are cancelled or become irrelevant. This creates operational inefficiencies, incomplete audit trails, and makes it difficult to maintain clean interview calendars. The system needs a DELETE endpoint and frontend UI to enable recruiters to safely delete or cancel interview records with proper data retention, stakeholder notification, and audit trail preservation, ensuring the system maintains clean data while preserving compliance requirements.

## What Changes

- **New Backend API Endpoint**: DELETE `/candidates/{candidateId}/interviews/{interviewId}` endpoint for deleting interviews with proper validation and business rule enforcement
- **New Backend Service Layer**: Interview deletion service method with support for soft deletion (cancellation) and hard deletion, including stakeholder notification and audit trail preservation
- **Enhanced Backend Controller**: Interview controller with `deleteInterviewController()` method for handling DELETE requests and responses
- **Enhanced Validation**: Interview deletion validation including business rules (prevent deletion of completed interviews, validate permissions, require deletion reason)
- **Enhanced Frontend UI**: Update CandidateDetails component with delete button/icon next to each interview, confirmation dialog with reason selection, and visual feedback for deleted/cancelled interviews
- **New Frontend Service Method**: `deleteInterview()` method in interviewService for API communication
- **Comprehensive Testing**: Unit tests for controller, service, and validator layers with 90% coverage requirement, including deletion scenarios and business rule validation
- **Documentation Updates**: API specification updates for the new interview deletion endpoint

## Capabilities

### New Capabilities
- `delete-interviews`: Capability to delete or cancel interview records through API and UI, supporting both soft deletion (cancellation with data preservation) and hard deletion (permanent removal), with mandatory deletion reason, stakeholder notification, audit trail preservation, and business rule enforcement (prevent deletion of completed interviews)

### Modified Capabilities
- `create-interview`: The existing interview creation capability is extended to support deletion operations. The interview data model may be enhanced with deletion status fields and cancellation metadata, but existing create behavior remains unchanged.
- `edit-interview`: The existing interview update capability may be extended to support cancellation status updates, but existing edit behavior remains unchanged.

## Impact

**Backend Impact:**
- `backend/src/presentation/controllers/interviewController.ts`: Add `deleteInterviewController()` method
- `backend/src/application/services/interviewService.ts`: Add `deleteInterview()` method with deletion logic, validation, and notification handling
- `backend/src/application/validator.ts`: Add `validateInterviewDeletion()` function for deletion validation
- `backend/src/domain/models/Interview.ts`: May add deletion status fields and cancellation metadata
- `backend/src/domain/repositories/IInterviewRepository.ts`: Add deletion methods (soft delete, hard delete)
- `backend/src/routes/candidateRoutes.ts`: Add DELETE route for `/:candidateId/interviews/:interviewId`
- Database schema: May require migration for deletion status fields and audit trail tables

**Frontend Impact:**
- `frontend/src/components/CandidateDetails.js`: Add delete button/icon, confirmation dialog, and deletion reason selection UI
- `frontend/src/services/interviewService.js`: Add `deleteInterview()` method for API communication
- `frontend/src/components/DeleteInterviewModal.js`: New component for deletion confirmation and reason selection (if created)

**Testing Impact:**
- New unit tests for deletion controller, service, and validator
- Integration tests for deletion workflow with stakeholder notifications
- E2E tests for deletion UI flow

**Documentation Impact:**
- `ai-specs/specs/api-spec.yml`: Add DELETE endpoint documentation under `/candidates/{id}/interviews/{interviewId}` path
- `ai-specs/specs/data-model.md`: Update Interview model documentation with deletion status fields (if added)
