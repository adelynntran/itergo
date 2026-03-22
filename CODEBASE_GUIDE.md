# Itergo Codebase Guide

A complete walkthrough of every file, what it does, why it exists, and how everything connects.

---

## Part 1: Root Config Files

These files configure your project before any code runs.

---

### `package.json`
**What**: Your project's ID card. Lists its name, dependencies, and scripts.

**Why you need it**: Node.js reads this to know what libraries to install and how to run your app.

**Key sections**:
- `scripts` — commands you run:
  - `npm run dev` → starts your app locally
  - `npm run build` → compiles for production
  - `npm run lint` → checks code quality
- `dependencies` — libraries your app uses in production (drizzle, next-auth, mapbox, etc.)
- `devDependencies` — libraries only needed during development (TypeScript, ESLint, etc.)

**Industry knowledge**: Every JavaScript/TypeScript project has this. In Django, the Python equivalent is `requirements.txt` or `pyproject.toml`.

---

### `tsconfig.json`
**What**: Tells TypeScript how to check your code.

**Key settings**:
- `"strict": true` — catches more bugs (industry best practice)
- `"paths": { "@/*": ["./src/*"] }` — lets you write `@/server/db` instead of `../../server/db`
- `"target": "ES2017"` — what JavaScript version to compile to

**Industry knowledge**: Every TypeScript project has this. Strict mode is expected at any professional job.

---

### `next.config.ts`
**What**: Next.js configuration. Currently empty — using all defaults.

**When you'd change it**: Adding image domains, redirects, environment variables, or custom webpack config.

---

### `drizzle.config.ts`
**What**: Tells Drizzle ORM where your database is and where your schema lives.

```
dialect: "postgresql"       → we're using Postgres
schema: "./src/server/db/schema.ts"  → where tables are defined
url: process.env.DATABASE_URL        → your Neon connection string
```

**How it works with Neon**: When you run `npx drizzle-kit push`, Drizzle reads this config, connects to your Neon database using the URL from `.env.local`, and creates/updates tables to match your schema.

---

### `postcss.config.mjs`
**What**: PostCSS processes your CSS. This tells it to use Tailwind CSS v4.

You'll rarely touch this — it's just wiring.

---

### `eslint.config.mjs`
**What**: Code quality rules. Catches bugs and enforces style.

**Industry knowledge**: Every team uses a linter. ESLint is the standard for JavaScript/TypeScript.

---

### `components.json`
**What**: Configuration for shadcn/ui (your component library). Tells it where to put generated components and what style to use.

**How it works**: When you run `npx shadcn@latest add button`, it reads this config to know where to put the file (`src/components/ui/button.tsx`).

---

### `.env.local`
**What**: Your secrets. API keys, database URLs, tokens.

**CRITICAL RULE**: This file is in `.gitignore` and should NEVER be committed. If you leak these, anyone can access your database and Google OAuth.

**How each variable is used**:

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | Drizzle / `src/server/db/index.ts` | Connects to Neon Postgres |
| `NEXTAUTH_URL` | NextAuth | Base URL for auth callbacks |
| `NEXTAUTH_SECRET` | NextAuth | Signs session tokens (JWT) |
| `GOOGLE_CLIENT_ID` | NextAuth / Google OAuth | Identifies your app to Google |
| `GOOGLE_CLIENT_SECRET` | NextAuth / Google OAuth | Proves your app's identity to Google |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox / `pin-map.tsx` | Loads map tiles. `NEXT_PUBLIC_` prefix means it's exposed to the browser (which is fine for Mapbox) |

**Industry knowledge**: Every production app has environment variables. In Django, you'd use `python-decouple` or `django-environ`. The pattern is universal.

---

### `.gitignore`
**What**: Tells git which files to NOT track.

**Key entries**: `node_modules/` (huge, reinstallable), `.env.local` (secrets), `.next/` (build output), `drizzle/meta/` (auto-generated).

---

## Part 2: Database (The Foundation)

---

### `src/server/db/schema.ts`
**What**: Your entire database structure. This is the single most important file in your project.

**What it defines** (each `pgTable` = a database table):

**Auth tables** (managed by NextAuth):
- `users` — email, password, displayName, avatar, bio, interests
- `accounts` — OAuth connections (Google). Links a Google account to a user
- `sessions` — active login sessions
- `verificationTokens` — email verification (not used yet)

**App tables**:
- `dreamBoards` — a trip plan. Has name, description, invite code/PIN, status (active/archived/deleted), created by a user
- `boardMembers` — who's on each board and their role (host/editor/viewer)
- `pins` — places on a board. Has location data (lat/lng), category (food, nature, etc.), notes
- `pinMedia` — photos/videos attached to pins
- `pinVotes` — users voting on pins (upvote/heart/must_do)
- `comments` — comments on pins, supports threading via `parentId`
- `commentReactions` — emoji reactions on comments

**Relations** (defined at the bottom): Tell Drizzle how tables connect. A board `has many` members, a pin `belongs to` a board, etc.

**How it connects to Neon**: This file is just a definition. When you run `npx drizzle-kit push`, Drizzle reads this and sends SQL commands to Neon to create these tables.

**Industry knowledge**: This is exactly like Django models (`models.py`). Same concept, different syntax. Understanding schema design is fundamental — it's the same in every framework.

---

### `src/server/db/index.ts`
**What**: Creates the database connection object.

**How it works**:
1. Reads `DATABASE_URL` from environment
2. Creates a postgres connection using `@neondatabase/serverless`
3. Wraps it with Drizzle ORM
4. Exports `db` — this is what every API route uses to query the database

**Example**: `db.select().from(users).where(eq(users.email, "test@test.com"))`

---

## Part 3: Authentication

This is how users sign in and how your app knows who's making requests.

---

### `src/server/auth.ts`
**What**: NextAuth configuration — the brain of your auth system.

**How Google OAuth works** (this is important):
1. User clicks "Sign in with Google"
2. Browser redirects to Google's login page
3. User signs in with their Google account
4. Google redirects back to `http://localhost:3000/api/auth/callback/google` with a code
5. NextAuth exchanges that code for user info (name, email, picture)
6. NextAuth creates or finds the user in your database
7. NextAuth creates a JWT token and stores it in a cookie
8. Every subsequent request sends that cookie automatically

**How Credentials auth works**:
1. User enters email + password
2. NextAuth calls the `authorize` function
3. It looks up the user in the database by email
4. Compares passwords (currently plain text — needs bcrypt)
5. Returns user if valid, null if not

**JWT callbacks**:
- `jwt callback` — adds the user's `id` to the token
- `session callback` — makes the `id` available in `session.user.id`

**How this connects to Google Cloud Console**: The `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` you got from Google Cloud Console are used here. They tell Google "this app is allowed to use Google Sign-In."

**Industry knowledge**: OAuth2 is the industry standard for "Sign in with Google/GitHub/Facebook." Understanding the flow (redirect → callback → token) is essential. JWTs are used everywhere.

---

### `src/app/api/auth/[...nextauth]/route.ts`
**What**: The API endpoint that handles all auth requests.

**The `[...nextauth]` syntax**: This is a Next.js "catch-all" route. It handles:
- `GET /api/auth/signin` — sign-in page
- `POST /api/auth/callback/google` — Google OAuth callback
- `GET /api/auth/session` — get current session
- etc.

NextAuth handles all of this automatically.

**How it works with Postman**: You can send `GET http://localhost:3000/api/auth/session` in Postman to see the current session (it'll be empty without a cookie). This is useful for debugging auth issues.

---

### `src/app/api/auth/signup/route.ts`
**What**: Custom signup endpoint for email/password registration.

**Flow**:
1. `POST /api/auth/signup` with `{ name, email, password }`
2. Validates fields (name required, email required, password >= 8 chars)
3. Checks if email already exists
4. Creates user in database
5. Returns the user object

**Postman testing**:
```
POST http://localhost:3000/api/auth/signup
Body (JSON): { "name": "Test", "email": "test@test.com", "password": "12345678" }
```

---

### `src/middleware.ts`
**What**: Runs BEFORE every request to protected pages. Acts as a security guard.

**How it works**:
- Checks if the URL matches `/dashboard`, `/board`, or `/settings`
- If yes, checks if the user is authenticated
- If not authenticated, redirects to `/login`
- If authenticated, lets the request through

**Industry knowledge**: Middleware is universal. Django has middleware too. It's the standard pattern for protecting routes.

---

## Part 4: REST API Routes

This is your backend. These are the endpoints that Postman will interact with.

---

### How Next.js API Routes Work

In Next.js, the file path = the URL:
- `src/app/api/boards/route.ts` → `GET/POST /api/boards`
- `src/app/api/boards/[id]/route.ts` → `GET/PATCH/DELETE /api/boards/123`
- `src/app/api/pins/[id]/vote/route.ts` → `POST /api/pins/456/vote`

Each file exports functions named after HTTP methods: `GET`, `POST`, `PATCH`, `DELETE`.

**Industry knowledge**: This maps directly to Django views. `GET /api/boards` is like a Django view function that handles `request.method == 'GET'`.

---

### Board API Routes

| Method | Endpoint | What it does | Who can do it |
|---|---|---|---|
| GET | `/api/boards` | List all boards user belongs to | Any authenticated user |
| POST | `/api/boards` | Create a new board | Any authenticated user |
| GET | `/api/boards/[id]` | Get board details with all data | Board members only |
| PATCH | `/api/boards/[id]` | Update board name/description | Host only |
| DELETE | `/api/boards/[id]` | Soft delete board | Host only |
| POST | `/api/boards/[id]/invite` | Generate new invite code | Host only |
| PATCH | `/api/boards/[id]/archive` | Archive board | Host only |
| GET | `/api/boards/[id]/members` | List all members | Board members only |
| PATCH | `/api/boards/[id]/members/[userId]` | Change member role | Host only |
| DELETE | `/api/boards/[id]/members/[userId]` | Remove member | Host only |
| POST | `/api/boards/join` | Join by invite code | Any authenticated user |
| POST | `/api/boards/join/pin` | Join by PIN | Any authenticated user |

### Pin API Routes

| Method | Endpoint | What it does | Who can do it |
|---|---|---|---|
| GET | `/api/boards/[id]/pins` | List board pins | Board members only |
| POST | `/api/boards/[id]/pins` | Add a pin | Host or editor |
| PATCH | `/api/pins/[id]` | Update a pin | Host or editor |
| DELETE | `/api/pins/[id]` | Delete a pin | Host or editor |
| POST | `/api/pins/[id]/vote` | Toggle vote | Board members only |

### Comment API Routes

| Method | Endpoint | What it does | Who can do it |
|---|---|---|---|
| GET | `/api/pins/[id]/comments` | List comments | Board members only |
| POST | `/api/pins/[id]/comments` | Add comment | Board members only |
| PATCH | `/api/comments/[id]` | Edit comment | Comment author only |
| DELETE | `/api/comments/[id]` | Delete comment | Comment author only |
| POST | `/api/comments/[id]/react` | Toggle emoji reaction | Board members only |

---

## Part 5: API Utilities (`src/lib/api/`)

These are helper functions that every API route uses.

---

### `src/lib/api/auth.ts`
**What**: `getAuthSession()` — checks if the request is authenticated and returns the user ID.

Every API route starts with:
```ts
const auth = await getAuthSession();
if (auth.error) return auth.error;  // returns 401 Unauthorized
const userId = auth.userId;
```

---

### `src/lib/api/errors.ts`
**What**: Helper functions to return standard HTTP errors.

- `badRequest("message")` → 400 (you sent bad data)
- `unauthorized()` → 401 (you're not logged in)
- `forbidden()` → 403 (you don't have permission)
- `notFound("Board")` → 404 (doesn't exist)

**Industry knowledge**: HTTP status codes are universal. Every REST API uses these. You'll see these in Django with `HttpResponse(status=404)`.

---

### `src/lib/api/role.ts`
**What**: Role-based access control (RBAC).

- `getMemberRole(boardId, userId)` — looks up what role the user has
- `requireRole(boardId, userId, ["host", "editor"])` — returns error if user doesn't have one of those roles

**Industry knowledge**: RBAC is everywhere in enterprise software. Understanding roles and permissions is critical.

---

### `src/lib/api/validation.ts`
**What**: Validates incoming request data using Zod (a schema validation library).

Instead of manually checking "is name a string? is it under 100 chars?", you define a schema and validate against it.

**Industry knowledge**: Django has serializers (DRF) for the same purpose. Input validation prevents security vulnerabilities (SQL injection, XSS).

---

### `src/lib/api/client.ts`
**What**: `apiFetch()` — a wrapper around `fetch()` that your frontend uses to call your API.

```ts
const boards = await apiFetch<Board[]>("/api/boards");
```

It handles:
- Setting headers
- Parsing JSON responses
- Throwing errors with status codes

**How it works with the API routes**: Your frontend components call `apiFetch()` → it sends HTTP requests to your API routes → API routes query the database → return JSON.

---

### `src/lib/api/hooks.ts`
**What**: React Query hooks that connect your components to your API.

**Why React Query**: Instead of manually calling `fetch` in every component and managing loading/error states, React Query does it for you:

```ts
const { data: boards, isLoading } = useBoards();
// React Query calls GET /api/boards, caches the result, handles loading state
```

**Key hooks**:
- `useBoards()` → fetches all boards
- `useBoardDetail(id)` → fetches one board with all its data
- `useCreateBoard()` → sends POST to create a board, then refreshes the list
- `useVote()` → toggles a vote, then refreshes the board

**Industry knowledge**: This is the data-fetching pattern used in most modern React apps. Django equivalent would be using `axios` + SWR or React Query to call your DRF endpoints.

---

## Part 6: Components

---

### `src/components/providers.tsx`
**What**: Wraps your entire app with necessary "context providers."

- `QueryClientProvider` — enables React Query everywhere
- `SessionProvider` — makes auth session available to all components
- `TooltipProvider` — enables tooltip UI components

**Industry knowledge**: The Provider pattern is fundamental in React. It's how you share global state without passing props through every component.

---

### `src/components/layout/app-sidebar.tsx`
**What**: The navigation sidebar shown in the app.

**Features**: Logo, navigation links, Dream/Execute mode toggle, user dropdown with sign out.

---

### `src/components/boards/` (4 files)
- **`board-card.tsx`** — displays a board in the dashboard grid
- **`create-board-dialog.tsx`** — popup form to create a board
- **`join-board-dialog.tsx`** — popup form to enter invite code
- **`board-settings-sheet.tsx`** — slide-out panel for managing members and invite codes

---

### `src/components/pins/` (4 files)
- **`pin-map.tsx`** — Mapbox map showing pin markers. Uses your `NEXT_PUBLIC_MAPBOX_TOKEN`
- **`pin-list.tsx`** — scrollable list of pins with search, filter, sort
- **`pin-card.tsx`** — individual pin display
- **`add-pin-sidebar.tsx`** — search for places using Mapbox geocoding API, add them as pins

**How Mapbox works here**:
1. `pin-map.tsx` loads map tiles using your token
2. `add-pin-sidebar.tsx` calls Mapbox's geocoding API to search for places:
   ```
   GET https://api.mapbox.com/geocoding/v5/mapbox.places/tokyo.json?access_token=YOUR_TOKEN
   ```
3. When you select a result, it extracts lat/lng/address and creates a pin

---

### `src/components/votes/vote-buttons.tsx`
**What**: Three voting buttons (upvote, heart, must_do) that toggle on click.

---

### `src/components/ui/` (13 files)
**What**: shadcn/ui components — pre-built, customizable UI building blocks (avatar, badge, card, dialog, dropdown-menu, input, label, scroll-area, separator, sheet, tabs, textarea, tooltip).

These are generated by shadcn, not custom code. Think of them like Bootstrap components but better. You don't need to deeply understand these — just use them.

---

## Part 7: How Everything Connects

Here's the full flow when a user opens your app:

```
User visits localhost:3000
    |
middleware.ts checks: authenticated?
    |-- No → redirect to /login
    |-- Yes → allow through
        |
(app)/layout.tsx loads sidebar
    |
dashboard/page.tsx renders
    |
useBoards() hook fires
    |
apiFetch("GET /api/boards")
    |
API route: boards/route.ts
    |
getAuthSession() → gets userId from JWT cookie
    |
db.select().from(boardMembers)... → queries Neon Postgres
    |
Returns JSON → React Query caches it → UI renders board cards
```

And when testing with **Postman**:
```
Postman sends: POST /api/boards { "name": "Tokyo Trip" }
    |
boards/route.ts receives it
    |
getAuthSession() → No cookie → returns 401 Unauthorized
```

To test authenticated routes in Postman, you'd need to:
1. Sign in via the browser
2. Copy the session cookie
3. Add it to Postman's request headers

---

## Part 8: Key Takeaways

1. **REST pattern** — your API uses standard HTTP methods (GET/POST/PATCH/DELETE) with JSON. This is universal.
2. **Auth flow** — JWT tokens stored in cookies. Google OAuth uses the standard OAuth2 redirect flow.
3. **ORM pattern** — Drizzle maps TypeScript to SQL. Same concept as Django ORM.
4. **Component architecture** — UI broken into reusable pieces. Providers share global state.
5. **Separation of concerns** — Database schema → API routes → Hooks → Components. Each layer has one job.
6. **Role-based access** — host/editor/viewer permissions checked on every API call.

---

## Part 9: File Tree Reference

```
itergo/
├── .env.local                          # Secrets (DATABASE_URL, auth keys, tokens)
├── .gitignore                          # Files git ignores
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript config
├── next.config.ts                      # Next.js config
├── drizzle.config.ts                   # Drizzle ORM config → connects to Neon
├── eslint.config.mjs                   # Linter rules
├── postcss.config.mjs                  # Tailwind CSS setup
├── components.json                     # shadcn/ui config
│
├── src/
│   ├── middleware.ts                   # Auth guard for protected routes
│   │
│   ├── server/
│   │   ├── auth.ts                     # NextAuth config (Google OAuth + credentials)
│   │   └── db/
│   │       ├── index.ts                # Database connection (Drizzle + Neon)
│   │       └── schema.ts              # All database tables and relations
│   │
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (fonts, providers)
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css                 # Tailwind + theme variables
│   │   │
│   │   ├── (auth)/                     # Auth pages (no sidebar)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── (app)/                      # Protected pages (with sidebar)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx      # Board list
│   │   │   ├── board/[id]/page.tsx     # Board detail (map + pins)
│   │   │   └── settings/page.tsx       # User settings
│   │   │
│   │   └── api/                        # REST API endpoints
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │       │   └── signup/route.ts          # User registration
│   │       ├── boards/
│   │       │   ├── route.ts                 # GET/POST /api/boards
│   │       │   ├── join/route.ts            # POST /api/boards/join
│   │       │   ├── join/pin/route.ts        # POST /api/boards/join/pin
│   │       │   └── [id]/
│   │       │       ├── route.ts             # GET/PATCH/DELETE /api/boards/:id
│   │       │       ├── pins/route.ts        # GET/POST /api/boards/:id/pins
│   │       │       ├── invite/route.ts      # POST invite code
│   │       │       ├── archive/route.ts     # PATCH archive
│   │       │       └── members/
│   │       │           ├── route.ts         # GET members
│   │       │           └── [userId]/route.ts # PATCH/DELETE member
│   │       ├── pins/[id]/
│   │       │   ├── route.ts                 # PATCH/DELETE pin
│   │       │   ├── vote/route.ts            # POST toggle vote
│   │       │   └── comments/route.ts        # GET/POST comments
│   │       └── comments/[id]/
│   │           ├── route.ts                 # PATCH/DELETE comment
│   │           └── react/route.ts           # POST toggle reaction
│   │
│   ├── lib/
│   │   ├── utils.ts                    # cn() utility for Tailwind classes
│   │   └── api/
│   │       ├── auth.ts                 # getAuthSession() helper
│   │       ├── client.ts              # apiFetch() — frontend HTTP client
│   │       ├── errors.ts             # HTTP error helpers (400, 401, 403, 404)
│   │       ├── hooks.ts              # React Query hooks (useBoards, useVote, etc.)
│   │       ├── role.ts               # RBAC helpers (getMemberRole, requireRole)
│   │       ├── utils.ts              # generateCode(), generatePin()
│   │       └── validation.ts         # Zod validation helper
│   │
│   ├── components/
│   │   ├── providers.tsx              # QueryClient + Session + Tooltip providers
│   │   ├── layout/
│   │   │   └── app-sidebar.tsx        # Navigation sidebar
│   │   ├── boards/
│   │   │   ├── board-card.tsx         # Board card for dashboard
│   │   │   ├── board-settings-sheet.tsx # Board management panel
│   │   │   ├── create-board-dialog.tsx  # Create board popup
│   │   │   └── join-board-dialog.tsx    # Join board popup
│   │   ├── pins/
│   │   │   ├── add-pin-sidebar.tsx    # Add pin with Mapbox search
│   │   │   ├── pin-card.tsx           # Individual pin display
│   │   │   ├── pin-list.tsx           # Pin list with search/filter
│   │   │   └── pin-map.tsx            # Mapbox map with markers
│   │   ├── votes/
│   │   │   └── vote-buttons.tsx       # Upvote/heart/must_do buttons
│   │   └── ui/                        # shadcn components (13 files)
│   │
│   └── types/
│       ├── index.ts                   # App type definitions
│       └── react-map-gl.d.ts         # Mapbox TypeScript declarations
```
