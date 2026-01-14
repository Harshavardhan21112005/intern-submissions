import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { SubmissionsController } from './submissions/submissions.controller';
import { MailService } from './mail/mail.service';
import { Staff } from './entities/staffs.entity';
import { Student } from './entities/students.entity';
import { Submission } from './entities/submissions.entity';
import { Review } from './entities/reviews.entity';
import { AuthModule } from './auth/auth.module'; 
import {Class} from './entities/classes.entity'// Import AuthModule
import {Department} from './entities/departments.entity'// Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost', // <- use 'db' inside Docker
      port: 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '1234', // <- your password
      database: process.env.DATABASE_NAME || 'ims',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,  // keep false for safety in prod
    }),

    TypeOrmModule.forFeature([Staff, Student, Submission, Review,Class,Department]), // Entities for feature modules
    AuthModule, // Add AuthModule to enable auth routes
  ],
  providers: [MailService],
  controllers: [AppController, SubmissionsController],
})
export class AppModule {}