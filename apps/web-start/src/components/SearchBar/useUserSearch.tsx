import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  profilePhotoUrl?: string | null;
  bio?: string | null;
  connectionStatus?: 'PENDING' | 'ACCEPTED' | 'NONE';
  isPendingFromThem?: boolean;
  compatibilityScore?: number;
  connectionId?: string | null;
}

export function useUserSearch(
  searchTerm: string,
  getAccessTokenSilently: () => Promise<string>
) {
  const [users, setUsers] = useState<Array<UserProfile>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedTerm = useDebounce(searchTerm, 350);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedTerm || debouncedTerm.trim().length < 2) {
        setUsers([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/discover?search=${encodeURIComponent(debouncedTerm)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const msg = `Search failed: ${res.status} ${res.statusText}`;
          console.warn(msg);
          setError(msg);
          setUsers([]);
          return;
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          console.warn('Unexpected response format:', data);
          setError('Unexpected response format');
          setUsers([]);
          return;
        }

        setUsers(data);
      } catch (err) {
        console.error('Network error fetching users:', err);
        setError('Network error');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, [debouncedTerm, getAccessTokenSilently]);

  return { users, setUsers, loading, error };
}

// Debounce hook
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
