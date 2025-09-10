# StoryCrafter 2.0

An end‑to‑end AI story crafting app with a FastAPI backend, SQLite storage, and a React + Vite + Tailwind UI. It integrates Google Gemini via LangChain for assisted writing and manages users, projects, and chat sessions.

## Features
- Authenticated API with JWT
- Users, projects, chats, and messages persisted in SQLite
- AI chat using Google Gemini via LangChain
- React + Vite + Tailwind frontend scaffold in `src/`
- Cross‑origin enabled for local dev

## Tech Stack
- Backend: FastAPI, SQLAlchemy, Pydantic, JOSE (JWT)
- AI: LangChain + `langchain-google-genai`
- DB: SQLite (file `storycrafter.db`)
- Frontend: React 18, Vite, TailwindCSS

## Prerequisites
- Python 3.12+
- Node 18+
- Git
- A Google Generative AI key (Gemini) for AI features

## Setup

### 1) Clone and enter the project
```bash
git clone <your-fork-or-local-path>
cd StoryCrafter.2.0
```

### 2) Python environment and dependencies
```bash
python -m venv venv
# Windows PowerShell
aut\venv\Scripts\Activate.ps1
# or cmd
venv\Scripts\activate
# or bash (WSL)
source venv/bin/activate

pip install -r requirements.txt
```

### 3) Environment variables
Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your_google_gemini_api_key
SECRET_KEY=change_me_for_production
```
- `GEMINI_API_KEY` is required to enable Gemini‑powered generation.
- `SECRET_KEY` is used for signing JWTs (use a strong secret in production).

### 4) Database
SQLite file `storycrafter.db` is created automatically on first run. It is ignored by git.

## Running the app

### Backend (FastAPI)
From the project root with your virtualenv activated:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
- API base URL (local): `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`

### Frontend (React + Vite)
```bash
npm install
npm run dev
```
- Dev server (default): `http://localhost:5173`

Tailwind is configured via `postcss.config.js` and `tailwind.config.js`. The entry files are in `src/`.

## Project Structure (high‑level)
- `app.py`: FastAPI app, SQLAlchemy models, auth, and AI chat endpoints
- `storycrafter.db`: SQLite database (created on first run; git‑ignored)
- `src/`: React UI (Vite)
- `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`
- `images/`: UI mockups/screenshots
- `test_*.py`: Python tests

## Testing
```bash
# ensure venv is active
pytest -q
```

## Deployment Notes
- Replace `SECRET_KEY` with a strong value (env var) in production
- Use a production‑grade DB (e.g., Postgres) via `DATABASE_URL` if needed
- Configure CORS origins appropriately
- Serve the built frontend (Vite `npm run build`) from a static host or behind a reverse proxy

## Scripts
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Screenshots
See the `images/` directory for UI mocks: login/signup, chat interface, dashboard, and settings.

## License
MIT 