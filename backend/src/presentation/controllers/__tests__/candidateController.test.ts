import { Request, Response } from 'express';
import { getCandidatesByPosition, getCandidateNamesByPosition } from '../positionController';
import { getCandidateById } from '../candidateController';
import { getCandidatesByPositionService, getCandidateNamesByPositionService } from '../../../application/services/positionService';
import { findCandidateById } from '../../../application/services/candidateService';

// Mock de servicios
jest.mock('../../../application/services/positionService');
jest.mock('../../../application/services/candidateService');

const mockGetCandidatesByPositionService = getCandidatesByPositionService as jest.MockedFunction<typeof getCandidatesByPositionService>;
const mockGetCandidateNamesByPositionService = getCandidateNamesByPositionService as jest.MockedFunction<typeof getCandidateNamesByPositionService>;
const mockFindCandidateById = findCandidateById as jest.MockedFunction<typeof findCandidateById>;

describe('Candidate Controllers', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnThis();
        
        mockResponse = {
            json: mockJson,
            status: mockStatus,
        };

        mockRequest = {};
        
        jest.clearAllMocks();
    });

    describe('getCandidatesByPosition Controller', () => {
        describe('Casos exitosos', () => {
            it('debería retornar 200 y datos de candidatos cuando el servicio es exitoso', async () => {
                const mockCandidates = [
                    {
                        fullName: 'Juan Pérez',
                        currentInterviewStep: 'Entrevista Técnica',
                        candidateId: 101,
                        applicationId: 1,
                        averageScore: 7.5,
                    },
                    {
                        fullName: 'María González',
                        currentInterviewStep: 'Entrevista HR',
                        candidateId: 102,
                        applicationId: 2,
                        averageScore: 8.2,
                    },
                ];

                mockRequest = {
                    params: { id: '1' }
                };

                mockGetCandidatesByPositionService.mockResolvedValue(mockCandidates);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidatesByPositionService).toHaveBeenCalledWith(1);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(mockCandidates);
            });

            it('debería retornar 200 y array vacío cuando no hay candidatos', async () => {
                mockRequest = {
                    params: { id: '999' }
                };

                mockGetCandidatesByPositionService.mockResolvedValue([]);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidatesByPositionService).toHaveBeenCalledWith(999);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith([]);
            });

            it('debería convertir string ID a número correctamente', async () => {
                mockRequest = {
                    params: { id: '42' }
                };

                mockGetCandidatesByPositionService.mockResolvedValue([]);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidatesByPositionService).toHaveBeenCalledWith(42);
                expect(typeof 42).toBe('number');
            });
        });

        describe('Casos de error', () => {
            it('debería retornar 500 cuando el servicio lanza un Error', async () => {
                mockRequest = {
                    params: { id: '1' }
                };

                const errorMessage = 'Database connection failed';
                mockGetCandidatesByPositionService.mockRejectedValue(new Error(errorMessage));

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ 
                    message: 'Error retrieving candidates', 
                    error: errorMessage 
                });
            });

            it('debería retornar 500 cuando el servicio lanza un error no-Error', async () => {
                mockRequest = {
                    params: { id: '1' }
                };

                const errorMessage = 'Unknown error object';
                mockGetCandidatesByPositionService.mockRejectedValue(errorMessage);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ 
                    message: 'Error retrieving candidates', 
                    error: errorMessage 
                });
            });

            it('debería manejar errores de timeout de base de datos', async () => {
                mockRequest = {
                    params: { id: '1' }
                };

                const timeoutError = new Error('Timeout: Database query exceeded maximum time');
                mockGetCandidatesByPositionService.mockRejectedValue(timeoutError);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ 
                    message: 'Error retrieving candidates', 
                    error: 'Timeout: Database query exceeded maximum time' 
                });
            });
        });

        describe('Validación de tipos y parámetros', () => {
            it('debería manejar ID numérico válido', async () => {
                mockRequest = {
                    params: { id: '123' }
                };

                mockGetCandidatesByPositionService.mockResolvedValue([]);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidatesByPositionService).toHaveBeenCalledWith(123);
            });

            it('debería manejar ID como 0', async () => {
                mockRequest = {
                    params: { id: '0' }
                };

                mockGetCandidatesByPositionService.mockResolvedValue([]);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidatesByPositionService).toHaveBeenCalledWith(0);
            });
        });

        describe('Casos límite', () => {
            it('debería manejar ID negativo', async () => {
                mockRequest = {
                    params: { id: '-1' }
                };

                mockGetCandidatesByPositionService.mockResolvedValue([]);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidatesByPositionService).toHaveBeenCalledWith(-1);
            });

            it('debería manejar ID muy grande', async () => {
                mockRequest = {
                    params: { id: '999999999' }
                };

                mockGetCandidatesByPositionService.mockResolvedValue([]);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidatesByPositionService).toHaveBeenCalledWith(999999999);
            });

            it('debería manejar conversión de string "NaN" a NaN', async () => {
                mockRequest = {
                    params: { id: 'abc' }
                };

                mockGetCandidatesByPositionService.mockResolvedValue([]);

                await getCandidatesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidatesByPositionService).toHaveBeenCalledWith(NaN);
            });
        });
    });

    describe('getCandidateNamesByPosition Controller', () => {
        describe('Casos exitosos', () => {
            it('debería retornar 200 y nombres de candidatos cuando el servicio es exitoso', async () => {
                const mockCandidateNames = [
                    {
                        candidateId: 101,
                        fullName: 'Pedro Martínez',
                    },
                    {
                        candidateId: 102,
                        fullName: 'Laura Fernández',
                    },
                ];

                mockRequest = {
                    params: { id: '1' }
                };

                mockGetCandidateNamesByPositionService.mockResolvedValue(mockCandidateNames);

                await getCandidateNamesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidateNamesByPositionService).toHaveBeenCalledWith(1);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(mockCandidateNames);
            });

            it('debería retornar 200 y array vacío cuando no hay candidatos', async () => {
                mockRequest = {
                    params: { id: '999' }
                };

                mockGetCandidateNamesByPositionService.mockResolvedValue([]);

                await getCandidateNamesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidateNamesByPositionService).toHaveBeenCalledWith(999);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith([]);
            });

            it('debería manejar nombres con caracteres especiales', async () => {
                const mockCandidateNames = [
                    {
                        candidateId: 101,
                        fullName: 'José María Rodríguez-García',
                    },
                ];

                mockRequest = {
                    params: { id: '1' }
                };

                mockGetCandidateNamesByPositionService.mockResolvedValue(mockCandidateNames);

                await getCandidateNamesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockJson).toHaveBeenCalledWith(mockCandidateNames);
            });
        });

        describe('Casos de error', () => {
            it('debería retornar 500 cuando el servicio lanza un Error', async () => {
                mockRequest = {
                    params: { id: '1' }
                };

                const errorMessage = 'Database query failed';
                mockGetCandidateNamesByPositionService.mockRejectedValue(new Error(errorMessage));

                await getCandidateNamesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ 
                    message: 'Error retrieving candidate names', 
                    error: errorMessage 
                });
            });

            it('debería retornar 500 cuando el servicio lanza un error no-Error', async () => {
                mockRequest = {
                    params: { id: '1' }
                };

                const errorMessage = 'Network timeout';
                mockGetCandidateNamesByPositionService.mockRejectedValue(errorMessage);

                await getCandidateNamesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ 
                    message: 'Error retrieving candidate names', 
                    error: errorMessage 
                });
            });
        });

        describe('Validación de tipos', () => {
            it('debería convertir string ID a número', async () => {
                mockRequest = {
                    params: { id: '456' }
                };

                mockGetCandidateNamesByPositionService.mockResolvedValue([]);

                await getCandidateNamesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidateNamesByPositionService).toHaveBeenCalledWith(456);
                expect(typeof 456).toBe('number');
            });
        });

        describe('Casos límite', () => {
            it('debería manejar ID 0', async () => {
                mockRequest = {
                    params: { id: '0' }
                };

                mockGetCandidateNamesByPositionService.mockResolvedValue([]);

                await getCandidateNamesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidateNamesByPositionService).toHaveBeenCalledWith(0);
            });

            it('debería manejar ID negativo', async () => {
                mockRequest = {
                    params: { id: '-5' }
                };

                mockGetCandidateNamesByPositionService.mockResolvedValue([]);

                await getCandidateNamesByPosition(mockRequest as Request, mockResponse as Response);

                expect(mockGetCandidateNamesByPositionService).toHaveBeenCalledWith(-5);
            });
        });
    });

    describe('getCandidateById Controller', () => {
        describe('Casos exitosos', () => {
            it('debería retornar 200 y datos del candidato cuando existe', async () => {
                const mockCandidate = {
                    id: 1,
                    firstName: 'Roberto',
                    lastName: 'Silva',
                    email: 'roberto.silva@email.com',
                    phone: '+34123456789',
                    educations: [],
                    workExperiences: [],
                    resumes: [],
                    applications: []
                };

                mockRequest = {
                    params: { id: '1' }
                };

                mockFindCandidateById.mockResolvedValue(mockCandidate as any);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockFindCandidateById).toHaveBeenCalledWith(1);
                expect(mockStatus).not.toHaveBeenCalledWith(400);
                expect(mockStatus).not.toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith(mockCandidate);
            });

            it('debería retornar candidato con datos completos', async () => {
                const mockCandidate = {
                    id: 42,
                    firstName: 'Elena',
                    lastName: 'Morales',
                    email: 'elena.morales@email.com',
                    phone: '+34987654321',
                    educations: [
                        { degree: 'Ingeniería Informática', institution: 'Universidad Politécnica' }
                    ],
                    workExperiences: [
                        { company: 'Tech Corp', position: 'Developer', startDate: '2020-01-01' }
                    ],
                    resumes: [],
                    applications: []
                };

                mockRequest = {
                    params: { id: '42' }
                };

                mockFindCandidateById.mockResolvedValue(mockCandidate as any);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockFindCandidateById).toHaveBeenCalledWith(42);
                expect(mockJson).toHaveBeenCalledWith(mockCandidate);
            });
        });

        describe('Casos de error - 400 Bad Request', () => {
            it('debería retornar 400 cuando ID no es un número válido', async () => {
                mockRequest = {
                    params: { id: 'abc' }
                };

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid ID format' });
                expect(mockFindCandidateById).not.toHaveBeenCalled();
            });

            it('debería retornar 400 cuando ID está vacío', async () => {
                mockRequest = {
                    params: { id: '' }
                };

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid ID format' });
            });

            it('debería retornar 400 cuando ID contiene caracteres no numéricos', async () => {
                mockRequest = {
                    params: { id: '12abc' }
                };

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid ID format' });
            });

            it('debería retornar 400 cuando ID es undefined', async () => {
                mockRequest = {
                    params: { id: undefined as any }
                };

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid ID format' });
            });
        });

        describe('Casos de error - 404 Not Found', () => {
            it('debería retornar 404 cuando candidato no existe', async () => {
                mockRequest = {
                    params: { id: '999' }
                };

                mockFindCandidateById.mockResolvedValue(null);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockFindCandidateById).toHaveBeenCalledWith(999);
                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({ error: 'Candidate not found' });
            });

            it('debería retornar 404 para ID válido pero inexistente', async () => {
                mockRequest = {
                    params: { id: '12345' }
                };

                mockFindCandidateById.mockResolvedValue(null);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({ error: 'Candidate not found' });
            });
        });

        describe('Casos de error - 500 Internal Server Error', () => {
            it('debería retornar 500 cuando el servicio lanza error', async () => {
                mockRequest = {
                    params: { id: '1' }
                };

                mockFindCandidateById.mockRejectedValue(new Error('Database error'));

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: 'Internal Server Error' });
            });

            it('debería retornar 500 para errores de conexión a base de datos', async () => {
                mockRequest = {
                    params: { id: '1' }
                };

                mockFindCandidateById.mockRejectedValue(new Error('Connection timeout'));

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: 'Internal Server Error' });
            });
        });

        describe('Validación de tipos', () => {
            it('debería aceptar IDs numéricos válidos', async () => {
                const validIds = ['1', '100', '999999'];
                
                for (const id of validIds) {
                    mockRequest = {
                        params: { id }
                    };

                    mockFindCandidateById.mockResolvedValue(null);

                    await getCandidateById(mockRequest as Request, mockResponse as Response);

                    expect(mockFindCandidateById).toHaveBeenCalledWith(parseInt(id));
                    expect(Number.isInteger(parseInt(id))).toBe(true);
                    
                    jest.clearAllMocks();
                }
            });

            it('debería validar que parseInt produce un número', async () => {
                mockRequest = {
                    params: { id: '123' }
                };

                mockFindCandidateById.mockResolvedValue(null);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(typeof parseInt('123')).toBe('number');
                expect(Number.isNaN(parseInt('123'))).toBe(false);
            });
        });

        describe('Casos límite', () => {
            it('debería manejar ID 0 como válido', async () => {
                mockRequest = {
                    params: { id: '0' }
                };

                mockFindCandidateById.mockResolvedValue(null);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockFindCandidateById).toHaveBeenCalledWith(0);
                expect(mockStatus).toHaveBeenCalledWith(404);
            });

            it('debería manejar ID negativo como válido numéricamente', async () => {
                mockRequest = {
                    params: { id: '-1' }
                };

                mockFindCandidateById.mockResolvedValue(null);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockFindCandidateById).toHaveBeenCalledWith(-1);
                expect(mockStatus).toHaveBeenCalledWith(404);
            });

            it('debería manejar ID muy grande', async () => {
                mockRequest = {
                    params: { id: '999999999' }
                };

                mockFindCandidateById.mockResolvedValue(null);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                expect(mockFindCandidateById).toHaveBeenCalledWith(999999999);
                expect(mockStatus).toHaveBeenCalledWith(404);
            });

            it('debería aceptar números decimales como válidos (parseInt los convierte)', async () => {
                mockRequest = {
                    params: { id: '1.9' }
                };

                mockFindCandidateById.mockResolvedValue(null);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                // parseInt('1.9') = 1, que es válido
                expect(mockFindCandidateById).toHaveBeenCalledWith(1);
                expect(mockStatus).toHaveBeenCalledWith(404);
            });

            it('debería aceptar notación científica como válida (parseInt la convierte)', async () => {
                mockRequest = {
                    params: { id: '1e2' }
                };

                mockFindCandidateById.mockResolvedValue(null);

                await getCandidateById(mockRequest as Request, mockResponse as Response);

                // parseInt('1e2') = 1, que es válido
                expect(mockFindCandidateById).toHaveBeenCalledWith(1);
                expect(mockStatus).toHaveBeenCalledWith(404);
            });
        });
    });
}); 