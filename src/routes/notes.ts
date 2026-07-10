import { Router } from 'express';
import { listNotes, createNote, getNote, updateNote, deleteNote } from '../controllers/notesController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, listNotes);
router.post('/', authMiddleware, createNote);
router.get('/:id', authMiddleware, getNote);
router.put('/:id', authMiddleware, updateNote);
router.delete('/:id', authMiddleware, deleteNote);

export default router;
