# Price-Scout

Price-Scout is a lightweight Next.js app that monitors product prices by scraping product pages and storing price history in Supabase. It provides user authentication, a simple UI to add product URLs, and scheduled checks to record price changes.

**Key features**
- Add products by URL — automatic scraping of name, price, currency, and image
- Persist current product data and historical price snapshots in Supabase
- User authentication via Supabase
- Server-side cron route for periodic price checks

**Tech stack**: Next.js (App Router), Supabase, Firecrawl (scraper)

Getting started
- Requirements: Node.js 18+, a Supabase project, and a Firecrawl API key (or equivalent scraper)
- Copy the example env and set values in `.env.local` at the project root

Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
FIRECRAWL_API_KEY=sk_...
```

Install and run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, sign in, and add product URLs to begin tracking prices.

Project structure (important files)
- `src/app/` — Next.js App Router pages and API routes (including cron route: `src/app/api/cron/check-prices/route.js`)
- `src/lib/firecrawl.js` — scraper wrapper used to extract product data
- `src/components/` — UI components (product card, add-product form, chart)
- `src/utils/supabase/` — Supabase client and server helpers

Database (high level)
- `products` table: stores current product data
- `price_history` table: stores timestamped price snapshots

Notes
- Ensure the Supabase service role key is kept secret and used only on the server.
- The cron check route is implemented as a server route — adapt scheduling to your deployment environment.

Contributing
- Fork, add a branch, and open a PR with a clear description of changes.

License
- MIT
