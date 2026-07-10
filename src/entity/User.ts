import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { RefreshToken } from './RefreshToken';
import { Note } from './Note';
import { Tag } from './Tag';
import { Activity } from './Activity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  fullName?: string;

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];

  @OneToMany(() => Activity, (act) => act.user)
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  avatarUrl?: string;
}
