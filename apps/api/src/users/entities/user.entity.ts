import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { Signup } from '../../signups/entities/signup.entity.js';

export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  VOLUNTEER = 'volunteer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ unique: true })
  email: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.VOLUNTEER })
  role: UserRole;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  // Only populated when a query asks for it (relations: { signups: true }).
  @OneToMany(() => Signup, (signup) => signup.user)
  signups?: Relation<Signup[]>;
}
