select
  employee_id,
  company_name,
  employee_name,
  employee_email,
  role,
  is_active,
  current_timestamp as ingestion_ts
from {{ source('raw', 'raw_employees') }}
