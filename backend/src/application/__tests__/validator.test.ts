import { validatePositionUpdate } from '../validator';

describe('Validator - validatePositionUpdate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('should_validate_successfully_when_valid_data_provided', () => {
        it('should validate successfully with all valid fields', () => {
            // Arrange
            const validData = {
                title: 'Senior Software Engineer',
                description: 'Great opportunity',
                location: 'Madrid, Spain',
                jobDescription: 'Detailed job description',
                status: 'Open',
                isVisible: true,
                requirements: 'Bachelor degree',
                responsibilities: 'Lead team',
                salaryMin: 50000,
                salaryMax: 70000,
                employmentType: 'Full-time',
                benefits: 'Health insurance',
                companyDescription: 'Tech company',
                applicationDeadline: new Date('2025-12-31'),
                contactInfo: 'hr@company.com',
                companyId: 1,
                interviewFlowId: 1
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });

        it('should validate successfully with partial update (only title)', () => {
            // Arrange
            const partialData = {
                title: 'Updated Title'
            };

            // Act & Assert
            expect(() => validatePositionUpdate(partialData)).not.toThrow();
        });

        it('should validate successfully with optional fields as null', () => {
            // Arrange
            const dataWithNulls = {
                title: 'Valid Title',
                requirements: null,
                responsibilities: null,
                benefits: null
            };

            // Act & Assert
            expect(() => validatePositionUpdate(dataWithNulls)).not.toThrow();
        });

        it('should validate successfully with minimum salary zero', () => {
            // Arrange
            const data = {
                salaryMin: 0,
                salaryMax: 50000
            };

            // Act & Assert
            expect(() => validatePositionUpdate(data)).not.toThrow();
        });

        it('should validate successfully with equal salary min and max', () => {
            // Arrange
            const data = {
                salaryMin: 50000,
                salaryMax: 50000
            };

            // Act & Assert
            expect(() => validatePositionUpdate(data)).not.toThrow();
        });
    });

    describe('should_throw_error_when_required_fields_invalid', () => {
        it('should throw error when title is empty string', () => {
            // Arrange
            const invalidData = {
                title: ''
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El título es obligatorio y debe ser una cadena válida');
        });

        it('should throw error when title is only whitespace', () => {
            // Arrange
            const invalidData = {
                title: '   '
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El título es obligatorio y debe ser una cadena válida');
        });

        it('should throw error when title is not a string', () => {
            // Arrange
            const invalidData = {
                title: 123
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El título es obligatorio y debe ser una cadena válida');
        });

        it('should throw error when title exceeds 100 characters', () => {
            // Arrange
            const invalidData = {
                title: 'a'.repeat(101)
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El título no puede exceder 100 caracteres');
        });

        it('should throw error when description is empty string', () => {
            // Arrange
            const invalidData = {
                description: ''
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('La descripción es obligatoria y debe ser una cadena válida');
        });

        it('should throw error when description is only whitespace', () => {
            // Arrange
            const invalidData = {
                description: '   '
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('La descripción es obligatoria y debe ser una cadena válida');
        });

        it('should throw error when location is empty string', () => {
            // Arrange
            const invalidData = {
                location: ''
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('La ubicación es obligatoria y debe ser una cadena válida');
        });

        it('should throw error when jobDescription is empty string', () => {
            // Arrange
            const invalidData = {
                jobDescription: ''
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('La descripción del trabajo es obligatoria y debe ser una cadena válida');
        });
    });

    describe('should_throw_error_when_status_invalid', () => {
        it('should throw error for invalid status value', () => {
            // Arrange
            const invalidData = {
                status: 'InvalidStatus'
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador');
        });

        it('should throw error for lowercase valid status', () => {
            // Arrange
            const invalidData = {
                status: 'open'
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador');
        });

        it('should validate successfully for each valid status', () => {
            // Arrange & Act & Assert
            expect(() => validatePositionUpdate({ status: 'Open' })).not.toThrow();
            expect(() => validatePositionUpdate({ status: 'Contratado' })).not.toThrow();
            expect(() => validatePositionUpdate({ status: 'Cerrado' })).not.toThrow();
            expect(() => validatePositionUpdate({ status: 'Borrador' })).not.toThrow();
        });
    });

    describe('should_throw_error_when_isVisible_not_boolean', () => {
        it('should throw error when isVisible is string', () => {
            // Arrange
            const invalidData = {
                isVisible: 'true'
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('isVisible debe ser un valor booleano');
        });

        it('should throw error when isVisible is number', () => {
            // Arrange
            const invalidData = {
                isVisible: 1
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('isVisible debe ser un valor booleano');
        });

        it('should validate successfully when isVisible is true', () => {
            // Arrange
            const validData = {
                isVisible: true
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });

        it('should validate successfully when isVisible is false', () => {
            // Arrange
            const validData = {
                isVisible: false
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });
    });

    describe('should_throw_error_when_ids_invalid', () => {
        it('should throw error when companyId is negative', () => {
            // Arrange
            const invalidData = {
                companyId: -1
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('companyId debe ser un número entero positivo');
        });

        it('should throw error when companyId is zero', () => {
            // Arrange
            const invalidData = {
                companyId: 0
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('companyId debe ser un número entero positivo');
        });

        it('should throw error when companyId is not integer', () => {
            // Arrange
            const invalidData = {
                companyId: 1.5
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('companyId debe ser un número entero positivo');
        });

        it('should throw error when interviewFlowId is negative', () => {
            // Arrange
            const invalidData = {
                interviewFlowId: -1
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('interviewFlowId debe ser un número entero positivo');
        });

        it('should throw error when interviewFlowId is zero', () => {
            // Arrange
            const invalidData = {
                interviewFlowId: 0
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('interviewFlowId debe ser un número entero positivo');
        });

        it('should validate successfully with valid companyId', () => {
            // Arrange
            const validData = {
                companyId: 1
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });

        it('should validate successfully with valid interviewFlowId', () => {
            // Arrange
            const validData = {
                interviewFlowId: 5
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });
    });

    describe('should_throw_error_when_salary_invalid', () => {
        it('should throw error when salaryMin is negative', () => {
            // Arrange
            const invalidData = {
                salaryMin: -1000
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El salario mínimo debe ser un número válido mayor o igual a 0');
        });

        it('should throw error when salaryMin is not a number', () => {
            // Arrange
            const invalidData = {
                salaryMin: '50000'
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El salario mínimo debe ser un número válido mayor o igual a 0');
        });

        it('should throw error when salaryMax is negative', () => {
            // Arrange
            const invalidData = {
                salaryMax: -1000
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El salario máximo debe ser un número válido mayor o igual a 0');
        });

        it('should throw error when salaryMax is not a number', () => {
            // Arrange
            const invalidData = {
                salaryMax: '70000'
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El salario máximo debe ser un número válido mayor o igual a 0');
        });

        it('should throw error when salaryMin is greater than salaryMax', () => {
            // Arrange
            const invalidData = {
                salaryMin: 70000,
                salaryMax: 50000
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El salario mínimo no puede ser mayor que el máximo');
        });

        it('should validate when only salaryMin provided', () => {
            // Arrange
            const validData = {
                salaryMin: 50000
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });

        it('should validate when only salaryMax provided', () => {
            // Arrange
            const validData = {
                salaryMax: 70000
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });
    });

    describe('should_throw_error_when_applicationDeadline_invalid', () => {
        it('should throw error for invalid date format', () => {
            // Arrange
            const invalidData = {
                applicationDeadline: 'invalid-date'
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('Fecha límite inválida');
        });

        it('should throw error for past date', () => {
            // Arrange
            const pastDate = new Date('2020-01-01');
            const invalidData = {
                applicationDeadline: pastDate
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('La fecha límite no puede ser anterior a hoy');
        });

        it('should validate successfully for future date', () => {
            // Arrange
            const futureDate = new Date('2030-12-31');
            const validData = {
                applicationDeadline: futureDate
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });

        it('should validate successfully for today', () => {
            // Arrange
            const today = new Date();
            const validData = {
                applicationDeadline: today
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });
    });

    describe('should_throw_error_when_text_fields_invalid', () => {
        it('should throw error when employmentType is empty string', () => {
            // Arrange
            const invalidData = {
                employmentType: ''
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El tipo de empleo debe ser una cadena válida');
        });

        it('should throw error when employmentType is only whitespace', () => {
            // Arrange
            const invalidData = {
                employmentType: '   '
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El tipo de empleo debe ser una cadena válida');
        });

        it('should throw error when requirements is not a string', () => {
            // Arrange
            const invalidData = {
                requirements: 123
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('requirements debe ser una cadena de texto');
        });

        it('should throw error when responsibilities is not a string', () => {
            // Arrange
            const invalidData = {
                responsibilities: true
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('responsibilities debe ser una cadena de texto');
        });

        it('should throw error when benefits is not a string', () => {
            // Arrange
            const invalidData = {
                benefits: ['health', 'dental']
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('benefits debe ser una cadena de texto');
        });

        it('should throw error when companyDescription is not a string', () => {
            // Arrange
            const invalidData = {
                companyDescription: { name: 'Company' }
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('companyDescription debe ser una cadena de texto');
        });

        it('should throw error when contactInfo is not a string', () => {
            // Arrange
            const invalidData = {
                contactInfo: 12345
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('contactInfo debe ser una cadena de texto');
        });

        it('should validate successfully with valid text fields', () => {
            // Arrange
            const validData = {
                requirements: 'Bachelor degree',
                responsibilities: 'Lead development',
                benefits: 'Health insurance',
                companyDescription: 'Great company',
                contactInfo: 'hr@company.com',
                employmentType: 'Full-time'
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });
    });

    describe('should_handle_edge_cases', () => {
        it('should validate successfully with empty object', () => {
            // Arrange
            const emptyData = {};

            // Act & Assert
            expect(() => validatePositionUpdate(emptyData)).not.toThrow();
        });

        it('should validate title with exactly 100 characters', () => {
            // Arrange
            const validData = {
                title: 'a'.repeat(100)
            };

            // Act & Assert
            expect(() => validatePositionUpdate(validData)).not.toThrow();
        });

        it('should throw error for title with 101 characters', () => {
            // Arrange
            const invalidData = {
                title: 'a'.repeat(101)
            };

            // Act & Assert
            expect(() => validatePositionUpdate(invalidData))
                .toThrow('El título no puede exceder 100 caracteres');
        });
    });
});

