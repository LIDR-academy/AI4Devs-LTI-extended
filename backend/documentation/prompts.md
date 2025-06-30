# Este es un listado de prompts que funcionan para diversas tareas del SDLC

Utiliza el adecuado según la petición

---
# Prompt para enriquecer historias de usuario
Eres un experto en producto.

A esta historia de usuario le falta detalle técnico y específico para permitir al developer ser totalmente autónomo a la hora de completarla

Por favor entiende la necesidad y proporciona un historia mejorada que sea más clara, específica y concisa acorde a las mejores prácticas de producto, incluyendo descripción completa de la funcionalidad, lista exhaustiva de campos a tocar, estructura y URL de los endpoints necesarios, ficheros a modificar acorde a la arquitectura y buenas prácticas, pasos para que la tarea se asuma como completada, como actualizar la documentación que sea relevante o crear tests unitarios, y requisitos no funcionales relativos a seguridad, rendimiento, etc. Devuelvela en formato markdown

[HISTORIA DE USUARIO]

@README.md @ModeloDatos.md @api-spec.yaml @ManifestoBuenasPracticas.md 

---
# Prompt para tests unitarios

# Rol
Eres un experto en tests unitarios. 

# Objetivo
Dada la historia de usuario a continuación, propón tests unitarios de la manera más exhaustiva posible. 

# Formato
Solo quiero la descripcion y solo tests unitarios, no quiero que me devuelvas codigo aun:
[HISTORIA DE USUARIO]


---
# Prompt para Consultas SQL
# Rol
Eres un experto desarrollador SQL. 

# Objetivo
Dame la query para PostgreSQL que [Objetivo]. 
Aplica todas las practicas SQL para que pueda ejecutar la consulta sin errores (como las dobles comillas en campos y tablas)
Basate en el modelo de datos @schema.prisma 


---
# Prompt para reiniciar bbdd
# Rol
Eres un experto desarrollador SQL. 

# Objetivo
reinicia la base de datos con el seed y las migraciones @backend

---
# Prompt para añadir flujo de entrevistas nuevo al seed

# Rol
Eres un experto desarrollador SQL. 

# Objetivo
Necesito que crees un flujo de entrevistas similar al de la posicion 1 para la posicion 2, pero con un paso extra team fit interview al final. Ya hay un registro de interviewflow para este proceso con id=2. Actualiza seed.ts para que sea la nueva base de datos de inicio


---

