# Cadence
AI Group Project Coordinator

## Problem Statement -
  Keep a college group project moving. Build an AI agent that coordinates a group project through a real messaging platform: it follows up on pending tasks, interprets replies from participants, identifies blockers, and updates task progress. 

## Project Structure & Development Workflow

This repository is organized as a single, consolidated Next.js application root with the Express/Telegram coordination backend:

- `src/` — Next.js frontend (App Router, Tailwind CSS, shadcn/ui components)
- `backend/` — Express API, Telegram bot (`grammy`), state machine, and Supabase integration
- `public/` — Static assets
- `DESIGN-notion.md` — Source design tokens and aesthetics
- `CONTEXT.md` — Database schema, status rules, and guardrails

### Development Commands

- **Frontend (Next.js)**: `npm run dev` (starts on `http://localhost:3000`)
- **Backend API & Bot**: `npm run server` (starts Express & Telegram bot on `http://localhost:3001`)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
