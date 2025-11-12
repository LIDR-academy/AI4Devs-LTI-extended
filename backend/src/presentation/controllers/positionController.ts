import { Request, Response } from 'express';
import { getCandidatesByPositionService, getInterviewFlowByPositionService, getAllPositionsService, getCandidateNamesByPositionService, getPositionByIdService, updatePositionService } from '../../application/services/positionService';


export const getAllPositions = async (req: Request, res: Response) => {
    try {
        const positions = await getAllPositionsService();
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving positions', error: error instanceof Error ? error.message : String(error) });
    }
};

export const getPositionById = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        
        // Validate position ID format
        if (isNaN(positionId)) {
            return res.status(400).json({ 
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number'
            });
        }

        const position = await getPositionByIdService(positionId);
        res.status(200).json(position);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Position not found') {
                res.status(404).json({ 
                    message: 'Position not found', 
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    message: 'Error retrieving position', 
                    error: error.message 
                });
            }
        } else {
            res.status(500).json({ 
                message: 'Error retrieving position', 
                error: 'Unknown error occurred' 
            });
        }
    }
};

export const getCandidatesByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const candidates = await getCandidatesByPositionService(positionId);
        res.status(200).json(candidates);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error retrieving candidates', error: error.message });
        } else {
            res.status(500).json({ message: 'Error retrieving candidates', error: String(error) });
        }
    }
};

export const getInterviewFlowByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const interviewFlow = await getInterviewFlowByPositionService(positionId);
        res.status(200).json({ interviewFlow });
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: 'Position not found', error: error.message });
        } else {
            res.status(500).json({ message: 'Server error', error: String(error) });
        }
    }
};

export const getCandidateNamesByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const candidateNames = await getCandidateNamesByPositionService(positionId);
        res.status(200).json(candidateNames);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error retrieving candidate names', error: error.message });
        } else {
            res.status(500).json({ message: 'Error retrieving candidate names', error: String(error) });
        }
    }
};

export const updatePosition = async (req: Request, res: Response): Promise<void> => {
    try {
        // Parse and validate position ID
        const positionId = parseInt(req.params.id);
        if (isNaN(positionId)) {
            res.status(400).json({
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number'
            });
            return;
        }

        // Validate request body is not empty
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({
                message: 'No data provided for update',
                error: 'Request body cannot be empty'
            });
            return;
        }

        // Call service layer
        const updatedPosition = await updatePositionService(positionId, req.body);

        // Success response
        res.status(200).json({
            message: 'Position updated successfully',
            data: updatedPosition
        });
    } catch (error) {
        if (error instanceof Error) {
            // Position not found
            if (error.message === 'Position not found') {
                res.status(404).json({
                    message: 'Position not found',
                    error: error.message
                });
                return;
            }

            // Reference validation errors (company or interview flow not found)
            if (error.message === 'Company not found' || error.message === 'Interview flow not found') {
                res.status(400).json({
                    message: 'Invalid reference data',
                    error: error.message
                });
                return;
            }

            // Validation errors (from validatePositionUpdate)
            if (error.message.includes('must be') || 
                error.message.includes('cannot') || 
                error.message.includes('required') ||
                error.message.includes('Invalid')) {
                res.status(400).json({
                    message: 'Validation error',
                    error: error.message
                });
                return;
            }

            // Other errors
            res.status(500).json({
                message: 'Error updating position',
                error: error.message
            });
        } else {
            // Non-Error exceptions
            res.status(500).json({
                message: 'Error updating position',
                error: 'An unexpected error occurred'
            });
        }
    }
};