# Smart Blog — Workspace Documentation

## 1. Project

Smart Blog is a simple MERN blogging platform for a college project.
Users can read blogs and manage their own posts.
There is no AI integration.

## 2. Technologies

- MongoDB stores users and blogs.
- Express.js handles API requests.
- React.js displays the pages.
- Node.js runs the backend.
- Mongoose connects Express to MongoDB.
- JWT cookies keep users signed in.
- Simple CSS styles the pages.
- Docker runs the application in containers.
- GitHub Actions tests and builds the project.

## 3. Features

- Register and log in.
- View all blogs and read a full blog.
- Create a blog with a title and content.
- View personal blogs on My Blogs.
- Edit or delete only your own blogs.
- Log out and invalidate existing sessions.

## 4. Main files

```text
backend/
  server.js                 Connect database and start server
  app.js                    Set up Express and API routes
  routes/auth.js            Authentication URLs
  routes/blogs.js           Blog URLs
  controllers/authController.js   Account request handlers
  controllers/blogController.js   Blog request handlers
  middleware/auth.js        Verify JWT and manage cookies
  middleware/blogs.js       Check input and blog ownership
  models/User.js            User database schema
  models/Blog.js            Blog database schema
  test/app.test.js          API integration test
  Dockerfile                Backend container setup
frontend/
  src/App.jsx               Pages and navigation
  src/api.js                Shared API request helper
  src/main.jsx              Start React
  src/style.css             Page styling
  vite.config.js            Local API proxy
  nginx.conf                Docker web server settings
  Dockerfile                Build and serve React
.github/workflows/deploy.yml GitHub Actions workflow
docker-compose.yml          Start all three containers
package.json                Shared project commands
package-lock.json           Locked dependency versions
```

## 5. How the application works

1. React sends a request to an Express route.
2. Middleware checks login, input, or ownership.
3. The controller performs the requested action.
4. The Mongoose model reads or writes MongoDB data.
5. Express returns JSON and React updates the page.

Routes select the handler; controllers contain the operation.
The backend takes the author ID from the verified login session.

## 6. Database

**User:** name, email, passwordHash, sessionVersion, and timestamps.
Email addresses are unique and stored in lowercase.
Passwords are hashed with bcrypt, never stored as plain text.

**Blog:** title, content, author, and timestamps.
The author field refers to a user ID.
A user can own many blogs.
Titles allow 160 characters and content allows 20,000 characters.

## 7. Authentication

Registration requires a name, email, and password.
Passwords need at least 8 characters and allow up to 72 bytes.
Successful registration or login creates a one-day JWT cookie.
The cookie is HttpOnly and SameSite=Strict.
Use `COOKIE_SECURE=true` when hosting with HTTPS.
Protected requests check the JWT and the user's session version.
Logout changes that version and invalidates all that user's sessions.
The server checks ownership before editing or deleting a blog.
Login and registration share a limit of 30 attempts per 15 minutes.

## 8. Pages

- `/`: all blogs.
- `/register` and `/login`: account forms.
- `/create`: new blog form.
- `/blogs/:id`: full blog.
- `/blogs/:id/edit`: edit an owned blog.
- `/my-blogs`: current user's blogs.

## 9. API endpoints

- `POST /api/auth/register`: create an account.
- `POST /api/auth/login`: sign in.
- `GET /api/auth/me`: get the current user.
- `POST /api/auth/logout`: sign out.
- `GET /api/blogs`: get all blogs.
- `GET /api/blogs/mine`: get owned blogs.
- `GET /api/blogs/:id`: get one blog.
- `POST /api/blogs`: create a blog.
- `PUT /api/blogs/:id`: update an owned blog.
- `DELETE /api/blogs/:id`: delete an owned blog.
- `GET /api/health`: check database readiness.

Blog forms send `title` and `content` as JSON.
Write requests include `X-Requested-With: SmartBlog`.
The API helper sends this header and the session cookie automatically.
Errors return a message; successful deletion returns no body.

## 10. Run locally with Node

Install Node.js 24 and start a local MongoDB instance.
Run the following from the project root:

```sh
npm ci
cp -n backend/.env.example backend/.env
```

Set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.
Do not use the example secret. Keep `COOKIE_SECURE=false` for local HTTP.

```sh
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.
Vite sends `/api` requests to Express on port 5000.
Docker's default MongoDB service is not exposed to host-based Node.
For the complete Docker setup, use the deployment guide below.

## 11. Test and demonstrate

```sh
npm test
npm run build
```

Tests use an isolated MongoDB process, not your application database.
The first test run may download a MongoDB binary.
Tests cover authentication, CRUD, ownership, and session revocation.
For a demo: register → create → read → edit → delete → log out.
Use a second account to show that other authors' blogs are protected.

## 12. Deployment and scope

Read [Practical 13: Deployment](PRACTICAL_13_DEPLOYMENT.md).
Keep `.env`, `node_modules`, and generated builds out of GitHub.
The app has no AI, comments, uploads, password reset, or pagination.
