import { z } from 'zod';

// Login with Spotify tokens
export const LoginIn = z.object({
  spotifyAccessToken: z.string().min(1),
  spotifyRefreshToken: z.string().min(1),
});

export type LoginIn = z.infer<typeof LoginIn>;

// Complete onboarding after initial login
export const CompleteOnboardingIn = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(20, { message: 'Username must not exceed 20 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    }),
  displayName: z
    .string()
    .min(2, { message: 'Display name must be at least 2 characters long' })
    .max(50, { message: 'Display name must not exceed 50 characters' }),
  bio: z
    .string()
    .max(500, { message: 'Bio must not exceed 500 characters' })
    .transform((val) => val === '' ? null : val)
    .nullable()
    .optional(),
});

export type CompleteOnboardingIn = z.infer<typeof CompleteOnboardingIn>;

// Auth response with user info
export const AuthOut = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    spotifyId: z.string().nullable(),
    username: z.string(),
    displayName: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
    bio: z.string().nullable(),
    spotifyProfileUrl: z.string().nullable(),
    showSpotifyProfile: z.boolean(),
    createdAt: z.coerce.date(),
    lastLogin: z.coerce.date().nullable(),
  }),
  requiresOnboarding: z.boolean(),
});

export type AuthOut = z.infer<typeof AuthOut>;
