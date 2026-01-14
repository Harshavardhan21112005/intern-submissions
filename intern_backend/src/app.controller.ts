import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staffs.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  @Post('check-email')
  async checkEmailExists(@Body() body: { email: string }) {
    if (!body.email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    const staff = await this.staffRepository.findOne({ where: { email: body.email } });
    return staff
      ? { success: true, message: 'Yes, email exists', exists: true }
      : { success: true, message: 'No, email not found', exists: false };
  }
}
