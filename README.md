# Claude Code Weekend

1-on-1 Claude Code coaching · ฿1,000/hour · Weekends only

Built with: **Next.js 16 + React 19 + Prisma 7 + PostgreSQL + Tailwind 4 + Auth.js v5 + Stripe**

> Previous static demo preserved at `legacy-static/` (design reference)
> AWS S3 deploy scripts preserved at `aws-deploy/`

---

## Local Development

### Prerequisites
- Node.js 22+ and pnpm
- PostgreSQL (or Docker: `docker compose up db -d`)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file and fill in your values
cp .env.example .env
# Edit .env with your actual keys (see External Accounts below)

# 3. Run database migrations
pnpm db:migrate

# 4. (Optional) Seed demo data
pnpm db:seed

# 5. Start dev server
pnpm dev
```

App runs at http://localhost:3000

---

## External Accounts Required

### 1. Google OAuth (for Google sign-in)
- Go to https://console.cloud.google.com
- Create a project → APIs & Services → Credentials → Create OAuth Client ID
- Application type: **Web application**
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://demo1.toptierdigital.space/api/auth/callback/google` (prod)
- Copy **Client ID** → `AUTH_GOOGLE_ID`
- Copy **Client Secret** → `AUTH_GOOGLE_SECRET`

### 2. LINE Login (for LINE sign-in)
- Go to https://developers.line.biz → Create a Provider → Create Channel → LINE Login
- Channel type: **LINE Login**
- Callback URL:
  - `http://localhost:3000/api/auth/callback/line` (dev)
  - `https://demo1.toptierdigital.space/api/auth/callback/line` (prod)
- Copy **Channel ID** → `AUTH_LINE_ID`
- Copy **Channel secret** → `AUTH_LINE_SECRET`

### 3. Stripe (for payments)
- Go to https://dashboard.stripe.com
- Get your **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Get your **Secret key** → `STRIPE_SECRET_KEY`
- Webhooks → Add endpoint:
  - URL: `https://demo1.toptierdigital.space/api/stripe/webhook`
  - Events: `checkout.session.completed`
  - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`
- Note: Stripe amounts for THB are in satang (฿1,000 = 100,000 satang). Already handled in `/api/checkout`.

---

## Docker (Production)

```bash
# Build and start (requires .env with all prod values)
docker compose up -d --build

# View logs
docker compose logs -f web
```

The app uses Cloudflare Tunnel (no public IP). Set up a tunnel in Cloudflare Zero Trust pointing:
- Public hostname: `demo1.toptierdigital.space`
- Service: `http://web:3000`

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:migrate` | Create/apply migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Prisma Studio |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Auth.js v5 handlers
│   │   ├── checkout/route.ts             # POST: create Booking + Stripe session
│   │   └── stripe/webhook/route.ts       # Stripe webhook → confirm booking
│   ├── account/page.tsx                  # Protected: user's bookings
│   ├── signin/page.tsx                   # Google + LINE login
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx
│   └── globals.css
├── auth.ts                               # Auth.js v5 config (Google + LINE)
├── components/
│   ├── BookingWidget.tsx                 # Client: calendar + time slot + pay
│   ├── NavBar.tsx                        # Sticky nav with session state
│   ├── Providers.tsx                     # SessionProvider wrapper
│   ├── LangScript.tsx                    # TH/EN toggle script
│   └── RevealScript.tsx                  # Scroll reveal animation
├── lib/
│   ├── prisma.ts                         # Prisma client singleton
│   └── stripe.ts                         # Stripe client singleton
└── generated/prisma/                     # Auto-generated Prisma client (gitignored)
prisma/
├── schema.prisma                         # DB schema
├── seed.ts                               # Demo seed
└── README.md                             # Migration docs
legacy-static/                            # Original static design (reference — do not delete)
aws-deploy/                               # Original AWS S3 deploy scripts
public/assets/                            # Self-hosted fonts + logo
```

---

## TODO — Phase 2 (not built yet)

- [ ] **Coach/Admin dashboard** — view all bookings, manage schedule, mark sessions complete
- [ ] **Reschedule/Cancel UI** — allow users to reschedule before 24h, auto-refund via Stripe
- [ ] **Session materials** — upload/share code, notes, recording links per booking
- [ ] **Email notifications** — booking confirmation, reminder 24h before, completion survey
- [ ] **LINE notifications** — notify coach + student via LINE Notify / Messaging API
- [ ] **Admin role management** — UI to change user roles (student/coach/admin)
- [ ] **4-session bundle** — Stripe product for 4-pack with 10% discount
- [ ] **Availability management** — coach sets blocked dates, per-day time slot overrides
- [ ] **Real deploy** — set up EC2 + Cloudflare Tunnel, configure all env vars, run deploy script
- [ ] **Rate limiting** — protect /api/checkout from abuse
- [ ] **i18n** — move TH/EN strings into proper next-intl or similar
