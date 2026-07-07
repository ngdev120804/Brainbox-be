# BrainBox - Backend (minimal)

Quick start for local development:

1. Install dependencies:

```bash
npm install
```

2. Start dev server (TypeScript, auto-reload):

```bash
npm run dev
```

Server listens on `PORT` (default `4000`). Set `FRONTEND_URL` to your FE origin (e.g. `http://localhost:5173`).

Endpoints:
- `POST /api/auth/register` { username, password, fullName }
- `POST /api/auth/login` { username, password }

Notes: This is a minimal in-memory example. For production use a real database and secure `JWT_SECRET`.
