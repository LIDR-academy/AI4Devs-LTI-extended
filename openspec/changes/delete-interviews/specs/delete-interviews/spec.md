## ADDED Requirements

### Requirement: Backend API supports interview deletion
The system SHALL provide a DELETE endpoint at `/candidates/{candidateId}/interviews/{interviewId}` that accepts a deletion reason and permanently removes an interview record from the database. The endpoint SHALL validate that the interview exists, belongs to the specified candidate, is not completed, and enforce business rules before deletion.

#### Scenario: Successful interview deletion
- **WHEN** a valid DELETE request is sent to `/candidates/{candidateId}/interviews/{interviewId}` with a deletion reason for a pending interview (result is null or "Pending")
- **THEN** the system SHALL permanently remove the interview record from the database
- **AND** the system SHALL return HTTP 200 with a success message
- **AND** the interview SHALL no longer be accessible through GET endpoints

#### Scenario: Interview deletion with candidate not found
- **WHEN** a DELETE request is sent to `/candidates/{candidateId}/interviews/{interviewId}` where the candidateId does not exist
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL include an error message indicating the candidate was not found

#### Scenario: Interview deletion with interview not found
- **WHEN** a DELETE request is sent to `/candidates/{candidateId}/interviews/{interviewId}` where the interviewId does not exist
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL include an error message indicating the interview was not found

#### Scenario: Interview deletion with interview not belonging to candidate
- **WHEN** a DELETE request is sent to `/candidates/{candidateId}/interviews/{interviewId}` where the interview exists but does not belong to the specified candidate
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL include an error message indicating the interview was not found (for security, do not reveal that interview exists but belongs to different candidate)

#### Scenario: Interview deletion with invalid candidate ID format
- **WHEN** a DELETE request is sent with a non-numeric candidateId
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL include an error message indicating invalid ID format

#### Scenario: Interview deletion with invalid interview ID format
- **WHEN** a DELETE request is sent with a non-numeric interviewId
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL include an error message indicating invalid ID format

### Requirement: Interview deletion validation rules
The system SHALL validate deletion requests according to the following rules: `candidateId` (required, must exist, must be numeric), `interviewId` (required, must exist, must be numeric, must belong to candidate), `reason` (required, must be non-empty string, maximum 500 characters), interview must not be completed (result must be null or "Pending").

#### Scenario: Deletion reason validation - reason provided
- **WHEN** a DELETE request contains a non-empty reason string with maximum 500 characters
- **THEN** the system SHALL accept the reason and proceed with deletion

#### Scenario: Deletion reason validation - reason missing
- **WHEN** a DELETE request does not include a reason field in the request body
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that deletion reason is required

#### Scenario: Deletion reason validation - empty reason
- **WHEN** a DELETE request contains an empty reason string
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that deletion reason cannot be empty

#### Scenario: Deletion reason validation - reason exceeds length limit
- **WHEN** a DELETE request contains a reason string longer than 500 characters
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that deletion reason must not exceed 500 characters

### Requirement: Business rule - prevent deletion of completed interviews
The system SHALL prevent deletion of interviews that have been completed. An interview is considered completed if its result field is set to "Passed" or "Failed". Only pending interviews (result is null or "Pending") SHALL be deletable.

#### Scenario: Attempt to delete completed interview with "Passed" result
- **WHEN** a DELETE request is sent for an interview with result = "Passed"
- **THEN** the system SHALL return HTTP 422 (Unprocessable Entity)
- **AND** the response SHALL include an error message indicating that completed interviews cannot be deleted
- **AND** the interview SHALL remain in the database

#### Scenario: Attempt to delete completed interview with "Failed" result
- **WHEN** a DELETE request is sent for an interview with result = "Failed"
- **THEN** the system SHALL return HTTP 422 (Unprocessable Entity)
- **AND** the response SHALL include an error message indicating that completed interviews cannot be deleted
- **AND** the interview SHALL remain in the database

#### Scenario: Deletion of pending interview allowed
- **WHEN** a DELETE request is sent for an interview with result = null or "Pending"
- **THEN** the system SHALL proceed with deletion
- **AND** the interview SHALL be permanently removed from the database

### Requirement: Frontend UI supports interview deletion
The system SHALL provide a user interface that allows recruiters to delete interviews through a confirmation dialog with reason input. The UI SHALL display a delete button or icon next to each interview, show a confirmation modal when clicked, require a deletion reason, and provide visual feedback after successful deletion.

#### Scenario: Display delete button for pending interviews
- **WHEN** a recruiter views the candidate details page with interviews
- **THEN** the system SHALL display a delete button or icon next to each pending interview (result is null or "Pending")
- **AND** the delete button SHALL be visible and accessible

#### Scenario: Hide delete button for completed interviews
- **WHEN** a recruiter views the candidate details page with interviews
- **THEN** the system SHALL NOT display a delete button next to completed interviews (result is "Passed" or "Failed")
- **OR** the delete button SHALL be disabled with appropriate visual indication

#### Scenario: Open confirmation dialog on delete button click
- **WHEN** a recruiter clicks the delete button for a pending interview
- **THEN** the system SHALL display a confirmation modal dialog
- **AND** the modal SHALL include a text input field for deletion reason
- **AND** the modal SHALL include "Cancel" and "Delete" buttons

#### Scenario: Cancel deletion from confirmation dialog
- **WHEN** a recruiter clicks "Cancel" in the deletion confirmation dialog
- **THEN** the system SHALL close the modal without deleting the interview
- **AND** the interview SHALL remain visible in the list

#### Scenario: Confirm deletion with reason
- **WHEN** a recruiter enters a deletion reason and clicks "Delete" in the confirmation dialog
- **THEN** the system SHALL send a DELETE request to the API with the interview ID and reason
- **AND** upon successful deletion, the system SHALL close the modal
- **AND** the system SHALL remove the interview from the UI
- **AND** the system SHALL refresh the candidate details to ensure consistency

#### Scenario: Display error message on deletion failure
- **WHEN** a DELETE request fails (e.g., interview not found, completed interview, validation error)
- **THEN** the system SHALL display an error message to the user
- **AND** the modal SHALL remain open or close with error feedback
- **AND** the interview SHALL remain visible in the list

#### Scenario: Prevent deletion without reason
- **WHEN** a recruiter attempts to confirm deletion without entering a reason
- **THEN** the system SHALL disable the "Delete" button or show validation error
- **AND** the deletion SHALL not proceed until a reason is provided

### Requirement: Deletion audit trail
The system SHALL log all interview deletion operations for audit purposes. The log SHALL include the interview ID, candidate ID, deletion reason, timestamp, and user information when available.

#### Scenario: Log successful deletion
- **WHEN** an interview is successfully deleted
- **THEN** the system SHALL log the deletion event with interview ID, candidate ID, deletion reason, and timestamp
- **AND** the log entry SHALL be accessible for audit purposes
