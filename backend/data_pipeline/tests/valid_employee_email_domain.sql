select *
from {{ ref('stg_employees') }}
where employee_email not like '%@lti.com'
