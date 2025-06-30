import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InterviewType {
    id?: number;
    name: string;
    description?: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
    }

    async save() {
        const interviewTypeData: any = {
            name: this.name,
            description: this.description,
        };

        if (this.id) {
            return await prisma.interviewType.update({
                where: { id: this.id },
                data: interviewTypeData,
            });
        } else {
            return await prisma.interviewType.create({
                data: interviewTypeData,
            });
        }
    }

    static async findOne(id: number): Promise<InterviewType | null> {
        const data = await prisma.interviewType.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new InterviewType(data);
    }
}

