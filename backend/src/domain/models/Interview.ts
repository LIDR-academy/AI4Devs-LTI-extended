import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Interview {
    id?: number;
    applicationId: number;
    interviewStepId: number;
    employeeId: number;
    interviewDate: Date;
    result?: string;
    score?: number;
    notes?: string;

    constructor(data: any) {
        this.id = data.id;
        this.applicationId = data.applicationId;
        this.interviewStepId = data.interviewStepId;
        this.employeeId = data.employeeId;
        this.interviewDate = new Date(data.interviewDate);
        this.result = data.result;
        this.score = data.score;
        this.notes = data.notes;
    }

    async save() {
        const interviewData: any = {
            applicationId: this.applicationId,
            interviewStepId: this.interviewStepId,
            employeeId: this.employeeId,
            interviewDate: this.interviewDate,
            result: this.result,
            score: this.score,
            notes: this.notes,
        };

        if (this.id) {
            return await prisma.interview.update({
                where: { id: this.id },
                data: interviewData,
            });
        } else {
            return await prisma.interview.create({
                data: interviewData,
            });
        }
    }

    static async findOne(id: number): Promise<Interview | null> {
        const data = await prisma.interview.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Interview(data);
    }
}