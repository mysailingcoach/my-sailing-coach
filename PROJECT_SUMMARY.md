# Project Summary - My Free Sailing Coach

## Quick facts

- Type: full-stack web application
- Purpose: sailing performance analysis from GPX files
- License: MIT
- Stack: React, Express, SQLite
- Deployment: GitHub + Vercel + Render

## Included features

- GPX upload and validation
- Race analysis with distance, duration, and speed metrics
- Interactive map rendering with Leaflet
- Race history stored in SQLite
- Responsive UI built with Tailwind CSS
- Environment-based API configuration for local and hosted use

## Project structure

```text
sailing-coach/
├── backend/
├── frontend/
├── .github/workflows/
├── render.yaml
├── vercel.json
├── package.json
└── docs and setup files
```

## Local workflow

```bash
npm install
npm run install-all
npm run dev
```

The app runs locally at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Deployment workflow

The app is set up for a GitHub-based deployment flow:

- Frontend hosted on Vercel
- Backend hosted on Render
- Build checks run through GitHub Actions

Required environment values:

- Vercel: VITE_API_URL = your Render API URL
- Render: FRONTEND_URL = your Vercel frontend URL

## API overview

- POST /api/upload
- GET /api/races
- GET /api/races/:id
- DELETE /api/races/:id
- GET /api/health

## Current status

This version is a solid local-first sailing analytics app with support for hosted deployment and a simple GitHub-driven workflow. It is well suited for personal use, demos, and further expansion with more advanced sailing analytics.

## Suggested next steps

- Add weather overlays and current/wind insights
- Improve the AI analysis output
- Add user accounts and multi-user support
- Expand the race comparison and reporting features
