# Claude Code Weekend — Next.js 16 + Prisma 7 (pg adapter) production image
# Pattern: same as eyelizm — multi-stage, pnpm, prisma migrate deploy on startup
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# ── deps (ไม่รัน postinstall เพราะ schema ยังไม่ copy) ──
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── build ──
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate && pnpm exec next build

# ── runner ──
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
EXPOSE 3000
# รัน migration ก่อน แล้วค่อยสตาร์ท (idempotent ด้วย migrate deploy)
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node_modules/.bin/next start -p 3000 -H 0.0.0.0"]
