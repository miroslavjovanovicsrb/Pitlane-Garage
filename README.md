# PitLane Garage

A shared vehicle library for car and motorcycle enthusiasts. Collect and showcase race cars, street cars, classics, motorcycles and prototypes — each with a full spec sheet.

Built with [Lovable](https://lovable.dev).

## Features

- **Collection** — browse every vehicle in the library, with text search and category filters (Race Car, Street Car, Classic, Motorcycle, Prototype).
- **Vehicle spec sheets** — brand, model, year, engine, horsepower, color, photos, owner and date added.
- **Add / edit / delete** — signed-in users can park their own vehicles and manage them; only the owner can edit or delete.
- **Live stats** — the home page shows the current vehicle and driver counts.
- **Auth** — email sign-up with confirmation, plus social sign-in.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing with TanStack Router)
- TypeScript
- Tailwind CSS v4
- Lovable Cloud (Supabase) for the database, auth and storage
- shadcn/ui components, lucide-react icons

## Getting started

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Project structure

| Path | Purpose |
| --- | --- |
| `src/routes/` | Pages (file-based routing): home, `collection`, `vehicles/$id`, `auth` |
| `src/routes/_authenticated/` | Pages that require sign-in: `add`, `edit/$id` |
| `src/components/` | Shared UI: Navbar, VehicleCard, VehicleForm |
| `src/lib/vehicles.ts` | Shared vehicle form validation (zod) |
| `src/lib/auth.tsx` | Auth state (AuthProvider) |
| `src/styles.css` | Tailwind theme and the dark racing design tokens |

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
