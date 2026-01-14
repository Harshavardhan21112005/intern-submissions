import { IsString, 
  
  IsEmail,IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateSubmissionDto {
  @IsString() @IsNotEmpty()
  company_name: string;

  @IsString() @IsNotEmpty()
  company_address: string;

  @IsString() @IsNotEmpty()
  role: string;

  @IsString() @IsNotEmpty()
  supervisor_name: string;

  @IsString() @IsNotEmpty()
  supervisor_email: string;

  @IsString() @IsNotEmpty()
  department_guide: string;

  @IsDateString()
  start_date: Date;

  @IsDateString()
  end_date: Date;

  @IsNumber()
  stipend: number;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  pending_redo_courses?: string;

  @IsOptional() @IsString()
  pending_ra_courses?: string;

  @IsOptional() @IsString()
  pending_current_courses?: string;

  @IsEmail()
  @IsNotEmpty()
  tutor_email: string; 
}
