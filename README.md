de# UMU Attendance System

A digital replacement for Uganda Martyrs University's paper-based Class Attendance Register. Students self-check-in to class sessions; Class Reps manage sessions; Admins manage the academic structure.

## Tech Stack

- **Client:** React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router, Socket.IO
- **Server:** Express, TypeScript, Prisma, MySQL 8, Socket.IO, Puppeteer
- **Auth:** JWT (httpOnly cookies), bcrypt

## Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- MySQL 8

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment
cp server/.env.example server/.env
# Edit server/.env with your MySQL credentials

# Run database migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed

# Start development servers
pnpm dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@umu.ac.ug | password123 |
| Faculty Admin | facultyadmin@umu.ac.ug | password123 |
| Lecturer | lecturer@umu.ac.ug | password123 |
| Student | student@umu.ac.ug | password123 |

## Project Structure

```
/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── lib/
│       └── hooks/
├── server/          # Express backend
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── lib/
└── README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start client + server in development |
| `pnpm build` | Build both client and server |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database with demo data |
| `pnpm db:reset` | Reset database and re-seed |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
