// src/auth/auth.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff, StaffRole } from '../entities/staffs.entity';
import { Student } from '../entities/students.entity';
import { Department } from '../entities/departments.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    private jwtService: JwtService,
  ) {}

  async findStudentByEmail(email: string): Promise<any> {
    try {
      console.log('Looking for student with email:', email);
      const student = await this.studentRepository.findOne({
        where: { email },
        relations: ['department'],
      });
      if (!student) {
        console.log('No student found with email:', email);
        return null;
      }
      console.log('Found student:', student);
      return {
        ...student,
        department: student.department?.name || 'Unknown',
      };
    } catch (error) {
      console.error('Error finding student:', error);
      return null;
    }
  }

  async findStudentById(id: string): Promise<any> {
    try {
      console.log('Looking for student with id:', id);
      const student = await this.studentRepository.findOne({
        where: { id },
        relations: ['department'],
      });
      if (!student) {
        console.log('No student found with id:', id);
        return null;
      }
      console.log('Found student:', student);
      return {
        ...student,
        department: student.department?.name || 'Unknown',
      };
    } catch (error) {
      console.error('Error finding student:', error);
      return null;
    }
  }

  async findStaffByEmail(email: string): Promise<any> {
    try {
      console.log('Looking for staff with email:', email);
      const staff = await this.staffRepository.findOne({
        where: { email },
        relations: ['department'],
      });
      if (!staff) {
        console.log('No staff found with email:', email);
        return null;
      }
      console.log('Found staff:', staff);
      return {
        ...staff,
        department: staff.department?.name || 'Unknown',
      };
    } catch (error) {
      console.error('Error finding staff:', error);
      return null;
    }
  }

  async getAllStaffs(): Promise<any[]> {
    try {
      console.log('Getting all staffs');
      const staffs = await this.staffRepository.find({
        relations: ['department'],
      });
      return staffs.map((staff) => ({
        ...staff,
        department: staff.department?.name || 'Unknown',
      }));
    } catch (error) {
      console.error('Error getting all staffs:', error);
      return [];
    }
  }

  async findStaffById(id: string): Promise<any> {
    try {
      const staff = await this.staffRepository.findOne({
        where: { id },
        relations: ['department'],
      });
      if (!staff) return null;
      return {
        ...staff,
        department: staff.department?.name || 'Unknown',
      };
    } catch (error) {
      console.error('Error finding staff by id:', error);
      return null;
    }
  }

  async getAllDepartments(): Promise<Department[]> {
    try {
      return await this.departmentRepository.find();
    } catch (error) {
      console.error('Error getting departments:', error);
      return [];
    }
  }

  async validateStaffRole(email: string, requiredRole: StaffRole): Promise<boolean> {
    try {
      const staff = await this.staffRepository.findOne({
        where: { email, role: requiredRole },
      });
      return !!staff;
    } catch (error) {
      console.error('Error validating staff role:', error);
      return false;
    }
  }

 async validateOAuthLogin(userData: { email: string; name: string; picture?: string }): Promise<any> {
  try {
    console.log('Validating OAuth login for:', userData.email);
    const { email, name, picture } = userData;

    let user;
    const prefix = email.split('@')[0];
    const isStudent = /^[0-9]/.test(prefix); 

    if (isStudent) {
      user = await this.findStudentByEmail(email);
      if (!user) {
        const defaultDepartment = await this.departmentRepository.findOne({ where: { name: 'Unknown' } });
        user = this.studentRepository.create({
          email,
          name,
          rollNumber: `TEMP_${Math.floor(Math.random() * 10000)}`,
          year: new Date().getFullYear(),
          department: defaultDepartment || undefined,
        });
        await this.studentRepository.save(user);
        user = { ...user, department: defaultDepartment?.name || 'Unknown' };
      }
    } else {
      user = await this.findStaffByEmail(email);
      if (!user) {
        const defaultDepartment = await this.departmentRepository.findOne({ where: { name: 'Unknown' } });
        user = this.staffRepository.create({
          email,
          name,
          role: StaffRole.TUTOR,
          department: defaultDepartment || undefined,
        });
        await this.staffRepository.save(user);
        user = { ...user, department: defaultDepartment?.name || 'Unknown' };
      }
    }

    const payload = {
      email: user.email,
      role: isStudent ? 'student' : 'staff',
      sub: user.id,
    };
    const access_token = this.generateToken(payload.email, payload.role, payload.sub);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rollNumber: isStudent ? user.rollNumber : undefined,
        department: user.department,
        year: isStudent ? user.year : undefined,
        role: payload.role,
        picture: picture || null,
      },
    };
  } catch (error) {
    console.error('Error in validateOAuthLogin:', error);
    throw new HttpException('OAuth validation failed', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}


  generateToken(email: string, role: string, sub: string): string {
    const payload = { email, role, sub };
    return this.jwtService.sign(payload);
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}