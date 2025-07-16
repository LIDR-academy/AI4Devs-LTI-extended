# LTI (Learning Technology Initiative) - ATS System

## 📋 Overview

The LTI ATS (Applicant Tracking System) is a modern, full-stack recruitment management platform designed to streamline the entire hiring process. This system enables organizations to efficiently manage candidates, track applications, organize interviews, and make data-driven hiring decisions.

### 🎯 Purpose

The LTI ATS addresses critical challenges in modern recruitment by providing:

- **Centralized Candidate Management**: Comprehensive candidate profiles with education, work experience, and document storage
- **Structured Interview Processes**: Customizable interview flows with multiple stages and evaluation criteria
- **Application Tracking**: End-to-end visibility of candidate progress through hiring pipelines
- **Collaborative Decision Making**: Multi-stakeholder interview coordination and evaluation tools
- **Data-Driven Insights**: Analytics and reporting for recruitment process optimization

### 🏗️ Architecture

The system follows **Domain-Driven Design (DDD)** principles with a clean, layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────────┐    ┌─────────────────────────────┐│
│  │   React Frontend    │    │   Express.js Controllers    ││
│  │   (TypeScript)      │    │      (REST API)             ││
│  └─────────────────────┘    └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Services & Use Cases                       ││
│  │    (candidateService, positionService, etc.)            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Domain Models & Business Logic                         ││
│  │  (Candidate, Position, Application, Interview)          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌─────────────────────┐    ┌─────────────────────────────┐│
│  │   PostgreSQL        │    │      Prisma ORM             ││
│  │   (Database)        │    │    (Data Access)            ││
│  └─────────────────────┘    └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technologies

### Backend
- **Node.js** with **TypeScript** - Server-side runtime and type safety
- **Express.js** - Web framework for REST API
- **Prisma ORM** - Type-safe database client and migrations
- **PostgreSQL** - Primary database for data persistence
- **Jest** - Unit and integration testing framework
- **Serverless Framework** - Cloud deployment capabilities

### Frontend
- **React 18** with **TypeScript** - Modern UI framework with type safety
- **React Bootstrap** - UI component library
- **React Router DOM** - Client-side routing
- **React Beautiful DnD** - Drag and drop functionality for Kanban boards
- **React DatePicker** - Date selection components

### DevOps & Testing
- **Docker** - Containerization for PostgreSQL database
- **Cypress** - End-to-end testing framework
- **ESLint** & **Prettier** - Code linting and formatting

## 📁 Folder Structure

```
AI4Devs-LTI/
├── 📁 backend/                      # Backend application
│   ├── 📁 src/
│   │   ├── 📁 presentation/         # Controllers & Routes
│   │   │   ├── 📁 controllers/      # REST API controllers
│   │   │   └── 📁 __tests__/        # Controller tests
│   │   ├── 📁 application/          # Application services
│   │   │   ├── 📁 services/         # Business logic services
│   │   │   └── validator.ts         # Input validation
│   │   ├── 📁 domain/               # Domain layer
│   │   │   ├── 📁 models/           # Domain entities
│   │   │   └── 📁 repositories/     # Repository interfaces
│   │   ├── 📁 infrastructure/       # Infrastructure layer
│   │   └── 📁 routes/               # API route definitions
│   ├── 📁 prisma/                   # Database schema & migrations
│   │   ├── schema.prisma            # Database schema definition
│   │   ├── 📁 migrations/           # Database migration files
│   │   └── seed.ts                  # Database seeding script
│   ├── package.json                 # Backend dependencies
│   ├── tsconfig.json               # TypeScript configuration
│   └── jest.config.js              # Jest testing configuration
│
├── 📁 frontend/                     # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/           # React components
│   │   ├── 📁 services/            # API service layers
│   │   ├── 📁 pages/               # Page components
│   │   └── App.js                  # Main application component
│   ├── 📁 cypress/                 # E2E testing
│   │   └── 📁 e2e/                 # Cypress test specs
│   ├── package.json                # Frontend dependencies
│   └── tsconfig.json              # TypeScript configuration
│
├── 📁 documentation/               # Project documentation
│   ├── DataModel.md               # Data model and entity documentation
│   └── api-spec.yml               # OpenAPI specification
│
├── 📁 memory-bank/                # Project context & documentation
│   ├── projectbrief.md           # Project overview
│   ├── productContext.md         # Business context
│   └── systemPatterns.md         # Architecture patterns
│
├── docker-compose.yml             # PostgreSQL containerization
├── package.json                   # Root project configuration
└── README.md                      # This file
```

## 🚀 Setup Instructions

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone the Repository

```bash
git clone git@github.com:LIDR-academy/AI4Devs-LTI-extended.git
cd AI4Devs-LTI-extended
```

### 2. Environment Configuration

Create environment files for both backend and frontend:

**Backend Environment** (`backend/.env`):
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=LTIdbUser
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_NAME=LTIdb

# Application Configuration
PORT=3000
NODE_ENV=development

# Prisma Database URL
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
```

**Frontend Environment** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3000
```

### 3. Database Setup (PostgreSQL with Docker)

Start the PostgreSQL database using Docker Compose:

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify the database is running
docker-compose ps
```

The PostgreSQL database will be available at:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `LTIdb`
- **Username**: `LTIdbUser`
- **Password**: `D1ymf8wyQEGthFR1E9xhCq`

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database with sample data
npx prisma db seed

# Start the development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 5. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend application will be available at `http://localhost:3001`

### 6. Cypress Testing Suite Setup

```bash
# From the frontend directory
cd frontend

# Install Cypress (if not already installed)
npm install

# Open Cypress Test Runner (Interactive)
npm run cypress:open

# Or run tests headlessly
npm run cypress:run
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run unit tests
npm test

# Run E2E tests with Cypress
npm run cypress:run

# Open Cypress Test Runner
npm run cypress:open
```

## 📊 Database Schema

The system uses the following main entities:

- **Candidates**: Personal information, education, work experience
- **Companies**: Organizations posting positions
- **Positions**: Job openings with requirements and descriptions
- **Applications**: Candidate applications to specific positions
- **Interview Flows**: Configurable interview process stages
- **Interviews**: Individual interview sessions and results

For detailed schema information, entity relationships, and the complete data model documentation, see [`documentation/DataModel.md`](documentation/DataModel.md).

## 🔗 API Documentation

The REST API follows OpenAPI 3.0 specification. Key endpoints include:

- `GET /candidates` - List candidates with filtering and pagination
- `POST /candidates` - Create new candidate
- `GET /candidates/{id}` - Get candidate details
- `GET /positions` - List available positions
- `POST /positions` - Create new position
- `PUT /candidates/{id}` - Update candidate interview stage

Full API documentation is available in `documentation/api-spec.yml`.

## 🤝 Contributing

1. Follow the established coding patterns and architecture
2. Write tests for new features
3. Update documentation for API changes
4. Use TypeScript for type safety
5. Follow the domain-driven design principles

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For questions or support, please contact the LTI Development Team. 