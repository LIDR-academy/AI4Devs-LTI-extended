import { Request, Response } from 'express';
import { createInterviewController, updateInterviewController, deleteInterviewController } from '../interviewController';
import { createInterview, updateInterview, deleteInterview } from '../../../application/services/interviewService';
import { validateInterviewData, validateInterviewUpdateData, validateInterviewDeletion } from '../../../application/validator';

// Mock services and validator
jest.mock('../../../application/services/interviewService');
jest.mock('../../../application/validator');

const mockCreateInterview = createInterview as jest.MockedFunction<typeof createInterview>;
const mockUpdateInterview = updateInterview as jest.MockedFunction<typeof updateInterview>;
const mockDeleteInterview = deleteInterview as jest.MockedFunction<typeof deleteInterview>;
const mockValidateInterviewData = validateInterviewData as jest.MockedFunction<typeof validateInterviewData>;
const mockValidateInterviewUpdateData = validateInterviewUpdateData as jest.MockedFunction<typeof validateInterviewUpdateData>;
const mockValidateInterviewDeletion = validateInterviewDeletion as jest.MockedFunction<typeof validateInterviewDeletion>;

describe('Interview Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnThis();
        
        mockResponse = {
            json: mockJson,
            status: mockStatus,
        };

        mockRequest = {
            params: {},
            body: {},
        };
        
        jest.clearAllMocks();
    });

    describe('createInterviewController', () => {
        describe('Successful creation', () => {
            it('should return 201 with interview data on successful creation', async () => {
                const candidateId = 1;
                const interviewData = {
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: '2026-02-15T10:00:00Z',
                    score: 4,
                    notes: 'Candidate demonstrated strong technical skills.'
                };

                const mockCreatedInterview = {
                    id: 1,
                    ...interviewData,
                    interviewDate: new Date(interviewData.interviewDate),
                };

                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = interviewData;

                mockValidateInterviewData.mockImplementation(() => {});
                mockCreateInterview.mockResolvedValue(mockCreatedInterview as any);

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockValidateInterviewData).toHaveBeenCalledWith(candidateId, interviewData);
                expect(mockCreateInterview).toHaveBeenCalledWith(candidateId, interviewData);
                expect(mockStatus).toHaveBeenCalledWith(201);
                expect(mockJson).toHaveBeenCalledWith(mockCreatedInterview);
            });
        });

        describe('Validation errors', () => {
            it('should return 400 when candidate ID format is invalid', async () => {
                mockRequest.params = { candidateId: 'invalid' };
                mockRequest.body = {
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: '2026-02-15T10:00:00Z'
                };

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
            });

            it('should return 400 when validation fails - missing required fields', async () => {
                const candidateId = 1;
                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = {
                    applicationId: 1,
                    // Missing interviewStepId, employeeId, interviewDate
                };

                mockValidateInterviewData.mockImplementation(() => {
                    throw new Error('interviewStepId is required');
                });

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'interviewStepId is required'
                    })
                );
            });

            it('should return 400 when validation fails - invalid score range', async () => {
                const candidateId = 1;
                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = {
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: '2026-02-15T10:00:00Z',
                    score: 10 // Invalid score
                };

                mockValidateInterviewData.mockImplementation(() => {
                    throw new Error('Score must be between 0 and 5');
                });

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Score must be between 0 and 5'
                    })
                );
            });

            it('should return 400 when validation fails - invalid notes length', async () => {
                const candidateId = 1;
                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = {
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: '2026-02-15T10:00:00Z',
                    notes: 'a'.repeat(1001) // Exceeds limit
                };

                mockValidateInterviewData.mockImplementation(() => {
                    throw new Error('Notes must not exceed 1000 characters');
                });

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Notes must not exceed 1000 characters'
                    })
                );
            });
        });

        describe('Not found errors', () => {
            it('should return 404 when candidate not found', async () => {
                const candidateId = 999;
                const interviewData = {
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: '2026-02-15T10:00:00Z'
                };

                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = interviewData;

                mockValidateInterviewData.mockImplementation(() => {});
                mockCreateInterview.mockRejectedValue(new Error('Candidate not found'));

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Candidate not found'
                    })
                );
            });

            it('should return 404 when application not found', async () => {
                const candidateId = 1;
                const interviewData = {
                    applicationId: 999,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: '2026-02-15T10:00:00Z'
                };

                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = interviewData;

                mockValidateInterviewData.mockImplementation(() => {});
                mockCreateInterview.mockRejectedValue(new Error('Application not found'));

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Application not found'
                    })
                );
            });

            it('should return 404 when interview step not found', async () => {
                const candidateId = 1;
                const interviewData = {
                    applicationId: 1,
                    interviewStepId: 999,
                    employeeId: 3,
                    interviewDate: '2026-02-15T10:00:00Z'
                };

                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = interviewData;

                mockValidateInterviewData.mockImplementation(() => {});
                mockCreateInterview.mockRejectedValue(new Error('Interview step not found'));

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Interview step not found'
                    })
                );
            });

            it('should return 404 when employee not found', async () => {
                const candidateId = 1;
                const interviewData = {
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 999,
                    interviewDate: '2026-02-15T10:00:00Z'
                };

                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = interviewData;

                mockValidateInterviewData.mockImplementation(() => {});
                mockCreateInterview.mockRejectedValue(new Error('Employee not found'));

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Employee not found'
                    })
                );
            });
        });

        describe('Server errors', () => {
            it('should return 500 when service throws unexpected error', async () => {
                const candidateId = 1;
                const interviewData = {
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: '2026-02-15T10:00:00Z'
                };

                mockRequest.params = { candidateId: candidateId.toString() };
                mockRequest.body = interviewData;

                mockValidateInterviewData.mockImplementation(() => {});
                mockCreateInterview.mockRejectedValue(new Error('Database connection failed'));

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
            });
        });
    });

    describe('updateInterviewController', () => {
        describe('Successful update', () => {
            it('should return 200 with updated interview data on successful update', async () => {
                const candidateId = 1;
                const interviewId = 10;
                const updateData = {
                    score: 5,
                    notes: 'Updated notes'
                };

                const mockUpdatedInterview = {
                    id: interviewId,
                    applicationId: 1,
                    interviewStepId: 2,
                    employeeId: 3,
                    interviewDate: new Date('2026-02-15T10:00:00Z'),
                    ...updateData
                };

                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = updateData;

                mockValidateInterviewUpdateData.mockImplementation(() => {});
                mockUpdateInterview.mockResolvedValue(mockUpdatedInterview as any);

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockValidateInterviewUpdateData).toHaveBeenCalledWith(updateData);
                expect(mockUpdateInterview).toHaveBeenCalledWith(candidateId, interviewId, updateData);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(mockUpdatedInterview);
            });
        });

        describe('Validation errors', () => {
            it('should return 400 when candidate ID format is invalid', async () => {
                mockRequest.params = { candidateId: 'invalid', interviewId: '10' };
                mockRequest.body = { score: 5 };

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
            });

            it('should return 400 when interview ID format is invalid', async () => {
                mockRequest.params = { candidateId: '1', interviewId: 'invalid' };
                mockRequest.body = { score: 5 };

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
            });

            it('should return 400 when validation fails - invalid score range', async () => {
                const candidateId = 1;
                const interviewId = 10;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { score: 10 };

                mockValidateInterviewUpdateData.mockImplementation(() => {
                    throw new Error('Score must be between 0 and 5');
                });

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Score must be between 0 and 5'
                    })
                );
            });

            it('should return 400 when validation fails - invalid notes length', async () => {
                const candidateId = 1;
                const interviewId = 10;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { notes: 'a'.repeat(1001) };

                mockValidateInterviewUpdateData.mockImplementation(() => {
                    throw new Error('Notes must not exceed 1000 characters');
                });

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Notes must not exceed 1000 characters'
                    })
                );
            });

            it('should return 400 when validation fails - invalid result value', async () => {
                const candidateId = 1;
                const interviewId = 10;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { result: 'InvalidResult' };

                mockValidateInterviewUpdateData.mockImplementation(() => {
                    throw new Error('result must be one of: Pending, Passed, Failed');
                });

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'result must be one of: Pending, Passed, Failed'
                    })
                );
            });

            it('should return 400 when interview step does not belong to flow', async () => {
                const candidateId = 1;
                const interviewId = 10;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { interviewStepId: 3 };

                mockValidateInterviewUpdateData.mockImplementation(() => {});
                mockUpdateInterview.mockRejectedValue(new Error('Interview step does not belong to the position\'s interview flow'));

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.stringContaining('Interview step does not belong')
                    })
                );
            });

            it('should return 400 when employee is not active', async () => {
                const candidateId = 1;
                const interviewId = 10;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { employeeId: 4 };

                mockValidateInterviewUpdateData.mockImplementation(() => {});
                mockUpdateInterview.mockRejectedValue(new Error('Employee is not active'));

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Employee is not active'
                    })
                );
            });
        });

        describe('Not found errors', () => {
            it('should return 404 when interview not found', async () => {
                const candidateId = 1;
                const interviewId = 999;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { score: 5 };

                mockValidateInterviewUpdateData.mockImplementation(() => {});
                mockUpdateInterview.mockRejectedValue(new Error('Interview not found'));

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Interview not found'
                    })
                );
            });

            it('should return 404 when interview does not belong to candidate', async () => {
                const candidateId = 1;
                const interviewId = 10;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { score: 5 };

                mockValidateInterviewUpdateData.mockImplementation(() => {});
                mockUpdateInterview.mockRejectedValue(new Error('Interview does not belong to the specified candidate'));

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Interview does not belong to the specified candidate'
                    })
                );
            });
        });

        describe('Server errors', () => {
            it('should return 500 when service throws unexpected error', async () => {
                const candidateId = 1;
                const interviewId = 10;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { score: 5 };

                mockValidateInterviewUpdateData.mockImplementation(() => {});
                mockUpdateInterview.mockRejectedValue(new Error('Database connection failed'));

                await updateInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
            });
        });
    });

    describe('deleteInterviewController', () => {
        describe('Successful deletion', () => {
            it('should return 200 with success message on successful deletion', async () => {
                const candidateId = 1;
                const interviewId = 2;
                const deletionData = {
                    reason: 'Interview cancelled by candidate'
                };

                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = deletionData;

                mockValidateInterviewDeletion.mockImplementation(() => {});
                mockDeleteInterview.mockResolvedValue(undefined);

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockValidateInterviewDeletion).toHaveBeenCalledWith(candidateId, interviewId, deletionData);
                expect(mockDeleteInterview).toHaveBeenCalledWith(candidateId, interviewId, deletionData);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String)
                    })
                );
            });
        });

        describe('Invalid ID format', () => {
            it('should return 400 when candidateId format is invalid', async () => {
                mockRequest.params = { candidateId: 'invalid', interviewId: '2' };
                mockRequest.body = { reason: 'Test reason' };

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
                expect(mockDeleteInterview).not.toHaveBeenCalled();
            });

            it('should return 400 when interviewId format is invalid', async () => {
                mockRequest.params = { candidateId: '1', interviewId: 'invalid' };
                mockRequest.body = { reason: 'Test reason' };

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
                expect(mockDeleteInterview).not.toHaveBeenCalled();
            });
        });

        describe('Validation errors', () => {
            it('should return 400 when validation fails - missing reason', async () => {
                const candidateId = 1;
                const interviewId = 2;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = {};

                mockValidateInterviewDeletion.mockImplementation(() => {
                    throw new Error('Deletion reason is required');
                });

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Deletion reason is required'
                    })
                );
                expect(mockDeleteInterview).not.toHaveBeenCalled();
            });

            it('should return 400 when validation fails - empty reason', async () => {
                const candidateId = 1;
                const interviewId = 2;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { reason: '' };

                mockValidateInterviewDeletion.mockImplementation(() => {
                    throw new Error('Deletion reason cannot be empty');
                });

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Deletion reason cannot be empty'
                    })
                );
                expect(mockDeleteInterview).not.toHaveBeenCalled();
            });

            it('should return 400 when validation fails - reason too long', async () => {
                const candidateId = 1;
                const interviewId = 2;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { reason: 'a'.repeat(501) };

                mockValidateInterviewDeletion.mockImplementation(() => {
                    throw new Error('Deletion reason must not exceed 500 characters');
                });

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Deletion reason must not exceed 500 characters'
                    })
                );
                expect(mockDeleteInterview).not.toHaveBeenCalled();
            });
        });

        describe('Resource not found', () => {
            it('should return 404 when candidate not found', async () => {
                const candidateId = 999;
                const interviewId = 2;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { reason: 'Test reason' };

                mockValidateInterviewDeletion.mockImplementation(() => {});
                mockDeleteInterview.mockRejectedValue(new Error('Candidate not found'));

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Candidate not found'
                    })
                );
            });

            it('should return 404 when interview not found', async () => {
                const candidateId = 1;
                const interviewId = 999;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { reason: 'Test reason' };

                mockValidateInterviewDeletion.mockImplementation(() => {});
                mockDeleteInterview.mockRejectedValue(new Error('Interview not found'));

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Interview not found'
                    })
                );
            });
        });

        describe('Business rule violation', () => {
            it('should return 422 when attempting to delete completed interview', async () => {
                const candidateId = 1;
                const interviewId = 2;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { reason: 'Test reason' };

                mockValidateInterviewDeletion.mockImplementation(() => {});
                mockDeleteInterview.mockRejectedValue(new Error('Completed interviews cannot be deleted'));

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(422);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Completed interviews cannot be deleted'
                    })
                );
            });
        });

        describe('Server errors', () => {
            it('should return 500 when service throws unexpected error', async () => {
                const candidateId = 1;
                const interviewId = 2;
                mockRequest.params = { candidateId: candidateId.toString(), interviewId: interviewId.toString() };
                mockRequest.body = { reason: 'Test reason' };

                mockValidateInterviewDeletion.mockImplementation(() => {});
                mockDeleteInterview.mockRejectedValue(new Error('Database connection failed'));

                await deleteInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
            });
        });
    });
});
