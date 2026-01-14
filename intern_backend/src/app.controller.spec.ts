import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions/submissions.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './entities/students.entity';
import { Staff } from './entities/staffs.entity';
import { Submission } from './entities/submissions.entity';
import { Repository } from 'typeorm';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let studentRepo: Repository<Student>;
  let staffRepo: Repository<Staff>;
  let submissionRepo: Repository<Submission>;

  const mockStudent = {
    id: 'stu123',
    email: '23pw09@psgtech.ac.in',
    name: 'Harsha',
  } as Student;

  const mockStaff = {
    id: 'staff456',
    email: 'sreeja@psgtech.ac.in',
    name: 'Dr. Sreeja',
  } as Staff;

  const mockSubmission = {
    id: 'sub789',
    company_name: 'KLA',
  } as Submission;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        {
          provide: getRepositoryToken(Student),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockStudent),
          },
        },
        {
          provide: getRepositoryToken(Staff),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockStaff),
          },
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: {
            create: jest.fn().mockReturnValue(mockSubmission),
            save: jest.fn().mockResolvedValue(mockSubmission),
          },
        },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    studentRepo = module.get<Repository<Student>>(getRepositoryToken(Student));
    staffRepo = module.get<Repository<Staff>>(getRepositoryToken(Staff));
    submissionRepo = module.get<Repository<Submission>>(getRepositoryToken(Submission));
  });

  it('should create a new submission successfully', async () => {
    const dto = {
      company_name: 'KLA',
      role: 'Developer Intern',
      start_date: '2025-07-01',
      end_date: '2025-07-30',
      supervisor_name: 'John Doe',
      supervisor_email: 'john@kla.com',
      tutor_email: 'sreeja@psgtech.ac.in',
      description: 'Great internship',
      document_url: null,
    };

    const result = await controller.createSubmission(dto);

    expect(result).toEqual({
      success: true,
      message: 'Submission recorded successfully',
      submissionId: mockSubmission.id,
    });

    expect(studentRepo.findOne).toHaveBeenCalledWith({
      where: { email: '23pw09@psgtech.ac.in' },
    });

    expect(staffRepo.findOne).toHaveBeenCalledWith({
      where: { email: dto.tutor_email },
    });

    expect(submissionRepo.create).toHaveBeenCalled();
    expect(submissionRepo.save).toHaveBeenCalled();
  });
});
