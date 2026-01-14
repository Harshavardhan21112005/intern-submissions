import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as process from 'process'; // Explicitly import process for environment variables

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Authorization header
      ignoreExpiration: false, // Enforce token expiration
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable or fallback
    });
  }

  async validate(payload: any) {
    // Return the payload to attach to the request object
    return { email: payload.email, role: payload.role, sub: payload.sub };
  }
}