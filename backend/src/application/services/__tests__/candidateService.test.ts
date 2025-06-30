import { getCandidatesByPositionService, getCandidateNamesByPositionService } from '../positionService';
import { findCandidateById } from '../candidateService';
import { PrismaClient } from '@prisma/client';
import { Candidate } from '../../../domain/models/Candidate';

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        application: {
            findMany: jest.fn(),
        },
        candidate: {
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock del modelo Candidate
jest.mock('../../../domain/models/Candidate');

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Candidate Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Limpiar console.error mock para tests de error
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getCandidatesByPositionService', () => {
        describe('Casos exitosos', () => {
            it('debería retornar candidatos con sus promedios de puntuación cuando existen candidatos', async () => {
                const positionId = 1;
                const mockApplications = [
                    {
                        id: 1,
                        positionId: 1,
                        candidateId: 101,
                        applicationDate: new Date('2024-01-01'),
                        currentInterviewStep: 1,
                        notes: null,
                        candidate: { 
                            firstName: 'Juan', 
                            lastName: 'Pérez' 
                        },
                        interviewStep: { 
                            name: 'Entrevista Técnica' 
                        },
                        interviews: [
                            { score: 8 }, 
                            { score: 6 }
                        ],
                    },
                    {
                        id: 2,
                        positionId: 1,
                        candidateId: 102,
                        applicationDate: new Date('2024-01-02'),
                        currentInterviewStep: 2,
                        notes: 'Candidato prometedor',
                        candidate: { 
                            firstName: 'María', 
                            lastName: 'González' 
                        },
                        interviewStep: { 
                            name: 'Entrevista HR' 
                        },
                        interviews: [
                            { score: 9 }, 
                            { score: 7 }, 
                            { score: 8 }
                        ],
                    },
                ];

                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

                const result = await getCandidatesByPositionService(positionId);

                expect(result).toEqual([
                    {
                        fullName: 'Juan Pérez',
                        currentInterviewStep: 'Entrevista Técnica',
                        candidateId: 101,
                        applicationId: 1,
                        averageScore: 7,
                    },
                    {
                        fullName: 'María González',
                        currentInterviewStep: 'Entrevista HR',
                        candidateId: 102,
                        applicationId: 2,
                        averageScore: 8,
                    },
                ]);

                expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
                    where: { positionId },
                    include: {
                        candidate: true,
                        interviews: true,
                        interviewStep: true
                    }
                });
            });

            it('debería retornar array vacío cuando no hay candidatos para la posición', async () => {
                const positionId = 999;
                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

                const result = await getCandidatesByPositionService(positionId);

                expect(result).toEqual([]);
                expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
                    where: { positionId },
                    include: {
                        candidate: true,
                        interviews: true,
                        interviewStep: true
                    }
                });
            });

            it('debería calcular promedio 0 cuando no hay entrevistas', async () => {
                const positionId = 1;
                const mockApplications = [
                    {
                        id: 1,
                        positionId: 1,
                        candidateId: 101,
                        applicationDate: new Date('2024-01-01'),
                        currentInterviewStep: 1,
                        notes: null,
                        candidate: { 
                            firstName: 'Ana', 
                            lastName: 'López' 
                        },
                        interviewStep: { 
                            name: 'Aplicación Inicial' 
                        },
                        interviews: [],
                    },
                ];

                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

                const result = await getCandidatesByPositionService(positionId);

                expect(result).toEqual([
                    {
                        fullName: 'Ana López',
                        currentInterviewStep: 'Aplicación Inicial',
                        candidateId: 101,
                        applicationId: 1,
                        averageScore: 0,
                    },
                ]);
            });

            it('debería manejar entrevistas con score null correctamente', async () => {
                const positionId = 1;
                const mockApplications = [
                    {
                        id: 1,
                        positionId: 1,
                        candidateId: 101,
                        applicationDate: new Date('2024-01-01'),
                        currentInterviewStep: 1,
                        notes: null,
                        candidate: { 
                            firstName: 'Carlos', 
                            lastName: 'Ruiz' 
                        },
                        interviewStep: { 
                            name: 'Entrevista Técnica' 
                        },
                        interviews: [
                            { score: 8 }, 
                            { score: null }, 
                            { score: 6 }
                        ],
                    },
                ];

                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

                const result = await getCandidatesByPositionService(positionId);

                // El promedio real es (8 + 0 + 6) / 3 = 4.67 aproximadamente
                expect(result[0].averageScore).toBeCloseTo(4.67, 2);
            });
        });

        describe('Casos de error', () => {
            it('debería lanzar error cuando Prisma falla', async () => {
                const positionId = 1;
                const prismaError = new Error('Database connection failed');
                (mockPrisma.application.findMany as jest.Mock).mockRejectedValue(prismaError);

                await expect(getCandidatesByPositionService(positionId)).rejects.toThrow(
                    'Error retrieving candidates by position'
                );

                expect(console.error).toHaveBeenCalledWith(
                    'Error retrieving candidates by position:', 
                    prismaError
                );
            });
        });

        describe('Validación de tipos', () => {
            it('debería funcionar con positionId como número', async () => {
                const positionId = 123;
                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

                await getCandidatesByPositionService(positionId);

                expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
                    where: { positionId: 123 },
                    include: {
                        candidate: true,
                        interviews: true,
                        interviewStep: true
                    }
                });
            });
        });

        describe('Casos límite', () => {
            it('debería manejar positionId 0', async () => {
                const positionId = 0;
                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

                const result = await getCandidatesByPositionService(positionId);

                expect(result).toEqual([]);
                expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
                    where: { positionId: 0 },
                    include: {
                        candidate: true,
                        interviews: true,
                        interviewStep: true
                    }
                });
            });

            it('debería manejar positionId negativo', async () => {
                const positionId = -1;
                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

                const result = await getCandidatesByPositionService(positionId);

                expect(result).toEqual([]);
            });
        });
    });

    describe('getCandidateNamesByPositionService', () => {
        describe('Casos exitosos', () => {
            it('debería retornar nombres de candidatos cuando existen candidatos', async () => {
                const positionId = 1;
                const mockApplications = [
                    {
                        candidateId: 101,
                        candidate: { 
                            firstName: 'Pedro', 
                            lastName: 'Martínez' 
                        },
                    },
                    {
                        candidateId: 102,
                        candidate: { 
                            firstName: 'Laura', 
                            lastName: 'Fernández' 
                        },
                    },
                ];

                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

                const result = await getCandidateNamesByPositionService(positionId);

                expect(result).toEqual([
                    {
                        candidateId: 101,
                        fullName: 'Pedro Martínez',
                    },
                    {
                        candidateId: 102,
                        fullName: 'Laura Fernández',
                    },
                ]);

                expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
                    where: { positionId },
                    include: {
                        candidate: true
                    }
                });
            });

            it('debería retornar array vacío cuando no hay candidatos', async () => {
                const positionId = 999;
                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

                const result = await getCandidateNamesByPositionService(positionId);

                expect(result).toEqual([]);
            });

            it('debería manejar nombres con espacios extras correctamente', async () => {
                const positionId = 1;
                const mockApplications = [
                    {
                        candidateId: 101,
                        candidate: { 
                            firstName: ' Ana ', 
                            lastName: ' García ' 
                        },
                    },
                ];

                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

                const result = await getCandidateNamesByPositionService(positionId);

                expect(result).toEqual([
                    {
                        candidateId: 101,
                        fullName: ' Ana   García ',
                    },
                ]);
            });
        });

        describe('Casos de error', () => {
            it('debería lanzar error cuando Prisma falla', async () => {
                const positionId = 1;
                const prismaError = new Error('Database timeout');
                (mockPrisma.application.findMany as jest.Mock).mockRejectedValue(prismaError);

                await expect(getCandidateNamesByPositionService(positionId)).rejects.toThrow(
                    'Error retrieving candidate names by position'
                );

                expect(console.error).toHaveBeenCalledWith(
                    'Error retrieving candidate names by position:', 
                    prismaError
                );
            });
        });

        describe('Casos límite', () => {
            it('debería manejar positionId 0', async () => {
                const positionId = 0;
                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

                const result = await getCandidateNamesByPositionService(positionId);

                expect(result).toEqual([]);
            });

            it('debería manejar positionId negativo', async () => {
                const positionId = -5;
                (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

                const result = await getCandidateNamesByPositionService(positionId);

                expect(result).toEqual([]);
            });
        });
    });

    describe('findCandidateById', () => {
        describe('Casos exitosos', () => {
            it('debería retornar candidato cuando existe', async () => {
                const candidateId = 1;
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

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);

                const result = await findCandidateById(candidateId);

                expect(result).toBe(mockCandidate);
                expect(Candidate.findOne).toHaveBeenCalledWith(candidateId);
            });

            it('debería retornar null cuando candidato no existe', async () => {
                const candidateId = 999;
                (Candidate.findOne as jest.Mock).mockResolvedValue(null);

                const result = await findCandidateById(candidateId);

                expect(result).toBeNull();
                expect(Candidate.findOne).toHaveBeenCalledWith(candidateId);
            });

            it('debería funcionar con candidateId válido diferente', async () => {
                const candidateId = 42;
                const mockCandidate = {
                    id: 42,
                    firstName: 'Elena',
                    lastName: 'Morales',
                    email: 'elena.morales@email.com',
                    phone: '+34987654321',
                    educations: [],
                    workExperiences: [],
                    resumes: [],
                    applications: []
                };

                (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);

                const result = await findCandidateById(candidateId);

                expect(result).toBe(mockCandidate);
                expect(result?.id).toBe(42);
            });
        });

        describe('Casos de error', () => {
            it('debería lanzar error cuando Candidate.findOne falla', async () => {
                const candidateId = 1;
                const candidateError = new Error('Database connection lost');
                (Candidate.findOne as jest.Mock).mockRejectedValue(candidateError);

                await expect(findCandidateById(candidateId)).rejects.toThrow(
                    'Error al recuperar el candidato'
                );

                expect(console.error).toHaveBeenCalledWith(
                    'Error al buscar el candidato:', 
                    candidateError
                );
            });

            it('debería lanzar error genérico en caso de error desconocido', async () => {
                const candidateId = 1;
                const unknownError = { message: 'Unknown error' };
                (Candidate.findOne as jest.Mock).mockRejectedValue(unknownError);

                await expect(findCandidateById(candidateId)).rejects.toThrow(
                    'Error al recuperar el candidato'
                );
            });
        });

        describe('Validación de tipos', () => {
            it('debería funcionar con candidateId como número entero', async () => {
                const candidateId = 100;
                (Candidate.findOne as jest.Mock).mockResolvedValue(null);

                await findCandidateById(candidateId);

                expect(Candidate.findOne).toHaveBeenCalledWith(100);
                expect(typeof candidateId).toBe('number');
            });
        });

        describe('Casos límite', () => {
            it('debería manejar candidateId 0', async () => {
                const candidateId = 0;
                (Candidate.findOne as jest.Mock).mockResolvedValue(null);

                const result = await findCandidateById(candidateId);

                expect(result).toBeNull();
                expect(Candidate.findOne).toHaveBeenCalledWith(0);
            });

            it('debería manejar candidateId negativo', async () => {
                const candidateId = -1;
                (Candidate.findOne as jest.Mock).mockResolvedValue(null);

                const result = await findCandidateById(candidateId);

                expect(result).toBeNull();
                expect(Candidate.findOne).toHaveBeenCalledWith(-1);
            });

            it('debería manejar candidateId muy grande', async () => {
                const candidateId = 999999999;
                (Candidate.findOne as jest.Mock).mockResolvedValue(null);

                const result = await findCandidateById(candidateId);

                expect(result).toBeNull();
                expect(Candidate.findOne).toHaveBeenCalledWith(999999999);
            });
        });
    });
}); 