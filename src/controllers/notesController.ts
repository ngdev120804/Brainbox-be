import { Request, Response } from 'express';
import { getNoteRepo } from '../db';

export const listNotes = async (req: any, res: Response) => {
  const userId = req.user?.id;
  // allow unauthenticated request to return nothing
  if (!userId) return res.json({ notes: [] });

  const archived = req.query.archived === 'true';
  const noteRepo = getNoteRepo();
  const notes = await noteRepo.find({ where: { userId, archived } as any });
  return res.json({ notes });
};

export default { listNotes };
