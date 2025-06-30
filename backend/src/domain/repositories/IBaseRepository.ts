/**
 * Interface base para repositorios que define las operaciones comunes
 * que todos los repositorios deben implementar.
 */
export interface IBaseRepository<T, TId> {
    /**
     * Busca una entidad por su ID
     * @param id - Identificador único de la entidad
     * @returns La entidad encontrada o null si no existe
     */
    findById(id: TId): Promise<T | null>;

    /**
     * Busca todas las entidades que cumplan con los criterios especificados
     * @param criteria - Criterios de búsqueda opcionales
     * @returns Array de entidades que cumplen los criterios
     */
    findMany(criteria?: any): Promise<T[]>;

    /**
     * Guarda una nueva entidad en el repositorio
     * @param entity - Entidad a guardar
     * @returns La entidad guardada con su ID asignado
     */
    save(entity: T): Promise<T>;

    /**
     * Actualiza una entidad existente
     * @param id - ID de la entidad a actualizar
     * @param entity - Datos actualizados de la entidad
     * @returns La entidad actualizada
     */
    update(id: TId, entity: Partial<T>): Promise<T>;

    /**
     * Elimina una entidad por su ID
     * @param id - ID de la entidad a eliminar
     * @returns true si se eliminó correctamente, false en caso contrario
     */
    delete(id: TId): Promise<boolean>;

    /**
     * Cuenta el número total de entidades que cumplen con los criterios
     * @param criteria - Criterios de búsqueda opcionales
     * @returns Número total de entidades
     */
    count(criteria?: any): Promise<number>;

    /**
     * Verifica si existe una entidad con el ID especificado
     * @param id - ID de la entidad a verificar
     * @returns true si existe, false en caso contrario
     */
    exists(id: TId): Promise<boolean>;
} 