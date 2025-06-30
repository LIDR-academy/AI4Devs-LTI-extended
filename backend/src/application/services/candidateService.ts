import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { Application } from '../../domain/models/Application';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData); // Validar los datos del candidato
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData); // Crear una instancia del modelo Candidate
    try {
        const savedCandidate = await candidate.save(); // Guardar el candidato en la base de datos
        const candidateId = savedCandidate.id; // Obtener el ID del candidato guardado

        // Guardar la educación del candidato
        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.educations.push(educationModel);
            }
        }

        // Guardar la experiencia laboral del candidato
        if (candidateData.workExperiences) {
            for (const experience of candidateData.workExperiences) {
                const experienceModel = new WorkExperience(experience);
                experienceModel.candidateId = candidateId;
                await experienceModel.save();
                candidate.workExperiences.push(experienceModel);
            }
        }

        // Guardar los archivos de CV
        if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
            const resumeModel = new Resume(candidateData.cv);
            resumeModel.candidateId = candidateId;
            await resumeModel.save();
            candidate.resumes.push(resumeModel);
        }
        return savedCandidate;
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Unique constraint failed on the fields: (`email`)
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};

export const findCandidateById = async (id: number): Promise<Candidate | null> => {
    try {
        const candidate = await Candidate.findOne(id); // Cambio aquí: pasar directamente el id
        return candidate;
    } catch (error) {
        console.error('Error al buscar el candidato:', error);
        throw new Error('Error al recuperar el candidato');
    }
};

export const updateCandidateStage = async (id: number, applicationIdNumber: number, currentInterviewStep: number) => {
    try {
        const application = await Application.findOneByPositionCandidateId(applicationIdNumber, id);
        if (!application) {
            throw new Error('Application not found');
        }

        // Actualizar solo la etapa de la entrevista actual de la aplicación específica
        application.currentInterviewStep = currentInterviewStep;

        // Guardar la aplicación actualizada
        await application.save();

        return application;
    } catch (error: any) {
        throw new Error(error);
    }
};

export const getAllCandidates = async (options: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            sort = 'firstName',
            order = 'asc'
        } = options;

        // Validar parámetros
        if (page < 1) {
            throw new Error('Page number must be greater than 0');
        }
        if (limit < 1) {
            throw new Error('Limit must be greater than 0');
        }

        const skip = (page - 1) * limit;
        
        // Construir filtros de búsqueda
        const where: any = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Construir ordenamiento
        const orderBy: any = {};
        if (sort === 'firstName' || sort === 'lastName' || sort === 'email') {
            orderBy[sort] = order;
        } else {
            orderBy.firstName = order;
        }

        // Obtener candidatos con paginación
        const [candidates, total] = await Promise.all([
            prisma.candidate.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    educations: true,
                    workExperiences: true,
                    resumes: true,
                    applications: {
                        include: {
                            position: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.candidate.count({ where })
        ]);

        return {
            data: candidates,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error: any) {
        console.error('Error retrieving candidates:', error);
        throw new Error(error.message || 'Error retrieving candidates');
    }
};