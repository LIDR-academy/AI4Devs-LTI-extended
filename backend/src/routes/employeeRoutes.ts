import { Router } from 'express';
import { getActiveEmployees } from '../presentation/controllers/employeeController';

const router = Router();

router.get('/', getActiveEmployees);

export default router;
