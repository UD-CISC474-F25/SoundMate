// Copied from https://github.com/dustintran1324/f25-cisc474-individual/blob/main/apps/api/src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

export interface JwtUser {
  sub: string; // Auth0 user ID
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_ISSUER_URL}.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_ISSUER_URL,
      algorithms: ['RS256'],
    });
  }

  validate(payload: any): JwtUser {
    return {
      sub: payload.sub,
      email: payload.email || payload['https://myapp.com/email'] || payload.nickname,
      name: payload.name || payload['https://myapp.com/name'] || payload.nickname,
      picture: payload.picture || payload['https://myapp.com/picture'],
      email_verified: payload.email_verified,
    };
  }
}