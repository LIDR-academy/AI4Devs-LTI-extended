## ADDED Requirements

### Requirement: Backend API supports partial position updates
The system SHALL provide a PATCH endpoint at `/positions/:id` that accepts partial position data updates. The endpoint SHALL update only the fields provided in the request body, leaving unprovided fields unchanged. The endpoint SHALL validate all provided fields according to business rules and SHALL reject attempts to update immutable fields (`id`, `companyId`, `interviewFlowId`).

#### Scenario: Successful partial update
- **WHEN** a valid PATCH request is sent to `/positions/:id` with only `title` and `description` fields
- **THEN** the system SHALL update only those fields in the database
- **AND** the system SHALL return HTTP 200 with the complete updated position object
- **AND** all other position fields SHALL remain unchanged

#### Scenario: Update with validation error
- **WHEN** a PATCH request contains a `title` field exceeding 100 characters
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL include an error message indicating the validation failure

#### Scenario: Attempt to update immutable field
- **WHEN** a PATCH request includes `companyId` or `interviewFlowId` in the request body
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL include an error message indicating that these fields cannot be updated

#### Scenario: Update non-existent position
- **WHEN** a PATCH request is sent to `/positions/:id` where the position ID does not exist
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL include an error message indicating the position was not found

#### Scenario: Invalid position ID format
- **WHEN** a PATCH request is sent with a non-numeric position ID
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL include an error message indicating invalid ID format

### Requirement: Position update validation rules
The system SHALL validate all updatable position fields according to the following rules: `title` (max 100 chars, cannot be empty), `description` (cannot be empty), `status` (must be one of: "Draft", "Open", "Contratado", "Cerrado", "Borrador"), `isVisible` (must be boolean), `location` (cannot be empty), `jobDescription` (cannot be empty), `salaryMin` and `salaryMax` (must be >= 0, and if both provided, `salaryMax >= salaryMin`), `applicationDeadline` (must be valid ISO 8601 date-time string).

#### Scenario: Valid status enum value
- **WHEN** a PATCH request contains a `status` field with value "Open"
- **THEN** the system SHALL accept the update and return HTTP 200

#### Scenario: Invalid status enum value
- **WHEN** a PATCH request contains a `status` field with value "InvalidStatus"
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the status value is invalid

#### Scenario: Salary range validation
- **WHEN** a PATCH request contains both `salaryMin` (50000) and `salaryMax` (30000)
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that `salaryMax` must be greater than or equal to `salaryMin`

#### Scenario: Empty string rejection for required fields
- **WHEN** a PATCH request contains an empty string for `title`, `description`, `location`, or `jobDescription`
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that these fields cannot be empty

### Requirement: Frontend edit form for positions
The system SHALL provide a React form component that allows users to edit position details. The form SHALL pre-populate all fields with existing position data, SHALL perform client-side validation, SHALL display loading state during submission, SHALL show success/error messages, and SHALL navigate back to the positions list after successful update.

#### Scenario: Form pre-population
- **WHEN** a user navigates to the edit form for an existing position
- **THEN** the form SHALL display all current position field values
- **AND** all form fields SHALL be editable

#### Scenario: Successful form submission
- **WHEN** a user submits the edit form with valid data
- **THEN** the form SHALL display a loading state
- **AND** the system SHALL send a PATCH request to `/positions/:id`
- **AND** upon successful response, the form SHALL display a success message
- **AND** the system SHALL navigate the user back to the positions list
- **AND** the positions list SHALL reflect the updated position data

#### Scenario: Form validation error display
- **WHEN** a user enters invalid data (e.g., title exceeding 100 characters)
- **THEN** the form SHALL display validation error messages
- **AND** the form SHALL prevent submission until all errors are resolved

#### Scenario: API error handling in form
- **WHEN** the API returns an error response (400, 404, 500)
- **THEN** the form SHALL display the error message to the user
- **AND** the form SHALL remain on the edit page
- **AND** the user SHALL be able to correct the data and resubmit

### Requirement: Edit button in positions list
The system SHALL display an "Editar" button on each position card in the positions list. Clicking the button SHALL navigate the user to the edit form for that position.

#### Scenario: Navigate to edit form
- **WHEN** a user clicks the "Editar" button on a position card
- **THEN** the system SHALL navigate to `/positions/:id/edit`
- **AND** the edit form SHALL be displayed with that position's data

### Requirement: Frontend service method for position updates
The system SHALL provide a `updatePosition(id, positionData)` method in the frontend position service that sends a PATCH request to `/positions/:id` with the provided data, handles errors appropriately, and returns the updated position data.

#### Scenario: Successful API call
- **WHEN** `updatePosition(id, positionData)` is called with valid data
- **THEN** the method SHALL send a PATCH request to `/positions/:id`
- **AND** the method SHALL return the updated position object on success

#### Scenario: API error handling
- **WHEN** `updatePosition(id, positionData)` is called and the API returns an error
- **THEN** the method SHALL throw an error with the API error message
- **AND** the calling code SHALL be able to catch and handle the error

### Requirement: Routing for edit form
The system SHALL provide a route at `/positions/:id/edit` that renders the edit form component with the position data loaded based on the ID parameter.

#### Scenario: Route access
- **WHEN** a user navigates to `/positions/:id/edit` with a valid position ID
- **THEN** the system SHALL render the edit form component
- **AND** the form SHALL load and display the position data

#### Scenario: Invalid route parameter
- **WHEN** a user navigates to `/positions/:id/edit` with an invalid position ID
- **THEN** the system SHALL handle the error appropriately (display error message or redirect)
