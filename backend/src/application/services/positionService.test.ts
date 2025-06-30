import { getCandidatesByPositionService } from './positionService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    application: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('getCandidatesByPositionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos exitosos', () => {
    it('debería retornar candidatos con sus puntuaciones promedio cuando existen aplicaciones', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: { 
            firstName: 'John', 
            lastName: 'Doe' 
          },
          interviewStep: { 
            name: 'Technical Interview' 
          },
          interviews: [
            { score: 5 }, 
            { score: 3 }
          ],
        },
        {
          id: 2,
          positionId: 1,
          candidateId: 2,
          applicationDate: new Date(),
          currentInterviewStep: 2,
          notes: null,
          candidate: { 
            firstName: 'Jane', 
            lastName: 'Smith' 
          },
          interviewStep: { 
            name: 'HR Interview' 
          },
          interviews: [
            { score: 4 }, 
            { score: 4 }, 
            { score: 5 }
          ],
        }
      ];

      jest.spyOn(prisma.application, 'findMany').mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionService(1);

      expect(result).toEqual([
        {
          fullName: 'John Doe',
          currentInterviewStep: 'Technical Interview',
          candidateId: 1,
          applicationId: 1,
          averageScore: 4,
        },
        {
          fullName: 'Jane Smith',
          currentInterviewStep: 'HR Interview',
          candidateId: 2,
          applicationId: 2,
          averageScore: 4.333333333333333,
        }
      ]);

      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: 1 },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true
        }
      });
    });

    it('debería retornar un array vacío cuando no hay aplicaciones para la posición', async () => {
      jest.spyOn(prisma.application, 'findMany').mockResolvedValue([]);

      const result = await getCandidatesByPositionService(1);

      expect(result).toEqual([]);
      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: 1 },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true
        }
      });
    });

    it('debería calcular correctamente la puntuación promedio como 0 cuando no hay entrevistas', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: { 
            firstName: 'John', 
            lastName: 'Doe' 
          },
          interviewStep: { 
            name: 'Initial Screening' 
          },
          interviews: [],
        }
      ];

      jest.spyOn(prisma.application, 'findMany').mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionService(1);

      expect(result).toEqual([
        {
          fullName: 'John Doe',
          currentInterviewStep: 'Initial Screening',
          candidateId: 1,
          applicationId: 1,
          averageScore: 0,
        }
      ]);
    });

    it('debería manejar entrevistas con puntuaciones null o undefined', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: { 
            firstName: 'John', 
            lastName: 'Doe' 
          },
          interviewStep: { 
            name: 'Technical Interview' 
          },
          interviews: [
            { score: 5 },
            { score: null },
            { score: undefined },
            { score: 3 }
          ],
        }
      ];

      jest.spyOn(prisma.application, 'findMany').mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionService(1);

      expect(result[0].averageScore).toBe(2); // (5 + 0 + 0 + 3) / 4 = 2
    });

    it('debería concatenar correctamente nombres con espacios', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: { 
            firstName: 'María José', 
            lastName: 'García López' 
          },
          interviewStep: { 
            name: 'Technical Interview' 
          },
          interviews: [{ score: 5 }],
        }
      ];

      jest.spyOn(prisma.application, 'findMany').mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionService(1);

      expect(result[0].fullName).toBe('María José García López');
    });
  });

  describe('Casos de error', () => {
    it('debería lanzar error cuando Prisma falla con error de base de datos', async () => {
      const databaseError = new Error('Database connection failed');
      jest.spyOn(prisma.application, 'findMany').mockRejectedValue(databaseError);

      await expect(getCandidatesByPositionService(1)).rejects.toThrow('Error retrieving candidates by position');
    });

    it('debería lanzar error cuando Prisma falla con error de timeout', async () => {
      const timeoutError = new Error('Query timeout');
      jest.spyOn(prisma.application, 'findMany').mockRejectedValue(timeoutError);

      await expect(getCandidatesByPositionService(1)).rejects.toThrow('Error retrieving candidates by position');
    });

    it('debería lanzar error genérico cuando el error no es una instancia de Error', async () => {
      const unknownError = 'Unknown error';
      jest.spyOn(prisma.application, 'findMany').mockRejectedValue(unknownError);

      await expect(getCandidatesByPositionService(1)).rejects.toThrow('Error retrieving candidates by position');
    });
  });

  describe('Casos límite', () => {
    it('debería funcionar correctamente con positionId igual a 0', async () => {
      jest.spyOn(prisma.application, 'findMany').mockResolvedValue([]);

      const result = await getCandidatesByPositionService(0);

      expect(result).toEqual([]);
      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: 0 },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true
        }
      });
    });

    it('debería funcionar correctamente con positionId negativo', async () => {
      jest.spyOn(prisma.application, 'findMany').mockResolvedValue([]);

      const result = await getCandidatesByPositionService(-1);

      expect(result).toEqual([]);
      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: -1 },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true
        }
      });
    });

    it('debería funcionar correctamente con positionId muy grande', async () => {
      const largeId = Number.MAX_SAFE_INTEGER;
      jest.spyOn(prisma.application, 'findMany').mockResolvedValue([]);

      const result = await getCandidatesByPositionService(largeId);

      expect(result).toEqual([]);
      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: largeId },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true
        }
      });
    });

    it('debería manejar datos con estructura mínima requerida', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: { 
            firstName: '', 
            lastName: '' 
          },
          interviewStep: { 
            name: '' 
          },
          interviews: [],
        }
      ];

      jest.spyOn(prisma.application, 'findMany').mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionService(1);

      expect(result).toEqual([
        {
          fullName: ' ',
          currentInterviewStep: '',
          candidateId: 1,
          applicationId: 1,
          averageScore: 0,
        }
      ]);
    });

    it('debería manejar entrevistas con puntuaciones decimales', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: { 
            firstName: 'John', 
            lastName: 'Doe' 
          },
          interviewStep: { 
            name: 'Technical Interview' 
          },
          interviews: [
            { score: 4.5 },
            { score: 3.7 },
            { score: 4.8 }
          ],
        }
      ];

      jest.spyOn(prisma.application, 'findMany').mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionService(1);

              expect(result[0].averageScore).toBeCloseTo(4.333333333333333, 6);
    });
  });
});

