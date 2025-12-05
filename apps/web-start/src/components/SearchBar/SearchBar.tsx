import { useState } from "react";
import { Search, X } from "lucide-react";
import { useUserSearch } from "../../hooks/useUserSearch";
import ConnectionButton from "../ConnectionButton/ConnectionButton";
import { getUserConnectionStatus } from "../../utils/connectionUtils";
import type { UserProfile } from "../../hooks/useUserSearch";

interface SearchBarProps {
  onSelectUser?: (user: UserProfile) => void;
  placeholder?: string;
  className?: string;
  onConnect: (userId: string) => void;
  onAccept: (connectionId: string) => void;
  onCancel: (connectionId: string) => void;
}

export default function SearchBar({
  onSelectUser,
  placeholder = "Search users...",
  className = "",
  onConnect,
  onAccept,
  onCancel,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { users, loading, error } = useUserSearch(query);

  const handleClearSearch = () => {
    setQuery("");
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Input */}
      <div className="relative mb-4">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
          size={24}
          strokeWidth={2}
        />

        <input
          className="w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 pl-14 pr-14 py-5 text-white text-lg placeholder-gray-400 outline-none focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/10 transition-all duration-200 shadow-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />

        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all duration-200"
            aria-label="Clear search"
          >
            <X size={22} />
          </button>
        )}
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 max-h-[48rem] overflow-y-auto shadow-xl">

          {/* Loading (non-blocking) */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
              <p className="text-gray-300 ml-2 font-medium">Searching...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-center py-4">{error}</p>
          )}

          {/* User Results */}
          {!error && users.length > 0 && (
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-all duration-200 border border-white/10 hover:border-white/20 hover:shadow-lg group"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer mb-3"
                    onClick={() => onSelectUser?.(user)}
                  >
                    {(user.avatar || user.profilePhotoUrl) ? (
                      <img
                        src={user.avatar || user.profilePhotoUrl || ""}
                        alt={user.displayName || user.username}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-200">
                        <span className="text-white font-bold text-2xl">
                          {(user.displayName || user.username)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-lg truncate group-hover:text-white/90 transition-colors">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-gray-400 text-base truncate">
                        @{user.username}
                      </p>
                    </div>

                    {user.compatibilityScore !== undefined && (
                      <div className="text-green-400 text-base font-semibold flex-shrink-0 bg-green-400/10 px-4 py-2 rounded-full">
                        {user.compatibilityScore}% match
                      </div>
                    )}
                  </div>

                  {/* Connection Button */}
                  <ConnectionButton
                    connectionStatus={getUserConnectionStatus(user)}
                    connectionId={user.connectionId || undefined}
                    userId={user.id}
                    onConnect={onConnect}
                    onAccept={onAccept}
                    onCancel={onCancel}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* No Results */}
          {!loading && !error && users.length === 0 && (
            <p className="text-gray-400 text-center py-8">
              No users found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
