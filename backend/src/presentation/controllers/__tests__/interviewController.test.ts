import { Request, Response } from 'express';
import { updateInterviewController, deleteInterviewController, createInterviewController } from '../interviewController';
import { updateInterview, deleteInterview, createInterview } from '../../../application/services/interviewService';
import { validateInterviewUpdateData, validateInterviewDeletion, validateInterviewCreateData } from '../../../application/validator';

// Mock services and validator
jest.mock('../../../application/services/interviewService');
jest.mock('../../../application/validator');

const mockUpdateInterview = updateInterview as jest.MockedFunction<typeof updateInterview>;
const mockDeleteInterview = deleteInterview as jest.MockedFunction<typeof deleteInterview>;
const mockCreateInterview = createInterview as jest.MockedFunction<typeof createInterview>;
const mockValidateInterviewUpdateData = validateInterviewUpdateData as jest.MockedFunction<typeof validateInterviewUpdateData>;
const mockValidateInterviewDeletion = validateInterviewDeletion as jest.MockedFunction<typeof validateInterviewDeletion>;
const mockValidateInterviewCreateData = validateInterviewCreateData as jest.MockedFunction<typeof validateInterviewCreateData>;

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

    describe('createInterviewController', () => {
        const validCreateBody = {
            applicationId: 1,
            interviewStepId: 2,
            employeeId: 3,
            interviewDate: '2026-06-20T10:00:00Z',
            result: 'Pending',
            score: 4,
            notes: 'Strong candidate'
        };

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
            it('should return 201 with created interview on success', async () => {
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = validCreateBody;

                mockValidateInterviewCreateData.mockImplementation(() => {});
                mockCreateInterview.mockResolvedValue(mockCreatedInterview as any);

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockValidateInterviewCreateData).toHaveBeenCalledWith(validCreateBody);
                expect(mockCreateInterview).toHaveBeenCalledWith(1, validCreateBody);
                expect(mockStatus).toHaveBeenCalledWith(201);
                expect(mockJson).toHaveBeenCalledWith(mockCreatedInterview);
            });
        });

        describe('Invalid candidateId format', () => {
            it('should return 400 when candidateId is not a valid number', async () => {
                mockRequest.params = { candidateId: 'invalid' };
                mockRequest.body = validCreateBody;

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.any(String)
                    })
                );
                expect(mockCreateInterview).not.toHaveBeenCalled();
            });
        });

        describe('Validator errors', () => {
            it('should return 400 when validator throws', async () => {
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = { applicationId: 1 }; // Missing required fields

                mockValidateInterviewCreateData.mockImplementation(() => {
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
                expect(mockCreateInterview).not.toHaveBeenCalled();
            });
        });

        describe('Not found errors', () => {
            it('should return 404 when candidate not found', async () => {
                mockRequest.params = { candidateId: '999' };
                mockRequest.body = validCreateBody;

                mockValidateInterviewCreateData.mockImplementation(() => {});
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
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = { ...validCreateBody, applicationId: 999 };

                mockValidateInterviewCreateData.mockImplementation(() => {});
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

            it('should return 404 when application does not belong to candidate', async () => {
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = validCreateBody;

                mockValidateInterviewCreateData.mockImplementation(() => {});
                mockCreateInterview.mockRejectedValue(new Error('Application does not belong to the specified candidate'));

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Application does not belong to the specified candidate'
                    })
                );
            });

            it('should return 404 when interview step not found', async () => {
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = validCreateBody;

                mockValidateInterviewCreateData.mockImplementation(() => {});
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
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = validCreateBody;

                mockValidateInterviewCreateData.mockImplementation(() => {});
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

        describe('Business rule errors (400)', () => {
            it('should return 400 when interview step does not belong to position flow', async () => {
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = validCreateBody;

                mockValidateInterviewCreateData.mockImplementation(() => {});
                mockCreateInterview.mockRejectedValue(new Error('Interview step does not belong to the position\'s interview flow'));

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: expect.stringContaining('does not belong to the position\'s interview flow')
                    })
                );
            });

            it('should return 400 when employee is not active', async () => {
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = validCreateBody;

                mockValidateInterviewCreateData.mockImplementation(() => {});
                mockCreateInterview.mockRejectedValue(new Error('Employee is not active'));

                await createInterviewController(mockRequest as Request, mockResponse as Response, jest.fn());

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                        error: 'Employee is not active'
                    })
                );
            });
        });

        describe('Server errors', () => {
            it('should return 500 when service throws unexpected error', async () => {
                mockRequest.params = { candidateId: '1' };
                mockRequest.body = validCreateBody;

                mockValidateInterviewCreateData.mockImplementation(() => {});
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
});
