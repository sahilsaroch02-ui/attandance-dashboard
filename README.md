# College Attendance Management System

This project follows the HLD and LLD files in this folder.

## Start the whole project

From this folder, run:

```bash
npm run dev
```

This starts the backend, starts the frontend, and opens `http://localhost:5174` automatically.

## Start MySQL

```bash
docker compose up -d
```

## Start the backend

```bash
cd backend
cp .env.example .env
npm install
npm start
```

The API runs at `http://localhost:5001`.

## Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Create a student or teacher account from the frontend before signing in.
