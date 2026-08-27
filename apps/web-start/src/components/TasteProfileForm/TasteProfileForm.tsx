import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import {
  SUGGESTED_GENRES,
  SUGGESTED_ARTISTS,
  TASTE_PROFILE_LIMITS,
} from '../../constants/tasteProfile';

type TasteProfileFormProps = {
  onSubmit: (data: { artists: Array<string>; genres: Array<string> }) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isSubmitting: boolean;
};

const { MIN_ARTISTS, MAX_ARTISTS, MIN_GENRES, MAX_GENRES } = TASTE_PROFILE_LIMITS;

export function TasteProfileForm({ onSubmit, onCancel, isSubmitting }: TasteProfileFormProps) {
  const [artists, setArtists] = useState<Array<string>>([]);
  const [artistInput, setArtistInput] = useState('');
  const [genres, setGenres] = useState<Array<string>>([]);
  const [error, setError] = useState<string | null>(null);

  const addArtist = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || artists.length >= MAX_ARTISTS) return;
    if (artists.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setArtistInput('');
      return;
    }
    setArtists([...artists, trimmed]);
    setArtistInput('');
  };

  const removeArtist = (name: string) => {
    setArtists(artists.filter((a) => a !== name));
  };

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else if (genres.length < MAX_GENRES) {
      setGenres([...genres, genre]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (artists.length < MIN_ARTISTS) {
      setError(`Add at least ${MIN_ARTISTS} artists to build your profile.`);
      return;
    }
    if (genres.length < MIN_GENRES) {
      setError('Pick at least 1 genre.');
      return;
    }

    const result = await onSubmit({ artists, genres });
    if (!result.success) {
      setError(result.error || 'Failed to save your taste profile. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-400">
        No Spotify connection needed — just tell us what you're into. This powers
        the same matching algorithm as a real Spotify sync, so you'll still show
        up in other people's suggestions.
      </p>

      {/* Artists */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Top artists * <span className="text-gray-500">({artists.length}/{MAX_ARTISTS}, min {MIN_ARTISTS})</span>
        </label>

        {artists.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {artists.map((artist) => (
              <span
                key={artist}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-white"
              >
                {artist}
                <button
                  type="button"
                  onClick={() => removeArtist(artist)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                  aria-label={`Remove ${artist}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            list="taste-profile-artist-suggestions"
            value={artistInput}
            onChange={(e) => setArtistInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArtist(artistInput);
              }
            }}
            placeholder="Type an artist and press Enter..."
            disabled={artists.length >= MAX_ARTISTS}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => addArtist(artistInput)}
            disabled={!artistInput.trim() || artists.length >= MAX_ARTISTS}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Add artist"
          >
            <Plus size={18} />
          </button>
        </div>
        <datalist id="taste-profile-artist-suggestions">
          {SUGGESTED_ARTISTS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <p className="text-xs text-gray-500 mt-1.5">
          Ranked in the order you add them — your first pick counts the most.
        </p>
      </div>

      {/* Genres */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Genres * <span className="text-gray-500">({genres.length}/{MAX_GENRES}, min {MIN_GENRES})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_GENRES.map((genre) => {
            const selected = genres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                disabled={!selected && genres.length >= MAX_GENRES}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  selected
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border-2 border-white/40 hover:border-white/60 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : 'Save Taste Profile'}
        </button>
      </div>
    </form>
  );
}
