import { IBaseRepository } from './IBaseRepository';
import { Candidate } from '../models/Candidate';

/**
 * Criterios para búsqueda paginada de candidatos
 */
export interface CandidateSearchCriteria {
    page?: number;
    limit?: number;
    search?: string; // Búsqueda por nombre, apellido o email
    sort?: 'firstName' | 'lastName' | 'email';
    order?: 'asc' | 'desc';
}

/**
 * Resultado paginado de candidatos
 */
export interface PaginatedCandidates {
    data: Candidate[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/**
 * Interface para el repositorio de candidatos.
 * Define operaciones específicas para la gestión de candidatos.
 */
export interface ICandidateRepository extends IBaseRepository<Candidate, number> {
    /**
     * Busca un candidato por su email
     * @param email - Email del candidato
     * @returns El candidato encontrado o null si no existe
     */
    findByEmail(email: string): Promise<Candidate | null>;

    /**
     * Busca candidatos con paginación y filtros
     * @param criteria - Criterios de búsqueda y paginación
     * @returns Resultado paginado con candidatos y metadatos
     */
    findWithPagination(criteria: CandidateSearchCriteria): Promise<PaginatedCandidates>;

    /**
     * Busca un candidato con todas sus relaciones (educación, experiencia, CV, aplicaciones)
     * @param id - ID del candidato
     * @returns El candidato con todas sus relaciones o null si no existe
     */
    findByIdWithRelations(id: number): Promise<Candidate | null>;

    /**
     * Busca candidatos por posición aplicada
     * @param positionId - ID de la posición
     * @returns Array de candidatos que aplicaron a la posición
     */
    findByPositionId(positionId: number): Promise<Candidate[]>;

    /**
     * Verifica si un email ya está en uso por otro candidato
     * @param email - Email a verificar
     * @param excludeId - ID del candidato a excluir de la verificación (para actualizaciones)
     * @returns true si el email está en uso, false en caso contrario
     */
    isEmailInUse(email: string, excludeId?: number): Promise<boolean>;

    /**
     * Busca candidatos por criterios de búsqueda de texto libre
     * @param searchTerm - Término de búsqueda
     * @returns Array de candidatos que coinciden con la búsqueda
     */
    searchByTerm(searchTerm: string): Promise<Candidate[]>;

    /**
     * Obtiene estadísticas básicas de candidatos
     * @returns Objeto con estadísticas (total, activos, etc.)
     */
    getStatistics(): Promise<{
        total: number;
        withApplications: number;
        withResumes: number;
    }>;
} 