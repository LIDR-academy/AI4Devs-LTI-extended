# Claude Code Specialized Agents

This directory contains specialized subagent definitions for the LTI ATS project. Each agent is an expert in a specific domain of frontend development.

## Available Agents

### 1. CSS & UX Auditor
**File:** `css-ux-auditor.md`
**Size:** 18KB
**Domain:** UI/UX Quality Assurance

Audits CSS implementation, UI component consistency, and UX patterns. Ensures adherence to React Bootstrap best practices and accessibility standards.

**Key Functions:**
- CSS style auditing (inline styles, utility classes)
- UI component validation (React Bootstrap compliance)
- Accessibility compliance (WCAG 2.1 AA)
- Design pattern consistency
- Figma design integration
- UX quality analysis
- Audit reporting

**MCP Servers:**
- figma-dev-mode-mcp-server
- figma-local

---

### 2. Component Generator
**File:** `component-generator.md`
**Size:** 18KB
**Domain:** React Component Creation

Generates React components following project patterns and conventions. Creates components from templates or Figma designs.

**Key Functions:**
- Component generation from templates
- Component generation from Figma
- PropTypes & TypeScript interfaces
- Component patterns application
- Naming conventions enforcement
- Import management
- Component documentation

**MCP Servers:**
- figma-dev-mode-mcp-server
- figma-local

---

### 3. API Integration
**File:** `api-integration.md`
**Size:** 23KB
**Domain:** Frontend-Backend Integration

Manages integration between frontend and backend services. Ensures API calls match OpenAPI specification and implements consistent error handling.

**Key Functions:**
- OpenAPI specification validation
- Service layer generation
- TypeScript type generation from schemas
- Error handling patterns
- Loading & async state management
- CORS configuration validation
- Request/response interceptors

**Related Files:**
- `documentation/api-spec.yml`
- `backend/prisma/schema.prisma`

---

### 4. Testing & Quality
**File:** `testing-quality.md`
**Size:** 27KB
**Domain:** Quality Assurance, Test Automation

Creates and maintains comprehensive test coverage. Ensures code quality through unit tests, integration tests, and E2E tests.

**Key Functions:**
- Jest unit test generation
- Cypress E2E test generation
- Test fixtures & mocks creation
- Test coverage analysis (target: 90%)
- Accessibility testing (jest-axe)
- Test maintenance
- Performance testing

**Coverage Target:** 90% (branches, functions, lines, statements)

---

### 5. TypeScript Migration
**File:** `typescript-migration.md`
**Size:** 25KB
**Domain:** Code Modernization, Type Safety

Migrates JavaScript components to TypeScript. Ensures type safety and eliminates `any` types.

**Key Functions:**
- Component migration (.js → .tsx)
- PropTypes to TypeScript interfaces
- State & hook typing
- Event handler typing
- Type generation from backend schema
- Eliminate `any` types
- Generic type implementation
- Type validation & compilation

**Current State:**
- 5 components in TypeScript (.tsx)
- 8 components in JavaScript (.js)

---

### 6. Performance Optimization
**File:** `performance-optimization.md`
**Size:** 26KB
**Domain:** Frontend Performance

Analyzes and optimizes frontend performance. Identifies bottlenecks and implements best practices.

**Key Functions:**
- Re-render analysis & optimization (React.memo, useMemo, useCallback)
- Bundle size analysis & optimization (code splitting, tree-shaking)
- Image & asset optimization
- List virtualization (react-window)
- Memory leak detection
- Debouncing & throttling
- Web Vitals monitoring (LCP, FID, CLS)
- Performance profiling

**Performance Targets:**
- Bundle size: <250KB
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1
- Lighthouse score: >90

---

## Usage

These agent definitions are meant to be referenced by Claude Code when performing specialized tasks. Each agent has:

- **Core Responsibilities** - Detailed task descriptions
- **Tools & Permissions** - Available tools and MCP servers
- **Project Context** - Specific configuration for this project
- **Workflows** - Step-by-step processes
- **Use Cases** - Common scenarios
- **Quality Checklists** - Validation criteria
- **Best Practices** - Do's and don'ts
- **Quick Reference** - Common patterns and commands

## Agent Collaboration

Agents are designed to work together:

```
Component Generator
    ↓ creates component
Testing & Quality
    ↓ generates tests
TypeScript Migration
    ↓ adds types
CSS & UX Auditor
    ↓ validates styles
Performance Optimization
    ↓ optimizes
API Integration
    ↓ connects to backend
```

## Priority by Project Phase

### Phase 1: Foundation (Current)
1. **API Integration** - Critical for backend synchronization
2. **Testing & Quality** - Reach 90% coverage goal
3. **TypeScript Migration** - Unify .js/.tsx files

### Phase 2: Quality & Polish
4. **CSS & UX Auditor** - Ensure consistency
5. **Component Generator** - Accelerate development

### Phase 3: Optimization
6. **Performance Optimization** - Scale for production

---

## Related Documentation

- [CLAUDE.md](/CLAUDE.md) - Main project guidelines
- [API Specification](/documentation/api-spec.yml)
- [Data Model](/documentation/DataModel.md)
- [Project Brief](/memory-bank/projectbrief.md)
- [System Patterns](/memory-bank/systemPatterns.md)

---

## Version History

- **1.0.0** (2025-10-03) - Initial agent collection
  - CSS & UX Auditor
  - Component Generator
  - API Integration
  - Testing & Quality
  - TypeScript Migration
  - Performance Optimization

---

## Contributing

When adding new agents:

1. Create a new `.md` file following the template structure
2. Document all core responsibilities
3. List available tools and MCP servers
4. Include project-specific context
5. Provide workflows and use cases
6. Add quality checklists
7. Update this README

---

**Total Agents:** 6
**Total Documentation:** ~137KB
**Last Updated:** 2025-10-03
