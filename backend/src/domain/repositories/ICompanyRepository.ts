import { IBaseRepository } from './IBaseRepository';
import { Company } from '../models/Company';

/**
 * Interface para el repositorio de compañías.
 * Define operaciones específicas para la gestión de compañías.
 */
export interface ICompanyRepository extends IBaseRepository<Company, number> {
    /**
     * Busca una compañía por su nombre
     * @param name - Nombre de la compañía
     * @returns La compañía encontrada o null si no existe
     */
    findByName(name: string): Promise<Company | null>;

    /**
     * Verifica si un nombre de compañía ya está en uso
     * @param name - Nombre a verificar
     * @param excludeId - ID de la compañía a excluir de la verificación (para actualizaciones)
     * @returns true si el nombre está en uso, false en caso contrario
     */
    isNameInUse(name: string, excludeId?: number): Promise<boolean>;

    /**
     * Busca compañías con empleados activos
     * @returns Array de compañías que tienen empleados activos
     */
    findWithActiveEmployees(): Promise<Company[]>;

    /**
     * Busca compañías con posiciones activas
     * @returns Array de compañías que tienen posiciones activas
     */
    findWithActivePositions(): Promise<Company[]>;

    /**
     * Obtiene estadísticas de una compañía
     * @param id - ID de la compañía
     * @returns Objeto con estadísticas de la compañía
     */
    getStatistics(id: number): Promise<{
        totalEmployees: number;
        activeEmployees: number;
        totalPositions: number;
        activePositions: number;
        totalApplications: number;
    }>;
} 