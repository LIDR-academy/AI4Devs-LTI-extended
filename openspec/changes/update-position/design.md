## Context

The LTI platform currently supports creating and retrieving positions through GET endpoints (`/positions` and `/positions/:id`), but lacks the ability to update existing positions. The system follows Domain-Driven Design (DDD) principles with a clean architecture consisting of:

- **Domain Layer**: `Position` model with business logic and `save()` method that already supports updates via Prisma
- **Application Layer**: Service functions (`positionService.ts`) and validators (`validator.ts`) following established patterns
- **Presentation Layer**: Express controllers (`positionController.ts`) with consistent error handling patterns

The existing `Position.save()` method already handles both create and update operations based on the presence of `id`, so the domain model is update-ready. The frontend currently displays positions in a list view (`Positions.tsx`) but has no edit functionality.

## Goals / Non-Goals

**Goals:**
- Enable partial updates of position data through a PATCH endpoint
- Provide a user-friendly frontend form for editing positions
- Maintain data integrity through validation and immutable field protection
- Follow existing architectural patterns and code structure
- Achieve 90% test coverage for all new functionality
- Support all updatable fields with proper validation rules

**Non-Goals:**
- Full replacement updates (PUT endpoint) - only partial updates (PATCH)
- Bulk update operations
- Update history/audit logging (future enhancement)
- Authorization/authentication (currently not implemented in the system)
- Real-time collaboration or optimistic locking
- Field-level permissions or role-based field access

## Decisions

### 1. Use PATCH for Partial Updates
**Decision**: Implement PATCH `/positions/:id` endpoint supporting partial updates.

**Rationale**: 
- PATCH is the HTTP standard for partial resource updates
- Allows updating only specific fields without requiring all fields
- Aligns with RESTful API best practices
- Reduces payload size and client complexity

**Alternatives Considered**:
- PUT endpoint: Would require full resource replacement, increasing complexity and payload size
- POST to `/positions/:id/update`: Non-standard, less RESTful

### 2. Validation in Application Layer
**Decision**: Create `validatePositionUpdateData` function in `validator.ts` following the existing `validateCandidateData` pattern.

**Rationale**:
- Consistent with existing codebase patterns
- Centralized validation logic for reusability
- Separation of concerns (validation separate from business logic)
- Easier to test and maintain

**Alternatives Considered**:
- Validation in domain model: Would mix validation with business logic, reducing testability
- Validation in controller: Would duplicate logic and reduce reusability

### 3. Immutable Field Protection at Validation Layer
**Decision**: Reject immutable fields (`id`, `companyId`, `interviewFlowId`) in the validator, returning 400 error.

**Rationale**:
- Early rejection prevents unnecessary database operations
- Clear error messaging for API consumers
- Business rule enforcement at the application boundary
- Consistent with existing error handling patterns

**Alternatives Considered**:
- Silent ignore of immutable fields: Would hide errors and confuse API consumers
- Database-level constraints only: Would provide less descriptive errors

### 4. Reuse Existing Position.save() Method
**Decision**: Use the existing `Position.save()` method which already supports updates when `id` is present.

**Rationale**:
- Leverages existing, tested domain logic
- Maintains consistency with create operations
- Reduces code duplication
- The method already uses Prisma's optimized `update` operation

**Alternatives Considered**:
- New `update()` method: Would duplicate logic and increase maintenance burden

### 5. Frontend Form as Separate Component
**Decision**: Create new `EditPositionForm.js` component rather than inline editing.

**Rationale**:
- Better separation of concerns and component reusability
- Easier to test and maintain
- Follows React best practices for form handling
- Allows for future enhancements (e.g., form state management libraries)

**Alternatives Considered**:
- Inline editing in Positions.tsx: Would bloat the component and reduce maintainability
- Modal-based editing: More complex, not necessary for this use case

### 6. Client-Side Validation Before API Call
**Decision**: Implement client-side validation in the edit form for immediate user feedback.

**Rationale**:
- Better user experience with instant feedback
- Reduces unnecessary API calls
- Complements server-side validation (defense in depth)
- Standard practice for form-based UIs

**Alternatives Considered**:
- Server-side only: Would provide slower feedback and worse UX

## Risks / Trade-offs

### [Risk] Partial Update Complexity
**Risk**: Handling partial updates requires careful merging of existing and new data, which could lead to data inconsistencies if not handled correctly.

**Mitigation**: 
- Use Prisma's `update` method which handles partial updates natively
- Validate all provided fields regardless of partial nature
- Comprehensive test coverage for edge cases (empty strings, null values, etc.)

### [Risk] Validation Rule Drift
**Risk**: Update validation rules might diverge from create validation rules over time.

**Mitigation**:
- Share common validation logic where possible
- Document validation rules in both API spec and data model
- Consider extracting shared validation to utility functions in future refactoring

### [Risk] Frontend-Backend Validation Mismatch
**Risk**: Client-side and server-side validation rules might become inconsistent.

**Mitigation**:
- Server-side validation is the source of truth
- Client-side validation mirrors server rules but doesn't replace them
- Comprehensive E2E tests to catch mismatches
- Document validation rules in a single source (API spec)

### [Trade-off] No Optimistic Updates
**Trade-off**: Frontend will wait for server confirmation before updating UI, which may feel slower but ensures data consistency.

**Rationale**: Simpler implementation, avoids rollback complexity, ensures data accuracy. Can be enhanced later if needed.

### [Risk] Concurrent Update Conflicts
**Risk**: Two users updating the same position simultaneously could overwrite each other's changes.

**Mitigation**: 
- Currently acceptable risk given single-user scenarios
- Future enhancement: Add optimistic locking or last-modified timestamps
- Document as known limitation

## Migration Plan

**Deployment Steps:**
1. Deploy backend changes (PATCH endpoint, validator, service, controller, tests)
2. Run existing test suite to ensure no regressions
3. Deploy frontend changes (service method, edit form, routing, E2E tests)
4. Verify API endpoint is accessible and functional
5. Test end-to-end workflow manually

**Rollback Strategy:**
- Backend: Remove PATCH route - existing GET endpoints remain unaffected
- Frontend: Remove edit button and route - positions list remains functional
- No database migrations required - no schema changes
- All changes are additive, no breaking changes

**No Data Migration Required**: This feature adds new functionality without modifying existing data structures or requiring data transformation.

## Open Questions

1. **Authorization**: Should we add basic authentication checks before allowing updates? (Currently deferred - system has no auth)
2. **Audit Trail**: Should position updates be logged for compliance? (Future enhancement)
3. **Notification**: Should candidates be notified when positions they've applied to are updated? (Out of scope for this change)
4. **Validation Performance**: Should we add caching for validation rules if they become complex? (Not needed currently)
