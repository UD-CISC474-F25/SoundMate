import { useState } from "react";
import { useUserSearch } from "../../hooks/useUserSearch";
import { Search, X } from "lucide-react";
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
  onCancel
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { users, loading, error } = useUserSearch(query);

  const handleClearSearch = () => {
    setQuery("");
  };

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      {/* Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          className="w-full rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 pl-10 pr-10 py-3 text-white placeholder-gray-400 outline-none focus:border-white/40 transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Results */}
      {(loading || error || users.length > 0 || query) && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-3 max-h-[32rem] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-gray-400 ml-3">Searching...</p>
            </div>
          )}
          
          {error && <p className="text-red-400 text-center py-4">{error}</p>}

          {!loading && users.length > 0 && (
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div 
                    className="flex items-center gap-3 cursor-pointer mb-2"
                    onClick={() => onSelectUser?.(user)}
                  >
                    {(user.avatar || user.profilePhotoUrl) ? (
                      <img
                        src={user.avatar || user.profilePhotoUrl || ''}
                        alt={user.displayName || user.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {(user.displayName || user.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                    </div>
                    {user.compatibilityScore !== undefined && (
                      <div className="text-green-400 text-sm font-medium flex-shrink-0">
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

          {!loading && !error && query && users.length === 0 && (
            <p className="text-gray-400 text-center py-4">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}