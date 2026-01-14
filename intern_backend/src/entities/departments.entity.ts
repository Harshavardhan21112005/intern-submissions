import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Student } from './students.entity';
import { Staff } from './staffs.entity';
import { Class } from './classes.entity';

@Entity('departments')
export class Department {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Student, student => student.department)
  students: Student[];

  @OneToMany(() => Staff, staff => staff.department)
  staffs: Staff[];

  @OneToMany(() => Class, cls => cls.department)
  classes: Class[];
}
