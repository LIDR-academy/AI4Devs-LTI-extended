## Why

Recruiters currently cannot update position details after creation, requiring direct database access to maintain accurate information. This creates operational inefficiencies and potential data inconsistencies. The system needs a PATCH endpoint and frontend UI to enable authorized users to edit position information through the application, ensuring data accuracy and reducing the need for database-level changes.

## What Changes

- **New Backend API Endpoint**: PATCH `/positions/:id` endpoint supporting partial updates of position data
- **New Frontend Edit Form**: React component for editing positions with pre-populated data and validation
- **Enhanced Position Service**: Frontend service method to call the update API
- **Updated Position Component**: Add "Editar" button to position cards with navigation to edit form
- **New Routing**: Route configuration for `/positions/:id/edit` path
- **Comprehensive Testing**: Unit tests for validator, service, and controller layers; E2E tests for frontend workflow
- **Documentation Updates**: API specification and data model documentation for update operations

## Capabilities

### New Capabilities
- `position-update`: Capability to update existing position details through API and UI, supporting partial updates with validation of business rules and immutable field protection

### Modified Capabilities
<!-- No existing capabilities are being modified - this is a new feature that extends the existing position management capabilities -->

## Impact

**Backend Impact:**
- `backend/src/routes/positionRoutes.ts`: Add PATCH route handler
- `backend/src/presentation/controllers/positionController.ts`: Add `updatePosition` controller function
- `backend/src/application/services/positionService.ts`: Add `updatePositionService` function
- `backend/src/application/validator.ts`: Add `validatePositionUpdateData` function
- Test files: Add comprehensive test suites for all new functionality

**Frontend Impact:**
- `frontend/src/services/positionService.js`: Add `updatePosition` method
- `frontend/src/components/Positions.tsx`: Add edit button and navigation
- `frontend/src/components/EditPositionForm.js`: New component for editing positions
- `frontend/src/App.js`: Add route for edit form
- `frontend/cypress/e2e/positions.cy.ts`: Add E2E tests for update workflow

**Documentation Impact:**
- `ai-specs/specs/api-spec.yml`: Add PATCH `/positions/{id}` endpoint specification
- `ai-specs/specs/data-model.md`: Update Position model section with update operation details

**No Breaking Changes**: This feature extends existing functionality without modifying current GET endpoints or data structures.
