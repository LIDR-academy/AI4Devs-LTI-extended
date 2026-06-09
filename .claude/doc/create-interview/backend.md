# Backend Implementation Plan: Create Interview (SCRUM-86)

## Overview

Add a `POST /candidates/{candidateId}/interviews` endpoint that creates a new interview for one of the candidate's existing applications. The `Interview` domain model already has the insert path via `save()` when `id` is absent — no schema migration is needed.

The implementation mirrors the existing edit/delete interview patterns exactly.

---

## Working Directory

All paths are relative to:
`/Users/alvaromoya/projects/versiones ejercicios/AI4Devs-LTI-before-position-update-openspec-raw-2026/.worktrees/SCRUM-86`

---

## Step 0: Create Feature Branch

```bash
git checkout -b feature/SCRUM-86-create-interview
```

Run from the worktree root. The worktree is already on branch `main` (not `SCRUM-86`). The sub-branch keeps the feature work isolated.

Mark tasks.md: 0.1, 0.2

---

## Step 1 + 2: Validator — Test File First, Then Implementation

### New test file

**Path**: `backend/src/application/__tests__/validator.createInterview.test.ts`

Follow the naming convention from the existing test files:
- `backend/src/application/__tests__/validator.test.ts` (existing — covers `validateInterviewUpdateData` and `validatePositionUpdateData`)
- `backend/src/application/validator.assignCandidate.test.ts` (existing flat sibling, not in `__tests__/`)

The new test file goes inside `__tests__/` to match the more recent pattern used by the interviewService tests.

**Import**:
```typescript
import { validateInterviewCreateData } from '../validator';
```

**Test structure** (use `describe` + `it` blocks, AAA pattern):

```typescript
describe('validateInterviewCreateData', () => {
  describe('Valid payloads', () => {
    it('accepts full valid payload (all fields)');        // task 1.1
    it('accepts minimal valid payload (required only)'); // task 1.2
  });

  describe('Missing required fields', () => {
    it('throws when applicationId is missing');    // task 1.3
    it('throws when interviewStepId is missing');  // task 1.4
    it('throws when employeeId is missing');       // task 1.5
    it('throws when interviewDate is missing');    // task 1.6
  });

  describe('Non-integer FK fields', () => {
    it('throws when applicationId is not a positive integer');   // task 1.7
    it('throws when interviewStepId is not a positive integer'); // task 1.7
    it('throws when employeeId is not a positive integer');      // task 1.7
  });

  describe('interviewDate format', () => {
    it('throws when interviewDate is not valid ISO 8601');  // task 1.8
    it('throws when interviewDate is date-only (no T)');   // task 1.8
  });

  describe('score validation', () => {
    it('throws when score < 0');   // task 1.9
    it('throws when score > 5');   // task 1.9
    it('accepts score = null');    // task 1.9
    it('accepts score = 0 and 5'); // boundary
  });

  describe('notes validation', () => {
    it('throws when notes.length > 1000');  // task 1.10
    it('accepts notes = null');             // task 1.10
    it('accepts notes = "" (empty ok)');
  });

  describe('result validation', () => {
    it('throws when result is an invalid string');          // task 1.11
    it('accepts result = "Pending"');                       // task 1.11
    it('accepts result = "Passed"');                        // task 1.11
    it('accepts result = "Failed"');                        // task 1.11
    it('accepts result = null');                            // task 1.11
    it('accepts result omitted (undefined)');
  });

  describe('allow-list (unexpected fields)', () => {
    it('throws when unexpected field is present');  // task 1.12
    it('throws when null/undefined body provided');
  });
});
```

All tests must be written BEFORE the implementation (TDD). They will fail on import since `validateInterviewCreateData` does not exist yet.

### Implementation in `validator.ts`

**Path**: `backend/src/application/validator.ts`

Add `validateInterviewCreateData` after `validateInterviewDeletion`. Export it.

**Allow-list constant** (place near the top of the create block):
```typescript
const INTERVIEW_CREATE_ALLOWED_FIELDS = [
  'applicationId',
  'interviewStepId',
  'employeeId',
  'interviewDate',
  'result',
  'score',
  'notes',
];
```

**Function signature**:
```typescript
export const validateInterviewCreateData = (data: any): void => { ... }
```

**Validation order** (mirrors `validateAssignCandidateToPositionData` for allow-list; mirrors `validateInterviewUpdateData` for field rules):

1. **Null/undefined/non-object body check** — throw `'Request body is required'`
2. **Allow-list check** — iterate `Object.keys(data)`, throw `'Unexpected field: {key}'` for any key not in `INTERVIEW_CREATE_ALLOWED_FIELDS`
3. **Required: `applicationId`** — undefined/null → `'applicationId is required'`; not positive integer → `'applicationId must be a positive integer'`
4. **Required: `interviewStepId`** — undefined/null → `'interviewStepId is required'`; not positive integer → `'interviewStepId must be a positive integer'`
5. **Required: `employeeId`** — undefined/null → `'employeeId is required'`; not positive integer → `'employeeId must be a positive integer'`
6. **Required: `interviewDate`** — undefined/null → `'interviewDate is required'`; not string or not ISO 8601 with T → `'interviewDate must be valid ISO 8601'` (reuse the existing `isValidISO8601DateTime` helper already in the file)
7. **Optional: `score`** — if present and not null: not integer or < 0 or > 5 → `'Score must be between 0 and 5'`
8. **Optional: `notes`** — if present and not null: not string → `'notes must be a string'`; length > 1000 → `'Notes must not exceed 1000 characters'`
9. **Optional: `result`** — if present and not null: not string → `'result must be a string'`; not in `INTERVIEW_RESULT_VALUES` → `'Invalid result value'` (reuse the existing constant `INTERVIEW_RESULT_VALUES = ['Pending', 'Passed', 'Failed']` already in the file)

**Important**: `isValidISO8601DateTime` and `INTERVIEW_RESULT_VALUES` already exist in `validator.ts`. Do NOT redefine them. The new function simply calls them.

---

## Step 3 + 4: Service — Test File First, Then Implementation

### New test file

**Path**: `backend/src/application/services/__tests__/interviewService.createInterview.test.ts`

Naming mirrors `interviewService.test.ts` (already contains `updateInterview` + `deleteInterview` tests).

**Mocking pattern** (copy exactly from `interviewService.test.ts`):
```typescript
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    interview: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('../../../domain/models/Candidate');
jest.mock('../../../domain/models/Application');
jest.mock('../../../domain/models/Position');
jest.mock('../../../domain/models/InterviewStep');
jest.mock('../../../domain/models/Employee');
jest.mock('../../../domain/models/Interview');
```

**Import**:
```typescript
import { createInterview } from '../interviewService';
import { Candidate } from '../../../domain/models/Candidate';
import { Application } from '../../../domain/models/Application';
import { Position } from '../../../domain/models/Position';
import { InterviewStep } from '../../../domain/models/InterviewStep';
import { Employee } from '../../../domain/models/Employee';
import { Interview } from '../../../domain/models/Interview';
import { PrismaClient } from '@prisma/client';
```

**Test structure**:

```typescript
describe('createInterview', () => {
  describe('Successful interview creation', () => {
    it('creates interview with all fields');                   // task 3.1
    it('creates interview with minimal fields — result defaults to Pending'); // task 3.2
  });

  describe('Candidate not found', () => {
    it('throws "Candidate not found" when candidateId does not exist'); // task 3.3
  });

  describe('Application not found / not owned', () => {
    it('throws "Application not found" when applicationId does not exist');          // task 3.4
    it('throws with not-found message when application belongs to different candidate'); // task 3.5
  });

  describe('Interview step validation', () => {
    it('throws "Interview step not found" when stepId does not exist');             // task 3.6
    it('throws step-not-in-flow message when step belongs to different flow');      // task 3.7
  });

  describe('Employee validation', () => {
    it('throws "Employee not found" when employeeId does not exist');  // task 3.8
    it('throws "Employee is not active" when isActive = false');        // task 3.9
  });

  describe('Persistence error', () => {
    it('re-throws database error from save()');  // task 3.10
  });
});
```

**Key mocking pattern for successful creation** (mirrors `updateInterview` tests):
```typescript
const mockCreatedData = { id: 99, applicationId: 1, ... };
const mockInterviewInstance = {
  save: jest.fn().mockResolvedValue(mockCreatedData),
};
(Interview as unknown as jest.Mock).mockImplementation(() => mockInterviewInstance);
```

The `new Interview({...})` constructor mock returns `mockInterviewInstance`, whose `save()` returns the created record. The service then wraps that in `new Interview(savedData)` — the second call also returns `mockInterviewInstance` (same mock).

**Verify in the success test**:
- `Candidate.findOne` called with `candidateId`
- `Application.findOne` called with `applicationId`
- `Position.findOne` called with `application.positionId`
- `InterviewStep.findOne` called with `interviewStepId`
- `Employee.findOne` called with `employeeId`
- `Interview` constructor called without `id` field
- `mockInterviewInstance.save` called once
- Returned object has expected shape

### Implementation in `interviewService.ts`

**Path**: `backend/src/application/services/interviewService.ts`

Add `createInterview` exported function. Do NOT touch existing `updateInterview` or `deleteInterview`.

**Signature**:
```typescript
export const createInterview = async (
  candidateId: number,
  interviewData: any
): Promise<Interview> => { ... }
```

**Business-rule validation order** (strict — fail before writing):

1. **Candidate exists**
   ```typescript
   const candidate = await Candidate.findOne(candidateId);
   if (!candidate) throw new Error('Candidate not found');
   ```

2. **Application exists AND belongs to candidate**
   ```typescript
   const application = await Application.findOne(interviewData.applicationId);
   if (!application) throw new Error('Application not found');
   if (application.candidateId !== candidateId) {
     throw new Error('Application does not belong to the specified candidate');
   }
   ```

3. **Position lookup** (needed for flow check)
   ```typescript
   const position = await Position.findOne(application.positionId);
   if (!position) throw new Error('Position not found');
   ```

4. **Interview step exists AND belongs to position's flow**
   ```typescript
   const interviewStep = await InterviewStep.findOne(interviewData.interviewStepId);
   if (!interviewStep) throw new Error('Interview step not found');
   if (interviewStep.interviewFlowId !== position.interviewFlowId) {
     throw new Error("Interview step does not belong to the position's interview flow");
   }
   ```

5. **Employee exists AND is active**
   ```typescript
   const employee = await Employee.findOne(interviewData.employeeId);
   if (!employee) throw new Error('Employee not found');
   if (!employee.isActive) throw new Error('Employee is not active');
   ```

6. **Apply `result` default**
   ```typescript
   const result = interviewData.result ?? 'Pending';
   ```

7. **Construct + save**
   ```typescript
   const newInterview = new Interview({
     applicationId: interviewData.applicationId,
     interviewStepId: interviewData.interviewStepId,
     employeeId: interviewData.employeeId,
     interviewDate: interviewData.interviewDate,
     result,
     score: interviewData.score,
     notes: interviewData.notes,
   });
   // Note: no `id` field — save() will branch to prisma.interview.create()
   ```

8. **Persist with try/catch**
   ```typescript
   try {
     const savedInterview = await newInterview.save();
     return new Interview(savedInterview);
   } catch (error: any) {
     throw new Error(error.message || 'Failed to create interview');
   }
   ```

**Important error messages** — controller maps these substrings to HTTP codes:
- `'not found'` (case-insensitive substring match) → 404
- `'is not active'` → 400
- `"does not belong to the position's interview flow"` → 400

The exact strings in the service MUST contain these substrings. Check the controller error mapping table in Step 6 before finalising.

---

## Step 5 + 6: Controller — Test File First, Then Implementation

### New test file

**Path**: `backend/src/presentation/controllers/__tests__/interviewController.createInterview.test.ts`

Mirrors the existing `interviewController.test.ts` structure. Note: the existing file covers both `updateInterviewController` and `deleteInterviewController` in one file. New tests go in a new sibling file.

**Mocking pattern**:
```typescript
jest.mock('../../../application/services/interviewService');
jest.mock('../../../application/validator');

import { createInterview } from '../../../application/services/interviewService';
import { validateInterviewCreateData } from '../../../application/validator';

const mockCreateInterview = createInterview as jest.MockedFunction<typeof createInterview>;
const mockValidateInterviewCreateData = validateInterviewCreateData as jest.MockedFunction<typeof validateInterviewCreateData>;
```

**Request/Response mock setup** (same as existing test):
```typescript
let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let mockJson: jest.Mock;
let mockStatus: jest.Mock;

beforeEach(() => {
  mockJson = jest.fn();
  mockStatus = jest.fn().mockReturnThis();
  mockResponse = { json: mockJson, status: mockStatus };
  mockRequest = { params: {}, body: {} };
  jest.clearAllMocks();
});
```

**Test structure**:

```typescript
describe('createInterviewController', () => {
  describe('Successful creation', () => {
    it('returns 201 with created interview on success');  // task 5.1
  });

  describe('Invalid candidateId format', () => {
    it('returns 400 when candidateId is not numeric');  // task 5.2
  });

  describe('Validator errors', () => {
    it('returns 400 when validator throws');  // task 5.3
  });

  describe('Not found errors', () => {
    it('returns 404 when service throws "Candidate not found"');              // task 5.4
    it('returns 404 when service throws "Application not found"');            // task 5.5
    it('returns 404 when service throws "does not belong to the specified"'); // task 5.5
    it('returns 404 when service throws "Interview step not found"');         // task 5.6
    it('returns 404 when service throws "Employee not found"');               // task 5.8
  });

  describe('Business rule errors (400)', () => {
    it('returns 400 when service throws step-not-in-flow message');  // task 5.7
    it('returns 400 when service throws "is not active" message');   // task 5.9
  });

  describe('Server errors', () => {
    it('returns 500 when service throws unexpected error');  // task 5.10
  });
});
```

**Success test specifics**:
```typescript
mockRequest.params = { candidateId: '1' };
mockRequest.body = { applicationId: 2, interviewStepId: 3, employeeId: 4, interviewDate: '2026-06-20T10:00:00Z' };
mockValidateInterviewCreateData.mockImplementation(() => {});
mockCreateInterview.mockResolvedValue(mockCreatedInterview as any);

// Verify:
expect(mockValidateInterviewCreateData).toHaveBeenCalledWith(mockRequest.body);
expect(mockCreateInterview).toHaveBeenCalledWith(1, mockRequest.body);
expect(mockStatus).toHaveBeenCalledWith(201);
expect(mockJson).toHaveBeenCalledWith(mockCreatedInterview);
```

### Implementation in `interviewController.ts`

**Path**: `backend/src/presentation/controllers/interviewController.ts`

Add `createInterviewController` to the existing file. Add these imports at the top:
```typescript
import { updateInterview, deleteInterview, createInterview } from '../../application/services/interviewService';
import { validateInterviewUpdateData, validateInterviewDeletion, validateInterviewCreateData } from '../../application/validator';
```

**Function**:
```typescript
export const createInterviewController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = parseInt(req.params.candidateId);
    if (isNaN(candidateId)) {
      return res.status(400).json({
        message: 'Validation error',
        error: 'Invalid candidate ID format',
      });
    }

    const interviewData = req.body;

    try {
      validateInterviewCreateData(interviewData);
    } catch (validationError: any) {
      return res.status(400).json({
        message: 'Validation error',
        error: validationError.message,
      });
    }

    const createdInterview = await createInterview(candidateId, interviewData);

    return res.status(201).json(createdInterview);
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Business rule violations → 400 (check BEFORE generic not-found)
      if (
        error.message.includes("does not belong to the position's interview flow") ||
        error.message.includes('is not active')
      ) {
        return res.status(400).json({
          message: 'Validation error',
          error: error.message,
        });
      }

      // Not found → 404
      if (error.message.includes('not found') || error.message.includes('does not belong')) {
        return res.status(404).json({
          message: 'Resource not found',
          error: error.message,
        });
      }

      // Unexpected → 500
      return res.status(500).json({
        message: 'Internal server error',
        error: 'An unexpected error occurred',
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
      error: 'An unexpected error occurred',
    });
  }
};
```

**Error mapping logic**: The 400-before-404 ordering is critical. The message `"does not belong to the position's interview flow"` contains `'does not belong'`, which would also match the 404 branch — so the 400 check MUST come first. This mirrors `updateInterviewController` exactly.

---

## Step 7: Route Registration + Integration Test

### `candidateRoutes.ts` change

**Path**: `backend/src/routes/candidateRoutes.ts`

1. Add `createInterviewController` to the import line:
   ```typescript
   import { updateInterviewController, deleteInterviewController, createInterviewController } from '../presentation/controllers/interviewController';
   ```

2. Register the route BEFORE the existing `/:id` route. Insert it alongside the other interview routes:
   ```typescript
   // Interview routes — must be before /:id to avoid route conflicts
   router.post('/:candidateId/interviews', createInterviewController);      // NEW
   router.patch('/:candidateId/interviews/:interviewId', updateInterviewController);
   router.delete('/:candidateId/interviews/:interviewId', deleteInterviewController);
   ```

   The `POST` route must come before `router.get('/:id', getCandidateById)`.

### Integration test

**Path**: `backend/src/routes/candidateRoutes.createInterview.integration.test.ts`

Model after `positionRoutes.integration.test.ts` (uses `express` + `supertest`, mocks service + validator).

```typescript
import express from 'express';
import request from 'supertest';
import candidateRoutes from './candidateRoutes';
import { createInterview } from '../application/services/interviewService';
import { validateInterviewCreateData } from '../application/validator';

jest.mock('../application/services/interviewService', () => ({
  createInterview: jest.fn(),
  updateInterview: jest.fn(),
  deleteInterview: jest.fn(),
}));

jest.mock('../application/validator', () => ({
  validateInterviewCreateData: jest.fn(),
  validateInterviewUpdateData: jest.fn(),
  validateInterviewDeletion: jest.fn(),
  validateCandidateData: jest.fn(),
}));

// Also mock domain models used by controllers imported transitively:
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Application');
// ... (add others if TypeScript errors appear at import time)

describe('POST /candidates/:candidateId/interviews integration', () => {
  const app = express();
  app.use(express.json());
  app.use('/candidates', candidateRoutes);

  beforeEach(() => jest.clearAllMocks());

  it('returns 201 on successful create');
  it('returns 400 on invalid candidateId');
  it('returns 400 on validator throw');
  it('returns 404 on candidate not found');
  it('returns 400 on step not in flow');
  it('returns 500 on unexpected error');
});
```

**Note on mock scope for integration test**: `candidateRoutes.ts` imports `addCandidate`, `getCandidateById`, etc. from `candidateController`. Those controllers import Prisma-backed domain models. Mock the entire controller module OR all domain models to avoid real DB connections in tests. The safest approach is to mock the service + validator as above, since the controller delegates entirely to them after ID parsing. If import-time Prisma errors appear, add `jest.mock('../presentation/controllers/candidateController')` as a fallback.

---

## Step 8: Review Existing Tests

Check these files for any test that mocks the import list of `interviewController.ts` or `interviewService.ts`:

- `backend/src/presentation/controllers/__tests__/interviewController.test.ts`
  - Currently imports `updateInterview, deleteInterview` and `validateInterviewUpdateData, validateInterviewDeletion`.
  - After Step 6, the controller will import `createInterview` and `validateInterviewCreateData` too.
  - The existing test mocks the entire module: `jest.mock('../../../application/services/interviewService')` — this auto-mocks all exports including the new `createInterview`. **No change needed** as long as the mock uses `jest.mock` without manual `moduleNameMapper`.

- `backend/src/application/services/__tests__/interviewService.test.ts`
  - Tests `updateInterview` and `deleteInterview`.
  - Adding `createInterview` to the same file does NOT break existing tests.
  - If the test file's import line is: `import { updateInterview, deleteInterview } from '../interviewService';` — it only imports what it needs and will remain unaffected.

**Likely no changes needed** to existing test files, but verify after implementation.

---

## Step 9: Run Tests and Verification Report

Commands to run from the worktree root:
```bash
cd backend && npm test
```

Or targeted:
```bash
cd backend && npm test -- --testPathPattern="validator.createInterview|interviewService.createInterview|interviewController.createInterview|candidateRoutes.createInterview"
```

Create report at:
`openspec/changes/create-interview/specs/create-interview/reports/2026-06-09-step-9-unit-test-and-db-verification.md`

The directory does not exist yet — create it first:
```bash
mkdir -p openspec/changes/create-interview/specs/create-interview/reports
```

---

## Step 10: Manual curl Testing

Start backend:
```bash
cd backend && npm run dev
```

Key curl commands to cover:

**201 success (full payload)**:
```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z","result":"Pending","score":4,"notes":"Test"}'
```

**201 success (minimal — result defaults to Pending)**:
```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```

**400 — invalid candidateId**:
```bash
curl -s -X POST http://localhost:3010/candidates/abc/interviews \
  -H "Content-Type: application/json" -d '{}'
```

**400 — missing required field**:
```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```

**400 — unexpected field**:
```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z","unknownField":"x"}'
```

**404 — candidate not found**:
```bash
curl -s -X POST http://localhost:3010/candidates/999999/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```

After each successful 201, delete the created record using the existing DELETE endpoint to restore DB state.

Document results in: `openspec/changes/create-interview/specs/create-interview/reports/CURL_TESTING.md`

---

## Step 16: API Documentation Update

**Path**: `docs/api-spec.yml`

The existing `PATCH /candidates/{candidateId}/interviews/{interviewId}` is at line ~204.

Add a new path entry `POST /candidates/{candidateId}/interviews` BEFORE the existing `PATCH/DELETE` block (it is a different path — `/candidates/{candidateId}/interviews` not `/{interviewId}`):

```yaml
  /candidates/{candidateId}/interviews:
    post:
      summary: Create a new interview
      description: Creates a new interview for one of the candidate's applications.
      tags:
        - Candidates
      parameters:
        - in: path
          name: candidateId
          required: true
          schema:
            type: integer
          description: ID of the candidate
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateInterviewRequest'
      responses:
        '201':
          description: Interview created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InterviewResponse'
        '400':
          description: Validation error or business rule violation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Candidate, application, interview step, or employee not found
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

Add `CreateInterviewRequest` schema in the `components/schemas` section (near `UpdateInterviewRequest` at line ~1437):

```yaml
    CreateInterviewRequest:
      type: object
      additionalProperties: false
      required:
        - applicationId
        - interviewStepId
        - employeeId
        - interviewDate
      properties:
        applicationId:
          type: integer
          minimum: 1
        interviewStepId:
          type: integer
          minimum: 1
        employeeId:
          type: integer
          minimum: 1
        interviewDate:
          type: string
          format: date-time
        result:
          type: string
          nullable: true
          enum: [Pending, Passed, Failed]
        score:
          type: integer
          nullable: true
          minimum: 0
          maximum: 5
        notes:
          type: string
          maxLength: 1000
          nullable: true
```

`InterviewResponse` (already defined at line ~1410) is reused for the 201 body — no changes needed.

Check whether `openspec/specs/api-spec.yml` exists and if so mirror the same changes there (task 16.6). Based on `ls openspec/specs/`, the folder has subdirectories but the file may not exist — verify before acting.

---

## File Summary

### Files to CREATE (new)

| File | Purpose |
|------|---------|
| `backend/src/application/__tests__/validator.createInterview.test.ts` | Validator tests (TDD — write first) |
| `backend/src/application/services/__tests__/interviewService.createInterview.test.ts` | Service tests (TDD — write first) |
| `backend/src/presentation/controllers/__tests__/interviewController.createInterview.test.ts` | Controller tests (TDD — write first) |
| `backend/src/routes/candidateRoutes.createInterview.integration.test.ts` | Integration test |
| `openspec/changes/create-interview/specs/create-interview/reports/2026-06-09-step-9-unit-test-and-db-verification.md` | Test run report |
| `openspec/changes/create-interview/specs/create-interview/reports/CURL_TESTING.md` | curl test results |

### Files to MODIFY

| File | Change |
|------|--------|
| `backend/src/application/validator.ts` | Add `validateInterviewCreateData` export and `INTERVIEW_CREATE_ALLOWED_FIELDS` constant |
| `backend/src/application/services/interviewService.ts` | Add `createInterview` export |
| `backend/src/presentation/controllers/interviewController.ts` | Add `createInterviewController` export; update imports |
| `backend/src/routes/candidateRoutes.ts` | Import `createInterviewController`; register `router.post('/:candidateId/interviews', ...)` before `/:id` |
| `docs/api-spec.yml` | Add `POST /candidates/{candidateId}/interviews` path + `CreateInterviewRequest` schema |
| `openspec/changes/create-interview/tasks.md` | Mark tasks `[x]` as completed |

### Files NOT to touch

- `backend/src/domain/models/Interview.ts` — already supports insert via `save()` when no `id`
- `backend/prisma/schema.prisma` — no migration needed
- Any existing test files (unless they fail after the changes are in place)

---

## Critical Implementation Notes

### 1. Error message substrings must be stable

The controller's error-mapping uses `includes()` string checks. The service MUST throw errors with these exact substrings:

| Service error message | Controller check | HTTP code |
|---|---|---|
| `'Candidate not found'` | `.includes('not found')` | 404 |
| `'Application not found'` | `.includes('not found')` | 404 |
| `'Application does not belong to the specified candidate'` | `.includes('does not belong')` | 404 |
| `'Interview step not found'` | `.includes('not found')` | 404 |
| `"Interview step does not belong to the position's interview flow"` | `.includes("does not belong to the position's interview flow")` first, then `.includes('does not belong')` would also match 404 — **the 400 check is first in the if-else chain** | 400 |
| `'Employee not found'` | `.includes('not found')` | 404 |
| `'Employee is not active'` | `.includes('is not active')` | 400 |

The 400-before-404 ordering in the catch block is required to avoid the step-not-in-flow message routing to 404.

### 2. No `id` in the Interview constructor for create

When calling `new Interview({...})` in `createInterview`, omit the `id` field entirely (do not pass `id: undefined`). The `save()` method checks `if (this.id)` — passing `undefined` is equivalent to not passing it, but for clarity and to mirror the domain's intent, leave it out of the object literal.

### 3. Route registration order matters

In `candidateRoutes.ts`, Express matches routes in declaration order. `router.post('/:candidateId/interviews', ...)` must be registered BEFORE `router.get('/:id', ...)`. The current file already has PATCH and DELETE interview routes before `/:id` — add POST alongside them.

### 4. Pre-existing compile failures in positionController.ts

There are 4 pre-existing compile errors in `positionController.ts` (missing `validateAssignCandidateToPositionData` and `assignCandidateToPositionService`). These will appear in the full test run but are not caused by this change. Do not fix them unless they block specific test files from running.

### 5. Test file locations

Two naming conventions exist in the codebase:
- Flat siblings: `validator.assignCandidate.test.ts` (beside `validator.ts`)
- `__tests__/` subdirectories: `__tests__/validator.test.ts`, `__tests__/interviewService.test.ts`

New test files for this feature use the `__tests__/` pattern for both the validator and service tests, matching the newest pattern. The controller test also goes in `__tests__/` (existing `interviewController.test.ts` is already there).

### 6. `result` default is applied in the SERVICE, not the validator

The validator accepts `result` as optional (undefined passes). The service applies `result ?? 'Pending'` before constructing the Interview. The validator only rejects invalid values when result IS provided.

### 7. ISO 8601 validation reuses existing helper

`isValidISO8601DateTime` is already defined at line 114 of `validator.ts`. It requires the string to include `'T'` (date-only values are rejected). The `validateInterviewCreateData` function calls this helper for `interviewDate` — do not duplicate the logic.
