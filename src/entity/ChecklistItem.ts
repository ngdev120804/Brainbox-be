import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Note } from './Note';

@Entity()
export class ChecklistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Note, (note) => note.checklist)
  note: Note;

  @Column()
  noteId: number;

  @Column({ nullable: true })
  clientId?: string;

  @Column()
  content: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ default: 0 })
  ordinal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
