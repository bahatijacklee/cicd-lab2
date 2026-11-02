# CI/CD Lab Starter

A small Express, TypeScript, React, and Vite app for learning CI/CD with GitHub Actions. The project includes a responsive documentation website, an API health endpoint, automated tests, and a production build served by Express.

The documentation site covers GitHub Actions fundamentals, CI/CD concepts, advanced workflows, and hands-on labs. Documentation metadata uses Markdown-compatible frontmatter and the content is kept separate from layout components.

## Requirements

- Node.js 24 and npm
- Git
- GitHub and Render accounts for the deployment sections

## Get started

Clone the starter into a new folder:

```bash
git clone https://github.com/bradtraversy/cicd-lab-starter.git cicd-lab
cd cicd-lab
npm ci
```

Start the development API and documentation site together:

```bash
npm run dev
```

Open [localhost:5173](http://localhost:5173). The Vite development server proxies `/api` requests to Express on port 3000. The [health endpoint](http://localhost:3000/api/health) returns HTTP 200 with:

```json
{"status":"ok"}
```

Stop the server with Ctrl+C.

## Scripts

- `npm run dev`: start Express and Vite with automatic restarts.
- `npm run dev:server`: start only the Express API.
- `npm run dev:frontend`: start only the Vite documentation site.
- `npm run typecheck`: check backend and frontend TypeScript without generating output.
- `npm test`: run backend endpoint tests and Vitest/React Testing Library tests.
- `npm run test:backend`: run the existing Express endpoint tests.
- `npm run test:frontend`: run the documentation site tests.
- `npm run build`: compile the backend and bundle the frontend into `dist/client`.
- `npm start`: run the compiled Express app, including the built documentation site.
- `npm run verify`: run all type-checks, tests, and the production build.

## Frontend structure

- `src/client/App.tsx`: accessible layout, routing, sidebar, search, TOC, theme, and page navigation.
- `src/client/content.ts`: documentation metadata and Markdown content, parsed with frontmatter.
- `src/client/styles.css`: light-green-and-white documentation design system and responsive layout.
- `test/frontend/app.test.tsx`: navigation, search, TOC, copy, missing-page, and responsive drawer coverage.

Set `VITE_GITHUB_URL` to override the repository link shown in the top navigation.

## Start your own repository

From inside your newly cloned `cicd-lab` folder, remove the starter's Git history and remote connection, then initialize your own repository. This preserves the app files.

These commands use Bash or Zsh. On Windows, use Git Bash.

```bash
rm -rf .git
git init -b main
git add .
git commit -m "feat: add CI/CD lab starter"
```

Create an empty `cicd-lab` repository on GitHub without a README, license, or gitignore. Replace `YOUR_USERNAME` below with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/cicd-lab.git
git push -u origin main
```

Continue with the course to add verification and deployment. Keep `package-lock.json` committed; dependencies, build output, and environment files are excluded by `.gitignore`.

## Configuration

The server uses port `3000` unless `PORT` is set. The home page displays `APP_VERSION`, defaulting to `development`. Neither variable is required to run the starter locally.
