select
  company_name,
  role,
  count(*) as total_employees,
  sum(case when is_active then 1 else 0 end) as active_employees,
  round(
    100.0 * sum(case when is_active then 1 else 0 end)::numeric / nullif(count(*), 0),
    2
  ) as active_ratio_pct
from {{ ref('stg_employees') }}
group by company_name, role
