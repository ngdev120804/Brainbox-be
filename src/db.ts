import AppDataSource from './data-source';
import { Repository } from 'typeorm';
import { User } from './entity/User';
import { RefreshToken } from './entity/RefreshToken';
import { Note } from './entity/Note';
import { Tag } from './entity/Tag';
import { NoteTag } from './entity/NoteTag';
import { ChecklistItem } from './entity/ChecklistItem';
import { Activity } from './entity/Activity';

export async function initDb() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}

export const getUserRepo = (): Repository<User> => AppDataSource.getRepository(User);
export const getRefreshTokenRepo = (): Repository<RefreshToken> => AppDataSource.getRepository(RefreshToken);
export const getNoteRepo = (): Repository<Note> => AppDataSource.getRepository(Note);
export const getTagRepo = (): Repository<Tag> => AppDataSource.getRepository(Tag);
export const getNoteTagRepo = (): Repository<NoteTag> => AppDataSource.getRepository(NoteTag);
export const getChecklistRepo = (): Repository<ChecklistItem> => AppDataSource.getRepository(ChecklistItem);
export const getActivityRepo = (): Repository<Activity> => AppDataSource.getRepository(Activity);
