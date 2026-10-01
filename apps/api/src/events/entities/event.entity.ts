import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Signup } from '../../signups/entities/signup.entity.js';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'timestamptz', nullable: false })
  startsAt: Date;

  @Column({ type: 'timestamptz', nullable: false })
  endsAt: Date;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  // Only populated when a query asks for it (relations: { signups: true }).
  @OneToMany(() => Signup, (signup) => signup.event)
  signups?: Relation<Signup[]>;
}
