# Backend Implementation Plan: SCRUM-10 Position Update Feature

## Overview

This document provides a comprehensive step-by-step implementation plan for the Position Update feature (SCRUM-10). The feature enables recruiters to update details of open positions through a REST API endpoint. The implementation follows Domain-Driven Design (DDD) principles, clean architecture patterns, and the project's established coding standards.

**Key Architecture Principles:**
- **Domain-Driven Design (DDD)**: Business logic encapsulated in domain models
- **Layered Architecture**: Clear separation between Presentation, Application, and Domain layers
- **SOLID Principles**: Single responsibility, dependency injection, and interface segregation
- **Comprehensive Testing**: Minimum 90% coverage across all layers

## Architecture Context

### Layers Involved

**Presentation Layer** (`src/presentation/controllers/`)
- `positionController.ts` - HTTP request/response handling for position updates

**Application Layer** (`src/application/`)
- `services/positionService.ts` - Business logic orchestration for position updates
- `validator.ts` - Input validation for position data

**Domain Layer** (`src/domain/models/`)
- `Position.ts` - Domain entity with update capabilities (already has `save()` method)

**Infrastructure Layer** (implicit)
- Prisma ORM for database operations
- Database schema already supports all position fields

### Components Referenced

**Existing Files to Modify:**
1. `backend/src/presentation/controllers/positionController.ts`
2. `backend/src/application/services/positionService.ts`
3. `backend/src/application/validator.ts`
4. `backend/src/routes/positionRoutes.ts`

**Domain Model (No Changes Required):**
- `backend/src/domain/models/Position.ts` - Already has `save()` and `findOne()` methods

**New Test Files to Create:**
1. `backend/src/application/__tests__/validator.test.ts` (add tests for `validatePositionUpdate`)
2. `backend/src/application/services/__tests__/positionService.test.ts` (add tests for `updatePositionService`)
3. `backend/src/presentation/controllers/__tests__/positionController.test.ts` (add tests for `updatePosition`)

## Implementation Steps

### Step 0: Create Feature Branch

**Action**: Create and switch to a new feature branch following the development workflow

**Branch Naming**: `feature/SCRUM-10-backend`

**Implementation Steps**:
1. Ensure you're on the latest `main` or `develop` branch
   ```bash
   git checkout main
   ```
2. Pull latest changes
   ```bash
   git pull origin main
   ```
3. Create new feature branch
   ```bash
   git checkout -b feature/SCRUM-10-backend
   ```
4. Verify branch creation
   ```bash
   git branch
   ```

**Notes**: 
- This must be the FIRST step before any code changes
- Follow branch naming convention: `feature/[ticket-id]-backend` as specified in `backend-standards.mdc`
- All subsequent commits will be made to this branch

---

### Step 1: Create Validation Function

**File**: `backend/src/application/validator.ts`

**Action**: Implement comprehensive validation function for position update data

**Function Signature**:
```typescript
export const validatePositionUpdate = (data: any): void
```

**Implementation Steps**:

1. Add the validation function after the existing `validateCandidateData` function
2. Implement validation rules for all updateable fields:
   - **Title validation**: If provided, must be non-empty string, 1-100 characters
   - **Description validation**: If provided, must be non-empty string
   - **Location validation**: If provided, must be non-empty string
   - **JobDescription validation**: If provided, must be non-empty string
   - **Status validation**: Must be one of: `Open`, `Contratado`, `Cerrado`, `Borrador`
   - **isVisible validation**: Must be boolean type
   - **companyId validation**: If provided, must be positive integer
   - **interviewFlowId validation**: If provided, must be positive integer
   - **salaryMin validation**: If provided, must be number >= 0
   - **salaryMax validation**: If provided, must be number >= 0
   - **Salary range validation**: If both salaryMin and salaryMax provided, min <= max
   - **applicationDeadline validation**: If provided, must be valid date and not in the past
   - **employmentType validation**: If provided, must be non-empty string
   - **Optional text fields**: If provided, must be strings (requirements, responsibilities, benefits, companyDescription, contactInfo)
3. Use descriptive English error messages for all validation failures
4. Validate only fields that are present in the data object (support partial updates)

**Dependencies**:
```typescript
// No additional imports needed - use existing validation utilities
```

**Implementation Notes**:
- Validation occurs ONLY for fields present in the request (`!== undefined`)
- This enables partial update functionality
- All error messages must be in English (per coding standards)
- Date validation should use `Date.parse()` and compare with current date
- Status values must match the enum defined in Prisma schema: `Open`, `Contratado`, `Cerrado`, `Borrador`

**Example Validation Logic**:
```typescript
export const validatePositionUpdate = (data: any): void => {
    // Title validation
    if (data.title !== undefined) {
        if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
            throw new Error('Title is required and must be a valid string');
        }
        if (data.title.length > 100) {
            throw new Error('Title cannot exceed 100 characters');
        }
    }

    // Status validation
    if (data.status !== undefined) {
        const validStatuses = ['Open', 'Contratado', 'Cerrado', 'Borrador'];
        if (!validStatuses.includes(data.status)) {
            throw new Error('Invalid status. Must be one of: Open, Contratado, Cerrado, Borrador');
        }
    }

    // Salary validation
    if (data.salaryMin !== undefined) {
        if (typeof data.salaryMin !== 'number' || data.salaryMin < 0) {
            throw new Error('Minimum salary must be a valid number greater than or equal to 0');
        }
    }

    if (data.salaryMax !== undefined) {
        if (typeof data.salaryMax !== 'number' || data.salaryMax < 0) {
            throw new Error('Maximum salary must be a valid number greater than or equal to 0');
        }
    }

    // Salary range validation
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
        if (data.salaryMin > data.salaryMax) {
            throw new Error('Minimum salary cannot be greater than maximum salary');
        }
    }

    // Application deadline validation
    if (data.applicationDeadline !== undefined) {
        const deadline = new Date(data.applicationDeadline);
        if (isNaN(deadline.getTime())) {
            throw new Error('Invalid application deadline');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadline < today) {
            throw new Error('Application deadline cannot be in the past');
        }
    }

    // Boolean validation
    if (data.isVisible !== undefined && typeof data.isVisible !== 'boolean') {
        throw new Error('isVisible must be a boolean value');
    }

    // Integer validations
    if (data.companyId !== undefined) {
        if (!Number.isInteger(data.companyId) || data.companyId <= 0) {
            throw new Error('companyId must be a positive integer');
        }
    }

    if (data.interviewFlowId !== undefined) {
        if (!Number.isInteger(data.interviewFlowId) || data.interviewFlowId <= 0) {
            throw new Error('interviewFlowId must be a positive integer');
        }
    }

    // String field validations
    const stringFields = ['description', 'location', 'jobDescription', 'employmentType'];
    for (const field of stringFields) {
        if (data[field] !== undefined) {
            if (!data[field] || typeof data[field] !== 'string' || data[field].trim().length === 0) {
                throw new Error(`${field} is required and must be a valid string`);
            }
        }
    }

    // Optional string fields (can be empty but must be strings if provided)
    const optionalStringFields = ['requirements', 'responsibilities', 'benefits', 'companyDescription', 'contactInfo'];
    for (const field of optionalStringFields) {
        if (data[field] !== undefined && typeof data[field] !== 'string') {
            throw new Error(`${field} must be a string`);
        }
    }
};
```

---

### Step 2: Create Service Method

**File**: `backend/src/application/services/positionService.ts`

**Action**: Implement business logic for updating position data

**Function Signature**:
```typescript
export const updatePositionService = async (positionId: number, updateData: any): Promise<any>
```

**Implementation Steps**:

1. Add the new service function after existing service functions
2. Verify position exists using `Position.findOne(positionId)`
3. Throw error if position not found: `Position not found`
4. Call `validatePositionUpdate(updateData)` to validate input data
5. If `companyId` provided in updateData, verify company exists in database
6. If `interviewFlowId` provided in updateData, verify interview flow exists in database
7. Merge existing position data with update data
8. Create new `Position` instance with merged data
9. Call `save()` method on Position instance
10. Return updated position object

**Dependencies**:
```typescript
import { PrismaClient } from '@prisma/client';
import { Position } from '../../domain/models/Position';
import { validatePositionUpdate } from '../validator';

const prisma = new PrismaClient();
```

**Implementation Notes**:
- Use existing Prisma client instance (already imported in the file)
- Validation errors should propagate naturally (no try-catch needed for validation)
- Reference validation (company/interviewFlow) should throw descriptive errors
- Merge strategy: Spread existing position data, then override with updateData
- The `Position.save()` method already handles the database update operation
- Error messages must be in English

**Example Service Logic**:
```typescript
export const updatePositionService = async (positionId: number, updateData: any): Promise<any> => {
    // Verify position exists
    const existingPosition = await Position.findOne(positionId);
    if (!existingPosition) {
        throw new Error('Position not found');
    }

    // Validate update data
    validatePositionUpdate(updateData);

    // Validate company reference if provided
    if (updateData.companyId !== undefined) {
        const company = await prisma.company.findUnique({
            where: { id: updateData.companyId }
        });
        if (!company) {
            throw new Error('Company not found');
        }
    }

    // Validate interview flow reference if provided
    if (updateData.interviewFlowId !== undefined) {
        const interviewFlow = await prisma.interviewFlow.findUnique({
            where: { id: updateData.interviewFlowId }
        });
        if (!interviewFlow) {
            throw new Error('Interview flow not found');
        }
    }

    // Merge existing data with updates
    const mergedData = {
        ...existingPosition,
        ...updateData,
        id: positionId // Ensure ID is preserved
    };

    // Create Position instance and save
    const position = new Position(mergedData);
    const updatedPosition = await position.save();

    return updatedPosition;
};
```

**Business Rules**:
- Position must exist before update
- Referenced entities (company, interviewFlow) must exist if IDs are provided
- Only provided fields are updated (partial update support)
- All validation rules from Step 1 are enforced

---

### Step 3: Create Controller Method

**File**: `backend/src/presentation/controllers/positionController.ts`

**Action**: Implement HTTP request/response handling for position updates

**Function Signature**:
```typescript
export const updatePosition = async (req: Request, res: Response): Promise<void>
```

**Implementation Steps**:

1. Add the new controller function after existing controller functions
2. Extract position ID from `req.params.id` and parse to integer
3. Validate position ID is a valid number (not NaN)
4. Validate request body is not empty or null
5. Call `updatePositionService(positionId, req.body)`
6. On success, return 200 status with success message and updated position data
7. Handle validation errors with 400 status
8. Handle "Position not found" errors with 404 status
9. Handle "Company not found" or "Interview flow not found" errors with 400 status
10. Handle unexpected errors with 500 status
11. Ensure all error responses include descriptive messages

**Dependencies**:
```typescript
import { Request, Response } from 'express';
import { updatePositionService } from '../../application/services/positionService';
```

**Implementation Notes**:
- Use try-catch for error handling
- Check error messages to determine appropriate HTTP status codes
- Response format must be consistent with existing controllers
- ID validation should occur before calling service layer
- Empty body validation prevents unnecessary service calls
- All error messages must be in English

**Example Controller Logic**:
```typescript
export const updatePosition = async (req: Request, res: Response): Promise<void> => {
    try {
        // Parse and validate position ID
        const positionId = parseInt(req.params.id);
        if (isNaN(positionId)) {
            res.status(400).json({
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number'
            });
            return;
        }

        // Validate request body is not empty
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({
                message: 'No data provided for update',
                error: 'Request body cannot be empty'
            });
            return;
        }

        // Call service layer
        const updatedPosition = await updatePositionService(positionId, req.body);

        // Success response
        res.status(200).json({
            message: 'Position updated successfully',
            data: updatedPosition
        });
    } catch (error) {
        if (error instanceof Error) {
            // Position not found
            if (error.message === 'Position not found') {
                res.status(404).json({
                    message: 'Position not found',
                    error: error.message
                });
                return;
            }

            // Reference validation errors (company or interview flow not found)
            if (error.message === 'Company not found' || error.message === 'Interview flow not found') {
                res.status(400).json({
                    message: 'Invalid reference data',
                    error: error.message
                });
                return;
            }

            // Validation errors (from validatePositionUpdate)
            if (error.message.includes('must be') || 
                error.message.includes('cannot') || 
                error.message.includes('required') ||
                error.message.includes('Invalid')) {
                res.status(400).json({
                    message: 'Validation error',
                    error: error.message
                });
                return;
            }

            // Other errors
            res.status(500).json({
                message: 'Error updating position',
                error: error.message
            });
        } else {
            // Non-Error exceptions
            res.status(500).json({
                message: 'Error updating position',
                error: 'An unexpected error occurred'
            });
        }
    }
};
```

**Error Handling Strategy**:
- 400 (Bad Request): Invalid ID format, empty body, validation errors, invalid references
- 404 (Not Found): Position does not exist
- 500 (Internal Server Error): Unexpected errors, database failures

---

### Step 4: Add Route

**File**: `backend/src/routes/positionRoutes.ts`

**Action**: Register the PUT endpoint for position updates

**Implementation Steps**:

1. Import the `updatePosition` controller function
2. Add PUT route definition for `/:id` path
3. Ensure route is registered before parameterized routes to avoid conflicts

**Dependencies**:
```typescript
import { updatePosition } from '../presentation/controllers/positionController';
```

**Implementation Notes**:
- Route must be placed after the GET `/:id` route to maintain proper routing order
- Express routes are matched in order, so more specific routes should come first
- The route path is `/:id` to match RESTful conventions

**Example Route Configuration**:
```typescript
import { Router } from 'express';
import { 
    getCandidatesByPosition, 
    getInterviewFlowByPosition, 
    getAllPositions, 
    getCandidateNamesByPosition, 
    getPositionById,
    updatePosition  // Add this import
} from '../presentation/controllers/positionController';

const router = Router();

router.get('/', getAllPositions);
router.get('/:id', getPositionById);
router.put('/:id', updatePosition);  // Add this route
router.get('/:id/candidates', getCandidatesByPosition);
router.get('/:id/candidates/names', getCandidateNamesByPosition);
router.get('/:id/interviewflow', getInterviewFlowByPosition);

export default router;
```

---

### Step 5: Write Comprehensive Tests at ALL Layers

**CRITICAL**: This step is MANDATORY and must include tests for ALL three layers. Testing only the controller creates false confidence.

#### Step 5.1: Validation Layer Tests

**File**: `backend/src/application/__tests__/validator.test.ts`

**Action**: Create comprehensive unit tests for `validatePositionUpdate` function

**Test Categories Required**:

1. **Valid Input Tests**
   - All fields valid
   - Partial updates (only some fields provided)
   - Optional fields omitted
   - Boundary values (exact max length, min values)

2. **Title Validation Tests**
   - Empty title
   - Null title
   - Title exceeding 100 characters
   - Non-string title
   - Whitespace-only title

3. **Status Validation Tests**
   - Invalid status value
   - Valid status values (Open, Contratado, Cerrado, Borrador)

4. **Salary Validation Tests**
   - Negative salaryMin
   - Negative salaryMax
   - salaryMin > salaryMax
   - Non-numeric salary values
   - Valid salary ranges

5. **Date Validation Tests**
   - Invalid date format
   - Past application deadline
   - Valid future date
   - Today as deadline (edge case)

6. **Boolean Validation Tests**
   - Non-boolean isVisible value
   - Valid true/false values

7. **Integer ID Validation Tests**
   - Negative companyId
   - Zero companyId
   - Non-integer companyId
   - Negative interviewFlowId
   - Zero interviewFlowId
   - Non-integer interviewFlowId

8. **String Field Validation Tests**
   - Empty required strings (description, location, jobDescription, employmentType)
   - Non-string values for string fields
   - Valid string values

9. **Optional Field Tests**
   - Optional fields with null/undefined
   - Optional fields with valid values
   - Non-string values for optional string fields

**Implementation Structure**:
```typescript
import { validatePositionUpdate } from '../validator';

describe('validatePositionUpdate', () => {
    describe('should_pass_validation_with_valid_data', () => {
        it('should not throw error with all valid fields', () => {
            const validData = {
                title: 'Senior Software Engineer',
                description: 'A great position',
                location: 'Madrid',
                jobDescription: 'Detailed description',
                status: 'Open',
                isVisible: true,
                salaryMin: 50000,
                salaryMax: 70000,
                employmentType: 'Full-time',
                applicationDeadline: new Date(Date.now() + 86400000).toISOString() // Tomorrow
            };
            
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });

        it('should not throw error with partial update (only status)', () => {
            const partialData = { status: 'Open' };
            expect(() => validatePositionUpdate(partialData)).not.toThrow();
        });

        it('should not throw error when optional fields are omitted', () => {
            const dataWithoutOptionals = {
                title: 'Developer',
                description: 'Job desc',
                location: 'Barcelona',
                jobDescription: 'Detailed job description'
            };
            expect(() => validatePositionUpdate(dataWithoutOptionals)).not.toThrow();
        });
    });

    describe('should_reject_invalid_title', () => {
        it('should throw error when title is empty string', () => {
            expect(() => validatePositionUpdate({ title: '' }))
                .toThrow('Title is required and must be a valid string');
        });

        it('should throw error when title exceeds 100 characters', () => {
            const longTitle = 'x'.repeat(101);
            expect(() => validatePositionUpdate({ title: longTitle }))
                .toThrow('Title cannot exceed 100 characters');
        });

        it('should throw error when title is not a string', () => {
            expect(() => validatePositionUpdate({ title: 123 }))
                .toThrow('Title is required and must be a valid string');
        });

        it('should throw error when title is whitespace only', () => {
            expect(() => validatePositionUpdate({ title: '   ' }))
                .toThrow('Title is required and must be a valid string');
        });

        it('should throw error when title is null', () => {
            expect(() => validatePositionUpdate({ title: null }))
                .toThrow('Title is required and must be a valid string');
        });
    });

    describe('should_reject_invalid_status', () => {
        it('should throw error for invalid status value', () => {
            expect(() => validatePositionUpdate({ status: 'InvalidStatus' }))
                .toThrow('Invalid status. Must be one of: Open, Contratado, Cerrado, Borrador');
        });

        it('should accept valid status: Open', () => {
            expect(() => validatePositionUpdate({ status: 'Open' })).not.toThrow();
        });

        it('should accept valid status: Contratado', () => {
            expect(() => validatePositionUpdate({ status: 'Contratado' })).not.toThrow();
        });

        it('should accept valid status: Cerrado', () => {
            expect(() => validatePositionUpdate({ status: 'Cerrado' })).not.toThrow();
        });

        it('should accept valid status: Borrador', () => {
            expect(() => validatePositionUpdate({ status: 'Borrador' })).not.toThrow();
        });
    });

    describe('should_reject_invalid_salary_values', () => {
        it('should throw error when salaryMin is negative', () => {
            expect(() => validatePositionUpdate({ salaryMin: -1000 }))
                .toThrow('Minimum salary must be a valid number greater than or equal to 0');
        });

        it('should throw error when salaryMax is negative', () => {
            expect(() => validatePositionUpdate({ salaryMax: -1000 }))
                .toThrow('Maximum salary must be a valid number greater than or equal to 0');
        });

        it('should throw error when salaryMin > salaryMax', () => {
            expect(() => validatePositionUpdate({ salaryMin: 80000, salaryMax: 60000 }))
                .toThrow('Minimum salary cannot be greater than maximum salary');
        });

        it('should throw error when salaryMin is not a number', () => {
            expect(() => validatePositionUpdate({ salaryMin: 'not-a-number' }))
                .toThrow('Minimum salary must be a valid number greater than or equal to 0');
        });

        it('should accept valid salary range', () => {
            expect(() => validatePositionUpdate({ salaryMin: 50000, salaryMax: 70000 }))
                .not.toThrow();
        });

        it('should accept salaryMin = 0', () => {
            expect(() => validatePositionUpdate({ salaryMin: 0 })).not.toThrow();
        });
    });

    describe('should_reject_invalid_application_deadline', () => {
        it('should throw error for invalid date format', () => {
            expect(() => validatePositionUpdate({ applicationDeadline: 'not-a-date' }))
                .toThrow('Invalid application deadline');
        });

        it('should throw error for past date', () => {
            const yesterday = new Date(Date.now() - 86400000);
            expect(() => validatePositionUpdate({ applicationDeadline: yesterday.toISOString() }))
                .toThrow('Application deadline cannot be in the past');
        });

        it('should accept future date', () => {
            const tomorrow = new Date(Date.now() + 86400000);
            expect(() => validatePositionUpdate({ applicationDeadline: tomorrow.toISOString() }))
                .not.toThrow();
        });
    });

    describe('should_reject_invalid_boolean_values', () => {
        it('should throw error when isVisible is not boolean', () => {
            expect(() => validatePositionUpdate({ isVisible: 'true' }))
                .toThrow('isVisible must be a boolean value');
        });

        it('should accept true for isVisible', () => {
            expect(() => validatePositionUpdate({ isVisible: true })).not.toThrow();
        });

        it('should accept false for isVisible', () => {
            expect(() => validatePositionUpdate({ isVisible: false })).not.toThrow();
        });
    });

    describe('should_reject_invalid_id_values', () => {
        it('should throw error when companyId is negative', () => {
            expect(() => validatePositionUpdate({ companyId: -1 }))
                .toThrow('companyId must be a positive integer');
        });

        it('should throw error when companyId is zero', () => {
            expect(() => validatePositionUpdate({ companyId: 0 }))
                .toThrow('companyId must be a positive integer');
        });

        it('should throw error when companyId is not an integer', () => {
            expect(() => validatePositionUpdate({ companyId: 1.5 }))
                .toThrow('companyId must be a positive integer');
        });

        it('should throw error when interviewFlowId is negative', () => {
            expect(() => validatePositionUpdate({ interviewFlowId: -1 }))
                .toThrow('interviewFlowId must be a positive integer');
        });

        it('should accept valid positive integer IDs', () => {
            expect(() => validatePositionUpdate({ companyId: 1, interviewFlowId: 2 }))
                .not.toThrow();
        });
    });

    describe('should_reject_invalid_string_fields', () => {
        it('should throw error when description is empty', () => {
            expect(() => validatePositionUpdate({ description: '' }))
                .toThrow('description is required and must be a valid string');
        });

        it('should throw error when location is not a string', () => {
            expect(() => validatePositionUpdate({ location: 123 }))
                .toThrow('location is required and must be a valid string');
        });

        it('should throw error when jobDescription is whitespace only', () => {
            expect(() => validatePositionUpdate({ jobDescription: '   ' }))
                .toThrow('jobDescription is required and must be a valid string');
        });

        it('should throw error when employmentType is empty', () => {
            expect(() => validatePositionUpdate({ employmentType: '' }))
                .toThrow('employmentType is required and must be a valid string');
        });
    });

    describe('should_validate_optional_string_fields', () => {
        it('should throw error when requirements is not a string', () => {
            expect(() => validatePositionUpdate({ requirements: 123 }))
                .toThrow('requirements must be a string');
        });

        it('should accept empty string for optional fields', () => {
            expect(() => validatePositionUpdate({ requirements: '', benefits: '' }))
                .not.toThrow();
        });

        it('should accept valid strings for optional fields', () => {
            expect(() => validatePositionUpdate({
                requirements: 'Some requirements',
                responsibilities: 'Some responsibilities',
                benefits: 'Some benefits',
                companyDescription: 'Company info',
                contactInfo: 'contact@example.com'
            })).not.toThrow();
        });
    });
});
```

**Coverage Target**: >90% for the `validatePositionUpdate` function

---

#### Step 5.2: Service Layer Tests

**File**: `backend/src/application/services/__tests__/positionService.test.ts`

**Action**: Create comprehensive unit tests for `updatePositionService` function with mocked dependencies

**Test Categories Required**:

1. **Successful Update Tests**
   - Update with all valid fields
   - Partial update (only some fields)
   - Update with valid companyId
   - Update with valid interviewFlowId
   - Update salary ranges
   - Update status field
   - Update boolean field
   - Update date field

2. **Position Not Found Tests**
   - Invalid position ID
   - Non-existent position

3. **Validation Error Tests**
   - Invalid field values trigger validation errors
   - Verify validator is called

4. **Reference Validation Tests**
   - Non-existent companyId
   - Non-existent interviewFlowId
   - Valid company reference
   - Valid interview flow reference

5. **Data Merging Tests**
   - Partial update preserves unchanged fields
   - Complete update replaces all fields
   - ID is preserved during merge

6. **Error Propagation Tests**
   - Database errors are propagated
   - Validation errors are propagated
   - Reference validation errors are propagated

**Mock Strategy**:
```typescript
jest.mock('@prisma/client');
jest.mock('../../domain/models/Position');
jest.mock('../validator');
```

**Implementation Structure**:
```typescript
import { updatePositionService } from '../positionService';
import { Position } from '../../../domain/models/Position';
import { validatePositionUpdate } from '../../validator';
import { PrismaClient } from '@prisma/client';

// Mock all dependencies
jest.mock('@prisma/client');
jest.mock('../../../domain/models/Position');
jest.mock('../../validator');

describe('PositionService - updatePositionService', () => {
    let mockPrisma: any;
    let mockPosition: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Prisma client
        mockPrisma = {
            company: {
                findUnique: jest.fn()
            },
            interviewFlow: {
                findUnique: jest.fn()
            }
        };
        (PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma);

        // Mock Position model
        mockPosition = {
            id: 1,
            title: 'Old Title',
            description: 'Old Description',
            location: 'Old Location',
            jobDescription: 'Old Job Description',
            status: 'Borrador',
            isVisible: false,
            companyId: 1,
            interviewFlowId: 1,
            save: jest.fn()
        };
    });

    describe('should_update_position_successfully', () => {
        it('should update position with all valid fields', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                title: 'New Title',
                description: 'New Description',
                status: 'Open',
                isVisible: true,
                salaryMin: 50000,
                salaryMax: 70000
            };
            const expectedUpdatedPosition = { ...mockPosition, ...updateData };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPosition.save.mockResolvedValue(expectedUpdatedPosition);

            // Mock Position constructor
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                return { ...data, save: mockPosition.save };
            });

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockPosition.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedUpdatedPosition);
        });

        it('should update position with partial data (only status)', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { status: 'Open' };
            const expectedUpdatedPosition = { ...mockPosition, status: 'Open' };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPosition.save.mockResolvedValue(expectedUpdatedPosition);
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                return { ...data, save: mockPosition.save };
            });

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(result.title).toBe('Old Title'); // Unchanged
            expect(result.status).toBe('Open'); // Updated
        });

        it('should validate companyId exists when provided', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { companyId: 2 };
            const mockCompany = { id: 2, name: 'New Company' };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPrisma.company.findUnique.mockResolvedValue(mockCompany);
            mockPosition.save.mockResolvedValue({ ...mockPosition, companyId: 2 });
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                return { ...data, save: mockPosition.save };
            });

            // Act
            await updatePositionService(positionId, updateData);

            // Assert
            expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
                where: { id: 2 }
            });
        });

        it('should validate interviewFlowId exists when provided', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { interviewFlowId: 3 };
            const mockInterviewFlow = { id: 3, description: 'New Flow' };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPrisma.interviewFlow.findUnique.mockResolvedValue(mockInterviewFlow);
            mockPosition.save.mockResolvedValue({ ...mockPosition, interviewFlowId: 3 });
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                return { ...data, save: mockPosition.save };
            });

            // Act
            await updatePositionService(positionId, updateData);

            // Assert
            expect(mockPrisma.interviewFlow.findUnique).toHaveBeenCalledWith({
                where: { id: 3 }
            });
        });
    });

    describe('should_throw_error_when_position_not_found', () => {
        it('should throw "Position not found" error when position does not exist', async () => {
            // Arrange
            const positionId = 999;
            const updateData = { title: 'New Title' };

            (Position.findOne as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Position not found');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).not.toHaveBeenCalled();
        });
    });

    describe('should_throw_error_for_validation_failures', () => {
        it('should propagate validation error from validator', async () => {
            // Arrange
            const positionId = 1;
            const invalidData = { salaryMin: -1000 };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {
                throw new Error('Minimum salary must be a valid number greater than or equal to 0');
            });

            // Act & Assert
            await expect(updatePositionService(positionId, invalidData))
                .rejects
                .toThrow('Minimum salary must be a valid number greater than or equal to 0');

            expect(validatePositionUpdate).toHaveBeenCalledWith(invalidData);
        });
    });

    describe('should_throw_error_for_invalid_references', () => {
        it('should throw "Company not found" when companyId does not exist', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { companyId: 999 };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPrisma.company.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Company not found');

            expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
                where: { id: 999 }
            });
        });

        it('should throw "Interview flow not found" when interviewFlowId does not exist', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { interviewFlowId: 999 };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPrisma.interviewFlow.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Interview flow not found');

            expect(mockPrisma.interviewFlow.findUnique).toHaveBeenCalledWith({
                where: { id: 999 }
            });
        });
    });

    describe('should_merge_data_correctly', () => {
        it('should preserve unchanged fields when doing partial update', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { status: 'Open' };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            
            let mergedData: any;
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                mergedData = data;
                return { ...data, save: jest.fn().mockResolvedValue(data) };
            });

            // Act
            await updatePositionService(positionId, updateData);

            // Assert
            expect(mergedData.title).toBe('Old Title'); // Preserved
            expect(mergedData.description).toBe('Old Description'); // Preserved
            expect(mergedData.status).toBe('Open'); // Updated
            expect(mergedData.id).toBe(positionId); // ID preserved
        });
    });

    describe('should_handle_errors_gracefully', () => {
        it('should propagate database errors', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { title: 'New Title' };

            (Position.findOne as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Database connection failed');
        });
    });
});
```

**Coverage Target**: >90% for the `updatePositionService` function

---

#### Step 5.3: Controller Layer Tests

**File**: `backend/src/presentation/controllers/__tests__/positionController.test.ts`

**Action**: Create comprehensive unit tests for `updatePosition` controller with mocked service layer

**Test Categories Required**:

1. **Successful Update Tests**
   - Valid data returns 200 status
   - Response includes success message
   - Response includes updated position data
   - Partial update succeeds
   - Full update succeeds

2. **Invalid ID Format Tests**
   - Non-numeric ID returns 400
   - Negative ID returns 400
   - Zero ID returns 400
   - NaN ID returns 400

3. **Empty Body Tests**
   - Empty object returns 400
   - Null body returns 400
   - No data provided returns 400

4. **Not Found Tests**
   - Non-existent position returns 404
   - Proper error message in response

5. **Validation Error Tests**
   - Invalid title returns 400
   - Invalid status returns 400
   - Salary validation errors return 400
   - Date validation errors return 400

6. **Reference Validation Tests**
   - Invalid companyId returns 400
   - Invalid interviewFlowId returns 400
   - Error message indicates "Invalid reference data"

7. **Server Error Tests**
   - Unexpected errors return 500
   - Non-Error exceptions return 500
   - Database errors return 500

8. **Response Format Tests**
   - Success response has correct structure
   - Error response has correct structure
   - All responses include message field

**Mock Strategy**:
```typescript
jest.mock('../../application/services/positionService');
```

**Implementation Structure**:
```typescript
import { Request, Response } from 'express';
import { updatePosition } from '../positionController';
import { updatePositionService } from '../../../application/services/positionService';

// Mock the service layer
jest.mock('../../../application/services/positionService');

describe('PositionController - updatePosition', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });

        mockRequest = {
            params: { id: '1' },
            body: {}
        };

        mockResponse = {
            status: mockStatus,
            json: mockJson
        };
    });

    describe('should_update_position_successfully', () => {
        it('should return 200 with success message when update succeeds', async () => {
            // Arrange
            const updateData = { title: 'New Title', status: 'Open' };
            const updatedPosition = { id: 1, ...updateData };

            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;

            (updatePositionService as jest.Mock).mockResolvedValue(updatedPosition);

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(updatePositionService).toHaveBeenCalledWith(1, updateData);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Position updated successfully',
                data: updatedPosition
            });
        });

        it('should handle partial update with only status field', async () => {
            // Arrange
            const updateData = { status: 'Open' };
            const updatedPosition = { id: 1, title: 'Existing Title', status: 'Open' };

            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;

            (updatePositionService as jest.Mock).mockResolvedValue(updatedPosition);

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(updatePositionService).toHaveBeenCalledWith(1, updateData);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Position updated successfully',
                data: updatedPosition
            });
        });

        it('should handle update with all fields', async () => {
            // Arrange
            const updateData = {
                title: 'Senior Developer',
                description: 'New description',
                location: 'Barcelona',
                jobDescription: 'Detailed job description',
                status: 'Open',
                isVisible: true,
                salaryMin: 60000,
                salaryMax: 80000,
                employmentType: 'Full-time',
                companyId: 1,
                interviewFlowId: 1
            };
            const updatedPosition = { id: 1, ...updateData };

            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;

            (updatePositionService as jest.Mock).mockResolvedValue(updatedPosition);

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(updatePositionService).toHaveBeenCalledWith(1, updateData);
            expect(mockStatus).toHaveBeenCalledWith(200);
        });
    });

    describe('should_return_400_for_invalid_position_id', () => {
        it('should return 400 when position ID is not a number', async () => {
            // Arrange
            mockRequest.params = { id: 'invalid' };
            mockRequest.body = { title: 'New Title' };

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number'
            });
            expect(updatePositionService).not.toHaveBeenCalled();
        });

        it('should return 400 when position ID is NaN', async () => {
            // Arrange
            mockRequest.params = { id: 'abc123' };
            mockRequest.body = { title: 'New Title' };

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number'
            });
        });

        it('should accept negative position ID and let service handle it', async () => {
            // Arrange
            mockRequest.params = { id: '-1' };
            mockRequest.body = { title: 'New Title' };

            (updatePositionService as jest.Mock).mockResolvedValue({ id: -1, title: 'New Title' });

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(updatePositionService).toHaveBeenCalledWith(-1, { title: 'New Title' });
        });

        it('should accept zero position ID and let service handle it', async () => {
            // Arrange
            mockRequest.params = { id: '0' };
            mockRequest.body = { title: 'New Title' };

            (updatePositionService as jest.Mock).mockResolvedValue({ id: 0, title: 'New Title' });

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(updatePositionService).toHaveBeenCalledWith(0, { title: 'New Title' });
        });
    });

    describe('should_return_400_for_empty_request_body', () => {
        it('should return 400 when request body is empty object', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = {};

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'No data provided for update',
                error: 'Request body cannot be empty'
            });
            expect(updatePositionService).not.toHaveBeenCalled();
        });

        it('should return 400 when request body is null', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = null;

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'No data provided for update',
                error: 'Request body cannot be empty'
            });
        });

        it('should return 400 when request body is undefined', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = undefined;

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'No data provided for update',
                error: 'Request body cannot be empty'
            });
        });
    });

    describe('should_return_404_when_position_not_found', () => {
        it('should return 404 when position does not exist', async () => {
            // Arrange
            mockRequest.params = { id: '999' };
            mockRequest.body = { title: 'New Title' };

            (updatePositionService as jest.Mock).mockRejectedValue(
                new Error('Position not found')
            );

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Position not found',
                error: 'Position not found'
            });
        });
    });

    describe('should_return_400_for_validation_errors', () => {
        it('should return 400 when title is empty', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = { title: '' };

            (updatePositionService as jest.Mock).mockRejectedValue(
                new Error('Title is required and must be a valid string')
            );

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Validation error',
                error: 'Title is required and must be a valid string'
            });
        });

        it('should return 400 when status is invalid', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = { status: 'InvalidStatus' };

            (updatePositionService as jest.Mock).mockRejectedValue(
                new Error('Invalid status. Must be one of: Open, Contratado, Cerrado, Borrador')
            );

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Validation error',
                error: 'Invalid status. Must be one of: Open, Contratado, Cerrado, Borrador'
            });
        });

        it('should return 400 when salaryMin > salaryMax', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = { salaryMin: 80000, salaryMax: 60000 };

            (updatePositionService as jest.Mock).mockRejectedValue(
                new Error('Minimum salary cannot be greater than maximum salary')
            );

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Validation error',
                error: 'Minimum salary cannot be greater than maximum salary'
            });
        });

        it('should return 400 when applicationDeadline is in the past', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = { applicationDeadline: '2020-01-01' };

            (updatePositionService as jest.Mock).mockRejectedValue(
                new Error('Application deadline cannot be in the past')
            );

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Validation error',
                error: 'Application deadline cannot be in the past'
            });
        });
    });

    describe('should_return_400_for_invalid_reference_data', () => {
        it('should return 400 when companyId does not exist', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = { companyId: 999 };

            (updatePositionService as jest.Mock).mockRejectedValue(
                new Error('Company not found')
            );

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Invalid reference data',
                error: 'Company not found'
            });
        });

        it('should return 400 when interviewFlowId does not exist', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = { interviewFlowId: 999 };

            (updatePositionService as jest.Mock).mockRejectedValue(
                new Error('Interview flow not found')
            );

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Invalid reference data',
                error: 'Interview flow not found'
            });
        });
    });

    describe('should_return_500_for_server_errors', () => {
        it('should return 500 for unexpected errors', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = { title: 'New Title' };

            (updatePositionService as jest.Mock).mockRejectedValue(
                new Error('Database connection failed')
            );

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Error updating position',
                error: 'Database connection failed'
            });
        });

        it('should return 500 for non-Error exceptions', async () => {
            // Arrange
            mockRequest.params = { id: '1' };
            mockRequest.body = { title: 'New Title' };

            (updatePositionService as jest.Mock).mockRejectedValue('String error');

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Error updating position',
                error: 'An unexpected error occurred'
            });
        });
    });

    describe('should_handle_large_position_ids', () => {
        it('should handle very large position IDs', async () => {
            // Arrange
            const largeId = 2147483647; // Max 32-bit integer
            mockRequest.params = { id: largeId.toString() };
            mockRequest.body = { title: 'New Title' };

            (updatePositionService as jest.Mock).mockResolvedValue({
                id: largeId,
                title: 'New Title'
            });

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(updatePositionService).toHaveBeenCalledWith(largeId, { title: 'New Title' });
            expect(mockStatus).toHaveBeenCalledWith(200);
        });
    });

    describe('should_handle_complex_update_data', () => {
        it('should handle update with multiple fields including optional ones', async () => {
            // Arrange
            const complexUpdateData = {
                title: 'Senior Software Engineer',
                description: 'Updated description',
                status: 'Open',
                isVisible: true,
                salaryMin: 60000,
                salaryMax: 80000,
                requirements: 'Updated requirements',
                responsibilities: 'Updated responsibilities',
                benefits: 'Updated benefits'
            };

            mockRequest.params = { id: '1' };
            mockRequest.body = complexUpdateData;

            (updatePositionService as jest.Mock).mockResolvedValue({
                id: 1,
                ...complexUpdateData
            });

            // Act
            await updatePosition(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(updatePositionService).toHaveBeenCalledWith(1, complexUpdateData);
            expect(mockStatus).toHaveBeenCalledWith(200);
        });
    });
});
```

**Coverage Target**: >90% for the `updatePosition` controller function

---

### Step 6: Update Technical Documentation

**Action**: Review and update technical documentation according to changes made

**Implementation Steps**:

1. **Review Changes**: Analyze all code changes made during implementation
   - New validation function: `validatePositionUpdate`
   - New service function: `updatePositionService`
   - New controller function: `updatePosition`
   - New route: `PUT /positions/:id`

2. **Identify Documentation Files**: Determine which documentation files need updates
   - `openspec/specs/api-spec.yml` - Add PUT /positions/:id endpoint specification
   - `openspec/specs/data-model.md` - Verify Position model documentation is current (no changes needed)

3. **Update API Specification** (`openspec/specs/api-spec.yml`):
   
   Add the following endpoint specification after the `GET /positions/{id}` endpoint:

   ```yaml
   /positions/{id}:
     put:
       summary: Update position
       description: Update an existing position with new information. Supports partial updates where only provided fields are updated.
       tags:
         - Positions
       parameters:
         - in: path
           name: id
           required: true
           schema:
             type: integer
           description: Position ID
       requestBody:
         required: true
         content:
           application/json:
             schema:
               $ref: '#/components/schemas/UpdatePositionRequest'
       responses:
         '200':
           description: Position updated successfully
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/UpdatePositionResponse'
         '400':
           description: Validation error, invalid ID format, or invalid reference data
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/ErrorResponse'
         '404':
           description: Position not found
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/ErrorResponse'
         '500':
           description: Internal server error
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/ErrorResponse'
   ```

   Add the following schema definitions to the `components/schemas` section:

   ```yaml
   UpdatePositionRequest:
     type: object
     properties:
       title:
         type: string
         maxLength: 100
         description: Position title
       description:
         type: string
         description: Brief position description
       location:
         type: string
         description: Job location
       jobDescription:
         type: string
         description: Detailed job description
       status:
         type: string
         enum: [Open, Contratado, Cerrado, Borrador]
         description: Position status
       isVisible:
         type: boolean
         description: Whether position is visible to candidates
       requirements:
         type: string
         nullable: true
         description: Position requirements
       responsibilities:
         type: string
         nullable: true
         description: Position responsibilities
       salaryMin:
         type: number
         minimum: 0
         nullable: true
         description: Minimum salary
       salaryMax:
         type: number
         minimum: 0
         nullable: true
         description: Maximum salary (must be >= salaryMin)
       employmentType:
         type: string
         nullable: true
         description: Type of employment
       benefits:
         type: string
         nullable: true
         description: Position benefits
       companyDescription:
         type: string
         nullable: true
         description: Company description
       applicationDeadline:
         type: string
         format: date-time
         nullable: true
         description: Application deadline (must be future date)
       contactInfo:
         type: string
         nullable: true
         description: Contact information
       companyId:
         type: integer
         minimum: 1
         description: Associated company ID
       interviewFlowId:
         type: integer
         minimum: 1
         description: Associated interview flow ID
     description: All fields are optional for partial updates. Only provided fields will be updated.

   UpdatePositionResponse:
     type: object
     properties:
       message:
         type: string
         example: "Position updated successfully"
       data:
         $ref: '#/components/schemas/Position'
     required:
       - message
       - data
   ```

4. **Verify Data Model Documentation** (`openspec/specs/data-model.md`):
   - Review Position model section (lines 157-192)
   - Confirm all fields match implementation (✓ already correct)
   - Confirm validation rules are documented (✓ already documented)
   - No changes needed to data model documentation

5. **Report Updates**:
   - Document which files were updated
   - List specific changes made to each file

**References**:
- Follow process described in `openspec/specs/documentation-standards.mdc`
- All documentation must be written in English

**Notes**: 
- This step is MANDATORY before considering the implementation complete
- Do not skip documentation updates
- Ensure consistency between code implementation and API documentation
- All validation rules and error responses must be accurately documented

---

## Implementation Order

1. **Step 0**: Create Feature Branch (`feature/SCRUM-10-backend`)
2. **Step 1**: Create Validation Function (`validatePositionUpdate` in `validator.ts`)
3. **Step 2**: Create Service Method (`updatePositionService` in `positionService.ts`)
4. **Step 3**: Create Controller Method (`updatePosition` in `positionController.ts`)
5. **Step 4**: Add Route (`PUT /:id` in `positionRoutes.ts`)
6. **Step 5**: Write Comprehensive Tests at ALL Layers
   - **Step 5.1**: Validation Layer Tests (`__tests__/validator.test.ts`)
   - **Step 5.2**: Service Layer Tests (`__tests__/positionService.test.ts`)
   - **Step 5.3**: Controller Layer Tests (`__tests__/positionController.test.ts`)
7. **Step 6**: Update Technical Documentation (`api-spec.yml`)

**Critical Order Notes**:
- Steps 1-4 must be completed sequentially (dependencies between layers)
- Step 5 (tests) must be completed AFTER implementation code (Steps 1-4)
- All three test suites (5.1, 5.2, 5.3) must be completed
- Step 6 (documentation) must be completed LAST

---

## Testing Checklist

After implementation, verify the following:

### Unit Tests
- [ ] Validation layer tests pass with >90% coverage
- [ ] Service layer tests pass with >90% coverage
- [ ] Controller layer tests pass with >90% coverage
- [ ] All test suites run without errors: `npm test`
- [ ] Coverage report meets threshold: `npm run test:coverage`

### Manual Testing
- [ ] Valid update with all fields succeeds
- [ ] Partial update (only one field) succeeds
- [ ] Invalid position ID returns 400
- [ ] Non-existent position returns 404
- [ ] Invalid status value returns 400 with descriptive error
- [ ] salaryMin > salaryMax returns 400
- [ ] Past applicationDeadline returns 400
- [ ] Non-existent companyId returns 400
- [ ] Non-existent interviewFlowId returns 400
- [ ] Empty request body returns 400
- [ ] Successful update preserves unchanged fields

### Integration Testing
- [ ] API endpoint accessible via HTTP client (Postman, curl)
- [ ] Request/response format matches API specification
- [ ] Database updated correctly after successful request
- [ ] Error responses include appropriate status codes and messages

### Regression Testing
- [ ] Existing position endpoints still work (GET /positions, GET /positions/:id)
- [ ] No breaking changes to existing functionality
- [ ] All existing tests still pass

---

## Error Response Format

All error responses follow this consistent structure:

```json
{
  "message": "Error category description",
  "error": "Specific error details"
}
```

### HTTP Status Code Mapping

**400 Bad Request**
- Invalid position ID format
- Empty request body
- Validation errors (invalid field values)
- Invalid reference data (company or interview flow not found)

**404 Not Found**
- Position does not exist

**500 Internal Server Error**
- Unexpected errors
- Database connection failures
- Non-Error exceptions

### Example Error Responses

**Invalid Position ID (400)**:
```json
{
  "message": "Invalid position ID format",
  "error": "Position ID must be a valid number"
}
```

**Position Not Found (404)**:
```json
{
  "message": "Position not found",
  "error": "Position not found"
}
```

**Validation Error (400)**:
```json
{
  "message": "Validation error",
  "error": "Minimum salary cannot be greater than maximum salary"
}
```

**Invalid Reference (400)**:
```json
{
  "message": "Invalid reference data",
  "error": "Company not found"
}
```

**Server Error (500)**:
```json
{
  "message": "Error updating position",
  "error": "Database connection failed"
}
```

---

## Partial Update Support

The implementation supports partial updates, meaning:

1. **Only Provided Fields Are Updated**
   - If request body contains only `{ "status": "Open" }`, only status is updated
   - All other fields remain unchanged

2. **Validation Applies Only to Provided Fields**
   - `validatePositionUpdate` checks field value only if field is present
   - Missing fields are not validated (they remain unchanged)

3. **Full Updates Also Supported**
   - Request can include all fields for a complete update
   - Any combination of fields can be updated in a single request

4. **Data Merging Strategy**
   - Existing position data is retrieved from database
   - Update data is merged with existing data using spread operator
   - Merged data is passed to Position domain model for saving

5. **ID Preservation**
   - Position ID is always preserved and cannot be changed
   - ID is explicitly set during data merging

---

## Dependencies

### External Libraries
- **Express.js**: Web framework for HTTP handling (already installed)
- **Prisma**: ORM for database operations (already installed)
- **Jest**: Testing framework (already installed)
- **TypeScript**: Type-safe development (already installed)

### Internal Dependencies
- **Domain Model**: `Position.ts` (already implemented with `save()` and `findOne()` methods)
- **Prisma Client**: Database client (already configured)
- **Validation Utilities**: Add new validation function to existing `validator.ts`
- **Existing Services**: Follow patterns from `candidateService.ts` and existing `positionService.ts`

### Database Requirements
- PostgreSQL database (already running via Docker)
- Prisma schema already includes all required Position fields
- No database migrations needed

---

## Notes

### Important Reminders

1. **Language Requirement**: All code, comments, error messages, and documentation MUST be in English (per `backend-standards.mdc`)

2. **Testing Is Not Optional**: Comprehensive testing at ALL layers (validation, service, controller) is REQUIRED before the feature is considered complete

3. **Error Messages**: Use descriptive English error messages that clearly indicate what went wrong and how to fix it

4. **Validation Strategy**: Validation only occurs for fields that are present in the update data (`!== undefined`), enabling partial updates

5. **Reference Validation**: Always validate that referenced entities (company, interviewFlow) exist before updating

6. **Status Values**: Valid status values are `Open`, `Contratado`, `Cerrado`, `Borrador` (must match Prisma enum)

### Business Rules

1. **Position Existence**: Position must exist before it can be updated
2. **Company Reference**: If companyId is provided, company must exist in database
3. **Interview Flow Reference**: If interviewFlowId is provided, interview flow must exist in database
4. **Salary Range**: If both salaryMin and salaryMax are provided, salaryMin cannot exceed salaryMax
5. **Application Deadline**: If provided, applicationDeadline must be a future date
6. **Partial Updates**: Any combination of fields can be updated; missing fields remain unchanged
7. **Required Field Validation**: If a required field is provided in update, it must be valid (cannot be empty)

### Testing Requirements

1. **Minimum Coverage**: 90% coverage threshold across all layers
2. **Test Independence**: Each test must be independent and isolated
3. **Mock All Dependencies**: Use appropriate mocking for each layer
4. **AAA Pattern**: All tests must follow Arrange-Act-Assert pattern
5. **Descriptive Names**: Test names must clearly describe the scenario and expected outcome

### Code Quality Standards

1. **TypeScript Strict Mode**: All code must compile without errors in strict mode
2. **ESLint Compliance**: No linting errors allowed
3. **Consistent Formatting**: Follow existing code style and formatting
4. **No Console Logs**: Use logger from `infrastructure/logger.ts` instead of console.log
5. **Error Handling**: Always handle errors gracefully with appropriate status codes

---

## Next Steps After Implementation

1. **Code Review**: Submit pull request for team review
2. **Integration Testing**: Test with frontend EditPosition component
3. **Performance Testing**: Verify response times meet requirements
4. **Security Review**: Ensure input validation prevents injection attacks
5. **Documentation Review**: Confirm API documentation is complete and accurate
6. **Deployment**: Deploy to development environment for QA testing
7. **Monitoring**: Set up logging and monitoring for the new endpoint

---

## Implementation Verification

Before considering the implementation complete, verify:

### Code Quality
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without warnings
- [ ] All code follows project coding standards
- [ ] All code, comments, and messages are in English
- [ ] No console.log statements (use logger instead)

### Functionality
- [ ] Validation function handles all field types correctly
- [ ] Service function merges data correctly for partial updates
- [ ] Controller function returns appropriate status codes
- [ ] Route is registered and accessible
- [ ] Partial updates work correctly
- [ ] Full updates work correctly

### Testing
- [ ] All validation layer tests pass
- [ ] All service layer tests pass
- [ ] All controller layer tests pass
- [ ] Test coverage is >90% for all layers
- [ ] All tests follow AAA pattern
- [ ] Mocks are used appropriately in each layer

### Integration
- [ ] Endpoint works with HTTP client (Postman/curl)
- [ ] Database updates correctly
- [ ] Error responses are properly formatted
- [ ] Existing functionality is not broken

### Documentation
- [ ] API specification updated with PUT /positions/:id endpoint
- [ ] Request/response schemas documented
- [ ] Error responses documented
- [ ] Validation rules documented
- [ ] Data model documentation reviewed (no changes needed)

### Final Checks
- [ ] All tests pass: `npm test`
- [ ] Coverage meets threshold: `npm run test:coverage`
- [ ] Application builds successfully: `npm run build`
- [ ] No merge conflicts with main branch
- [ ] Feature branch is up to date with main
- [ ] Commit messages are descriptive and in English

---

**END OF IMPLEMENTATION PLAN**

This plan provides complete, step-by-step instructions for implementing the Position Update feature (SCRUM-10) following Domain-Driven Design principles, clean architecture patterns, and the project's established standards. The developer can implement this feature end-to-end autonomously using only this plan.

