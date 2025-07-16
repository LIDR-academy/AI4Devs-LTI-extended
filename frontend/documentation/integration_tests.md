# Integration Testing Plan for Frontend

## 1. Test File Structure

Los archivos de integración se ubicarán en una carpeta dedicada, siguiendo el patrón `<feature>.int.test.js` o `<feature>.spec.js`:

```
frontend/
└── cypress/ (o tests/integration/ si prefieres)
    ├── candidates.int.test.js
    ├── positions.int.test.js
    ├── createPosition.int.test.js
    ├── navigation.int.test.js
    └── ...otros archivos de integración
```
> **Nota:** Si usas WebdriverIO, la estructura puede ser `/tests/integration/` o `/test/specs/` según la configuración.

---

## 2. Coverage Goals

- **Cobertura:** Cubrir los principales flujos de usuario y la integración entre componentes y servicios.
- **Enfoque:** Flujos completos y casos de uso reales, no detalles internos de componentes.
- **Herramienta:** WebdriverIO (con su runner y aserciones).

---

## 3. Main Integration Scenarios

### Candidates

- El usuario puede ver el listado de candidatos.
- El usuario puede buscar candidatos por nombre/email y ver resultados filtrados.
- El usuario puede navegar a los detalles de un candidato desde la lista.
- El usuario puede editar un candidato y ver los cambios reflejados.
- El usuario puede volver al dashboard desde la vista de candidatos.

### Positions

- El usuario puede ver el listado de posiciones.
- El usuario puede buscar posiciones por título y ver resultados filtrados.
- El usuario puede filtrar posiciones por estado y manager.
- El usuario puede navegar al detalle de una posición y ver la información completa.
- El usuario puede editar una posición y ver los cambios reflejados.
- El usuario puede volver al dashboard desde la vista de posiciones.

### Creación de Posiciones

- El usuario puede acceder al formulario de creación de posición.
- El usuario puede completar y enviar el formulario con datos válidos.
- El sistema muestra feedback de éxito y la nueva posición aparece en el listado.
- El sistema muestra mensajes de error si faltan datos obligatorios.

### Navegación y Flujos Generales

- El usuario puede navegar entre dashboard, candidatos y posiciones usando los botones de navegación.
- El usuario puede usar el BackButton para volver correctamente a la pantalla anterior.
- El sistema maneja correctamente los estados de error y loading en los flujos principales.

---

## 4. Mocking y Datos

- Mockear servicios externos solo si es necesario para aislar el frontend (por ejemplo, usando un mock server o fixtures).
- Usar datos de prueba realistas para los flujos principales.
- Verificar la integración real con la API en un entorno de staging si es posible.

---

## 5. Success Criteria

- Cada flujo principal de usuario está cubierto por al menos un test de integración.
- Los tests validan tanto la UI como la interacción con la API y la navegación.
- Los errores y estados de carga se prueban en los flujos críticos.
- El feedback visual y los mensajes al usuario se validan en los escenarios clave.

---

*Este plan asegura que los flujos principales del frontend funcionan correctamente de extremo a extremo y que la integración entre componentes, servicios y navegación es robusta.* 