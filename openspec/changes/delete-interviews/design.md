## Context

The LTI platform currently supports creating interviews through POST `/candidates/{candidateId}/interviews` and updating interviews through PATCH `/candidates/{candidateId}/interviews/{interviewId}` endpoints. However, there is no mechanism to delete or cancel interviews that are no longer needed. When interviews are cancelled or become irrelevant, recruiters must manually track these changes outside the system, leading to data inconsistencies, incomplete audit trails, and cluttered interview calendars.

The existing interview implementation follows Domain-Driven Design (DDD) principles with a layered architecture:
- **Domain Layer**: Interview entity model with business logic
- **Application Layer**: Interview service with createInterview() and updateInterview() methods
- **Presentation Layer**: Interview controller handling HTTP requests/responses
- **Frontend**: CandidateDetails component with interview creation and editing capabilities

The current Interview domain model does not include deletion status fields or soft deletion support. This change will add deletion functionality while maintaining data integrity and audit trail requirements.

## Goals / Non-Goals

**Goals:**
- Enable deletion of interview records through REST API with proper validation
- Provide intuitive UI for deleting interviews with confirmation dialog
- Maintain data integrity by preventing deletion of completed interviews (business rule)
- Require deletion reason for audit trail and compliance
- Support hard deletion (permanent removal) for interviews that are no longer relevant
- Maintain consistency with existing interview management patterns
- Ensure proper error handling and validation

**Non-Goals:**
- Soft deletion with cancellation status (future enhancement - start with hard deletion for simplicity)
- Stakeholder notification system (future enhancement - can be added later)
- Cascade deletion of related records (interviews are independent entities)
- Bulk deletion operations (single interview deletion only)
- Deletion recovery/undo functionality (future enhancement)
- Audit trail tables (use application logs for now, can add structured audit tables later)

## Decisions

### 1. Hard Deletion Only (No Soft Deletion Initially)
**Decision**: Implement hard deletion (permanent removal from database) as the initial approach, without soft deletion or cancellation status fields.

**Rationale**: 
- Simpler initial implementation that meets the core requirement
- Reduces database schema complexity (no need for deletion status fields initially)
- Can be extended to soft deletion later if needed
- Aligns with the user story requirement to "maintain clean interview calendars"
- Hard deletion is appropriate for interviews that are truly no longer needed

**Alternatives Considered**:
- Soft deletion with status flags: More complex, requires schema changes, can be added later if needed
- Both soft and hard deletion: Over-engineered for initial requirement, adds unnecessary complexity

### 2. Mandatory Deletion Reason
**Decision**: Require a deletion reason in the request body for all deletion operations.

**Rationale**:
- Provides audit trail for compliance and tracking
- Helps understand why interviews were deleted
- Supports future analytics on deletion patterns
- Required field ensures accountability

**Alternatives Considered**:
- Optional deletion reason: Would allow deletions without context, reducing audit value
- Predefined reason categories: More structured but less flexible, can be added later

### 3. Business Rule: Prevent Deletion of Completed Interviews
**Decision**: Prevent deletion of interviews that have been completed (have a result set to "Passed" or "Failed").

**Rationale**:
- Completed interviews are part of the recruitment history and should be preserved
- Maintains data integrity for reporting and analytics
- Prevents accidental loss of important interview outcomes
- Only pending interviews should be deletable

**Alternatives Considered**:
- Allow deletion of completed interviews: Would risk losing important historical data
- Require admin approval for completed interview deletion: Adds complexity, can be added later if needed

### 4. DELETE HTTP Method with Request Body
**Decision**: Use DELETE HTTP method at `/candidates/{candidateId}/interviews/{interviewId}` with optional request body containing deletion reason.

**Rationale**:
- Follows RESTful conventions for deletion operations
- Request body allows passing deletion reason without query parameters
- Path parameters clearly identify the resource to delete
- Consistent with existing API patterns (create uses POST, update uses PATCH)

**Alternatives Considered**:
- POST to `/interviews/{id}/delete`: Less RESTful, adds unnecessary endpoint
- DELETE with query parameter for reason: Less clean, reason could be long text

### 5. Reuse Existing Validation and Service Patterns
**Decision**: Follow the same validation and service patterns as createInterview and updateInterview methods.

**Rationale**:
- Maintains consistency across interview operations
- Reuses existing validation infrastructure
- Follows established DDD patterns
- Reduces code duplication

**Alternatives Considered**:
- Separate deletion service: Would duplicate patterns unnecessarily
- Different validation approach: Would create inconsistency

### 6. Frontend Confirmation Dialog Pattern
**Decision**: Use React Bootstrap Modal with confirmation dialog and reason input field before deletion.

**Rationale**:
- Prevents accidental deletions (confirmation required)
- Provides opportunity to enter deletion reason
- Consistent with common UI patterns for destructive operations
- Clear visual feedback for user

**Alternatives Considered**:
- Simple browser confirm(): Less user-friendly, no reason input
- Separate deletion page: Unnecessary navigation, loses context

### 7. Optimistic UI Update with Refresh
**Decision**: Remove interview from UI immediately after successful deletion, then refresh candidate details to ensure consistency.

**Rationale**:
- Provides immediate feedback to user
- Ensures UI reflects server state after refresh
- Handles edge cases where server state might differ
- Balances user experience with data consistency

**Alternatives Considered**:
- Only optimistic update: Risk of UI/API state mismatch
- Only API refresh: Slower perceived performance

## Risks / Trade-offs

**[Risk] Accidental Deletion of Important Interviews** → Mitigation: Require confirmation dialog with reason input, prevent deletion of completed interviews, and log all deletions for audit purposes.

**[Risk] Orphaned Records if Application is Deleted** → Mitigation: Interviews are associated with applications. If an application is deleted, related interviews should be handled by database foreign key constraints (CASCADE or RESTRICT based on business rules). This is out of scope for this change but should be considered.

**[Risk] Deletion Reason Validation** → Mitigation: Require non-empty deletion reason with reasonable length limit (e.g., max 500 characters) to ensure meaningful audit trail without allowing abuse.

**[Risk] Concurrent Deletion Attempts** → Mitigation: Database constraints will prevent duplicate deletions. Return appropriate 404 if interview already deleted. Handle race conditions gracefully.

**[Trade-off] Hard Deletion vs. Soft Deletion** → We chose hard deletion for simplicity, but this means deleted interviews cannot be recovered. If recovery is needed, soft deletion can be added later with a migration to add deletion status fields.

**[Trade-off] Simplicity vs. Comprehensive Features** → We're implementing basic deletion first (hard delete with reason). Advanced features like soft deletion, notifications, and structured audit trails can be added in future iterations based on actual needs.

**[Trade-off] Business Rule Strictness** → We prevent deletion of completed interviews to preserve history. This may be too restrictive for some use cases, but can be relaxed later if needed with proper approval workflows.

## Migration Plan

**Deployment Steps:**
1. Deploy backend changes (validator, service, controller, routes)
2. No database migrations required initially (using existing schema)
3. Deploy frontend changes (service method, component updates with delete button and confirmation dialog)
4. Verify API endpoint is accessible and functional
5. Test deletion operations with various scenarios (pending interviews, completed interviews, non-existent interviews)

**Rollback Strategy:**
- Backend: Revert to previous version, DELETE endpoint will be unavailable (create and update endpoints remain functional)
- Frontend: Revert component changes, delete functionality will be unavailable (create and edit functionality remain functional)
- No database changes required, so no data migration rollback needed

**Testing Strategy:**
- Unit tests for all new backend functions (validator, service, controller)
- Integration tests for API endpoint with various scenarios
- Manual testing with curl for deletion operations
- Frontend E2E tests for delete workflow
- Verify existing create and update interview functionality still works
- Test business rule: attempt to delete completed interview should fail

## Open Questions

- Should we add soft deletion with cancellation status in a future iteration? (Consider based on user feedback)
- Should we implement stakeholder notification for deleted interviews? (Future enhancement)
- Should we add structured audit trail tables for deletion tracking? (Consider for compliance requirements)
- Should we support bulk deletion of multiple interviews? (Out of scope for this change)
- Should we add deletion recovery/undo functionality? (Future enhancement if needed)
