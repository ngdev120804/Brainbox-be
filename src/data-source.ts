import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { RefreshToken } from './entity/RefreshToken';
import { Note } from './entity/Note';
import { Tag } from './entity/Tag';
import { NoteTag } from './entity/NoteTag';
import { ChecklistItem } from './entity/ChecklistItem';
import { Activity } from './entity/Activity';

dotenv.config();

const ENTITIES = [User, RefreshToken, Note, Tag, NoteTag, ChecklistItem, Activity];

export function createPostgresDataSource() {
  return new DataSource({
    type: 'postgres',
    // Allow a DATABASE_URL env var, otherwise default to local docker-compose service
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/brainbox',
    entities: ENTITIES,
    migrations: [__dirname + '/migration/*{.ts,.js}'],
    synchronize: false,
    logging: false,
  });
}

export function createSqliteDataSource() {
  return new DataSource({
    type: 'better-sqlite3',
    database: process.env.SQLITE_FILE || 'dev.sqlite',
    entities: ENTITIES,
    migrations: [__dirname + '/migration/*{.ts,.js}'],
    // use sync for local SQLite fallback to simplify setup
    synchronize: true,
    logging: false,
  });
}

export default createPostgresDataSource();
