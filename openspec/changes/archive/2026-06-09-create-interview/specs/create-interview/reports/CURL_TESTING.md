# Manual curl Testing — POST /candidates/:candidateId/interviews

**Date:** 2026-06-09
**Backend server:** http://localhost:3010
**Feature:** SCRUM-86 Create Interview

## Setup

Backend started with: `npm run dev` (port 3010)

## Test Data Used

- Candidate 1 (John Doe) with:
  - Application 1 → Position 1 (Senior Full-Stack Engineer), interviewFlow id=1
    - Valid step IDs: 1 (Initial Screening), 2 (Technical Interview), 3 (Manager Interview)
  - Application 2 → Position 2 (Data Scientist)
- Application 4 belongs to Candidate 3 (not Candidate 1)
- Employee 1 (Alice Johnson, isActive=true)
- Employee 7 (Emma Davis, temporarily set isActive=false for test 15, then restored)

---

## TEST 1: POST success (full payload) → 201

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z","result":"Pending","score":4,"notes":"Strong candidate"}'
```

**Response (201):**
```json
{
    "id": 27,
    "applicationId": 1,
    "interviewStepId": 1,
    "employeeId": 1,
    "interviewDate": "2026-06-20T10:00:00.000Z",
    "result": "Pending",
    "score": 4,
    "notes": "Strong candidate"
}
```
DB cleanup: `DELETE interview WHERE id=27` — done.

---

## TEST 2: POST success (minimal payload, result defaults to Pending) → 201

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":2,"employeeId":1,"interviewDate":"2026-06-21T10:00:00Z"}'
```

**Response (201):**
```json
{
    "id": 28,
    "applicationId": 1,
    "interviewStepId": 2,
    "employeeId": 1,
    "interviewDate": "2026-06-21T10:00:00.000Z",
    "result": "Pending",
    "score": null,
    "notes": null
}
```
Note: `result` defaults to `"Pending"` when omitted. DB cleanup: `DELETE interview WHERE id=28` — done.

---

## TEST 3: 400 - invalid candidateId format

```bash
curl -s -X POST http://localhost:3010/candidates/abc/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```

**Response (400):**
```json
{
    "message": "Validation error",
    "error": "Invalid candidate ID format"
}
```

---

## TEST 4: 400 - missing required field (interviewDate)

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1}'
```

**Response (400):**
```json
{
    "message": "Validation error",
    "error": "interviewDate is required"
}
```

---

## TEST 5: 400 - unexpected field

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z","unknownField":"value"}'
```

**Response (400):**
```json
{
    "message": "Validation error",
    "error": "Unexpected field: unknownField"
}
```

---

## TEST 6: 400 - invalid score (out of range)

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z","score":10}'
```

**Response (400):**
```json
{
    "message": "Validation error",
    "error": "Score must be between 0 and 5"
}
```

---

## TEST 7: 400 - notes too long (> 1000 chars)

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z","notes":"aaa...1001 chars"}'
```

**Response (400):**
```json
{
    "message": "Validation error",
    "error": "Notes must not exceed 1000 characters"
}
```

---

## TEST 8: 400 - invalid result value

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z","result":"InvalidValue"}'
```

**Response (400):**
```json
{
    "message": "Validation error",
    "error": "Invalid result value"
}
```

---

## TEST 9: 404 - candidate not found

```bash
curl -s -X POST http://localhost:3010/candidates/9999/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```

**Response (404):**
```json
{
    "message": "Resource not found",
    "error": "Candidate not found"
}
```

---

## TEST 10: 404 - application not found

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":9999,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```

**Response (404):**
```json
{
    "message": "Resource not found",
    "error": "Application not found"
}
```

---

## TEST 11: 404 - application not owned by candidate

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":4,"interviewStepId":1,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```
(Application 4 belongs to Candidate 3, not Candidate 1)

**Response (404):**
```json
{
    "message": "Resource not found",
    "error": "Application does not belong to the specified candidate"
}
```

---

## TEST 12: 404 - step not found

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":9999,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```

**Response (404):**
```json
{
    "message": "Resource not found",
    "error": "Interview step not found"
}
```

---

## TEST 13: 404 - employee not found

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":9999,"interviewDate":"2026-06-20T10:00:00Z"}'
```

**Response (404):**
```json
{
    "message": "Resource not found",
    "error": "Employee not found"
}
```

---

## TEST 14: 400 - step not in position's flow

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":4,"employeeId":1,"interviewDate":"2026-06-20T10:00:00Z"}'
```
(Step 4 belongs to interview flow 2, but Application 1 is in Position 1 which uses flow 1)

**Response (400):**
```json
{
    "message": "Validation error",
    "error": "Interview step does not belong to the position's interview flow"
}
```

---

## TEST 15: 400 - employee not active

Temporarily set employee 7 (Emma Davis) to `isActive=false`, then:

```bash
curl -s -X POST http://localhost:3010/candidates/1/interviews \
  -H "Content-Type: application/json" \
  -d '{"applicationId":1,"interviewStepId":1,"employeeId":7,"interviewDate":"2026-06-20T10:00:00Z"}'
```

**Response (400):**
```json
{
    "message": "Validation error",
    "error": "Employee is not active"
}
```

Employee 7 restored to `isActive=true` after test.

---

## DB Restoration

- Interviews created during testing (IDs 27 and 28) were deleted after tests.
- Employee 7 `isActive` restored to `true` after test 15.
- Final DB state matches pre-test baseline.

## Summary

| Test | Expected | Actual | Pass? |
|------|----------|--------|-------|
| Full payload | 201 + created interview | 201 + interview | YES |
| Minimal (result defaults) | 201 + result=Pending | 201 + result=Pending | YES |
| Invalid candidateId | 400 | 400 | YES |
| Missing field | 400 | 400 | YES |
| Unexpected field | 400 | 400 | YES |
| Score out of range | 400 | 400 | YES |
| Notes too long | 400 | 400 | YES |
| Invalid result | 400 | 400 | YES |
| Candidate not found | 404 | 404 | YES |
| Application not found | 404 | 404 | YES |
| App not owned by candidate | 404 | 404 | YES |
| Step not found | 404 | 404 | YES |
| Employee not found | 404 | 404 | YES |
| Step not in flow | 400 | 400 | YES |
| Employee not active | 400 | 400 | YES |

All 15 curl tests passed.
