import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Note } from './Note';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.activities)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Note, (note) => note.activities, { nullable: true })
  note?: Note;

  @Column({ nullable: true })
  noteId?: number;

  @Column()
  type: string;

  @Column({ type: 'json', nullable: true })
  meta?: any;

  @CreateDateColumn()
  createdAt: Date;
}
