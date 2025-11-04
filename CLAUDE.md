# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Node.js/TypeScript/Express)
- **Development server**: `cd backend && npm run dev` (runs on port 3010)
- **Build**: `cd backend && npm run build`
- **Tests**: `cd backend && npm test`
- **Test with coverage**: `cd backend && npm run test:coverage`
- **Database operations**:
  - Generate Prisma client: `cd backend && npm run prisma:generate`
  - Run migrations: `cd backend && npx prisma migrate deploy`
  - Seed database: `cd backend && npx prisma db seed`
  - Reset database: `cd backend && npx prisma migrate reset`

### Frontend (React/TypeScript)
- **Development server**: `cd frontend && npm start` (runs on port 3000)
- **Build**: `cd frontend && npm run build`
- **Tests**: `cd frontend && npm test`
- **E2E tests**: `cd frontend && npm run cypress:run` (headless) or `npm run cypress:open` (interactive)

### Database (PostgreSQL)
- **Start**: `docker-compose up -d`
- **Stop**: `docker-compose down`
- **Verify status**: `docker-compose ps`

## Architecture Overview

### Backend Architecture (Domain-Driven Design)
The backend follows a layered DDD architecture:

**Presentation Layer** (`src/presentation/`)
- Controllers handle HTTP requests/responses
- Routes define API endpoints
- Controllers use services from Application layer

**Application Layer** (`src/application/`)
- Services contain business logic and orchestration
- Validator handles input validation
- Services use repositories from Domain layer

**Domain Layer** (`src/domain/`)
- Models define core business entities (Candidate, Position, Application, Interview, etc.)
- Repository interfaces define data access contracts
- Pure business logic without external dependencies

**Infrastructure Layer** (implicit)
- Prisma ORM handles database operations
- Repository implementations (via Prisma) satisfy domain interfaces

### Frontend Architecture
- **React Router**: Client-side routing with BrowserRouter
- **Component Structure**: Page components in `src/components/`
- **Services**: API clients in `src/services/` (candidateService, positionService)
- **State Management**: Local React state (no global state management)

### Data Model Core Entities
- **Candidate**: Personal info, education, work experience, resumes
- **Position**: Job postings with requirements, linked to Company and InterviewFlow
- **Application**: Links candidates to positions, tracks interview progress
- **Interview**: Individual interview sessions with results and scores
- **InterviewFlow/InterviewStep**: Configurable multi-stage interview processes
- **Company**: Organizations posting positions
- **Employee**: Company staff who conduct interviews

## Key Patterns and Conventions

### Backend Patterns
- **Repository Pattern**: Domain interfaces with Prisma implementations
- **Service Layer**: Business logic separation from controllers
- **Dependency Injection**: Prisma client injected via Express middleware
- **Error Handling**: Global error middleware for consistent responses
- **File Structure**: Organized by architectural layers, not features

### Frontend Patterns
- **Component Props**: TypeScript interfaces for component props
- **Service Layer**: Centralized API calls with error handling
- **Bootstrap UI**: React Bootstrap components for consistent styling
- **Routing**: Protected routes and navigation patterns

### Database Patterns
- **Prisma Schema**: Single source of truth in `backend/prisma/schema.prisma`
- **Migrations**: Version-controlled database changes
- **Relationships**: Foreign keys with Prisma relations
- **Seeding**: Sample data generation for development

## Testing Strategy

### Backend Testing (Jest)
- **Unit Tests**: Service layer logic testing
- **Integration Tests**: Controller and repository testing
- **Coverage Threshold**: 90% for branches, functions, lines, statements
- **Test Location**: `__tests__` directories and `.test.ts` files

### Frontend Testing
- **Unit Tests**: Component testing with React Testing Library
- **E2E Tests**: Cypress tests in `cypress/e2e/`
- **Configuration**: Cypress baseUrl: localhost:3000, API_URL: localhost:3010

## Development Environment

### Database Setup
- PostgreSQL runs in Docker container
- Database: LTIdb, User: LTIdbUser, Port: 5432
- Connection via DATABASE_URL in `.env`

### Port Configuration
- Backend API: http://localhost:3010
- Frontend: http://localhost:3000
- Database: localhost:5432

### Environment Files Required
**Backend** (`backend/.env`):
```
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
PORT=3010
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:3010
```

## API Patterns

### REST Endpoints
- GET /candidates - List with filtering/pagination
- POST /candidates - Create new candidate
- PUT /candidates/:id - Update candidate interview stage
- GET /positions - List available positions
- POST /positions - Create new position
- POST /upload - File upload handling

### Request/Response Patterns
- JSON request/response bodies
- Consistent error response format
- CORS enabled for frontend origin
- Prisma client attached to all requests via middleware

## Serverless Deployment
- Serverless Framework support for AWS Lambda
- Build command: `npm run build:lambda`
- Lambda entry point: `src/lambda.ts`
- Serverless HTTP adapter wraps Express app