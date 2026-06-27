# Prisma — Claude Code Weekend

## First-time setup (local dev)

```bash
# 1. Copy .env.example → .env and fill DATABASE_URL
# 2. Create the database and run migrations
pnpm db:migrate          # runs: prisma migrate dev --name init
pnpm db:seed             # seeds demo data
```

## Production deploy

On container start, `docker-compose.yml` runs:
```
prisma migrate deploy
```
This is idempotent — safe to run on every deploy.

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm db:migrate` | Create / apply migrations (dev) |
| `pnpm db:push` | Push schema changes without migration (quick dev) |
| `pnpm db:seed` | Seed demo coach user |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:reset` | Drop + recreate DB + re-seed |
