import { Router } from 'express';
import * as aiReports from '../controller/aiReports';

const router = Router();

// POST /aiReports/
router.post('', aiReports.saveAiReport);

// GET /aiReports/:userNum
router.get('/:userNum', aiReports.getAiReport);

export default router;
