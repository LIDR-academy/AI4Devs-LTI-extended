# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LTI (Learning Technology Initiative) is a full-stack Applicant Tracking System (ATS) for managing candidates, positions, applications, and interviews. The system follows **Domain-Driven Design (DDD)** principles with a clean, layered architecture.

**Tech Stack:**
- Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- Frontend: React 18, TypeScript, React Bootstrap
- Testing: Jest (backend), Cypress (E2E)
- DevOps: Docker (PostgreSQL), Serverless Framework

## Essential Commands

### Database Setup & Management
```bash
# Start PostgreSQL container
docker-compose up -d

# Generate Prisma client (run after schema changes)
cd backend && npm run prisma:generate

# Run database migrations
cd backend && npx prisma migrate deploy

# Seed the database with sample data
cd backend && npx prisma db seed

# Open Prisma Studio (database GUI)
cd backend && npx prisma studio
```

### Backend Development
```bash
cd backend

# Install dependencies
npm install

# Development server (auto-reload with ts-node-dev)
npm run dev                    # Server runs on http://localhost:3010

# Build TypeScript to JavaScript
npm run build

# Run production build
npm run start:prod

# Testing
npm test                       # Run all tests
npm run test -- --testNamePattern="pattern"  # Run specific tests
npm run test -- --watch        # Watch mode (not available, use jest --watch directly)

# Lambda build (for serverless deployment)
npm run build:lambda
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Development server
npm start                      # Runs on http://localhost:3001

# Build for production
npm build

# Testing
npm test                       # Run Jest tests
npm run cypress:open           # Open Cypress Test Runner (interactive)
npm run cypress:run            # Run Cypress tests headlessly
```

## Architecture Overview

### Layered Architecture (Backend)

The backend follows a strict layered architecture. **Always respect layer boundaries:**

```
presentation/ (Controllers, Routes)
    ↓ calls
application/ (Services, Business Logic)
    ↓ calls
domain/ (Models, Repository Interfaces)
    ↓ implemented by
infrastructure/ (Prisma, Database Access)
```

**Key principles:**
- Controllers (presentation layer) should only handle HTTP requests/responses and call services
- Services (application layer) contain business logic and orchestrate domain models
- Domain models define entities and business rules
- Repository interfaces are defined in the domain layer, implemented in infrastructure
- Models use Prisma Client directly for database operations (Active Record pattern)

### File Organization

**Backend:**
- `src/presentation/controllers/` - HTTP request handlers
- `src/application/services/` - Business logic and orchestration
- `src/domain/models/` - Domain entities (Candidate, Position, etc.)
- `src/domain/repositories/` - Repository interface definitions
- `src/routes/` - Express route definitions
- `src/infrastructure/` - Logger and infrastructure utilities
- `prisma/schema.prisma` - Database schema definition
- `prisma/migrations/` - Database migration history
- `prisma/seed.ts` - Database seeding script

**Frontend:**
- `src/components/` - React components (Candidates.tsx, Positions.tsx, etc.)
- `src/services/` - API service layer for backend communication
- `src/pages/` - Page-level components
- `src/models/` - TypeScript type definitions and enums
- `src/assets/` - Static assets (images, logos)
- `cypress/e2e/` - End-to-end tests

### Frontend Architecture & Styling

**Component Libraries:**
- **React Bootstrap** - Primary UI component library (v5.3.3)
  - Import pattern: `import { Component } from 'react-bootstrap'`
  - Components used: Container, Row, Col, Card, Form, Button, Alert, Spinner, Offcanvas, InputGroup, FormControl
  - **Always use React Bootstrap components** instead of plain HTML elements for consistency

**Additional UI Libraries:**
- **react-datepicker** - Date selection component
  - Import CSS: `import 'react-datepicker/dist/react-datepicker.css'`
  - Used in forms for date inputs (education, work experience, application deadlines)

- **react-beautiful-dnd** - Drag and drop functionality
  - Used in Kanban board (`PositionDetails.js`) for moving candidates between interview stages
  - Components: `DragDropContext`, `Droppable`, `Draggable`

- **react-bootstrap-icons** - Icon library
  - Example: `import { Trash } from 'react-bootstrap-icons'`
  - Used for action buttons (delete, edit, etc.)

**CSS Architecture:**

The application uses minimal custom CSS, relying primarily on Bootstrap utility classes:

1. **Global Styles** (`src/index.css`):
   - Font stack: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', etc.)
   - Font smoothing enabled for better rendering
   - Code font: Monospace stack (source-code-pro, Menlo, Monaco, Consolas)

2. **App Styles** (`src/App.css`):
   - Minimal custom styles (mostly default Create React App styles)
   - App logo animation
   - App header styles

3. **Bootstrap Utility Classes (Primary Styling Method)**:

   **Spacing:**
   - `mt-{1-5}` - Margin top (e.g., `mt-5`, `mt-3`, `mb-4`)
   - `mb-{1-5}` - Margin bottom
   - `p-{1-5}` - Padding
   - `className="mt-5"` - Common pattern for top-level containers

   **Layout:**
   - `Container` - Main content wrapper
   - `Row` - Grid row wrapper
   - `Col md={3|4|6|12}` - Responsive columns
   - `className="text-center"` - Center-aligned text
   - `className="d-flex justify-content-between"` - Flexbox utilities

   **Visual Effects:**
   - `className="shadow-sm"` - Subtle shadow on cards
   - `className="shadow p-4"` - Shadow with padding (dashboard cards)
   - `className="visually-hidden"` - Screen reader only text

**Component Design Patterns:**

1. **Card-Based Layouts:**
   ```jsx
   <Card className="shadow-sm">
     <Card.Body>
       <Card.Title>{title}</Card.Title>
       <Card.Text>{content}</Card.Text>
       <div className="d-flex justify-content-between mt-3">
         <Button variant="primary">Action 1</Button>
         <Button variant="secondary">Action 2</Button>
       </div>
     </Card.Body>
   </Card>
   ```

2. **Grid Layout Pattern:**
   ```jsx
   <Container className="mt-5">
     <Row>
       <Col md={4}>{/* Card 1 */}</Col>
       <Col md={4}>{/* Card 2 */}</Col>
       <Col md={4}>{/* Card 3 */}</Col>
     </Row>
   </Container>
   ```

3. **Filter Bar Pattern:**
   ```jsx
   <Row className="mb-4">
     <Col md={3}><Form.Control type="text" placeholder="Search..." /></Col>
     <Col md={3}><Form.Control type="date" /></Col>
     <Col md={3}><Form.Control as="select">{options}</Form.Control></Col>
   </Row>
   ```

**Status Badge System:**

Position status badges use Bootstrap background colors (defined in `src/models/enums/PositionStatus.ts`):
```jsx
<span className={`badge ${getPositionStatusBadgeColor(status)} text-white`}>
  {status}
</span>
```

Badge color mapping:
- `Open` → `bg-warning` (yellow)
- `Contratado` → `bg-success` (green)
- `Cerrado` → `bg-warning` (yellow)
- `Borrador` → `bg-secondary` (gray)

**Button Variants:**
- `variant="primary"` - Primary actions (view details, submit)
- `variant="secondary"` - Secondary actions (edit, cancel)
- `variant="link"` - Link-style buttons (back/navigation)
- `variant="outline-danger"` - Destructive actions (retry, delete)

**Loading & Error States:**

1. **Loading State:**
   ```jsx
   <Container className="mt-5 text-center">
     <Spinner animation="border" role="status">
       <span className="visually-hidden">Loading...</span>
     </Spinner>
     <p className="mt-2">Loading message...</p>
   </Container>
   ```

2. **Error State:**
   ```jsx
   <Alert variant="danger">
     <Alert.Heading>Error</Alert.Heading>
     <p>{errorMessage}</p>
     <Button variant="outline-danger" onClick={retry}>Retry</Button>
   </Alert>
   ```

**Styling Guidelines:**

1. **DO NOT use inline styles** - Use Bootstrap utility classes or component props instead
2. **DO NOT create custom CSS files for components** - Leverage Bootstrap utilities
3. **Use responsive column sizing** - Always specify `md`, `lg` breakpoints: `<Col md={4}>`
4. **Maintain consistent spacing** - Use `mt-5` for page containers, `mb-4` for sections
5. **Use semantic color variants** - `primary`, `secondary`, `success`, `danger`, `warning`
6. **Include ARIA labels** - For accessibility: `aria-label="Descriptive text"`

**File Upload Styling:**

File uploads use the `FileUploader.js` component with:
- `InputGroup` for file selection
- `Button` with `Spinner` for upload state
- Custom file type validation (PDF, DOCX)

**Kanban Board (Drag & Drop):**

The interview flow board uses a multi-column layout:
- Each stage is a `StageColumn` component
- Cards are draggable via `react-beautiful-dnd`
- Candidates sorted by rating (highest first)
- `Offcanvas` component for candidate details sidebar

**You have extensive information about ./documentation/frontend.md**

### Domain Models

The system uses these core domain entities (see `documentation/DataModel.md` for details):

1. **Candidate** - Job candidates with education, work experience, and resumes
2. **Position** - Job openings with requirements and interview flows
3. **Application** - Links candidates to positions, tracks interview progress
4. **InterviewFlow** - Defines the sequence of interview steps for a position
5. **InterviewStep** - Individual steps within an interview flow
6. **Interview** - Actual interview sessions with results and scores
7. **Company** - Organizations posting positions
8. **Employee** - Company employees who conduct interviews

### Database Schema Patterns

**Important relationships:**
- Each Position has an InterviewFlow (many-to-one)
- InterviewFlow contains multiple InterviewSteps (one-to-many)
- Applications track the current InterviewStep (many-to-one)
- Candidates can have multiple Applications (one-to-many)
- Each Application can have multiple Interviews (one-to-many)

**When modifying the database:**
1. Update `backend/prisma/schema.prisma`
2. Run `npm run prisma:generate` to regenerate the Prisma client
3. Create a migration: `npx prisma migrate dev --name descriptive_name`
4. Update `documentation/DataModel.md` to reflect changes (ALWAYS in English)

## Development Guidelines

### Documentation Standards
- **ALL technical documentation MUST be written in English** (code comments, README, API specs, data models)
- When making commits, git push, or documenting changes, always review and update relevant documentation
- Key docs to update:
  - `documentation/DataModel.md` - For data model changes
  - `documentation/api-spec.yml` - For API endpoint changes
  - `README.md` - For major feature additions

### Code Patterns

**Adding a New Candidate (typical flow):**
1. Controller receives HTTP request (`candidateController.ts:addCandidateController`)
2. Controller calls service (`candidateService.ts:addCandidate`)
3. Service validates data using `application/validator.ts`
4. Service creates domain model instance (`new Candidate(data)`)
5. Domain model's `save()` method persists to database via Prisma
6. Service handles related entities (Education, WorkExperience, Resume)
7. Controller sends HTTP response

**Testing Strategy:**
- Backend: Unit tests in `src/**/__tests__/` or `src/**/*.test.ts`
- Frontend: E2E tests in `frontend/cypress/e2e/`
- Test coverage threshold: 90% (branches, functions, lines, statements)

### API Structure

- Base URL (dev): `http://localhost:3010`
- All endpoints follow REST conventions
- Candidate endpoints: `/candidates`, `/candidates/:id`
- Position endpoints: `/positions`, `/positions/:id`
- File uploads: `/upload`

**Important:** The backend server runs on port **3010** (not 3000 as mentioned in some docs). The API base URL for development is `http://localhost:3010`.

### Common Pitfalls

1. **CORS Configuration**: Backend allows CORS from `http://localhost:3000`, but frontend runs on `http://localhost:3001`. Update CORS config in `backend/src/index.ts` if needed.

2. **Prisma Client Generation**: Always run `npm run prisma:generate` after schema changes before starting the dev server.

3. **Database Connection**: Ensure PostgreSQL is running via Docker before starting backend: `docker-compose up -d`

4. **Port Conflicts**: Backend uses port 3010. If changing, update:
   - `backend/src/index.ts` (port constant)
   - `frontend/.env` (REACT_APP_API_URL)

5. **Layer Violations**: Never import infrastructure code directly into controllers. Always go through the service layer.

### Validation Rules

**Candidate Validation** (see `application/validator.ts`):
- First/last name: 2-100 characters, letters only
- Email: Required, unique, valid format
- Phone: Optional, Spanish format (6|7|9)XXXXXXXX
- Maximum 3 education records per candidate

**Position Validation**:
- Title: Required, max 100 characters
- Status: One of [Open, Contratado, Cerrado, Borrador]
- Salary: Non-negative, salaryMax >= salaryMin
- Application deadline: Must be future date

## Project Context Files

For deeper understanding, refer to:
- `memory-bank/projectbrief.md` - High-level project overview
- `memory-bank/productContext.md` - Business context and requirements
- `memory-bank/systemPatterns.md` - Architectural patterns and decisions
- `documentation/DataModel.md` - Complete data model specification
- `documentation/api-spec.yml` - Full OpenAPI specification
- `.cursor/rules/LTI.mdc` - Cursor-specific project rules
- `.cursor/rules/project-specifications.mdc` - Additional project specifications

## Quick Reference

**Common Tasks:**
- Add new endpoint: Create route → controller → service → model method
- Modify data model: Update schema.prisma → generate → migrate → update docs
- Add validation: Update `application/validator.ts`
- Debug database: `npx prisma studio` (opens GUI at http://localhost:5555)
- Reset database: `npx prisma migrate reset` (WARNING: deletes all data)
