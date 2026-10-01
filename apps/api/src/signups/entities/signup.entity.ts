import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity.js';
import { User } from '../../users/entities/user.entity.js';

// One row per (user, event) pair. Cancelling deletes the row,
// so the number of rows for an event is the number of spots taken.
@Entity('signups')
@Unique(['userId', 'eventId']) // duplicate sign-up → Postgres 23505 → 409
export class Signup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Plain FK column so queries can filter by id without joining users.
  @Column()
  userId: string;

  // Relation<> keeps the type out of decorator metadata, avoiding
  // "Cannot access 'User' before initialization" with ESM circular imports.
  @ManyToOne(() => User, (user) => user.signups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, (event) => event.signups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Relation<Event>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
