# SoundMate Visual Architecture Map

## 1. High level system overview

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

## 2. End to end request life cycle

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

## 3. Spotify Integration

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

## 4. Database schema (Prisma models Postgres)

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
## 5. Backend module map

Every feature folder in `apps/api/src` follows the same
Module -> Controller -> Service shape

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

## 8. The scaling plan — what changes, and what doesn't

Diagrams 1–7 show the system as it exists today. This one shows the same
system **after** the fixes from the system-design review, colored so it's
obvious at a glance what's untouched, what's an existing piece with new
responsibilities, and what's genuinely new infrastructure. 

```mermaid
flowchart TB
    classDef existing fill:#eef2ff,stroke:#6366f1,color:#1e1b4b
    classDef modified fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef new fill:#dcfce7,stroke:#16a34a,color:#14532d

    subgraph legend[" "]
        direction LR
        L1["Unchanged"]:::existing
        L2["Existing piece,\nnew responsibility"]:::modified
        L3["New infrastructure"]:::new
    end

    UI["apps/web-start"]:::existing

    subgraph edge["Edge"]
        Gateway["API Gateway / reverse proxy\n+ rate limiting"]:::new
    end

    subgraph appTier["App tier — horizontally scaled\n(possible today only because auth is stateless)"]
        API1["apps/api\ninstance 1"]:::modified
        API2["apps/api\ninstance 2..N"]:::modified
    end

    subgraph cacheQueue["Cache + queue"]
        Redis[("Redis")]:::new
        Queue["Job queue\n(BullMQ, backed by Redis)"]:::new
    end

    subgraph workers["Background workers — new process, same code reused"]
        SyncWorker["Spotify sync worker\n(the 9 sequential API calls,\nmoved out of the request path)"]:::new
        ScoreWorker["Score precomputation worker\n(recomputes matching scores\nwhen taste data changes)"]:::new
    end

    subgraph dataTier["Data tier"]
        Primary[("Postgres\nprimary — writes")]:::existing
        Replica[("Postgres\nread replica(s)")]:::new
    end

    subgraph media["Media"]
        ObjStore[("Object storage\n(S3 / R2)")]:::new
        CDN["CDN"]:::new
    end

    subgraph externalSvc["External services — unchanged"]
        Auth0["Auth0"]:::existing
        Spotify["Spotify Web API"]:::existing
    end

    UI --> Gateway
    Gateway --> API1
    Gateway --> API2
    API1 -. verify JWT .-> Auth0
    API2 -. verify JWT .-> Auth0

    API1 -->|"hot reads: cached\nmatch scores, sessions"| Redis
    API2 --> Redis
    API1 -->|"writes"| Primary
    API2 --> Primary
    API1 -->|"reads: profile lists,\nevent feeds, cursor-paginated"| Replica
    API2 --> Replica
    Primary -. "replication" .-> Replica

    API1 -->|"enqueue: 'sync this user',\nreturns immediately instead of\nblocking on 9 Spotify calls"| Queue
    API1 -->|"enqueue: 'recompute scores\nfor this user'"| Queue
    Queue --> SyncWorker
    Queue --> ScoreWorker

    SyncWorker --> Spotify
    SyncWorker --> Primary
    SyncWorker -->|"downloads photo once,\nno longer hotlinked"| ObjStore
    ScoreWorker --> Primary
    ScoreWorker -->|"writes precomputed scores"| Redis

    ObjStore --> CDN
    CDN --> UI

    style edge fill:#f8fafc,stroke:#94a3b8
    style cacheQueue fill:#f0fdf4,stroke:#86efac
    style workers fill:#f0fdf4,stroke:#86efac
    style media fill:#f0fdf4,stroke:#86efac
    style externalSvc fill:#f8fafc,stroke:#94a3b8
```

- **Blue (unchanged)** — `apps/web-start`, Auth0, Spotify's API, and the
  Postgres primary all keep doing exactly what they do today. 
- **Amber (existing, new responsibility)** — `apps/api` doesn't change what
  it *is*, but two things change about how it's run: (1) it's deployed as
  multiple stateless replicas behind a gateway instead of one instance,
  which — worth repeating — is only a small ops change *because* auth was
  already stateless (see diagram-1 discussion); (2) the Spotify-callback and
  taste-profile endpoints stop doing slow work inline and instead just drop
  a message on the queue and return, which is a small code change (a queue
  client call replacing a direct function call), not a rewrite.
- **Green (new)** — everything actually new: the gateway (rate limiting),
  Redis (cache + queue backing store), the two background workers, the read
  replica, and object storage + CDN for images. This is genuinely additive
  infrastructure — it sits *around* the existing system rather than
  replacing pieces of it, which is why the diagram from section 1 doesn't
  need to be thrown out, just extended.

**What each new piece solves, mapped back to the specific problem:**

| New piece | Solves |
|---|---|
| API Gateway + rate limiting | Nothing currently protects endpoints from abuse or accidental traffic spikes eating Spotify's rate limit |
| Redis cache | Hot reads (precomputed match scores especially) currently hit Postgres every time, with nothing absorbing repeats |
| Job queue + Spotify sync worker | The OAuth callback currently blocks on 9 sequential Spotify calls before it can respond; one slow/failed call currently stalls the whole request |
| Score precomputation worker | `getFriendSuggestions` currently recomputes every pairwise score live, on every page load — O(N) per request, O(N²) system-wide |
| Postgres read replica | Read-heavy pages (Discover, event feeds) currently compete with writes for the same database connections |
| Object storage + CDN | Profile photos currently hotlink Spotify's CDN directly, which is why the "stale URL" bug happened at all — the app owns none of its own image availability |

