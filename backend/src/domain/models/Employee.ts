import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Employee {
    id?: number;
    companyId: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;

    constructor(data: any) {
        this.id = data.id;
        this.companyId = data.companyId;
        this.name = data.name;
        this.email = data.email;
        this.role = data.role;
        this.isActive = data.isActive ?? true;
    }

    async save() {
        const employeeData: any = {
            companyId: this.companyId,
            name: this.name,
            email: this.email,
            role: this.role,
            isActive: this.isActive,
        };

        if (this.id) {
            return await prisma.employee.update({
                where: { id: this.id },
                data: employeeData,
            });
        } else {
            return await prisma.employee.create({
                data: employeeData,
            });
        }
    }

    static async findOne(id: number): Promise<Employee | null> {
        const data = await prisma.employee.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Employee(data);
    }
}

