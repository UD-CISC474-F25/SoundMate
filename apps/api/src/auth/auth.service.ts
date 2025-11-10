import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUser } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(jwtUser: JwtUser, spotifyAccessToken: string, spotifyRefreshToken: string) {
    const spotifyProfile = await this.fetchSpotifyProfile(spotifyAccessToken);

    let user = await this.prisma.user.findUnique({
      where: { email: jwtUser.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: jwtUser.email,
          spotifyId: spotifyProfile.id,
          username: `user_${spotifyProfile.id.slice(0, 8)}`,
          displayName: spotifyProfile.display_name,
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

    const requiresOnboarding = user.username.startsWith('user_') || !user.displayName;

    return {
      user,
      requiresOnboarding,
    };
  }

  async completeOnboarding(userId: string, username: string, displayName: string, bio?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username is already taken');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username,
        displayName,
        bio,
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
