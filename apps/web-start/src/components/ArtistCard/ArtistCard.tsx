type TopArtist = {
  id: string;
  spotifyArtistId: string;
  name: string;
  genres: Array<string>;
  imageUrl?: string | null;
  spotifyUri?: string | null;
  rank: number;
  timeRange: string;
};

interface ArtistCardProps {
  artist: TopArtist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  // Convert spotify URI to web URL
  const getSpotifyUrl = () => {
    if (artist.spotifyUri) {
      // spotify:artist:ID -> https://open.spotify.com/artist/ID
      const artistId = artist.spotifyUri.split(':')[2];
      return `https://open.spotify.com/artist/${artistId}`;
    }
    return null;
  };

  const spotifyUrl = getSpotifyUrl();

  const content = (
    <>
      <img
        src={artist.imageUrl || '/placeholder-artist.jpg'}
        alt={artist.name}
        className="w-24 h-24 rounded-full mx-auto mb-2 object-cover bg-gray-800 transition-transform"
      />
      <p className="font-medium text-white">{artist.name}</p>
      <p className="text-xs text-gray-400">
        {artist.genres.slice(0, 2).join(', ')}
      </p>
    </>
  );

  if (spotifyUrl) {
    return (
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center block hover:scale-105 transition-transform cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return <div className="text-center">{content}</div>;
}
