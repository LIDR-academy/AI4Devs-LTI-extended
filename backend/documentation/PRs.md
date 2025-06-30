# Pull Request: Mejoras en la gestión de posiciones y candidatos

## Cambios realizados

### Backend

1. **Actualización de la API de posiciones**
   - Ampliación del endpoint `/positions` con más campos y detalles
   - Nuevo endpoint `/positions/{id}` para actualizar posiciones
   - Validación mejorada para actualizaciones de posiciones

2. **Funcionalidad de candidatos destacados**
   - Nuevo script `getTopCandidates.js` para identificar los mejores candidatos por posición
   - Cálculo de puntuación media basada en entrevistas
   - Datos de prueba adicionales en `seed.ts` para demostrar la funcionalidad

3. **Mejoras en la validación**
   - Límite de 3 educaciones por candidato
   - Validaciones para actualizaciones de posiciones (salario, estado, fechas)

4. **Documentación de controladores**
   - Añadidos comentarios JSDoc a los controladores de candidatos

### Frontend

1. **Mejora en el componente de posiciones**
   - Implementación de búsqueda por título
   - Filtrado dinámico de posiciones

2. **Ordenación de candidatos**
   - Los candidatos ahora se ordenan por puntuación en las columnas de etapas
   - Mejor visualización de candidatos destacados

## Instrucciones de prueba

1. Navegar al directorio backend: `cd backend/prisma`
2. Ejecutar migraciones y seed para actualizar la base de datos
3. Probar el script de candidatos destacados: `node getTopCandidates.js [positionId]`
4. Verificar la funcionalidad de búsqueda en el frontend
