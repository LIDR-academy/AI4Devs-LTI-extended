select
  employee_id,
  trim(company_name) as company_name,
  trim(employee_name) as employee_name,
  lower(trim(employee_email)) as employee_email,
  trim(role) as role,
  is_active,
  ingestion_ts
from {{ ref('ingesta_employees') }}
