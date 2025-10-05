# copy2card.com

Minimal review-card generator built with Next.js 15, TypeScript, Tailwind CSS, Supabase, and Paddle. Paste real customer feedback, preview a branded testimonial card, and download it without touching design tools.

## Features
- Landing page with Google/GitHub OAuth (Supabase)
- Dashboard to preview and export review cards (html2canvas)
- Credit-based access: watermark for free tier, clean exports for paid users
- Paddle checkout flow (sandbox first) that tops up Supabase credits on completion
- Lightweight, Apple-inspired UI (Inter font, rounded corners, no shadows)

## Getting Started
```bash
pnpm install # or npm install / yarn install
pnpm dev
```
Then visit http://localhost:3000.

## Environment Variables
Create a `.env.local` file before running dev/build commands. All values prefixed with `NEXT_PUBLIC_` are exposed on the client, so use sandbox/test keys in non-production environments.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your-paddle-client-token
NEXT_PUBLIC_PADDLE_PRICE_ID=price-id-from-paddle
NEXT_PUBLIC_PADDLE_ENV=sandbox # or production
```

> Supabase service-role keys and Paddle webhooks should be handled on a secure server, not in this frontend repo.

## Supabase Schema Cheatsheet
```sql
create table users (
  id uuid primary key,
  email text unique,
  login_provider text,
  created_at timestamp with time zone default now()
);

create table credits (
  user_id uuid primary key references users (id) on delete cascade,
  remaining_credits integer default 0
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users (id) on delete cascade,
  text text,
  image_url text,
  created_at timestamp with time zone default now()
);
```

Enable Supabase Row Level Security and add policies to allow:
- authenticated users to select/update their own `credits`
- authenticated users to insert rows in `cards`

## Paddle Integration Notes
- Start with the Paddle sandbox. Generate a sandbox client token and price ID.
- Configure the Paddle event callback (in `pages/payment.tsx`) to call `/api/credits/add` when you receive a `checkout.completed` event.
- For production, move the credit increment logic to a Paddle webhook handler (e.g., Vercel serverless function) to avoid client-side tampering.

## Deployment (Vercel)
1. Push this repo to GitHub.
2. Import into Vercel and select the Next.js framework preset.
3. Add the environment variables in the Vercel dashboard for Preview/Production.
4. Set up Supabase and Paddle webhooks to call your secure endpoints.

## Roadmap Ideas
- Card templates with different accent colors and typography
- Team accounts with shared credit pools
- Analytics for total exports per testimonial
- Optional automatic posting to social platforms
