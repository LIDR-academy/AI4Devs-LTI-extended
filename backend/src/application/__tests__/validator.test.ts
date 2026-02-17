import { validateInterviewData, validatePositionUpdateData, validateInterviewUpdateData, validateInterviewDeletion } from '../validator';

describe('validateInterviewData', () => {
    describe('Valid interview data scenarios', () => {
        it('should not throw error for valid interview data with all fields', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: 4,
                notes: 'Candidate demonstrated strong technical skills.'
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should not throw error for valid interview data with only required fields', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should not throw error for valid interview data with null score', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: null,
                notes: 'Some notes'
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should not throw error for valid interview data with null notes', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: 4,
                notes: null
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });
    });

    describe('Missing required fields', () => {
        it('should throw error when applicationId is missing', () => {
            const invalidData = {
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });

        it('should throw error when interviewStepId is missing', () => {
            const invalidData = {
                applicationId: 1,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });

        it('should throw error when employeeId is missing', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });

        it('should throw error when interviewDate is missing', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });
    });

    describe('Invalid field types', () => {
        it('should throw error when applicationId is not an integer', () => {
            const invalidData = {
                applicationId: '1',
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });

        it('should throw error when interviewStepId is not an integer', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: '2',
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });

        it('should throw error when employeeId is not an integer', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: '3',
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });

        it('should throw error when interviewDate is not a string', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: 1234567890
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });
    });

    describe('Invalid interview date format', () => {
        it('should throw error when interviewDate is not in ISO 8601 format', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15'
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });

        it('should throw error when interviewDate is invalid date string', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: 'invalid-date'
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });

        it('should throw error when interviewDate is empty string', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: ''
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });
    });

    describe('Score validation', () => {
        it('should throw error when score is less than 0', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: -1
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow('Score must be between 0 and 5');
        });

        it('should throw error when score is greater than 5', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: 6
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow('Score must be between 0 and 5');
        });

        it('should accept score of 0', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: 0
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should accept score of 5', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: 5
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should accept null score', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: null
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should accept undefined score', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should throw error when score is not an integer', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                score: 3.5
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });
    });

    describe('Notes validation', () => {
        it('should throw error when notes exceeds 1000 characters', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                notes: 'a'.repeat(1001)
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow('Notes must not exceed 1000 characters');
        });

        it('should accept notes with exactly 1000 characters', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                notes: 'a'.repeat(1000)
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should accept null notes', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                notes: null
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should accept empty string notes', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                notes: ''
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should accept undefined notes', () => {
            const validData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z'
            };

            expect(() => validateInterviewData(1, validData)).not.toThrow();
        });

        it('should throw error when notes is not a string', () => {
            const invalidData = {
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-02-15T10:00:00Z',
                notes: 123
            };

            expect(() => validateInterviewData(1, invalidData)).toThrow();
        });
    });
});

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

        it('should accept valid status value "Contratado"', () => {
            const validData = {
                status: 'Contratado'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept valid status value "Cerrado"', () => {
            const validData = {
                status: 'Cerrado'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should accept valid status value "Borrador"', () => {
            const validData = {
                status: 'Borrador'
            };

            expect(() => validatePositionUpdateData(validData)).not.toThrow();
        });

        it('should throw error when status is invalid enum value', () => {
            const invalidData = {
                status: 'InvalidStatus'
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
