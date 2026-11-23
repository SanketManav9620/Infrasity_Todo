# BurgundyNotes — MERN Stack Note-Taking Application

A clean, responsive, and secure full-stack Note-Taking application built with the **MERN** stack (**M**ongoDB, **E**xpress, **R**eact, **N**ode.js). Designed with a **White & Burgundy** aesthetic, featuring complete user authentication, strict data isolation, and full CRUD capabilities.

---

## 🔗 Submission Links

- **GitHub Repository**: [https://github.com/SanketManav9620/Infrasity_Todo](https://github.com/SanketManav9620/Infrasity_Todo)
- **Live Hosted Application**: `https://burgundynotes.vercel.app` *(see [Deployment Guide](#-deployment-guide) below)*

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Axios |
| **Backend** | Node.js, Express.js (REST API, CORS, JSON Middleware) |
| **Database** | MongoDB & Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js (10 salt rounds) |
| **Testing** | Automated integration test suite (`Backend/test-api.js`) |

---

## ✨ Features & Functionality

- **User Authentication**:
  - Secure registration and login with input validation (email format, minimum password length).
  - Password hashing via `bcryptjs` with pre-save salting.
  - Stateless authentication using signed `jsonwebtoken` (JWT) stored securely on the client.
  - Persistent login session across browser reloads (`/api/auth/me`).

- **Strict User Isolation & Data Security**:
  - Notes are **strictly private** to the authenticated user who created them.
  - Every note document contains a mandatory reference to its creator (`user: ObjectId`).
  - All CRUD routes verify note ownership before performing reads, updates, or deletions.
  - Any cross-user access attempts return `403 Forbidden` or `404 Not Found`.

- **Comprehensive Note Management (CRUD)**:
  - **Create**: Add notes with title, rich content, category, and pin status.
  - **Read**: View notes sorted by pinned priority and latest update timestamp.
  - **Update**: Edit title, body, category, and pin status with pre-populated modal.
  - **Delete**: Safe deletion flow with custom confirmation modal.
  - **Search & Filter**: Real-time search across titles and content, plus category filtering (`General`, `Work`, `Personal`, `Ideas`, `Study`).

- **White & Burgundy Theme**:
  - Pure white background (`#FFFFFF` / `#FAF8F8`) paired with deep burgundy accents (`#800020`, hover `#68031C`, subtle tint `#FAF0F2`, borders `#EBDADF`).
  - Clear typography with *Plus Jakarta Sans*, responsive card grid, and minimal alert banners.
  - No flashy distractions; structured, functional, and maintainable.

---

## 📁 Project Architecture

```
Infrasity/
├── package.json               # Root scripts to orchestrate backend and frontend
├── .gitignore                 # Configured for node_modules, .env, and dist
├── README.md                  # Comprehensive documentation
├── Backend/
│   ├── config/
│   │   └── db.js              # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js  # Registration, login, and profile controllers
│   │   └── noteController.js  # Scoped CRUD note controllers
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT Bearer token verification
│   │   └── errorMiddleware.js # Central error & 404 handlers
│   ├── models/
│   │   ├── User.js            # User schema with bcrypt password hashing
│   │   └── Note.js            # Note schema linked to User via ObjectId
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth routes
│   │   └── noteRoutes.js      # /api/notes routes (protected)
│   ├── test-api.js            # Automated backend integration test suite (14 tests)
│   ├── server.js              # Express app entry & static production serving
│   ├── .env.example           # Backend environment template
│   └── package.json           # Backend dependencies
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── api.js         # Axios instance with auth interceptor
    │   ├── components/
    │   │   ├── Navbar.jsx     # Header with brand, user info, and logout
    │   │   ├── NoteCard.jsx   # Individual note card with tags and actions
    │   │   ├── NoteModal.jsx  # Create and edit modal
    │   │   └── DeleteConfirmModal.jsx # Deletion safety prompt
    │   ├── context/
    │   │   └── AuthContext.jsx# React Context for authentication state
    │   ├── pages/
    │   │   ├── Dashboard.jsx  # Notes grid, search, and category pills
    │   │   ├── Login.jsx      # Clean authentication form
    │   │   └── Register.jsx   # Account creation form
    │   ├── App.jsx            # Protected view routing
    │   ├── index.css          # Tailwind CSS v4 & custom scrollbar
    │   └── main.jsx           # React DOM root entry
    ├── index.html
    ├── vite.config.js         # Vite config with proxy & Tailwind plugin
    ├── .env.example           # Frontend environment template
    └── package.json           # Frontend dependencies
```

---

## 📡 API Reference

Base URL in development: `http://localhost:5000/api`

### 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login` | Public | Authenticate user & retrieve JWT | `{ "email": "...", "password": "..." }` |
| `GET` | `/api/auth/me` | Private | Fetch authenticated user profile | *Requires Bearer Token* |

### 2. Notes Routes (`/api/notes`)
*All notes endpoints require header: `Authorization: Bearer <token>`*

| Method | Endpoint | Access | Description | Query / Body |
|---|---|---|---|---|
| `GET` | `/api/notes` | Private | Fetch notes for logged-in user | `?search=...&category=...` |
| `GET` | `/api/notes/:id` | Private | Get single note by ID (ownership checked) | None |
| `POST` | `/api/notes` | Private | Create new note linked to user | `{ "title": "...", "content": "...", "category": "...", "isPinned": false }` |
| `PUT` | `/api/notes/:id` | Private | Update user's note | `{ "title": "...", "content": "...", "category": "...", "isPinned": true }` |
| `DELETE` | `/api/notes/:id` | Private | Delete user's note | None |

### 3. Health Check
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server status verification |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string.

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/mern-note-taking-app.git
cd mern-note-taking-app
```

### 2. Configure Environment Variables

**Backend (`Backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/notetaking_app
JWT_SECRET=burgundy_secure_jwt_secret_key_2026_note_taking_app
NODE_ENV=development
```
*(If using MongoDB Atlas, replace `MONGODB_URI` with your connection string).*

**Frontend (`frontend/.env` - optional in dev):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

You can install all dependencies from the root directory:
```bash
# Backend dependencies
cd Backend && npm install

# Frontend dependencies
cd ../frontend && npm install
cd ..
```

### 4. Run the Application

**Option A: Run both simultaneously (two terminals)**
- **Terminal 1 (Backend):**
  ```bash
  cd Backend
  npm run dev
  ```
  *Server runs at `http://localhost:5000`*

- **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```
  *Client runs at `http://localhost:3000`*

**Option B: Production build served from single port (Port 5000)**
```bash
npm run build
npm start
```
*Visit `http://localhost:5000` in your browser.*

---

## 🧪 Automated Verification Suite

An end-to-end integration test is included to verify all requirements:
```bash
npm run test:backend
```

**Tests Executed (14 / 14 Passed):**
1. Health check verification (`200 OK`)
2. Protected route unauthenticated rejection (`401 Unauthorized`)
3. User A registration & JWT generation (`201 Created`)
4. Duplicate email registration rejection (`400 Bad Request`)
5. User A login & password comparison (`200 OK`)
6. User B registration (`201 Created`)
7. User A note creation (`201 Created`)
8. User A note retrieval
9. **Cross-user isolation check**: User B note list contains 0 notes from User A
10. **Cross-user isolation check**: User B cannot view User A's note by ID (`403 Forbidden`)
11. **Cross-user isolation check**: User B cannot update User A's note (`403 Forbidden`)
12. **Cross-user isolation check**: User B cannot delete User A's note (`403 Forbidden`)
13. User A updates their own note (`200 OK`)
14. User A deletes their own note (`200 OK`)

---

## 🌐 Deployment Guide (Live Hosting)

### Deploying to Render (Recommended - Free & Seamless)

1. **Database (MongoDB Atlas)**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - In "Database Access", create a database user and password.
   - In "Network Access", allow IP `0.0.0.0/0` (allow from anywhere).
   - Copy the connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/notetaking_app?retryWrites=true&w=majority`).

2. **Web Service on Render**:
   - Push your repository to GitHub.
   - Go to [dashboard.render.com](https://dashboard.render.com) and create a **New Web Service**.
   - Connect your GitHub repository.
   - Settings:
     - **Environment**: `Node`
     - **Build Command**: `npm install --prefix Backend && npm install --prefix frontend && npm run build --prefix frontend`
     - **Start Command**: `npm start`
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: `<your MongoDB Atlas connection string>`
     - `JWT_SECRET`: `<a secure random string>`
     - `PORT`: `5000`
   - Click **Deploy Web Service**. Once deployed, Render provides your live URL (e.g. `https://burgundynotes.onrender.com`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
