import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the LTI company
  const company = await prisma.company.findFirst({
    where: { name: 'LTI' },
  });

  if (!company) {
    console.error('Company "LTI" not found. Please run the seed script first.');
    process.exit(1);
  }

  // Check if employees already exist
  const existingEmployees = await prisma.employee.findMany({
    where: { companyId: company.id },
  });

  console.log(`Found ${existingEmployees.length} existing employees.`);

  // Employees to add (using upsert to avoid duplicates)
  const employeesToAdd = [
    {
      email: 'alice.johnson@lti.com',
      name: 'Alice Johnson',
      role: 'Interviewer',
    },
    {
      email: 'bob.miller@lti.com',
      name: 'Bob Miller',
      role: 'Hiring Manager',
    },
    {
      email: 'carol.williams@lti.com',
      name: 'Carol Williams',
      role: 'Technical Lead',
    },
    {
      email: 'david.brown@lti.com',
      name: 'David Brown',
      role: 'Senior Developer',
    },
    {
      email: 'emma.davis@lti.com',
      name: 'Emma Davis',
      role: 'HR Specialist',
    },
  ];

  for (const employeeData of employeesToAdd) {
    const employee = await prisma.employee.upsert({
      where: { email: employeeData.email },
      update: {
        name: employeeData.name,
        role: employeeData.role,
        isActive: true, // Ensure they are active
      },
      create: {
        companyId: company.id,
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        isActive: true,
      },
    });
    console.log(`✓ Employee "${employee.name}" (${employee.email}) is ready.`);
  }

  const finalCount = await prisma.employee.count({
    where: { companyId: company.id, isActive: true },
  });
  console.log(`\nTotal active employees: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
