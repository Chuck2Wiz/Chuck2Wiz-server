import * as forms from '../controller/form';
import { Router } from 'express';

const router = Router();

// GET /form/:option
router.get('/:option', forms.searchForm);

export default router;
