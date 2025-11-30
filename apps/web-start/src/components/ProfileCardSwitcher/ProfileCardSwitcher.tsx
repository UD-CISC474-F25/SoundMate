import { useState } from "react";
import { ArtistCard } from "../ArtistCard/ArtistCard";
import { SongCard } from "../SongCard/SongCard";
import { GenreCard } from "../GenreCard/GenreCard";

type Tab = "artists" | "songs" | "genres";

interface ProfileCardSwitcherProps {
  topArtists: any[];
  topSongs: any[];
  topGenres: string[];
}

export function ProfileCardSwitcher({
  topArtists = [],
  topSongs = [],
  topGenres = [],
}: ProfileCardSwitcherProps) {
  const [tab, setTab] = useState<Tab>("artists");

  const tabClasses = (active: boolean) =>
    active
      ? "font-semibold text-white cursor-pointer"
      : "text-gray-400 hover:text-gray-300 cursor-pointer";

  const gapMap: Record<Tab, string> = {
    artists: "gap-x-56",
    songs: "gap-x-32",
    genres: "gap-x-24",
  };

  const colMap: Record<Tab, string> = {
    artists: "grid-cols-2 sm:grid-cols-3",
    songs: "grid-cols-2 sm:grid-cols-3",
    genres: "grid-cols-2 sm:grid-cols-4", 
  };

  return (
    <div className="w-full">
      <div className="flex gap-8 mb-6 text-xl">
        <p className={tabClasses(tab === "artists")} onClick={() => setTab("artists")}>
          Top Artists
        </p>
        <p className={tabClasses(tab === "songs")} onClick={() => setTab("songs")}>
          Top Songs
        </p>
        <p className={tabClasses(tab === "genres")} onClick={() => setTab("genres")}>
          Top Genres
        </p>
      </div>

      <div className="flex justify-center w-full">
        <div
          className={`
            grid
            ${colMap[tab]}
            ${gapMap[tab]}
            gap-y-10
            max-w-6xl
          `}
        >
          {tab === "artists" &&
            topArtists.slice(0, 6).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}

          {tab === "songs" &&
            topSongs.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}

          {tab === "genres" &&
            topGenres.slice(0, 8).map((genre, i) => (
              <GenreCard key={i} genre={genre} />
            ))}
        </div>
      </div>
    </div>
  );
}
