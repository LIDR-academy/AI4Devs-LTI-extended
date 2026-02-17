# Pull Request: Update Position (SCRUM-10)

## Title

```
feat(update-position): add update position (PATCH and edit form) (SCRUM-10)
```

## Description

### Summary

Enable recruiters to **update existing position details** after creation via a PATCH endpoint and a frontend edit form, so position information can be kept accurate without direct database access.

### Backend

- **PATCH** `/positions/:id` with partial update support
- Immutable fields protected: `id`, `companyId`, `interviewFlowId` (400 if sent)
- Validation: `validatePositionUpdateData()`; optional fields (title, description, location, status, salary, deadline, etc.) with type and length rules
- `updatePosition` in positionService; `updatePosition` controller; PATCH route in positionRoutes
- Unit tests for service and controller (update flow)

### Frontend

- **Edit button** on position cards in Positions list; navigation to edit form
- **EditPositionForm** component with pre-populated data and validation
- Route **/positions/:id/edit**; `updatePosition(id, positionData)` in positionService
- App.js routing for edit form

### OpenSpec

- Change artifacts: proposal, design, tasks, spec, update-position_backend, improved-user-story

### Branch

- **Branch:** `feature/SCRUM-10` (branched from feature/SCRUM-4; includes interview features + update-position)

### Checklist

- [ ] Backend unit tests pass
- [ ] Manual PATCH /positions/:id testing
- [ ] E2E update-position flow verified
- [ ] API spec updated (PATCH /positions/:id)
