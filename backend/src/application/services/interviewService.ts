import { Candidate } from '../../domain/models/Candidate';
import { Application } from '../../domain/models/Application';
import { Position } from '../../domain/models/Position';
import { InterviewStep } from '../../domain/models/InterviewStep';
import { Employee } from '../../domain/models/Employee';
import { Interview } from '../../domain/models/Interview';

/**
 * Updates an existing interview for a candidate
 * @param candidateId - The ID of the candidate (from URL path)
 * @param interviewId - The ID of the interview to update
 * @param interviewData - The interview data to update (partial update, all fields optional)
 * @returns The updated interview
 * @throws Error if validation fails or resources are not found
 */
export const updateInterview = async (candidateId: number, interviewId: number, interviewData: any): Promise<Interview> => {
    // Validate interview exists
    const interview = await Interview.findOne(interviewId);
    if (!interview) {
        throw new Error('Interview not found');
    }

    // Validate interview belongs to candidate
    const application = await Application.findOne(interview.applicationId);
    if (!application) {
        throw new Error('Application not found');
    }

    if (application.candidateId !== candidateId) {
        throw new Error('Interview does not belong to the specified candidate');
    }

    // Conditional validation for interviewStepId if provided
    if (interviewData.interviewStepId !== undefined && interviewData.interviewStepId !== null) {
        // Get position to check interview flow
        const position = await Position.findOne(application.positionId);
        if (!position) {
            throw new Error('Position not found');
        }

        // Validate interview step exists
        const interviewStep = await InterviewStep.findOne(interviewData.interviewStepId);
        if (!interviewStep) {
            throw new Error('Interview step not found');
        }

        // Validate interview step belongs to position's interview flow
        if (interviewStep.interviewFlowId !== position.interviewFlowId) {
            throw new Error('Interview step does not belong to the position\'s interview flow');
        }
    }

    // Conditional validation for employeeId if provided
    if (interviewData.employeeId !== undefined && interviewData.employeeId !== null) {
        // Validate employee exists
        const employee = await Employee.findOne(interviewData.employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        // Validate employee is active
        if (!employee.isActive) {
            throw new Error('Employee is not active');
        }
    }

    // Create updated interview using domain model with existing interview data merged with updates
    const updatedInterview = new Interview({
        id: interview.id,
        applicationId: interview.applicationId, // Immutable
        interviewStepId: interviewData.interviewStepId !== undefined ? interviewData.interviewStepId : interview.interviewStepId,
        employeeId: interviewData.employeeId !== undefined ? interviewData.employeeId : interview.employeeId,
        interviewDate: interviewData.interviewDate !== undefined ? interviewData.interviewDate : interview.interviewDate,
        result: interviewData.result !== undefined ? interviewData.result : interview.result,
        score: interviewData.score !== undefined ? interviewData.score : interview.score,
        notes: interviewData.notes !== undefined ? interviewData.notes : interview.notes,
    });

    // Save interview (leverages existing update logic in Interview.save() when id is present)
    try {
        const savedInterview = await updatedInterview.save();
        // Return the saved interview data as an Interview instance
        const result = new Interview(savedInterview);
        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update interview');
    }
};

/**
 * Creates a new interview for a candidate's application
 * @param candidateId - The ID of the candidate (from URL path)
 * @param interviewData - The interview data to create
 * @returns The created interview
 * @throws Error if validation fails or resources are not found
 */
export const createInterview = async (candidateId: number, interviewData: any): Promise<Interview> => {
    // Validate candidate exists
    const candidate = await Candidate.findOne(candidateId);
    if (!candidate) {
        throw new Error('Candidate not found');
    }

    // Validate application exists and belongs to candidate
    const application = await Application.findOne(interviewData.applicationId);
    if (!application) {
        throw new Error('Application not found');
    }
    if (application.candidateId !== candidateId) {
        throw new Error('Application does not belong to the specified candidate');
    }

    // Validate position for interview step flow check
    const position = await Position.findOne(application.positionId);
    if (!position) {
        throw new Error('Position not found');
    }

    // Validate interview step exists and belongs to position's flow
    const interviewStep = await InterviewStep.findOne(interviewData.interviewStepId);
    if (!interviewStep) {
        throw new Error('Interview step not found');
    }
    if (interviewStep.interviewFlowId !== position.interviewFlowId) {
        throw new Error('Interview step does not belong to the position\'s interview flow');
    }

    // Validate employee exists and is active
    const employee = await Employee.findOne(interviewData.employeeId);
    if (!employee) {
        throw new Error('Employee not found');
    }
    if (!employee.isActive) {
        throw new Error('Employee is not active');
    }

    // Default result to Pending when omitted
    const result = interviewData.result ?? 'Pending';

    // Construct Interview without id (triggers insert in save())
    const newInterview = new Interview({
        applicationId: interviewData.applicationId,
        interviewStepId: interviewData.interviewStepId,
        employeeId: interviewData.employeeId,
        interviewDate: interviewData.interviewDate,
        result,
        score: interviewData.score,
        notes: interviewData.notes,
    });

    // Save (insert path since id is absent)
    try {
        const savedInterview = await newInterview.save();
        return new Interview(savedInterview);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to create interview');
    }
};

/**
 * Deletes an interview for a candidate
 * @param candidateId - The ID of the candidate (from URL path)
 * @param interviewId - The ID of the interview to delete
 * @param deletionData - The deletion data containing reason
 * @throws Error if validation fails, interview is completed, or resources are not found
 */
export const deleteInterview = async (candidateId: number, interviewId: number, deletionData: any): Promise<void> => {
    // Validate candidate exists
    const candidate = await Candidate.findOne(candidateId);
    if (!candidate) {
        throw new Error('Candidate not found');
    }

    // Validate interview exists
    const interview = await Interview.findOne(interviewId);
    if (!interview) {
        throw new Error('Interview not found');
    }

    // Validate interview belongs to candidate
    const application = await Application.findOne(interview.applicationId);
    if (!application) {
        throw new Error('Application not found');
    }

    if (application.candidateId !== candidateId) {
        throw new Error('Interview does not belong to the specified candidate');
    }

    // Business rule: Prevent deletion of completed interviews
    if (interview.result === 'Passed' || interview.result === 'Failed') {
        throw new Error('Completed interviews cannot be deleted');
    }

    // Delete interview
    try {
        await Interview.delete(interviewId);
        
        // Log deletion for audit trail
        console.log(`Interview deleted: ID=${interviewId}, CandidateID=${candidateId}, Reason=${deletionData.reason}, Timestamp=${new Date().toISOString()}`);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete interview');
    }
};
