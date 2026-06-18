import { Router } from 'express';
import { vlmController } from '../controllers/vlmController';

const router = Router();
router.post('/', vlmController);
export default router;
