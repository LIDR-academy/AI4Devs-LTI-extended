import { Router } from 'express';
import { addCandidate, getCandidateById, updateCandidateStageController, getAllCandidatesController } from '../presentation/controllers/candidateController';
import { createInterviewController, updateInterviewController, deleteInterviewController } from '../presentation/controllers/interviewController';

const router = Router();

// GET /candidates - Get all candidates
router.get('/', getAllCandidatesController);

router.post('/', async (req, res) => {
  try {
    const result = await addCandidate(req.body);
    res.status(201).send(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ message: error.message });
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

// Interview routes - must be before /:id to avoid route conflicts
router.post('/:candidateId/interviews', createInterviewController);
router.patch('/:candidateId/interviews/:interviewId', updateInterviewController);
router.delete('/:candidateId/interviews/:interviewId', deleteInterviewController);

router.get('/:id', getCandidateById);

router.put('/:id', updateCandidateStageController);

export default router;
