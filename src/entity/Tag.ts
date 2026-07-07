import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { NoteTag } from './NoteTag';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.tags)
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => NoteTag, (nt) => nt.tag)
  notes: NoteTag[];

  @CreateDateColumn()
  createdAt: Date;
}
