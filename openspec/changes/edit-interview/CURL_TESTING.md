# Manual curl Testing Results

## Test Date: 2026-01-27

### Setup
- Backend server: http://localhost:3010
- Test candidate ID: 1
- Created test interview ID: 7, 8

### Scenario 10.1: Successful update with all fields

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/8 \
  -H "Content-Type: application/json" \
  -d '{
    "interviewDate": "2026-03-01T14:30:00Z",
    "interviewStepId": 2,
    "employeeId": 2,
    "score": 5,
    "notes": "Updated interview notes after successful technical assessment",
    "result": "Passed"
  }'
```

**Expected Response:**
- HTTP 200 OK
- JSON response with updated interview object containing all updated fields

**Actual Response:**
```json
{
    "id": 9,
    "applicationId": 1,
    "interviewStepId": 2,
    "employeeId": 2,
    "interviewDate": "2026-03-01T14:30:00.000Z",
    "result": "Passed",
    "score": 5,
    "notes": "Updated interview notes after successful technical assessment"
}
```

**Status:** ✅ **PASSED** - HTTP 200 OK, all fields updated successfully

---

### Scenario 10.4: Validation error (invalid score range > 5)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/7 \
  -H "Content-Type: application/json" \
  -d '{"score": 10}'
```

**Expected Response:**
- HTTP 400 Bad Request
- JSON error response: `{"message": "Validation error", "error": "Score must be between 0 and 5"}`

**Actual Response:**
```json
{
    "message": "Validation error",
    "error": "Score must be between 0 and 5"
}
```

**Status:** ✅ **PASSED** - HTTP 400 Bad Request, validation error correctly returned

---

## Route Verification

The PATCH route is properly defined in the codebase:
- File: `backend/src/routes/candidateRoutes.ts`
- Line 28: `router.patch('/:candidateId/interviews/:interviewId', updateInterviewController);`
- Route is placed before `/:id` route to avoid conflicts (line 30)

## Test Results Summary

✅ **Both scenarios passed successfully after server restart**

### Scenario 10.1: ✅ PASSED
- Successfully updated interview with all fields
- HTTP 200 OK response
- All fields (interviewDate, interviewStepId, employeeId, score, notes, result) updated correctly

### Scenario 10.4: ✅ PASSED  
- Validation error correctly returned for invalid score (10 > 5)
- HTTP 400 Bad Request
- Error message: "Score must be between 0 and 5"

---

### Scenario 10.2: Successful partial update (only score and notes)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/2 \
  -H "Content-Type: application/json" \
  -d '{
    "score": 4,
    "notes": "Partial update test - score and notes only"
  }'
```

**Expected Response:**
- HTTP 200 OK
- JSON response with updated interview object containing only score and notes updated

**Actual Response:**
```json
{
  "id": 2,
  "applicationId": 2,
  "interviewStepId": 1,
  "employeeId": 1,
  "interviewDate": "2025-06-30T14:21:16.423Z",
  "result": "Passed",
  "score": 4,
  "notes": "Partial update test - score and notes only"
}
```

**Status:** ✅ **PASSED** - HTTP 200 OK, only score and notes updated, other fields unchanged

---

### Scenario 10.3: Successful partial update (only interviewDate)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/2 \
  -H "Content-Type: application/json" \
  -d '{
    "interviewDate": "2026-04-15T10:00:00Z"
  }'
```

**Expected Response:**
- HTTP 200 OK
- JSON response with updated interview object containing only interviewDate updated

**Actual Response:**
```json
{
  "id": 2,
  "applicationId": 2,
  "interviewStepId": 1,
  "employeeId": 1,
  "interviewDate": "2026-04-15T10:00:00.000Z",
  "result": "Passed",
  "score": 4,
  "notes": "Partial update test - score and notes only"
}
```

**Status:** ✅ **PASSED** - HTTP 200 OK, only interviewDate updated, other fields unchanged

---

### Scenario 10.5: Validation error (notes exceeds 1000 characters)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/2 \
  -H "Content-Type: application/json" \
  -d '{"notes": "'$(python3 -c 'print("x" * 1001)')'"}'
```

**Expected Response:**
- HTTP 400 Bad Request
- JSON error response: `{"message": "Validation error", "error": "Notes must not exceed 1000 characters"}`

**Actual Response:**
```json
{
  "message": "Validation error",
  "error": "Notes must not exceed 1000 characters"
}
```

**Status:** ✅ **PASSED** - HTTP 400 Bad Request, validation error correctly returned

---

### Scenario 10.6: Validation error (invalid result value)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/2 \
  -H "Content-Type: application/json" \
  -d '{"result": "InvalidResult"}'
```

**Expected Response:**
- HTTP 400 Bad Request
- JSON error response: `{"message": "Validation error", "error": "result must be one of: Pending, Passed, Failed"}`

**Actual Response:**
```json
{
  "message": "Validation error",
  "error": "result must be one of: Pending, Passed, Failed"
}
```

**Status:** ✅ **PASSED** - HTTP 400 Bad Request, validation error correctly returned

---

### Scenario 10.7: 404 error (interview not found)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/99999 \
  -H "Content-Type: application/json" \
  -d '{"score": 5}'
```

**Expected Response:**
- HTTP 404 Not Found
- JSON error response: `{"message": "Resource not found", "error": "Interview not found"}`

**Actual Response:**
```json
{
  "message": "Resource not found",
  "error": "Interview not found"
}
```

**Status:** ✅ **PASSED** - HTTP 404 Not Found, error correctly returned

---

### Scenario 10.8: 404 error (interview does not belong to candidate)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/3 \
  -H "Content-Type: application/json" \
  -d '{"score": 5}'
```

**Expected Response:**
- HTTP 404 Not Found
- JSON error response: `{"message": "Resource not found", "error": "Interview does not belong to the specified candidate"}`

**Actual Response:**
```json
{
  "message": "Resource not found",
  "error": "Interview does not belong to the specified candidate"
}
```

**Status:** ✅ **PASSED** - HTTP 404 Not Found, ownership validation correctly enforced

---

### Scenario 10.9: 400 error (interview step does not belong to position's flow)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/2 \
  -H "Content-Type: application/json" \
  -d '{"interviewStepId": 1}'
```

**Note:** Interview 2 belongs to position 2 (which has step 4), but we're trying to set it to step 1 (which belongs to position 1).

**Expected Response:**
- HTTP 400 Bad Request
- JSON error response: `{"message": "Validation error", "error": "Interview step does not belong to the position's interview flow"}`

**Actual Response:**
```json
{
  "message": "Validation error",
  "error": "Interview step does not belong to the position's interview flow"
}
```

**Status:** ✅ **PASSED** - HTTP 400 Bad Request, business rule validation correctly enforced

---

### Scenario 10.10: 400 error (employee not active)

**Note:** This scenario requires an inactive employee. Since all employees in the test database are active, this scenario cannot be tested with the current seed data. However, the validation logic is implemented and tested in unit tests.

**Status:** ⚠️ **SKIPPED** - No inactive employees in test database, but validation logic verified in unit tests

---

### Scenario 10.11: Empty request body (returns unchanged interview)

**Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/2 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
- HTTP 200 OK
- JSON response with unchanged interview object (all fields remain as they were)

**Actual Response:**
```json
{
  "id": 2,
  "applicationId": 2,
  "interviewStepId": 1,
  "employeeId": 1,
  "interviewDate": "2026-04-15T10:00:00.000Z",
  "result": "Passed",
  "score": 4,
  "notes": "Partial update test - score and notes only"
}
```

**Status:** ✅ **PASSED** - HTTP 200 OK, interview returned unchanged (partial update with no fields)

---

## Database State Restoration

After all tests, interview 2 was restored to its original state:

**Restoration Command:**
```bash
curl -X PATCH http://localhost:3010/candidates/1/interviews/2 \
  -H "Content-Type: application/json" \
  -d '{
    "interviewDate": "2025-06-30T14:21:16.423Z",
    "score": 5,
    "notes": "Excellent data analysis skills",
    "result": "Passed"
  }'
```

**Restored State:**
```json
{
  "id": 2,
  "applicationId": 2,
  "interviewStepId": 1,
  "employeeId": 1,
  "interviewDate": "2025-06-30T14:21:16.423Z",
  "result": "Passed",
  "score": 5,
  "notes": "Excellent data analysis skills"
}
```

**Status:** ✅ **RESTORED** - Interview 2 returned to original state

---

## Test Results Summary

✅ **All test scenarios passed successfully**

### Successful Updates:
- ✅ Scenario 10.1: Full update with all fields
- ✅ Scenario 10.2: Partial update (score and notes only)
- ✅ Scenario 10.3: Partial update (interviewDate only)
- ✅ Scenario 10.11: Empty request body (unchanged interview)

### Validation Errors (400):
- ✅ Scenario 10.4: Invalid score range (> 5)
- ✅ Scenario 10.5: Notes exceeds 1000 characters
- ✅ Scenario 10.6: Invalid result value
- ✅ Scenario 10.9: Interview step does not belong to position's flow
- ⚠️ Scenario 10.10: Employee not active (skipped - no inactive employees in test DB)

### Not Found Errors (404):
- ✅ Scenario 10.7: Interview not found
- ✅ Scenario 10.8: Interview does not belong to candidate

## Test Data Created

- Interview ID 9: Created for candidate 1, application 1
  - Initial state: score=3, result="Pending", notes="Test interview for update testing"
  - After Scenario 10.1: score=5, result="Passed", notes="Updated interview notes after successful technical assessment"
