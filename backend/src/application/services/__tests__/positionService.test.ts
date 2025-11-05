// Mock Prisma Client first - create mock functions inside the factory
const mockCompanyFindUnique = jest.fn();
const mockInterviewFlowFindUnique = jest.fn();

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        company: {
            get findUnique() {
                return mockCompanyFindUnique;
            }
        },
        interviewFlow: {
            get findUnique() {
                return mockInterviewFlowFindUnique;
            }
        },
    })),
}));

// Mock the Position model
jest.mock('../../../domain/models/Position', () => ({
    Position: {
        findOne: jest.fn(),
    },
}));

// Mock the validator
jest.mock('../../validator', () => ({
    validatePositionUpdate: jest.fn(),
}));

import { updatePositionService } from '../positionService';
import { Position } from '../../../domain/models/Position';
import { validatePositionUpdate } from '../../validator';
import { PrismaClient } from '@prisma/client';

describe('PositionService - updatePositionService', () => {
    let mockPositionInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mock position instance
        mockPositionInstance = {
            id: 1,
            companyId: 1,
            interviewFlowId: 1,
            title: 'Software Engineer',
            description: 'Great position',
            status: 'Open',
            isVisible: true,
            location: 'Madrid',
            jobDescription: 'Detailed description',
            requirements: null,
            responsibilities: null,
            salaryMin: null,
            salaryMax: null,
            employmentType: null,
            benefits: null,
            companyDescription: null,
            applicationDeadline: null,
            contactInfo: null,
            save: jest.fn(),
        };
    });

    describe('should_update_position_successfully_when_valid_data', () => {
        it('should update position with full data successfully', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                title: 'Senior Software Engineer',
                description: 'Updated description',
                location: 'Barcelona',
                jobDescription: 'Updated job description',
                status: 'Open',
                isVisible: true,
                requirements: '5+ years experience',
                responsibilities: 'Lead team',
                salaryMin: 50000,
                salaryMax: 70000,
                employmentType: 'Full-time',
                benefits: 'Health insurance',
                companyDescription: 'Tech company',
                applicationDeadline: new Date('2025-12-31'),
                contactInfo: 'hr@company.com',
                companyId: 2,
                interviewFlowId: 3,
            };

            const expectedPosition = {
                ...mockPositionInstance,
                ...updateData,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockCompanyFindUnique.mockResolvedValue({ id: 2, name: 'New Company' });
            mockInterviewFlowFindUnique.mockResolvedValue({ id: 3, description: 'Flow' });
            mockPositionInstance.save.mockResolvedValue(expectedPosition);

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockCompanyFindUnique).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(mockInterviewFlowFindUnique).toHaveBeenCalledWith({ where: { id: 3 } });
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedPosition);
        });

        it('should update position with partial data (title only)', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                title: 'Updated Title',
            };

            const expectedPosition = {
                ...mockPositionInstance,
                title: 'Updated Title',
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPositionInstance.save.mockResolvedValue(expectedPosition);

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockCompanyFindUnique).not.toHaveBeenCalled();
            expect(mockInterviewFlowFindUnique).not.toHaveBeenCalled();
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedPosition);
        });

        it('should update position with companyId validation', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                companyId: 5,
            };

            const expectedPosition = {
                ...mockPositionInstance,
                companyId: 5,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockCompanyFindUnique.mockResolvedValue({ id: 5, name: 'Company' });
            mockPositionInstance.save.mockResolvedValue(expectedPosition);

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockCompanyFindUnique).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(mockInterviewFlowFindUnique).not.toHaveBeenCalled();
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedPosition);
        });

        it('should update position with interviewFlowId validation', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                interviewFlowId: 3,
            };

            const expectedPosition = {
                ...mockPositionInstance,
                interviewFlowId: 3,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockInterviewFlowFindUnique.mockResolvedValue({ id: 3, description: 'Flow' });
            mockPositionInstance.save.mockResolvedValue(expectedPosition);

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockCompanyFindUnique).not.toHaveBeenCalled();
            expect(mockInterviewFlowFindUnique).toHaveBeenCalledWith({ where: { id: 3 } });
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedPosition);
        });

        it('should update position with both companyId and interviewFlowId', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                companyId: 2,
                interviewFlowId: 3,
            };

            const expectedPosition = {
                ...mockPositionInstance,
                companyId: 2,
                interviewFlowId: 3,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockCompanyFindUnique.mockResolvedValue({ id: 2, name: 'Company' });
            mockInterviewFlowFindUnique.mockResolvedValue({ id: 3, description: 'Flow' });
            mockPositionInstance.save.mockResolvedValue(expectedPosition);

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockCompanyFindUnique).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(mockInterviewFlowFindUnique).toHaveBeenCalledWith({ where: { id: 3 } });
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedPosition);
        });

        it('should update position with salary range', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                salaryMin: 40000,
                salaryMax: 60000,
            };

            const expectedPosition = {
                ...mockPositionInstance,
                salaryMin: 40000,
                salaryMax: 60000,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPositionInstance.save.mockResolvedValue(expectedPosition);

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedPosition);
        });

        it('should update position status', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                status: 'Cerrado',
            };

            const expectedPosition = {
                ...mockPositionInstance,
                status: 'Cerrado',
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPositionInstance.save.mockResolvedValue(expectedPosition);

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedPosition);
        });

        it('should update position with applicationDeadline', async () => {
            // Arrange
            const positionId = 1;
            const deadline = new Date('2025-12-31');
            const updateData = {
                applicationDeadline: deadline,
            };

            const expectedPosition = {
                ...mockPositionInstance,
                applicationDeadline: deadline,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPositionInstance.save.mockResolvedValue(expectedPosition);

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedPosition);
        });
    });

    describe('should_throw_NotFoundError_when_position_not_exists', () => {
        it('should throw error when position not found', async () => {
            // Arrange
            const positionId = 999;
            const updateData = {
                title: 'Updated Title',
            };

            (Position.findOne as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Position not found');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).not.toHaveBeenCalled();
            expect(mockPositionInstance.save).not.toHaveBeenCalled();
        });
    });

    describe('should_throw_ValidationError_when_data_invalid', () => {
        it('should throw validation error from validator', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                title: '',
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {
                throw new Error('El título es obligatorio y debe ser una cadena válida');
            });

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('El título es obligatorio y debe ser una cadena válida');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockPositionInstance.save).not.toHaveBeenCalled();
        });

        it('should throw error for invalid status', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                status: 'InvalidStatus',
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {
                throw new Error('Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador');
            });

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
        });

        it('should throw error for invalid salary range', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                salaryMin: 70000,
                salaryMax: 50000,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {
                throw new Error('El salario mínimo no puede ser mayor que el máximo');
            });

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('El salario mínimo no puede ser mayor que el máximo');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
        });
    });

    describe('should_throw_error_when_references_invalid', () => {
        it('should throw error when company not found', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                companyId: 999,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockCompanyFindUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Company not found');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockCompanyFindUnique).toHaveBeenCalledWith({ where: { id: 999 } });
            expect(mockPositionInstance.save).not.toHaveBeenCalled();
        });

        it('should throw error when interview flow not found', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                interviewFlowId: 999,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockInterviewFlowFindUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Interview flow not found');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockInterviewFlowFindUnique).toHaveBeenCalledWith({ where: { id: 999 } });
            expect(mockPositionInstance.save).not.toHaveBeenCalled();
        });
    });

    describe('should_throw_error_when_database_fails', () => {
        it('should throw error when save fails', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                title: 'Updated Title',
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPositionInstance.save.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Database error');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockPositionInstance.save).toHaveBeenCalledTimes(1);
        });

        it('should throw error when company lookup fails', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                companyId: 2,
            };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPositionInstance);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockCompanyFindUnique.mockRejectedValue(new Error('Database connection error'));

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Database connection error');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockCompanyFindUnique).toHaveBeenCalledWith({ where: { id: 2 } });
        });

        it('should throw error when Position.findOne fails', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                title: 'Updated Title',
            };

            (Position.findOne as jest.Mock).mockRejectedValue(new Error('Database query error'));

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Database query error');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
        });
    });

    describe('should_handle_invalid_position_id', () => {
        it('should throw error for negative position ID', async () => {
            // Arrange
            const positionId = -1;
            const updateData = {
                title: 'Updated Title',
            };

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Invalid position ID');

            expect(Position.findOne).not.toHaveBeenCalled();
        });

        it('should throw error for zero position ID', async () => {
            // Arrange
            const positionId = 0;
            const updateData = {
                title: 'Updated Title',
            };

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Invalid position ID');

            expect(Position.findOne).not.toHaveBeenCalled();
        });

        it('should throw error for non-integer position ID', async () => {
            // Arrange
            const positionId = 1.5;
            const updateData = {
                title: 'Updated Title',
            };

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Invalid position ID');

            expect(Position.findOne).not.toHaveBeenCalled();
        });
    });
});

