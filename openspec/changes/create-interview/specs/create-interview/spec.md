## ADDED Requirements

### Requirement: Backend API supports interview creation
The system SHALL provide a POST endpoint at `/candidates/{candidateId}/interviews` that accepts interview data and creates a new interview record. The endpoint SHALL validate all required fields, enforce business rules, and return the created interview with HTTP 201 status.

#### Scenario: Successful interview creation
- **WHEN** a valid POST request is sent to `/candidates/{candidateId}/interviews` with all required fields (applicationId, interviewStepId, employeeId, interviewDate) and optional fields (score, notes)
- **THEN** the system SHALL create a new interview record in the database
- **AND** the system SHALL return HTTP 201 with the complete interview object including the generated ID
- **AND** the interview SHALL be associated with the specified application, interview step, and employee

#### Scenario: Interview creation with only required fields
- **WHEN** a valid POST request is sent with only required fields (applicationId, interviewStepId, employeeId, interviewDate) and no optional fields
- **THEN** the system SHALL create the interview record
- **AND** the system SHALL return HTTP 201 with the interview object where score and notes are null

#### Scenario: Interview creation with candidate not found
- **WHEN** a POST request is sent to `/candidates/{candidateId}/interviews` where the candidateId does not exist
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL include an error message indicating the candidate was not found

#### Scenario: Interview creation with invalid candidate ID format
- **WHEN** a POST request is sent with a non-numeric candidateId
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL include an error message indicating invalid ID format

### Requirement: Interview creation validation rules
The system SHALL validate all interview fields according to the following rules: `applicationId` (required, must exist, must belong to candidate), `interviewStepId` (required, must exist, must belong to position's interview flow), `employeeId` (required, must exist, must be active), `interviewDate` (required, must be valid ISO 8601 format - accepts date with time defaulting to 00:00:00Z), `score` (optional, if provided must be integer between 0-5 inclusive), `notes` (optional, if provided must be string with maximum 1000 characters).

#### Scenario: Application validation - application exists and belongs to candidate
- **WHEN** a POST request contains an applicationId that exists and belongs to the specified candidate
- **THEN** the system SHALL accept the applicationId and proceed with interview creation

#### Scenario: Application validation - application does not exist
- **WHEN** a POST request contains an applicationId that does not exist in the database
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL indicate that the application was not found

#### Scenario: Application validation - application does not belong to candidate
- **WHEN** a POST request contains an applicationId that exists but does not belong to the candidate specified in the URL path
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL indicate that the application does not belong to the specified candidate

#### Scenario: Interview step validation - step exists and belongs to position's flow
- **WHEN** a POST request contains an interviewStepId that exists and belongs to the interview flow of the application's position
- **THEN** the system SHALL accept the interviewStepId and proceed with interview creation

#### Scenario: Interview step validation - step does not exist
- **WHEN** a POST request contains an interviewStepId that does not exist in the database
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL indicate that the interview step was not found

#### Scenario: Interview step validation - step does not belong to position's flow
- **WHEN** a POST request contains an interviewStepId that exists but does not belong to the interview flow of the application's position
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL indicate that the interview step does not belong to the position's interview flow

#### Scenario: Employee validation - employee exists and is active
- **WHEN** a POST request contains an employeeId that exists and has isActive = true
- **THEN** the system SHALL accept the employeeId and proceed with interview creation

#### Scenario: Employee validation - employee does not exist
- **WHEN** a POST request contains an employeeId that does not exist in the database
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL indicate that the employee was not found

#### Scenario: Employee validation - employee is not active
- **WHEN** a POST request contains an employeeId that exists but has isActive = false
- **THEN** the system SHALL return HTTP 404
- **AND** the response SHALL indicate that the employee is not active

#### Scenario: Interview date validation - valid ISO 8601 format
- **WHEN** a POST request contains an interviewDate in valid ISO 8601 format (e.g., "2026-02-15T00:00:00Z" or "2026-02-15T10:00:00Z")
- **THEN** the system SHALL accept the date and proceed with interview creation
- **AND** the frontend SHALL format date-only selections as ISO 8601 with time 00:00:00Z

#### Scenario: Interview date validation - invalid format
- **WHEN** a POST request contains an interviewDate that is not a valid ISO 8601 format
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the date format is invalid

#### Scenario: Score validation - valid range (0-5)
- **WHEN** a POST request contains a score value between 0 and 5 (inclusive)
- **THEN** the system SHALL accept the score and proceed with interview creation

#### Scenario: Score validation - out of range (negative)
- **WHEN** a POST request contains a score value less than 0
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the score must be between 0 and 5

#### Scenario: Score validation - out of range (above 5)
- **WHEN** a POST request contains a score value greater than 5
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that the score must be between 0 and 5

#### Scenario: Score validation - null value allowed
- **WHEN** a POST request contains score as null or omits the score field
- **THEN** the system SHALL accept the request and create the interview with score = null

#### Scenario: Notes validation - within length limit
- **WHEN** a POST request contains notes with 1000 characters or less
- **THEN** the system SHALL accept the notes and proceed with interview creation

#### Scenario: Notes validation - exceeds length limit
- **WHEN** a POST request contains notes with more than 1000 characters
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that notes must not exceed 1000 characters

#### Scenario: Notes validation - null or empty allowed
- **WHEN** a POST request contains notes as null, empty string, or omits the notes field
- **THEN** the system SHALL accept the request and create the interview with notes = null

#### Scenario: Missing required field - applicationId
- **WHEN** a POST request is sent without the applicationId field
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that applicationId is required

#### Scenario: Missing required field - interviewStepId
- **WHEN** a POST request is sent without the interviewStepId field
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that interviewStepId is required

#### Scenario: Missing required field - employeeId
- **WHEN** a POST request is sent without the employeeId field
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that employeeId is required

#### Scenario: Missing required field - interviewDate
- **WHEN** a POST request is sent without the interviewDate field
- **THEN** the system SHALL return HTTP 400
- **AND** the response SHALL indicate that interviewDate is required

### Requirement: Frontend interview creation form
The system SHALL provide a React form component within CandidateDetails that allows users to create interviews. The form SHALL include fields for application selection, interview step selection, employee selection, interview date, score, and notes. The form SHALL perform client-side validation, SHALL display loading state during submission, SHALL show success/error messages, and SHALL refresh candidate details after successful creation.

#### Scenario: Form field rendering
- **WHEN** a user views the interview creation form in CandidateDetails
- **THEN** the form SHALL display all required fields: application selector, interview step selector, employee selector, interview date picker (date-only)
- **AND** the form SHALL display optional fields: score input (1-5 star rating), notes textarea
- **AND** all fields SHALL be properly labeled
- **AND** the score input SHALL display 5 stars (1-5) where clicking a star fills all stars up to that point

#### Scenario: Application selector population
- **WHEN** the form loads for a candidate
- **THEN** the application selector SHALL be populated with all applications belonging to that candidate
- **AND** each option SHALL display meaningful information (e.g., position title, application date)
- **AND** if the candidate object includes an applicationId (from context such as PositionDetails), the application SHALL be automatically selected

#### Scenario: Interview step selector updates based on application
- **WHEN** a user selects an application from the application selector
- **THEN** the interview step selector SHALL be populated with interview steps from that application's position's interview flow
- **AND** the interview step selector SHALL be cleared if a different application is selected
- **AND** if an application is auto-selected (from context), the first interview step from that position's flow SHALL be automatically selected

#### Scenario: Employee selector population
- **WHEN** the form loads
- **THEN** the employee selector SHALL be populated with all active employees (isActive = true) fetched from GET `/employees` endpoint
- **AND** inactive employees SHALL not be displayed
- **AND** employees SHALL be displayed with name and email for identification

#### Scenario: Successful form submission
- **WHEN** a user submits the form with valid data
- **THEN** the form SHALL display a loading state
- **AND** the system SHALL send a POST request to `/candidates/{candidateId}/interviews`
- **AND** upon successful response, the form SHALL display a success message
- **AND** the candidate details SHALL be refreshed to show the new interview
- **AND** the form SHALL be reset to initial state

#### Scenario: Form validation - required fields
- **WHEN** a user attempts to submit the form without filling required fields
- **THEN** the form SHALL display validation error messages for missing fields
- **AND** the form SHALL prevent submission until all required fields are filled

#### Scenario: Form validation - score range
- **WHEN** a user clicks on a star to set a score
- **THEN** the score SHALL be set to the clicked star value (1-5)
- **AND** all stars up to the clicked star SHALL be highlighted in gold
- **AND** clicking the same star again SHALL clear the score
- **AND** the score range SHALL be validated as 1-5 (not 0-5 in the UI, though 0 is technically valid in the API)

#### Scenario: Form validation - notes length
- **WHEN** a user enters notes exceeding 1000 characters
- **THEN** the form SHALL display a validation error message indicating the character limit
- **AND** the form SHALL prevent submission until notes are within the limit

#### Scenario: API error handling in form
- **WHEN** the API returns an error response (400, 404, 500)
- **THEN** the form SHALL display the error message to the user
- **AND** the form SHALL remain visible and allow the user to correct the data and resubmit

#### Scenario: Date picker functionality
- **WHEN** a user interacts with the interview date picker
- **THEN** the date picker SHALL be a date-only input (not datetime)
- **AND** the date picker SHALL allow selection of both past and future dates
- **AND** the selected date SHALL be formatted as ISO 8601 with time set to 00:00:00Z for API submission
- **AND** the form SHALL display helper text indicating that time defaults to 00:00:00

### Requirement: Frontend service method for interview creation
The system SHALL provide a `createInterview(candidateId, interviewData)` method in the frontend interview or candidate service that sends a POST request to `/candidates/{candidateId}/interviews` with the provided data, handles errors appropriately, and returns the created interview data.

#### Scenario: Successful API call
- **WHEN** `createInterview(candidateId, interviewData)` is called with valid data
- **THEN** the method SHALL send a POST request to `/candidates/{candidateId}/interviews`
- **AND** the method SHALL return the created interview object on success

#### Scenario: API error handling
- **WHEN** `createInterview(candidateId, interviewData)` is called and the API returns an error
- **THEN** the method SHALL throw an error with the API error message
- **AND** the calling code SHALL be able to catch and handle the error

### Requirement: Employees endpoint for frontend
The system SHALL provide a GET endpoint at `/employees` that returns all active employees for use in the interview creation form.

#### Scenario: Get active employees
- **WHEN** a GET request is sent to `/employees`
- **THEN** the system SHALL return HTTP 200 with an array of active employees
- **AND** each employee object SHALL include id, name, email, and role
- **AND** only employees with isActive = true SHALL be returned
- **AND** employees SHALL be sorted by name in ascending order

### Requirement: Interview creation error responses
The system SHALL return appropriate HTTP status codes and error messages for different failure scenarios: 400 for validation errors, 404 for resource not found, 500 for server errors.

#### Scenario: Validation error response
- **WHEN** a POST request contains invalid data (e.g., score out of range, missing required field)
- **THEN** the system SHALL return HTTP 400
- **AND** the response body SHALL include a message field and an error field describing the validation failure

#### Scenario: Resource not found error response
- **WHEN** a POST request references a non-existent resource (candidate, application, interview step, or employee)
- **THEN** the system SHALL return HTTP 404
- **AND** the response body SHALL include a message field indicating "Resource not found" and an error field describing which resource was not found

#### Scenario: Server error response
- **WHEN** an unexpected server error occurs during interview creation
- **THEN** the system SHALL return HTTP 500
- **AND** the response body SHALL include a generic error message without exposing internal implementation details
