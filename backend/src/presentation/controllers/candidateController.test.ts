import { updateCandidateStageController } from './candidateController';
import { Request, Response } from 'express';
import { updateCandidateStage } from '../../application/services/candidateService';

jest.mock('../../application/services/candidateService');

describe('CandidateController - updateCandidateStageController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('should_update_candidate_stage_successfully_when_valid_data_provided', () => {
    it('should return 200 and updated candidate stage with valid data', async () => {
      // Arrange
      const mockUpdatedApplication = {
        id: 1,
        positionId: 1,
        candidateId: 1,
        currentInterviewStep: 2,
        applicationDate: new Date('2024-01-01'),
        notes: null,
      };

      mockRequest = {
        params: { id: '1' },
        body: { applicationId: '1', currentInterviewStep: '2' }
      };

      (updateCandidateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(updateCandidateStage).toHaveBeenCalledWith(1, 1, 2);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Candidate stage updated successfully',
        data: mockUpdatedApplication,
      });
    });
  });

  describe('should_return_400_when_invalid_application_id_format', () => {
    it('should return 400 when applicationId is not a number', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: 'invalid', currentInterviewStep: '2' }
      };

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid position ID format'
      });
      expect(updateCandidateStage).not.toHaveBeenCalled();
    });
  });

  describe('should_return_404_when_application_not_found', () => {
    it('should return 404 when service throws Application not found error', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: '999', currentInterviewStep: '2' }
      };

      (updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Application not found'));

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Application not found',
        error: 'Application not found'
      });
    });

    it('should return 404 when service throws wrapped Application not found error', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: '1', currentInterviewStep: '2' }
      };

      (updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Error: Application not found'));

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Application not found',
        error: 'Error: Application not found'
      });
    });
  });

  describe('should_handle_parameter_validation_errors', () => {
    it('should handle non-numeric candidate ID by passing NaN to service', async () => {
      // Arrange
      mockRequest = {
        params: { id: 'invalid' },
        body: { applicationId: '1', currentInterviewStep: '2' }
      };

      (updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Application not found'));

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(updateCandidateStage).toHaveBeenCalledWith(NaN, 1, 2);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Application not found',
        error: 'Application not found'
      });
    });

    it('should return 400 when currentInterviewStep is not numeric', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: '1', currentInterviewStep: 'invalid' }
      };

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid currentInterviewStep format' });
      expect(updateCandidateStage).not.toHaveBeenCalled();
    });

    it('should return 400 when applicationId is missing', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { currentInterviewStep: '2' }
      };

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid position ID format' });
    });

    it('should return 400 when currentInterviewStep is missing', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: '1' }
      };

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid currentInterviewStep format' });
    });

    it('should handle empty string parameters', async () => {
      // Arrange
      mockRequest = {
        params: { id: '' },
        body: { applicationId: '', currentInterviewStep: '' }
      };

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid position ID format' });
    });

    it('should handle null parameters', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: null, currentInterviewStep: null }
      };

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid position ID format' });
    });
  });

  describe('should_handle_general_service_errors', () => {
    it('should return 400 for general service errors', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: '1', currentInterviewStep: '2' }
      };

      (updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error updating candidate stage',
        error: 'Database connection failed'
      });
    });

    it('should return 500 for unknown error types', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: '1', currentInterviewStep: '2' }
      };

      (updateCandidateStage as jest.Mock).mockRejectedValue('Unknown error type');

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error updating candidate stage',
        error: 'Unknown error'
      });
    });

    it('should return 500 for null errors', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: { applicationId: '1', currentInterviewStep: '2' }
      };

      (updateCandidateStage as jest.Mock).mockRejectedValue(null);

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error updating candidate stage',
        error: 'Unknown error'
      });
    });
  });

  describe('should_handle_edge_cases', () => {
    it('should handle zero values correctly', async () => {
      // Arrange
      const mockUpdatedApplication = {
        id: 1,
        currentInterviewStep: 0,
      };

      mockRequest = {
        params: { id: '0' },
        body: { applicationId: '0', currentInterviewStep: '0' }
      };

      (updateCandidateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(updateCandidateStage).toHaveBeenCalledWith(0, 0, 0);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle negative numbers', async () => {
      // Arrange
      const mockUpdatedApplication = {
        id: 1,
        currentInterviewStep: -1,
      };

      mockRequest = {
        params: { id: '-1' },
        body: { applicationId: '-1', currentInterviewStep: '-1' }
      };

      (updateCandidateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(updateCandidateStage).toHaveBeenCalledWith(-1, -1, -1);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle very large numbers', async () => {
      // Arrange
      const mockUpdatedApplication = {
        id: 1,
        currentInterviewStep: 999999999,
      };

      mockRequest = {
        params: { id: '999999999' },
        body: { applicationId: '999999999', currentInterviewStep: '999999999' }
      };

      (updateCandidateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(updateCandidateStage).toHaveBeenCalledWith(999999999, 999999999, 999999999);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle decimal numbers by truncating', async () => {
      // Arrange
      const mockUpdatedApplication = {
        id: 1,
        currentInterviewStep: 3,
      };

      mockRequest = {
        params: { id: '1.5' },
        body: { applicationId: '2.7', currentInterviewStep: '3.9' }
      };

      (updateCandidateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(updateCandidateStage).toHaveBeenCalledWith(1, 2, 3);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('should_handle_request_structure_variations', () => {
    it('should handle request with additional body properties', async () => {
      // Arrange
      const mockUpdatedApplication = {
        id: 1,
        currentInterviewStep: 2,
      };

      mockRequest = {
        params: { id: '1' },
        body: { 
          applicationId: '1', 
          currentInterviewStep: '2',
          extraProperty: 'should be ignored',
          anotherProperty: 123
        }
      };

      (updateCandidateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(updateCandidateStage).toHaveBeenCalledWith(1, 1, 2);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle request with empty body', async () => {
      // Arrange
      mockRequest = {
        params: { id: '1' },
        body: {}
      };

      // Act
      await updateCandidateStageController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid position ID format' });
    });
  });
});