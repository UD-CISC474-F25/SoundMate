import { Controller, Post, Body, UseGuards, UsePipes, Get, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { JwtUser } from './jwt.strategy';
import { LoginIn, CompleteOnboardingIn, AuthOut } from '@repo/api';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { Response } from 'express';
import { PrismaService } from '../prisma.service';
import { SpotifyService } from '../spotify/spotify.service';

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
    const state = Buffer.from(JSON.stringify({ auth0Id: jwtUser.sub })).toString('base64');

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
    const state = Buffer.from(JSON.stringify({ auth0Id: jwtUser.sub })).toString('base64');

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
      const { auth0Id } = JSON.parse(Buffer.from(state, 'base64').toString());

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

        console.log('Successfully synced all top artists for user:', user.id);

      } catch (syncError) {
        console.error('Failed to sync top artists:', syncError);
      }


      res.redirect(`${process.env.FRONTEND_URL}/discover?spotify=connected`);
    } catch (error) {
      console.error('Spotify callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/discover?spotify=error`);
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
}
