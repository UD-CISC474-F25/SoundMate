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
  @UsePipes(new ZodValidationPipe(CompleteOnboardingIn))
  async completeOnboarding(
    @CurrentUser() jwtUser: JwtUser,
    @Body() body: { username: string; displayName: string; bio?: string },
  ) {
    const user = await this.authService.completeOnboarding(
      jwtUser.sub,
      body.username,
      body.displayName,
      body.bio,
    );

    return user;
  }
}
