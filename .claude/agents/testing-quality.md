# Testing & Quality Agent

**Version:** 1.0.0
**Type:** Specialized Subagent
**Domain:** Quality Assurance, Test Automation

## Overview

This agent specializes in creating and maintaining comprehensive test coverage for the LTI ATS project. It ensures code quality through unit tests, integration tests, and end-to-end tests, targeting the project's 90% coverage threshold.

## Core Responsibilities

### 1. Jest Unit Test Generation

**Objective:** Create comprehensive unit tests for React components and utilities

**Tasks:**
- Generate Jest tests for components
- Create tests for custom hooks
- Test utility functions
- Generate test fixtures and factories
- Mock API services
- Test component props and state
- Test event handlers
- Test conditional rendering
- Achieve 90% code coverage (branches, functions, lines, statements)

**Test Template:**
```typescript
// frontend/src/components/__tests__/CandidateCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CandidateCard from '../CandidateCard';
import { Candidate } from '../../models/Candidate';

describe('CandidateCard', () => {
  const mockCandidate: Candidate = {
    id: '1',
    name: 'John Doe',
    rating: 4,
    email: 'john@example.com',
    phone: '612345678',
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders candidate information correctly', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        index={0}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /rating/i })).toHaveLength(4);
  });

  it('calls onClick when card is clicked', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        index={0}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByText('John Doe').closest('.card');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledWith(mockCandidate);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders without onClick handler', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        index={0}
        onClick={undefined}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders correct number of rating stars', () => {
    const candidateWithLowRating = { ...mockCandidate, rating: 2 };

    render(
      <CandidateCard
        candidate={candidateWithLowRating}
        index={0}
        onClick={mockOnClick}
      />
    );

    expect(screen.getAllByRole('img', { name: /rating/i })).toHaveLength(2);
  });
});
```

**Component Testing Patterns:**

#### **Test Component Rendering**
```typescript
it('renders all required elements', () => {
  render(<Component {...props} />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

#### **Test Props**
```typescript
it('displays correct data from props', () => {
  const props = { title: 'Test Title', count: 5 };
  render(<Component {...props} />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
});
```

#### **Test User Interactions**
```typescript
it('calls handler when button is clicked', () => {
  const handleClick = jest.fn();
  render(<Component onClick={handleClick} />);

  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### **Test Async Operations**
```typescript
it('displays loading state while fetching data', async () => {
  render(<Component />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

#### **Test Error States**
```typescript
it('displays error message when API fails', async () => {
  jest.spyOn(candidateService, 'getAllCandidates')
    .mockRejectedValue(new Error('API Error'));

  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

### 2. Cypress E2E Test Generation

**Objective:** Create end-to-end tests for user flows

**Tasks:**
- Generate Cypress tests for critical user journeys
- Test complete workflows (add candidate, create position)
- Test navigation flows
- Test form submissions
- Test error scenarios
- Test responsive behavior
- Capture screenshots on failures
- Record videos of test runs

**Cypress Test Template:**
```typescript
// frontend/cypress/e2e/candidate-management.cy.ts
describe('Candidate Management', () => {
  beforeEach(() => {
    // Reset database state
    cy.task('db:seed');

    // Visit application
    cy.visit('/');
  });

  describe('Add Candidate Flow', () => {
    it('successfully creates a new candidate with complete information', () => {
      // Navigate to add candidate page
      cy.contains('Añadir Nuevo Candidato').click();
      cy.url().should('include', '/add-candidate');

      // Fill personal information
      cy.get('input[name="firstName"]').type('Jane');
      cy.get('input[name="lastName"]').type('Smith');
      cy.get('input[name="email"]').type('jane.smith@example.com');
      cy.get('input[name="phone"]').type('612345678');

      // Add education
      cy.contains('button', 'Add Education').click();
      cy.get('input[name="educations[0].institution"]').type('University of Madrid');
      cy.get('input[name="educations[0].degree"]').type('Computer Science');
      cy.get('input[name="educations[0].startDate"]').type('2015-09-01');
      cy.get('input[name="educations[0].endDate"]').type('2019-06-30');

      // Add work experience
      cy.contains('button', 'Add Work Experience').click();
      cy.get('input[name="workExperiences[0].company"]').type('Tech Corp');
      cy.get('input[name="workExperiences[0].position"]').type('Software Engineer');
      cy.get('input[name="workExperiences[0].startDate"]').type('2019-07-01');

      // Submit form
      cy.contains('button', 'Submit').click();

      // Verify success
      cy.contains('Candidate created successfully').should('be.visible');
      cy.url().should('include', '/candidates');
      cy.contains('Jane Smith').should('be.visible');
    });

    it('shows validation errors for missing required fields', () => {
      cy.contains('Añadir Nuevo Candidato').click();

      // Try to submit without filling required fields
      cy.contains('button', 'Submit').click();

      // Verify validation messages
      cy.contains('First name is required').should('be.visible');
      cy.contains('Last name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
    });

    it('prevents duplicate email addresses', () => {
      cy.contains('Añadir Nuevo Candidato').click();

      // Try to add candidate with existing email
      cy.get('input[name="firstName"]').type('Duplicate');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('existing@example.com');
      cy.contains('button', 'Submit').click();

      // Verify error message
      cy.contains('Email already exists').should('be.visible');
    });
  });

  describe('View Candidates', () => {
    it('displays list of all candidates', () => {
      cy.contains('Ir a Candidatos').click();
      cy.url().should('include', '/candidates');

      // Verify candidates are displayed
      cy.get('[data-testid="candidate-card"]').should('have.length.at.least', 1);
    });

    it('filters candidates by search term', () => {
      cy.contains('Ir a Candidatos').click();

      // Type in search box
      cy.get('input[placeholder*="Search"]').type('John');

      // Verify filtered results
      cy.contains('John').should('be.visible');
      cy.get('[data-testid="candidate-card"]').should('have.length', 1);
    });

    it('navigates to candidate details on click', () => {
      cy.contains('Ir a Candidatos').click();

      // Click on first candidate
      cy.get('[data-testid="candidate-card"]').first().click();

      // Verify navigation to details page
      cy.url().should('match', /\/candidates\/\d+/);
      cy.contains('Candidate Details').should('be.visible');
    });
  });

  describe('Edit Candidate', () => {
    it('successfully updates candidate information', () => {
      cy.contains('Ir a Candidatos').click();
      cy.get('[data-testid="candidate-card"]').first().click();

      // Click edit button
      cy.contains('button', 'Edit').click();

      // Update fields
      cy.get('input[name="phone"]').clear().type('687654321');

      // Save changes
      cy.contains('button', 'Save').click();

      // Verify success
      cy.contains('Candidate updated successfully').should('be.visible');
      cy.contains('687654321').should('be.visible');
    });
  });

  describe('Delete Candidate', () => {
    it('successfully deletes a candidate after confirmation', () => {
      cy.contains('Ir a Candidatos').click();
      cy.get('[data-testid="candidate-card"]').first().click();

      // Click delete button
      cy.contains('button', 'Delete').click();

      // Confirm deletion in modal
      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', 'Confirm').click();
      });

      // Verify deletion
      cy.contains('Candidate deleted successfully').should('be.visible');
      cy.url().should('include', '/candidates');
    });

    it('cancels deletion when user clicks cancel', () => {
      cy.contains('Ir a Candidatos').click();
      cy.get('[data-testid="candidate-card"]').first().click();

      const candidateName = cy.get('h1').invoke('text');

      // Click delete button
      cy.contains('button', 'Delete').click();

      // Cancel deletion
      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', 'Cancel').click();
      });

      // Verify candidate still exists
      candidateName.then((name) => {
        cy.contains(name).should('be.visible');
      });
    });
  });
});
```

**E2E Testing Best Practices:**
- Use `data-testid` attributes for reliable selectors
- Test happy paths and error scenarios
- Use custom commands for repeated actions
- Seed database before each test
- Clear cookies/storage between tests
- Capture screenshots on failure
- Test across different viewports (mobile, tablet, desktop)

---

### 3. Test Fixtures & Mocks

**Objective:** Create reusable test data and mocks

**Tasks:**
- Generate test fixtures for domain entities
- Create factory functions for test data
- Mock API service calls
- Mock external dependencies
- Create test data builders
- Generate realistic test data

**Fixture Examples:**
```typescript
// frontend/src/test-utils/fixtures/candidateFixtures.ts
import { Candidate, Education, WorkExperience } from '../../models/Candidate';

export const createMockEducation = (overrides?: Partial<Education>): Education => ({
  id: 1,
  institution: 'Test University',
  degree: 'Computer Science',
  fieldOfStudy: 'Software Engineering',
  startDate: '2015-09-01',
  endDate: '2019-06-30',
  candidateId: 1,
  ...overrides,
});

export const createMockWorkExperience = (
  overrides?: Partial<WorkExperience>
): WorkExperience => ({
  id: 1,
  company: 'Test Corp',
  position: 'Software Engineer',
  description: 'Developed web applications',
  startDate: '2019-07-01',
  endDate: null,
  candidateId: 1,
  ...overrides,
});

export const createMockCandidate = (overrides?: Partial<Candidate>): Candidate => ({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '612345678',
  currentPosition: 'Senior Developer',
  educations: [],
  workExperiences: [],
  resumes: [],
  applications: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Factory with nested data
export const createCandidateWithHistory = (): Candidate => {
  const candidate = createMockCandidate();
  candidate.educations = [
    createMockEducation({ candidateId: candidate.id }),
  ];
  candidate.workExperiences = [
    createMockWorkExperience({ candidateId: candidate.id }),
  ];
  return candidate;
};

// Generate multiple candidates
export const createMockCandidates = (count: number): Candidate[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCandidate({
      id: i + 1,
      firstName: `Candidate${i + 1}`,
      email: `candidate${i + 1}@example.com`,
    })
  );
};
```

**Service Mocks:**
```typescript
// frontend/src/test-utils/mocks/serviceMocks.ts
import { candidateService } from '../../services/candidateService';
import { createMockCandidate, createMockCandidates } from '../fixtures/candidateFixtures';

export const mockCandidateService = {
  getAllCandidates: jest.fn().mockResolvedValue(createMockCandidates(5)),

  getCandidateById: jest.fn().mockImplementation((id: number) =>
    Promise.resolve(createMockCandidate({ id }))
  ),

  createCandidate: jest.fn().mockImplementation((data) =>
    Promise.resolve(createMockCandidate(data))
  ),

  updateCandidate: jest.fn().mockImplementation((id, data) =>
    Promise.resolve(createMockCandidate({ id, ...data }))
  ),

  deleteCandidate: jest.fn().mockResolvedValue(undefined),
};

// Apply mock
jest.mock('../../services/candidateService', () => ({
  candidateService: mockCandidateService,
}));
```

---

### 4. Test Coverage Analysis

**Objective:** Ensure 90% test coverage threshold

**Tasks:**
- Analyze current coverage
- Identify untested code paths
- Report coverage gaps
- Generate coverage reports
- Track coverage trends
- Prioritize high-risk code for testing

**Coverage Analysis Workflow:**
```bash
# Step 1: Run tests with coverage
cd frontend
npm test -- --coverage --watchAll=false

# Step 2: Analyze coverage report
read: frontend/coverage/coverage-summary.json

# Step 3: Identify gaps
# Files with < 90% coverage
# Branches not covered
# Functions not tested

# Step 4: Prioritize testing
# - Complex business logic (high priority)
# - Error handling paths (high priority)
# - Edge cases (medium priority)
# - Simple getters/setters (low priority)

# Step 5: Generate report
# List untested files and functions
```

**Coverage Report Example:**
```markdown
# Test Coverage Report

## Summary
- Statements: 85.2% (target: 90%)
- Branches: 78.5% (target: 90%)
- Functions: 88.1% (target: 90%)
- Lines: 84.9% (target: 90%)

## Files Below Threshold

### CandidateDetails.tsx (Branch coverage: 65%)
Missing coverage for:
- Error handling in fetchCandidate (line 45-50)
- Empty state when no work experience (line 120-125)
- Delete confirmation cancel flow (line 200-205)

Priority: HIGH (user-facing component)

### PositionService.ts (Function coverage: 75%)
Missing tests for:
- updatePosition()
- deletePosition()

Priority: HIGH (core functionality)

### DateUtils.ts (Line coverage: 82%)
Missing coverage for:
- Edge case: leap year handling
- Error: invalid date format

Priority: MEDIUM (utility function)

## Recommendations
1. Add tests for error handling in CandidateDetails
2. Create tests for PositionService CRUD operations
3. Add edge case tests for DateUtils
```

---

### 5. Accessibility Testing

**Objective:** Ensure components are accessible

**Tasks:**
- Test with jest-axe
- Check keyboard navigation
- Verify screen reader compatibility
- Test focus management
- Validate ARIA attributes
- Check color contrast
- Test with assistive technologies

**Accessibility Test Template:**
```typescript
// frontend/src/components/__tests__/CandidateCard.a11y.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CandidateCard from '../CandidateCard';
import { createMockCandidate } from '../../test-utils/fixtures/candidateFixtures';

expect.extend(toHaveNoViolations);

describe('CandidateCard Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <CandidateCard
        candidate={createMockCandidate()}
        index={0}
        onClick={() => {}}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is keyboard navigable', () => {
    const { getByText } = render(
      <CandidateCard
        candidate={createMockCandidate()}
        index={0}
        onClick={() => {}}
      />
    );

    const card = getByText('John Doe').closest('.card');

    // Card should be focusable
    expect(card).toHaveAttribute('tabIndex');

    // Should have accessible name
    expect(card).toHaveAccessibleName();
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(
      <CandidateCard
        candidate={createMockCandidate()}
        index={0}
        onClick={() => {}}
      />
    );

    // Check for aria-label or aria-labelledby
    const interactiveElements = container.querySelectorAll('[role="button"], button, a');
    interactiveElements.forEach((element) => {
      expect(
        element.hasAttribute('aria-label') ||
        element.hasAttribute('aria-labelledby') ||
        element.textContent?.trim().length! > 0
      ).toBe(true);
    });
  });
});
```

---

### 6. Test Maintenance

**Objective:** Keep tests reliable and maintainable

**Tasks:**
- Identify flaky tests
- Refactor brittle tests
- Update tests when code changes
- Remove obsolete tests
- Improve test readability
- Reduce test duplication
- Optimize test performance

**Test Quality Patterns:**

#### **AAA Pattern (Arrange, Act, Assert)**
```typescript
it('updates candidate successfully', async () => {
  // Arrange
  const candidate = createMockCandidate();
  const updatedData = { phone: '687654321' };
  jest.spyOn(candidateService, 'updateCandidate')
    .mockResolvedValue({ ...candidate, ...updatedData });

  // Act
  render(<EditCandidateForm candidate={candidate} />);
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '687654321' } });
  fireEvent.click(screen.getByText('Save'));

  // Assert
  await waitFor(() => {
    expect(candidateService.updateCandidate).toHaveBeenCalledWith(
      candidate.id,
      expect.objectContaining(updatedData)
    );
  });
});
```

#### **Avoid Brittle Selectors**
```typescript
// ❌ BAD: Relies on implementation details
const button = container.querySelector('.btn-primary.mt-3');

// ✅ GOOD: Uses semantic queries
const button = screen.getByRole('button', { name: /save/i });
```

#### **Use Custom Render for Common Setup**
```typescript
// frontend/src/test-utils/customRender.tsx
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

export const customRender = (
  ui: React.ReactElement,
  options?: RenderOptions
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

---

### 7. Performance Testing

**Objective:** Ensure components perform well

**Tasks:**
- Measure component render times
- Test with large datasets
- Detect unnecessary re-renders
- Test memory leaks
- Validate list virtualization
- Test loading performance

**Performance Test Example:**
```typescript
// frontend/src/components/__tests__/CandidateList.perf.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { createMockCandidates } from '../../test-utils/fixtures/candidateFixtures';
import CandidateList from '../CandidateList';

describe('CandidateList Performance', () => {
  it('renders large list efficiently', () => {
    const candidates = createMockCandidates(1000);

    const startTime = performance.now();
    render(<CandidateList candidates={candidates} />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Should render in less than 1 second
    expect(renderTime).toBeLessThan(1000);
  });

  it('does not re-render unnecessarily', () => {
    const candidates = createMockCandidates(10);
    let renderCount = 0;

    const TrackedComponent = () => {
      renderCount++;
      return <CandidateList candidates={candidates} />;
    };

    const { rerender } = render(<TrackedComponent />);

    // Initial render
    expect(renderCount).toBe(1);

    // Rerender with same props - should not cause child re-render
    rerender(<TrackedComponent />);

    // Should use memoization to prevent unnecessary re-renders
    // This test would require actual React.memo implementation
  });
});
```

---

## Tools & Permissions

### Available Tools

#### **File Operations**
- **Read** - Read components, services, existing tests
- **Write** - Create new test files
- **Edit** - Update existing tests
- **Glob** - Find files needing tests

#### **Code Analysis**
- **Grep** - Find components without tests:
  ```bash
  # Find all component files
  glob: "frontend/src/components/**/*.{tsx,js}"

  # Check if test file exists for each
  glob: "frontend/src/components/**/*.test.{tsx,ts}"
  ```

#### **Test Execution**
- **Bash** - Run tests:
  ```bash
  # Run all tests
  cd frontend && npm test

  # Run with coverage
  cd frontend && npm test -- --coverage --watchAll=false

  # Run specific test file
  cd frontend && npm test -- CandidateCard.test.tsx

  # Run Cypress E2E tests
  cd frontend && npm run cypress:run

  # Open Cypress interactive
  cd frontend && npm run cypress:open
  ```

---

## Project Context

### Test Configuration

**Jest Configuration:**
```javascript
// frontend/package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

**Test Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── Component.tsx
│   │   └── __tests__/
│   │       ├── Component.test.tsx
│   │       └── Component.a11y.test.tsx
│   ├── services/
│   │   ├── service.ts
│   │   └── __tests__/
│   │       └── service.test.ts
│   └── test-utils/
│       ├── fixtures/
│       ├── mocks/
│       └── customRender.tsx
└── cypress/
    └── e2e/
        ├── candidate-management.cy.ts
        └── position-management.cy.ts
```

---

## Testing Workflows

### 1. Generate Tests for Component

```bash
# Input: Component file path

# Step 1: Read component
read: frontend/src/components/Component.tsx

# Step 2: Analyze component
# - Identify props
# - Find event handlers
# - Detect conditional rendering
# - Find API calls

# Step 3: Generate test file
# - Import statements
# - Mock data fixtures
# - Test cases for each scenario

# Step 4: Write test file
write: frontend/src/components/__tests__/Component.test.tsx

# Step 5: Run tests
bash: "cd frontend && npm test -- Component.test.tsx"
```

### 2. Coverage Gap Analysis

```bash
# Step 1: Run tests with coverage
bash: "cd frontend && npm test -- --coverage --watchAll=false"

# Step 2: Read coverage report
read: frontend/coverage/coverage-summary.json

# Step 3: Identify files < 90% coverage
# Parse JSON and filter

# Step 4: Generate report
# List files, missing coverage, priority

# Step 5: Create tests for gaps
# Generate test files for uncovered code
```

### 3. Generate E2E Test for User Flow

```bash
# Input: User flow description

# Step 1: Break down flow into steps
# Example: Add Candidate
# - Navigate to form
# - Fill fields
# - Submit
# - Verify success

# Step 2: Generate Cypress test
# Create test file with all steps

# Step 3: Write test file
write: frontend/cypress/e2e/flow-name.cy.ts

# Step 4: Run Cypress test
bash: "cd frontend && npm run cypress:run -- --spec cypress/e2e/flow-name.cy.ts"
```

---

## Use Cases

### 1. Generate Tests for CandidateCard
**Command:** "Generate Jest tests for CandidateCard component"

**Actions:**
1. Read CandidateCard.tsx
2. Analyze props and functionality
3. Generate test cases
4. Create test file
5. Run tests

### 2. Add E2E Test for Position Management
**Command:** "Create Cypress E2E test for creating and editing positions"

**Actions:**
1. Define user flow steps
2. Generate Cypress test
3. Add assertions
4. Run test

### 3. Find Coverage Gaps
**Command:** "Analyze coverage and identify components needing tests"

**Actions:**
1. Run coverage report
2. Parse results
3. List files below 90%
4. Prioritize by importance
5. Generate report

### 4. Add Accessibility Tests
**Command:** "Add jest-axe tests for all components"

**Actions:**
1. Find all components
2. Generate a11y test files
3. Run accessibility checks
4. Report violations

---

## Quality Checklist

For each test:

- [ ] Follows AAA pattern (Arrange, Act, Assert)
- [ ] Uses semantic queries (getByRole, getByLabelText)
- [ ] Mocks external dependencies
- [ ] Tests happy path
- [ ] Tests error scenarios
- [ ] Tests edge cases
- [ ] Has descriptive test names
- [ ] Avoids implementation details
- [ ] Is deterministic (not flaky)
- [ ] Runs quickly (< 1 second per test)
- [ ] Contributes to 90% coverage goal

---

## Best Practices

### DO:
✅ Test behavior, not implementation
✅ Use data-testid for stable selectors
✅ Mock API calls consistently
✅ Test accessibility with jest-axe
✅ Create reusable fixtures
✅ Follow AAA pattern
✅ Write descriptive test names
✅ Test error states
✅ Use async/await for async tests
✅ Clean up after tests (clearMocks, resetAllMocks)

### DON'T:
❌ Test implementation details
❌ Use brittle selectors (class names, element positions)
❌ Leave commented-out tests
❌ Create flaky tests (timing dependencies)
❌ Test external libraries
❌ Duplicate test logic
❌ Skip edge cases
❌ Ignore accessibility

---

## Quick Reference

### React Testing Library Queries

```typescript
// Preferred (semantic)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Search...')
screen.getByText('Welcome')

// By Test ID (when semantic not possible)
screen.getByTestId('candidate-card')

// Async queries
await screen.findByText('Success')
await waitFor(() => expect(mockFn).toHaveBeenCalled())

// Query vs Get vs Find
getBy*     // Throws error if not found
queryBy*   // Returns null if not found
findBy*    // Async, waits and retries
```

### Jest Matchers

```typescript
// Basic
expect(value).toBe(expected)
expect(value).toEqual(expected) // Deep equality
expect(value).toBeTruthy()

// DOM (jest-dom)
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent('text')
expect(element).toHaveClass('className')
expect(element).toBeVisible()
expect(element).toBeDisabled()

// Functions
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
```

---

## Version History

- **1.0.0** (2025-10-03) - Initial agent specification

---

## Related Documentation

- [Component Generator Agent](./component-generator.md)
- [API Integration Agent](./api-integration.md)
- [CLAUDE.md](/CLAUDE.md)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
