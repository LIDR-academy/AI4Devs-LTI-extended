import { Request, Response } from 'express';
import { updatePosition } from '../positionController';
import { updatePositionService } from '../../application/services/positionService';

jest.mock('../../application/services/positionService');

describe('updatePosition Controller', () => {
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

  describe('Successful cases', () => {
    it('should return 200 with updated position for valid data', async () => {
      const mockUpdateData = {
        title: 'Updated Senior Developer',
        description: 'Updated description',
        status: 'Open',
        location: 'Madrid, Spain',
        jobDescription: 'Updated job description'
      };

      const mockUpdatedPosition = {
        id: 1,
        title: 'Updated Senior Developer',
        status: 'Open',
        updatedAt: '2024-01-15T10:30:00Z'
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(1, mockUpdateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Position updated successfully',
        data: mockUpdatedPosition
      });
    });

    it('should handle partial updates correctly', async () => {
      const mockUpdateData = {
        status: 'Cerrado'
      };

      const mockUpdatedPosition = {
        id: 1,
        status: 'Cerrado'
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(1, mockUpdateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle salary updates correctly', async () => {
      const mockUpdateData = {
        salaryMin: 50000,
        salaryMax: 80000
      };

      const mockUpdatedPosition = {
        id: 1,
        salaryMin: 50000,
        salaryMax: 80000
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(1, mockUpdateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle boolean isVisible field correctly', async () => {
      const mockUpdateData = {
        isVisible: true
      };

      const mockUpdatedPosition = {
        id: 1,
        isVisible: true
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(1, mockUpdateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle applicationDeadline updates correctly', async () => {
      const mockUpdateData = {
        applicationDeadline: '2024-12-31T23:59:59Z'
      };

      const mockUpdatedPosition = {
        id: 1,
        applicationDeadline: '2024-12-31T23:59:59Z'
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(1, mockUpdateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('Validation error cases', () => {
    it('should return 400 for invalid position ID format', async () => {
      mockRequest = {
        params: { id: 'invalid' },
        body: { title: 'Test Title' }
      };

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid position ID format',
        error: 'Position ID must be a valid number'
      });
    });

    it('should return 400 when no data provided for update', async () => {
      mockRequest = {
        params: { id: '1' },
        body: {}
      };

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'No data provided for update',
        error: 'Request body cannot be empty'
      });
    });

    it('should return 400 when request body is null', async () => {
      mockRequest = {
        params: { id: '1' },
        body: null
      };

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'No data provided for update',
        error: 'Request body cannot be empty'
      });
    });

    it('should return 400 for validation errors from service', async () => {
      const mockUpdateData = {
        title: '' // Invalid empty title
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      const validationError = new Error('El título es obligatorio y debe ser una cadena válida');
      (updatePositionService as jest.Mock).mockRejectedValue(validationError);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'El título es obligatorio y debe ser una cadena válida'
      });
    });

    it('should return 400 for invalid status validation', async () => {
      const mockUpdateData = {
        status: 'InvalidStatus'
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      const validationError = new Error('Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador');
      (updatePositionService as jest.Mock).mockRejectedValue(validationError);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador'
      });
    });

    it('should return 400 for salary range validation error', async () => {
      const mockUpdateData = {
        salaryMin: 80000,
        salaryMax: 50000
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      const validationError = new Error('El salario mínimo no puede ser mayor que el máximo');
      (updatePositionService as jest.Mock).mockRejectedValue(validationError);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'El salario mínimo no puede ser mayor que el máximo'
      });
    });
  });

  describe('Not found error cases', () => {
    it('should return 404 when position not found', async () => {
      const mockUpdateData = {
        title: 'Updated Title'
      };

      mockRequest = {
        params: { id: '999' },
        body: mockUpdateData
      };

      const notFoundError = new Error('Position not found');
      (updatePositionService as jest.Mock).mockRejectedValue(notFoundError);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Position not found',
        error: 'Position not found'
      });
    });
  });

  describe('Reference validation error cases', () => {
    it('should return 400 when company not found', async () => {
      const mockUpdateData = {
        companyId: 999
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      const referenceError = new Error('Company not found');
      (updatePositionService as jest.Mock).mockRejectedValue(referenceError);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid reference data',
        error: 'Company not found'
      });
    });

    it('should return 400 when interview flow not found', async () => {
      const mockUpdateData = {
        interviewFlowId: 999
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      const referenceError = new Error('Interview flow not found');
      (updatePositionService as jest.Mock).mockRejectedValue(referenceError);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid reference data',
        error: 'Interview flow not found'
      });
    });
  });

  describe('Server error cases', () => {
    it('should return 500 for unexpected errors', async () => {
      const mockUpdateData = {
        title: 'Updated Title'
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      const serverError = new Error('Database connection failed');
      (updatePositionService as jest.Mock).mockRejectedValue(serverError);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error updating position',
        error: 'Database connection failed'
      });
    });

    it('should handle non-Error exceptions', async () => {
      const mockUpdateData = {
        title: 'Updated Title'
      };

      mockRequest = {
        params: { id: '1' },
        body: mockUpdateData
      };

      (updatePositionService as jest.Mock).mockRejectedValue('Unknown error');

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error updating position',
        error: 'Unknown error occurred'
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle negative position ID', async () => {
      mockRequest = {
        params: { id: '-1' },
        body: { title: 'Test Title' }
      };

      const mockUpdatedPosition = { id: -1 };
      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(-1, { title: 'Test Title' });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle zero position ID', async () => {
      mockRequest = {
        params: { id: '0' },
        body: { title: 'Test Title' }
      };

      const mockUpdatedPosition = { id: 0 };
      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(0, { title: 'Test Title' });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle large position ID', async () => {
      const largeId = '999999999';
      mockRequest = {
        params: { id: largeId },
        body: { title: 'Test Title' }
      };

      const mockUpdatedPosition = { id: 999999999 };
      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(999999999, { title: 'Test Title' });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle complex update data', async () => {
      const complexUpdateData = {
        title: 'Senior Full-Stack Developer',
        description: 'Comprehensive role description',
        status: 'Open',
        isVisible: true,
        location: 'Madrid, Spain',
        jobDescription: 'Detailed job requirements and expectations',
        requirements: 'Experience with React, Node.js, PostgreSQL',
        responsibilities: 'Lead development team, mentor junior developers',
        salaryMin: 60000,
        salaryMax: 90000,
        employmentType: 'Full-time',
        benefits: 'Health insurance, remote work, flexible hours',
        companyDescription: 'Leading tech company in Spain',
        applicationDeadline: '2024-12-31T23:59:59Z',
        contactInfo: 'hr@company.com',
        companyId: 1,
        interviewFlowId: 1
      };

      mockRequest = {
        params: { id: '1' },
        body: complexUpdateData
      };

      const mockUpdatedPosition = { id: 1, ...complexUpdateData };
      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response);

      expect(updatePositionService).toHaveBeenCalledWith(1, complexUpdateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Position updated successfully',
        data: mockUpdatedPosition
      });
    });
  });
}); 