# My Free Sailing Coach

My Free Sailing Coach is a free, open-source sailing performance analysis app that helps sailors review race data by uploading GPX files and exploring their route, metrics, and history.

## What it does

- 📤 Upload GPX files from watches, phones, or sailing apps
- 🗺️ View the route on an interactive map
- 📊 Review distance, duration, speed, and race details
- 💾 Keep a local history of uploaded races
- 🌐 Run locally or deploy it to GitHub-connected hosting platforms

## Local development

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
npm run install-all
```

### Start the app locally

```bash
npm run dev
```

This starts the backend on http://localhost:5000 and the frontend on http://localhost:3000.

## Environment variables

### Backend
Create a file at backend/.env with:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend
Create a file at frontend/.env with:

```env
VITE_API_URL=http://localhost:5000/api
```

If you are using a hosted backend, set VITE_API_URL to the deployed API URL instead.

## API endpoints

- POST /api/upload - upload and process a GPX file
- GET /api/races - list races
- GET /api/races/:id - get race details
- DELETE /api/races/:id - delete a race
- GET /api/health - health check

## Deployment

This project is prepared for a GitHub-based workflow with:

- Vercel for the frontend
- Render for the backend API
- GitHub Actions for CI builds

Use these environment values when deploying:

- Vercel: set VITE_API_URL to your Render backend URL
- Render: set FRONTEND_URL to your Vercel frontend URL

The repo includes deployment files for Vercel and Render in the project root.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Leaflet, React Router, Axios
- Backend: Express, SQLite, Multer, CORS, dotenv

## License

MIT License.

## Contributing

Contributions are welcome. Open an issue or submit a pull request on GitHub.
