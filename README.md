# SoundMate

## What is SoundMate

SoundMate is a social app built for college students who care about live
music. It connects to Spotify to learn what someone actually listens to,
then computes a compatibility score between students based on shared
artists, genres, songs, and listening habits. The idea is simple: finding
people to go to a concert with is usually harder than finding the concert
itself.

Beyond just showing a match, SoundMate lets students create and RSVP to
real events, whether that is a show, a listening party, or a jam session,
so a shared taste in music can turn into something people actually do
together. Spotify is optional. Anyone can build a taste profile by hand
instead, so the app still works for someone who uses a different platform
or who just does not want to connect an account.

## Architecture, visualized

The diagrams below walk through the system end to end: the overall
architecture, a single request from start to finish, how Spotify fits in,
the database, the backend's structure, the matching algorithm's math, and
the frontend. View this file on GitHub or any Mermaid-aware Markdown viewer
to render the diagrams.

### 1. High level system overview

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

    subgraph shared["packages/*: shared code, imported not deployed"]
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

The browser only ever talks to: Auth0 for login, and Spotify only if the user
chooses to connect it. Every other request goes to our own backend. Auth0
hands back a signed token after login, and that token rides along on every
request so the backend can confirm who is asking. The backend then talks to
Spotify to pull listening data, and to Postgres to read and store our own
data. The purple box on the right is shared code: one set of schemas that
both the frontend and backend import.

### 2. End to end request life cycle

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

When a user opens the Discover page: the frontend first asks Auth0 for a
token, then sends that token to our backend along with the request. A guard
checks the token is valid before anything else is allowed to run. Once it
passes, the controller asks the matching service for suggestions, the
service pulls each user's music data from Postgres, and runs the similarity
math on it. The result flows back up to the frontend, which caches it, so
the next time this user opens the page it can show instantly without asking
the server again.

### 3. Spotify Integration

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

    Direct --> Callback["/auth/spotify/callback\n(public route, see state-signing below)"]
    Callback --> Sync["syncTopArtists / syncTopSongs / syncTopGenres"]
    Manual --> Resolve["Case-insensitive match against\nexisting Artist rows, or create new"]

    Sync --> Tables[("UserTopArtist /\nUserTopSong /\nUserTopGenre")]
    Resolve --> Tables

    Tables --> Match["Matching algorithm:\ndoesn't know or care which\npath the data came from"]

    style Gate fill:#eef,stroke:#556
    style Choice fill:#eef,stroke:#556
    style Callback fill:#fee,stroke:#c33
```

This shows the two separate paths a user can take through Spotify, which is
the most important design decision in this project. Logging in and
connecting Spotify are not the same thing. A user can log in with just an
email and password, then later choose to either connect Spotify for real or
type in their favorite artists by hand. Both paths end up writing to the
exact same database tables, so the matching algorithm never needs to know
which one a given user took. This split is also what let people demo the
app without needing Spotify's manual approval, since login no longer
depends on Spotify at all.

### 4. Database schema (Prisma models Postgres)

Every relation below is a real foreign key in `packages/database/prisma/schema.prisma`.

```mermaid
erDiagram
    USER ||--o| USER_SPOTIFY_STATS : "has (nullable, only if Spotify-connected)"
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

This is the full data model. A user can have one Spotify connection, and
many top artists, songs, and genres, each tied to a time range like short
term or long term. Artists and songs are their own tables, shared across all
users, so two people who both like the same artist point to the same row
instead of two separate copies of it. Events, comments, and connections all
link back to users the same way, through simple foreign keys. Notice there
is no column anywhere saying whether a row came from Spotify or was typed in
by hand. That is on purpose, and it is why the two paths shown in diagram 3
could share the same matching logic without any special casing.

### 5. Backend module map

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
    Spotify["spotify/<br/>SpotifyService:\nsync top artists/songs/genres"]
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

Every feature in the backend lives in its own folder with the same shape,
whether it is events, comments, connections, or anything else. All of them
share three things: the database service, the login guard, and a helper
that finds or creates a user's own record. That shared helper is called from
almost every controller, so a fix or a change to how a user gets created
only has to happen in one place instead of being copied everywhere.

### 6. Matching algorithm data flow

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
    Score --> Suggest["/matching/suggestions:\nranked list of other users"]
    Score --> Conn["Connection.compatibilityScore\n(persisted once a request is sent)"]
```

This is the actual math behind the compatibility score. For each of
artists, songs, and genres, we compare two users' ranked lists and measure
how much they overlap, weighted so that a shared favorite counts for more
than a shared item buried near the bottom of the list. Those three
overlap scores, plus a fourth one for listening pattern, get combined using
fixed weights into one final number between zero and one. That number is
what powers the ranked suggestions list, and it gets saved permanently once
two users actually connect.

### 7. Frontend: routes, hooks, and where auth is enforced

```mermaid
flowchart TD
    subgraph routes["src/routes/*.tsx: file-based routing"]
        Index["index.tsx\n(public homepage)"]
        Onboarding["onboarding.tsx"]
        Profile["profile.tsx"]
        Discover["discover.tsx"]
        Events["events.tsx"]
    end

    subgraph guard["Shared guard"]
        OnbGuard["useOnboardingRedirect()\ngates on isSuccess,\nnot just 'not loading'"]
    end

    subgraph hooks["src/hooks/*: data + state logic"]
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

On the frontend, each page is its own file, and any page that needs a
completed profile shares one guard hook that redirects to onboarding if the
user has not finished setting one up. Pages never fetch data directly.
Instead they call a hook, like useEvents or useFriendSuggestions, and every
one of those hooks goes through the same two wrapper functions that handle
attaching the login token and caching the response. That means adding a new
feature almost never means writing new fetching logic from scratch, it
means writing one small hook that reuses the same plumbing everything else
already uses.


## Scaling plan

SoundMate runs today on a single backend instance and a single Postgres
database, which is enough for where it is right now. There is a plan for
what changes once that stops being true: a new cache layer, a job queue,
background workers, a read replica, and further out, a learned matching
model. To see the scaling plan, [click here](./ARCHITECTURE.md).
