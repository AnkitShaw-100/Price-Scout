# Price-Scout

Lightweight Next.js app to monitor product prices by scraping product pages and storing price history in Supabase.

## Features
- Add product by URL — scrapes product name, current price, currency, and image
- Stores latest product info in `products` table and price snapshots in `price_history`
- User auth via Supabase

## Quick Start

Prerequisites
- Node.js 18+ (or the version your project uses)
- A Supabase project with a `products` and `price_history` table and Auth enabled
- A Firecrawl API key (set `FIRECRAWL_API_KEY`)

Environment
Create a `.env.local` in the project root with at least:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FIRECRAWL_API_KEY=sk_...
```

Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and sign in to add product URLs.

## Key Files
- `src/lib/firecrawl.js`: wrapper around the Firecrawl SDK that extracts product data.
- `src/app/actions.js`: server actions for adding/deleting products and fetching history.
- `src/utils/supabase/*`: Supabase client helpers used by server actions.

## Database schema (example)
- `products` table: `id, user_id, url, name, currency, image_url, current_price, updated_at, created_at`
- `price_history` table: `id, product_id, price, currency, checked_at`

## Troubleshooting
- If scraping fails with `firecrawl.scrapeUrl is not a function`, ensure the code uses `new Firecrawl(...).v1.scrapeUrl(...)` (see `src/lib/firecrawl.js`).
- Check the Next.js server terminal for `scrapeProduct result for:` logs to debug scraper output.
- Verify Supabase keys and that the service role key has insert/update privileges.
