import { IBaseRepository } from './IBaseRepository';
import { InterviewFlow } from '../models/InterviewFlow';

/**
 * Interface para el repositorio de flujos de entrevista.
 * Define operaciones específicas para la gestión de flujos de entrevista.
 */
export interface IInterviewFlowRepository extends IBaseRepository<InterviewFlow, number> {
    /**
     * Busca un flujo de entrevista con todos sus pasos incluidos
     * @param id - ID del flujo de entrevista
     * @returns El flujo con sus pasos o null si no existe
     */
    findByIdWithSteps(id: number): Promise<InterviewFlow | null>;

    /**
     * Busca flujos de entrevista que tienen pasos configurados
     * @returns Array de flujos que tienen al menos un paso
     */
    findWithSteps(): Promise<InterviewFlow[]>;

    /**
     * Busca flujos de entrevista utilizados por posiciones activas
     * @returns Array de flujos en uso por posiciones activas
     */
    findInUseByActivePositions(): Promise<InterviewFlow[]>;

    /**
     * Verifica si un flujo de entrevista está siendo utilizado por alguna posición
     * @param id - ID del flujo de entrevista
     * @returns true si está en uso, false en caso contrario
     */
    isInUse(id: number): Promise<boolean>;

    /**
     * Cuenta el número de posiciones que usan un flujo específico
     * @param id - ID del flujo de entrevista
     * @returns Número de posiciones que usan el flujo
     */
    countPositionsUsing(id: number): Promise<number>;

    /**
     * Busca flujos de entrevista por descripción (búsqueda parcial)
     * @param description - Término de búsqueda en la descripción
     * @returns Array de flujos que coinciden con la búsqueda
     */
    findByDescription(description: string): Promise<InterviewFlow[]>;
} 