import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Resume {
    id: number;
    candidateId: number;
    filePath: string;
    fileType: string;
    uploadDate: Date;

    constructor(data: any) {
        this.id = data?.id;
        this.candidateId = data?.candidateId;
        this.filePath = data?.filePath;
        this.fileType = data?.fileType;
        this.uploadDate = new Date();
    }

    async save(): Promise<Resume> {
        if (!this.id) {
            return await this.create();
        }
        throw new Error('No se permite la actualización de un currículum existente.');
    }

    async create(): Promise<Resume> {
        console.log(this);

        const createdResume = await prisma.resume.create({
            data: {
                candidateId: this.candidateId,
                filePath: this.filePath,
                fileType: this.fileType,
                uploadDate: this.uploadDate
            },
        });
        return new Resume(createdResume);
    }
}