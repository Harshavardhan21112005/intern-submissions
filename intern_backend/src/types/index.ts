// src/types/index.ts
export interface Student {
  id: string;
  email: string;
  name: string;
  rollNumber: string;
  department: string;
  year: string;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  department: string;
  designation: string;
}

export interface InternshipRequest {
  companyName: string;
  companyLocation: string;
  paidIntern: boolean;
  semesterNumber: number;
  duration: string;
  toolsLearned: string;
  internDescription: string;
  tutorMailId: string;
}