# Role

You are an expert frontend architect with extensive experience in React projects applying best practices.

# Ticket ID

$ARGUMENTS

# Goal

Obtain a step-by-step plan for a Jira ticket that is ready to start implementing.

# Process and rules

1. Adopt the role of `.claude/agents/frontend-developer.md`
2. Analyze the Jira ticket mentioned in #ticket using the MCP. If the mention is a local file, then avoid using MCP
3. Propose a step-by-step plan for the frontend part, taking into account everything mentioned in the ticket and applying the project's best practices and rules you can find in `/ai-specs/specs`.
4. Apply the best practices of your role to ensure the developer can be fully autonomous and implement the ticket end-to-end using only your plan.
5. Do not write code yet; provide only the plan in the output format defined below.
6. If you are asked to start implementing at some point, make sure the first thing you do is to move to a branch named after the ticket id (if you are not yet there) and follow the process described in the command /develop-us.md

# Output format

Markdown document at the path `ai-specs/changes/[jira_id]_frontend.md` containing the complete implementation details.
Follow this template:

## Frontend Implementation Plan Ticket Template Structure

### 1. **Header**
- Title: `# Frontend Implementation Plan: [TICKET-ID] [Feature Name]`

### 2. **Overview**
- Brief description of the feature and frontend architecture principles (component-based architecture, service layer, React patterns)

### 3. **Architecture Context**
- Components/services involved
- Files referenced
- Routing considerations (if applicable)
- State management approach

### 4. **Implementation Steps**
Detailed steps, typically:

#### **Step 0: Create Feature Branch**
- **Action**: Create and switch to a new feature branch following the development workflow. Check if it exists and if not, create it
- **Branch Naming**: Follow the project's branch naming convention (`feature/[ticket-id]-frontend`, make it required to use this naming, don't allow to keep on the general task [ticket-id] if it exists to separate concerns)
- **Implementation Steps**:
  1. Ensure you're on the latest `main` or `develop` branch (or appropriate base branch)
  2. Pull latest changes: `git pull origin [base-branch]`
  3. Create new branch: `git checkout -b [branch-name]`
  4. Verify branch creation: `git branch`
- **Notes**: This must be the FIRST step before any code changes. Refer to `ai-specs/specs/frontend-standards.mdc` section "Development Workflow" for specific branch naming conventions and workflow rules.

#### **Step N: [Action Name]**
- **File**: Target file path
- **Action**: What to implement
- **Function/Component Signature**: Code signature
- **Implementation Steps**: Numbered list
- **Dependencies**: Required imports
- **Implementation Notes**: Technical details

Common steps:
- **Step 1**: Update/Create Service Methods (API communication in `src/services/`)
- **Step 2**: Create/Update Components (React components in `src/components/`)
- **Step 3**: Update Routing (if new pages/routes needed in `src/App.js`)
- **Step 4**: Write Cypress E2E Tests (test files in `cypress/e2e/`)

#### **Step N+1: Update Technical Documentation**
- **Action**: Review and update technical documentation according to changes made
- **Implementation Steps**:
  1. **Review Changes**: Analyze all code changes made during implementation
  2. **Identify Documentation Files**: Determine which documentation files need updates based on:
     - API endpoint changes → Update `ai-specs/specs/api-spec.yml`
     - UI/UX patterns or component patterns → Update `ai-specs/specs/frontend-standards.mdc`
     - Routing changes → Update routing documentation
     - New dependencies or configuration changes → Update `ai-specs/specs/frontend-standards.mdc`
     - Test patterns or Cypress changes → Update testing documentation
  3. **Update Documentation**: For each affected file:
     - Update content in English (as per `documentation-standards.mdc`)
     - Maintain consistency with existing documentation structure
     - Ensure proper formatting
  4. **Verify Documentation**: 
     - Confirm all changes are accurately reflected
     - Check that documentation follows established structure
  5. **Report Updates**: Document which files were updated and what changes were made
- **References**: 
  - Follow process described in `ai-specs/specs/documentation-standards.mdc`
  - All documentation must be written in English
- **Notes**: This step is MANDATORY before considering the implementation complete. Do not skip documentation updates.

### 5. **Implementation Order**
- Numbered list of steps in sequence (must start with Step 0: Create Feature Branch and end with documentation update step)

### 6. **Testing Checklist**
- Post-implementation verification checklist
- Cypress E2E test coverage
- Component functionality verification
- Error handling verification

### 7. **Error Handling Patterns**
- Error state management in components
- User-friendly error messages
- API error handling in services

### 8. **UI/UX Considerations** (if applicable)
- Bootstrap component usage
- Responsive design considerations
- Accessibility requirements
- Loading states and feedback

### 9. **Dependencies**
- External libraries and tools required
- React Bootstrap components used
- Third-party packages (if any)

### 10. **Notes**
- Important reminders and constraints
- Business rules
- Language requirements (English only)
- TypeScript vs JavaScript considerations

### 11. **Next Steps After Implementation**
- Post-implementation tasks (documentation is already covered in Step N+1, but may include integration, deployment, etc.)

### 12. **Implementation Verification**
- Final verification checklist:
  - Code Quality
  - Functionality
  - Testing
  - Integration
  - Documentation updates completed
