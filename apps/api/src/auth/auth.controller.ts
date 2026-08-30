import { Controller, Post, Body, UseGuards, UsePipes, Get, Res, Query, BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { JwtUser } from './jwt.strategy';
import { LoginIn, CompleteOnboardingIn, AuthOut } from '@repo/api';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { Response } from 'express';
import { PrismaService } from '../prisma.service';
import { SpotifyService } from '../spotify/spotify.service';

// How long a signed `state` value is accepted after being issued. Just a
// defense-in-depth bound (see the class doc comment below for the main
// reason this needs to be signed at all) so a captured state value can't
// be replayed indefinitely.
const SPOTIFY_STATE_TTL_MS = 10 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly spotifyService: SpotifyService,
  ) {}

  @Post('login')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(LoginIn))
  async login(
    @CurrentUser() jwtUser: JwtUser,
    @Body() body: { spotifyAccessToken: string; spotifyRefreshToken: string },
  ): Promise<AuthOut> {
    const result = await this.authService.login(
      jwtUser,
      body.spotifyAccessToken,
      body.spotifyRefreshToken,
    );

    return {
      user: result.user,
      requiresOnboarding: result.requiresOnboarding,
    };
  }

  @Post('onboarding')
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(
    @CurrentUser() jwtUser: JwtUser,
    @Body(new ZodValidationPipe(CompleteOnboardingIn)) body: { email: string; username: string; displayName: string; bio?: string | null },
  ) {
    const existingUser = await this.authService.findByAuth0Id(jwtUser.sub);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const user = await this.authService.completeOnboarding(
      existingUser.id,
      body.email,
      body.username,
      body.displayName,
      body.bio,
    );

    return user;
  }

  @Get('spotify/auth-url')
  @UseGuards(JwtAuthGuard)
  getSpotifyAuthUrl(@CurrentUser() jwtUser: JwtUser) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL}/auth/spotify/callback`;
    const scope = 'user-read-email user-top-read user-read-private';
    const state = this.signState(jwtUser.sub);

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

    return { authUrl };
  }

  @Get('spotify/connect')
  @UseGuards(JwtAuthGuard)
  connectSpotify(@CurrentUser() jwtUser: JwtUser, @Res() res: Response) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL}/auth/spotify/callback`;
    const scope = 'user-read-email user-top-read user-read-private';
    const state = this.signState(jwtUser.sub);

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

    res.redirect(authUrl);
  }

  @Get('spotify/callback')
  async spotifyCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const { auth0Id } = this.verifyState(state);

      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.BACKEND_URL}/auth/spotify/callback`,
        }),
      });

      const tokens = await tokenResponse.json();
      const profile = await this.getProfile(tokens.access_token);

      const user = await this.prisma.user.findUnique({
        where: { auth0Id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          spotifyId: profile.id,
          profilePhotoUrl: profile.images?.[0]?.url,
          spotifyProfileUrl: profile.external_urls?.spotify,
        },
      });

      await this.prisma.userSpotifyStats.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });

      // Start syncing top artists, songs, and genres in the background
      try {
        const tasks = [
          () => this.spotifyService.syncTopArtists(user.id, 'SHORT_TERM'),
          () => this.spotifyService.syncTopArtists(user.id, 'MEDIUM_TERM'),
          () => this.spotifyService.syncTopArtists(user.id, 'LONG_TERM'),
          () => this.spotifyService.syncTopSongs(user.id, 'SHORT_TERM'),
          () => this.spotifyService.syncTopSongs(user.id, 'MEDIUM_TERM'),
          () => this.spotifyService.syncTopSongs(user.id, 'LONG_TERM'),
          () => this.spotifyService.syncTopGenres(user.id, 'SHORT_TERM'),
          () => this.spotifyService.syncTopGenres(user.id, 'MEDIUM_TERM'),
          () => this.spotifyService.syncTopGenres(user.id, 'LONG_TERM'),
        ];

        for (const task of tasks) {
          await task();
        }

      } catch (syncError) {
        console.error('Failed to sync top artists:', syncError);
      }


      res.redirect(`${process.env.FRONTEND_URL}/profile?spotify=connected`);
    } catch (error) {
      console.error('Spotify callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/profile?spotify=error`);
    }
  }

  private async getProfile(accessToken: string) {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Spotify profile');
    }

    return response.json();
  }

  /**
   * The OAuth `state` param round-trips through Spotify's servers and back
   * to us unmodified, so it's the only place we get to stash "which of our
   * users started this flow." It used to just be
   * `base64(JSON.stringify({ auth0Id }))`, base64 is an *encoding*, not a
   * *secret*, anyone can decode or construct one. That meant anyone who
   * knew (or guessed) a victim's auth0Id could start their own Spotify
   * OAuth flow to get a valid `code`, then call our public, unauthenticated
   * `/auth/spotify/callback` directly with `state` set to the victim's
   * auth0Id, causing us to overwrite the victim's spotifyId, photo, and
   * Spotify tokens with the attacker's.
   *
   * Signing the payload with an HMAC (keyed on a secret only this server
   * has) fixes that: the payload can still be *read* by anyone (it's not
   * encrypted, it doesn't need to be, an auth0Id isn't itself sensitive),
   * but it can't be *forged*, only whoever holds the secret can produce a
   * signature that `verifyState` will accept. The `iat` timestamp bounds
   * how long a captured, valid state value could be replayed for.
   */
  private signState(auth0Id: string): string {
    const payload = Buffer.from(
      JSON.stringify({ auth0Id, iat: Date.now() }),
    ).toString('base64url');
    const signature = createHmac('sha256', this.getStateSecret())
      .update(payload)
      .digest('base64url');
    return `${payload}.${signature}`;
  }

  private verifyState(state: string): { auth0Id: string } {
    const [payload, signature] = (state ?? '').split('.');
    if (!payload || !signature) {
      throw new BadRequestException('Invalid state parameter');
    }

    const expectedSignature = createHmac('sha256', this.getStateSecret())
      .update(payload)
      .digest('base64url');

    // Constant-time comparison, a plain `===` would let an attacker use
    // response-timing differences to guess the correct signature one byte
    // at a time.
    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    ) {
      throw new BadRequestException('State signature verification failed');
    }

    const { auth0Id, iat } = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    );
    if (typeof iat !== 'number' || Date.now() - iat > SPOTIFY_STATE_TTL_MS) {
      throw new BadRequestException('State parameter expired');
    }

    return { auth0Id };
  }

  private getStateSecret(): string {
    const secret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!secret) {
      throw new Error('SPOTIFY_CLIENT_SECRET is not configured');
    }
    return secret;
  }
}
