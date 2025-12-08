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
      ? "font-semibold text-white cursor-pointer border-b-2 border-white/90 pb-1 transition-all"
      : "text-gray-400 hover:text-gray-300 cursor-pointer border-b border-white/30 hover:border-white/50 pb-1 transition-all";

  const gapMap: Record<Tab, string> = {
    artists: "gap-x-4 sm:gap-x-8 md:gap-x-16 lg:gap-x-56",
    songs: "gap-x-4 sm:gap-x-6 md:gap-x-12 lg:gap-x-32",
    genres: "gap-x-3 sm:gap-x-4 md:gap-x-8 lg:gap-x-24",
  };

  const colMap: Record<Tab, string> = {
    artists: "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3",
    songs: "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3",
    genres: "grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4",
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 sm:gap-8 mb-6 text-lg sm:text-xl">
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
            gap-y-6 sm:gap-y-10
            max-w-6xl
            w-full
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