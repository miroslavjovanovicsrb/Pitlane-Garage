# PitLane Garage — Your Vehicle Library

A dark, motorsport-styled vehicle library built with [Lovable](https://lovable.dev). Registered users collect and showcase vehicles like books on a shelf: every vehicle is one entry in the shared garage.

**Live app:** https://pitlane-garage.lovable.app

## Features

- **User accounts** — registration, login and logout (Supabase Auth, email + password only — no social sign-in, no email confirmation required)
- **Home** — hero section with live counters (vehicles / drivers)
- **Collection** — searchable, filterable grid of all vehicles
- **Vehicle detail** — full spec sheet with owner and date added
- **Add / edit / delete** — owners manage their own vehicles (protected routes)
- **Row Level Security** — everyone can read, only owners can modify their entries

## Tech stack

- React + TypeScript, Tailwind CSS, shadcn-style components
- Supabase (Lovable Cloud) — PostgreSQL database, auth, RLS
- TanStack Router, TanStack Query

## Database schema

| Table | Columns |
|---|---|
| `profiles` | id (FK → auth.users), username, created_at |
| `vehicles` | id, owner_id (FK → profiles), brand, model, year, category, engine, horsepower, color, description, image_url, created_at |

## Run locally

git clone https://github.com/miroslavjovanovicsrb/Pitlane-Garage.git
cd Pitlane-Garage
npm install
npm run dev

Built with Lovable — describe what you want, and continue developing in the [Lovable editor](https://lovable.dev).
