import { Request, Response } from 'express';
import { getNoteRepo, getTagRepo, getNoteTagRepo, getChecklistRepo } from '../db';
import { Tag } from '../entity/Tag';
import { NoteTag } from '../entity/NoteTag';
import { ChecklistItem } from '../entity/ChecklistItem';

function formatNoteForClient(note: any) {
  return {
    id: String(note.id),
    title: note.title,
    content: note.content,
    color: note.color,
    tags: (note.tags || []).map((nt: NoteTag) => nt.tag ? nt.tag.name : undefined).filter(Boolean),
    pinned: !!note.pinned,
    archived: !!note.archived,
    checklist: ((note.checklist && note.checklist.length) ? note.checklist : (note.checklistJson || [])).map((it: any) => {
      const id = it.clientId || it.id;
      const text = it.content ?? it.text ?? '';
      const done = typeof it.completed === 'boolean' ? it.completed : !!it.done;
      return { id: id ? String(id) : String(it.id || ''), text, done };
    }),
    createdAt: note.createdAt ? new Date(note.createdAt).getTime() : null,
    updatedAt: note.updatedAt ? new Date(note.updatedAt).getTime() : null,
  } as any;
}

export const listNotes = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.json({ notes: [] });

  const archived = req.query.archived;
  const pinned = req.query.pinned;
  const q = (req.query.q || '').toString();

  const noteRepo = getNoteRepo();
  const qb = noteRepo.createQueryBuilder('note')
    .leftJoinAndSelect('note.checklist', 'checklist')
    .leftJoinAndSelect('note.tags', 'noteTags')
    .leftJoinAndSelect('noteTags.tag', 'tag')
    .where('note.userId = :userId', { userId });

  if (archived !== undefined) {
    const val = archived === 'true' || archived === true;
    qb.andWhere('note.archived = :archived', { archived: val });
  }
  if (pinned !== undefined) {
    const val = pinned === 'true' || pinned === true;
    qb.andWhere('note.pinned = :pinned', { pinned: val });
  }
  if (q) {
    qb.andWhere('(note.title ILIKE :q OR note.content ILIKE :q)', { q: `%${q}%` });
  }

  const notes = await qb.getMany();
  const out = notes.map(formatNoteForClient);
  return res.json({ notes: out });
};

export const createNote = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'No token' });

  const { title, content, color, pinned, archived, trashed, tags, checklist } = req.body || {};
  const noteRepo = getNoteRepo();
  const tagRepo = getTagRepo();
  const noteTagRepo = getNoteTagRepo();
  const checklistRepo = getChecklistRepo();

  const note: any = noteRepo.create({
    userId,
    title: title || '',
    content,
    color,
    pinned: !!pinned,
    archived: !!archived,
    trashed: !!trashed,
  } as any);

  await noteRepo.save(note);

  // tags: array of strings or comma-separated string
  let tagList: string[] = [];
  if (Array.isArray(tags)) tagList = tags as string[];
  else if (typeof tags === 'string') tagList = tags.split(',').map(s => s.trim()).filter(Boolean);
  // tags: array of strings
  if (Array.isArray(tagList)) {
    for (const name of tags) {
      if (!name) continue;
      const nameStr = String(name);
      let t: any = await tagRepo.findOne({ where: { userId, name: nameStr } as any } as any);
      if (!t) {
        t = tagRepo.create({ userId, name: nameStr } as any) as any;
        await tagRepo.save(t as any);
      }
      const nt = noteTagRepo.create({ noteId: note.id, tagId: t.id } as any);
      await noteTagRepo.save(nt as any);
    }
  }

  // checklist: array of { id, text, done } - preserve client ids
  if (Array.isArray(checklist)) {
    // create or update items, preserve clientId
    for (let i = 0; i < checklist.length; i++) {
      const it = checklist[i];
      if (!it || typeof it.text !== 'string') continue;
      const clientId = typeof it.id === 'string' ? it.id : undefined;
      const ci = checklistRepo.create({ noteId: note.id, content: it.text, completed: !!it.done, ordinal: i, clientId } as any);
      await checklistRepo.save(ci as any);
    }
  }

  const saved: any = await noteRepo.findOne({ where: { id: note.id, userId } as any, relations: { checklist: true, tags: { tag: true } } as any } as any);
  // ensure checklist ids use clientId when present
  if (saved && Array.isArray(saved.checklist)) {
    saved.checklist = saved.checklist.map((it: any) => ({ ...it, id: it.clientId || String(it.id) }));
  }
  // clear legacy JSON checklist column if present
  if (saved && saved.checklistJson) {
    try {
      await noteRepo.update({ id: saved.id } as any, { checklistJson: null } as any);
    } catch (_) {}
    saved.checklistJson = null;
  }
  return res.status(201).json({ note: formatNoteForClient(saved) });
};

export const getNote = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'No token' });

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  const noteRepo = getNoteRepo();
  const note: any = await noteRepo.findOne({ where: { id, userId } as any, relations: { checklist: true, tags: { tag: true } } as any } as any);
  if (!note) return res.status(404).json({ message: 'Not found' });
  return res.json({ note: formatNoteForClient(note) });
};

export const updateNote = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'No token' });

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  const noteRepo = getNoteRepo();
  const noteTagRepo = getNoteTagRepo();
  const tagRepo = getTagRepo();
  const checklistRepo = getChecklistRepo();

  const note: any = await noteRepo.findOne({ where: { id, userId } as any, relations: { checklist: true, tags: { tag: true } } as any } as any);
  if (!note) return res.status(404).json({ message: 'Not found' });

  const { title, content, color, pinned, archived, trashed, tags, checklist } = req.body || {};
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (color !== undefined) note.color = color;
  if (pinned !== undefined) note.pinned = !!pinned;
  if (archived !== undefined) note.archived = !!archived;
  if (trashed !== undefined) note.trashed = !!trashed;

  await noteRepo.save(note);

  // replace tags if provided
  if (Array.isArray(tags) || typeof tags === 'string') {
    const incomingTags = Array.isArray(tags) ? tags as string[] : (typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : []);
    await noteTagRepo.delete({ noteId: note.id } as any);
    for (const name of incomingTags) {
      if (!name) continue;
      const nameStr = String(name);
      let t: any = await tagRepo.findOne({ where: { userId, name: nameStr } as any } as any);
      if (!t) {
        t = tagRepo.create({ userId, name: nameStr } as any) as any;
        await tagRepo.save(t as any);
      }
      const nt = noteTagRepo.create({ noteId: note.id, tagId: t.id } as any);
      await noteTagRepo.save(nt as any);
    }
  }

  // replace checklist if provided
  if (Array.isArray(checklist)) {
    // upsert by clientId when present; delete missing
    const existing = await checklistRepo.find({ where: { noteId: note.id } as any });
    const byClient: any = {};
    for (const e of existing) {
      if (e.clientId) byClient[e.clientId] = e;
    }
    const incomingClientIds: string[] = [];
    for (let i = 0; i < checklist.length; i++) {
      const it = checklist[i];
      if (!it || typeof it.text !== 'string') continue;
      const clientId = typeof it.id === 'string' ? it.id : undefined;
      if (clientId && byClient[clientId]) {
        const e = byClient[clientId];
        e.content = it.text;
        e.completed = !!it.done;
        e.ordinal = i;
        await checklistRepo.save(e as any);
        incomingClientIds.push(clientId);
      } else {
        const ci = checklistRepo.create({ noteId: note.id, content: it.text, completed: !!it.done, ordinal: i, clientId: clientId } as any);
        await checklistRepo.save(ci as any);
        if (clientId) incomingClientIds.push(clientId);
      }
    }
    // delete existing items that are not in incomingClientIds (only those with clientId)
    for (const e of existing) {
      if (e.clientId && !incomingClientIds.includes(e.clientId)) {
        await checklistRepo.delete({ id: e.id } as any);
      }
    }
  }

  const saved: any = await noteRepo.findOne({ where: { id: note.id, userId } as any, relations: { checklist: true, tags: { tag: true } } as any } as any);
  if (saved && Array.isArray(saved.checklist)) {
    saved.checklist = saved.checklist.map((it: any) => ({ ...it, id: it.clientId || String(it.id) }));
  }
  if (saved && saved.checklistJson) {
    try {
      await noteRepo.update({ id: saved.id } as any, { checklistJson: null } as any);
    } catch (_) {}
    saved.checklistJson = null;
  }
  return res.json({ note: formatNoteForClient(saved) });
};

export const deleteNote = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'No token' });

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  const noteRepo = getNoteRepo();
  const existing = await noteRepo.findOne({ where: { id, userId } as any });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  await noteRepo.delete({ id, userId } as any);
  return res.json({ ok: true });
};

export default { listNotes, createNote, getNote, updateNote, deleteNote };
