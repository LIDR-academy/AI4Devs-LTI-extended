import { IBaseRepository } from './IBaseRepository';
import { Interview } from '../models/Interview';

/**
 * Criterios para búsqueda de entrevistas
 */
export interface InterviewSearchCriteria {
    applicationId?: number;
    employeeId?: number;
    interviewStepId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    result?: string;
    minScore?: number;
    maxScore?: number;
}

/**
 * Estadísticas de entrevistas
 */
export interface InterviewStatistics {
    total: number;
    completed: number;
    pending: number;
    averageScore: number;
    scoreDistribution: {
        excellent: number; // 9-10
        good: number;      // 7-8
        fair: number;      // 5-6
        poor: number;      // 1-4
    };
}

/**
 * Resumen de entrevista para reportes
 */
export interface InterviewSummary {
    id: number;
    candidateName: string;
    positionTitle: string;
    interviewStepName: string;
    interviewDate: Date;
    interviewer: string;
    score?: number;
    result?: string;
}

/**
 * Interface para el repositorio de entrevistas.
 * Define operaciones específicas para la gestión de entrevistas.
 */
export interface IInterviewRepository extends IBaseRepository<Interview, number> {
    /**
     * Busca entrevistas por aplicación
     * @param applicationId - ID de la aplicación
     * @returns Array de entrevistas de la aplicación
     */
    findByApplicationId(applicationId: number): Promise<Interview[]>;

    /**
     * Busca entrevistas por entrevistador
     * @param employeeId - ID del empleado entrevistador
     * @returns Array de entrevistas realizadas por el empleado
     */
    findByEmployeeId(employeeId: number): Promise<Interview[]>;

    /**
     * Busca entrevistas por paso de entrevista
     * @param interviewStepId - ID del paso de entrevista
     * @returns Array de entrevistas del paso específico
     */
    findByInterviewStepId(interviewStepId: number): Promise<Interview[]>;

    /**
     * Busca entrevistas por criterios específicos
     * @param criteria - Criterios de búsqueda
     * @returns Array de entrevistas que cumplen los criterios
     */
    findByCriteria(criteria: InterviewSearchCriteria): Promise<Interview[]>;

    /**
     * Busca entrevistas programadas para un rango de fechas
     * @param dateFrom - Fecha de inicio
     * @param dateTo - Fecha de fin
     * @returns Array de entrevistas en el rango
     */
    findByDateRange(dateFrom: Date, dateTo: Date): Promise<Interview[]>;

    /**
     * Calcula el promedio de puntuación para una aplicación
     * @param applicationId - ID de la aplicación
     * @returns Promedio de puntuación o 0 si no hay entrevistas
     */
    getAverageScoreByApplication(applicationId: number): Promise<number>;

    /**
     * Obtiene estadísticas de entrevistas
     * @param filters - Filtros opcionales
     * @returns Estadísticas de entrevistas
     */
    getStatistics(filters?: {
        employeeId?: number;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<InterviewStatistics>;

    /**
     * Obtiene entrevistas pendientes para un entrevistador
     * @param employeeId - ID del empleado entrevistador
     * @returns Array de entrevistas pendientes
     */
    getPendingInterviews(employeeId: number): Promise<Interview[]>;

    /**
     * Busca la última entrevista de una aplicación
     * @param applicationId - ID de la aplicación
     * @returns La última entrevista o null si no hay entrevistas
     */
    getLastInterviewByApplication(applicationId: number): Promise<Interview | null>;

    /**
     * Obtiene resumen de entrevistas para reportes
     * @param filters - Filtros opcionales
     * @returns Array de resúmenes de entrevistas
     */
    getInterviewsSummary(filters?: {
        positionId?: number;
        employeeId?: number;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<InterviewSummary[]>;

    /**
     * Cuenta entrevistas por resultado
     * @param filters - Filtros opcionales
     * @returns Objeto con conteos por resultado
     */
    countByResult(filters?: {
        employeeId?: number;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<Record<string, number>>;

    /**
     * Verifica si existe una entrevista para una aplicación y paso específicos
     * @param applicationId - ID de la aplicación
     * @param interviewStepId - ID del paso de entrevista
     * @returns true si existe, false en caso contrario
     */
    existsForApplicationAndStep(applicationId: number, interviewStepId: number): Promise<boolean>;
} 