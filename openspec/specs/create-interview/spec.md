# Spec: Create Interview

## Purpose

Defines the requirements for creating a new interview record for a candidate's application, covering the backend API endpoint, input validation, business-rule enforcement, and the frontend modal UI.

---

## Requirements

### Requirement: Backend API supports interview creation
The system SHALL provide a `POST` endpoint at `/candidates/{candidateId}/interviews` that accepts interview data, creates a new interview for one of the candidate's applications, and returns the created interview with HTTP `201`. The endpoint SHALL validate the request body, enforce foreign-key ownership and business rules, and return the error shape `{ message, error }` with the appropriate status code on failure.

#### Scenario: Successful interview creation
- **WHEN** a valid `POST` request is sent to `/candidates/{candidateId}/interviews` with `applicationId`, `interviewStepId`, `employeeId`, `interviewDate`, and optional `result`, `score`, `notes`
- **THEN** the system SHALL insert a new interview record associated with the given application
- **AND** the system SHALL return HTTP `201` with the created interview object (`id, applicationId, interviewStepId, employeeId, interviewDate, result, score, notes`)

#### Scenario: Creation with minimal required fields
- **WHEN** a valid `POST` request contains only the required fields (`applicationId`, `interviewStepId`, `employeeId`, `interviewDate`) and omits `result`
- **THEN** the system SHALL create the interview with `result` defaulting to `Pending`
- **AND** the system SHALL return HTTP `201` with the created interview

#### Scenario: Invalid candidate ID format
- **WHEN** a `POST` request is sent with a non-numeric `candidateId`
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate an invalid candidate ID format

#### Scenario: Candidate not found
- **WHEN** a `POST` request targets a `candidateId` that does not exist
- **THEN** the system SHALL return HTTP `404`
- **AND** the response SHALL indicate the candidate was not found

#### Scenario: Application not found
- **WHEN** a `POST` request contains an `applicationId` that does not exist
- **THEN** the system SHALL return HTTP `404`
- **AND** the response SHALL indicate the application was not found

#### Scenario: Application does not belong to candidate
- **WHEN** a `POST` request contains an `applicationId` that exists but whose `candidateId` does not equal the path `candidateId`
- **THEN** the system SHALL return HTTP `404`
- **AND** the response SHALL indicate the application does not belong to the specified candidate

#### Scenario: Unexpected field rejected
- **WHEN** a `POST` request body contains a field that is not part of the allowed create payload
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate that an unexpected field was provided
- **AND** no interview record SHALL be created

---

### Requirement: Interview creation required-field validation
The system SHALL require `applicationId`, `interviewStepId`, `employeeId`, and `interviewDate` on creation. Each missing required field SHALL result in HTTP `400` before any database write.

#### Scenario: Missing applicationId
- **WHEN** a `POST` request omits `applicationId`
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate that `applicationId` is required

#### Scenario: Missing interviewStepId
- **WHEN** a `POST` request omits `interviewStepId`
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate that `interviewStepId` is required

#### Scenario: Missing employeeId
- **WHEN** a `POST` request omits `employeeId`
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate that `employeeId` is required

#### Scenario: Missing interviewDate
- **WHEN** a `POST` request omits `interviewDate`
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate that `interviewDate` is required

#### Scenario: Non-integer foreign-key field
- **WHEN** a `POST` request contains `applicationId`, `interviewStepId`, or `employeeId` that is not a positive integer
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate the field must be a positive integer

---

### Requirement: Interview creation field-value validation
The system SHALL validate field values as follows: `interviewDate` must be a valid ISO 8601 date-time; `score` must be an integer between 0 and 5 inclusive or `null`; `notes` must be a string of at most 1000 characters or `null`; `result` must be one of `Pending`, `Passed`, `Failed` (or `null`, defaulting to `Pending` when omitted).

#### Scenario: Interview date validation - valid ISO 8601
- **WHEN** a `POST` request contains an `interviewDate` in valid ISO 8601 format (e.g., `2026-06-20T10:00:00Z`)
- **THEN** the system SHALL accept the date and proceed with creation

#### Scenario: Interview date validation - invalid format
- **WHEN** a `POST` request contains an `interviewDate` that is not valid ISO 8601 or cannot be parsed
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate the date is invalid

#### Scenario: Score validation - valid range
- **WHEN** a `POST` request contains a `score` that is an integer between 0 and 5 inclusive
- **THEN** the system SHALL accept the score and proceed with creation

#### Scenario: Score validation - out of range
- **WHEN** a `POST` request contains a `score` less than 0 or greater than 5
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate the score must be between 0 and 5

#### Scenario: Score validation - null allowed
- **WHEN** a `POST` request contains a `score` of `null`
- **THEN** the system SHALL accept the null value and create the interview with `score` set to null

#### Scenario: Notes validation - within length limit
- **WHEN** a `POST` request contains `notes` of 1000 characters or fewer
- **THEN** the system SHALL accept the notes and proceed with creation

#### Scenario: Notes validation - exceeds length limit
- **WHEN** a `POST` request contains `notes` exceeding 1000 characters
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate notes must not exceed 1000 characters

#### Scenario: Result validation - valid value
- **WHEN** a `POST` request contains a `result` of `Pending`, `Passed`, or `Failed`
- **THEN** the system SHALL accept the result and proceed with creation

#### Scenario: Result validation - invalid value
- **WHEN** a `POST` request contains a `result` that is not one of the allowed values
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate the result must be one of `Pending`, `Passed`, `Failed`

#### Scenario: Result validation - default when omitted
- **WHEN** a `POST` request omits `result`
- **THEN** the system SHALL create the interview with `result` set to `Pending`

---

### Requirement: Interview creation business-rule validation
The system SHALL enforce that the interview step exists and belongs to the application's position's interview flow, and that the employee exists and is active, before creating the interview.

#### Scenario: Interview step not found
- **WHEN** a `POST` request contains an `interviewStepId` that does not exist
- **THEN** the system SHALL return HTTP `404`
- **AND** the response SHALL indicate the interview step was not found

#### Scenario: Interview step not in position's flow
- **WHEN** a `POST` request contains an `interviewStepId` that exists but does not belong to the application's position's interview flow
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate the interview step does not belong to the position's interview flow

#### Scenario: Employee not found
- **WHEN** a `POST` request contains an `employeeId` that does not exist
- **THEN** the system SHALL return HTTP `404`
- **AND** the response SHALL indicate the employee was not found

#### Scenario: Employee not active
- **WHEN** a `POST` request contains an `employeeId` that exists but is not active (`isActive = false`)
- **THEN** the system SHALL return HTTP `400`
- **AND** the response SHALL indicate the employee is not active

#### Scenario: Internal error
- **WHEN** an unexpected error occurs while persisting the interview
- **THEN** the system SHALL return HTTP `500`
- **AND** the response SHALL not leak internal error details

---

### Requirement: Frontend supports interview creation
The frontend SHALL provide an "Add interview" action per application section in the Candidate Details pane that opens a modal allowing the recruiter to create a new interview for that application, fully internationalized with no hardcoded UI strings.

#### Scenario: Add interview action appears per application
- **WHEN** a candidate's details are displayed with one or more applications
- **THEN** an "Add interview" action SHALL be visible for each application section
- **AND** the action SHALL be clickable

#### Scenario: Clicking Add interview opens the create modal
- **WHEN** a recruiter clicks "Add interview" for an application
- **THEN** a modal titled by the `interviews.createTitle` key SHALL open
- **AND** the form SHALL include application context, interview date & time (`datetime-local`), interview step (scoped to the application's interview flow), employee, result, score (star rating), and notes

#### Scenario: Successful creation
- **WHEN** a recruiter fills valid values and submits the create form
- **THEN** the frontend SHALL convert the `datetime-local` value to ISO 8601 and call the create API
- **AND** on success the modal SHALL close, the new interview SHALL appear in that application's interview list, and a success message (`interviews.createSuccess`) SHALL be displayed

#### Scenario: Cancel creation
- **WHEN** a recruiter clicks Cancel in the create modal
- **THEN** the modal SHALL close without calling the API
- **AND** the interview list SHALL remain unchanged

#### Scenario: Validation errors displayed in modal
- **WHEN** a recruiter submits invalid data (e.g., score out of range, notes too long, missing required field)
- **THEN** validation errors SHALL be displayed inline
- **AND** the modal SHALL remain open for correction

#### Scenario: Server or network error handling
- **WHEN** the create API call fails
- **THEN** an error message (`interviews.failedToCreate`) SHALL be displayed
- **AND** the interview list SHALL remain unchanged

#### Scenario: Loading state during creation
- **WHEN** a recruiter submits the create form
- **THEN** the submit button SHALL show a loading/disabled state during the API call
