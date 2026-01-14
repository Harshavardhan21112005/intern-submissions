import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Department } from './departments.entity';
import { Staff } from './staffs.entity';
import { Student } from './students.entity';

@Entity('classes')
export class Class {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Department, department => department.classes)
  department: Department;

  @ManyToOne(() => Staff, staff => staff.tutorOfClasses, { nullable: true })
  tutor: Staff;

  @OneToMany(() => Student, student => student.class)
  students: Student[];
}
