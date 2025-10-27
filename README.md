# cisc474-project-starter

A repo that you can fork to make new projects

# Setup

- Clone this repo
- NVM and the right version of Node
  - Install Node.
  - Make sure you have at least version 22.12.\*, not lower. Run `node -v` to check your version.
  - Windows: You can have multiple versions of Node using NVM: <https://github.com/coreybutler/nvm-windows>
  - Mac: You can get NVM to manage multiple versions: https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script
  - Either way, use `nvm list` and `nvm use` to switch between Node versions, and make sure you get onto a version 22.12.\* or higher.
- Install dependencies
  - `cd` into your cloned project directory
  - Run `npm install` to install the project dependencies
- Run your site
  - `npm run dev`
- Docker:
  - Install Docker Desktop from <https://www.docker.com/products/docker-desktop>

# Deployment

- Frontend:
  - Vercel: https://vercel.com/
  - Directions:
    - Create a Vercel account using your Github
    - Import your forked repository
    - Make sure you are happy with the Project Name
    - In the "Root Directory" field, use `apps/web` (do NOT use `apps/docs`)
    - Click "Deploy"
    - You can now access your deployed site at the provided URL
- Database:
  - SupaBase Free Tier: https://supabase.com/
  - Directions:
    - Start a new project on the Free Tier
    - Login using your Github
    - Create a new organization:
      - Name: Your choice, e.g., `CISC474 F25 Projects` (you can change this later)
      - Type: `Educational`
      - Price: `Free - $0/month`
    - Create a new project:
      - Organization: Choose your previously selected organization
      - Project name: Name according to assignment, e.g., `acbart lms`
      - Database Password: Click the "Generate Password" text, then make sure you securely record the password (e.g., with your browser's automatic password saving features) because you will need it in the next step.
      - Region: `East US (North Virginia)`
    - You can now get your connection details for this database. Click the "Connect" button at the top of the window, and get the Transaction Pooler string (not the Direct connection). Note that the text `[YOUR-PASSWORD]` will be in the connection string, and you have to replace it with your Supabase password (make sure the brackets are removed too). You will need the connection string for the next step.
- Backend:
  - Render: https://render.com/
  - Directions:
    - Sign in to Render using your Github and create an account
    - Create a new workspace, name it something appropriate for this project
    - Fill out the survey information about how you will use it, as you see fit
    - Choose to make a new Web Service
    - Connect to Github as your Git Provider
    - Select the repository you want to deploy
    - Choose "Virginia (US East)" for your Region (not critical)
    - For your Root Directory, use `./`
    - For Instance Type, choose "Free $0/month"
    - In the Environment Variables, add the following:
      - `DATABASE_URL`: The pooled connection string using port 6543 - see example below
      - `DIRECT_URL`: The direct pooled connection string using port 5432 - See example below
    - Click the Deploy button
- Set up your local `.env` file:
  - Take a look at the details in the Connection string, and replace the information below in a new `.env` file at the same level as this `README.md` file.

```
DATABASE_URL="postgres://postgres.[ref]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgres://postgres.[ref]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

Then, you can make the first push of your initial database setup: `npx prisma db push`

Then you can populate the database with an initial row by using: `npx prisma db seed`

---

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `apps/docs`: a [Next.js](https://nextjs.org/) app
- `apps/api`: a [Nestjs](https://nodejs.org/) app
- `apps/web`: another [Next.js](https://nextjs.org/) app
- `apps/database`: the Prisma database ORM configuration
- `packages/ui`: a stub React component library shared by both `web` and `docs` applications
- `packages/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `packages/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `packages/jest-config`: `jest` configurations for testing
- `packages/api`: shared utilities for the `api` app, particularly the DTOs

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
