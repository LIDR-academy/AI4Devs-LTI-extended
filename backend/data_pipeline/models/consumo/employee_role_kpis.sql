select
  s.employee_id,
  s.company_name,
  s.employee_name,
  s.employee_email,
  s.role,
  s.is_active,
  t.total_employees as role_total_employees,
  t.active_employees as role_active_employees,
  t.active_ratio_pct as role_active_ratio_pct,
  s.ingestion_ts
from {{ ref('stg_employees') }} s
left join {{ ref('trf_employee_role_summary') }} t
  on s.company_name = t.company_name
 and s.role = t.role
