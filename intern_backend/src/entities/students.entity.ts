// src/entities/students.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from './departments.entity';
import { Class } from './classes.entity';
import { Submission } from './submissions.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ name: 'roll_number', nullable: true })
  rollNumber: string;

  @Column({ nullable: true }) // Add year field
  year: number;

  @ManyToOne(() => Department, department => department.students, { nullable: true }) // Make nullable
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Class, cls => cls.students, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @OneToMany(() => Submission, submission => submission.student)
  submissions: Submission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}