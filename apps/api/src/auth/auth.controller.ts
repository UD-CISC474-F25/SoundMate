import { Controller, Post, Body, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { JwtUser } from './jwt.strategy';
import { LoginIn, CompleteOnboardingIn, AuthOut } from '@repo/api';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    console.log('Onboarding request body:', JSON.stringify(body, null, 2));
    console.log('JWT User:', jwtUser);

    // First find the user by auth0Id to get their userId
    const existingUser = await this.authService.findByAuth0Id(jwtUser.sub);
    console.log('Existing user:', existingUser);

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
}
