import { Request, Response } from 'express';
import { addCandidate, findCandidateById, updateCandidateStage, getAllCandidates } from '../../application/services/candidateService';

/**
 * @route POST /candidates
 * @description Creates a new candidate
 * @access Public
 */
export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

/**
 * @route GET /candidates/:id
 * @description Get a candidate by their ID
 * @access Public
 */
export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * @route PUT /candidates/:id/stage
 * @description Updates the interview stage of a candidate
 * @access Public
 */
export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { applicationId, currentInterviewStep } = req.body;
        const applicationIdNumber = parseInt(applicationId);
        if (isNaN(applicationIdNumber)) {
            return res.status(400).json({ error: 'Invalid position ID format' });
        }
        const currentInterviewStepNumber = parseInt(currentInterviewStep);
        if (isNaN(currentInterviewStepNumber)) {
            return res.status(400).json({ error: 'Invalid currentInterviewStep format' });
        }
        const updatedCandidate = await updateCandidateStage(id, applicationIdNumber, currentInterviewStepNumber);
        res.status(200).json({ message: 'Candidate stage updated successfully', data: updatedCandidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Error: Application not found') {
                res.status(404).json({ message: 'Application not found', error: error.message });
            } else {
                res.status(400).json({ message: 'Error updating candidate stage', error: error.message });
            }
        } else {
            res.status(500).json({ message: 'Error updating candidate stage', error: 'Unknown error' });
        }
    }
};

/**
 * @route GET /candidates
 * @description Get all candidates with pagination and filters
 * @access Public
 */
export const getAllCandidatesController = async (req: Request, res: Response) => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const search = req.query.search as string;
        const sort = req.query.sort as string;
        const order = req.query.order as 'asc' | 'desc';

        const result = await getAllCandidates({
            page,
            limit,
            search,
            sort,
            order
        });

        res.status(200).json(result);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes('must be greater than')) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export { addCandidate };
