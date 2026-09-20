# Taskify

A full-stack to-do app with deadlines, live urgency indicators, and account-based task lists.

## Features

- **Add tasks with deadlines** — pick a date/time when creating a task
- **Live urgency badges** — each task shows *Plenty of time* (green), *Due soon* (amber, <24h left), or *Overdue* (red), refreshing automatically
- **Deadline reminders** — opt-in browser notifications fire once when a task crosses into "due soon" or "overdue"
- **Confetti** — a little burst plays when you check a task off
- **Accounts** — sign up / log in via Supabase Auth; each user only sees their own tasks
- **Personal greeting** — shows the name given at signup

## Tech stack

- **Frontend:** React + TypeScript, built with Vite
- **Backend:** Express + TypeScript
- **Database & Auth:** Supabase (Postgres + Supabase Auth)

## Project structure

```
Rough-project/
├── frontend/   # React app (Vite)
└── backend/    # Express API
```

## Setup

### 1. Supabase

Create a project at [supabase.com](https://supabase.com), then run this in the SQL editor:

```sql
create table todos (
  id bigint generated always as identity primary key,
  todo text not null,
  is_done boolean not null default false,
  deadline timestamptz,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table todos enable row level security;

create policy "Users manage own todos" on todos
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Grab these from **Settings → API**:
- Project URL
- `anon` `public` key (frontend)
- `service_role` key (backend only — **never** expose this client-side)

### 2. Backend

```
cd backend
npm install
```

Create `backend/.env`:
```
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-service-role-key
```

Run it:
```
npm run dev
```

### 3. Frontend

```
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run it:
```
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Deployment

- **Frontend:** deploy to [Vercel](https://vercel.com) with root directory `frontend`. Set env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` (your deployed backend's URL).
- **Backend:** deploy to [Render](https://render.com) with root directory `backend`, build command `npm install && npm run build`, start command `npm start`. Set env vars `SUPABASE_URL`, `SUPABASE_KEY`, and `FRONTEND_URL` (your deployed frontend's URL, for CORS).
- In Supabase → **Authentication → URL Configuration**, add your deployed frontend URL so email confirmation links point to the right place.

## Notes

- `backend/.env` and `frontend/.env` are gitignored — never commit real Supabase keys.
- The `service_role` key must only ever live in the backend.
