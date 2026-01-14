import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as process from 'process';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID! || "1084022078678-iu6qvu34p84bug2ed2gepeu46094m13j.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET! || "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",
      callbackURL: process.env.GOOGLE_CALLBACK_URL! || "http://localhost:3000/auth/google/callback",
      scope: ['email', 'profile'],
    });
  }

  async validate(
  accessToken: string,
  _refreshToken: string,
  profile: Profile,
  done: (err: any, user: any, info?: any) => void,
) {
  const { emails, displayName, photos } = profile;
  const email = emails?.[0]?.value;
  if (!email) {
    return done(new Error('No email in Google profile'), null);
  }

  const userData = {
    email,
    name: displayName,
    picture: photos?.[0]?.value,
  };

  const result = await this.authService.validateOAuthLogin(userData);

  const payload = {
    access_token: result.access_token,
    user: result.user,
  };

  done(null, payload); // this becomes req.user
}

}