import { getCandidatesByPosition, updatePosition } from './positionController';
import { Request, Response, NextFunction } from 'express';
import { getCandidatesByPositionService, updatePositionService } from '../../application/services/positionService';

jest.mock('../../application/services/positionService');

describe('getCandidatesByPosition', () => {
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

  describe('Casos exitosos', () => {
    it('debería retornar status 200 y datos de candidatos cuando existen aplicaciones', async () => {
      const mockCandidates = [
        { 
          fullName: 'John Doe', 
          currentInterviewStep: 'Technical Interview', 
          candidateId: 1,
          applicationId: 1,
          averageScore: 4 
        },
        { 
          fullName: 'Jane Smith', 
          currentInterviewStep: 'HR Interview', 
          candidateId: 2,
          applicationId: 2,
          averageScore: 4.5 
        }
      ];

      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue(mockCandidates);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockCandidates);
    });

    it('debería retornar status 200 y array vacío cuando no hay candidatos para la posición', async () => {
      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('debería convertir correctamente el parámetro id de string a number', async () => {
      mockRequest = { params: { id: '42' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(42);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar positionId igual a 0 correctamente', async () => {
      mockRequest = { params: { id: '0' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(0);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith([]);
    });
  });

  describe('Casos de error', () => {
    it('debería retornar status 500 cuando el servicio lanza un Error', async () => {
      const serviceError = new Error('Database connection failed');
      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockRejectedValue(serviceError);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error retrieving candidates',
        error: 'Database connection failed'
      });
    });

    it('debería retornar status 500 cuando el servicio lanza error de timeout', async () => {
      const timeoutError = new Error('Query timeout exceeded');
      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockRejectedValue(timeoutError);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error retrieving candidates',
        error: 'Query timeout exceeded'
      });
    });

    it('debería retornar status 500 cuando el servicio lanza error de validación', async () => {
      const validationError = new Error('Invalid position ID');
      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockRejectedValue(validationError);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error retrieving candidates',
        error: 'Invalid position ID'
      });
    });

    it('debería manejar errores que no son instancia de Error', async () => {
      const unknownError = 'Unknown error occurred';
      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockRejectedValue(unknownError);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error retrieving candidates',
        error: 'Unknown error occurred'
      });
    });

    it('debería manejar errores cuando el error es null', async () => {
      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockRejectedValue(null);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error retrieving candidates',
        error: 'null'
      });
    });

    it('debería manejar errores cuando el error es undefined', async () => {
      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockRejectedValue(undefined);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error retrieving candidates',
        error: 'undefined'
      });
    });
  });

  describe('Casos límite', () => {
    it('debería manejar ID que se convierte a NaN', async () => {
      mockRequest = { params: { id: 'invalid' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(NaN);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar ID negativo', async () => {
      mockRequest = { params: { id: '-1' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(-1);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar ID decimal (se convierte a entero)', async () => {
      mockRequest = { params: { id: '3.14' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(3);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar ID muy grande', async () => {
      const largeId = '999999999999999';
      mockRequest = { params: { id: largeId } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(999999999999999);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar ID con espacios en blanco', async () => {
      mockRequest = { params: { id: '  42  ' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(42);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar ID que comienza con ceros', async () => {
      mockRequest = { params: { id: '007' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(7);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar parámetros missing (undefined)', async () => {
      mockRequest = { params: {} };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(NaN);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('debería manejar respuesta del servicio con datos complejos', async () => {
      const complexCandidates = [
        { 
          fullName: 'José María García-López', 
          currentInterviewStep: 'Final Technical Interview & Code Review', 
          candidateId: 123456,
          applicationId: 789012,
          averageScore: 4.666666666666667 
        }
      ];

      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue(complexCandidates);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(complexCandidates);
    });
  });

  describe('Validaciones de estructura', () => {
    it('debería llamar al servicio exactamente una vez por request', async () => {
      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledTimes(1);
    });

    it('debería retornar el resultado del servicio sin modificaciones', async () => {
      const serviceResult = [
        { 
          fullName: 'Test Candidate', 
          currentInterviewStep: 'Test Step',
          candidateId: 1,
          applicationId: 1,
          averageScore: 3.5,
          extraField: 'should be preserved'
        }
      ];

      mockRequest = { params: { id: '1' } };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue(serviceResult);

      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(serviceResult);
    });
  });
});

describe('PositionController - updatePosition', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    mockNext = jest.fn();
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('should_update_position_successfully_when_valid_data_provided', () => {
    it('should return 200 and updated position when valid data provided', async () => {
      // Arrange
      const mockUpdatedPosition = {
        id: 1,
        title: 'Senior Developer',
        description: 'Updated description',
        status: 'Open',
        location: 'Madrid',
        jobDescription: 'Updated job description',
        companyId: 1,
        interviewFlowId: 1,
        isVisible: true,
        salaryMin: 50000,
        salaryMax: 70000
      };

      mockRequest = {
        params: { id: '1' },
        body: {
          title: 'Senior Developer',
          description: 'Updated description',
          status: 'Open'
        }
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      // Act
      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(updatePositionService).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Position updated successfully',
        data: mockUpdatedPosition
      });
    });

    it('should return 200 when updating status only (partial update)', async () => {
      const mockUpdatedPosition = {
        id: 1,
        title: 'Existing Title',
        status: 'Contratado'
      };

      mockRequest = {
        params: { id: '1' },
        body: { status: 'Contratado' }
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(updatePositionService).toHaveBeenCalledWith(1, { status: 'Contratado' });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should return 200 when updating salary range', async () => {
      const mockUpdatedPosition = {
        id: 1,
        salaryMin: 40000,
        salaryMax: 60000
      };

      mockRequest = {
        params: { id: '1' },
        body: { salaryMin: 40000, salaryMax: 60000 }
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(updatePositionService).toHaveBeenCalledWith(1, { salaryMin: 40000, salaryMax: 60000 });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should return 200 when updating isVisible field', async () => {
      const mockUpdatedPosition = {
        id: 1,
        isVisible: true
      };

      mockRequest = {
        params: { id: '1' },
        body: { isVisible: true }
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(updatePositionService).toHaveBeenCalledWith(1, { isVisible: true });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should return 200 when updating applicationDeadline with future date', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const mockUpdatedPosition = {
        id: 1,
        applicationDeadline: futureDate
      };

      mockRequest = {
        params: { id: '1' },
        body: { applicationDeadline: futureDate }
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(updatePositionService).toHaveBeenCalledWith(1, { applicationDeadline: futureDate });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should return 200 when updating multiple fields simultaneously', async () => {
      const mockUpdatedPosition = {
        id: 1,
        title: 'Full Stack Developer',
        description: 'New description',
        location: 'Barcelona',
        status: 'Open',
        isVisible: true,
        salaryMin: 45000,
        salaryMax: 65000,
        employmentType: 'Full-time'
      };

      mockRequest = {
        params: { id: '1' },
        body: {
          title: 'Full Stack Developer',
          description: 'New description',
          location: 'Barcelona',
          status: 'Open',
          isVisible: true,
          salaryMin: 45000,
          salaryMax: 65000,
          employmentType: 'Full-time'
        }
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(updatePositionService).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Position updated successfully',
        data: mockUpdatedPosition
      });
    });
  });

  describe('should_return_validation_error_when_invalid_data_provided', () => {
    it('should return 400 when position ID format is invalid (non-numeric)', async () => {
      mockRequest = {
        params: { id: 'abc' },
        body: { title: 'Test' }
      };

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid position ID format',
        error: 'Position ID must be a valid number'
      });
      expect(updatePositionService).not.toHaveBeenCalled();
    });

    it('should return 400 when position ID is negative', async () => {
      mockRequest = {
        params: { id: '-1' },
        body: { title: 'Test' }
      };

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid position ID format',
        error: 'Position ID must be a valid number'
      });
    });

    it('should return 400 when position ID is zero', async () => {
      mockRequest = {
        params: { id: '0' },
        body: { title: 'Test' }
      };

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid position ID format',
        error: 'Position ID must be a valid number'
      });
    });

    it('should return 400 when request body is empty object', async () => {
      mockRequest = {
        params: { id: '1' },
        body: {}
      };

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

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

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'No data provided for update',
        error: 'Request body cannot be empty'
      });
    });

    it('should return 400 when title is empty', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { title: '' }
      };

      (updatePositionService as jest.Mock).mockRejectedValue(
        new Error('El título es obligatorio y debe ser una cadena válida')
      );

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'El título es obligatorio y debe ser una cadena válida'
      });
    });

    it('should return 400 when status is invalid', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { status: 'InvalidStatus' }
      };

      (updatePositionService as jest.Mock).mockRejectedValue(
        new Error('Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador')
      );

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'Estado inválido. Debe ser uno de: Open, Contratado, Cerrado, Borrador'
      });
    });

    it('should return 400 when salaryMin is greater than salaryMax', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { salaryMin: 70000, salaryMax: 50000 }
      };

      (updatePositionService as jest.Mock).mockRejectedValue(
        new Error('El salario mínimo no puede ser mayor que el máximo')
      );

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'El salario mínimo no puede ser mayor que el máximo'
      });
    });

    it('should return 400 when applicationDeadline is in the past', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { applicationDeadline: '2020-01-01' }
      };

      (updatePositionService as jest.Mock).mockRejectedValue(
        new Error('La fecha límite no puede ser anterior a hoy')
      );

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'La fecha límite no puede ser anterior a hoy'
      });
    });
  });

  describe('should_return_not_found_when_position_does_not_exist', () => {
    it('should return 404 when position not found', async () => {
      mockRequest = {
        params: { id: '999' },
        body: { title: 'Test' }
      };

      (updatePositionService as jest.Mock).mockRejectedValue(
        new Error('Position not found')
      );

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Position not found',
        error: 'Position not found'
      });
    });
  });

  describe('should_return_error_when_invalid_reference_data', () => {
    it('should return 400 when company not found', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { companyId: 999 }
      };

      (updatePositionService as jest.Mock).mockRejectedValue(
        new Error('Invalid reference data')
      );

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid reference data',
        error: 'Invalid reference data'
      });
    });

    it('should return 400 when interview flow not found', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { interviewFlowId: 999 }
      };

      (updatePositionService as jest.Mock).mockRejectedValue(
        new Error('Invalid reference data')
      );

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid reference data',
        error: 'Invalid reference data'
      });
    });
  });

  describe('should_return_server_error_when_unexpected_errors', () => {
    it('should return 500 when unexpected error occurs', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { title: 'Test' }
      };

      (updatePositionService as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error updating position',
        error: 'Database error'
      });
    });

    it('should return 500 when non-Error exception is thrown', async () => {
      mockRequest = {
        params: { id: '1' },
        body: { title: 'Test' }
      };

      (updatePositionService as jest.Mock).mockRejectedValue('String error');

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error updating position',
        error: 'String error'
      });
    });
  });

  describe('should_handle_edge_cases', () => {
    it('should handle very large position ID', async () => {
      const mockUpdatedPosition = { id: 999999999, title: 'Test' };

      mockRequest = {
        params: { id: '999999999' },
        body: { title: 'Test' }
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(updatePositionService).toHaveBeenCalledWith(999999999, mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle complex update data with all fields', async () => {
      const complexUpdateData = {
        title: 'Complex Position',
        description: 'Complex description',
        location: 'Complex location',
        jobDescription: 'Complex job description',
        status: 'Open',
        isVisible: true,
        companyId: 1,
        interviewFlowId: 1,
        salaryMin: 30000,
        salaryMax: 50000,
        employmentType: 'Full-time',
        requirements: 'Complex requirements',
        responsibilities: 'Complex responsibilities',
        benefits: 'Complex benefits',
        companyDescription: 'Complex company description',
        contactInfo: 'Complex contact info',
        applicationDeadline: new Date(Date.now() + 86400000).toISOString()
      };

      const mockUpdatedPosition = { id: 1, ...complexUpdateData };

      mockRequest = {
        params: { id: '1' },
        body: complexUpdateData
      };

      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(updatePositionService).toHaveBeenCalledWith(1, complexUpdateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Position updated successfully',
        data: mockUpdatedPosition
      });
    });

    it('should not include undefined fields in update', async () => {
      const updateData = {
        title: 'Test',
        description: undefined
      };

      mockRequest = {
        params: { id: '1' },
        body: updateData
      };

      const mockUpdatedPosition = { id: 1, title: 'Test' };
      (updatePositionService as jest.Mock).mockResolvedValue(mockUpdatedPosition);

      await updatePosition(mockRequest as Request, mockResponse as Response, mockNext);

      expect(updatePositionService).toHaveBeenCalledWith(1, updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });
});