## Context

The LTI platform currently supports creating interviews through the POST `/candidates/{candidateId}/interviews` endpoint and frontend UI. However, there is no mechanism to update interview details after creation. When schedule changes occur or interview results need to be recorded, recruiters must manually track updates outside the system, leading to data inconsistencies and incomplete audit trails.

The existing interview creation implementation follows Domain-Driven Design (DDD) principles with a layered architecture:
- **Domain Layer**: Interview entity model with save() method that already supports updates (checks for id to determine create vs update)
- **Application Layer**: Interview service with createInterview() method and validation logic
- **Presentation Layer**: Interview controller handling HTTP requests/responses
- **Frontend**: CandidateDetails component with interview creation form

The Interview domain model's `save()` method already implements update logic when an `id` is present, so the infrastructure for updates exists at the domain level. This change extends the application and presentation layers to expose update functionality through the API and UI.

## Goals / Non-Goals

**Goals:**
- Enable partial updates of interview details (date, step, employee, score, notes, result) through REST API
- Provide intuitive UI for editing interviews with pre-filled forms and validation
- Maintain consistency with existing interview creation patterns and validation rules
- Support business rules: interview ownership validation, interview step validation, active employee validation
- Ensure all updates are validated and follow the same business rules as creation
- Maintain backward compatibility with existing interview creation functionality

**Non-Goals:**
- Deleting interviews (out of scope for this change)
- Bulk update operations (single interview updates only)
- Changing immutable fields (applicationId, candidateId association cannot be changed)
- Modifying interview history or audit logs (future enhancement)
- Real-time collaboration features for interview editing

## Decisions

### 1. Partial Update Support (PATCH with Optional Fields)
**Decision**: All fields in the update request body are optional, allowing partial updates.

**Rationale**: 
- Follows RESTful best practices for PATCH operations
- Allows updating only changed fields without requiring full object
- Reduces payload size and improves API efficiency
- Aligns with common update patterns in REST APIs

**Alternatives Considered**:
- PUT with required fields: Would require sending entire object even for single field changes, less flexible
- Separate endpoints per field: Would create API bloat and complexity

### 2. Reuse Existing Domain Model Update Logic
**Decision**: Leverage the Interview domain model's existing `save()` method which already handles updates when `id` is present.

**Rationale**:
- The Interview.save() method already implements update logic (checks for id)
- Maintains consistency with existing domain patterns
- Reduces code duplication
- Follows DDD principles of encapsulating persistence logic in domain entities

**Alternatives Considered**:
- Create separate update method: Would duplicate logic already in save() method
- Direct Prisma calls: Would bypass domain model and violate DDD principles

### 3. Validation Rules Match Creation (All Fields Optional)
**Decision**: Apply the same validation rules as interview creation, but make all fields optional for updates.

**Rationale**:
- Ensures data consistency between create and update operations
- Maintains business rule enforcement (score range, notes length, date format, etc.)
- Allows updating any field independently while maintaining validation
- Simplifies validation logic by reusing existing rules

**Alternatives Considered**:
- Different validation rules for updates: Would create inconsistency and confusion
- No validation for updates: Would allow invalid data and violate business rules

### 4. Business Rule Validation on Update
**Decision**: Validate interview ownership, interview step belongs to position's flow, and employee is active when those fields are provided in the update.

**Rationale**:
- Prevents data integrity issues (e.g., assigning interview to wrong candidate's application)
- Ensures interview steps remain valid for the position's interview flow
- Maintains business rule that only active employees can conduct interviews
- Validates only when fields are provided (partial update support)

**Alternatives Considered**:
- Always validate all business rules: Would require fetching all related data even for simple field updates (e.g., just updating notes)
- No business rule validation: Would allow invalid state changes

### 5. Frontend Edit Modal Pattern
**Decision**: Use React Bootstrap Modal component with pre-filled form matching the create interview form structure.

**Rationale**:
- Consistent UI/UX with existing interview creation form
- Modal pattern is appropriate for edit operations (focused, non-destructive)
- Pre-filling form provides better user experience
- Reuses existing form components and validation logic

**Alternatives Considered**:
- Inline editing: Would be more complex and less intuitive for multiple fields
- Separate edit page: Would require navigation and lose context
- Accordion/expandable form: Would clutter the candidate details view

### 6. Optimistic Update with API Refresh
**Decision**: Update local state immediately after successful save, then refresh candidate details from API to ensure consistency.

**Rationale**:
- Provides immediate feedback to user (optimistic update)
- Ensures UI reflects server state (API refresh)
- Handles edge cases where server state might differ from client expectations
- Balances user experience with data consistency

**Alternatives Considered**:
- Only optimistic update: Risk of UI/API state mismatch
- Only API refresh: Slower perceived performance, requires waiting for API call

## Risks / Trade-offs

**[Risk] Interview Step Change Validation Complexity** → Mitigation: Validate interview step belongs to position's interview flow by fetching application, then position, then checking interview flow. Cache position data if needed for performance.

**[Risk] Concurrent Update Conflicts** → Mitigation: Current implementation doesn't include optimistic locking. If concurrent updates become an issue, consider adding version field or timestamp-based conflict detection in future.

**[Risk] Partial Update Validation Edge Cases** → Mitigation: Validate only provided fields. If interviewStepId is updated, validate it belongs to position's flow. If employeeId is updated, validate employee is active. This ensures business rules are enforced without requiring all fields.

**[Risk] Frontend Form State Management Complexity** → Mitigation: Use controlled components with React state. Clear form state on modal close. Handle edge cases (e.g., interview deleted while editing) with error handling.

**[Risk] Date Format Conversion (ISO to datetime-local)** → Mitigation: Create helper function to convert ISO 8601 dates to datetime-local format for form inputs, and vice versa for API calls. Handle timezone considerations.

**[Trade-off] Performance vs. Validation** → We validate business rules only when relevant fields are provided, balancing performance (fewer database queries) with data integrity (enforcing business rules).

**[Trade-off] User Experience vs. Data Consistency** → We use optimistic updates for immediate feedback but refresh from API to ensure consistency, balancing perceived performance with data accuracy.

## Migration Plan

**Deployment Steps:**
1. Deploy backend changes (validator, service, controller, routes)
2. Run database migrations if any (none required - using existing schema)
3. Deploy frontend changes (service method, component updates)
4. Verify API endpoint is accessible and functional
5. Test update operations with various scenarios

**Rollback Strategy:**
- Backend: Revert to previous version, PATCH endpoint will be unavailable (create endpoint remains functional)
- Frontend: Revert component changes, edit functionality will be unavailable (create functionality remains functional)
- No database changes required, so no data migration rollback needed

**Testing Strategy:**
- Unit tests for all new backend functions (validator, service, controller)
- Integration tests for API endpoint
- Manual testing with curl for various update scenarios
- Frontend E2E tests for edit workflow
- Verify existing create interview functionality still works

## Open Questions

- Should we add audit logging for interview updates? (Future enhancement)
- Should we support bulk interview updates? (Out of scope for this change)
- Should we add optimistic locking for concurrent update prevention? (Future enhancement if needed)
