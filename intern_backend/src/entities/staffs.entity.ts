import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Department } from './departments.entity';
import { Review } from './reviews.entity';
import { Class } from './classes.entity';

export enum StaffRole {
  TUTOR = 'tutor',
  ADMIN = 'admin',
}

@Entity('staffs')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ type: 'enum', enum: StaffRole })
  role: StaffRole;

  @ManyToOne(() => Department, department => department.staffs)
  department: Department;

  @OneToMany(() => Review, review => review.staff)
  reviews: Review[];

  @OneToMany(() => Class, cls => cls.tutor)
  tutorOfClasses: Class[];
}
