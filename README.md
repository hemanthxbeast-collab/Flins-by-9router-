# Flins — Cross-Platform Voice Assistant

A functional, full-stack voice assistant MVP with a React + Vite frontend, Express + SQLite backend, JWT authentication, and simulated Spotify / YouTube / Outlook integrations. Runs on **Windows, macOS, and Linux** with zero native compilation.

---

## ✨ Features
- **Voice & text commands** — Web Speech API for mic input, typed fallback always works
- **Authenticated task execution** — Register / login, JWT sessions, bcrypt passwords
- **Intent router** — `play music`, `search youtube`, `read email` → simulated provider actions
- **Private history** — Every command stored per-user in SQLite (WAL mode)
- **Responsive UI** — Dark theme, mobile-friendly, accessibility-conscious
- **Tests & CI-ready** — Node test suite (3/3 passing), Vite production build

---

## 🖥️ Quick Start (any OS)

> **Prerequisite:** Node.js **22 LTS** or newer (`node --version` ≥ `v22.0.0`)

```bash
# 1. Clone
git clone https://github.com/hemanthxbeast-collab/Flins-by-9router-.git
cd Flins-by-9router-

# 2. Install dependencies (root, server, client)
npm ci

# 3. Run both dev servers
npm run dev
```

- **Frontend:** <http://localhost:5173> (Vite + React)
- **API:**      <http://localhost:8787/api/health> (Express)

Register an account, then try commands:
- `Play a focus playlist`
- `Search YouTube for lofi beats`
- `Read my latest email`

---

## 🐧 Linux (Ubuntu / Debian / Fedora / Arch)

```bash
# Ubuntu / Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fedora
sudo dnf module install -y nodejs:22

# Arch
sudo pacman -S nodejs npm
```
Then follow **Quick Start** above.

---

## 🍎 macOS

```bash
# Homebrew
brew install node@22
# or use nvm / fnm / volta
```
Then follow **Quick Start** above.

---

## 🪟 Windows (PowerShell)

```powershell
# 1. Install Node 22 (winget, chocolatey, or https://nodejs.org)
winget install OpenJS.NodeJS.LTS

# 2. Restart terminal, then:
git clone https://github.com/hemanthxbeast-collab/Flins-by-9router-.git
cd Flins-by-9router-
npm ci
npm run dev
```

---

## 📦 Production Build

```bash
npm run build       # outputs client/dist/ (static assets)
npm start           # runs Express serving the built client
```
Open <http://localhost:8787> — single origin, no CORS needed.

---

## 🔐 Environment Variables

Copy `.env.example` → `.env` (server only):

```env
PORT=8787
JWT_SECRET=replace-with-a-long-random-secret-minimum-32-characters
CORS_ORIGIN=http://localhost:5173
DATABASE_FILE=./data/flins.db
```
`JWT_SECRET` **must** be changed before any real deployment.

---

## 🗂️ Project Structure

```
flins-app/
├─ client/                 # React + Vite
│  ├─ src/main.jsx        # App entry (voice, auth, history)
│  └─ src/styles.css      # Dark, responsive theme
├─ server/                 # Express API
│  ├─ src/
│  │  ├─ index.js         # Boot
│  │  ├─ app.js           # Routes, middleware, validation
│  │  ├─ auth.js          # JWT issue / verify
│  │  ├─ database.js      # SQLite (node:sqlite, WAL)
│  │  └─ intent.js        # Command → intent router
│  └─ test/api.test.js    # 3 Node tests
├─ INTEGRATION-REPORT.md   # Architecture, security, testing, ops
└─ package.json            # Root scripts (dev, test, build)
```

---

## 🔒 Security Notes (MVP → Production)

| Area | MVP | Production Must-Haves |
|------|-----|-----------------------|
| Auth | JWT in localStorage | HttpOnly Secure cookies + CSRF, short access + rotating refresh tokens |
| Secrets | `.env` file | Vault / KMS, never in repo |
| Provider calls | Simulated | OAuth 2.0 PKCE, encrypted token storage, least-privilege scopes |
| Transport | HTTP localhost | TLS everywhere, HSTS, CSP |
| Dependencies | `npm audit` clean | Scheduled Dependabot / Renovate, SAST/DAST in CI |

---

## 🧪 Testing

```bash
npm test   # runs server/test/api.test.js (health, auth, tasks, 401/400)
```

Add later:
- React Testing Library component tests
- Playwright e2e (voice fallback, mobile layout)
- k6 load test (`/api/tasks` p95 < 200 ms target)
- OWASP ZAP scan in staging

---

## 📄 License

MIT — use freely, attribution appreciated.

---

## 🙋‍♀️ Support / Contribute

1. Fork → feature branch → PR
2. Issues for bugs / feature requests
3. See `INTEGRATION-REPORT.md` for architecture deep-dive