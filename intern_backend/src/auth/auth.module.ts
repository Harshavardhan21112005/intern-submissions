import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy'; // Import JwtStrategy
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../entities/students.entity';
import { Staff } from '../entities/staffs.entity';
import { Department } from '../entities/departments.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // Match with JwtStrategy
      signOptions: { expiresIn: '60m' }, // Token expires in 60 minutes
    }),
    TypeOrmModule.forFeature([Student, Staff, Department]),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy], // Add JwtStrategy here
  exports: [AuthService],
})
export class AuthModule {}