import { Router } from 'express';
import { listNotes } from '../controllers/notesController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, listNotes);

export default router;
