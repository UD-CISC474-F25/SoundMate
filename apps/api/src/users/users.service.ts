import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/jwt.strategy';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {} // Will need to add SpotifyService here later

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /*
  async findByAuth0Id(auth0Id: string) {
    return this.prisma.user.findUnique({
      where: { auth0Id },
    });
  }

  async createFromAuth0(jwtUser: JwtUser, spotifyAccessToken: string) { // pass access token from frontend
    const spotifyProfile = await this.spotifyService.getProfile(spotifyAccessToken);

    return this.prisma.user.upsert({
        where: { email: spotifyProfile.email },
        create: {
        email: spotifyProfile.email,
        spotifyId: spotifyProfile.id,
        username: null, // user picks later during onboarding
        displayName: null, // user picks later during onboarding
        profilePhotoUrl: spotifyProfile.images?.[0]?.url ?? null,
        spotifyProfileUrl: spotifyProfile.external_urls?.spotify ?? null,
    }
});
}
*/

}