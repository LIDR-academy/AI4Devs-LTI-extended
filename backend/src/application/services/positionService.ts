import { PrismaClient } from '@prisma/client';
import { Position } from '../../domain/models/Position';
import { validatePositionUpdate } from '../validator';

const prisma = new PrismaClient();

const calculateAverageScore = (interviews: any[]) => {
    if (interviews.length === 0) return 0;
    const totalScore = interviews.reduce((acc, interview) => acc + (interview.score || 0), 0);
    return totalScore / interviews.length;
};

export const getCandidatesByPositionService = async (positionId: number) => {
    try {
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true,
                interviews: true,
                interviewStep: true
            }
        });

        return applications.map(app => ({
            fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
            currentInterviewStep: app.interviewStep.name,
            candidateId: app.candidateId,
            applicationId: app.id,
            averageScore: calculateAverageScore(app.interviews)
        }));
    } catch (error) {
        console.error('Error retrieving candidates by position:', error);
        throw new Error('Error retrieving candidates by position');
    }
};

export const getInterviewFlowByPositionService = async (positionId: number) => {
    const positionWithInterviewFlow = await prisma.position.findUnique({
        where: { id: positionId },
        include: {
            interviewFlow: {
                include: {
                    interviewSteps: true
                }
            }
        }
    });

    if (!positionWithInterviewFlow) {
        throw new Error('Position not found');
    }

    // Formatear la respuesta para incluir el nombre de la posición y el flujo de entrevistas
    return {
        positionName: positionWithInterviewFlow.title,
        interviewFlow: {
            id: positionWithInterviewFlow.interviewFlow.id,
            description: positionWithInterviewFlow.interviewFlow.description,
            interviewSteps: positionWithInterviewFlow.interviewFlow.interviewSteps.map(step => ({
                id: step.id,
                interviewFlowId: step.interviewFlowId,
                interviewTypeId: step.interviewTypeId,
                name: step.name,
                orderIndex: step.orderIndex
            }))
        }
    };
};

export const getAllPositionsService = async () => {
    try {
        return await prisma.position.findMany({
            where: { isVisible: true }
        });
    } catch (error) {
        console.error('Error retrieving all positions:', error);
        throw new Error('Error retrieving all positions');
    }
};

export const getPositionByIdService = async (positionId: number) => {
    try {
        const position = await Position.findOne(positionId);
        if (!position) {
            throw new Error('Position not found');
        }
        return position;
    } catch (error) {
        console.error('Error retrieving position by ID:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error retrieving position by ID');
    }
};

export const getCandidateNamesByPositionService = async (positionId: number) => {
    try {
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true
            }
        });

        return applications.map(app => ({
            candidateId: app.candidateId,
            fullName: `${app.candidate.firstName} ${app.candidate.lastName}`
        }));
    } catch (error) {
        console.error('Error retrieving candidate names by position:', error);
        throw new Error('Error retrieving candidate names by position');
    }
};

/**
 * Updates a position with the provided data
 * @param positionId - The ID of the position to update
 * @param updateData - The data to update the position with
 * @returns The updated position object
 * @throws Error if position not found, validation fails, or reference data is invalid
 */
export const updatePositionService = async (positionId: number, updateData: any) => {
    try {
        // Validate position ID
        if (!Number.isInteger(positionId) || positionId <= 0) {
            throw new Error('Invalid position ID');
        }

        // Fetch the position
        const position = await Position.findOne(positionId);
        if (!position) {
            throw new Error('Position not found');
        }

        // Validate the update data
        validatePositionUpdate(updateData);

        // Verify companyId exists if provided
        if (updateData.companyId !== undefined) {
            const company = await prisma.company.findUnique({
                where: { id: updateData.companyId }
            });
            if (!company) {
                throw new Error('Company not found');
            }
        }

        // Verify interviewFlowId exists if provided
        if (updateData.interviewFlowId !== undefined) {
            const interviewFlow = await prisma.interviewFlow.findUnique({
                where: { id: updateData.interviewFlowId }
            });
            if (!interviewFlow) {
                throw new Error('Interview flow not found');
            }
        }

        // Update position properties with provided data
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                (position as any)[key] = updateData[key];
            }
        });

        // Save the updated position
        const updatedPosition = await position.save();
        return updatedPosition;
    } catch (error) {
        console.error('Error updating position:', error);
        throw error;
    }
};
