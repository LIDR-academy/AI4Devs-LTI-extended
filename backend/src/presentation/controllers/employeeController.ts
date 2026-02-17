import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @route GET /employees
 * @description Get all active employees
 * @access Public
 */
export const getActiveEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await prisma.employee.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: 'An unexpected error occurred'
        });
    }
};
