// Curated picks for the manual taste-profile builder (used by anyone who
// hasn't connected Spotify yet). These are just suggestions to speed up
// typing — the artist field accepts any free-text name.

export const SUGGESTED_GENRES = [
  'pop', 'hip hop', 'r&b', 'indie rock', 'indie pop', 'alternative',
  'electronic', 'house', 'techno', 'hyperpop', 'edm', 'k-pop',
  'country', 'folk', 'jazz', 'classical', 'metal', 'punk',
  'lo-fi', 'reggaeton', 'latin', 'afrobeats', 'soul', 'funk',
] as const;

export const SUGGESTED_ARTISTS = [
  'Taylor Swift', 'Drake', 'Bad Bunny', 'The Weeknd', 'Billie Eilish',
  'Kendrick Lamar', 'SZA', 'Frank Ocean', 'Tyler, The Creator', 'Beyoncé',
  'Charli XCX', 'Porter Robinson', 'Flume', 'Aphex Twin', 'Grimes',
  'Arctic Monkeys', 'Tame Impala', 'Radiohead', 'Mac Miller', 'Kanye West',
  '100 gecs', 'Magdalena Bay', 'Yaeji', 'AG Cook', 'Fred again..',
  'Ariana Grande', 'Doja Cat', 'Travis Scott', 'Lana Del Rey', 'Phoebe Bridgers',
] as const;

export const TASTE_PROFILE_LIMITS = {
  MIN_ARTISTS: 3,
  MAX_ARTISTS: 15,
  MIN_GENRES: 1,
  MAX_GENRES: 10,
} as const;
