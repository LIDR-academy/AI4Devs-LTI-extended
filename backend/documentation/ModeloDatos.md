## **Descripción del Proyecto**

Este proyecto es un sistema de gestión de candidatos y entrevistas que facilita la administración de procesos de selección de personal. El sistema gestiona la información de los candidatos, sus experiencias laborales y académicas, así como las posiciones abiertas en las empresas y los procesos de entrevistas asociados.

## **Modelo de Base de Datos**

### **Entidades y Relaciones**

### **Candidate (Candidato)**

- **id**: Identificador único del candidato (autoincremental).
- **firstName**: Nombre del candidato.
- **lastName**: Apellido del candidato.
- **email**: Correo electrónico del candidato (único).
- **phone**: Teléfono del candidato.
- **address**: Dirección del candidato.

Relaciones:

- Un candidato puede tener múltiples experiencias educativas (Education).
- Un candidato puede tener múltiples experiencias laborales (WorkExperience).
- Un candidato puede tener múltiples currículums (Resume).
- Un candidato puede tener múltiples aplicaciones a posiciones (Application).

### **Education (Educación)**

- **id**: Identificador único de la educación (autoincremental).
- **institution**: Institución educativa.
- **title**: Título obtenido.
- **startDate**: Fecha de inicio de la educación.
- **endDate**: Fecha de finalización de la educación.
- **candidateId**: Identificador del candidato (FK).

### **WorkExperience (Experiencia Laboral)**

- **id**: Identificador único de la experiencia laboral (autoincremental).
- **company**: Empresa donde se trabajó.
- **position**: Cargo ocupado.
- **description**: Descripción del trabajo realizado.
- **startDate**: Fecha de inicio del trabajo.
- **endDate**: Fecha de finalización del trabajo.
- **candidateId**: Identificador del candidato (FK).

### **Resume (Currículum)**

- **id**: Identificador único del currículum (autoincremental).
- **filePath**: Ruta del archivo del currículum.
- **fileType**: Tipo de archivo del currículum.
- **uploadDate**: Fecha de subida del currículum.
- **candidateId**: Identificador del candidato (FK).

### **Company (Empresa)**

- **id**: Identificador único de la empresa (autoincremental).
- **name**: Nombre de la empresa (único).

Relaciones:

- Una empresa puede tener múltiples empleados (Employee).
- Una empresa puede tener múltiples posiciones abiertas (Position).

### **Employee (Empleado)**

- **id**: Identificador único del empleado (autoincremental).
- **companyId**: Identificador de la empresa (FK).
- **name**: Nombre del empleado.
- **email**: Correo electrónico del empleado (único).
- **role**: Rol del empleado.
- **isActive**: Indica si el empleado está activo (por defecto, true).

### **InterviewType (Tipo de Entrevista)**

- **id**: Identificador único del tipo de entrevista (autoincremental).
- **name**: Nombre del tipo de entrevista.
- **description**: Descripción del tipo de entrevista.

Relaciones:

- Un tipo de entrevista puede estar asociado a múltiples pasos de entrevista (InterviewStep).

### **InterviewFlow (Flujo de Entrevista)**

- **id**: Identificador único del flujo de entrevista (autoincremental).
- **description**: Descripción del flujo de entrevista.

Relaciones:

- Un flujo de entrevista puede tener múltiples pasos de entrevista (InterviewStep).
- Un flujo de entrevista puede estar asociado a múltiples posiciones (Position).

### **InterviewStep (Paso de Entrevista)**

- **id**: Identificador único del paso de entrevista (autoincremental).
- **interviewFlowId**: Identificador del flujo de entrevista (FK).
- **interviewTypeId**: Identificador del tipo de entrevista (FK).
- **name**: Nombre del paso de entrevista.
- **orderIndex**: Índice de orden del paso en el flujo de entrevistas.

Relaciones:

- Un paso de entrevista puede estar asociado a múltiples aplicaciones (Application).
- Un paso de entrevista puede estar asociado a múltiples entrevistas (Interview).

### **Position (Posición)**

- **id**: Identificador único de la posición (autoincremental).
- **companyId**: Identificador de la empresa (FK).
- **interviewFlowId**: Identificador del flujo de entrevistas (FK).
- **title**: Título de la posición.
- **description**: Descripción de la posición.
- **status**: Estado de la posición (por defecto, 'Draft').
- **isVisible**: Indica si la posición es visible (por defecto, false).
- **location**: Ubicación de la posición.
- **jobDescription**: Descripción del trabajo.
- **requirements**: Requisitos del trabajo.
- **responsibilities**: Responsabilidades del trabajo.
- **salaryMin**: Salario mínimo.
- **salaryMax**: Salario máximo.
- **employmentType**: Tipo de empleo.
- **benefits**: Beneficios del empleo.
- **companyDescription**: Descripción de la empresa.
- **applicationDeadline**: Fecha límite de la aplicación.
- **contactInfo**: Información de contacto.

Relaciones:

- Una posición puede tener múltiples aplicaciones (Application).

### **Application (Aplicación)**

- **id**: Identificador único de la aplicación (autoincremental).
- **positionId**: Identificador de la posición (FK).
- **candidateId**: Identificador del candidato (FK).
- **applicationDate**: Fecha de la aplicación.
- **currentInterviewStep**: Identificador del paso de entrevista actual (FK).
- **notes**: Notas adicionales de la aplicación.

Relaciones:

- Una aplicación puede tener múltiples entrevistas (Interview).

### **Interview (Entrevista)**

- **id**: Identificador único de la entrevista (autoincremental).
- **applicationId**: Identificador de la aplicación (FK).
- **interviewStepId**: Identificador del paso de entrevista (FK).
- **employeeId**: Identificador del empleado (FK).
- **interviewDate**: Fecha de la entrevista.
- **result**: Resultado de la entrevista.
- **score**: Puntuación de la entrevista.
- **notes**: Notas adicionales de la entrevista.

# Diagram ERD

```mermaid
erDiagram
    Candidate {
        int id PK "autoincrement()"
        string firstName "VarChar(100)"
        string lastName "VarChar(100)"
        string email "VarChar(255) unique"
        string phone "VarChar(15)"
        string address "VarChar(100)"
    }

    Education {
        int id PK "autoincrement()"
        string institution "VarChar(100)"
        string title "VarChar(250)"
        datetime startDate
        datetime endDate
        int candidateId FK
    }

    WorkExperience {
        int id PK "autoincrement()"
        string company "VarChar(100)"
        string position "VarChar(100)"
        string description "VarChar(200)"
        datetime startDate
        datetime endDate
        int candidateId FK
    }

    Resume {
        int id PK "autoincrement()"
        string filePath "VarChar(500)"
        string fileType "VarChar(50)"
        datetime uploadDate
        int candidateId FK
    }

    Company {
        int id PK "autoincrement()"
        string name "unique"
    }

    Employee {
        int id PK "autoincrement()"
        int companyId FK
        string name
        string email "unique"
        string role
        boolean isActive "default(true)"
    }

    InterviewType {
        int id PK "autoincrement()"
        string name
        string description
    }

    InterviewFlow {
        int id PK "autoincrement()"
        string description
    }

    InterviewStep {
        int id PK "autoincrement()"
        int interviewFlowId FK
        int interviewTypeId FK
        string name
        int orderIndex
    }

    Position {
        int id PK "autoincrement()"
        int companyId FK
        int interviewFlowId FK
        string title
        string description
        string status "default('Draft')"
        boolean isVisible "default(false)"
        string location
        string jobDescription
        string requirements
        string responsibilities
        float salaryMin
        float salaryMax
        string employmentType
        string benefits
        string companyDescription
        datetime applicationDeadline
        string contactInfo
    }

    Application {
        int id PK "autoincrement()"
        int positionId FK
        int candidateId FK
        datetime applicationDate
        int currentInterviewStep FK
        string notes
    }

    Interview {
        int id PK "autoincrement()"
        int applicationId FK
        int interviewStepId FK
        int employeeId FK
        datetime interviewDate
        string result
        int score
        string notes
    }

    Candidate ||--o{ Education : "educations"
    Candidate ||--o{ WorkExperience : "workExperiences"
    Candidate ||--o{ Resume : "resumes"
    Candidate ||--o{ Application : "applications"
    Company ||--o{ Employee : "employees"
    Company ||--o{ Position : "positions"
    InterviewType ||--o{ InterviewStep : "interviewSteps"
    InterviewFlow ||--o{ InterviewStep : "interviewSteps"
    InterviewFlow ||--o{ Position : "positions"
    InterviewStep ||--o{ Application : "applications"
    InterviewStep ||--o{ Interview : "interviews"
    Position ||--o{ Application : "applications"
    Application ||--o{ Interview : "interviews"
    Employee ||--o{ Interview : "interviews"
```