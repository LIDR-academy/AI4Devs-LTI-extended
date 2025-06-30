import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Company {
    id?: number;
    name: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
    }

    async save() {
        const companyData: any = {
            name: this.name,
        };

        if (this.id) {
            return await prisma.company.update({
                where: { id: this.id },
                data: companyData,
            });
        } else {
            return await prisma.company.create({
                data: companyData,
            });
        }
    }

    static async findOne(id: number): Promise<Company | null> {
        const data = await prisma.company.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Company(data);
    }
}

