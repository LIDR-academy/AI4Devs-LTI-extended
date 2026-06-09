import express from 'express';
import request from 'supertest';
import candidateRoutes from './candidateRoutes';
import { createInterview } from '../application/services/interviewService';
import { validateInterviewCreateData } from '../application/validator';

jest.mock('../application/services/interviewService', () => ({
    createInterview: jest.fn(),
    updateInterview: jest.fn(),
    deleteInterview: jest.fn(),
}));

jest.mock('../application/validator', () => ({
    validateInterviewCreateData: jest.fn(),
    validateInterviewUpdateData: jest.fn(),
    validateInterviewDeletion: jest.fn(),
}));

// Mock candidate controller functions
jest.mock('../presentation/controllers/candidateController', () => ({
    addCandidate: jest.fn(),
    getCandidateById: jest.fn((req: any, res: any) => res.status(200).json({})),
    updateCandidateStageController: jest.fn((req: any, res: any) => res.status(200).json({})),
    getAllCandidatesController: jest.fn((req: any, res: any) => res.status(200).json([])),
}));

describe('candidateRoutes - POST /:candidateId/interviews', () => {
    const app = express();
    app.use(express.json());
    app.use('/candidates', candidateRoutes);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 201 with created interview on valid request', async () => {
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

        (validateInterviewCreateData as jest.Mock).mockImplementation(() => {});
        (createInterview as jest.Mock).mockResolvedValue(mockCreatedInterview);

        const response = await request(app)
            .post('/candidates/1/interviews')
            .send({
                applicationId: 1,
                interviewStepId: 2,
                employeeId: 3,
                interviewDate: '2026-06-20T10:00:00Z',
                result: 'Pending',
                score: 4,
                notes: 'Strong candidate'
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ id: 99, applicationId: 1 });
        expect(validateInterviewCreateData).toHaveBeenCalled();
        expect(createInterview).toHaveBeenCalledWith(1, expect.objectContaining({ applicationId: 1 }));
    });

    it('returns 400 for invalid candidateId format', async () => {
        const response = await request(app)
            .post('/candidates/abc/interviews')
            .send({ applicationId: 1, interviewStepId: 2, employeeId: 3, interviewDate: '2026-06-20T10:00:00Z' });

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({ message: expect.any(String), error: expect.any(String) });
        expect(createInterview).not.toHaveBeenCalled();
    });

    it('returns 400 when validator throws', async () => {
        (validateInterviewCreateData as jest.Mock).mockImplementation(() => {
            throw new Error('applicationId is required');
        });

        const response = await request(app)
            .post('/candidates/1/interviews')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({ message: expect.any(String), error: 'applicationId is required' });
        expect(createInterview).not.toHaveBeenCalled();
    });

    it('returns 404 when candidate not found', async () => {
        (validateInterviewCreateData as jest.Mock).mockImplementation(() => {});
        (createInterview as jest.Mock).mockRejectedValue(new Error('Candidate not found'));

        const response = await request(app)
            .post('/candidates/999/interviews')
            .send({ applicationId: 1, interviewStepId: 2, employeeId: 3, interviewDate: '2026-06-20T10:00:00Z' });

        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({ message: expect.any(String), error: 'Candidate not found' });
    });

    it('returns 400 when interview step does not belong to flow', async () => {
        (validateInterviewCreateData as jest.Mock).mockImplementation(() => {});
        (createInterview as jest.Mock).mockRejectedValue(
            new Error('Interview step does not belong to the position\'s interview flow')
        );

        const response = await request(app)
            .post('/candidates/1/interviews')
            .send({ applicationId: 1, interviewStepId: 99, employeeId: 3, interviewDate: '2026-06-20T10:00:00Z' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('does not belong to the position\'s interview flow');
    });
});
