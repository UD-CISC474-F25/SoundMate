# SoundMate — Visual Architecture Map

Companion to [`ARCHITECTURE.md`](./ARCHITECTURE.md). That file explains things
in prose; this one is the same system as diagrams. Read them side by side —
each section here links back to the prose section that narrates it in depth.

GitHub renders all of these Mermaid blocks natively, just view this file on
github.com (or any Mermaid-aware Markdown viewer) rather than as raw text.

## 1. The whole system, one diagram

The monorepo, the two deployables, the external services they talk to, and
which shared packages feed which app.

```mermaid
flowchart TB
    subgraph client["🌐 Browser"]
        UI["apps/web-start<br/>TanStack Start (React)"]
    end

    subgraph external["External services"]
        Auth0["Auth0<br/>(identity / login)"]
        Spotify["Spotify Web API<br/>(OAuth + listening data)"]
    end

    subgraph server["Your infrastructure"]
        API["apps/api<br/>NestJS backend"]
        DB[("PostgreSQL")]
    end

    subgraph shared["packages/* — shared code, imported not deployed"]
        SchemaPkg["packages/api<br/>Zod schemas (shared contract)"]
        DBPkg["packages/database<br/>Prisma schema + generated client"]
    end

    UI -- "1. login redirect" --> Auth0
    Auth0 -- "2. JWT (signed, JWKS-verifiable)" --> UI
    UI -- "3. REST calls, Bearer JWT" --> API
    API -- "4. verify JWT via JWKS" --> Auth0
    UI -- "5. optional: connect Spotify\n(separate OAuth flow)" --> Spotify
    API -- "6. exchange code, fetch top\nartists/songs/genres" --> Spotify
    API -- "5. Prisma queries" --> DB

    SchemaPkg -. "types + runtime validation" .-> UI
    SchemaPkg -. "types + runtime validation" .-> API
    DBPkg -. "typed client + models" .-> API

    style shared fill:#f5f0ff,stroke:#8b5cf6
    style external fill:#fff5f0,stroke:#f97316
```

**Why this shape:** identity (Auth0), taste data (Spotify → Postgres), and the
similarity logic that consumes it are kept as separate concerns on purpose —
see "What the app actually does" in `ARCHITECTURE.md`.

## 2. A single request, end to end

"A logged-in user opens the Discover page" — the seven-step lifecycle from
`ARCHITECTURE.md`, as a sequence diagram instead of a numbered list.

```mermaid
sequenceDiagram
    actor U as User
    participant R as TanStack Router<br/>(discover.tsx)
    participant H as useFriendSuggestions()<br/>(useApiQuery wrapper)
    participant A0 as Auth0
    participant G as JwtAuthGuard<br/>(Passport + JWKS)
    participant C as MatchingController
    participant S as MatchingService
    participant P as Prisma / Postgres

    U->>R: navigates to /discover
    R->>H: component mounts, calls hook
    H->>A0: getAccessTokenSilently({ audience })
    A0-->>H: JWT (scoped to this API)
    H->>C: GET /matching/suggestions<br/>Authorization: Bearer <JWT>
    C->>G: guard runs first
    G->>A0: fetch JWKS, verify signature/issuer/audience
    A0-->>G: keys valid
    G-->>C: request.user populated, allowed through
    C->>S: getFriendSuggestions(userId)
    S->>P: fetch this user's + candidates'<br/>UserTopArtist/Genre/Song rows
    P-->>S: rows
    S->>S: weighted Jaccard similarity<br/>(artists 40% / genres 30% / songs 20% / pattern 10%)
    S-->>C: ranked suggestions
    C-->>H: 200 JSON
    H-->>R: React Query caches under ['matching','suggestions']
    R-->>U: renders ranked list
```

## 3. Two Spotify flows, side by side

The single most important architectural decision in this codebase: **login**
and **linking your Spotify data** are two unrelated flows. Conflating them is
the mistake that made Spotify's dev-mode tester cap block *all* logins, not
just Spotify-data-sync — see "Two Spotify integrations" in
`apps/api/ARCHITECTURE.md`.

```mermaid
flowchart LR
    Start(["User clicks<br/>Log in / Sign up"]) --> Gate{"SpotifyGateModal:<br/>continue with Spotify,<br/>or without it?"}

    Gate -- "With Spotify" --> A0Spotify["Auth0 login,<br/>connection = spotify"]
    Gate -- "Without Spotify" --> A0Pwd["Auth0 login,<br/>connection = Username-Password"]

    A0Spotify --> JWT1["JWT issued"]
    A0Pwd --> JWT2["JWT issued"]

    JWT1 --> App["Logged into the app.<br/>isOnboarded? no → /onboarding"]
    JWT2 --> App

    App --> Onboard["Fill in username/displayName/bio"]
    Onboard --> Choice{"Build taste profile how?"}

    Choice -- "Connect Spotify for real" --> Direct["/auth/spotify/auth-url\n(backend-owned OAuth,\nseparate from Auth0 entirely)"]
    Choice -- "Type it in by hand" --> Manual["TasteProfileForm →\nPOST /users/me/taste-profile"]

    Direct --> Callback["/auth/spotify/callback\n(public route — see state-signing below)"]
    Callback --> Sync["syncTopArtists / syncTopSongs / syncTopGenres"]
    Manual --> Resolve["Case-insensitive match against\nexisting Artist rows, or create new"]

    Sync --> Tables[("UserTopArtist /\nUserTopSong /\nUserTopGenre")]
    Resolve --> Tables

    Tables --> Match["Matching algorithm —\ndoesn't know or care which\npath the data came from"]

    style Gate fill:#eef,stroke:#556
    style Choice fill:#eef,stroke:#556
    style Callback fill:#fee,stroke:#c33
```

**The security detail worth calling out on that "public route":** since
`/auth/spotify/callback` has to be reachable by Spotify's redirect (no bearer
token possible on a browser redirect), the only thing telling the backend
*which user* this callback is for is the `state` parameter. That value is now
HMAC-signed and TTL-bounded specifically because it used to be forgeable —
full writeup in `apps/api/ARCHITECTURE.md`'s security-review section.

## 4. Database schema (Prisma models → Postgres)

Every relation below is a real foreign key in `packages/database/prisma/schema.prisma`.

```mermaid
erDiagram
    USER ||--o| USER_SPOTIFY_STATS : "has (nullable — only if Spotify-connected)"
    USER ||--o{ USER_TOP_ARTIST : "has, per time range"
    USER ||--o{ USER_TOP_SONG : "has, per time range"
    USER ||--o{ USER_TOP_GENRE : "has, per time range"
    ARTIST ||--o{ USER_TOP_ARTIST : "ranked by users"
    SONG ||--o{ USER_TOP_SONG : "ranked by users"
    USER ||--o{ LINK : "owns"
    USER ||--o{ EVENT : "creates"
    ARTIST ||--o{ EVENT : "optionally tagged to"
    EVENT ||--o{ EVENT_ATTENDEE : "has"
    USER ||--o{ EVENT_ATTENDEE : "attends"
    EVENT ||--o{ EVENT_COMMENT : "has"
    USER ||--o{ EVENT_COMMENT : "writes"
    USER ||--o{ CONNECTION : "sends (as requester)"
    USER ||--o{ CONNECTION : "receives"

    USER {
        string id PK
        string auth0Id UK "identity anchor"
        string email UK
        string spotifyId UK "null until connected"
        string username UK
        boolean isOnboarded
    }
    USER_SPOTIFY_STATS {
        string userId FK
        string accessToken
        string refreshToken
        datetime tokenExpiresAt
    }
    ARTIST {
        string id PK
        string spotifyArtistId UK "manual: prefix for hand-typed entries"
        string name
        string[] genres
    }
    SONG {
        string id PK
        string spotifySongId UK
        string name
    }
    USER_TOP_ARTIST {
        string userId FK
        string artistId FK
        int rank "used as 1/rank weight"
        enum timeRange "SHORT / MEDIUM / LONG_TERM"
    }
    USER_TOP_SONG {
        string userId FK
        string songId FK
        int rank
        enum timeRange
    }
    USER_TOP_GENRE {
        string userId FK
        string genre
        int rank
        string timeRange
    }
    EVENT {
        string id PK
        string creatorId FK
        string artistId FK "nullable"
        enum visibility "PUBLIC / PRIVATE"
        int maxAttendees "nullable = unlimited"
    }
    EVENT_ATTENDEE {
        string eventId FK
        string userId FK
        enum status "INVITED/GOING/MAYBE/DECLINED"
    }
    EVENT_COMMENT {
        string eventId FK
        string userId FK
        string content
    }
    LINK {
        string userId FK
        string title
        string url
        int order
    }
    CONNECTION {
        string requesterId FK
        string receiverId FK
        enum status "PENDING / ACCEPTED"
        decimal compatibilityScore "nullable"
    }
```

**The one deliberate omission:** notice `UserTopArtist`/`UserTopSong`/`UserTopGenre`
have no "source" column (Spotify vs. manual). That's not an oversight, it's
the whole reason the manual-taste-profile feature could be built without
touching the matching algorithm. See "Taste data is source-agnostic by
design" in `ARCHITECTURE.md`.

## 5. Backend module map

Every feature folder in `apps/api/src` follows the same
Module → Controller → Service shape (see `apps/api/ARCHITECTURE.md`,
"Anatomy of a feature"). This shows how the feature modules depend on each
other and on the two cross-cutting pieces every one of them uses.

```mermaid
flowchart TD
    subgraph cross["Used by nearly every module"]
        Prisma["PrismaService"]
        Guard["JwtAuthGuard +\n@CurrentUser() decorator"]
        UsersSvc["UsersService<br/>(findOrCreateByAuth0Id)"]
    end

    Auth["auth/<br/>login, onboarding,\nSpotify OAuth (auth-url/callback)"]
    Users["users/<br/>profile CRUD, manual\ntaste-profile submission"]
    Spotify["spotify/<br/>SpotifyService —\nsync top artists/songs/genres"]
    Matching["matching/<br/>compatibility scoring,\nfriend suggestions"]
    Events["events/<br/>create/RSVP/list events"]
    Comments["comments/<br/>event comments"]
    Connections["connections/<br/>friend requests"]
    Links["links/<br/>profile link list"]

    Auth --> Prisma
    Auth --> Spotify
    Users --> Prisma
    Matching --> Prisma
    Events --> Prisma
    Comments --> Prisma
    Connections --> Prisma
    Links --> Prisma

    Users -.->|"exposes findOrCreateByAuth0Id,\ncalled from every other controller"| UsersSvc
    Auth --> Guard
    Users --> Guard
    Matching --> Guard
    Events --> Guard
    Comments --> Guard
    Connections --> Guard
    Links --> Guard

    Events --> Comments
    Matching --> Users

    style cross fill:#f0f9ff,stroke:#0284c7
```

## 6. Matching algorithm data flow

The math behind `MatchingService.calculateCompatibilityScore`, visualized —
prose walkthrough in `apps/api/ARCHITECTURE.md`, "The matching algorithm."

```mermaid
flowchart LR
    subgraph inputs["Per-user taste data (source-agnostic)"]
        A1["UserTopArtist rows"]
        A2["UserTopSong rows"]
        A3["UserTopGenre rows"]
        A4["Listening pattern\n(distribution across\nshort/medium/long term)"]
    end

    A1 --> WJ1["Weighted Jaccard\n(weight = 1/rank)"]
    A2 --> WJ2["Weighted Jaccard\n(weight = 1/rank)"]
    A3 --> WJ3["Weighted Jaccard\n(weight = 1/rank)"]
    A4 --> WJ4["Pattern similarity"]

    WJ1 -->|"× 0.4"| Sum(("+"))
    WJ2 -->|"× 0.2"| Sum
    WJ3 -->|"× 0.3"| Sum
    WJ4 -->|"× 0.1"| Sum

    Sum --> Score["Final compatibility score\n(0.0 – 1.0)"]
    Score --> Suggest["/matching/suggestions —\nranked list of other users"]
    Score --> Conn["Connection.compatibilityScore\n(persisted once a request is sent)"]
```

## 7. Frontend: routes, hooks, and where auth is enforced

`apps/web-start`'s file-based routes, the guard hook every protected page
shares, and the fetch layer every hook is built on — see
`apps/web-start/ARCHITECTURE.md` for the full narrative.

```mermaid
flowchart TD
    subgraph routes["src/routes/*.tsx — file-based routing"]
        Index["index.tsx\n(public homepage)"]
        Onboarding["onboarding.tsx"]
        Profile["profile.tsx"]
        Discover["discover.tsx"]
        Events["events.tsx"]
    end

    subgraph guard["Shared guard"]
        OnbGuard["useOnboardingRedirect()\n— gates on isSuccess,\nnot just 'not loading'"]
    end

    subgraph hooks["src/hooks/* — data + state logic"]
        UseEvents["useEvents"]
        UseProfile["useProfileEdit"]
        UseTaste["useTasteProfile"]
        UseFriends["useFriendSuggestions"]
    end

    subgraph fetch["src/integrations/api.ts"]
        ApiQuery["useApiQuery\n(GET, cached via React Query)"]
        ApiMutation["useApiMutation\n(POST/PATCH/DELETE,\ninvalidates cache keys)"]
    end

    Profile --> OnbGuard
    Discover --> OnbGuard
    Events --> OnbGuard

    Profile --> UseProfile
    Profile --> UseTaste
    Discover --> UseFriends
    Events --> UseEvents

    UseProfile --> ApiMutation
    UseTaste --> ApiMutation
    UseFriends --> ApiQuery
    UseEvents --> ApiQuery
    UseEvents --> ApiMutation

    ApiQuery -->|"attaches Auth0 JWT,\nthrows RedirectingForAuthError\non refresh failure"| Backend[("apps/api")]
    ApiMutation --> Backend

    style guard fill:#f0fff4,stroke:#16a34a
    style fetch fill:#fff7ed,stroke:#ea580c
```

---

**How to use this file when relearning the project:** start at diagram 1 for
the 30,000-foot view, then 2 for how a request actually flows, then 3–4 for
the two hardest design decisions (dual Spotify flows, source-agnostic taste
data), then 5–7 if you need to point at *which file* implements a given box.
