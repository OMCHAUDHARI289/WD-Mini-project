# WD-Mini-project

## Smart Blog — Simple MERN Blogging Platform

A small MERN blogging application for a college demonstration. React and simple CSS on the frontend, Express and MongoDB on the backend. No AI integration.

## Practical 13: Deploy a MERN Application

**Objective:** Deploy a MERN application using Docker containers and configure GitHub Actions for automated delivery. The current workflow tests and publishes container images; remote server rollout is a separate configuration step.

## Implementation guide

1. **Set up the workspace:** use Node.js 24 and npm workspaces for `frontend` and `backend`. Install the locked dependencies with `npm ci`.
2. **Configure MongoDB:** set `MONGODB_URI` for local Node development, or use the internal MongoDB service provided by Docker Compose.
3. **Define the models:** `User` stores account details and a password hash; `Blog` stores its title, content, and author reference.
4. **Implement authentication:** controllers handle registration, login, current user, and logout; middleware verifies JWT cookies.
5. **Implement blog CRUD:** routes connect URLs to controllers, with validation and ownership middleware protecting writes.
6. **Build the React pages:** Home, Register, Login, Create Blog, Blog Details, Edit Blog, and My Blogs use the shared API helper.
7. **Verify the application:** run `npm test` and `npm run build`, then demonstrate registration, publishing, editing, deletion, and logout.
8. **Containerize and deliver:** Docker Compose starts the app locally; GitHub Actions tests builds and publishes images on successful main-branch runs.

The setup commands below require the complete project source. A README-only initial commit does not yet include the runnable app, linked documentation, or GitHub Actions workflow.

## Documentation

- [Workspace documentation](docs/WORKSPACE_DOCUMENTATION.md): architecture, file structure, API, authentication, setup, and viva guide.
- [Practical 13: Deployment](docs/PRACTICAL_13_DEPLOYMENT.md): Docker, GitHub Actions, remote deployment steps, and optional Vercel hosting.

## Features

Register, log in, browse all blogs, read a full blog, publish, view My Blogs, edit and delete your own blogs, and log out. The database starts empty: create an account and publish your first story.

## Run on macOS with Docker (recommended)

Install and start Docker Desktop. From this project folder:

```sh
cp -n .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into `.env` as `JWT_SECRET`, then:

```sh
docker compose up --build -d
```

Open http://localhost:8080. Check status with `docker compose ps` and logs with `docker compose logs -f`. Stop with `docker compose down`. MongoDB data stays in the named volume. `docker compose down -v` permanently deletes that data.

If port 8080 is occupied, change APP_PORT in `.env`. MongoDB and the backend are internal to Docker and do not take host ports.

## Run with Node for development

Use Node 24 and a local MongoDB instance (or a MongoDB Atlas URI).

```sh
npm ci
cp -n backend/.env.example backend/.env
```

Set a generated JWT_SECRET and your MONGODB_URI in `backend/.env`, then:

```sh
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). Vite proxies `/api` to Express on port 5000. If you change the backend port, update `frontend/vite.config.js` as well.

```sh
npm test
npm run build
```

Tests start an isolated real MongoDB using mongodb-memory-server; its first run downloads a MongoDB binary. They never use your application database.

## Structure and viva explanation

- `frontend/src/App.jsx`: pages, routing, forms and state.
- `frontend/src/api.js`: shared JSON requests to Express.
- `frontend/src/style.css`: responsive CSS.
- `backend/server.js`: connects MongoDB and starts Express.
- `backend/app.js`: middleware and API routing.
- `backend/models/`: Mongoose schemas for users and blogs.
- `backend/routes/`: API URLs and middleware order.
- `backend/controllers/`: authentication and blog CRUD request handlers.
- `backend/middleware/blogs.js`: blog validation and author ownership checks.
- `backend/middleware/auth.js`: JWT verification and session handling.

React submits a form to Express. Express validates the input. Mongoose saves it in MongoDB. Express returns JSON, and React updates the page. Each blog stores its author's user ID; the server checks this ID before editing or deleting.

Passwords are hashed with bcrypt. JWTs are held in HttpOnly, SameSite cookies, not localStorage. Logout increments the user's session version, invalidating all their current login sessions. Mutating requests require a custom same-origin header; CORS is not enabled. Authentication attempts are rate limited. React renders blog content as plain text.

## API

- `POST /api/auth/register`: name, email, password.
- `POST /api/auth/login`: email, password.
- `GET /api/auth/me`: current user.
- `POST /api/auth/logout`: revoke sessions.
- `GET /api/blogs`: all blogs, newest first.
- `GET /api/blogs/mine`: current user's blogs.
- `GET /api/blogs/:id`: full blog.
- `POST /api/blogs`: title and content.
- `PUT /api/blogs/:id`: update own title and content.
- `DELETE /api/blogs/:id`: delete own blog.
- `GET /api/health`: database readiness.

Mutation requests must include `X-Requested-With: SmartBlog`. Authenticated requests must include the session cookie.

## Docker and GitHub Actions

Docker Compose runs MongoDB, Express, and an Nginx-served React build. Nginx forwards API requests to Express. Health checks sequence startup.

`.github/workflows/deploy.yml` runs tests, builds React, and builds both Docker images on pull requests and main-branch pushes. Successful main-branch builds publish images to GitHub Container Registry with `latest` and commit SHA tags. This is CI plus image delivery; deployment to a public server is not configured because no hosting destination was provided. Push this project to a GitHub repository with Actions/package publishing enabled to execute the workflow.

For public deployment, configure HTTPS and COOKIE_SECURE=true, database authentication/backups, and a reverse proxy. The provided Compose configuration binds only to localhost and is intended for a local college demonstration. Google Fonts enhance the typography when online; system fonts provide offline fallbacks.

## Demo sequence

Register → publish a blog → view it on Home → open details → edit → open My Blogs → delete → log out → log in again. Use a second account to demonstrate that other authors' blogs cannot be edited or deleted.
