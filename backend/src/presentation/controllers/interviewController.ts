import { Request, Response, NextFunction } from 'express';
import { createInterview, updateInterview, deleteInterview } from '../../application/services/interviewService';
import { validateInterviewData, validateInterviewUpdateData, validateInterviewDeletion } from '../../application/validator';

/**
 * @route POST /candidates/:candidateId/interviews
 * @description Creates a new interview for a candidate
 * @access Public
 */
export const createInterviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract candidateId from URL params
        const candidateId = parseInt(req.params.candidateId);
        
        // Validate candidateId format
        if (isNaN(candidateId)) {
            return res.status(400).json({
                message: 'Validation error',
                error: 'Invalid candidate ID format'
            });
        }

        // Extract interview data from request body
        const interviewData = req.body;

        // Validate interview data
        try {
            validateInterviewData(candidateId, interviewData);
        } catch (validationError: any) {
            return res.status(400).json({
                message: 'Validation error',
                error: validationError.message
            });
        }

        // Create interview
        const createdInterview = await createInterview(candidateId, interviewData);

        // Return 201 Created with interview data
        return res.status(201).json(createdInterview);
    } catch (error: unknown) {
        if (error instanceof Error) {
            // Handle specific error types
            if (error.message.includes('not found') || error.message.includes('does not belong')) {
                return res.status(404).json({
                    message: 'Resource not found',
                    error: error.message
                });
            }
            
            // Handle other errors as 500
            return res.status(500).json({
                message: 'Internal server error',
                error: 'An unexpected error occurred'
            });
        }
        
        // Handle unknown errors
        return res.status(500).json({
            message: 'Internal server error',
            error: 'An unexpected error occurred'
        });
    }
};

/**
 * @route PATCH /candidates/:candidateId/interviews/:interviewId
 * @description Updates an existing interview for a candidate
 * @access Public
 */
export const updateInterviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract candidateId and interviewId from URL params
        const candidateId = parseInt(req.params.candidateId);
        const interviewId = parseInt(req.params.interviewId);
        
        // Validate candidateId format
        if (isNaN(candidateId)) {
            return res.status(400).json({
                message: 'Validation error',
                error: 'Invalid candidate ID format'
            });
        }

        // Validate interviewId format
        if (isNaN(interviewId)) {
            return res.status(400).json({
                message: 'Validation error',
                error: 'Invalid interview ID format'
            });
        }

        // Extract interview data from request body
        const interviewData = req.body;

        // Validate interview update data
        try {
            validateInterviewUpdateData(interviewData);
        } catch (validationError: any) {
            return res.status(400).json({
                message: 'Validation error',
                error: validationError.message
            });
        }

        // Update interview
        const updatedInterview = await updateInterview(candidateId, interviewId, interviewData);

        // Return 200 OK with updated interview data
        return res.status(200).json(updatedInterview);
    } catch (error: unknown) {
        if (error instanceof Error) {
            // Handle business rule validation errors (400) - check these first
            if (error.message.includes('does not belong to the position\'s interview flow') || 
                error.message.includes('is not active')) {
                return res.status(400).json({
                    message: 'Validation error',
                    error: error.message
                });
            }
            
            // Handle specific error types (404)
            if (error.message.includes('not found') || error.message.includes('does not belong')) {
                return res.status(404).json({
                    message: 'Resource not found',
                    error: error.message
                });
            }
            
            // Handle other errors as 500
            return res.status(500).json({
                message: 'Internal server error',
                error: 'An unexpected error occurred'
            });
        }
        
        // Handle unknown errors
        return res.status(500).json({
            message: 'Internal server error',
            error: 'An unexpected error occurred'
        });
    }
};

/**
 * @route DELETE /candidates/:candidateId/interviews/:interviewId
 * @description Deletes an existing interview for a candidate
 * @access Public
 */
export const deleteInterviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract candidateId and interviewId from URL params
        const candidateId = parseInt(req.params.candidateId);
        const interviewId = parseInt(req.params.interviewId);
        
        // Validate candidateId format
        if (isNaN(candidateId)) {
            return res.status(400).json({
                message: 'Validation error',
                error: 'Invalid candidate ID format'
            });
        }

        // Validate interviewId format
        if (isNaN(interviewId)) {
            return res.status(400).json({
                message: 'Validation error',
                error: 'Invalid interview ID format'
            });
        }

        // Extract deletion data from request body
        const deletionData = req.body;

        // Validate deletion data
        try {
            validateInterviewDeletion(candidateId, interviewId, deletionData);
        } catch (validationError: any) {
            return res.status(400).json({
                message: 'Validation error',
                error: validationError.message
            });
        }

        // Delete interview
        await deleteInterview(candidateId, interviewId, deletionData);

        // Return 200 OK with success message
        return res.status(200).json({
            message: 'Interview deleted successfully'
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            // Handle business rule validation errors (422)
            if (error.message.includes('Completed interviews cannot be deleted')) {
                return res.status(422).json({
                    message: 'Business rule violation',
                    error: error.message
                });
            }
            
            // Handle specific error types (404)
            if (error.message.includes('not found') || error.message.includes('does not belong')) {
                return res.status(404).json({
                    message: 'Resource not found',
                    error: error.message
                });
            }
            
            // Handle other errors as 500
            return res.status(500).json({
                message: 'Internal server error',
                error: 'An unexpected error occurred'
            });
        }
        
        // Handle unknown errors
        return res.status(500).json({
            message: 'Internal server error',
            error: 'An unexpected error occurred'
        });
    }
};
