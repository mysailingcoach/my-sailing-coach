# Getting Started with My Free Sailing Coach

## 🚀 Quick start

### 1. Install dependencies

```bash
npm install
npm run install-all
```

### 2. Start the app locally

```bash
npm run dev
```

Open:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 3. Upload a GPX file

- Open the app in your browser
- Upload a GPX file from a race
- Review the map and metrics

---

## 📚 Helpful docs

- [USER_GUIDE.md](USER_GUIDE.md) - how to use the app
- [SETUP.md](SETUP.md) - local setup and environment variables
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - feature overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - production deployment notes

---

## 🧩 Local environment

Create these files before running locally:

### Backend
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deploying the app

The project is ready for a GitHub-based deployment flow:

- Vercel hosts the React frontend
- Render hosts the Express backend
- GitHub Actions runs a build check on push and pull request

Set these values after deployment:

- Vercel: VITE_API_URL = your Render backend URL
- Render: FRONTEND_URL = your Vercel frontend URL

---

## 🛠️ Useful commands

```bash
# install everything
npm run install-all

# run both services
npm run dev

# run backend only
npm run dev:backend

# run frontend only
npm run dev:frontend

# build the frontend
cd frontend && npm run build
```

---

## 🐛 Troubleshooting

- If the app cannot connect to the API, verify VITE_API_URL.
- If uploads fail, confirm the file is a valid GPX document.
- If the backend does not start, check whether port 5000 is already in use.
