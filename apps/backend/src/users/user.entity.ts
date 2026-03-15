import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  stellarPublicKey: string;

  @Column({ default: 'student' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
