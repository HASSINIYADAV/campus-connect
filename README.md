# CampusConnect

A responsive campus events app based on the supplied four-screen design. It includes account sign-in/sign-up, event discovery and filtering, event details, and a registration form.

## Run locally

1. Install Node.js 20.19+ (the checked environment uses Node 24).
2. From this folder, run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key.
4. Run `npm run dev` and open the local URL printed by Vite.
5. Run `npm run build` to create the static site in `dist/`.

The browser app uses only the Supabase publishable key. Never put a Supabase secret or service-role key in frontend variables.

## Supabase status

The connected project currently has `users`, `events`, and `registrations` tables. RLS is enabled, but no policies exist. Its two existing events are placeholder records without a date or status. Until event read access is configured, the UI shows clearly labeled sample events.

The registration form expects `public.event_registrations` and owner-scoped RLS policies. The proposed SQL is in `supabase/approval-required.sql`; it has **not** been run. Review it before applying it to the live project. It adds public read access for event listings and lets signed-in users create and read only their own registrations. It does not expose service credentials or permit users to mark a payment as paid.

The payment QR shown in the design is a visual placeholder, not a scannable payment code. Add the organizer's verified payment details and a payment confirmation workflow before accepting real payments. Google sign-in also requires the Google provider and redirect URL to be configured in Supabase Auth.

## Deploy

The project builds as a static Vite site and can be deployed to Vercel. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as project environment variables on the host. Add the deployed domain to Supabase Auth's allowed redirect URLs. Deployment has not been started.
