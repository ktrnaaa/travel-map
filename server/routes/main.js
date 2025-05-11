import { Router } from 'express';

import { getReports } from '../controller/support.js';

const router = Router();

router.get('/support', getReports);

export default router;
