import { Router } from 'express';
import { addCandidate, getCandidateById, updateCandidateStageController, getAllCandidatesController } from '../presentation/controllers/candidateController';

const router = Router();

// GET /candidates - Obtener todos los candidatos
router.get('/', getAllCandidatesController);

router.post('/', async (req, res) => {
  try {
    // console.log(req.body); //Just in case you want to inspect the request body
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

router.get('/:id', getCandidateById);

router.put('/:id', updateCandidateStageController);

export default router;
