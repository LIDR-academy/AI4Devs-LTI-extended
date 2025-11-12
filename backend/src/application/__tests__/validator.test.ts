import { validatePositionUpdate } from '../validator';

describe('validatePositionUpdate', () => {
    describe('should_pass_validation_with_valid_data', () => {
        it('should not throw error with all valid fields', () => {
            const validData = {
                title: 'Senior Software Engineer',
                description: 'A great position',
                location: 'Madrid',
                jobDescription: 'Detailed description',
                status: 'Open',
                isVisible: true,
                salaryMin: 50000,
                salaryMax: 70000,
                employmentType: 'Full-time',
                applicationDeadline: new Date(Date.now() + 86400000).toISOString() // Tomorrow
            };
            
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });

        it('should not throw error with partial update (only status)', () => {
            const partialData = { status: 'Open' };
            expect(() => validatePositionUpdate(partialData)).not.toThrow();
        });

        it('should not throw error when optional fields are omitted', () => {
            const dataWithoutOptionals = {
                title: 'Developer',
                description: 'Job desc',
                location: 'Barcelona',
                jobDescription: 'Detailed job description'
            };
            expect(() => validatePositionUpdate(dataWithoutOptionals)).not.toThrow();
        });
    });

    describe('should_reject_invalid_title', () => {
        it('should throw error when title is empty string', () => {
            expect(() => validatePositionUpdate({ title: '' }))
                .toThrow('Title is required and must be a valid string');
        });

        it('should throw error when title exceeds 100 characters', () => {
            const longTitle = 'x'.repeat(101);
            expect(() => validatePositionUpdate({ title: longTitle }))
                .toThrow('Title cannot exceed 100 characters');
        });

        it('should throw error when title is not a string', () => {
            expect(() => validatePositionUpdate({ title: 123 }))
                .toThrow('Title is required and must be a valid string');
        });

        it('should throw error when title is whitespace only', () => {
            expect(() => validatePositionUpdate({ title: '   ' }))
                .toThrow('Title is required and must be a valid string');
        });

        it('should throw error when title is null', () => {
            expect(() => validatePositionUpdate({ title: null }))
                .toThrow('Title is required and must be a valid string');
        });
    });

    describe('should_reject_invalid_status', () => {
        it('should throw error for invalid status value', () => {
            expect(() => validatePositionUpdate({ status: 'InvalidStatus' }))
                .toThrow('Invalid status. Must be one of: Open, Contratado, Cerrado, Borrador');
        });

        it('should accept valid status: Open', () => {
            expect(() => validatePositionUpdate({ status: 'Open' })).not.toThrow();
        });

        it('should accept valid status: Contratado', () => {
            expect(() => validatePositionUpdate({ status: 'Contratado' })).not.toThrow();
        });

        it('should accept valid status: Cerrado', () => {
            expect(() => validatePositionUpdate({ status: 'Cerrado' })).not.toThrow();
        });

        it('should accept valid status: Borrador', () => {
            expect(() => validatePositionUpdate({ status: 'Borrador' })).not.toThrow();
        });
    });

    describe('should_reject_invalid_salary_values', () => {
        it('should throw error when salaryMin is negative', () => {
            expect(() => validatePositionUpdate({ salaryMin: -1000 }))
                .toThrow('Minimum salary must be a valid number greater than or equal to 0');
        });

        it('should throw error when salaryMax is negative', () => {
            expect(() => validatePositionUpdate({ salaryMax: -1000 }))
                .toThrow('Maximum salary must be a valid number greater than or equal to 0');
        });

        it('should throw error when salaryMin > salaryMax', () => {
            expect(() => validatePositionUpdate({ salaryMin: 80000, salaryMax: 60000 }))
                .toThrow('Minimum salary cannot be greater than maximum salary');
        });

        it('should throw error when salaryMin is not a number', () => {
            expect(() => validatePositionUpdate({ salaryMin: 'not-a-number' }))
                .toThrow('Minimum salary must be a valid number greater than or equal to 0');
        });

        it('should accept valid salary range', () => {
            expect(() => validatePositionUpdate({ salaryMin: 50000, salaryMax: 70000 }))
                .not.toThrow();
        });

        it('should accept salaryMin = 0', () => {
            expect(() => validatePositionUpdate({ salaryMin: 0 })).not.toThrow();
        });
    });

    describe('should_reject_invalid_application_deadline', () => {
        it('should throw error for invalid date format', () => {
            expect(() => validatePositionUpdate({ applicationDeadline: 'not-a-date' }))
                .toThrow('Invalid application deadline');
        });

        it('should throw error for past date', () => {
            const yesterday = new Date(Date.now() - 86400000);
            expect(() => validatePositionUpdate({ applicationDeadline: yesterday.toISOString() }))
                .toThrow('Application deadline cannot be in the past');
        });

        it('should accept future date', () => {
            const tomorrow = new Date(Date.now() + 86400000);
            expect(() => validatePositionUpdate({ applicationDeadline: tomorrow.toISOString() }))
                .not.toThrow();
        });
    });

    describe('should_reject_invalid_boolean_values', () => {
        it('should throw error when isVisible is not boolean', () => {
            expect(() => validatePositionUpdate({ isVisible: 'true' }))
                .toThrow('isVisible must be a boolean value');
        });

        it('should accept true for isVisible', () => {
            expect(() => validatePositionUpdate({ isVisible: true })).not.toThrow();
        });

        it('should accept false for isVisible', () => {
            expect(() => validatePositionUpdate({ isVisible: false })).not.toThrow();
        });
    });

    describe('should_reject_invalid_id_values', () => {
        it('should throw error when companyId is negative', () => {
            expect(() => validatePositionUpdate({ companyId: -1 }))
                .toThrow('companyId must be a positive integer');
        });

        it('should throw error when companyId is zero', () => {
            expect(() => validatePositionUpdate({ companyId: 0 }))
                .toThrow('companyId must be a positive integer');
        });

        it('should throw error when companyId is not an integer', () => {
            expect(() => validatePositionUpdate({ companyId: 1.5 }))
                .toThrow('companyId must be a positive integer');
        });

        it('should throw error when interviewFlowId is negative', () => {
            expect(() => validatePositionUpdate({ interviewFlowId: -1 }))
                .toThrow('interviewFlowId must be a positive integer');
        });

        it('should accept valid positive integer IDs', () => {
            expect(() => validatePositionUpdate({ companyId: 1, interviewFlowId: 2 }))
                .not.toThrow();
        });
    });

    describe('should_reject_invalid_string_fields', () => {
        it('should throw error when description is empty', () => {
            expect(() => validatePositionUpdate({ description: '' }))
                .toThrow('description is required and must be a valid string');
        });

        it('should throw error when location is not a string', () => {
            expect(() => validatePositionUpdate({ location: 123 }))
                .toThrow('location is required and must be a valid string');
        });

        it('should throw error when jobDescription is whitespace only', () => {
            expect(() => validatePositionUpdate({ jobDescription: '   ' }))
                .toThrow('jobDescription is required and must be a valid string');
        });

        it('should throw error when employmentType is empty', () => {
            expect(() => validatePositionUpdate({ employmentType: '' }))
                .toThrow('employmentType is required and must be a valid string');
        });
    });

    describe('should_validate_optional_string_fields', () => {
        it('should throw error when requirements is not a string', () => {
            expect(() => validatePositionUpdate({ requirements: 123 }))
                .toThrow('requirements must be a string');
        });

        it('should accept empty string for optional fields', () => {
            expect(() => validatePositionUpdate({ requirements: '', benefits: '' }))
                .not.toThrow();
        });

        it('should accept valid strings for optional fields', () => {
            expect(() => validatePositionUpdate({
                requirements: 'Some requirements',
                responsibilities: 'Some responsibilities',
                benefits: 'Some benefits',
                companyDescription: 'Company info',
                contactInfo: 'contact@example.com'
            })).not.toThrow();
        });
    });
});

