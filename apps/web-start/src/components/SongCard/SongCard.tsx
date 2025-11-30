interface SongCardProps {
  song: {
    id: string;
    name: string;
    albumImage: string;
    artists: string[];
    spotifyUri?: string;
  };
}

export function SongCard({ song }: SongCardProps) {
  const getSpotifyUrl = () => {
    if (song.spotifyUri) {
      const id = song.spotifyUri.split(":")[2];
      return `https://open.spotify.com/track/${id}`;
    }
    return null;
  };

  const spotifyUrl = getSpotifyUrl();

  const content = (
    <>
      <img
        src={song.albumImage}
        alt={song.name}
        className="w-24 h-24 rounded-md mx-auto mb-2 object-cover bg-gray-800 transition-transform"
      />

      <p className="font-medium text-white">
        {song.name}
      </p>

      <p className="text-xs text-gray-400">
        {song.artists.slice(0, 2).join(", ")}
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
