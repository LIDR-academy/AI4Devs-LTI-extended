import { Router } from 'express';
import { getCandidatesByPosition, getInterviewFlowByPosition, getAllPositions, getCandidateNamesByPosition, updatePosition, getPositionById } from '../presentation/controllers/positionController';

const router = Router();

router.get('/', getAllPositions);
router.get('/:id', getPositionById);
router.get('/:id/candidates', getCandidatesByPosition);
router.get('/:id/candidates/names', getCandidateNamesByPosition);
router.get('/:id/interviewflow', getInterviewFlowByPosition);
router.put('/:id', updatePosition);

export default router;
