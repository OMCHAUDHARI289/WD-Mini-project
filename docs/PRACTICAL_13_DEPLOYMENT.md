# Practical 13: Deploy a MERN Application

## 1. Objective

Deploy Smart Blog using Docker and configure GitHub Actions for CI/CD.
Use the Vercel website to host the frontend from a GitHub repository.
Technologies: MongoDB, Express, React, Node, Docker, and GitHub Actions.

## 2. Before you start

- Install and start Docker Desktop for local deployment.
- Have GitHub and Vercel accounts for online hosting.
- Make sure GitHub contains the complete project, not only README.md.
- Include both app folders, root package files, and the workflow file.
- Never upload `.env`, `node_modules`, or generated build folders.

Repository: [WD-Mini-project](https://github.com/OMCHAUDHARI289/WD-Mini-project).
The Vercel steps below use websites only, not the Vercel CLI.

## 3. Docker files

- `backend/Dockerfile`: installs dependencies and starts Express.
- `frontend/Dockerfile`: builds React and serves it with Nginx.
- `frontend/nginx.conf`: forwards `/api` requests to Express.
- `docker-compose.yml`: starts frontend, backend, and MongoDB.
- `.dockerignore`: excludes local files from Docker builds.

Request flow: browser → Nginx → Express → MongoDB.
The `mongo_data` volume keeps database data after containers stop.
Only the frontend is available on localhost port 8080.

## 4. Run with Docker

From the project folder, create `.env` if it does not exist:

```sh
cp -n .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into `JWT_SECRET` in the root `.env`.
Keep `APP_PORT=8080` and `COOKIE_SECURE=false` for local HTTP.

```sh
docker compose up --build -d
docker compose ps
```

Open `http://localhost:8080` and register an account.
Open `http://localhost:8080/api/health`; expect `{"status":"ok"}`.
MongoDB and backend should report healthy in Compose status.

```sh
docker compose logs -f
# Stop containers but keep database data:
docker compose down
```

After source changes, repeat `docker compose up --build -d`.
Do not add `-v` to the stop command unless you want to delete the data.

## 5. GitHub Actions

The workflow is `.github/workflows/deploy.yml`.
It runs on main-branch pushes, pull requests, and manual runs.
It installs dependencies, runs tests, and builds React and both images.
Successful main-branch runs publish images to GitHub Container Registry.
Images have a `latest` tag and a tag for the exact commit.
GitHub supplies `GITHUB_TOKEN`; production app secrets are not needed.

1. Open the repository on GitHub.
2. Select **Actions** and open **Test and build Docker images**.
3. Select **Run workflow** on `main`, or inspect a push-triggered run.
4. Check that `verify` and `publish` succeed.
5. View the published container packages on GitHub.

This workflow publishes images; it does not update a remote server.
The Vercel GitHub connection below provides separate frontend deployment.
It does not automatically wait for the Actions tests to pass.

## 6. Prepare the online backend

This guide hosts React on Vercel and Express on a separate Docker host.
Import the same GitHub repository through that host's website.
Use the repository root as build context and `backend/Dockerfile`.
Create a hosted MongoDB database and allow access from the backend host.
In the backend host's environment settings, add:

- `MONGODB_URI`: your hosted MongoDB connection string.
- `JWT_SECRET`: a strong random secret of at least 32 characters.
- `COOKIE_SECURE`: `true`.
- `PORT`: the port required by the host, or `5000` if configurable.

Deploy the backend and copy its public HTTPS URL.
Visit its `/api/health` URL and check for `{"status":"ok"}`.
A local Docker URL cannot be used as Vercel's online backend.
Backend hosting must work before registration and blogs work online.

## 7. Add Vercel routing on GitHub

1. Open the repository and select **Add file → Create new file**.
2. Name the file `vercel.json` at the repository root.
3. Paste the configuration below.
4. Replace `YOUR-BACKEND.example.com` with your backend hostname.
5. Select **Commit changes** to save it on the deployment branch.

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND.example.com/api/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

The first rule forwards API requests; the second supports React pages.
Keep API calls relative to `/api` so cookie login stays same-origin.
This configuration is an example; it has not been added to the app.

## 8. Deploy using the Vercel website

1. Open [vercel.com](https://vercel.com) and sign in with GitHub.
2. Select **Add New → Project**.
3. Allow access to `OMCHAUDHARI289/WD-Mini-project` and select **Import**.
4. Keep **Root Directory** at the repository root (`.`).
5. Select **Vite** as the **Framework Preset**.
6. Under build settings, enter the values below.

- **Install Command:** `npm ci`.
- **Build Command:** `npm run build`.
- **Output Directory:** `frontend/dist`.
- **Node.js Version:** `24.x` in project settings.

These are website settings; do not run them in a terminal for Vercel.
Keep database credentials and JWT secrets on the backend host only.
Click **Deploy**, wait for **Ready**, and open the website URL.
Confirm the production branch is `main` in the project's Git settings.
Later commits to that connected branch trigger new Vercel deployments.

## 9. Verify and record the result

Test registration, login, creating, reading, editing, deleting, and logout.
Refresh a blog detail page to check that React routing works.
Check that another account cannot edit your blog.
Save screenshots of Docker status, Actions results, and the live website.
If API calls fail, check the backend health URL and the API rewrite.
If login is lost, check HTTPS and session-cookie forwarding.
If Docker port 8080 is busy, change `APP_PORT` in `.env`.
Report only deployments you actually completed and verified.

## 10. Official references

- [Import GitHub projects into Vercel](https://vercel.com/docs/git/vercel-for-github).
- [Vite hosting](https://vercel.com/docs/frameworks/frontend/vite).
- [API rewrites](https://vercel.com/docs/routing/rewrites).
