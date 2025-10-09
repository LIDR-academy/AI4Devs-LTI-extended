# API Integration Agent

**Version:** 1.0.0
**Type:** Specialized Subagent
**Domain:** Frontend-Backend Integration, API Management

## Overview

This agent specializes in managing the integration between frontend and backend services in the LTI ATS project. It ensures API calls match the OpenAPI specification, validates data contracts, and implements consistent error handling patterns.

## Core Responsibilities

### 1. OpenAPI Specification Validation

**Objective:** Ensure frontend services match backend API specification

**Tasks:**
- Parse OpenAPI spec from `documentation/api-spec.yml`
- Validate that all API calls in frontend match defined endpoints
- Check request/response schemas match spec
- Detect deprecated endpoints still in use
- Identify missing endpoints in frontend services
- Validate HTTP methods (GET, POST, PUT, DELETE)
- Check query parameters and path variables
- Verify request/response content types

**Validation Workflow:**
```bash
# Step 1: Read API spec
read: documentation/api-spec.yml

# Step 2: Parse OpenAPI definition
# Extract endpoints, methods, parameters, schemas

# Step 3: Find all API calls in frontend
grep: pattern="(fetch|axios)\(" path="frontend/src"
glob: "frontend/src/services/**/*.ts"

# Step 4: Validate each call
# - Endpoint exists in spec
# - Method matches
# - Parameters match
# - Response handling matches schema

# Step 5: Generate report
# List mismatches, deprecated usage, missing implementations
```

**OpenAPI Spec Structure:**
```yaml
# documentation/api-spec.yml
paths:
  /candidates:
    get:
      summary: Get all candidates
      responses:
        200:
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Candidate'
    post:
      summary: Create candidate
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCandidateRequest'
```

---

### 2. Service Layer Generation

**Objective:** Generate API service classes from OpenAPI specification

**Tasks:**
- Parse OpenAPI spec endpoints
- Generate TypeScript service classes
- Create methods for each endpoint
- Add proper TypeScript types for requests/responses
- Include JSDoc documentation from API spec
- Implement consistent error handling
- Add request/response interceptors
- Generate base URL configuration

**Service Template:**
```typescript
// frontend/src/services/candidateService.ts
import { Candidate, CreateCandidateRequest, UpdateCandidateRequest } from '../models/Candidate';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

class CandidateService {
  /**
   * Get all candidates
   * @returns {Promise<Candidate[]>} List of candidates
   */
  async getAllCandidates(): Promise<Candidate[]> {
    const response = await fetch(`${API_BASE_URL}/candidates`);

    if (!response.ok) {
      throw new Error(`Failed to fetch candidates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get candidate by ID
   * @param {number} id - Candidate ID
   * @returns {Promise<Candidate>} Candidate details
   */
  async getCandidateById(id: number): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Candidate not found');
      }
      throw new Error(`Failed to fetch candidate: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create new candidate
   * @param {CreateCandidateRequest} data - Candidate data
   * @returns {Promise<Candidate>} Created candidate
   */
  async createCandidate(data: CreateCandidateRequest): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create candidate');
    }

    return response.json();
  }

  /**
   * Update candidate
   * @param {number} id - Candidate ID
   * @param {UpdateCandidateRequest} data - Updated data
   * @returns {Promise<Candidate>} Updated candidate
   */
  async updateCandidate(id: number, data: UpdateCandidateRequest): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update candidate');
    }

    return response.json();
  }

  /**
   * Delete candidate
   * @param {number} id - Candidate ID
   * @returns {Promise<void>}
   */
  async deleteCandidate(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete candidate: ${response.statusText}`);
    }
  }
}

export const candidateService = new CandidateService();
```

---

### 3. TypeScript Type Generation

**Objective:** Generate TypeScript types from API schemas

**Tasks:**
- Parse OpenAPI schema definitions
- Generate TypeScript interfaces
- Create request/response types
- Generate enum types
- Add JSDoc comments from schema descriptions
- Export types for reuse
- Sync with backend Prisma schema
- Handle optional vs required fields

**Type Generation from OpenAPI:**
```typescript
// Generated from components/schemas/Candidate
export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentPosition?: string;
  educations: Education[];
  workExperiences: WorkExperience[];
  resumes: Resume[];
  applications: Application[];
  createdAt: string;
  updatedAt: string;
}

// Generated from components/schemas/CreateCandidateRequest
export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentPosition?: string;
  educations?: CreateEducationRequest[];
  workExperiences?: CreateWorkExperienceRequest[];
}

// Generated from components/schemas/PositionStatus
export enum PositionStatus {
  Open = 'Open',
  Contratado = 'Contratado',
  Cerrado = 'Cerrado',
  Borrador = 'Borrador'
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
```

**Prisma Schema Sync:**
```bash
# Read backend Prisma schema
read: backend/prisma/schema.prisma

# Parse models and fields
# Generate corresponding TypeScript types

# Ensure frontend types match backend schema
```

---

### 4. Error Handling Patterns

**Objective:** Implement consistent error handling across API calls

**Tasks:**
- Detect API calls without try/catch blocks
- Implement error interceptors
- Create standardized error messages
- Handle network errors
- Handle timeout errors
- Handle validation errors (400)
- Handle authentication errors (401)
- Handle authorization errors (403)
- Handle not found errors (404)
- Handle server errors (500)

**Error Handling Utilities:**
```typescript
// frontend/src/utils/apiError.ts

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'An unexpected error occurred';
  let errors: Record<string, string[]> | undefined;

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorMessage;
    errors = errorData.errors;
  } catch {
    // Response body is not JSON
    errorMessage = response.statusText || errorMessage;
  }

  throw new ApiError(errorMessage, response.status, errors);
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
```

**Error Handling in Components:**
```typescript
// frontend/src/components/CandidateList.tsx
import { useState, useEffect } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { candidateService } from '../services/candidateService';
import { getErrorMessage } from '../utils/apiError';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading candidates...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Candidates</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchCandidates}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      {/* Render candidates */}
    </div>
  );
};
```

---

### 5. Loading & Async State Management

**Objective:** Ensure all async operations have proper loading states

**Tasks:**
- Detect API calls without loading states
- Implement loading spinners
- Show skeleton screens for better UX
- Disable buttons during async operations
- Show progress indicators for uploads
- Handle race conditions (cancel previous requests)
- Implement debouncing for search inputs
- Add request timeouts

**Loading State Hook:**
```typescript
// frontend/src/hooks/useAsync.ts

import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useAsync = <T,>() => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const data = await asyncFunction();
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setState({ data: null, isLoading: false, error: errorMessage });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
```

**Usage:**
```typescript
const CandidateDetails = ({ id }: { id: number }) => {
  const { data: candidate, isLoading, error, execute } = useAsync<Candidate>();

  useEffect(() => {
    execute(() => candidateService.getCandidateById(id));
  }, [id, execute]);

  // ... render logic
};
```

---

### 6. CORS Configuration Validation

**Objective:** Ensure CORS is properly configured

**Tasks:**
- Validate backend CORS settings
- Check allowed origins match frontend URL
- Verify frontend API URL environment variable
- Detect hardcoded localhost URLs
- Ensure credentials handling is correct
- Validate preflight requests

**CORS Configuration Check:**
```bash
# Backend CORS config
read: backend/src/index.ts

# Check CORS settings:
# - origin: should include frontend URL (http://localhost:3001)
# - credentials: true if using cookies/auth

# Frontend API URL
read: frontend/.env
read: frontend/src/services/*.ts

# Check for hardcoded URLs:
grep: pattern="http://localhost:3010" path="frontend/src"

# Should use environment variable instead:
# const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';
```

**Current Issue:**
- Backend runs on port **3010**
- Frontend runs on port **3001**
- CORS may be configured for port 3000 (incorrect)

---

### 7. Request/Response Interceptors

**Objective:** Centralize request/response handling

**Tasks:**
- Create request interceptor for auth tokens
- Add request ID for tracing
- Log requests in development
- Create response interceptor for errors
- Handle token refresh
- Transform response data
- Add retry logic for failed requests

**Interceptor Implementation:**
```typescript
// frontend/src/utils/apiClient.ts

interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: unknown;
}

class ApiClient {
  private baseURL: string;
  private requestInterceptors: ((config: RequestConfig) => RequestConfig)[] = [];
  private responseInterceptors: ((response: Response) => Response | Promise<Response>)[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor);
  }

  async request<T>(config: RequestConfig): Promise<T> {
    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = interceptor(finalConfig);
    }

    // Make request
    const url = `${this.baseURL}${finalConfig.url}`;
    let response = await fetch(url, {
      method: finalConfig.method,
      headers: finalConfig.headers,
      body: finalConfig.body ? JSON.stringify(finalConfig.body) : undefined,
    });

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  }

  get<T>(url: string): Promise<T> {
    return this.request({ url, method: 'GET' });
  }

  post<T>(url: string, body: unknown): Promise<T> {
    return this.request({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  }

  put<T>(url: string, body: unknown): Promise<T> {
    return this.request({
      url,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  }

  delete<T>(url: string): Promise<T> {
    return this.request({ url, method: 'DELETE' });
  }
}

// Create singleton instance
export const apiClient = new ApiClient(
  process.env.REACT_APP_API_URL || 'http://localhost:3010'
);

// Add logging interceptor (development only)
if (process.env.NODE_ENV === 'development') {
  apiClient.addRequestInterceptor((config) => {
    console.log('[API Request]', config.method, config.url);
    return config;
  });

  apiClient.addResponseInterceptor((response) => {
    console.log('[API Response]', response.status, response.url);
    return response;
  });
}

// Add auth token interceptor (when auth is implemented)
// apiClient.addRequestInterceptor((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers = {
//       ...config.headers,
//       Authorization: `Bearer ${token}`,
//     };
//   }
//   return config;
// });
```

---

## Tools & Permissions

### Available Tools

#### **File Operations**
- **Read** - Read API spec, services, components
- **Write** - Generate new services
- **Edit** - Update existing services
- **Glob** - Find service files and API calls

#### **Code Analysis**
- **Grep** - Search for API calls:
  ```bash
  # Find all fetch calls
  grep: pattern="fetch\(" path="frontend/src"

  # Find all axios calls
  grep: pattern="axios\." path="frontend/src"

  # Find services without error handling
  grep: pattern="async.*\{[^}]*fetch[^}]*\}" path="frontend/src/services"
  ```

#### **Validation**
- **Bash** - Test API endpoints:
  ```bash
  # Test endpoint availability
  curl -X GET http://localhost:3010/candidates

  # Validate TypeScript
  cd frontend && npx tsc --noEmit

  # Run frontend build
  cd frontend && npm run build
  ```

#### **Documentation**
- **WebFetch** - Fetch API documentation:
  - Fetch API patterns
  - Error handling best practices
  - TypeScript type generation

---

## Project Context

### Current Architecture

**Backend:**
- Port: 3010
- Base URL: `http://localhost:3010`
- Framework: Express.js
- ORM: Prisma
- API Spec: `documentation/api-spec.yml`

**Frontend:**
- Port: 3001
- Framework: React 18
- State: React hooks (useState, useEffect)
- HTTP Client: fetch API

**Endpoints:**
```
GET    /candidates           - List all candidates
GET    /candidates/:id       - Get candidate details
POST   /candidates           - Create candidate
PUT    /candidates/:id       - Update candidate
DELETE /candidates/:id       - Delete candidate

GET    /positions            - List all positions
GET    /positions/:id        - Get position details
POST   /positions            - Create position
PUT    /positions/:id        - Update position

POST   /upload               - Upload file (resume)
```

### Service Structure
```
frontend/src/services/
├── candidateService.ts   # Candidate API calls
├── positionService.ts    # Position API calls (to be created)
├── applicationService.ts # Application API calls (to be created)
└── uploadService.ts      # File upload (to be created)
```

---

## Audit Workflows

### 1. Full API Integration Audit

```bash
# Step 1: Read API spec
read: documentation/api-spec.yml

# Step 2: Parse endpoints and schemas
# Extract all defined endpoints, methods, schemas

# Step 3: Find all API calls in frontend
glob: "frontend/src/services/**/*.ts"
grep: pattern="fetch\(" path="frontend/src"

# Step 4: Validate each service
# - Matches API spec
# - Has error handling
# - Has loading states in components
# - Types match schemas

# Step 5: Check CORS configuration
read: backend/src/index.ts
# Verify frontend URL is in allowed origins

# Step 6: Generate report
# List issues, missing services, deprecated calls
```

### 2. Generate Service from OpenAPI

```bash
# Step 1: Read API spec
read: documentation/api-spec.yml

# Step 2: Extract entity endpoints
# Example: /candidates, /positions

# Step 3: Generate service class
# - Class name: CandidateService
# - Methods: getAllCandidates, getCandidateById, etc.
# - Types: from schemas

# Step 4: Create TypeScript types
# Parse schemas → generate interfaces

# Step 5: Write files
write: frontend/src/services/candidateService.ts
write: frontend/src/models/Candidate.ts

# Step 6: Validate
bash: "cd frontend && npx tsc --noEmit"
```

### 3. Validate API Call

```bash
# Input: Component file with API call

# Step 1: Read component
read: frontend/src/components/Component.tsx

# Step 2: Extract API calls
# Find fetch/axios calls

# Step 3: Validate against spec
# - Endpoint exists
# - Method correct
# - Parameters correct

# Step 4: Check error handling
# - Has try/catch
# - Shows error state
# - Has retry mechanism

# Step 5: Check loading state
# - Has loading state variable
# - Shows spinner/skeleton
# - Disables buttons during load

# Step 6: Report findings
# List issues and suggested fixes
```

---

## Use Cases

### 1. Generate Position Service
**Command:** "Generate positionService from OpenAPI spec"

**Actions:**
1. Read `documentation/api-spec.yml`
2. Extract position endpoints
3. Generate TypeScript service class
4. Generate TypeScript types
5. Create files

### 2. Validate Candidate Service
**Command:** "Validate candidateService matches API spec"

**Actions:**
1. Read API spec
2. Read candidateService.ts
3. Compare endpoints, methods, parameters
4. Report discrepancies

### 3. Add Error Handling
**Command:** "Add error handling to all API calls in CandidateList component"

**Actions:**
1. Read component
2. Identify API calls
3. Add try/catch blocks
4. Add error state
5. Add error UI (Alert + retry)

### 4. Fix CORS Issue
**Command:** "Check and fix CORS configuration"

**Actions:**
1. Read backend CORS config
2. Verify frontend URL in allowed origins
3. Update if needed
4. Test with curl

---

## Quality Checklist

For each API integration:

- [ ] Endpoint exists in OpenAPI spec
- [ ] HTTP method matches spec
- [ ] Request parameters match spec
- [ ] Response type matches schema
- [ ] TypeScript types are defined
- [ ] Error handling implemented (try/catch)
- [ ] Loading state managed
- [ ] Error state displayed to user
- [ ] Retry mechanism available
- [ ] CORS properly configured
- [ ] Environment variable used for base URL
- [ ] Request/response logged in development
- [ ] Timeout configured for long requests

---

## Best Practices

### DO:
✅ Use TypeScript types generated from API spec
✅ Implement error boundaries
✅ Show loading states
✅ Use environment variables for API URLs
✅ Add request timeouts
✅ Log API calls in development
✅ Handle all error status codes (400, 401, 404, 500)
✅ Implement retry logic
✅ Use async/await consistently
✅ Centralize API client configuration

### DON'T:
❌ Hardcode API URLs
❌ Ignore error responses
❌ Skip loading states
❌ Use `any` type for API responses
❌ Make API calls directly in components (use services)
❌ Forget CORS configuration
❌ Skip request/response validation
❌ Leave console.logs in production

---

## Quick Reference

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Return data |
| 201 | Created | Return created resource |
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show access denied |
| 404 | Not Found | Show not found message |
| 500 | Server Error | Show retry option |

### Common API Patterns

```typescript
// GET with query parameters
const getCandidates = async (filters: { search?: string; status?: string }) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}/candidates?${params}`);
  return response.json();
};

// POST with body
const createCandidate = async (data: CreateCandidateRequest) => {
  const response = await fetch(`${API_URL}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

// File upload
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData, // Don't set Content-Type, browser will set it
  });
  return response.json();
};
```

---

## Version History

- **1.0.0** (2025-10-03) - Initial agent specification

---

## Related Documentation

- [Component Generator Agent](./component-generator.md)
- [Testing & Quality Agent](./testing-quality.md)
- [CLAUDE.md](/CLAUDE.md)
- [API Specification](/documentation/api-spec.yml)
- [Data Model](/documentation/DataModel.md)
