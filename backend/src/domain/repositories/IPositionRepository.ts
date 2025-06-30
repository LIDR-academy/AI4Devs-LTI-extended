import { IBaseRepository } from './IBaseRepository';
import { Position } from '../models/Position';

/**
 * Estados válidos de una posición
 */
export type PositionStatus = 'Draft' | 'Published' | 'Closed' | 'On Hold';

/**
 * Criterios para búsqueda de posiciones
 */
export interface PositionSearchCriteria {
    companyId?: number;
    status?: PositionStatus;
    isVisible?: boolean;
    location?: string;
    employmentType?: string;
    salaryMin?: number;
    salaryMax?: number;
}

/**
 * Interface para el repositorio de posiciones.
 * Define operaciones específicas para la gestión de posiciones.
 */
export interface IPositionRepository extends IBaseRepository<Position, number> {
    /**
     * Busca todas las posiciones visibles
     * @returns Array de posiciones visibles
     */
    findAllVisible(): Promise<Position[]>;

    /**
     * Busca posiciones por compañía
     * @param companyId - ID de la compañía
     * @returns Array de posiciones de la compañía
     */
    findByCompanyId(companyId: number): Promise<Position[]>;

    /**
     * Busca una posición con su flujo de entrevistas incluido
     * @param id - ID de la posición
     * @returns La posición con su flujo de entrevistas o null si no existe
     */
    findByIdWithInterviewFlow(id: number): Promise<Position | null>;

    /**
     * Busca posiciones por criterios específicos
     * @param criteria - Criterios de búsqueda
     * @returns Array de posiciones que cumplen los criterios
     */
    findByCriteria(criteria: PositionSearchCriteria): Promise<Position[]>;

    /**
     * Busca posiciones activas (publicadas y visibles)
     * @returns Array de posiciones activas
     */
    findActivePositions(): Promise<Position[]>;

    /**
     * Actualiza el estado de una posición
     * @param id - ID de la posición
     * @param status - Nuevo estado
     * @returns La posición actualizada
     */
    updateStatus(id: number, status: PositionStatus): Promise<Position>;

    /**
     * Actualiza la visibilidad de una posición
     * @param id - ID de la posición
     * @param isVisible - Nueva visibilidad
     * @returns La posición actualizada
     */
    updateVisibility(id: number, isVisible: boolean): Promise<Position>;

    /**
     * Verifica si una posición tiene aplicaciones activas
     * @param id - ID de la posición
     * @returns true si tiene aplicaciones, false en caso contrario
     */
    hasActiveApplications(id: number): Promise<boolean>;

    /**
     * Cuenta las aplicaciones por posición
     * @param id - ID de la posición
     * @returns Número de aplicaciones
     */
    countApplications(id: number): Promise<number>;

    /**
     * Obtiene estadísticas de posiciones por compañía
     * @param companyId - ID de la compañía
     * @returns Objeto con estadísticas
     */
    getStatisticsByCompany(companyId: number): Promise<{
        total: number;
        published: number;
        draft: number;
        closed: number;
        totalApplications: number;
    }>;
} 