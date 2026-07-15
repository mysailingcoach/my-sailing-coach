# Setup Instructions

## 1. Install dependencies

From the project root, run:

```bash
npm install
npm run install-all
```

This installs the root workspace tools plus the backend and frontend dependencies.

## 2. Configure environment variables

### Backend
Create backend/.env:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend
Create frontend/.env:

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Start the app locally

### Option A: run both services together

```bash
npm run dev
```

### Option B: run them separately

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

Once running, open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 4. Project structure

```text
sailing-coach/
├── backend/
│   ├── server.js
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── vite.config.js
├── render.yaml
├── vercel.json
├── package.json
└── README.md
```

## 5. Database

The app uses SQLite. The database file is created automatically in the backend folder as sailingcoach.db on first run.

## 6. Troubleshooting

- If the backend fails to start, check whether port 5000 is already used.
- If the frontend cannot connect to the API, confirm VITE_API_URL points to the correct backend URL.
- If uploads fail, make sure the file is a valid GPX file and that the backend has write access to its upload folder.

## 7. Deploying to Vercel and Render

- Deploy the frontend to Vercel and set VITE_API_URL to the Render backend URL.
- Deploy the backend to Render and set FRONTEND_URL to the Vercel frontend URL.
- The repository includes a GitHub Actions workflow for basic build checks.
