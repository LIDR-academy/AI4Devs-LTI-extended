# Pull Request: Delete Interview for Candidate (SCRUM-4)

## Title

```
feat(delete-interviews): add delete interview for candidate (SCRUM-4)
```

## Description

### Summary

Enable recruiters to **delete pending interviews** that are no longer needed (e.g. cancelled). Deletion requires a reason for audit trail; completed interviews (Passed/Failed) cannot be deleted.

### Backend

- **DELETE** `/candidates/:candidateId/interviews/:interviewId` with required `reason` in body (non-empty, max 500 chars)
- Business rule: only pending interviews (result null or "Pending") can be deleted; completed (Passed/Failed) return 422
- `validateInterviewDeletion()` in validator; `deleteInterview()` in interviewService; `deleteInterviewController()`; DELETE route in candidateRoutes
- Interview domain/repository delete support; unit tests for controller, service, validator

### Frontend

- **Delete icon** next to each interview (shown only when interview is deletable, i.e. pending)
- **Confirmation modal** with reason input; `deleteInterview(candidateId, interviewId, reason)` in interviewService
- List refresh after successful deletion; error handling for 400/404/422

### OpenSpec

- Change artifacts: proposal, design, tasks, spec, CURL_TESTING, E2E_TEST_REPORT

### Branch

- **Branch:** `feature/SCRUM-4` (includes create-interview and edit-interview from SCRUM-2/SCRUM-3)

### Checklist

- [ ] Backend unit tests pass
- [ ] Manual DELETE endpoint testing (with reason)
- [ ] E2E delete-interview flow and business rule (no delete for Passed/Failed) verified
- [ ] API spec updated (DELETE endpoint)
