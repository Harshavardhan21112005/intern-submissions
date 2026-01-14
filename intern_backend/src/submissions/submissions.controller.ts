import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/students.entity';
import { Staff } from '../entities/staffs.entity';
import { Submission } from '../entities/submissions.entity';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { MailService } from '../mail/mail.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Department } from '../entities/departments.entity';
import { Class } from '../entities/classes.entity';
import * as PDFDocument from 'pdfkit';
@Controller('submissions')
export class SubmissionsController {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    private readonly mailService: MailService,
  ) {}

  // Create Submission
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createSubmission(@Body() dto: CreateSubmissionDto, @Req() req: Request) {
    const payload = req.user as { email: string; role: string; sub: string };
    if (!payload || payload.role !== 'student') {
      throw new HttpException('Unauthorized: Only students can submit', HttpStatus.UNAUTHORIZED);
    }

    const student = await this.studentRepo.findOne({
      where: { email: payload.email },
      relations: ['class'],
    });
    if (!student) throw new HttpException('Student not found', HttpStatus.NOT_FOUND);

    const tutor = await this.staffRepo.findOne({ where: { email: dto.tutor_email } });
    if (!tutor) throw new HttpException('Tutor email does not exist in staff records', HttpStatus.BAD_REQUEST);

    // Assign tutor to class if not already assigned
    if (student.class) {
      const studentClass = await this.classRepo.findOne({
        where: { id: student.class.id },
        relations: ['tutor'],
      });
      if (studentClass && (!studentClass.tutor || studentClass.tutor.id !== tutor.id)) {
        studentClass.tutor = tutor;
        await this.classRepo.save(studentClass);
      }
    }

    const submissionData = {
      company_name: dto.company_name,
      company_address: dto.company_address,
      role: dto.role,
      supervisor_name: dto.supervisor_name,
      supervisor_email: dto.supervisor_email,
      department_guide: dto.department_guide,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
      stipend: dto.stipend,
      description: dto.description || null,
      pending_redo_courses: dto.pending_redo_courses || null,
      pending_ra_courses: dto.pending_ra_courses || null,
      pending_current_courses: dto.pending_current_courses || null,
      student: student,
      tutor_id: tutor.id,
      processed: false,
      status: 'pending',
      remarks: null,
    };

    const submission = this.submissionRepo.create(submissionData as any);
    await this.submissionRepo.save(submission);

    try {
      await this.mailService.sendTutorNotification(tutor.email, student.name, student.rollNumber);
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    return {
      success: true,
      message: 'Submission recorded successfully and tutor assigned to class',
    };
  }

  // Get Admin Overview
  @Get('admin/overview')
  async getAdminOverview(@Req() req: Request) {
    const submissions = await this.submissionRepo.find({
      where: { status: 'accepted' },
      relations: ['student', 'student.class', 'student.class.department'],
    });

    const grouped: Record<string, Record<string, { studentName: string; companyName: string }[]>> = {};
    for (const submission of submissions) {
      const dept = submission.student.class?.department?.name || 'Unknown Department';
      const cls = submission.student.class?.name || 'Unknown Class';

      if (!grouped[dept]) grouped[dept] = {};
      if (!grouped[dept][cls]) grouped[dept][cls] = [];

      grouped[dept][cls].push({
        studentName: submission.student.name,
        companyName: submission.company_name,
      });
    }

    return {
      success: true,
      overview: grouped,
    };
  }

  // Get Pending Submissions for Tutor
  @Get('pending')
  @UseGuards(AuthGuard('jwt'))
  async getPendingSubmissions(@Req() req: Request) {
    const payload = req.user as { email: string; role: string; sub: string };
    if (!payload || payload.role !== 'staff') {
      throw new HttpException('Unauthorized: Only tutors can view pending submissions', HttpStatus.UNAUTHORIZED);
    }

    const tutor = await this.staffRepo.findOne({ where: { email: payload.email } });
    if (!tutor) throw new HttpException('Tutor not found', HttpStatus.NOT_FOUND);

    const submissions = await this.submissionRepo.find({
      where: { tutor_id: tutor.id, status: 'pending' },
      relations: ['student'],
    });

    return {
      success: true,
      submissions: submissions.map((s) => ({
        id: s.id,
        studentName: s.student.name,
        rollNumber: s.student.rollNumber,
        company_name: s.company_name,
        role: s.role,
        start_date: s.start_date,
        end_date: s.end_date,
        stipend: s.stipend,
      })),
    };
  }

  // Get Accepted Submissions for Tutor
  @Get('accepted-submissions/class')
  @UseGuards(AuthGuard('jwt'))
  async getAcceptedSubmissionsByClass(@Req() req: Request) {
    const payload = req.user as { email: string; role: string; sub: string };
    if (!payload || payload.role !== 'staff') {
      throw new HttpException('Unauthorized: Only tutors can access this', HttpStatus.UNAUTHORIZED);
    }

    const tutor = await this.staffRepo.findOne({ where: { email: payload.email } });
    if (!tutor) throw new HttpException('Tutor not found', HttpStatus.NOT_FOUND);

    const submissions = await this.submissionRepo.find({
      where: { tutor_id: tutor.id, status: 'accepted' },
      relations: ['student'],
    });

    const result = submissions.map((s) => ({
      id: s.id,
      studentName: s.student.name,
      rollNumber: s.student.rollNumber,
      class: s.student.class?.name || 'Unknown',
      company_name: s.company_name,
      role: s.role,
      start_date: s.start_date,
      end_date: s.end_date,
      stipend: s.stipend,
    }));

    return {
      success: true,
      count: result.length,
      submissions: result,
    };
  }

  // Update Submission Decision
  @Patch(':id/decision')
  @UseGuards(AuthGuard('jwt'))
  async updateSubmissionDecision(
    @Param('id') id: string,
    @Body() dto: { status: 'accepted' | 'declined'; remarks?: string },
    @Req() req: Request,
  ) {
    const payload = req.user as { email: string; role: string; sub: string };
    if (!payload || payload.role !== 'staff') {
      throw new HttpException('Unauthorized: Only tutors can update decisions', HttpStatus.UNAUTHORIZED);
    }

    const submission = await this.submissionRepo.findOne({ where: { id }, relations: ['student'] });
    if (!submission) throw new HttpException('Submission not found', HttpStatus.NOT_FOUND);

    const staff = await this.staffRepo.findOne({ where: { email: payload.email } });
    if (!staff || submission.tutor_id !== staff.id) {
      throw new HttpException('Unauthorized: Only the assigned tutor can update this submission', HttpStatus.UNAUTHORIZED);
    }

    submission.status = dto.status;
    submission.processed = true;
    submission.remarks = dto.remarks || "";
    await this.submissionRepo.save(submission);

    try {
      await this.mailService.sendStudentNotification(
        submission.student.email,
        submission.student.name,
        dto.status,
        dto.remarks || 'No remarks provided',
      );
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    return {
      success: true,
      message: `Submission ${dto.status} successfully`,
      submissionId: submission.id,
    };
  }

  // Get My Submissions (Student)
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMySubmissions(@Req() req: Request) {
    const payload = req.user as { email: string; role: string; sub: string };
    if (!payload || payload.role !== 'student') {
      throw new HttpException('Unauthorized: Only students can view their submissions', HttpStatus.UNAUTHORIZED);
    }

    const student = await this.studentRepo.findOne({ where: { email: payload.email }, relations: ['submissions'] });
    if (!student) throw new HttpException('Student not found', HttpStatus.NOT_FOUND);

    const submissionsWithStatus = await Promise.all(
      student.submissions.map(async (submission) => {
        const tutor = await this.staffRepo.findOne({ where: { id: submission.tutor_id } });
        return {
          id: submission.id,
          company_name: submission.company_name,
          role: submission.role,
          start_date: submission.start_date,
          end_date: submission.end_date,
          tutorEmail: tutor?.email || 'Unassigned',
          status: submission.status,
          remarks: submission.remarks || 'No remarks',
          stipend: submission.stipend,
        };
      }),
    );

    return {
      success: true,
      submissions: submissionsWithStatus,
    };
  }

  // Get Departments
  @Get('departments')
  @UseGuards(AuthGuard('jwt'))
  async getAllDepartments() {
    const departments = await this.departmentRepo.find();
    return {
      success: true,
      departments,
    };
  }
// PDF Download (Improved with table-like layout)
@Get(':id/download-pdf')
async downloadPdf(@Param('id') id: string, @Res() res: Response) {
  const submission = await this.submissionRepo.findOne({
    where: { id },
    relations: ['student', 'student.department', 'student.class'],
  });

  if (!submission) {
    throw new HttpException('Submission not accepted yet', HttpStatus.BAD_REQUEST);
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const buffers: any[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Undertaking_${submission.student.rollNumber}.pdf`,
    );
    res.send(pdfData);
  });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getFullYear()}`;
  };

  const s = submission.student;
  const today = formatDate(new Date());

  // === HEADER ===
  doc.fontSize(14).text(`PSG COLLEGE OF TECHNOLOGY, COIMBATORE 641 004`, {
    align: 'center',
  });
  doc.moveDown(0.5);
  doc.fontSize(12).text(
    `Undertaking for Pursuing Internship in the 7th Semester (MSc)`,
    { align: 'center', underline: true },
  );
  doc.moveDown(1);

  // === BODY ===
  doc.fontSize(10).text(`Date: ${today}`);
  doc.moveDown();

  doc.text(`From:`);
  doc.text(`${s.name} (${s.rollNumber})`);
  doc.moveDown();

  doc.text(`To`);
  doc.text(`The Principal`);
  doc.text(`PSG College of Technology`);
  doc.text(`Coimbatore – 641004`);
  doc.moveDown();

  doc.text(
    `Through : The Head of the Department, ${s.department?.name || '________________'}`,
  );
  doc.moveDown();

  doc.text(`Dear Sir,`);
  doc.moveDown();

  doc.text(
    `Sub: Undertaking while pursuing Internship/Project Work I in Industry / Institutions.`,
    { underline: true },
  );
  doc.moveDown();

  // === TABLE SECTION ===
  const startY = doc.y;
  doc.rect(50, startY, 500, 90).stroke(); // outer box
  doc.text(
    `Name & Address of the Industry/Institution : ${submission.company_name}, ${submission.company_address}`,
    55,
    startY + 5,
    { width: 480 },
  );
  doc.moveDown();
  doc.text(
    `Internship Period : From ${formatDate(
      submission.start_date,
    )} To ${formatDate(submission.end_date)}`,
    { width: 480 },
  );
  doc.moveDown();
  doc.text(
    `Guide from the Industry/Institution : ${submission.supervisor_name}, ${submission.supervisor_email}`,
    { width: 480 },
  );
  doc.moveDown();
  doc.text(
    `Guide in the Department : ${submission.department_guide}`,
    { width: 480 },
  );
  doc.moveDown();
  doc.text(`Stipend receivable (if any): Rs.${submission.stipend || '0'}`, {
    width: 480,
  });
  doc.moveDown(2);

  // === UNDERTAKING POINTS ===
  const points = [
    `I will be regular and sincere in carrying out my internship at the above organization and obey its rules.`,
    `My attendance will be sent regularly to my department by the organization.`,
    `I will attend all project work reviews scheduled in the department and submit the report on time.`,
    `I will update the guide in college regularly through reports reviewed by the guide in the industry.`,
    `I have completed all course work except Project Work I.`,
    `I have ${
      submission.pending_current_courses || 'no'
    } final semester elective courses to study under self-study mode.`,
    `I have enclosed the offer letter for the internship.`,
    `I am aware of internship rules and will abide by the Placement & Training Office regulations.`,
    `I have enclosed my parent's permission letter.`,
    `# I am not in receipt of any other scholarship/stipend.`,
    `* If I intend to receive stipend, I am aware that I will not be eligible for PG Scholarship.`,
  ];
  points.forEach((p, idx) => {
    doc.text(`${idx + 1}. ${p}`, { width: 480 });
    doc.moveDown(0.5);
  });

  doc.text(`* Strike out if not applicable.`, { align: 'left' });
  doc.text(`# PG GATE student has to produce a letter from the company.`, {
    align: 'left',
  });
  doc.moveDown(1.5);

  // === SIGNATURE BOXES ===
  const signY = doc.y;
  doc.text(`Tutor/Programme Co-ordinator`, 70, signY);
  doc.text(`Guide`, 250, signY);
  doc.text(`HoD`, 400, signY);
  doc.moveDown(4);
  doc.text(`(Signature of the Student)`, { align: 'center' });

  // Footer Page 1
  doc.text(`Page 1/2`, 500, 780);

  doc.addPage();

  // === PAGE 2 ===
  doc.fontSize(12).text(`Recommendation from the Department`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(10).text(`Academic details of the student:`);
  doc.text(`NAME: ${s.name}`);
  doc.text(`Roll Number: ${s.rollNumber}`);
  doc.moveDown();

  doc.text(
    `Number of Pending Redo courses: ${submission.pending_redo_courses || 'None'}`,
  );
  doc.text(
    `Number of Pending RA courses: ${submission.pending_ra_courses || 'None'}`,
  );
  doc.text(
    `Pending Courses of current semester: ${submission.pending_current_courses || 'None'}`,
  );
  doc.text(`Remarks: ${submission.remarks || '20XWP1 - Project Work I'}`);
  doc.moveDown(2);

  doc.text(
    `This student can be permitted to accept the internship and complete Project Work I within the specified time period.`,
  );
  doc.moveDown(2);

  // Signatures
  const sY = doc.y;
  doc.text(`Tutor/Programme Coordinator`, 70, sY);
  doc.text(`Guide`, 240, sY);
  doc.text(`HoD`, 360, sY);
  doc.text(`Dean, Placement & Training`, 460, sY);
  doc.moveDown(4);
  doc.text(`Dean - Academic`, 150);
  doc.text(`Principal`, 400);

  doc.moveDown(2);
  doc.text(`* Strike out if not applicable.`, { align: 'left' });
  doc.text(`NOTE:`, { continued: true }).text(
    ` 1. Original Form shall be submitted to Placement Office`,
  );
  doc.text(
    `2. Photo copies shall be submitted to a) Academic section  b) Concerned Department`,
    { indent: 30 },
  );

  // Footer Page 2
  doc.text(`Page 2/2`, 500, 780);

  doc.end();
}


  // Select Department
  @Post('me/select-department')
  @UseGuards(AuthGuard('jwt'))
  async selectDepartment(@Req() req: Request, @Body() body: { departmentId: string }) {
    const payload = req.user as { email: string; role: string };
    if (!payload || payload.role !== 'student') {
      throw new HttpException('Unauthorized: Only students can select department', HttpStatus.UNAUTHORIZED);
    }

    const student = await this.studentRepo.findOne({ where: { email: payload.email } });
    if (!student) throw new HttpException('Student not found', HttpStatus.NOT_FOUND);

    const department = await this.departmentRepo.findOne({ where: { id: body.departmentId } });
    if (!department) throw new HttpException('Department not found', HttpStatus.BAD_REQUEST);

    student.department = department;
    await this.studentRepo.save(student);

    return {
      success: true,
      message: 'Department selected successfully',
      department: department.name,
    };
  }

  // Get Profile
  @Get('me/profile')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(@Req() req: Request) {
    const payload = req.user as { email: string; role: string };
    if (!payload || payload.role !== 'student') {
      throw new HttpException('Unauthorized: Only students can view profile', HttpStatus.UNAUTHORIZED);
    }

    const student = await this.studentRepo.findOne({
      where: { email: payload.email },
      relations: ['department', 'class'],
    });
    if (!student) throw new HttpException('Student not found', HttpStatus.NOT_FOUND);

    if (!student.department) {
      return {
        success: true,
        message: 'Please select a department before viewing or creating a class',
        student: {
          id: student.id,
          email: student.email,
          name: student.name,
          rollNumber: student.rollNumber,
          year: student.year,
          department: null,
          class: null,
        },
      };
    }

    const className = payload.email.slice(0, 4).toUpperCase();
    let studentClass: Class | null = await this.classRepo.findOne({
      where: { name: className, department: { id: student.department.id } },
      relations: ['department'],
    });

    if (!studentClass) {
      studentClass = this.classRepo.create({
        id: className,
        name: className,
        department: student.department,
      });
      studentClass = await this.classRepo.save(studentClass);
    }

    if (!student.class || student.class.id !== studentClass.id) {
      student.class = studentClass;
      await this.studentRepo.save(student);
    }

    return {
      success: true,
      student: {
        id: student.id,
        email: student.email,
        name: student.name,
        rollNumber: student.rollNumber,
        year: student.year,
        department: student.department.name,
        class: studentClass.name,
      },
    };
  }

  // Update Profile
  @Patch('me/update-profile')
  @UseGuards(AuthGuard('jwt'))
  async updateMyProfile(@Req() req: Request, @Body() body: { rollNumber?: string; year?: number; departmentId?: string }) {
    const payload = req.user as { email: string; role: string };
    if (!payload || payload.role !== 'student') {
      throw new HttpException('Unauthorized: Only students can update profile', HttpStatus.UNAUTHORIZED);
    }

    const student = await this.studentRepo.findOne({ where: { email: payload.email }, relations: ['department'] });
    if (!student) throw new HttpException('Student not found', HttpStatus.NOT_FOUND);

    if (body.rollNumber !== undefined) student.rollNumber = body.rollNumber;
    if (body.year !== undefined) student.year = body.year;
    if (body.departmentId !== undefined) {
      const department = await this.departmentRepo.findOne({ where: { id: body.departmentId } });
      if (!department) throw new HttpException('Invalid department ID', HttpStatus.BAD_REQUEST);
      student.department = department;
    }

    await this.studentRepo.save(student);

    return {
      success: true,
      message: 'Profile updated successfully',
      student: {
        id: student.id,
        email: student.email,
        name: student.name,
        rollNumber: student.rollNumber,
        year: student.year,
        department: student.department?.name || 'Unknown',
      },
    };
  }
}
