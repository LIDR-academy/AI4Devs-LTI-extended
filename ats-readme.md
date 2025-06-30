# Sistema de Seguimiento de Talento (ATS)

## Descripción General

El Sistema de Seguimiento de Talento (ATS) es una plataforma integral diseñada para gestionar el proceso completo de reclutamiento y selección de candidatos. Esta aplicación permite a las empresas publicar ofertas de trabajo, gestionar candidatos, programar entrevistas, realizar evaluaciones y tomar decisiones informadas de contratación, todo en una única plataforma centralizada.

## Propósito

El propósito principal de este ATS es optimizar y digitalizar el proceso de reclutamiento, proporcionando a las empresas una herramienta eficiente para:

- Gestionar perfiles de candidatos y sus documentos asociados (CV, cartas de presentación)
- Seguir el progreso de los candidatos a través de diferentes etapas del proceso de selección
- Coordinar flujos de entrevistas personalizados por posición
- Mantener una base de datos centralizada de talento
- Facilitar la colaboración entre equipos de recursos humanos y departamentos técnicos
- Evaluar y calificar candidatos de manera sistemática

## Tecnologías

### Backend
- **Node.js** con **Express**: Framework para la creación de API RESTful
- **TypeScript**: Lenguaje de programación tipado que mejora la calidad del código
- **Prisma ORM**: Para interactuar con la base de datos PostgreSQL
- **Jest**: Framework para pruebas unitarias e integración
- **Swagger/OpenAPI**: Para documentación de la API
- **Multer**: Para gestión de carga de archivos
- **Serverless**: Soporte para despliegue en arquitecturas serverless

### Frontend
- **React**: Biblioteca para la construcción de interfaces de usuario
- **TypeScript**: Para un desarrollo frontend más robusto y mantenible
- **React Router**: Para la navegación
- **React Bootstrap**: Framework de componentes de UI
- **React Beautiful DnD & React DnD**: Para funcionalidad de arrastrar y soltar
- **React Datepicker**: Para selección de fechas

### Base de Datos
- **PostgreSQL**: Sistema de gestión de base de datos relacional

### DevOps
- **Docker**: Para contenedorización y entorno de desarrollo consistente
- **Docker Compose**: Para orquestar diferentes servicios

## Arquitectura

El proyecto sigue una arquitectura de capas que implementa principios de Clean Architecture y Domain-Driven Design:

### Estructura del Backend

```
backend/
├── src/
│   ├── application/     # Lógica de aplicación y casos de uso
│   ├── domain/          # Entidades y reglas de negocio
│   ├── infrastructure/  # Implementaciones técnicas y adaptadores
│   ├── presentation/    # Controladores y serialización
│   ├── routes/          # Definición de endpoints de API
│   └── index.ts         # Punto de entrada de la aplicación
├── prisma/              # Esquema y migraciones de la base de datos
└── tests/               # Pruebas unitarias e integración
```

### Estructura del Frontend

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Páginas de la aplicación
│   ├── hooks/           # Hooks personalizados
│   ├── services/        # Servicios para comunicación con API
│   ├── types/           # Definiciones de tipos TypeScript
│   └── App.tsx          # Componente principal
└── build/               # Compilación para producción
```

## Data Model

The system is based on the following main entities:

1. **Candidate**: Basic candidate information, including personal and professional data
   - Supports pagination, search, and sorting for efficient data retrieval
   - Includes comprehensive relationship management for education, work experience, and applications
2. **Education**: Educational history of candidates
3. **WorkExperience**: Previous work experience
4. **Resume**: CV documents stored per candidate with file type validation
5. **Company**: Companies using the system
6. **Employee**: System users (recruiters, interviewers)
7. **Position**: Published job offers with enhanced management capabilities
   - Support for complex job descriptions, requirements, and benefits
   - Configurable visibility and status management
8. **Application**: Candidate applications to specific positions
   - Real-time tracking of interview stages
   - Notes and progress management
9. **InterviewFlow**: Configurable interview flows per position
   - Custom process definitions for different roles
10. **InterviewStep**: Specific stages within an interview flow
    - Ordered steps with type definitions
11. **Interview**: Scheduled interviews with scoring and results
    - Support for average score calculations
    - Detailed notes and outcome tracking

### Advanced Data Features

- **Candidate Scoring System**: Automatic calculation of average scores across multiple interviews
- **Dynamic Stage Management**: Real-time updates of candidate progress through interview stages
- **Comprehensive Search**: Full-text search capabilities across candidate profiles
- **Data Integrity**: Foreign key constraints and validation rules ensure data consistency
- **Optimized Queries**: Efficient data loading with selective includes to prevent N+1 problems

## Instalación y Configuración

### Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Docker y Docker Compose
- PostgreSQL (si se ejecuta sin Docker)

### Pasos de Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-repositorio>
   cd <nombre-directorio>
   ```

2. **Configurar Variables de Entorno**:
   - Copia el archivo `.env.example` a `.env` en el directorio raíz
   - Configura las siguientes variables:
     ```
     DB_USER=LTIdbUser
     DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
     DB_NAME=LTIdb
     DB_PORT=5432
     DB_HOST=localhost
     PORT=3010
     ```

3. **Iniciar la Base de Datos con Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Instalar Dependencias del Backend**:
   ```bash
   cd backend
   npm install
   ```

5. **Configurar y Migrar la Base de Datos**:
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ts-node prisma/seed.ts
   ```

6. **Compilar e Iniciar el Backend**:
   ```bash
   cd backend
   npm run build
   npm start
   ```

7. **Instalar Dependencias del Frontend**:
   ```bash
   cd frontend
   npm install
   ```

8. **Iniciar el Frontend**:
   ```bash
   cd frontend
   npm start
   ```

La aplicación backend estará disponible en `http://localhost:3010` y el frontend en `http://localhost:3000`.

## API and Documentation

The system's RESTful API is documented using Swagger/OpenAPI. You can access the interactive documentation at:

```
http://localhost:3010/api-docs
```

The main endpoints include:

### Candidate Management
- `GET /candidates`: Retrieve all candidates with advanced features:
  - **Pagination**: `?page=1&limit=10`
  - **Search**: `?search=john` (searches across firstName, lastName, email)
  - **Sorting**: `?sort=firstName&order=asc` (supports firstName, lastName, email)
- `POST /candidates`: Create a new candidate with education, work experience, and CV
- `GET /candidates/:id`: Get detailed candidate information
- `PUT /candidates/:id`: Update candidate interview stage

### Position Management
- `GET /positions`: Retrieve all visible positions
- `PUT /positions/:id`: Update position details and configuration
- `GET /positions/:id/candidates`: Get candidates applying to a specific position with scores
- `GET /positions/:id/candidates/names`: Get simplified candidate names list for a position
- `GET /positions/:id/interviewflow`: Get the interview flow configuration for a position

### File Management
- `POST /upload`: Upload candidate CVs (supports PDF and DOCX formats)

### Advanced Features
- **Interview Flow Management**: Custom interview processes per position
- **Candidate Scoring**: Average scores calculation across multiple interviews
- **Application Tracking**: Full candidate journey through interview stages
- **Real-time Updates**: Dynamic stage updates for candidates in the recruitment pipeline

## Best Practices and Conventions

The project follows clean architecture principles and design patterns documented in the `ManifestoBuenasPracticas.md` file. Some of the key practices include:

- **Separation of Concerns**: Layered architecture with clear boundaries
- **TypeScript**: Static typing for improved code quality and maintainability
- **Domain-Driven Design**: Rich domain models with business logic encapsulation
- **Repository Pattern**: Data access abstraction for testability
- **Unit and Integration Testing**: Comprehensive test coverage with Jest and Cypress
- **API Documentation**: OpenAPI/Swagger for clear API contracts
- **Version Control**: Git Flow for structured development workflow

## Testing Strategy

### Backend Testing
- **Unit Tests**: Domain models, services, and business logic validation
- **Integration Tests**: API endpoints and database interactions
- **Test Coverage**: Comprehensive coverage for critical business flows

### Frontend Testing
- **End-to-End Tests**: Complete user workflows using Cypress
- **Component Testing**: React component behavior and integration
- **API Integration Tests**: Frontend-backend communication validation

## Deployment

The system is prepared for deployment in different environments:

### Local Deployment
Following the installation steps described previously.

### Production Deployment
- **Backend**: Can be deployed as a traditional service or serverless function
- **Frontend**: Can be deployed to any static site hosting service
- **Database**: PostgreSQL instance (cloud or on-premises)
- **File Storage**: Configurable upload directory for CV files

### Serverless Deployment
The backend includes serverless configuration (`serverless.yml`) for deployment to:
```bash
cd backend
npm run build:lambda
```

## Licencia

Este proyecto está licenciado bajo los términos especificados en el archivo LICENSE.md.

## Contribución

Para contribuir al proyecto, consulta las guías en el archivo `PRs.md` que describe el proceso de pull requests y los estándares de código a seguir. 