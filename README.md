# CampusConnect

A responsive campus events app based on the supplied four-screen design. It includes account sign-in/sign-up, event discovery and filtering, event details, and a registration form.

## Run locally

1. Install Node.js 20.19+ (the checked environment uses Node 24).
2. From this folder, run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key.
4. Run `npm run dev` and open the local URL printed by Vite.
5. Run `npm run build` to create the static site in `dist/`.

The browser app uses only the Supabase publishable key. Never put a Supabase secret or service-role key in frontend variables.

## Supabase setup

The connected project has `users`, `events`, and `registrations` tables. The app reads from `events` and writes to `registrations`. The SQL in `supabase/approval-required.sql` matches those tables, publishes event rows for reading, points registration ownership at Supabase Auth users, and restricts each registration to its owner. Apply it in the Supabase SQL Editor before expecting live events and registration to work.

The two existing event rows have no date or status, so they will appear with “Date to be announced” until an organizer fills in the event details. The app does not collect payment or mark a registration as paid. The QR graphic is illustrative only.

In Supabase **Authentication → URL Configuration**, set the Site URL to `https://campus-connect-mu-three.vercel.app` and add that exact URL to the Redirect URLs allow list. Sign-up, resend, password reset, and Google OAuth callbacks use the current app origin. Keep email confirmation enabled. The hosted test email sender is rate-limited; configure custom SMTP in Supabase Auth settings before opening sign-up to general users. Google sign-in also requires enabling the Google provider and adding its OAuth client ID and secret directly in Supabase settings. Never place provider secrets or service-role keys in the browser app or chat.

## Deploy

The project builds as a static Vite site and is deployed at `https://campus-connect-mu-three.vercel.app/`. Vercel needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` configured as project environment variables.
