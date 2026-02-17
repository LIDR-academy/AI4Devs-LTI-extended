import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

/**
 * Creates a new interview for a candidate
 * @param {number} candidateId - The ID of the candidate
 * @param {Object} interviewData - The interview data (applicationId, interviewStepId, employeeId, interviewDate, score, notes)
 * @returns {Promise<Object>} The created interview
 * @throws {Error} If the API call fails
 */
export const createInterview = async (candidateId, interviewData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/candidates/${candidateId}/interviews`,
            interviewData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to create interview';
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Network error: Could not connect to server');
        } else {
            // Something else happened
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
};

/**
 * Updates an existing interview for a candidate
 * @param {number} candidateId - The ID of the candidate
 * @param {number} interviewId - The ID of the interview to update
 * @param {Object} interviewData - The interview data to update (partial update, all fields optional)
 * @returns {Promise<Object>} The updated interview
 * @throws {Error} If the API call fails
 */
export const updateInterview = async (candidateId, interviewId, interviewData) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/candidates/${candidateId}/interviews/${interviewId}`,
            interviewData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to update interview';
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Network error: Could not connect to server');
        } else {
            // Something else happened
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
};

/**
 * Deletes an interview for a candidate
 * @param {number} candidateId - The ID of the candidate
 * @param {number} interviewId - The ID of the interview to delete
 * @param {string} reason - The reason for deletion (required)
 * @returns {Promise<Object>} The deletion response
 * @throws {Error} If the API call fails
 */
export const deleteInterview = async (candidateId, interviewId, reason) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/candidates/${candidateId}/interviews/${interviewId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    reason: reason
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to delete interview';
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Network error: Could not connect to server');
        } else {
            // Something else happened
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
};
