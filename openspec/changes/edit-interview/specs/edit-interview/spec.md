## ADDED Requirements

### Requirement: Backend API supports interview updates
The system SHALL provide a PATCH endpoint at `/candidates/{candidateId}/interviews/{interviewId}` that accepts partial interview data and updates an existing interview record. The endpoint SHALL validate all provided fields, enforce business rules, and return the updated interview with HTTP 200 status.

#### Scenario: Successful interview update with all fields
- **WHEN** a valid PATCH request is sent to `/candidates/{candidateId}/interviews/{interviewId}` with all updatable fields (interviewDate, interviewStepId, employeeId, score, notes, result)
- **THEN** the system SHALL update the interview record in the database
- **AND** the system SHALL return HTTP 200 with the complete updated interview object
- **AND** all provided fields SHALL be updated with the new values

#### Scenario: Successful partial interview update
- **WHEN** a valid PATCH request is sent with only some fields (e.g., only score and notes)
- **THEN** the system SHALL update only the provided fields
- **AND** unprovided fields SHALL remain unchanged
- **AND** the system SHALL return HTTP 200 with the updated interview object

#### Scenario: Interview update with interview not found
- **WHEN** a PATCH request is sent to `/candidates/{candidateId}/interviews/{interviewId}` where the interviewId does not exist
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL include an error message indicating the interview was not found

#### Scenario: Interview update with interview not belonging to candidate
- **WHEN** a PATCH request is sent where the interview exists but does not belong to the candidate specified in the URL path
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL include an error message indicating the interview does not belong to the specified candidate

#### Scenario: Interview update with invalid candidate ID format
- **WHEN** a PATCH request is sent with a non-numeric candidateId
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL include an error message indicating invalid candidate ID format

#### Scenario: Interview update with invalid interview ID format
- **WHEN** a PATCH request is sent with a non-numeric interviewId
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL include an error message indicating invalid interview ID format

### Requirement: Interview update validation rules
The system SHALL validate all provided interview fields according to the following rules: `interviewDate` (if provided, must be valid ISO 8601 format), `interviewStepId` (if provided, must exist and belong to position's interview flow), `employeeId` (if provided, must exist and be active), `score` (if provided, must be integer between 0-5 inclusive or null), `notes` (if provided, must be string with maximum 1000 characters or null), `result` (if provided, must be one of: "Pending", "Passed", "Failed" or null). All fields are optional for partial updates.

#### Scenario: Interview date validation - valid ISO 8601 format
- **WHEN** a PATCH request contains an interviewDate in valid ISO 8601 format (e.g., "2026-02-15T10:00:00Z")
- **THEN** the system SHALL accept the interviewDate and proceed with the update

#### Scenario: Interview date validation - invalid format
- **WHEN** a PATCH request contains an interviewDate that is not in valid ISO 8601 format
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the date format is invalid

#### Scenario: Interview date validation - unparseable date
- **WHEN** a PATCH request contains an interviewDate that cannot be parsed as a valid date
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the date is invalid

#### Scenario: Interview step validation - step exists and belongs to position's flow
- **WHEN** a PATCH request contains an interviewStepId that exists and belongs to the interview flow of the interview's application's position
- **THEN** the system SHALL accept the interviewStepId and proceed with the update

#### Scenario: Interview step validation - step does not exist
- **WHEN** a PATCH request contains an interviewStepId that does not exist in the database
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL indicate that the interview step was not found

#### Scenario: Interview step validation - step does not belong to position's flow
- **WHEN** a PATCH request contains an interviewStepId that exists but does not belong to the interview flow of the interview's application's position
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the interview step does not belong to the position's interview flow

#### Scenario: Employee validation - employee exists and is active
- **WHEN** a PATCH request contains an employeeId that exists and is active (isActive = true)
- **THEN** the system SHALL accept the employeeId and proceed with the update

#### Scenario: Employee validation - employee does not exist
- **WHEN** a PATCH request contains an employeeId that does not exist in the database
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL indicate that the employee was not found

#### Scenario: Employee validation - employee is not active
- **WHEN** a PATCH request contains an employeeId that exists but is not active (isActive = false)
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the employee is not active

#### Scenario: Score validation - valid range
- **WHEN** a PATCH request contains a score that is an integer between 0 and 5 (inclusive)
- **THEN** the system SHALL accept the score and proceed with the update

#### Scenario: Score validation - out of range (negative)
- **WHEN** a PATCH request contains a score that is less than 0
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the score must be between 0 and 5

#### Scenario: Score validation - out of range (greater than 5)
- **WHEN** a PATCH request contains a score that is greater than 5
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the score must be between 0 and 5

#### Scenario: Score validation - null value
- **WHEN** a PATCH request contains a score that is null
- **THEN** the system SHALL accept the null value and update the interview with score set to null

#### Scenario: Notes validation - within length limit
- **WHEN** a PATCH request contains notes that are a string with 1000 characters or less
- **THEN** the system SHALL accept the notes and proceed with the update

#### Scenario: Notes validation - exceeds length limit
- **WHEN** a PATCH request contains notes that exceed 1000 characters
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that notes must not exceed 1000 characters

#### Scenario: Notes validation - null or empty value
- **WHEN** a PATCH request contains notes that are null or empty string
- **THEN** the system SHALL accept the null/empty value and update the interview with notes set to null

#### Scenario: Result validation - valid value
- **WHEN** a PATCH request contains a result that is one of: "Pending", "Passed", "Failed"
- **THEN** the system SHALL accept the result and proceed with the update

#### Scenario: Result validation - invalid value
- **WHEN** a PATCH request contains a result that is not one of the valid values
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the result must be one of: "Pending", "Passed", "Failed"

#### Scenario: Result validation - null value
- **WHEN** a PATCH request contains a result that is null
- **THEN** the system SHALL accept the null value and update the interview with result set to null

#### Scenario: Partial update - only date changed
- **WHEN** a PATCH request contains only interviewDate field
- **THEN** the system SHALL update only the interviewDate
- **AND** all other fields SHALL remain unchanged

#### Scenario: Partial update - only score and notes changed
- **WHEN** a PATCH request contains only score and notes fields
- **THEN** the system SHALL update only the score and notes
- **AND** all other fields SHALL remain unchanged

#### Scenario: Empty request body
- **WHEN** a PATCH request is sent with an empty request body
- **THEN** the system SHALL return HTTP 200 with the unchanged interview object
- **AND** no fields SHALL be modified

### Requirement: Frontend supports interview editing
The frontend SHALL provide an edit icon (pen/pencil) next to each interview in the CandidateDetails component that opens a modal with a pre-filled form allowing users to edit interview details.

#### Scenario: Edit icon appears for each interview
- **WHEN** a candidate's details are displayed with interviews
- **THEN** an edit icon SHALL be visible next to each interview in the list
- **AND** the icon SHALL be clickable

#### Scenario: Clicking edit icon opens modal with pre-filled form
- **WHEN** a user clicks the edit icon for an interview
- **THEN** a modal SHALL open with title "Edit Interview"
- **AND** the form fields SHALL be pre-filled with current interview values
- **AND** the interviewDate SHALL be converted from ISO format to datetime-local format for the input

#### Scenario: Form fields match create interview form
- **WHEN** the edit modal is open
- **THEN** the form SHALL contain the same fields as the create interview form: Interview Date & Time, Interview Step, Employee, Result, Score (star rating), Notes
- **AND** all fields SHALL be editable

#### Scenario: Successful interview update
- **WHEN** a user modifies interview fields and clicks Save
- **THEN** the system SHALL call the update API endpoint
- **AND** the modal SHALL close on successful update
- **AND** the interview list SHALL be refreshed to show updated values
- **AND** a success message SHALL be displayed

#### Scenario: Cancel edit operation
- **WHEN** a user clicks Cancel in the edit modal
- **THEN** the modal SHALL close without saving changes
- **AND** no API call SHALL be made
- **AND** the interview list SHALL remain unchanged

#### Scenario: Validation errors displayed in modal
- **WHEN** a user submits invalid data (e.g., score > 5, notes > 1000 characters)
- **THEN** validation errors SHALL be displayed inline for each invalid field
- **AND** the modal SHALL remain open
- **AND** the user SHALL be able to correct the errors

#### Scenario: Server error handling
- **WHEN** the update API call fails (network error, server error)
- **THEN** an error message SHALL be displayed
- **AND** the modal SHALL close with error notification
- **AND** the interview list SHALL remain unchanged

#### Scenario: Loading state during update
- **WHEN** a user clicks Save in the edit modal
- **THEN** the Save button SHALL show loading state
- **AND** form fields SHALL be disabled during the API call
- **AND** the Cancel button SHALL remain enabled
