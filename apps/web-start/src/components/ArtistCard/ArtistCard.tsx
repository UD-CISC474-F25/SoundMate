type TopArtist = {
  id: string;
  spotifyArtistId: string;
  name: string;
  genres: Array<string>;
  imageUrl?: string | null;
  rank: number;
  timeRange: string;
};

interface ArtistCardProps {
  artist: TopArtist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <div className="text-center">
      <img
        src={artist.imageUrl || '/placeholder-artist.jpg'}
        alt={artist.name}
        className="w-24 h-24 rounded-full mx-auto mb-2 object-cover bg-gray-800"
      />
      <p className="font-medium text-white">{artist.name}</p>
      <p className="text-xs text-gray-400">
        {artist.genres.slice(0, 2).join(', ')}
      </p>
    </div>
  );
}
