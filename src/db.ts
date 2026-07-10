import createPostgresDataSource, { createPostgresDataSource as _pgFactory, createSqliteDataSource } from './data-source';
import { DataSource, Repository } from 'typeorm';
import { User } from './entity/User';
import { RefreshToken } from './entity/RefreshToken';
import { Note } from './entity/Note';
import { Tag } from './entity/Tag';
import { NoteTag } from './entity/NoteTag';
import { ChecklistItem } from './entity/ChecklistItem';
import { Activity } from './entity/Activity';

let AppDataSource: DataSource | null = null;

export async function initDb() {
  if (AppDataSource && AppDataSource.isInitialized) return;

  // Try Postgres first
  const pg = _pgFactory();
  try {
    await pg.initialize();
    AppDataSource = pg;
    console.log('Database: connected to Postgres');
    return;
  } catch (err) {
    console.warn('Postgres connection failed, falling back to SQLite. Error:', (err as any)?.message || err);
  }

  // Fallback to SQLite for local development
  const sqlite = createSqliteDataSource();
  try {
    await sqlite.initialize();
    AppDataSource = sqlite;
    console.log('Database: using SQLite fallback (dev.sqlite)');
  } catch (err) {
    console.error('SQLite fallback failed. If you do not run Postgres locally, please install the SQLite driver `better-sqlite3` or set a valid DATABASE_URL. Error:', (err as any)?.message || err);
    throw err;
  }
}

function ensureDs(): DataSource {
  if (!AppDataSource) throw new Error('DataSource not initialized. Call initDb() first.');
  return AppDataSource;
}

export const getUserRepo = (): Repository<User> => ensureDs().getRepository(User);
export const getRefreshTokenRepo = (): Repository<RefreshToken> => ensureDs().getRepository(RefreshToken);
export const getNoteRepo = (): Repository<Note> => ensureDs().getRepository(Note);
export const getTagRepo = (): Repository<Tag> => ensureDs().getRepository(Tag);
export const getNoteTagRepo = (): Repository<NoteTag> => ensureDs().getRepository(NoteTag);
export const getChecklistRepo = (): Repository<ChecklistItem> => ensureDs().getRepository(ChecklistItem);
export const getActivityRepo = (): Repository<Activity> => ensureDs().getRepository(Activity);
