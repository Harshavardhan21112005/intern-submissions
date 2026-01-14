import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from './students.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.submissions)
  student: Student;

  @Column()
  company_name: string;

  @Column({nullable:true})
  company_address: string;

  @Column()
  role: string;

  @Column()
  supervisor_name: string;

  @Column()
  supervisor_email: string;

  @Column({nullable:true})
  department_guide: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'decimal', default: 0 })
  stipend: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Academic details
  @Column({ type: 'text', nullable: true })
  pending_redo_courses: string;

  @Column({ type: 'text', nullable: true })
  pending_ra_courses: string;

  @Column({ type: 'text', nullable: true })
  pending_current_courses: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'accepted' | 'declined';

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ default: false })
  processed: boolean;
  
@Column({ type: 'uuid', nullable: true })
  tutor_id: string  ;  
}
