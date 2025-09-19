import { updateCandidateStage } from './candidateService';
import { Application } from '../../domain/models/Application';

// Mock the Application model
jest.mock('../../domain/models/Application', () => ({
  Application: {
    findOneByPositionCandidateId: jest.fn(),
  },
}));

// Mock the Application class instance
const mockApplicationInstance = {
  save: jest.fn(),
  id: 1,
  positionId: 1,
  candidateId: 1,
  currentInterviewStep: 1,
  applicationDate: new Date('2024-01-01'),
  notes: null,
};

describe('CandidateService - updateCandidateStage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCandidateStage', () => {
    describe('should_update_candidate_stage_successfully_when_valid_data_provided', () => {
      it('should update candidate stage and return updated application', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 2;
        const expectedApplication = {
          ...mockApplicationInstance,
          currentInterviewStep: newInterviewStep,
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplicationInstance);
        mockApplicationInstance.save.mockResolvedValue(expectedApplication);

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, newInterviewStep);

        // Assert
        expect(Application.findOneByPositionCandidateId).toHaveBeenCalledWith(applicationId, candidateId);
        expect(mockApplicationInstance.currentInterviewStep).toBe(newInterviewStep);
        expect(mockApplicationInstance.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedApplication);
      });

      it('should handle step progression from initial to final stage', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const initialStep = 1;
        const finalStep = 5;
        const mockApp = {
          ...mockApplicationInstance,
          currentInterviewStep: initialStep,
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApp);
        mockApp.save.mockResolvedValue({ ...mockApp, currentInterviewStep: finalStep });

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, finalStep);

        // Assert
        expect(mockApp.currentInterviewStep).toBe(finalStep);
        expect(result.currentInterviewStep).toBe(finalStep);
      });

      it('should handle step regression when needed', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const currentStep = 3;
        const previousStep = 2;
        const mockApp = {
          ...mockApplicationInstance,
          currentInterviewStep: currentStep,
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApp);
        mockApp.save.mockResolvedValue({ ...mockApp, currentInterviewStep: previousStep });

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, previousStep);

        // Assert
        expect(mockApp.currentInterviewStep).toBe(previousStep);
        expect(result.currentInterviewStep).toBe(previousStep);
      });
    });

    describe('should_throw_NotFoundError_when_application_does_not_exist', () => {
      it('should throw error when application not found', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 999;
        const newInterviewStep = 2;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Application not found');
        
        expect(Application.findOneByPositionCandidateId).toHaveBeenCalledWith(applicationId, candidateId);
        expect(mockApplicationInstance.save).not.toHaveBeenCalled();
      });

      it('should throw error when candidate does not exist', async () => {
        // Arrange
        const candidateId = 999;
        const applicationId = 1;
        const newInterviewStep = 2;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Application not found');
      });

      it('should throw error when application exists but candidate mismatch', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 2;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Application not found');
      });
    });

    describe('should_handle_database_errors_gracefully', () => {
      it('should throw error when save operation fails', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 2;
        const dbError = new Error('Database connection failed');

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplicationInstance);
        mockApplicationInstance.save.mockRejectedValue(dbError);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Database connection failed');
        
        expect(Application.findOneByPositionCandidateId).toHaveBeenCalledWith(applicationId, candidateId);
        expect(mockApplicationInstance.save).toHaveBeenCalledTimes(1);
      });

      it('should throw error when findOneByPositionCandidateId fails', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 2;
        const dbError = new Error('Database query failed');

        (Application.findOneByPositionCandidateId as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Database query failed');
        
        expect(Application.findOneByPositionCandidateId).toHaveBeenCalledWith(applicationId, candidateId);
        expect(mockApplicationInstance.save).not.toHaveBeenCalled();
      });
    });

    describe('should_validate_input_parameters', () => {
      it('should handle zero values correctly', async () => {
        // Arrange
        const candidateId = 0;
        const applicationId = 0;
        const newInterviewStep = 0;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Application not found');
      });

      it('should handle negative values correctly', async () => {
        // Arrange
        const candidateId = -1;
        const applicationId = -1;
        const newInterviewStep = -1;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Application not found');
      });

      it('should handle large numbers correctly', async () => {
        // Arrange
        const candidateId = 999999999;
        const applicationId = 999999999;
        const newInterviewStep = 999999999;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Application not found');
      });
    });

    describe('should_handle_edge_cases', () => {
      it('should handle same step update', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const sameStep = 2;
        const mockApp = {
          ...mockApplicationInstance,
          currentInterviewStep: sameStep,
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApp);
        mockApp.save.mockResolvedValue(mockApp);

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, sameStep);

        // Assert
        expect(mockApp.currentInterviewStep).toBe(sameStep);
        expect(result.currentInterviewStep).toBe(sameStep);
      });

      it('should handle application with notes', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 3;
        const mockAppWithNotes = {
          ...mockApplicationInstance,
          notes: 'Previous interview notes',
          currentInterviewStep: 2,
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockAppWithNotes);
        mockAppWithNotes.save.mockResolvedValue({ ...mockAppWithNotes, currentInterviewStep: newInterviewStep });

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, newInterviewStep);

        // Assert
        expect(result.notes).toBe('Previous interview notes');
        expect(result.currentInterviewStep).toBe(newInterviewStep);
      });

      it('should preserve application date during update', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 2;
        const originalDate = new Date('2024-01-15T10:30:00Z');
        const mockApp = {
          ...mockApplicationInstance,
          applicationDate: originalDate,
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApp);
        mockApp.save.mockResolvedValue({ ...mockApp, currentInterviewStep: newInterviewStep });

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, newInterviewStep);

        // Assert
        expect(result.applicationDate).toEqual(originalDate);
        expect(result.currentInterviewStep).toBe(newInterviewStep);
      });
    });

    describe('should_handle_concurrent_updates', () => {
      it('should handle multiple rapid updates', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const mockApp = { ...mockApplicationInstance };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApp);
        mockApp.save.mockResolvedValue(mockApp);

        // Act
        const promises = [
          updateCandidateStage(candidateId, applicationId, 2),
          updateCandidateStage(candidateId, applicationId, 3),
          updateCandidateStage(candidateId, applicationId, 4),
        ];

        const results = await Promise.allSettled(promises);

        // Assert
        expect(results).toHaveLength(3);
        expect(Application.findOneByPositionCandidateId).toHaveBeenCalledTimes(3);
        expect(mockApp.save).toHaveBeenCalledTimes(3);
      });
    });

    describe('should_validate_input_parameters_correctly', () => {
      it('should handle null candidateId', async () => {
        // Arrange
        const candidateId = null as any;
        const applicationId = 1;
        const newInterviewStep = 2;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Application not found');
      });

      it('should handle undefined applicationId', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = undefined as any;
        const newInterviewStep = 2;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Application not found');
      });

      it('should handle null currentInterviewStep', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = null as any;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplicationInstance);
        mockApplicationInstance.save.mockResolvedValue(mockApplicationInstance);

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, newInterviewStep);

        // Assert
        expect(mockApplicationInstance.currentInterviewStep).toBe(null);
        expect(result).toEqual(mockApplicationInstance);
      });

      it('should handle string numbers as parameters', async () => {
        // Arrange
        const candidateId = '1' as any;
        const applicationId = '1' as any;
        const newInterviewStep = '2' as any;

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplicationInstance);
        mockApplicationInstance.save.mockResolvedValue({ ...mockApplicationInstance, currentInterviewStep: 2 });

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, newInterviewStep);

        // Assert
        expect(Application.findOneByPositionCandidateId).toHaveBeenCalledWith('1', '1');
        expect(result.currentInterviewStep).toBe('2');
      });
    });

    describe('should_handle_application_properties_preservation', () => {
      it('should preserve all application properties except currentInterviewStep', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 3;
        const originalApplication = {
          id: 1,
          positionId: 5,
          candidateId: 10,
          currentInterviewStep: 1,
          applicationDate: new Date('2024-02-15T14:30:00Z'),
          notes: 'Initial application notes',
          createdAt: new Date('2024-02-15T14:30:00Z'),
          updatedAt: new Date('2024-02-15T14:30:00Z'),
        };

        const mockApplicationWithSave = {
          ...originalApplication,
          save: jest.fn().mockResolvedValue({
            ...originalApplication,
            currentInterviewStep: newInterviewStep,
          }),
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplicationWithSave);

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, newInterviewStep);

        // Assert
        expect(result.id).toBe(originalApplication.id);
        expect(result.positionId).toBe(originalApplication.positionId);
        expect(result.candidateId).toBe(originalApplication.candidateId);
        expect(result.applicationDate).toEqual(originalApplication.applicationDate);
        expect(result.notes).toBe(originalApplication.notes);
        expect(result.currentInterviewStep).toBe(newInterviewStep);
      });

      it('should handle application with null notes', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 2;
        const applicationWithNullNotes = {
          ...mockApplicationInstance,
          notes: null,
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(applicationWithNullNotes);
        applicationWithNullNotes.save = jest.fn().mockResolvedValue({
          ...applicationWithNullNotes,
          currentInterviewStep: newInterviewStep,
        });

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, newInterviewStep);

        // Assert
        expect(result.notes).toBeNull();
        expect(result.currentInterviewStep).toBe(newInterviewStep);
      });
    });

    describe('should_handle_database_connection_errors', () => {
      it('should handle Prisma connection timeout', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 2;
        const timeoutError = new Error('Connection timeout');

        (Application.findOneByPositionCandidateId as jest.Mock).mockRejectedValue(timeoutError);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Connection timeout');
      });

      it('should handle database transaction rollback', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const newInterviewStep = 2;
        const transactionError = new Error('Transaction rollback');

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplicationInstance);
        mockApplicationInstance.save.mockRejectedValue(transactionError);

        // Act & Assert
        await expect(updateCandidateStage(candidateId, applicationId, newInterviewStep))
          .rejects
          .toThrow('Transaction rollback');
      });
    });

    describe('should_handle_business_logic_validation', () => {
      it('should allow updating to step 0 (initial state)', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const initialStep = 0;
        const mockApp = {
          ...mockApplicationInstance,
          currentInterviewStep: 3,
        };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApp);
        mockApp.save.mockResolvedValue({ ...mockApp, currentInterviewStep: initialStep });

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, initialStep);

        // Assert
        expect(result.currentInterviewStep).toBe(initialStep);
      });

      it('should handle maximum step number', async () => {
        // Arrange
        const candidateId = 1;
        const applicationId = 1;
        const maxStep = 999;
        const mockApp = { ...mockApplicationInstance };

        (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApp);
        mockApp.save.mockResolvedValue({ ...mockApp, currentInterviewStep: maxStep });

        // Act
        const result = await updateCandidateStage(candidateId, applicationId, maxStep);

        // Assert
        expect(result.currentInterviewStep).toBe(maxStep);
      });
    });
  });
});