import { IBaseRepository } from './IBaseRepository';
import { Application } from '../models/Application';

/**
 * Información de candidato para listados
 */
export interface CandidateInfo {
    candidateId: number;
    fullName: string;
    currentInterviewStep: string;
    applicationId: number;
    averageScore: number;
}

/**
 * Información resumida de aplicación
 */
export interface ApplicationSummary {
    id: number;
    positionTitle: string;
    candidateName: string;
    applicationDate: Date;
    currentStepName: string;
    averageScore: number;
}

/**
 * Interface para el repositorio de aplicaciones.
 * Define operaciones específicas para la gestión de aplicaciones.
 */
export interface IApplicationRepository extends IBaseRepository<Application, number> {
    /**
     * Busca aplicaciones por posición
     * @param positionId - ID de la posición
     * @returns Array de aplicaciones para la posición
     */
    findByPositionId(positionId: number): Promise<Application[]>;

    /**
     * Busca aplicaciones por candidato
     * @param candidateId - ID del candidato
     * @returns Array de aplicaciones del candidato
     */
    findByCandidateId(candidateId: number): Promise<Application[]>;

    /**
     * Busca una aplicación específica por posición y candidato
     * @param positionId - ID de la posición
     * @param candidateId - ID del candidato
     * @returns La aplicación encontrada o null si no existe
     */
    findByPositionAndCandidate(positionId: number, candidateId: number): Promise<Application | null>;

    /**
     * Obtiene candidatos de una posición con información resumida
     * @param positionId - ID de la posición
     * @returns Array de información de candidatos
     */
    getCandidatesByPosition(positionId: number): Promise<CandidateInfo[]>;

    /**
     * Obtiene nombres de candidatos por posición
     * @param positionId - ID de la posición
     * @returns Array con ID y nombre completo de candidatos
     */
    getCandidateNamesByPosition(positionId: number): Promise<Array<{
        candidateId: number;
        fullName: string;
    }>>;

    /**
     * Actualiza el paso de entrevista actual de una aplicación
     * @param applicationId - ID de la aplicación
     * @param interviewStepId - ID del nuevo paso de entrevista
     * @returns La aplicación actualizada
     */
    updateInterviewStep(applicationId: number, interviewStepId: number): Promise<Application>;

    /**
     * Busca aplicaciones por paso de entrevista
     * @param interviewStepId - ID del paso de entrevista
     * @returns Array de aplicaciones en ese paso
     */
    findByInterviewStep(interviewStepId: number): Promise<Application[]>;

    /**
     * Verifica si existe una aplicación para una posición y candidato específicos
     * @param positionId - ID de la posición
     * @param candidateId - ID del candidato
     * @returns true si existe, false en caso contrario
     */
    existsForPositionAndCandidate(positionId: number, candidateId: number): Promise<boolean>;

    /**
     * Obtiene el resumen de aplicaciones con información adicional
     * @param filters - Filtros opcionales
     * @returns Array de resúmenes de aplicaciones
     */
    getApplicationsSummary(filters?: {
        positionId?: number;
        candidateId?: number;
        interviewStepId?: number;
    }): Promise<ApplicationSummary[]>;

    /**
     * Cuenta aplicaciones por estado de entrevista
     * @param positionId - ID de la posición (opcional)
     * @returns Objeto con conteos por paso de entrevista
     */
    countByInterviewStep(positionId?: number): Promise<Record<string, number>>;
} 