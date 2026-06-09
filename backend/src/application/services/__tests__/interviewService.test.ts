import { updateInterview, deleteInterview, createInterview } from '../interviewService';
import { Candidate } from '../../../domain/models/Candidate';
import { Application } from '../../../domain/models/Application';
import { Position } from '../../../domain/models/Position';
import { InterviewStep } from '../../../domain/models/InterviewStep';
import { Employee } from '../../../domain/models/Employee';
import { Interview } from '../../../domain/models/Interview';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        interview: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock domain models
jest.mock('../../../domain/models/Candidate');
jest.mock('../../../domain/models/Application');
jest.mock('../../../domain/models/Position');
jest.mock('../../../domain/models/InterviewStep');
jest.mock('../../../domain/models/Employee');
jest.mock('../../../domain/models/Interview');

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Interview Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('updateInterview', () => {
        describe('Successful interview update', () => {
            it('should update interview successfully with all fields', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = {
                    interviewDate: '2026-03-01T14:00:00Z',
                    interviewStepId: 3,
                    employeeId: 4,
                    score: 5,
                    notes: 'Updated notes',
                    result: 'Passed'
                };

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    score: 4,
                    notes: 'Original notes',
                    result: 'Pending'
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };
                const mockPosition = { id: 10, interviewFlowId: 5 };
                const mockInterviewStep = { id: 3, interviewFlowId: 5 };
                const mockEmployee = { id: 4, isActive: true };
                const mockUpdatedInterview = { ...mockInterview, ...updateData, interviewDate: new Date(updateData.interviewDate) };

                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(mockInterviewStep);
                (Employee.findOne as jest.Mock).mockResolvedValue(mockEmployee);

                const mockExistingInterview = {
                    id: interviewId,
                    applicationId: mockInterview.applicationId,
                    interviewStepId: mockInterview.interviewStepId,
                    employeeId: mockInterview.employeeId,
                    interviewDate: mockInterview.interviewDate,
                    score: mockInterview.score,
                    notes: mockInterview.notes,
                    result: mockInterview.result,
                    save: jest.fn()
                };
                const mockUpdatedInterviewInstance = {
                    id: interviewId,
                    applicationId: mockInterview.applicationId,
                    interviewStepId: updateData.interviewStepId,
                    employeeId: updateData.employeeId,
                    interviewDate: new Date(updateData.interviewDate),
                    score: updateData.score,
                    notes: updateData.notes,
                    result: updateData.result,
                    save: jest.fn().mockResolvedValue(mockUpdatedInterview)
                };
                let interviewConstructorCallCount = 0;
                (Interview.findOne as jest.Mock).mockResolvedValue(mockExistingInterview);
                (Interview as unknown as jest.Mock).mockImplementation((data) => {
                    interviewConstructorCallCount++;
                    // Creating Interview with updated data
                    return mockUpdatedInterviewInstance;
                });

                const result = await updateInterview(candidateId, interviewId, updateData);

                expect(Interview.findOne).toHaveBeenCalledWith(interviewId);
                expect(Application.findOne).toHaveBeenCalledWith(mockInterview.applicationId);
                expect(InterviewStep.findOne).toHaveBeenCalledWith(updateData.interviewStepId);
                expect(Employee.findOne).toHaveBeenCalledWith(updateData.employeeId);
                expect(mockUpdatedInterviewInstance.save).toHaveBeenCalled();
                expect(result.id).toBe(mockUpdatedInterview.id);
            });

            it('should update interview successfully with partial update (only some fields)', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = {
                    score: 5,
                    notes: 'Updated notes'
                };

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    score: 4,
                    notes: 'Original notes',
                    result: 'Pending'
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };
                const mockUpdatedInterview = { ...mockInterview, ...updateData };

                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);

                const mockExistingInterview = {
                    ...mockInterview,
                    save: jest.fn()
                };
                const mockUpdatedInterviewInstance = {
                    ...mockInterview,
                    ...updateData,
                    save: jest.fn().mockResolvedValue(mockUpdatedInterview)
                };
                (Interview.findOne as jest.Mock).mockResolvedValue(mockExistingInterview);
                (Interview as unknown as jest.Mock).mockImplementation((data) => {
                    return mockUpdatedInterviewInstance;
                });

                const result = await updateInterview(candidateId, interviewId, updateData);

                expect(Interview.findOne).toHaveBeenCalledWith(interviewId);
                expect(Application.findOne).toHaveBeenCalledWith(mockInterview.applicationId);
                expect(mockUpdatedInterviewInstance.save).toHaveBeenCalled();
                expect(result.score).toBe(updateData.score);
                expect(result.notes).toBe(updateData.notes);
            });

            it('should return unchanged interview when empty update data provided', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = {};

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    score: 4,
                    notes: 'Original notes',
                    result: 'Pending'
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };

                const mockExistingInterview = {
                    ...mockInterview,
                    save: jest.fn()
                };
                const mockUpdatedInterviewInstance = {
                    ...mockInterview,
                    save: jest.fn().mockResolvedValue(mockInterview)
                };
                (Interview.findOne as jest.Mock).mockResolvedValue(mockExistingInterview);
                (Interview as unknown as jest.Mock).mockImplementation((data) => {
                    return mockUpdatedInterviewInstance;
                });

                const result = await updateInterview(candidateId, interviewId, updateData);

                expect(Interview.findOne).toHaveBeenCalledWith(interviewId);
                expect(Application.findOne).toHaveBeenCalledWith(mockInterview.applicationId);
                expect(mockUpdatedInterviewInstance.save).toHaveBeenCalled();
                expect(result.id).toBe(mockInterview.id);
            });
        });

        describe('Validation errors', () => {
            it('should throw error when interview not found', async () => {
                const candidateId = 1;
                const interviewId = 999;
                const updateData = { score: 5 };

                (Interview.findOne as jest.Mock).mockResolvedValue(null);

                await expect(updateInterview(candidateId, interviewId, updateData)).rejects.toThrow('Interview not found');
            });

            it('should throw error when interview does not belong to candidate', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = { score: 5 };

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z')
                };
                const mockApplication = { id: 1, candidateId: 999, positionId: 10 }; // Different candidate

                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);

                await expect(updateInterview(candidateId, interviewId, updateData)).rejects.toThrow('Interview does not belong to the specified candidate');
            });

            it('should throw error when interview step not found (if interviewStepId provided)', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = { interviewStepId: 999 };

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z')
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };
                const mockPosition = { id: 10, interviewFlowId: 5 };

                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(null);

                await expect(updateInterview(candidateId, interviewId, updateData)).rejects.toThrow('Interview step not found');
            });

            it('should throw error when interview step does not belong to position\'s flow (if interviewStepId provided)', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = { interviewStepId: 3 };

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z')
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };
                const mockPosition = { id: 10, interviewFlowId: 5 };
                const mockInterviewStep = { id: 3, interviewFlowId: 99 }; // Different flow ID

                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(mockInterviewStep);

                await expect(updateInterview(candidateId, interviewId, updateData)).rejects.toThrow('Interview step does not belong to the position\'s interview flow');
            });

            it('should throw error when employee not found (if employeeId provided)', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = { employeeId: 999 };

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z')
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };

                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Employee.findOne as jest.Mock).mockResolvedValue(null);

                await expect(updateInterview(candidateId, interviewId, updateData)).rejects.toThrow('Employee not found');
            });

            it('should throw error when employee is not active (if employeeId provided)', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = { employeeId: 4 };

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z')
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };
                const mockEmployee = { id: 4, isActive: false };

                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Employee.findOne as jest.Mock).mockResolvedValue(mockEmployee);

                await expect(updateInterview(candidateId, interviewId, updateData)).rejects.toThrow('Employee is not active');
            });

            it('should handle database errors', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = { score: 5 };

                const mockInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z')
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };

                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);

                const mockExistingInterview = {
                    ...mockInterview,
                    save: jest.fn()
                };
                const mockUpdatedInterviewInstance = {
                    ...mockInterview,
                    save: jest.fn().mockRejectedValue(new Error('Database error'))
                };
                (Interview.findOne as jest.Mock).mockResolvedValue(mockExistingInterview);
                (Interview as unknown as jest.Mock).mockImplementation((data) => {
                    return mockUpdatedInterviewInstance;
                });

                await expect(updateInterview(candidateId, interviewId, updateData)).rejects.toThrow('Database error');
            });
        });
    });

    describe('deleteInterview', () => {
        describe('Successful deletion of pending interview', () => {
            it('should delete pending interview successfully', async () => {
                const candidateId = 1;
                const interviewId = 2;
                const deletionData = {
                    reason: 'Interview cancelled by candidate'
                };

                const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
                const mockInterview = {
                    id: 2,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    result: null, // Pending interview
                    score: null,
                    notes: null
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Interview.delete as jest.Mock).mockResolvedValue(undefined);

                await deleteInterview(candidateId, interviewId, deletionData);

                expect(Candidate.findOne).toHaveBeenCalledWith(candidateId);
                expect(Interview.findOne).toHaveBeenCalledWith(interviewId);
                expect(Application.findOne).toHaveBeenCalledWith(mockInterview.applicationId);
                expect(Interview.delete).toHaveBeenCalledWith(interviewId);
            });

            it('should delete interview with result "Pending" successfully', async () => {
                const candidateId = 1;
                const interviewId = 2;
                const deletionData = {
                    reason: 'Interview rescheduled'
                };

                const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
                const mockInterview = {
                    id: 2,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    result: 'Pending',
                    score: null,
                    notes: null
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Interview.delete as jest.Mock).mockResolvedValue(undefined);

                await deleteInterview(candidateId, interviewId, deletionData);

                expect(Interview.delete).toHaveBeenCalledWith(interviewId);
            });
        });

        describe('Candidate not found', () => {
            it('should throw error when candidate does not exist', async () => {
                const candidateId = 999;
                const interviewId = 2;
                const deletionData = {
                    reason: 'Test reason'
                };

                (Candidate.findOne as jest.Mock).mockResolvedValue(null);

                await expect(deleteInterview(candidateId, interviewId, deletionData)).rejects.toThrow('Candidate not found');
                expect(Interview.findOne).not.toHaveBeenCalled();
                expect(Interview.delete).not.toHaveBeenCalled();
            });
        });

        describe('Interview not found', () => {
            it('should throw error when interview does not exist', async () => {
                const candidateId = 1;
                const interviewId = 999;
                const deletionData = {
                    reason: 'Test reason'
                };

                const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Interview.findOne as jest.Mock).mockResolvedValue(null);

                await expect(deleteInterview(candidateId, interviewId, deletionData)).rejects.toThrow('Interview not found');
                expect(Interview.delete).not.toHaveBeenCalled();
            });
        });

        describe('Interview does not belong to candidate', () => {
            it('should throw error when interview belongs to different candidate', async () => {
                const candidateId = 1;
                const interviewId = 2;
                const deletionData = {
                    reason: 'Test reason'
                };

                const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
                const mockInterview = {
                    id: 2,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    result: null,
                    score: null,
                    notes: null
                };
                const mockApplication = { id: 1, candidateId: 999, positionId: 10 }; // Different candidate

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);

                await expect(deleteInterview(candidateId, interviewId, deletionData)).rejects.toThrow('Interview does not belong to the specified candidate');
                expect(Interview.delete).not.toHaveBeenCalled();
            });
        });

        describe('Prevent deletion of completed interviews', () => {
            it('should throw error when attempting to delete interview with "Passed" result', async () => {
                const candidateId = 1;
                const interviewId = 2;
                const deletionData = {
                    reason: 'Test reason'
                };

                const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
                const mockInterview = {
                    id: 2,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    result: 'Passed',
                    score: 4,
                    notes: 'Great candidate'
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);

                await expect(deleteInterview(candidateId, interviewId, deletionData)).rejects.toThrow('Completed interviews cannot be deleted');
                expect(Interview.delete).not.toHaveBeenCalled();
            });

            it('should throw error when attempting to delete interview with "Failed" result', async () => {
                const candidateId = 1;
                const interviewId = 2;
                const deletionData = {
                    reason: 'Test reason'
                };

                const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
                const mockInterview = {
                    id: 2,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    result: 'Failed',
                    score: 2,
                    notes: 'Needs improvement'
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);

                await expect(deleteInterview(candidateId, interviewId, deletionData)).rejects.toThrow('Completed interviews cannot be deleted');
                expect(Interview.delete).not.toHaveBeenCalled();
            });
        });

        describe('Database error handling for deleteInterview', () => {
            it('should throw error when database deletion fails', async () => {
                const candidateId = 1;
                const interviewId = 2;
                const deletionData = {
                    reason: 'Test reason'
                };

                const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
                const mockInterview = {
                    id: 2,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    result: null,
                    score: null,
                    notes: null
                };
                const mockApplication = { id: 1, candidateId: 1, positionId: 10 };

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Interview.findOne as jest.Mock).mockResolvedValue(mockInterview);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Interview.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

                await expect(deleteInterview(candidateId, interviewId, deletionData)).rejects.toThrow('Database error');
            });
        });
    });

    describe('createInterview', () => {
        const validInterviewData = {
            applicationId: 1,
            interviewStepId: 2,
            employeeId: 3,
            interviewDate: '2026-06-20T10:00:00Z',
            result: 'Pending',
            score: 4,
            notes: 'Strong candidate'
        };

        const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
        const mockApplication = { id: 1, candidateId: 1, positionId: 10 };
        const mockPosition = { id: 10, interviewFlowId: 5 };
        const mockInterviewStep = { id: 2, interviewFlowId: 5 };
        const mockEmployee = { id: 3, isActive: true };
        const mockCreatedInterview = {
            id: 99,
            applicationId: 1,
            interviewStepId: 2,
            employeeId: 3,
            interviewDate: new Date('2026-06-20T10:00:00Z'),
            result: 'Pending',
            score: 4,
            notes: 'Strong candidate'
        };

        describe('Successful creation', () => {
            it('should create an interview with all fields', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(mockInterviewStep);
                (Employee.findOne as jest.Mock).mockResolvedValue(mockEmployee);

                const mockInterviewInstance = {
                    ...mockCreatedInterview,
                    save: jest.fn().mockResolvedValue(mockCreatedInterview)
                };
                (Interview as unknown as jest.Mock).mockImplementation(() => mockInterviewInstance);

                const result = await createInterview(1, validInterviewData);

                expect(Candidate.findOne).toHaveBeenCalledWith(1);
                expect(Application.findOne).toHaveBeenCalledWith(1);
                expect(Position.findOne).toHaveBeenCalledWith(10);
                expect(InterviewStep.findOne).toHaveBeenCalledWith(2);
                expect(Employee.findOne).toHaveBeenCalledWith(3);
                expect(mockInterviewInstance.save).toHaveBeenCalled();
                expect(result.id).toBe(99);
            });

            it('should create an interview with minimal fields (result defaults to Pending)', async () => {
                const minimalData = {
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: '2026-06-20T10:00:00Z'
                    // result omitted
                };

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(mockInterviewStep);
                (Employee.findOne as jest.Mock).mockResolvedValue(mockEmployee);

                const mockInterviewInstance = {
                    ...mockCreatedInterview,
                    result: 'Pending',
                    save: jest.fn().mockResolvedValue({ ...mockCreatedInterview, result: 'Pending' })
                };
                (Interview as unknown as jest.Mock).mockImplementation((data) => {
                    expect(data.result).toBe('Pending');
                    return mockInterviewInstance;
                });

                const result = await createInterview(1, minimalData);

                expect(result.result).toBe('Pending');
            });
        });

        describe('Candidate not found', () => {
            it('should throw error when candidate does not exist', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(null);

                await expect(createInterview(999, validInterviewData)).rejects.toThrow('not found');
            });
        });

        describe('Application not found', () => {
            it('should throw error when application does not exist', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue(null);

                await expect(createInterview(1, validInterviewData)).rejects.toThrow('not found');
            });

            it('should throw error when application does not belong to candidate', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue({ ...mockApplication, candidateId: 999 });

                await expect(createInterview(1, validInterviewData)).rejects.toThrow();
            });
        });

        describe('Interview step validation', () => {
            it('should throw error when interview step does not exist', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(null);

                await expect(createInterview(1, validInterviewData)).rejects.toThrow('not found');
            });

            it('should throw error when interview step does not belong to position interview flow', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue({ id: 2, interviewFlowId: 99 }); // different flow

                await expect(createInterview(1, validInterviewData)).rejects.toThrow('does not belong to the position\'s interview flow');
            });
        });

        describe('Employee validation', () => {
            it('should throw error when employee does not exist', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(mockInterviewStep);
                (Employee.findOne as jest.Mock).mockResolvedValue(null);

                await expect(createInterview(1, validInterviewData)).rejects.toThrow('not found');
            });

            it('should throw error when employee is not active', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(mockInterviewStep);
                (Employee.findOne as jest.Mock).mockResolvedValue({ id: 3, isActive: false });

                await expect(createInterview(1, validInterviewData)).rejects.toThrow('is not active');
            });
        });

        describe('Database error handling', () => {
            it('should propagate database errors on save', async () => {
                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
                (Application.findOne as jest.Mock).mockResolvedValue(mockApplication);
                (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);
                (InterviewStep.findOne as jest.Mock).mockResolvedValue(mockInterviewStep);
                (Employee.findOne as jest.Mock).mockResolvedValue(mockEmployee);

                const mockInterviewInstance = {
                    save: jest.fn().mockRejectedValue(new Error('Database connection failed'))
                };
                (Interview as unknown as jest.Mock).mockImplementation(() => mockInterviewInstance);

                await expect(createInterview(1, validInterviewData)).rejects.toThrow('Database connection failed');
            });
        });
    });
});
