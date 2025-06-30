import { Request, Response } from 'express';
import { getCandidatesByPositionService, getInterviewFlowByPositionService, getAllPositionsService, getCandidateNamesByPositionService, updatePositionService, getPositionByIdService } from '../../application/services/positionService';


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

/**
 * @route PUT /positions/:id
 * @description Actualiza una posición existente
 * @access Public
 */
export const updatePosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        
        // Validar que el ID es un número válido
        if (isNaN(positionId)) {
            return res.status(400).json({ 
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number'
            });
        }

        const updateData = req.body;
        
        // Validar que se envían datos para actualizar
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: 'No data provided for update',
                error: 'Request body cannot be empty'
            });
        }

        const updatedPosition = await updatePositionService(positionId, updateData);
        
        res.status(200).json({
            message: 'Position updated successfully',
            data: updatedPosition
        });
    } catch (error) {
        if (error instanceof Error) {
            // Manejar errores específicos
            if (error.message === 'Position not found') {
                res.status(404).json({ 
                    message: 'Position not found', 
                    error: error.message 
                });
            } else if (error.message.includes('Company not found') || 
                      error.message.includes('Interview flow not found')) {
                res.status(400).json({ 
                    message: 'Invalid reference data', 
                    error: error.message 
                });
            } else if (error.message.includes('inválido') || 
                      error.message.includes('Invalid') ||
                      error.message.includes('exceder') ||
                      error.message.includes('mayor') ||
                      error.message.includes('obligatorio') ||
                      error.message.includes('debe ser') ||
                      error.message.includes('no puede') ||
                      error.message.includes('Estado inválido') ||
                      error.message.includes('número válido') ||
                      error.message.includes('cadena válida') ||
                      error.message.includes('valor booleano') ||
                      error.message.includes('número entero positivo')) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    message: 'Error updating position', 
                    error: error.message 
                });
            }
        } else {
            res.status(500).json({ 
                message: 'Error updating position', 
                error: 'Unknown error occurred' 
            });
        }
    }
};