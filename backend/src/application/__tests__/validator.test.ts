import { validatePositionUpdateData, validateInterviewUpdateData, validateInterviewDeletion, validateCandidatePositionDeletion, validateInterviewCreateData } from '../validator';

describe('validatePositionUpdateData', () => {
    describe('Valid update data scenarios', () => {
        it('should not throw error for valid partial update with title and description', () => {
            const validData = {
                title: 'Software Engineer',
                description: 'We are looking for a skilled software engineer'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for valid full update with all fields', () => {
            const validData = {
                title: 'Senior Software Engineer',
                description: 'We are looking for a senior software engineer',
                status: 'Open',
                isVisible: true,
                location: 'Madrid, Spain',
                jobDescription: 'Full job description here',
                salaryMin: 50000,
                salaryMax: 80000,
                applicationDeadline: '2026-12-31T23:59:59Z'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for valid update with only status', () => {
            const validData = {
                status: 'Open'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for valid update with only isVisible', () => {
            const validData = {
                isVisible: false
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });
    });

    describe('Invalid field types', () => {
        it('should throw error when title is not a string', () => {
            const invalidData = {
                title: 123
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when description is not a string', () => {
            const invalidData = {
                description: 123
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when location is not a string', () => {
            const invalidData = {
                location: 123
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when jobDescription is not a string', () => {
            const invalidData = {
                jobDescription: 123
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when status is not a string', () => {
            const invalidData = {
                status: 123
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when isVisible is not a boolean', () => {
            const invalidData = {
                isVisible: 'true'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when salaryMin is not a number', () => {
            const invalidData = {
                salaryMin: '50000'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when salaryMax is not a number', () => {
            const invalidData = {
                salaryMax: '80000'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when applicationDeadline is not a string', () => {
            const invalidData = {
                applicationDeadline: 1234567890
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });
    });

    describe('Field length constraints', () => {
        it('should throw error when title exceeds 100 characters', () => {
            const invalidData = {
                title: 'a'.repeat(101)
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should accept title with exactly 100 characters', () => {
            const validData = {
                title: 'a'.repeat(100)
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept title with less than 100 characters', () => {
            const validData = {
                title: 'Software Engineer'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });
    });

    describe('Enum validation', () => {
        it('should accept valid status value "Draft"', () => {
            const validData = {
                status: 'Draft'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept valid status value "Open"', () => {
            const validData = {
                status: 'Open'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept valid status value "Closed"', () => {
            const validData = {
                status: 'Closed'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept valid status value "Hired"', () => {
            const validData = {
                status: 'Hired'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should throw error when status is invalid enum value', () => {
            const invalidData = {
                status: 'InvalidStatus'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should reject legacy Spanish status "Contratado"', () => {
            const invalidData = {
                status: 'Contratado'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should reject legacy Spanish status "Cerrado"', () => {
            const invalidData = {
                status: 'Cerrado'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should reject legacy Spanish status "Borrador"', () => {
            const invalidData = {
                status: 'Borrador'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when status is empty string', () => {
            const invalidData = {
                status: ''
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });
    });

    describe('Numeric validation', () => {
        it('should throw error when salaryMin is negative', () => {
            const invalidData = {
                salaryMin: -1
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when salaryMax is negative', () => {
            const invalidData = {
                salaryMax: -1
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should accept salaryMin of 0', () => {
            const validData = {
                salaryMin: 0
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept salaryMax of 0', () => {
            const validData = {
                salaryMax: 0
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should throw error when salaryMax is less than salaryMin', () => {
            const invalidData = {
                salaryMin: 50000,
                salaryMax: 30000
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should accept when salaryMax equals salaryMin', () => {
            const validData = {
                salaryMin: 50000,
                salaryMax: 50000
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept when salaryMax is greater than salaryMin', () => {
            const validData = {
                salaryMin: 50000,
                salaryMax: 80000
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });
    });

    describe('Date validation', () => {
        it('should accept valid ISO 8601 date-time format with Z', () => {
            const validData = {
                applicationDeadline: '2026-12-31T23:59:59Z'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept valid ISO 8601 date-time format with timezone offset', () => {
            const validData = {
                applicationDeadline: '2026-12-31T23:59:59+02:00'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept valid ISO 8601 date-time format with milliseconds', () => {
            const validData = {
                applicationDeadline: '2026-12-31T23:59:59.123Z'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should throw error when applicationDeadline is not in ISO 8601 format', () => {
            const invalidData = {
                applicationDeadline: '2026-12-31'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when applicationDeadline is invalid date string', () => {
            const invalidData = {
                applicationDeadline: 'invalid-date'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when applicationDeadline is empty string', () => {
            const invalidData = {
                applicationDeadline: ''
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });
    });

    describe('Immutable field rejection', () => {
        it('should throw error when id is provided', () => {
            const invalidData = {
                id: 1,
                title: 'Software Engineer'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when companyId is provided', () => {
            const invalidData = {
                companyId: 1,
                title: 'Software Engineer'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when interviewFlowId is provided', () => {
            const invalidData = {
                interviewFlowId: 1,
                title: 'Software Engineer'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when multiple immutable fields are provided', () => {
            const invalidData = {
                id: 1,
                companyId: 1,
                interviewFlowId: 1,
                title: 'Software Engineer'
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });
    });

    describe('Empty string rejection for required fields', () => {
        it('should throw error when title is empty string', () => {
            const invalidData = {
                title: ''
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when description is empty string', () => {
            const invalidData = {
                description: ''
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when location is empty string', () => {
            const invalidData = {
                location: ''
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });

        it('should throw error when jobDescription is empty string', () => {
            const invalidData = {
                jobDescription: ''
            };

            expect(() => validatePositionUpdateData(invalidData)).toThrow();
        });
    });
});

describe('validateInterviewUpdateData', () => {
    describe('Valid update data scenarios', () => {
        it('should not throw error for valid update data with all fields', () => {
            const validData = {
                interviewDate: '2026-02-15T10:00:00Z',
                interviewStepId: 2,
                employeeId: 3,
                score: 4,
                notes: 'Candidate demonstrated strong technical skills.',
                result: 'Passed'
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for valid partial update with only some fields', () => {
            const validData = {
                score: 4,
                notes: 'Great candidate'
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for valid update with only interviewDate', () => {
            const validData = {
                interviewDate: '2026-03-01T14:00:00Z'
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for valid update with null score', () => {
            const validData = {
                score: null,
                notes: 'Some notes'
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for valid update with null notes', () => {
            const validData = {
                score: 4,
                notes: null
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for valid update with null result', () => {
            const validData = {
                result: null
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should not throw error for empty request body (all fields optional)', () => {
            const validData = {};

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });
    });

    describe('Invalid field types', () => {
        it('should throw error when interviewStepId is not an integer', () => {
            const invalidData = {
                interviewStepId: '2'
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });

        it('should throw error when employeeId is not an integer', () => {
            const invalidData = {
                employeeId: '3'
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });

        it('should throw error when interviewDate is not a string', () => {
            const invalidData = {
                interviewDate: 1234567890
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });
    });

    describe('Invalid interview date format', () => {
        it('should throw error when interviewDate is not in ISO 8601 format', () => {
            const invalidData = {
                interviewDate: '2026-02-15'
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });

        it('should throw error when interviewDate is invalid date string', () => {
            const invalidData = {
                interviewDate: 'invalid-date'
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });
    });

    describe('Score validation', () => {
        it('should throw error when score is less than 0', () => {
            const invalidData = {
                score: -1
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow('Score must be between 0 and 5');
        });

        it('should throw error when score is greater than 5', () => {
            const invalidData = {
                score: 6
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow('Score must be between 0 and 5');
        });

        it('should accept score of 0', () => {
            const validData = {
                score: 0
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should accept score of 5', () => {
            const validData = {
                score: 5
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should accept null score', () => {
            const validData = {
                score: null
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should throw error when score is not an integer', () => {
            const invalidData = {
                score: 3.5
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });
    });

    describe('Notes validation', () => {
        it('should throw error when notes exceeds 1000 characters', () => {
            const invalidData = {
                notes: 'a'.repeat(1001)
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow('Notes must not exceed 1000 characters');
        });

        it('should accept notes with exactly 1000 characters', () => {
            const validData = {
                notes: 'a'.repeat(1000)
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should accept null notes', () => {
            const validData = {
                notes: null
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should accept empty string notes', () => {
            const validData = {
                notes: ''
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should throw error when notes is not a string', () => {
            const invalidData = {
                notes: 123
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });
    });

    describe('Result validation', () => {
        it('should accept valid result value "Pending"', () => {
            const validData = {
                result: 'Pending'
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should accept valid result value "Passed"', () => {
            const validData = {
                result: 'Passed'
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should accept valid result value "Failed"', () => {
            const validData = {
                result: 'Failed'
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should throw error when result is invalid value', () => {
            const invalidData = {
                result: 'InvalidResult'
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });

        it('should throw error when result is empty string', () => {
            const invalidData = {
                result: ''
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });

        it('should accept null result', () => {
            const validData = {
                result: null
            };

            expect(() => validateInterviewUpdateData(validData)).not.toThrow();
        });

        it('should throw error when result is not a string', () => {
            const invalidData = {
                result: 123
            };

            expect(() => validateInterviewUpdateData(invalidData)).toThrow();
        });
    });
});

describe('validateInterviewDeletion', () => {
    describe('Valid deletion data scenarios', () => {
        it('should not throw error for valid deletion data with candidateId, interviewId, and reason', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: 'Interview cancelled by candidate'
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).not.toThrow();
        });

        it('should not throw error for valid deletion data with reason of 1 character', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: 'a'
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).not.toThrow();
        });

        it('should not throw error for valid deletion data with reason of exactly 500 characters', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: 'a'.repeat(500)
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).not.toThrow();
        });
    });

    describe('Missing reason field', () => {
        it('should throw error when reason is missing', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {};

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).toThrow();
        });

        it('should throw error when reason is undefined', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: undefined
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).toThrow();
        });
    });

    describe('Empty reason string', () => {
        it('should throw error when reason is empty string', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: ''
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).toThrow();
        });
    });

    describe('Reason exceeds length limit', () => {
        it('should throw error when reason exceeds 500 characters', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: 'a'.repeat(501)
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).toThrow();
        });
    });

    describe('Invalid candidateId format', () => {
        it('should throw error when candidateId is non-numeric string', () => {
            const candidateId = 'invalid';
            const interviewId = 2;
            const deletionData = {
                reason: 'Test reason'
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).toThrow();
        });

        it('should throw error when candidateId is not a number', () => {
            const candidateId = null;
            const interviewId = 2;
            const deletionData = {
                reason: 'Test reason'
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).toThrow();
        });
    });

    describe('Invalid interviewId format', () => {
        it('should throw error when interviewId is non-numeric string', () => {
            const candidateId = 1;
            const interviewId = 'invalid';
            const deletionData = {
                reason: 'Test reason'
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).toThrow();
        });

        it('should throw error when interviewId is not a number', () => {
            const candidateId = 1;
            const interviewId = null;
            const deletionData = {
                reason: 'Test reason'
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).toThrow();
        });
    });

    describe('Reason with valid length', () => {
        it('should accept reason with 1 character', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: 'a'
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).not.toThrow();
        });

        it('should accept reason with 500 characters', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: 'a'.repeat(500)
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).not.toThrow();
        });

        it('should accept reason with 250 characters', () => {
            const candidateId = 1;
            const interviewId = 2;
            const deletionData = {
                reason: 'a'.repeat(250)
            };

            expect(() => validateInterviewDeletion(candidateId, interviewId, deletionData)).not.toThrow();
        });
    });
});

describe('validateInterviewCreateData', () => {
    describe('Valid payload scenarios', () => {
        it('should not throw for a valid full payload with all fields', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                result: 'Pending',
                score: 4,
                notes: 'Strong technical candidate'
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should not throw for a valid minimal payload (result omitted)', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should not throw when score is null', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                score: null
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should not throw when notes is null', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                notes: null
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });
    });

    describe('Missing required fields', () => {
        it('should throw when applicationId is missing', () => {
            const invalidData = {
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('applicationId is required');
        });

        it('should throw when interviewStepId is missing', () => {
            const invalidData = {
                applicationId: 1,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('interviewStepId is required');
        });

        it('should throw when employeeId is missing', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('employeeId is required');
        });

        it('should throw when interviewDate is missing', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('interviewDate is required');
        });
    });

    describe('Non-integer FK fields', () => {
        it('should throw when applicationId is not an integer', () => {
            const invalidData = {
                applicationId: '1',
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('applicationId must be a positive integer');
        });

        it('should throw when applicationId is a float', () => {
            const invalidData = {
                applicationId: 1.5,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('applicationId must be a positive integer');
        });

        it('should throw when interviewStepId is not an integer', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: '2',
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('interviewStepId must be a positive integer');
        });

        it('should throw when employeeId is not an integer', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: '3',
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('employeeId must be a positive integer');
        });

        it('should throw when applicationId is zero or negative', () => {
            const invalidData = {
                applicationId: 0,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('applicationId must be a positive integer');
        });
    });

    describe('Invalid interviewDate format', () => {
        it('should throw when interviewDate is not ISO 8601 (date-only format)', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('interviewDate must be valid ISO 8601');
        });

        it('should throw when interviewDate is not a valid date string', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: 'not-a-date'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('interviewDate must be valid ISO 8601');
        });

        it('should throw when interviewDate is not a string', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: 1234567890
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow();
        });
    });

    describe('Score validation', () => {
        it('should throw when score is less than 0', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                score: -1
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('Score must be between 0 and 5');
        });

        it('should throw when score is greater than 5', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                score: 6
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('Score must be between 0 and 5');
        });

        it('should accept score of 0', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                score: 0
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should accept score of 5', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                score: 5
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should accept null score', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                score: null
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });
    });

    describe('Notes validation', () => {
        it('should throw when notes exceeds 1000 characters', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                notes: 'a'.repeat(1001)
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('Notes must not exceed 1000 characters');
        });

        it('should accept notes with exactly 1000 characters', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                notes: 'a'.repeat(1000)
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should accept null notes', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                notes: null
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });
    });

    describe('Result validation', () => {
        it('should accept result "Pending"', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                result: 'Pending'
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should accept result "Passed"', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                result: 'Passed'
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should accept result "Failed"', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                result: 'Failed'
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });

        it('should throw when result is an invalid value', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                result: 'InvalidResult'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('Invalid result value');
        });

        it('should accept null result (will default to Pending downstream)', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                result: null
            };
            expect(() => validateInterviewCreateData(validData)).not.toThrow();
        });
    });

    describe('Unexpected field rejection', () => {
        it('should throw when an unexpected field is provided', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                unknownField: 'value'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('Unexpected field: unknownField');
        });

        it('should throw when id field is provided', () => {
            const invalidData = {
                id: 99,
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z'
            };
            expect(() => validateInterviewCreateData(invalidData)).toThrow('Unexpected field: id');
        });
    });
});

describe('validateCandidatePositionDeletion', () => {
    it('should accept valid positive integer ids', () => {
        expect(() => validateCandidatePositionDeletion(1, 2)).not.toThrow();
    });

    it('should reject non-positive positionId', () => {
        expect(() => validateCandidatePositionDeletion(0, 2)).toThrow('positionId must be a positive integer');
    });

    it('should reject non-positive candidateId', () => {
        expect(() => validateCandidatePositionDeletion(1, -1)).toThrow('candidateId must be a positive integer');
    });
});
