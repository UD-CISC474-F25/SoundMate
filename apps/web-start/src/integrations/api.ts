import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const BASE_URL = import.meta.env.VITE_BACKEND_URL as string;
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string;

type Json = Record<string, unknown> | Array<unknown>;

class RedirectingForAuthError extends Error {
  constructor() {
    super('redirecting-for-auth');
    this.name = 'RedirectingForAuthError';
  }
}

/** Shared client: get a token safely and make an authorized request */
export function useApiClient() {
  const {
    getAccessTokenSilently,
    loginWithRedirect,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth0();

  const getToken = async (scope?: string) => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: { audience: AUDIENCE, scope },
      });
    } catch (e: any) {
      if (e?.error === 'consent_required' || e?.error === 'login_required') {
        await loginWithRedirect({
          authorizationParams: { audience: AUDIENCE, scope, prompt: 'consent' },
          appState: { returnTo: window.location.pathname },
        });
        // After redirect, the component re-mounts and the next call will succeed.
        throw new RedirectingForAuthError();
      }
      throw e;
    }
  };

  const request = async <T = unknown>(
    path: string,
    init: RequestInit & { scope?: string } = {},
  ): Promise<T> => {
    const token = await getToken(init.scope);
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    if (!res.ok) {
      let errorMessage = `${res.status} ${res.statusText}`;
      try {
        const errorBody = await res.json();
        console.error('[API Error] Response body:', errorBody);
        if (errorBody.message) {
          errorMessage = errorBody.message;
          if (Array.isArray(errorBody.message)) {
            errorMessage = errorBody.message.join(', ');
          }
        }
      } catch (e) {
        // If response is not JSON, use status text
      }
      throw new Error(errorMessage);
    }
    return (await res.json()) as T;
  };

  return { request, isAuthenticated, isAuthLoading };
}

export function useApiQuery<T>(
  queryKey: ReadonlyArray<unknown>,
  path: string,
  init: RequestInit & { scope?: string } = {},
) {
  const { request, isAuthenticated, isAuthLoading } = useApiClient();
  const isEnabled = isAuthenticated && !isAuthLoading;
  const q = useQuery({
    queryKey,
    queryFn: () => request<T>(path, init),
    enabled: isEnabled,
    retry(failureCount, error) {
      if (error instanceof RedirectingForAuthError) return false;
      return failureCount < 3;
    },
    // Optimizations to reduce excessive fetching
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });
  const isAuthPending = isAuthLoading || !isAuthenticated;
  const showLoading = isAuthPending || q.isLoading || q.isFetching;

  return {
    ...q,
    isAuthPending,
    showLoading,
    isEnabled,
  };
}

export function useApiMutation<Input extends Json, Output = unknown>(opts?: {
  /** Default scope for the token when mutating */
  scope?: string;
  /** Optionally compute the request per-variables */
  endpoint?: (variables: Input) => { path: string; method?: string };
  /** Fallback endpoint if you don’t need variables to build it */
  path?: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Query keys to invalidate after success */
  invalidateKeys?: ReadonlyArray<Array<unknown>>;
}) {
  const { request } = useApiClient();
  const qc = useQueryClient();

  return useMutation<Output, Error, Input>({
    mutationFn: async (variables) => {
      const { path, method = opts?.method ?? 'POST' } = opts?.endpoint?.(
        variables,
      ) ?? { path: opts?.path!, method: opts?.method ?? 'POST' };

      return await request<Output>(path, {
        method,
        body: JSON.stringify(variables),
        scope: opts?.scope,
      });
    },
    retry(failureCount, error) {
      // Don’t retry while we’re redirecting; the page will reload anyway
      if (error instanceof RedirectingForAuthError) return false;
      return failureCount < 3;
    },
    onSuccess: async () => {
      if (opts?.invalidateKeys) {
        await Promise.all(
          opts.invalidateKeys.map((k) => qc.invalidateQueries({ queryKey: k })),
        );
      }
    },
  });
}

export type CurrentUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  spotifyStats?: {
    lastSyncedAt: string | null;
  } | null;
};

export function useCurrentUser(opts?: { scope?: string }) {
  return useApiQuery<CurrentUser>(['users', 'me'], '/users/me', {
    // pass through an optional scope if your API requires it
    scope: opts?.scope,
    // You can uncomment any of these if you want the same perf tweaks everywhere:
    // staleTime: 60_000,
    // refetchOnWindowFocus: false,
    // placeholderData: (prev) => prev,
  });
}
