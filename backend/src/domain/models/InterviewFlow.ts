import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InterviewFlow {
    id?: number;
    description?: string;

    constructor(data: any) {
        this.id = data.id;
        this.description = data.description;
    }

    async save() {
        const interviewFlowData: any = {
            description: this.description,
        };

        if (this.id) {
            return await prisma.interviewFlow.update({
                where: { id: this.id },
                data: interviewFlowData,
            });
        } else {
            return await prisma.interviewFlow.create({
                data: interviewFlowData,
            });
        }
    }

    static async findOne(id: number): Promise<InterviewFlow | null> {
        const data = await prisma.interviewFlow.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new InterviewFlow(data);
    }
}

