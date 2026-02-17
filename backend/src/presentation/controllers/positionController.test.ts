import { getCandidatesByPosition, updatePosition } from './positionController';
import { Request, Response } from 'express';
import { getCandidatesByPositionService, updatePositionService } from '../../application/services/positionService';
import { validatePositionUpdateData } from '../../application/validator';

jest.mock('../../application/services/positionService');
jest.mock('../../application/validator');

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

describe('updatePosition', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    mockResponse = { status: mockStatus, json: mockJson };
  });

  it('should return 200 and updated position on successful update', async () => {
    const updatedPosition = { id: 1, title: 'Updated Title', description: 'Desc', status: 'Open' };
    mockRequest = { params: { id: '1' }, body: { title: 'Updated Title' } };
    (validatePositionUpdateData as jest.Mock).mockImplementation(() => {});
    (updatePositionService as jest.Mock).mockResolvedValue(updatedPosition);

    await updatePosition(mockRequest as Request, mockResponse as Response);

    expect(validatePositionUpdateData).toHaveBeenCalledWith({ title: 'Updated Title' });
    expect(updatePositionService).toHaveBeenCalledWith(1, { title: 'Updated Title' });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(updatedPosition);
  });

  it('should return 400 when position ID is invalid', async () => {
    mockRequest = { params: { id: 'invalid' }, body: { title: 'Test' } };

    await updatePosition(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Invalid position ID format',
      error: 'Position ID must be a valid number',
    });
    expect(updatePositionService).not.toHaveBeenCalled();
  });

  it('should return 400 when validation fails', async () => {
    mockRequest = { params: { id: '1' }, body: { title: '' } };
    (validatePositionUpdateData as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid title');
    });

    await updatePosition(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Validation error', error: 'Invalid title' });
    expect(updatePositionService).not.toHaveBeenCalled();
  });

  it('should return 404 when position is not found', async () => {
    mockRequest = { params: { id: '99999' }, body: { title: 'Test' } };
    (validatePositionUpdateData as jest.Mock).mockImplementation(() => {});
    (updatePositionService as jest.Mock).mockRejectedValue(new Error('Position not found'));

    await updatePosition(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Position not found',
      error: 'Position not found',
    });
  });

  it('should return 500 on server error', async () => {
    mockRequest = { params: { id: '1' }, body: { title: 'Test' } };
    (validatePositionUpdateData as jest.Mock).mockImplementation(() => {});
    (updatePositionService as jest.Mock).mockRejectedValue(new Error('Database error'));

    await updatePosition(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Error updating position',
      error: 'Database error',
    });
  });
});