# Component Generator Agent

**Version:** 1.0.0
**Type:** Specialized Subagent
**Domain:** Frontend Development, React Component Creation

## Overview

This agent specializes in generating React components following LTI project patterns and conventions. It ensures consistency, applies React Bootstrap best practices, and generates components from templates or Figma designs.

## Core Responsibilities

### 1. Component Generation from Templates

**Objective:** Create React components following established patterns

**Tasks:**
- Generate components using predefined templates:
  - Card-Based Layout
  - Grid Layout
  - Filter Bar
  - Form Component
  - Modal/Offcanvas
  - List/Table Component
- Apply project naming conventions (PascalCase)
- Include proper imports (React, React Bootstrap, hooks)
- Add PropTypes or TypeScript interfaces
- Generate accompanying index.js for exports
- Include initial component structure with proper lifecycle

**Templates Available:**

#### **Card Component Template**
```tsx
import React from 'react';
import { Card, Button } from 'react-bootstrap';

interface ${ComponentName}Props {
  title: string;
  description: string;
  onAction?: () => void;
}

const ${ComponentName}: React.FC<${ComponentName}Props> = ({
  title,
  description,
  onAction
}) => {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{description}</Card.Text>
        {onAction && (
          <div className="d-flex justify-content-between mt-3">
            <Button variant="primary" onClick={onAction}>
              View Details
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ${ComponentName};
```

#### **Filter Bar Template**
```tsx
import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';

interface ${ComponentName}Props {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  search: string;
  date: string;
  status: string;
}

const ${ComponentName}: React.FC<${ComponentName}Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    date: '',
    status: ''
  });

  const handleChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Row className="mb-4">
      <Col md={3}>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </Col>
      <Col md={3}>
        <Form.Control
          type="date"
          value={filters.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </Col>
      <Col md={3}>
        <Form.Control
          as="select"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Form.Control>
      </Col>
    </Row>
  );
};

export default ${ComponentName};
```

#### **Modal Template**
```tsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ${ComponentName}Props {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ${ComponentName}: React.FC<${ComponentName}Props> = ({
  show,
  onHide,
  onConfirm,
  title,
  message
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ${ComponentName};
```

---

### 2. Component Generation from Figma

**Objective:** Convert Figma designs to React Bootstrap components

**Tasks:**
- Extract component structure from Figma nodes
- Map Figma components to React Bootstrap equivalents
- Generate TypeScript interfaces from Figma properties
- Apply design tokens (colors, spacing, typography)
- Preserve component hierarchy
- Generate responsive breakpoints
- Include accessibility attributes
- Map Figma variants to React props

**Figma to Bootstrap Mapping:**
```
Figma Frame → Container/Card
Figma Auto Layout (vertical) → Col/Stack
Figma Auto Layout (horizontal) → Row/d-flex
Figma Button → Button variant
Figma Input → Form.Control
Figma Text → Typography (h1-h6, p)
```

**Workflow:**
```bash
# Step 1: Get Figma node ID from user
# Example: "123:456"

# Step 2: Fetch component data
mcp__figma-dev-mode-mcp-server__get_code(
  nodeId="123:456",
  clientFrameworks="react,bootstrap",
  clientLanguages="typescript"
)

# Step 3: Get design variables
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId="123:456")

# Step 4: Get component metadata
mcp__figma-dev-mode-mcp-server__get_metadata(nodeId="123:456")

# Step 5: Generate optimized React Bootstrap code
# - Replace generic divs with Bootstrap components
# - Convert inline styles to utility classes
# - Add TypeScript types
# - Include proper imports

# Step 6: Create component file
write: frontend/src/components/${ComponentName}.tsx
```

---

### 3. PropTypes & TypeScript Interfaces

**Objective:** Generate proper type definitions

**Tasks:**
- Create TypeScript interfaces for component props
- Infer types from usage and context
- Generate types from backend API responses
- Add JSDoc comments for documentation
- Include optional vs required props
- Define union types for variants
- Create shared type definitions
- Export types for reuse

**Type Generation Examples:**

```typescript
// From API Response
interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  educations: Education[];
  workExperiences: WorkExperience[];
}

// Component Props
interface CandidateCardProps {
  candidate: Candidate;
  onClick?: (candidate: Candidate) => void;
  showActions?: boolean;
  variant?: 'compact' | 'detailed';
}

// Event Handlers
interface FormHandlers {
  onSubmit: (data: FormData) => Promise<void>;
  onChange: (field: string, value: string) => void;
  onError: (error: Error) => void;
}
```

---

### 4. Component Patterns Application

**Objective:** Ensure generated components follow project patterns

**Tasks:**
- Apply Card-Based Layout pattern
- Use Grid Layout pattern for dashboards
- Implement Filter Bar pattern for lists
- Include Loading State pattern
- Include Error State pattern
- Apply proper spacing (mt-5, mb-4, p-4)
- Use semantic button variants
- Include accessibility attributes
- Follow responsive design patterns

**Pattern Validation Checklist:**
- [ ] Uses React Bootstrap components
- [ ] No inline styles
- [ ] Proper className utility usage
- [ ] Includes loading and error states
- [ ] Has TypeScript types
- [ ] Includes aria-labels
- [ ] Responsive breakpoints defined
- [ ] Follows naming conventions
- [ ] Proper file location (frontend/src/components/)

---

### 5. Naming Conventions

**Objective:** Ensure consistent naming across codebase

**Tasks:**
- Apply PascalCase for component names
- Use camelCase for functions and variables
- Follow descriptive naming patterns
- Prefix boolean props with is/has/should
- Suffix handler props with onEvent pattern
- Use plural names for arrays
- Name files to match component names

**Naming Rules:**
```typescript
// Components
CandidateCard.tsx          ✅
candidateCard.tsx          ❌
candidate-card.tsx         ❌

// Props
interface CandidateCardProps {
  candidate: Candidate;    ✅
  isSelected: boolean;     ✅
  hasActions: boolean;     ✅
  onClick: () => void;     ✅
  onDeleteClick: () => void; ✅
  candidates: Candidate[]; ✅ (plural for arrays)
}

// State variables
const [isLoading, setIsLoading] = useState(false);     ✅
const [candidates, setCandidates] = useState([]);      ✅
const [selectedCandidate, setSelectedCandidate] = useState(); ✅
```

---

### 6. Import Management

**Objective:** Generate correct and organized imports

**Tasks:**
- Group imports by category (React, libraries, components, utils)
- Use named imports from React Bootstrap
- Include CSS imports when needed (react-datepicker)
- Avoid default imports for React Bootstrap
- Sort imports alphabetically within groups
- Remove unused imports

**Import Template:**
```typescript
// React core
import React, { useState, useEffect, useCallback } from 'react';

// Third-party libraries
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Local components
import CandidateCard from './CandidateCard';
import FilterBar from './FilterBar';

// Services and utilities
import { candidateService } from '../services/candidateService';
import { formatDate } from '../utils/dateUtils';

// Types
import type { Candidate } from '../models/Candidate';

// Assets
import logo from '../assets/lti-logo.png';
```

---

### 7. Component Documentation

**Objective:** Generate comprehensive component documentation

**Tasks:**
- Add JSDoc comments to components
- Document props and their purposes
- Include usage examples
- Document event handlers
- Add notes about patterns used
- Document accessibility features
- Include responsive behavior notes

**Documentation Template:**
```typescript
/**
 * CandidateCard - Displays candidate information in a card layout
 *
 * @component
 * @example
 * ```tsx
 * <CandidateCard
 *   candidate={candidateData}
 *   onClick={handleClick}
 *   showActions={true}
 * />
 * ```
 *
 * @param {Candidate} candidate - The candidate object to display
 * @param {Function} onClick - Optional callback when card is clicked
 * @param {boolean} showActions - Whether to show action buttons
 *
 * @pattern Card-Based Layout
 * @accessibility Includes aria-label for interactive elements
 * @responsive Stacks on mobile (xs), side-by-side on tablet+ (md)
 */
```

---

## Tools & Permissions

### Available Tools

#### **File Operations**
- **Write** - Create new component files
- **Edit** - Modify existing components
- **Read** - Read existing components for reference
- **Glob** - Find existing components and patterns

#### **Code Analysis**
- **Grep** - Search for patterns in codebase:
  - Find similar components
  - Check naming conventions
  - Identify pattern usage

#### **Figma Integration**
- **figma-dev-mode-mcp-server** - Generate from Figma designs
  - `get_code()` - Get component code
  - `get_metadata()` - Get structure
  - `get_variable_defs()` - Get design tokens
  - `get_screenshot()` - Visual reference

#### **Documentation**
- **WebFetch** - Fetch documentation:
  - React Bootstrap component docs
  - React TypeScript patterns
  - Accessibility guidelines

#### **Validation**
- **Bash** - Run validation:
  ```bash
  # TypeScript validation
  npx tsc --noEmit

  # Component import validation
  cd frontend && npm run build
  ```

---

## Project Context

### File Structure
```
frontend/src/
├── components/
│   ├── ${ComponentName}.tsx    # Component file
│   ├── ${ComponentName}.test.tsx  # (to be created by testing agent)
│   └── index.ts                # Barrel export (optional)
├── models/
│   └── ${ModelName}.ts         # Type definitions
├── services/
│   └── ${serviceName}Service.ts  # API services
└── utils/
    └── ${utilName}.ts          # Utility functions
```

### Component Categories

1. **Layout Components**
   - Dashboard grids
   - Page containers
   - Section wrappers

2. **Display Components**
   - Cards (Candidate, Position)
   - Lists and tables
   - Detail views

3. **Form Components**
   - Input groups
   - File uploaders
   - Date pickers
   - Form wizards (multi-step)

4. **Interaction Components**
   - Modals and offcanvas
   - Drag & drop containers
   - Button groups

5. **Feedback Components**
   - Loading spinners
   - Error alerts
   - Success messages

---

## Generation Workflows

### 1. Generate Component from Scratch

```bash
# Input: Component name, type/pattern, props

# Step 1: Determine template
# Based on type: card, filter, form, modal, list

# Step 2: Apply template
# Replace ${ComponentName} with actual name

# Step 3: Generate props interface
# Based on requirements

# Step 4: Add imports
# React, Bootstrap components, types

# Step 5: Apply patterns
# Loading states, error handling, accessibility

# Step 6: Write file
write: frontend/src/components/${ComponentName}.tsx

# Step 7: Validate
bash: "cd frontend && npx tsc --noEmit"
```

### 2. Generate Component from Figma

```bash
# Input: Figma node ID

# Step 1: Fetch Figma data
mcp__figma-dev-mode-mcp-server__get_code(nodeId)
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId)

# Step 2: Parse and optimize
# - Map to React Bootstrap components
# - Convert styles to utility classes
# - Extract design tokens

# Step 3: Generate TypeScript types
# From Figma component properties

# Step 4: Apply project patterns
# Add loading/error states, accessibility

# Step 5: Create file
write: frontend/src/components/${ComponentName}.tsx

# Step 6: Validate
bash: "cd frontend && npx tsc --noEmit"
```

### 3. Generate Component Variant

```bash
# Input: Existing component, variant name

# Step 1: Read existing component
read: frontend/src/components/${BaseComponent}.tsx

# Step 2: Analyze structure
# Identify customizable parts

# Step 3: Extract to variant prop
# Add variant prop to interface
# Implement conditional rendering

# Step 4: Update component
edit: frontend/src/components/${BaseComponent}.tsx

# Step 5: Validate
bash: "cd frontend && npx tsc --noEmit"
```

---

## Use Cases

### 1. Create Dashboard Card
**Command:** "Generate a PositionMetricsCard component with total positions, open positions, and filled positions"

**Output:**
```tsx
// frontend/src/components/PositionMetricsCard.tsx
import React from 'react';
import { Card } from 'react-bootstrap';

interface PositionMetrics {
  total: number;
  open: number;
  filled: number;
}

interface PositionMetricsCardProps {
  metrics: PositionMetrics;
}

const PositionMetricsCard: React.FC<PositionMetricsCardProps> = ({ metrics }) => {
  return (
    <Card className="shadow p-4">
      <Card.Body>
        <Card.Title className="mb-4">Position Metrics</Card.Title>
        <div className="d-flex justify-content-between">
          <div>
            <h3>{metrics.total}</h3>
            <p className="text-muted">Total</p>
          </div>
          <div>
            <h3>{metrics.open}</h3>
            <p className="text-muted">Open</p>
          </div>
          <div>
            <h3>{metrics.filled}</h3>
            <p className="text-muted">Filled</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PositionMetricsCard;
```

### 2. Generate from Figma
**Command:** "Create InterviewStageCard from Figma node 234:567"

**Actions:**
1. Fetch Figma component
2. Extract structure and styles
3. Map to React Bootstrap
4. Generate TypeScript types
5. Create component file

### 3. Create Filter Component
**Command:** "Generate ApplicationFilter with search, date range, and status"

**Output:** Complete filter bar component following Filter Bar Pattern

### 4. Create Confirmation Modal
**Command:** "Generate DeleteConfirmationModal for candidate deletion"

**Output:** Modal component with proper button variants and handlers

---

## Quality Checklist

Before component generation is complete, verify:

- [ ] Component name follows PascalCase convention
- [ ] File location is correct (frontend/src/components/)
- [ ] TypeScript interface is defined
- [ ] All imports are present and organized
- [ ] React Bootstrap components are used (no plain HTML)
- [ ] No inline styles
- [ ] Utility classes follow project patterns
- [ ] Accessibility attributes included (aria-label)
- [ ] Responsive breakpoints defined
- [ ] Loading/Error states included (if async)
- [ ] JSDoc documentation added
- [ ] Component exports correctly
- [ ] TypeScript compiles without errors

---

## Best Practices

### DO:
✅ Use React Bootstrap components exclusively
✅ Apply Bootstrap utility classes
✅ Include TypeScript types
✅ Follow established patterns
✅ Add accessibility attributes
✅ Include loading and error states for async operations
✅ Use descriptive prop names
✅ Export components as default
✅ Group related components in same file if small

### DON'T:
❌ Use inline styles
❌ Create custom CSS files
❌ Use plain HTML elements
❌ Mix .js and .tsx files
❌ Use `any` type
❌ Forget responsive breakpoints
❌ Skip accessibility attributes
❌ Use generic names (Component1, MyComponent)

---

## Quick Reference

### Common Component Patterns

| Pattern | Use Case | Key Components |
|---------|----------|----------------|
| Card-Based | Display items | Card, Card.Body, Card.Title |
| Grid Layout | Dashboards | Container, Row, Col |
| Filter Bar | List filtering | Row, Form.Control |
| Loading State | Async operations | Spinner, Container |
| Error State | Error handling | Alert, Button |
| Modal | Confirmations | Modal, Modal.Header, Modal.Body |
| Form | Data input | Form, Form.Control, Form.Group |

### Bootstrap Component Imports

```typescript
// Layout
import { Container, Row, Col } from 'react-bootstrap';

// Content
import { Card } from 'react-bootstrap';

// Forms
import { Form, Button, InputGroup } from 'react-bootstrap';

// Feedback
import { Alert, Spinner, Toast } from 'react-bootstrap';

// Navigation
import { Nav, Navbar, Breadcrumb } from 'react-bootstrap';

// Overlays
import { Modal, Offcanvas, Tooltip } from 'react-bootstrap';
```

---

## Version History

- **1.0.0** (2025-10-03) - Initial agent specification

---

## Related Documentation

- [CSS & UX Auditor Agent](./css-ux-auditor.md)
- [CLAUDE.md](/CLAUDE.md)
- [React Bootstrap Components](https://react-bootstrap.github.io/components/)
