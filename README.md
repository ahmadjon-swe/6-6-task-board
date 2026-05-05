# 📋 Task Board — Express.js & React

A full-stack **Trello-style task management** application built with **Express.js** on the backend and **React** on the frontend. Users can create boards, invite members, and manage tasks across Kanban-style status columns.

---

## ✨ Features

- **Authentication** — Register, login with JWT, logout, and delete account
- **Role-based Access** — `user` and `admin` roles with different permissions
- **Boards** — Create, update, and delete boards; invite members to collaborate
- **Tasks** — Create tasks with title, description, assignee, and due date; update or delete them
- **Kanban View** — Tasks grouped by status: `Pending`, `In Progress`, `Partial`, `Completed`
- **Admin Panel** — View all users, update roles, and delete accounts
- **Swagger API Docs** — Interactive docs available at `/api/docs`

---

## 🏗️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework | Express.js v5 |
| Database | PostgreSQL (raw `pg` queries) |
| Auth | JWT, bcrypt |
| API Docs | Swagger UI + YAML |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
.
├── backend/
│   ├── controller/        # Route handlers (auth, boards, tasks, admin)
│   ├── router/            # Express routers
│   ├── middleware/        # JWT authentication middleware
│   ├── database/          # PostgreSQL pool connection
│   ├── errors/            # Custom error handler
│   ├── doc/               # Swagger YAML documentation
│   ├── temp/              # SQL seed/schema scripts
│   └── index.js           # App entry point
│
└── client/
    └── src/
        ├── api/           # Axios instance
        ├── components/    # Shared components (Navbar)
        └── pages/         # Login, Register, Boards, BoardDetail, Admin
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/task-board.git
cd task-board
```

---

### 2. Database Setup

Create a PostgreSQL database and run the SQL schema from `backend/temp/info.sql`:

```bash
psql -U postgres -d your_db_name -f backend/temp/info.sql
```

---

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
SECRET_KEY=your_jwt_secret_key

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=postgres
DB_PASSWORD=your_password
```

Start the development server:

```bash
npm run dev
```

The server will start at `http://localhost:3000`.  
Swagger docs will be available at `http://localhost:3000/api/docs`.

---

### 4. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client will start at `http://localhost:5173`.

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create a new account | — |
| POST | `/login` | Login and receive JWT | — |
| POST | `/logout` | Logout | ✅ |
| DELETE | `/delete` | Delete own account (cascades boards & tasks) | ✅ |

### Boards — `/api/boards`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all boards (own + member of) | ✅ |
| GET | `/:id` | Get single board | ✅ |
| POST | `/` | Create a new board | ✅ |
| PUT | `/:id` | Update board (owner or admin) | ✅ |
| DELETE | `/:id` | Delete board (owner or admin) | ✅ |
| POST | `/:id/members` | Add a member to board (owner or admin) | ✅ |

### Tasks — `/api/tasks`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/?board_id=x` | Get tasks grouped by status (Kanban) | ✅ |
| GET | `/:id` | Get single task | ✅ |
| POST | `/` | Create a task | ✅ |
| PUT | `/:id` | Update task (creator or admin) | ✅ |
| DELETE | `/:id` | Delete task (creator or admin) | ✅ |

### Admin — `/api/admin`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users` | List all users | ✅ admin |
| PUT | `/users/:id` | Update user info / role | ✅ admin |
| DELETE | `/users/:id` | Delete user (cascades their data) | ✅ admin |

---

## 🔐 User Roles

| Role | Permissions |
|---|---|
| `user` | Manage own boards & tasks, add members to own boards |
| `admin` | Full access to all boards, tasks, and user management |

---

## 🖥️ Frontend Pages

| Route | Page | Auth Required |
|---|---|---|
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |
| `/boards` | My Boards | ✅ |
| `/boards/:id` | Board Detail (Kanban view) | ✅ |
| `/admin` | Admin Panel | ✅ |

---

## 📦 Scripts

### Backend
```bash
npm run dev    # Start development server with nodemon
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📄 License

This project is licensed under the MIT License.
