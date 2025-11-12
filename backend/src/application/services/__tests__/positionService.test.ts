import { Position } from '../../../domain/models/Position';
import { validatePositionUpdate } from '../../validator';

// Mock all dependencies
jest.mock('../../../domain/models/Position');
jest.mock('../../validator');

// Mock PrismaClient
const mockCompanyFindUnique = jest.fn();
const mockInterviewFlowFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn().mockImplementation(() => {
            return {
                company: {
                    findUnique: (...args: any[]) => mockCompanyFindUnique(...args)
                },
                interviewFlow: {
                    findUnique: (...args: any[]) => mockInterviewFlowFindUnique(...args)
                }
            };
        })
    };
});

// Import after mocking
import { updatePositionService } from '../positionService';

describe('PositionService - updatePositionService', () => {
    let mockPosition: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Position model
        mockPosition = {
            id: 1,
            title: 'Old Title',
            description: 'Old Description',
            location: 'Old Location',
            jobDescription: 'Old Job Description',
            status: 'Borrador',
            isVisible: false,
            companyId: 1,
            interviewFlowId: 1,
            save: jest.fn()
        };
    });

    describe('should_update_position_successfully', () => {
        it('should update position with all valid fields', async () => {
            // Arrange
            const positionId = 1;
            const updateData = {
                title: 'New Title',
                description: 'New Description',
                status: 'Open',
                isVisible: true,
                salaryMin: 50000,
                salaryMax: 70000
            };
            const expectedUpdatedPosition = { ...mockPosition, ...updateData };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPosition.save.mockResolvedValue(expectedUpdatedPosition);

            // Mock Position constructor
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                return { ...data, save: mockPosition.save } as any;
            });

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).toHaveBeenCalledWith(updateData);
            expect(mockPosition.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedUpdatedPosition);
        });

        it('should update position with partial data (only status)', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { status: 'Open' };
            const expectedUpdatedPosition = { ...mockPosition, status: 'Open' };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockPosition.save.mockResolvedValue(expectedUpdatedPosition);
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                return { ...data, save: mockPosition.save } as any;
            });

            // Act
            const result = await updatePositionService(positionId, updateData);

            // Assert
            expect(result.title).toBe('Old Title'); // Unchanged
            expect(result.status).toBe('Open'); // Updated
        });

        it('should validate companyId exists when provided', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { companyId: 2 };
            const mockCompany = { id: 2, name: 'New Company' };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockCompanyFindUnique.mockResolvedValue(mockCompany);
            mockPosition.save.mockResolvedValue({ ...mockPosition, companyId: 2 });
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                return { ...data, save: mockPosition.save } as any;
            });

            // Act
            await updatePositionService(positionId, updateData);

            // Assert
            expect(mockCompanyFindUnique).toHaveBeenCalledWith({
                where: { id: 2 }
            });
        });

        it('should validate interviewFlowId exists when provided', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { interviewFlowId: 3 };
            const mockInterviewFlow = { id: 3, description: 'New Flow' };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockInterviewFlowFindUnique.mockResolvedValue(mockInterviewFlow);
            mockPosition.save.mockResolvedValue({ ...mockPosition, interviewFlowId: 3 });
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                return { ...data, save: mockPosition.save } as any;
            });

            // Act
            await updatePositionService(positionId, updateData);

            // Assert
            expect(mockInterviewFlowFindUnique).toHaveBeenCalledWith({
                where: { id: 3 }
            });
        });
    });

    describe('should_throw_error_when_position_not_found', () => {
        it('should throw "Position not found" error when position does not exist', async () => {
            // Arrange
            const positionId = 999;
            const updateData = { title: 'New Title' };

            (Position.findOne as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Position not found');

            expect(Position.findOne).toHaveBeenCalledWith(positionId);
            expect(validatePositionUpdate).not.toHaveBeenCalled();
        });
    });

    describe('should_throw_error_for_validation_failures', () => {
        it('should propagate validation error from validator', async () => {
            // Arrange
            const positionId = 1;
            const invalidData = { salaryMin: -1000 };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {
                throw new Error('Minimum salary must be a valid number greater than or equal to 0');
            });

            // Act & Assert
            await expect(updatePositionService(positionId, invalidData))
                .rejects
                .toThrow('Minimum salary must be a valid number greater than or equal to 0');

            expect(validatePositionUpdate).toHaveBeenCalledWith(invalidData);
        });
    });

    describe('should_throw_error_for_invalid_references', () => {
        it('should throw "Company not found" when companyId does not exist', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { companyId: 999 };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockCompanyFindUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Company not found');

            expect(mockCompanyFindUnique).toHaveBeenCalledWith({
                where: { id: 999 }
            });
        });

        it('should throw "Interview flow not found" when interviewFlowId does not exist', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { interviewFlowId: 999 };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            mockInterviewFlowFindUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Interview flow not found');

            expect(mockInterviewFlowFindUnique).toHaveBeenCalledWith({
                where: { id: 999 }
            });
        });
    });

    describe('should_merge_data_correctly', () => {
        it('should preserve unchanged fields when doing partial update', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { status: 'Open' };

            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
            (validatePositionUpdate as jest.Mock).mockImplementation(() => {});
            
            let mergedData: any;
            (Position as jest.MockedClass<typeof Position>).mockImplementation((data) => {
                mergedData = data;
                return { ...data, save: jest.fn().mockResolvedValue(data) } as any;
            });

            // Act
            await updatePositionService(positionId, updateData);

            // Assert
            expect(mergedData.title).toBe('Old Title'); // Preserved
            expect(mergedData.description).toBe('Old Description'); // Preserved
            expect(mergedData.status).toBe('Open'); // Updated
            expect(mergedData.id).toBe(positionId); // ID preserved
        });
    });

    describe('should_handle_errors_gracefully', () => {
        it('should propagate database errors', async () => {
            // Arrange
            const positionId = 1;
            const updateData = { title: 'New Title' };

            (Position.findOne as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

            // Act & Assert
            await expect(updatePositionService(positionId, updateData))
                .rejects
                .toThrow('Database connection failed');
        });
    });
});

