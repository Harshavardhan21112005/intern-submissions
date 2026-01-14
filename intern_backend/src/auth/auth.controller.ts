// src/auth/auth.controller.ts
import { Controller, Get, Post, Body, Req, Res, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const user = await this.authService.findStudentByEmail(loginDto.email);
      if (!user || user.password !== loginDto.password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = await this.authService.generateToken(user.email, 'student', user.id);
      res.cookie('token', token, { httpOnly: true });
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          rollNumber: user.rollNumber,
          department: user.department,
          year: user.year,
          role: 'student',
        },
        token,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Login failed',
      });
    }
  }

  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException('No authorization header', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = this.authService.decodeToken(token) as { email: string; sub: string; role: string };
    if (!payload || !payload.email) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.authService.findStudentByEmail(payload.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rollNumber: user.rollNumber,
        department: user.department,
        year: user.year,
        role: payload.role,
      },
    };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthRedirect(@Req() req, @Res() res: Response) {
  const { access_token, user } = req.user;

  // 🛑 If these are undefined, your strategy is broken
  if (!access_token || !user) {
    console.error('Missing access_token or user in req.user:', req.user);
    return res.redirect('http://localhost:5173?error=missing_token_user');
  }

  const isStudent = /^[0-9]/.test(user.email.split('@')[0]);
  const role = isStudent ? 'student' : 'staff';
  const enrichedUser = { ...user, role };

  console.log('Redirecting to frontend with token and user');

  return res.redirect(
    `http://localhost:5173/auth/google/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(enrichedUser))}`
  );
}

}