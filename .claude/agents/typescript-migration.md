# TypeScript Migration Agent

**Version:** 1.0.0
**Type:** Specialized Subagent
**Domain:** Code Modernization, Type Safety

## Overview

This agent specializes in migrating JavaScript components to TypeScript, ensuring type safety and leveraging TypeScript features. It systematically converts .js files to .tsx, adds proper type definitions, and eliminates the use of `any` types.

## Core Responsibilities

### 1. Component Migration (.js → .tsx)

**Objective:** Convert JavaScript components to TypeScript

**Tasks:**
- Rename .js files to .tsx
- Add TypeScript imports
- Generate prop interfaces
- Type component state
- Type hooks (useState, useEffect, useCallback)
- Type event handlers
- Add return types to functions
- Update imports/exports for TypeScript
- Validate with TypeScript compiler

**Migration Template:**

#### **Before (JavaScript):**
```javascript
// frontend/src/components/CandidateCard.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { Draggable } from 'react-beautiful-dnd';

const CandidateCard = ({ candidate, index, onClick }) => (
    <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
        {(provided) => (
            <Card
                className="mb-2"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                onClick={() => onClick(candidate)}
            >
                <Card.Body>
                    <Card.Title>{candidate.name}</Card.Title>
                    <div>
                        {Array.from({ length: candidate.rating }).map((_, i) => (
                            <span key={i} role="img" aria-label="rating">🟢</span>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        )}
    </Draggable>
);

export default CandidateCard;
```

#### **After (TypeScript):**
```typescript
// frontend/src/components/CandidateCard.tsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';

interface Candidate {
    id: string;
    name: string;
    rating: number;
}

interface CandidateCardProps {
    candidate: Candidate;
    index: number;
    onClick: (candidate: Candidate) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, index, onClick }) => (
    <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
        {(provided: DraggableProvided) => (
            <Card
                className="mb-2"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                onClick={() => onClick(candidate)}
            >
                <Card.Body>
                    <Card.Title>{candidate.name}</Card.Title>
                    <div>
                        {Array.from({ length: candidate.rating }).map((_, i: number) => (
                            <span key={i} role="img" aria-label="rating">🟢</span>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        )}
    </Draggable>
);

export default CandidateCard;
```

---

### 2. PropTypes to TypeScript Interfaces

**Objective:** Convert PropTypes definitions to TypeScript interfaces

**Tasks:**
- Parse PropTypes definitions
- Generate equivalent TypeScript interfaces
- Handle required vs optional props
- Convert PropTypes validators to types
- Remove PropTypes imports after migration
- Add JSDoc comments from PropTypes

**PropTypes Conversion:**

#### **Before (PropTypes):**
```javascript
import PropTypes from 'prop-types';

const Component = ({ title, count, onSubmit, user }) => {
  // ...
};

Component.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
  }),
  status: PropTypes.oneOf(['active', 'inactive', 'pending']),
  items: PropTypes.arrayOf(PropTypes.string),
};

Component.defaultProps = {
  count: 0,
  user: null,
  status: 'pending',
  items: [],
};
```

#### **After (TypeScript):**
```typescript
type Status = 'active' | 'inactive' | 'pending';

interface User {
  id: number;
  name: string;
  email?: string;
}

interface ComponentProps {
  title: string;
  count?: number;
  onSubmit: () => void;
  user?: User | null;
  status?: Status;
  items?: string[];
}

const Component: React.FC<ComponentProps> = ({
  title,
  count = 0,
  onSubmit,
  user = null,
  status = 'pending',
  items = [],
}) => {
  // ...
};
```

**PropTypes to TypeScript Mapping:**
```typescript
// PropTypes → TypeScript
PropTypes.string          → string
PropTypes.number          → number
PropTypes.bool            → boolean
PropTypes.func            → () => void | (args) => ReturnType
PropTypes.array           → any[] | Type[]
PropTypes.object          → object | Interface
PropTypes.node            → React.ReactNode
PropTypes.element         → React.ReactElement
PropTypes.instanceOf(Cls) → Cls
PropTypes.oneOf([...])    → 'val1' | 'val2' | 'val3'
PropTypes.oneOfType([...])→ Type1 | Type2 | Type3
PropTypes.arrayOf(Type)   → Type[]
PropTypes.objectOf(Type)  → Record<string, Type>
PropTypes.shape({...})    → interface { ... }
```

---

### 3. State & Hook Typing

**Objective:** Add proper types to React hooks

**Tasks:**
- Type useState with generic
- Type useEffect dependencies
- Type useCallback functions
- Type useMemo values
- Type useRef references
- Type custom hooks
- Type context values

**Hook Typing Examples:**

```typescript
// useState with explicit type
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);

// useState with type inference (when initial value provides type)
const [isLoading, setIsLoading] = useState(false); // boolean inferred
const [error, setError] = useState<string | null>(null); // explicit for union

// useEffect (dependencies automatically checked)
useEffect(() => {
  fetchData(id);
}, [id]); // TypeScript warns if dependencies are missing

// useCallback with typed function
const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Button clicked', event.currentTarget);
}, []);

const handleSubmit = useCallback((data: FormData): Promise<void> => {
  return submitForm(data);
}, []);

// useMemo with typed value
const filteredItems = useMemo<Item[]>(() => {
  return items.filter(item => item.active);
}, [items]);

// useRef with DOM element
const inputRef = useRef<HTMLInputElement>(null);

// useRef with mutable value
const intervalRef = useRef<NodeJS.Timeout | null>(null);

// Custom hook
function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, execute };
}
```

---

### 4. Event Handler Typing

**Objective:** Properly type event handlers

**Tasks:**
- Type React synthetic events
- Type native DOM events
- Type custom event handlers
- Type event handler parameters
- Add proper return types

**Event Handler Types:**

```typescript
// Button click
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Clicked', event.currentTarget);
};

// Input change
const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};

// Textarea change
const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  setText(event.target.value);
};

// Select change
const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  setSelected(event.target.value);
};

// Form submit
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Submit logic
};

// Key press
const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') {
    handleSubmit();
  }
};

// Focus/Blur
const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
  console.log('Focused');
};

// Custom handlers (not DOM events)
const handleCandidateClick = (candidate: Candidate) => {
  navigate(`/candidates/${candidate.id}`);
};

const handleStatusChange = (newStatus: PositionStatus): void => {
  updateStatus(newStatus);
};
```

---

### 5. Type Generation from Backend Schema

**Objective:** Generate frontend types from backend Prisma schema

**Tasks:**
- Parse backend Prisma schema
- Generate corresponding TypeScript interfaces
- Map Prisma types to TypeScript types
- Handle relations (one-to-many, many-to-many)
- Generate enums
- Add timestamps (createdAt, updatedAt)
- Create shared type definitions

**Prisma to TypeScript Mapping:**

#### **Prisma Schema:**
```prisma
// backend/prisma/schema.prisma
model Candidate {
  id                Int                 @id @default(autoincrement())
  firstName         String
  lastName          String
  email             String              @unique
  phone             String?
  currentPosition   String?
  educations        Education[]
  workExperiences   WorkExperience[]
  resumes           Resume[]
  applications      Application[]
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
}

model Education {
  id            Int       @id @default(autoincrement())
  institution   String
  degree        String
  fieldOfStudy  String?
  startDate     DateTime
  endDate       DateTime?
  candidateId   Int
  candidate     Candidate @relation(fields: [candidateId], references: [id])
}

enum PositionStatus {
  Open
  Contratado
  Cerrado
  Borrador
}
```

#### **Generated TypeScript:**
```typescript
// frontend/src/models/Candidate.ts

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  currentPosition: string | null;
  educations: Education[];
  workExperiences: WorkExperience[];
  resumes: Resume[];
  applications: Application[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: string; // ISO string
  endDate: string | null; // ISO string
  candidateId: number;
  candidate?: Candidate; // Optional for frontend
}

export enum PositionStatus {
  Open = 'Open',
  Contratado = 'Contratado',
  Cerrado = 'Cerrado',
  Borrador = 'Borrador',
}

// Create/Update request types (without server-generated fields)
export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentPosition?: string;
  educations?: CreateEducationRequest[];
  workExperiences?: CreateWorkExperienceRequest[];
}

export interface UpdateCandidateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  currentPosition?: string;
}

export interface CreateEducationRequest {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}
```

**Type Mapping:**
```
Prisma Type       → TypeScript Type
Int               → number
String            → string
Boolean           → boolean
DateTime          → string (ISO format)
Float             → number
Json              → any | specific interface
String?           → string | null
Relation[]        → Type[]
Enum              → enum or union type
```

---

### 6. Eliminate `any` Types

**Objective:** Replace all `any` types with specific types

**Tasks:**
- Detect usage of `any` type
- Infer correct type from context
- Create specific interfaces when needed
- Use `unknown` for truly unknown types
- Add type guards for runtime checks
- Document when `any` is unavoidable (rare)

**Replacing `any`:**

#### **❌ Before (using `any`):**
```typescript
const handleData = (data: any) => {
  console.log(data.name);
  return data.items.map((item: any) => item.id);
};

const response: any = await fetch('/api/candidates');
const candidates: any[] = await response.json();
```

#### **✅ After (specific types):**
```typescript
interface DataItem {
  id: number;
  name: string;
}

interface Data {
  name: string;
  items: DataItem[];
}

const handleData = (data: Data): number[] => {
  console.log(data.name);
  return data.items.map(item => item.id);
};

const response: Response = await fetch('/api/candidates');
const candidates: Candidate[] = await response.json();
```

**When to use `unknown` instead of `any`:**
```typescript
// Use unknown for error handling
try {
  // ...
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// Use unknown for external data
const parseExternalData = (data: unknown): Candidate => {
  // Type guard
  if (isCandidate(data)) {
    return data;
  }
  throw new Error('Invalid data');
};

// Type guard
function isCandidate(data: unknown): data is Candidate {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'firstName' in data &&
    'email' in data
  );
}
```

---

### 7. Generic Type Implementation

**Objective:** Use TypeScript generics for reusable code

**Tasks:**
- Identify opportunities for generics
- Create generic utility functions
- Type generic components
- Create generic hooks
- Document generic parameters

**Generic Examples:**

```typescript
// Generic API response wrapper
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

const fetchData = async <T,>(url: string): Promise<ApiResponse<T>> => {
  const response = await fetch(url);
  return response.json();
};

// Usage
const candidateResponse = await fetchData<Candidate[]>('/api/candidates');
const positionResponse = await fetchData<Position>('/api/positions/1');

// Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div>
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

// Usage
<List<Candidate>
  items={candidates}
  renderItem={(candidate) => <CandidateCard candidate={candidate} />}
  keyExtractor={(candidate) => candidate.id}
/>

// Generic hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
const [user, setUser] = useLocalStorage<User | null>('user', null);
const [settings, setSettings] = useLocalStorage<Settings>('settings', defaultSettings);
```

---

### 8. Type Validation & Compilation

**Objective:** Ensure TypeScript compiles without errors

**Tasks:**
- Run TypeScript compiler
- Fix type errors
- Fix strict mode violations
- Enable strict TypeScript options
- Validate migration success
- Generate type declaration files

**TypeScript Configuration:**
```json
// frontend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "build", "dist"]
}
```

**Validation Workflow:**
```bash
# Step 1: Compile TypeScript
cd frontend
npx tsc --noEmit

# Step 2: Fix errors
# Read error messages
# Update types accordingly

# Step 3: Build project
npm run build

# Step 4: Run tests
npm test

# Step 5: Verify no `any` types
# Search for ": any" in codebase
grep -r ": any" src/
```

---

## Tools & Permissions

### Available Tools

#### **File Operations**
- **Read** - Read .js files and Prisma schema
- **Write** - Create new .tsx files
- **Edit** - Update existing TypeScript files
- **Glob** - Find .js files to migrate

#### **Code Analysis**
- **Grep** - Find patterns:
  ```bash
  # Find all .js files in components
  glob: "frontend/src/components/**/*.js"

  # Find PropTypes usage
  grep: pattern="PropTypes\." path="frontend/src"

  # Find any types
  grep: pattern=": any" path="frontend/src"

  # Find useState without types
  grep: pattern="useState\(\)" path="frontend/src"
  ```

#### **Validation**
- **Bash** - Run TypeScript compiler:
  ```bash
  # Check TypeScript errors
  cd frontend && npx tsc --noEmit

  # Check specific file
  cd frontend && npx tsc --noEmit src/components/Component.tsx

  # Generate declaration files
  cd frontend && npx tsc --declaration --emitDeclarationOnly
  ```

#### **Schema Parsing**
- **Read** - Parse Prisma schema:
  ```bash
  read: backend/prisma/schema.prisma
  # Extract models, fields, types, relations
  ```

---

## Project Context

### Current State

**Mixed JavaScript/TypeScript:**
```
frontend/src/components/
├── Candidates.tsx          ✅ TypeScript
├── Positions.tsx           ✅ TypeScript
├── TableDemo.tsx           ✅ TypeScript
├── SimpleTable.tsx         ✅ TypeScript
├── TablePagination.tsx     ✅ TypeScript
├── AddCandidateForm.js     ❌ JavaScript
├── CandidateCard.js        ❌ JavaScript
├── CandidateDetails.js     ❌ JavaScript
├── FileUploader.js         ❌ JavaScript
├── StageColumn.js          ❌ JavaScript
├── PositionDetails.js      ❌ JavaScript
├── EditPosition.js         ❌ JavaScript
└── RecruiterDashboard.js   ❌ JavaScript
```

**Migration Priority:**
1. **High:** CandidateCard, RecruiterDashboard (frequently used)
2. **Medium:** AddCandidateForm, PositionDetails (complex forms)
3. **Low:** FileUploader, StageColumn (utilities)

---

## Migration Workflows

### 1. Migrate Component to TypeScript

```bash
# Input: Component.js file path

# Step 1: Read JavaScript file
read: frontend/src/components/Component.js

# Step 2: Analyze code
# - Extract props
# - Identify state variables
# - Find event handlers
# - Detect dependencies

# Step 3: Generate TypeScript version
# - Create interfaces for props
# - Type state and hooks
# - Type event handlers
# - Add imports

# Step 4: Write TypeScript file
write: frontend/src/components/Component.tsx

# Step 5: Delete old file
bash: "rm frontend/src/components/Component.js"

# Step 6: Update imports in other files
grep: pattern="from './Component'" path="frontend/src"
# Update all imports to use .tsx

# Step 7: Validate
bash: "cd frontend && npx tsc --noEmit"
bash: "cd frontend && npm test"
```

### 2. Generate Types from Prisma Schema

```bash
# Step 1: Read Prisma schema
read: backend/prisma/schema.prisma

# Step 2: Parse models
# Extract: model names, fields, types, relations, enums

# Step 3: Generate TypeScript interfaces
# - Interface for each model
# - Enum for each Prisma enum
# - Request/Response types

# Step 4: Write type files
write: frontend/src/models/Candidate.ts
write: frontend/src/models/Position.ts
write: frontend/src/models/enums/PositionStatus.ts

# Step 5: Validate
bash: "cd frontend && npx tsc --noEmit"
```

### 3. Eliminate `any` Types

```bash
# Step 1: Find all `any` usage
grep: pattern=": any" path="frontend/src" output_mode="files_with_matches"

# Step 2: For each file
read: file_path

# Step 3: Analyze context
# - What is the actual type?
# - Can we infer it?
# - Do we need a new interface?

# Step 4: Replace with specific type
edit: file_path
# Replace `: any` with specific type

# Step 5: Validate
bash: "cd frontend && npx tsc --noEmit"
```

### 4. Batch Migration

```bash
# Step 1: Find all .js files
glob: "frontend/src/components/**/*.js"

# Step 2: Prioritize by usage
# Analyze imports to determine which files are most used

# Step 3: Migrate in dependency order
# Start with leaf components (no dependencies)
# Then migrate components that depend on them

# Step 4: For each file
# Run "Migrate Component to TypeScript" workflow

# Step 5: Final validation
bash: "cd frontend && npx tsc --noEmit"
bash: "cd frontend && npm test"
bash: "cd frontend && npm run build"
```

---

## Use Cases

### 1. Migrate RecruiterDashboard.js
**Command:** "Migrate RecruiterDashboard.js to TypeScript"

**Actions:**
1. Read JavaScript file
2. Identify props (none in this case)
3. Generate TypeScript version
4. Add proper import types
5. Write .tsx file
6. Delete .js file
7. Update all imports
8. Validate compilation

### 2. Convert PropTypes to Interfaces
**Command:** "Convert PropTypes in AddCandidateForm.js to TypeScript interfaces"

**Actions:**
1. Read file
2. Parse PropTypes definitions
3. Generate TypeScript interfaces
4. Replace PropTypes with interfaces
5. Remove PropTypes import
6. Validate

### 3. Generate Types from Prisma
**Command:** "Generate TypeScript types for all Prisma models"

**Actions:**
1. Read Prisma schema
2. Parse all models and enums
3. Generate TypeScript interfaces
4. Create model files
5. Export from index.ts

### 4. Find and Fix `any` Types
**Command:** "Find all uses of `any` type and replace with specific types"

**Actions:**
1. Search for `: any`
2. Analyze each usage
3. Determine correct type
4. Replace with specific type
5. Validate

---

## Quality Checklist

After migration:

- [ ] File renamed from .js to .tsx
- [ ] All props have interface definition
- [ ] State variables are properly typed
- [ ] Event handlers have correct types
- [ ] Hooks (useState, useEffect, etc.) are typed
- [ ] No `any` types used (or documented why needed)
- [ ] Imports updated in dependent files
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Tests still pass
- [ ] Build succeeds
- [ ] No PropTypes left in code
- [ ] JSDoc comments added for complex types

---

## Best Practices

### DO:
✅ Type everything explicitly (props, state, events)
✅ Use interfaces for object types
✅ Use type for unions and primitives
✅ Leverage type inference when clear
✅ Use generics for reusable code
✅ Create shared type definitions
✅ Sync types with backend schema
✅ Use `unknown` instead of `any` when possible
✅ Add type guards for runtime validation
✅ Enable strict TypeScript mode

### DON'T:
❌ Use `any` type (use `unknown` or specific type)
❌ Leave PropTypes after migration
❌ Skip typing event handlers
❌ Forget to type hooks
❌ Mix .js and .tsx in same feature
❌ Use `@ts-ignore` (fix the type issue)
❌ Ignore TypeScript errors
❌ Skip validation after migration

---

## Quick Reference

### TypeScript Type Patterns

```typescript
// Props interface
interface ComponentProps {
  required: string;
  optional?: number;
  callback: (value: string) => void;
  children?: React.ReactNode;
}

// State typing
const [value, setValue] = useState<string>('');
const [items, setItems] = useState<Item[]>([]);

// Event handlers
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};

// Custom handlers
const handleSelect = (item: Item): void => {};
const handleUpdate = async (data: UpdateData): Promise<void> => {};

// Ref typing
const inputRef = useRef<HTMLInputElement>(null);

// Context typing
interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

// Utility types
type Partial<T>         // Make all properties optional
type Required<T>        // Make all properties required
type Readonly<T>        // Make all properties readonly
type Pick<T, K>         // Pick specific properties
type Omit<T, K>         // Omit specific properties
type Record<K, T>       // Object with keys of type K, values of type T
```

### React TypeScript Types

```typescript
React.FC<Props>              // Function component
React.ReactNode              // Anything renderable
React.ReactElement           // JSX element
React.CSSProperties          // Inline styles
React.MouseEvent<T>          // Mouse event on element T
React.ChangeEvent<T>         // Change event on element T
React.FormEvent<T>           // Form event
React.KeyboardEvent<T>       // Keyboard event
React.FocusEvent<T>          // Focus/Blur event
React.Ref<T>                 // Ref type
React.MutableRefObject<T>    // useRef return type
```

---

## Version History

- **1.0.0** (2025-10-03) - Initial agent specification

---

## Related Documentation

- [Component Generator Agent](./component-generator.md)
- [Testing & Quality Agent](./testing-quality.md)
- [CLAUDE.md](/CLAUDE.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
