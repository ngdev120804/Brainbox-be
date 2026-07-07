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

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, RefreshToken, Note, Tag, NoteTag, ChecklistItem, Activity],
  // We keep synchronize disabled for production and generate migrations instead
  synchronize: false,
  logging: false,
});

export default AppDataSource;
