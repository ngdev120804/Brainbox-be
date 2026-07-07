import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Note } from './Note';
import { Tag } from './Tag';

@Entity()
export class NoteTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Note, (note) => note.tags)
  note: Note;

  @Column()
  noteId: number;

  @ManyToOne(() => Tag, (tag) => tag.notes)
  tag: Tag;

  @Column()
  tagId: number;
}
