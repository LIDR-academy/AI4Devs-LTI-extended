# Contexto Tecnológico

## Stack Tecnológico

### Frontend

- **Framework Principal**: React
- **Lenguaje**: TypeScript
- **Empaquetador**: Create React App
- **Estilos**: CSS/SCSS (potencialmente con frameworks como Bootstrap o Material-UI)
- **Routing**: React Router
- **Manejo de Estado**: Context API o posiblemente Redux
- **Comunicación con API**: Fetch API o Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Validación**: Posiblemente Joi o Zod
- **Gestión de Archivos**: Multer para manejo de uploads

### Infraestructura

- **Contenedorización**: Docker
- **Orquestación**: Docker Compose
- **Base de Datos**: PostgreSQL en contenedor Docker
- **Almacenamiento de Archivos**: Sistema de archivos local (potencialmente migrando a solución cloud)

## Entorno de Desarrollo

### Requisitos Previos

- Node.js (v14+)
- npm o yarn 
- Docker y Docker Compose
- PostgreSQL Client (opcional, para conexión directa a la BD)

### Configuración Inicial

1. **Variables de Entorno**:
   - `.env` contiene configuraciones de conexión a la base de datos y otras configuraciones sensibles
   - Ejemplo de variables principales:
     ```
     DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombd
     PORT=3010
     UPLOAD_DIR=uploads
     ```

2. **Instalación de Dependencias**:
   ```bash
   cd frontend && npm install
   cd backend && npm install
   ```

3. **Inicialización de Base de Datos**:
   ```bash
   docker-compose up -d
   cd backend && npx prisma migrate dev
   cd backend/prisma && ts-node seed.ts
   ```

## Dependencias Principales

### Backend

- **express**: Framework web para Node.js
- **prisma**: ORM para acceso a base de datos
- **cors**: Middleware para configurar Cross-Origin Resource Sharing
- **multer**: Middleware para manejo de formularios multipart/form-data
- **typescript**: Lenguaje con tipado estático
- **jest**: Framework para pruebas

### Frontend

- **react**: Biblioteca para construir interfaces de usuario
- **react-dom**: Renderizado de React para navegadores
- **react-router-dom**: Enrutamiento para aplicaciones React
- **typescript**: Tipado estático para JavaScript
- **axios** (potencial): Cliente HTTP para realizar peticiones a la API

## Convenciones de Código

- **Linting**: ESLint para mantener estándares de código
- **Formatting**: Prettier para formateo consistente
- **Tipado**: TypeScript para tipos estáticos
- **Naming**: 
  - camelCase para variables, funciones y métodos
  - PascalCase para clases y componentes React
  - snake_case para algunos nombres de archivos en el backend
  - kebab-case para algunos nombres de archivos en el frontend

## Restricciones Técnicas

1. **Compatibilidad del Navegador**: El sistema debe funcionar en navegadores modernos (últimas 2 versiones de Chrome, Firefox, Safari, Edge)

2. **Rendimiento**: 
   - Tiempos de carga de página < 2 segundos
   - Respuestas de API < 500ms para operaciones comunes

3. **Seguridad**:
   - Validación de entrada en cliente y servidor
   - Sanitización de datos para prevenir inyecciones SQL
   - Protección contra ataques XSS
   - Implementación futura de autenticación y autorización

4. **Escalabilidad**:
   - Diseño que permita crecer en número de usuarios y datos
   - Paginación para conjuntos grandes de datos
   - Optimización de consultas a la base de datos

## Consideraciones de Despliegue

El sistema actualmente está diseñado para entornos de desarrollo, con potencial para configuración en entornos de producción mediante:

1. **CI/CD**: Integración y despliegue continuos (potencialmente con GitHub Actions)
2. **Contenedorización**: Despliegue basado en Docker
3. **Entorno Cloud**: Preparación para despliegue en servicios como AWS, Azure o GCP
4. **Monitorización**: Implementación futura de herramientas de monitorización y logging 