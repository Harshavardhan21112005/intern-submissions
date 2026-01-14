// src/mail/mail.service.ts
import * as nodemailer from 'nodemailer';

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'psg.clubs.association@gmail.com', // ✅ Your Gmail address
        pass: 'bgafiabxdtgrpmcm',                // ✅ Your App Password (no spaces)
      },
    });
  }

  async sendTutorNotification(
    tutorEmail: string,
    studentName: string,
    rollNumber: string,
  ): Promise<void> {
    const mailOptions = {
      from: '"Internship Portal" <psg.clubs.association@gmail.com>',
      to: tutorEmail,
      subject: 'Internship Letter Request',
      text: `Dear Tutor,\n\nStudent ${studentName} (Roll No: ${rollNumber}) has requested an internship letter.\n\nRegards,\nInternship System`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent to tutor:', tutorEmail);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }
  async sendStudentNotification(studentEmail: string, studentName: string, status: string, remarks: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: studentEmail,
      subject: `Internship Submission ${status === 'accepted' ? 'Approved' : 'Declined'}`,
      text: `Dear ${studentName},\nYour internship submission has been ${status}.\nRemarks: ${remarks}`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
