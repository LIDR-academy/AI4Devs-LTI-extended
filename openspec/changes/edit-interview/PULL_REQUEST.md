# Pull Request: Edit Interview for Candidate (SCRUM-3)

## Title

```
feat(edit-interview): add edit interview for candidate (SCRUM-3)
```

## Description

### Summary

Enable recruiters to **update existing interview details** after creation. When schedule or result changes occur, recruiters can edit interviews via the API and the CandidateDetails UI (edit icon and modal).

### Backend

- **PATCH** `/candidates/:candidateId/interviews/:interviewId` with partial update support
- All fields optional: `interviewDate`, `interviewStepId`, `employeeId`, `score`, `notes`, `result`
- Validation: `validateInterviewUpdateData()`; business rules (interview ownership, active employee, interview step in position flow); score 0–5; notes max 1000 chars; result one of Pending/Passed/Failed
- `updateInterview()` in interviewService; `updateInterviewController()`; PATCH route in candidateRoutes
- Unit tests for validator, service, and controller (update flow)

### Frontend

- **Edit icon (pen)** next to each interview in CandidateDetails
- **Edit modal** with pre-filled form: Interview Date & Time, Interview Step, Employee, Result, Score (star rating), Notes
- `updateInterview(candidateId, interviewId, interviewData)` in interviewService
- Form validation and error handling; list refresh after save

### OpenSpec

- Change artifacts: proposal, design, tasks, spec, CURL_TESTING

### Branch

- **Branch:** `feature/SCRUM-3` (includes create-interview from `feature/SCRUM-2`)

### Checklist

- [ ] Backend unit tests pass
- [ ] Manual PATCH endpoint testing
- [ ] E2E edit-interview flow verified
- [ ] API spec updated (PATCH endpoint)
