## Context

The LTI platform currently supports viewing candidates and their applications, but lacks the ability to create interviews for candidates through the system. The system follows Domain-Driven Design (DDD) principles with a clean architecture consisting of:

- **Domain Layer**: `Interview` model with business logic and `save()` method that supports creation via Prisma
- **Application Layer**: Service functions and validators following established patterns (e.g., `candidateService.ts`, `positionService.ts`)
- **Presentation Layer**: Express controllers with consistent error handling patterns

The existing `Interview.save()` method already handles creation operations, and the `IInterviewRepository` interface exists with query methods. The Interview domain model is creation-ready. The frontend currently displays candidate details in `CandidateDetails.js` but has no interview creation functionality.

**Important Note**: While the endpoint is structured as `/candidates/{candidateId}/interviews`, interviews are actually associated with Applications in the data model. The request body must include an `applicationId` to properly link the interview to a specific application. The `candidateId` in the URL path is used for validation to ensure the application belongs to the specified candidate.

## Goals / Non-Goals

**Goals:**
- Enable creation of interviews through a POST endpoint
- Provide a user-friendly frontend form for creating interviews with all required fields
- Maintain data integrity through comprehensive validation (candidate exists, application belongs to candidate, interview step belongs to position's flow, employee is active)
- Follow existing architectural patterns and code structure
- Achieve 90% test coverage for all new functionality
- Support optional fields (score, notes) with proper validation rules
- Validate score range (0-5) and notes length (max 1000 characters)

**Non-Goals:**
- Update or delete interview operations (future enhancements)
- Bulk interview creation
- Interview scheduling/calendar integration
- Email notifications for scheduled interviews
- Authorization/authentication (currently not implemented in the system)
- Interview result workflow automation
- Interview step progression automation

## Decisions

### 1. Use POST for Interview Creation
**Decision**: Implement POST `/candidates/{candidateId}/interviews` endpoint for creating interviews.

**Rationale**: 
- POST is the HTTP standard for creating new resources
- RESTful API design following existing patterns
- The URL structure `/candidates/{candidateId}/interviews` provides clear resource hierarchy
- Aligns with RESTful API best practices

**Alternatives Considered**:
- POST to `/applications/{applicationId}/interviews`: Would be more accurate to the data model, but less intuitive from a user perspective (candidates are the primary entity)
- POST to `/interviews` with candidateId in body: Less RESTful, loses resource hierarchy

### 2. Validation in Application Layer
**Decision**: Create `validateInterviewData` function in `validator.ts` following the existing validation patterns.

**Rationale**:
- Consistent with existing codebase patterns (`validateCandidateData`, `validatePositionData`)
- Centralized validation logic for reusability
- Separation of concerns (validation separate from business logic)
- Easier to test and maintain

**Alternatives Considered**:
- Validation in domain model: Would mix validation with business logic, reducing testability
- Validation in controller: Would duplicate logic and reduce reusability

### 3. Business Rule Validation at Service Layer
**Decision**: Validate business rules (candidate exists, application belongs to candidate, interview step belongs to position's flow, employee is active) in the service layer using repositories.

**Rationale**:
- Business rules require database queries, which belong in the service layer
- Service layer orchestrates multiple repository calls
- Clear separation: validator handles data format/type validation, service handles business logic validation
- Consistent with existing service patterns

**Alternatives Considered**:
- All validation in validator: Would require passing repositories to validator, breaking separation of concerns
- Validation in controller: Would mix HTTP concerns with business logic

### 4. Reuse Existing Interview.save() Method
**Decision**: Use the existing `Interview.save()` method which already supports creation when `id` is not present.

**Rationale**:
- Leverages existing, tested domain logic
- Maintains consistency with other domain models
- Reduces code duplication
- The method already uses Prisma's `create` operation

**Alternatives Considered**:
- New `create()` method: Would duplicate logic and increase maintenance burden
- Direct Prisma calls in service: Would bypass domain model and break DDD principles

### 5. Frontend Form Enhancement in Existing Component
**Decision**: Enhance existing `CandidateDetails.js` component with interview creation form rather than creating a separate component.

**Rationale**:
- Interview creation is tightly coupled to candidate context
- Reduces component proliferation
- Candidate details already displays applications, making it the natural place for interview creation
- Follows existing component patterns

**Alternatives Considered**:
- Separate `CreateInterviewForm.js` component: Would require more props passing and context management
- Modal-based form: More complex, not necessary for this use case

### 6. Client-Side Validation Before API Call
**Decision**: Implement client-side validation in the form for immediate user feedback.

**Rationale**:
- Better user experience with instant feedback
- Reduces unnecessary API calls
- Complements server-side validation (defense in depth)
- Standard practice for form-based UIs

**Alternatives Considered**:
- Server-side only: Would provide slower feedback and worse UX

### 7. Score Range Validation (0-5)
**Decision**: Enforce score range of 0-5 as specified in requirements, with null allowed for scheduled interviews.

**Rationale**:
- Matches business requirements
- Allows for scheduled interviews without scores
- Clear validation rules for API consumers

**Alternatives Considered**:
- Different score range: Would not match requirements
- Required score: Would prevent scheduling future interviews

## Risks / Trade-offs

### [Risk] Complex Validation Chain
**Risk**: Validating that interview step belongs to position's interview flow requires multiple repository calls (application → position → interview flow → interview steps), which could lead to performance issues or complex error handling.

**Mitigation**: 
- Use Prisma's `include` to fetch related data efficiently in a single query where possible
- Cache interview flow data if needed
- Comprehensive test coverage for validation edge cases
- Clear error messages for each validation failure

### [Risk] URL Path vs Data Model Mismatch
**Risk**: The endpoint uses `/candidates/{candidateId}/interviews` but interviews are actually linked to Applications, not directly to Candidates. This could cause confusion.

**Mitigation**:
- Clear documentation in API spec explaining the relationship
- Validation ensures application belongs to candidate
- Request body requires `applicationId` to make the relationship explicit

### [Risk] Frontend-Backend Validation Mismatch
**Risk**: Client-side and server-side validation rules might become inconsistent.

**Mitigation**:
- Server-side validation is the source of truth
- Client-side validation mirrors server rules but doesn't replace them
- Comprehensive E2E tests to catch mismatches
- Document validation rules in a single source (API spec)

### [Trade-off] No Interview Step Progression Automation
**Trade-off**: Creating an interview does not automatically update the application's `currentInterviewStep`. This is a manual process.

**Rationale**: Simpler implementation, avoids workflow complexity. Interview creation and step progression are separate concerns. Can be enhanced later if needed.

### [Risk] Concurrent Interview Creation
**Risk**: Multiple recruiters creating interviews for the same application simultaneously could lead to duplicate interviews.

**Mitigation**: 
- Currently acceptable risk given single-user scenarios
- Future enhancement: Add unique constraints or validation to prevent duplicate interviews for same application/step
- Document as known limitation

### [Risk] Interview Date Validation
**Risk**: No validation that interview date is in the future for scheduling or in the past for recording completed interviews.

**Mitigation**:
- Allow both past and future dates as per requirements (interviews can be scheduled or recorded)
- Document this behavior in API spec
- Future enhancement: Add optional date range validation if business rules change

## Migration Plan

**Deployment Steps:**
1. Deploy backend changes (POST endpoint, validator, service, controller, tests)
2. Run existing test suite to ensure no regressions
3. Deploy frontend changes (service method, form enhancement, E2E tests)
4. Verify API endpoint is accessible and functional
5. Test end-to-end workflow manually

**Rollback Strategy:**
- Backend: Remove POST route - existing GET endpoints remain unaffected
- Frontend: Remove interview creation form - candidate details remain functional
- No database migrations required - Interview table already exists
- All changes are additive, no breaking changes

**No Data Migration Required**: This feature adds new functionality without modifying existing data structures or requiring data transformation. The Interview table and domain model already exist.

## Open Questions

1. **Authorization**: Should we add basic authentication checks before allowing interview creation? (Currently deferred - system has no auth)
2. **Interview Step Progression**: Should creating an interview automatically update the application's `currentInterviewStep`? (Deferred - out of scope for this change)
3. **Duplicate Prevention**: Should we prevent creating multiple interviews for the same application/step combination? (Future enhancement)
4. **Date Validation**: Should we add business rules about interview dates (e.g., cannot schedule interviews on weekends, minimum notice period)? (Out of scope for this change)
5. **Notification**: Should candidates or employees be notified when interviews are created? (Out of scope for this change)
