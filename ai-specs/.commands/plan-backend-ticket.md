# Role

You are an expert software architect with extensive experience in Node/Express projects applying Domain-Driven Design (DDD).

# Ticket ID

$ARGUMENTS

# Goal

Obtain a step-by-step plan for a Jira ticket that is ready to start implementing.

# Process and rules

1. Adopt the role of `.claude/agents/backend-developer.md`
1. Analyze the Jira ticket mentioned in #ticket using the MCP. If the mention is a local file, then avoid using MCP
2. Propose a step-by-step plan for the backend part, taking into account everything mentioned in the ticket and applying the project’s best practices and rules you can find in  `/openspec/specs`. 
3. Apply the best practices of your role to ensure the developer can be fully autonomous and implement the ticket end-to-end using only your plan. 
4. Do not write code yet; provide only the plan in the output format defined below.
5. If you are asked to start implementing at some point, make sure the first thing you do is to move to a branch named after the ticket id (if you are not yet there) and follow the process described in the command /develop-us.md

# Output format

Markdown document at the path `openspec/changes/[jira_id]_backend.md` containing the complete implementation details.
Follow this template:

## Backend Implementation Plan Ticket Template Structure

### 1. **Header**
- Title: `# Backend Implementation Plan: [TICKET-ID] [Feature Name]`

### 2. **Overview**
- Brief description of the feature and architecture principles (DDD, clean architecture)

### 3. **Architecture Context**
- Layers involved (Domain, Application, Presentation)
- Components/files referenced

### 4. **Implementation Steps**
Detailed steps, typically:

#### **Step 0: Create Feature Branch**
- **Action**: Create and switch to a new feature branch following the development workflow. Check if it exists and if not, create it
- **Branch Naming**: Follow the project's branch naming convention (`feature/[ticket-id]-backend`, make it required to use this naming, don't allow to keep on the general task [ticket-id] if it exists to separate concerns)
- **Implementation Steps**:
  1. Ensure you're on the latest `main` or `develop` branch (or appropriate base branch)
  2. Pull latest changes: `git pull origin [base-branch]`
  3. Create new branch: `git checkout -b [branch-name]`
  4. Verify branch creation: `git branch`
- **Notes**: This must be the FIRST step before any code changes. Refer to `openspec/specs/backend-standards.mdc` section "Development Workflow" for specific branch naming conventions and workflow rules.

#### **Step N: [Action Name]**
- **File**: Target file path
- **Action**: What to implement
- **Function Signature**: Code signature
- **Implementation Steps**: Numbered list
- **Dependencies**: Required imports
- **Implementation Notes**: Technical details

Common steps:
- **Step 1**: Create Validation Function
- **Step 2**: Create Service Method
- **Step 3**: Create Controller Method
- **Step 4**: Add Route
- **Step 5**: Write Unit Tests (with subcategories: Successful Cases, Validation Errors, Not Found, Reference Validation, Server Errors, Edge Cases)
- **Step 6**: Review and Update Existing Unit Tests (MANDATORY)
- **Step 7**: Run Unit Tests and Verify Database State (MANDATORY)
- **Step 8**: Manual Endpoint Testing with curl (MANDATORY)

Example of a good structure:
**Implementation Steps**:

1. **Validate Position Exists**:
   - Use `Position.findOne(positionId)` to retrieve existing position
   - If position not found, throw `new Error('Position not found')`
   - Store the existing position for merging

#### **Step N: Review and Update Existing Unit Tests (MANDATORY)**
- **Action**: Analyze existing unit tests to identify which ones need updates due to code changes
- **Implementation Steps**:
  1. **Identify Affected Tests**: Review all existing unit tests in the project to determine which tests may be affected by the new implementation:
     - Tests for modified functions/methods
     - Tests for related services or controllers
     - Tests that depend on changed data models or schemas
     - Integration tests that may be impacted
  2. **Review Test Coverage**: Check if existing tests still cover all edge cases and scenarios after the changes
  3. **Update Tests**: Modify existing tests as needed to:
     - Reflect new behavior or requirements
     - Fix broken assertions due to API changes
     - Update mock data or expectations
     - Ensure tests align with new validation rules
  4. **Document Changes**: Note which tests were updated and why
- **Notes**: This step is MANDATORY. All existing tests must be reviewed and updated if necessary before considering the implementation complete. Do not skip this validation.

#### **Step N+1: Run Unit Tests and Verify Database State (MANDATORY)**
- **Action**: Execute all unit tests and ensure database state is properly restored after tests
- **Implementation Steps**:
  1. **Run All Unit Tests**: Execute the test suite for the modified components:
     - Run tests for new functionality: `npm test [test-file-path]`
     - Run all related tests: `npm test`
     - Capture the full test report output
  2. **Verify Test Results**: 
     - Check that all tests pass (green status)
     - Review any failing tests and error messages
     - Identify root causes of failures
  3. **Fix Failing Tests**: 
     - Address any test failures by fixing:
       - Implementation bugs
       - Incorrect test assertions
       - Missing test setup/teardown
       - Database state issues
  4. **Verify Database State Restoration**:
     - Ensure all tests that modify database values properly restore the database to its original state
     - Verify that test cleanup/teardown hooks are working correctly
     - Check that database transactions are properly rolled back (if using transaction-based testing)
     - Confirm that test fixtures are properly reset between tests
  5. **Show Test Report**: Display the complete test execution report including:
     - Total number of tests run
     - Number of passing tests
     - Number of failing tests (must be 0)
     - Test coverage metrics
     - Execution time
  6. **Re-run Tests**: After fixing any issues, re-run the test suite to confirm all tests pass
- **Dependencies**: 
  - Test framework (Jest, Mocha, etc.)
  - Database testing utilities
  - Test cleanup/teardown mechanisms
- **Notes**: 
  - This step is MANDATORY and must be completed before marking implementation as done
  - All tests must pass (0 failures)
  - Database state must be properly restored after each test run
  - Test report must be shown and verified
  - Do not proceed to next steps if tests are failing or database state is not properly managed

#### **Step N+2: Manual Endpoint Testing with curl (MANDATORY)**
- **Action**: Manually test all new endpoints using curl commands and restore database state for CREATE/UPDATE/DELETE operations
- **Implementation Steps**:
  1. **Prepare Test Environment**:
     - Ensure the backend server is running
     - Verify database connection is active
     - Note the current database state (if testing CREATE/UPDATE/DELETE endpoints)
  2. **Test GET Endpoints** (if any):
     - Create curl command to test GET endpoint
     - Execute curl command: `curl -X GET [endpoint-url] [headers]`
     - Verify response status code (200, 404, etc.)
     - Verify response body structure and content
     - Document the curl command and response
  3. **Test POST Endpoints** (CREATE operations):
     - Create curl command with request body: `curl -X POST [endpoint-url] -H "Content-Type: application/json" -d '[json-body]'`
     - Execute curl command and capture response
     - Verify response status code (201, 400, 422, etc.)
     - Verify response body contains created resource
     - **Restore Database State**: After testing, delete the created record to restore database to original state
     - Document the curl command, response, and cleanup action
  4. **Test PUT/PATCH Endpoints** (UPDATE operations):
     - Create curl command with updated data: `curl -X PUT [endpoint-url] -H "Content-Type: application/json" -d '[json-body]'`
     - Execute curl command and capture response
     - Verify response status code (200, 404, 400, etc.)
     - Verify response body contains updated resource
     - **Restore Database State**: After testing, revert the updated record to its original values to restore database state
     - Document the curl command, response, and cleanup action
  5. **Test DELETE Endpoints**:
     - Create curl command: `curl -X DELETE [endpoint-url]`
     - Execute curl command and capture response
     - Verify response status code (200, 204, 404, etc.)
     - Verify deletion was successful
     - **Restore Database State**: After testing, recreate the deleted record with original values to restore database state
     - Document the curl command, response, and cleanup action
  6. **Test Error Cases**:
     - Test with invalid data (validation errors)
     - Test with non-existent resources (404 errors)
     - Test with unauthorized access (if applicable)
     - Verify error response format matches API specification
  7. **Document All Tests**:
     - Document all curl commands used
     - Document all responses received
     - Document database state restoration actions
     - Include examples of successful and error responses
- **Dependencies**:
  - Backend server running
  - Database access for state restoration
  - curl command-line tool
- **Notes**:
  - This step is MANDATORY for all new endpoints
  - All CREATE/UPDATE/DELETE operations must restore database to original state after testing
  - Document all curl commands and responses for future reference
  - Verify that database state matches pre-test state after cleanup
  - Do not skip manual testing even if unit tests pass

#### **Step N+3: Update Technical Documentation**
- **Action**: Review and update technical documentation according to changes made
- **Implementation Steps**:
  1. **Review Changes**: Analyze all code changes made during implementation
  2. **Identify Documentation Files**: Determine which documentation files need updates based on:
     - Data model changes → Update `openspec/specs/data-model.md`
     - API endpoint changes → Update `openspec/specs/api-spec.yml`
     - Standards/libraries/config changes → Update relevant `*-standards.mdc` files
     - Architecture changes → Update relevant architecture documentation
  3. **Update Documentation**: For each affected file:
     - Update content in English (as per `documentation-standards.mdc`)
     - Maintain consistency with existing documentation structure
     - Ensure proper formatting
  4. **Verify Documentation**: 
     - Confirm all changes are accurately reflected
     - Check that documentation follows established structure
  5. **Report Updates**: Document which files were updated and what changes were made
- **References**: 
  - Follow process described in `openspec/specs/documentation-standards.mdc`
  - All documentation must be written in English
- **Notes**: This step is MANDATORY before considering the implementation complete. Do not skip documentation updates.

### 5. **Implementation Order**
- Numbered list of steps in sequence (must start with Step 0: Create Feature Branch and end with documentation update step)
- **MANDATORY Steps** (must be included in all plans):
  - Step 0: Create Feature Branch
  - Step N: Review and Update Existing Unit Tests
  - Step N+1: Run Unit Tests and Verify Database State
  - Step N+2: Manual Endpoint Testing with curl
  - Step N+3: Update Technical Documentation

### 6. **Testing Checklist**
- Post-implementation verification checklist
- **MANDATORY Validations**:
  - [ ] All existing unit tests have been reviewed and updated if necessary
  - [ ] All new unit tests have been created and are passing
  - [ ] All unit tests have been executed and the full test report has been reviewed
  - [ ] All test failures have been fixed (0 failures required)
  - [ ] Database state is properly restored after all tests that modify database values
  - [ ] Test cleanup/teardown mechanisms are working correctly
  - [ ] Test coverage meets project requirements
  - [ ] All new endpoints have been manually tested using curl
  - [ ] All curl commands and responses have been documented
  - [ ] Database state has been restored after testing CREATE/UPDATE/DELETE endpoints
  - [ ] Error cases have been tested manually (validation errors, 404, etc.)

### 7. **Error Response Format**
- JSON structure
- HTTP status code mapping

### 8. **Partial Update Support** (if applicable)
- Behavior for partial updates

### 9. **Dependencies**
- External libraries and tools required

### 10. **Notes**
- Important reminders and constraints
- Business rules
- Language requirements

### 11. **Next Steps After Implementation**
- Post-implementation tasks (documentation is already covered in Step N+1, but may include integration, deployment, etc.)

### 12. **Implementation Verification**
- Final verification checklist:
  - Code Quality
  - Functionality
  - Testing:
    - [ ] All existing unit tests reviewed and updated if necessary
    - [ ] All new unit tests created and passing
    - [ ] Full test suite executed with 0 failures
    - [ ] Test report shown and verified
    - [ ] Database state properly restored after all tests
    - [ ] Test cleanup/teardown verified to work correctly
    - [ ] All new endpoints manually tested with curl
    - [ ] All curl commands and responses documented
    - [ ] Database state restored after CREATE/UPDATE/DELETE endpoint testing
    - [ ] Error cases tested manually (validation errors, 404, etc.)
  - Integration
  - Documentation updates completed
