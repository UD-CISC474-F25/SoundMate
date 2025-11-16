import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUser } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findByAuth0Id(auth0Id: string) {
    return this.prisma.user.findUnique({
      where: { auth0Id },
    });
  }

  async login(jwtUser: JwtUser, spotifyAccessToken: string, spotifyRefreshToken: string) {
    const spotifyProfile = await this.fetchSpotifyProfile(spotifyAccessToken);

    // Find user by Auth0 ID instead of email
    let user = await this.prisma.user.findUnique({
      where: { auth0Id: jwtUser.sub },
    });

    if (!user) {
      // Create new user with just auth0Id and Spotify info
      // Email/username will be collected during onboarding
      user = await this.prisma.user.create({
        data: {
          auth0Id: jwtUser.sub,
          spotifyId: spotifyProfile.id,
          profilePhotoUrl: spotifyProfile.images?.[0]?.url ?? null,
          spotifyProfileUrl: spotifyProfile.external_urls?.spotify ?? null,
          lastLogin: new Date(),
          spotifyStats: {
            create: {
              accessToken: spotifyAccessToken,
              refreshToken: spotifyRefreshToken,
              tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
            },
          },
        },
      });

      return {
        user,
        requiresOnboarding: true,
      };
    }

    // Update existing user's last login and Spotify tokens
    user = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        spotifyStats: {
          upsert: {
            create: {
              accessToken: spotifyAccessToken,
              refreshToken: spotifyRefreshToken,
              tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
            },
            update: {
              accessToken: spotifyAccessToken,
              refreshToken: spotifyRefreshToken,
              tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
            },
          },
        },
      },
    });

    const requiresOnboarding = !user.isOnboarded;

    return {
      user,
      requiresOnboarding,
    };
  }

  async completeOnboarding(userId: string, email: string, username: string, displayName: string, bio?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email,
        username,
        displayName,
        bio,
        isOnboarded: true,
      },
    });

    return user;
  }

  private async fetchSpotifyProfile(accessToken: string): Promise<any> {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch Spotify profile');
    }

    return response.json();
  }
}
