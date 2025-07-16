# Unit Testing Plan for Frontend

## 1. Test File Structure

Test files are located next to each component or hook, following the pattern `<Component>.test.tsx` or `<hook>.test.ts`:

```
src/
├── components/
│   ├── Candidates.tsx
│   ├── Candidates.test.tsx
│   ├── Positions.tsx
│   ├── Positions.test.tsx
│   ├── BackButton.js
│   ├── BackButton.test.tsx
│   └── ...other components
├── hooks/
│   ├── useCustomHook.ts
│   └── useCustomHook.test.ts
└── ...other directories
```

---

## 2. Test Coverage Goals

- **Target coverage:** At least 70% of the codebase.
- **Focus:** Superficial tests that cover more components rather than deep tests on a few.
- **Scope:** Unit tests only (no integration or snapshot tests for now).
- **Tools:** Jest (with React Testing Library if needed).

---

## 3. Test Plan by Component

### Candidates.test.tsx

- Renders the candidate list.
- Renders loading, error, and empty states.
- Filters by name/email.
- Clicking “View details” navigates correctly.
- Clicking “Edit” navigates correctly.
- BackButton navigates to the dashboard.

### Positions.test.tsx

- Renders the position list.
- Renders loading, error, and empty states.
- Filters by title.
- Filters by status and manager (if logic is implemented).
- Clicking “View process” navigates correctly.
- Clicking “Edit” navigates correctly.
- BackButton navigates to the dashboard.

### BackButton.test.tsx

- Renders the button with the arrow icon.
- Calls the navigation function on click.
- Allows customizing the destination (`to` prop).

### CreatePosition.test.tsx (Position Creation Form)

- Renders the form correctly.
- Validates required fields.
- Shows error messages for missing data.
- Calls the creation function on valid submit.
- Shows visual feedback after creating a position.

### Custom Hooks (if any)

- Each hook should have a `<hook>.test.ts` file that:
  - Tests the main logic of the hook (state changes, side effects).
  - Simulates main usage scenarios.

---

## 4. Mocking and Utilities

- Mock services (axios, candidateService, positionService).
- Mock navigation (useNavigate from React Router).
- Mock Bootstrap components only if necessary for logic.

---

## 5. Success Criteria

- Each critical component has at least a render and main interaction test.
- Custom hooks have unit tests for their main logic.
- At least 70% global coverage (as reported by Jest).
- No integration or snapshot tests included at this stage.

---

*This plan ensures maintainable, focused, and useful unit test coverage for the most important frontend components and logic.* 