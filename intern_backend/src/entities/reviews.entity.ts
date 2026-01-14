import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Submission } from './submissions.entity';
import { Staff } from './staffs.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'submission_id', type: 'uuid', nullable: true }) 
  submissionId: string | null;

  @Column({ name: 'staffId', type: 'uuid', nullable: true })
  staffId: string | null;

  @Column({
    type: 'enum',
    enum: ['declined'],
    default: 'declined',
  })
  status: 'declined';

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string | null;

  @Column({ name: 'createdAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Submission)
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'staffId' })
  staff: Staff;
}