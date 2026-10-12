# CardValue UK V11 — production SaaS foundation

CardValue UK is a Pokémon card scanner/valuation app with database-backed recognition, confirmation, sold-comps valuation, collection management and a reseller buying calculator.

## V11 additions
- Supabase authentication using email magic links.
- Cloud collection storage per user.
- Monthly scan quotas: Free 5, Collector 100, Pro Seller 500, Business 2,000.
- Stripe subscription checkout + webhook plan activation.
- PWA install manifest.
- Production deployment instructions for Vercel.
- eBay Marketplace Insights integration remains optional and requires approved access; Product Research CSV remains the compliant fallback.

## 1. Supabase
1. Create a Supabase project.
2. Open SQL Editor and run `supabase-schema.sql`.
3. Enable Email auth.
4. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables.

## 2. Stripe
Create three recurring Products/Prices in Stripe: Collector, Pro Seller and Business. Put their Price IDs into the matching `STRIPE_PRICE_*` variables. Create a webhook endpoint at `/api/stripe/webhook` and subscribe to `checkout.session.completed` and `customer.subscription.deleted`.

Stripe Billing supports recurring subscriptions and a customer portal. Keep payment secrets server-side only.

## 3. Recognition
Set Scrydex credentials for production recognition. OpenAI is the fallback.

## 4. Market data
Set eBay API credentials only if your application has approved access to the restricted Marketplace Insights API. Otherwise use eBay Product Research exports or a licensed market-data provider. Do not scrape eBay.

## 5. Deploy
Push this folder to GitHub, then import the repository into Vercel. Vercel has first-class Next.js deployment support. Add all environment variables before deploying.

## 6. Native mobile
The web app is mobile-first/PWA-ready. Once the public web product is stable, package it as iOS/Android using a native shell such as Capacitor, then complete Apple/Google store review. Do not publish until authentication, privacy policy, account deletion, subscription cancellation and data handling are production-tested.

## Important
A complete production build has not been run in this environment because dependency installation previously timed out. Run `npm install` and `npm run build` locally or in Vercel before launch.
