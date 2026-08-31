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
the database, the backend's structure, the matching algorithm's math, the
frontend, and a plan for scaling it further. View this file on GitHub or
any Mermaid-aware Markdown viewer to render the diagrams.

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

### 8. The scaling plan: what changes, and what doesn't

Diagrams 1 through 7 show the system as it exists today. This one shows the
same system after the fixes from a system-design review, colored so it is
obvious at a glance what's untouched, what's an existing piece with new
responsibilities, and what's genuinely new infrastructure.

```mermaid
flowchart TB
    classDef existing fill:#eef2ff,stroke:#6366f1,color:#1e1b4b
    classDef modified fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef new fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef future fill:#f3e8ff,stroke:#9333ea,color:#581c87,stroke-dasharray:4 3

    subgraph legend[" "]
        direction LR
        L1["Unchanged"]:::existing
        L2["Existing piece,\nnew responsibility"]:::modified
        L3["New infrastructure"]:::new
        L4["Further out,\ngated on data volume"]:::future
    end

    UI["apps/web-start"]:::existing

    subgraph edge["Edge"]
        Gateway["API Gateway / reverse proxy\n+ rate limiting"]:::new
    end

    subgraph appTier["App tier: horizontally scaled\n(possible today only because auth is stateless)"]
        API1["apps/api\ninstance 1"]:::modified
        API2["apps/api\ninstance 2..N"]:::modified
    end

    subgraph cacheQueue["Cache + queue"]
        Redis[("Redis")]:::new
        Queue["Job queue\n(BullMQ, backed by Redis)"]:::new
    end

    subgraph workers["Background workers: new process, same code reused"]
        SyncWorker["Spotify sync worker\n(the 9 sequential API calls,\nmoved out of the request path)"]:::new
        ScoreWorker["Score precomputation worker\n(recomputes matching scores\nwhen taste data changes)"]:::new
    end

    subgraph learnedMatch["Matching score, phase 2: only once there's\nenough real interaction data to learn from"]
        InteractionLog[("Interaction log\nrequest sent? accepted?\nco-attended an event?")]:::future
        TrainJob["Offline training job\n(periodic batch retrain, not\nreal-time / online learning)"]:::future
        ModelArtifact[("Trained model\n(gradient-boosted trees\nor random forest)")]:::future
    end

    subgraph dataTier["Data tier"]
        Primary[("Postgres\nprimary: writes")]:::existing
        Replica[("Postgres\nread replica(s)")]:::new
    end

    subgraph media["Media"]
        ObjStore[("Object storage\n(S3 / R2)")]:::new
        CDN["CDN"]:::new
    end

    subgraph externalSvc["External services: unchanged"]
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

    Primary -.->|"logs outcomes on\nreal user actions"| InteractionLog
    InteractionLog -.-> TrainJob
    TrainJob -.->|"engineered features: per-signal\nweighted overlaps, shared-event\nhistory, mutual connections..."| ModelArtifact
    ModelArtifact -.->|"loaded by; hybrid:\nlearned score once a pair has\nenough history, heuristic\nfallback otherwise (cold start)"| ScoreWorker

    ObjStore --> CDN
    CDN --> UI

    style edge fill:#f8fafc,stroke:#94a3b8
    style cacheQueue fill:#f0fdf4,stroke:#86efac
    style workers fill:#f0fdf4,stroke:#86efac
    style media fill:#f0fdf4,stroke:#86efac
    style externalSvc fill:#f8fafc,stroke:#94a3b8
    style learnedMatch fill:#faf5ff,stroke:#d8b4fe
```

This diagram is not what is running today, it is the plan for when the app
needs to grow past a few hundred users. The blue pieces stay exactly as they
are. The amber piece is the backend, still the same code, just run as
several copies behind a gateway instead of one instance. The green pieces
are genuinely new: a cache, a job queue, two background workers, a read
replica, and storage for images that we own instead of borrowing from
Spotify. The purple, dashed piece is further out still: a learned matching
model, and it only gets built once there is enough real user data to train
it on. Nothing here replaces what exists, it all gets added around it.

- **Blue (unchanged):** `apps/web-start`, Auth0, Spotify's API, and the
  Postgres primary all keep doing exactly what they do today.
- **Amber (existing, new responsibility):** `apps/api` doesn't change what
  it *is*, but two things change about how it's run. First, it's deployed as
  multiple stateless replicas behind a gateway instead of one instance,
  which, worth repeating, is only a small ops change because auth was
  already stateless (see diagram 1). Second, the Spotify-callback and
  taste-profile endpoints stop doing slow work inline and instead just drop
  a message on the queue and return, which is a small code change, a queue
  client call replacing a direct function call, not a rewrite.
- **Green (new):** everything actually new, meaning the gateway (rate
  limiting), Redis (cache and queue backing store), the two background
  workers, the read replica, and object storage plus a CDN for images. This
  is genuinely additive infrastructure. It sits around the existing system
  rather than replacing pieces of it, which is why the diagram from section
  1 doesn't need to be thrown out, just extended.
- **Purple, dashed (further out):** the learned matching model. Dashed
  specifically because it's not "build this next," it's "build this once a
  precondition is met," explained below.

**What each new piece solves, mapped back to the specific problem:**

| New piece | Solves |
|---|---|
| API Gateway + rate limiting | Nothing currently protects endpoints from abuse or accidental traffic spikes eating Spotify's rate limit |
| Redis cache | Hot reads (precomputed match scores especially) currently hit Postgres every time, with nothing absorbing repeats |
| Job queue + Spotify sync worker | The OAuth callback currently blocks on 9 sequential Spotify calls before it can respond; one slow or failed call currently stalls the whole request |
| Score precomputation worker | `getFriendSuggestions` currently recomputes every pairwise score live, on every page load: O(N) per request, O(N²) system-wide |
| Postgres read replica | Read-heavy pages (Discover, event feeds) currently compete with writes for the same database connections |
| Object storage + CDN | Profile photos currently hotlink Spotify's CDN directly, which is why the "stale URL" bug happened at all; the app owns none of its own image availability |
| Learned matching model | The current score is a fixed, hand-tuned formula (0.4/0.3/0.2/0.1 weights). It can't improve from real outcomes, and it can't tell you which signal actually predicts a good match |

#### Further out: replacing the hand-tuned formula with a learned model

This is the piece worth explaining carefully if asked "could you use ML for
the matching score." Yes, but it's gated on something the app doesn't have
yet, and that gate matters more than the model choice.

**What would change.** Right now `calculateCompatibilityScore` is a fixed
formula. Someone decided artists matter 40%, genres 30%, and so on, and
those weights never move no matter what actually happens after a match. A
**supervised learning** approach replaces that fixed formula with a model
trained on real outcomes: instead of *guessing* the weights, you *learn*
them from data about which matches actually led somewhere.

**Why a tree model specifically (gradient-boosted trees, e.g. XGBoost or
LightGBM, or a random forest as the simpler first cut) fits this problem
well:**
- The inputs are exactly the kind of data trees are good at: a handful of
  numeric features per pair (artist overlap, genre overlap, song overlap,
  listening-pattern similarity, and more granular ones you could add, such
  as mutual-connections count or recency of shared listening). Trees don't
  require the features to be scaled or linearly related to the outcome the
  way something like logistic regression would.
- **Feature importance falls out of the model almost for free.** Once
  trained, you can ask it "which of these signals actually predicted a real
  connection" and get a ranked answer. That's strictly more information
  than the current setup gives you: right now the 0.4/0.3/0.2/0.1 weights
  are an educated guess, while a trained model would tell you if, say,
  shared genres actually matter more than the current weighting assumes.
  That's a product insight, not just a scoring mechanism.
- Random forest is the safer starting point specifically because it's
  harder to overfit with a smaller dataset than gradient boosting is.
  Graduating to gradient-boosted trees is a reasonable next step once
  there's more data to train on, not a decision to make upfront.

**The actual blocker: there's no labeled data yet.** A supervised model
needs examples of the outcome you're trying to predict, something like "did
this suggested match turn into a real connection." Nothing in the app
currently records that. Before any model can be trained, the app needs to
start logging **implicit feedback** as an interaction log: was a connection
request sent from a suggestion, was it accepted, did the two users later
co-attend an event together. Those become the training labels. This is the
actual first step, and it's mostly instrumentation, not modeling.

**Why this is explicitly gated, not just "next on the roadmap":** with only
a few hundred users and a thin interaction history, training a tree
ensemble would almost certainly **overfit**. It would fit noise in a small
dataset and likely perform *worse* than the current hand-tuned heuristic,
which at least generalizes by construction. The honest engineering call is
to wait until there's a meaningful volume of labeled interactions (low
thousands, roughly) before training anything, and to keep improving the
heuristic in the meantime.

**Two production-ML patterns worth naming, since they'd both apply here:**
- **The cold-start problem, and a hybrid fallback.** A brand-new user, or
  any pair with little shared interaction history, has no signal for a
  learned model to work from. The realistic design isn't "replace the
  heuristic," it's "use the learned model's score once a pair has enough
  history behind it, and keep the current heuristic as the fallback for
  everyone else," the same kind of hybrid pattern most real recommender
  systems use, not a hard cutover.
- **Shadow mode, also called champion-challenger.** Even once a model is
  trained, the safe rollout isn't "swap the scoring function and hope."
  Instead, compute both scores, show users the current heuristic's result,
  but log what the new model *would have* said, and compare against real
  outcomes for a while. Only promote the model to being the one users
  actually see once it's measurably beating the heuristic on real data, not
  before.

The diagram shows this as a self-contained addition specifically because
none of it touches the score-precomputation worker's existing
responsibility. The worker's job stays "produce a score for this pair," it
would just optionally consult a trained model instead of the fixed formula
when one is available and confident enough, which is why this can be added
later without a redesign of anything already planned above it.
