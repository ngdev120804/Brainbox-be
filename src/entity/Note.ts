import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { ChecklistItem } from './ChecklistItem';
import { NoteTag } from './NoteTag';
import { Activity } from './Activity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notes)
  user: User;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ default: false })
  pinned: boolean;

  @Column({ default: false })
  archived: boolean;

  @Column({ default: false })
  trashed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChecklistItem, (item) => item.note)
  checklist: ChecklistItem[];

  @Column({ type: 'jsonb', nullable: true, name: 'checklist' })
  checklistJson?: any;

  @OneToMany(() => NoteTag, (nt) => nt.note)
  tags: NoteTag[];

  @OneToMany(() => Activity, (a) => a.note)
  activities: Activity[];
}
