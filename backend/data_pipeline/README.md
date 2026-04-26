# Data Pipeline (dbt)

Pipeline sencilla para simular el ciclo completo de datos de empleados:

`Ingesta -> Staging -> Transformacion -> Validacion -> Consumo`

Se apoya en el dominio ya existente en Prisma (`Company` y `Employee`) y en los datos de ejemplo de `addEmployees.ts`.

## Estructura

- `seeds/raw_employees.csv`: dataset de entrada (simula ingesta)
- `models/ingesta/`: capa de ingesta en dbt
- `models/staging/`: tipado y limpieza ligera
- `models/transformacion/`: calculos de negocio
- `models/consumo/`: dataset final consumible
- `models/validacion/`: tests y reglas de calidad

## Requisitos

- Python 3.10+
- `dbt-core` y `dbt-postgres`
- Base de datos PostgreSQL accesible

## Configuracion rapida

1. Instalar dependencias:

```bash
pip install -r requirements.txt
```

2. Crear perfil local de dbt:

```bash
mkdir -p ~/.dbt
cp profiles.yml.example ~/.dbt/profiles.yml
```

3. Ajustar credenciales en `~/.dbt/profiles.yml`.

## Ejecucion

Desde `backend/data_pipeline`:

```bash
dbt seed
dbt run
dbt test
```

## Que produce

- `ingesta_employees`: replica controlada del dataset crudo
- `stg_employees`: datos normalizados para analitica
- `trf_employee_role_summary`: resumen por rol y estado activo
- `employee_role_kpis`: vista final para consumo
