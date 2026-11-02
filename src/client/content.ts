export type DocPage = {
  slug: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  order: number;
  body: string;
};

const workflowExample = `## The workflow file

GitHub Actions reads YAML files from \`.github/workflows\`. A workflow names the event that starts it and the jobs that should run.

\`\`\`yaml
name: Verify
on:
  push:
    branches: [main]
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm ci
      - run: npm run verify
\`\`\`

Keep workflows small and explicit. Each step should have one clear responsibility so failures are easy to locate.`;

const page = (
  slug: string,
  title: string,
  description: string,
  level: DocPage['level'],
  order: number,
  body: string,
): DocPage => {
  const source = `---
title: ${title}
description: ${description}
level: ${level}
order: ${order}
---
${body}`;
  const [, frontmatter = '', content = ''] = source.split('---');
  const metadata = Object.fromEntries(
    frontmatter
      .trim()
      .split('\n')
      .map((line) => {
        const separator = line.indexOf(':');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );

  return {
    slug,
    title: metadata.title,
    description: metadata.description,
    level: metadata.level as DocPage['level'],
    order: Number(metadata.order),
    body: content.trim(),
  };
};

export const docs: DocPage[] = [
  page('introduction', 'Introduction to CI/CD', 'Understand the feedback loop that moves a change from your laptop to a reliable release.', 'Beginner', 1, `## Why CI/CD matters

Continuous integration (CI) automatically builds and tests changes as they are proposed. Continuous delivery keeps the application ready to release, while continuous deployment takes the final release step automatically.

This lab uses a small Express and TypeScript application so every concept stays concrete. You will make a change, describe it as code, run checks on GitHub-hosted runners, and deploy with confidence.

## The feedback loop

1. Create a focused change on a branch.
2. Open a pull request and let automation run.
3. Review the result and merge only when required checks pass.
4. Release the merged change through a repeatable delivery process.`),
  page('prerequisites', 'Prerequisites', 'Install the tools and accounts used throughout the labs.', 'Beginner', 2, `## Before you begin

You need Node.js 24, npm, Git, and a GitHub account. Clone the repository and install dependencies:

\`\`\`bash
git clone https://github.com/bahatijacklee/cicd-lab2.git cicd-lab
cd cicd-lab
npm ci
\`\`\`

Run the existing checks once before changing code:

\`\`\`bash
npm run verify
\`\`\``),
  page('installation', 'Installation', 'Run the Express API and the Vite documentation site locally.', 'Beginner', 3, `## Start the lab

The development command starts both the API on port 3000 and Vite on port 5173:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) for the documentation site. The API health check is available at [http://localhost:3000/api/health](http://localhost:3000/api/health).

For a production-like run, build both TypeScript and the client bundle, then start Express:

\`\`\`bash
npm run build
npm start
\`\`\``),
  page('your-first-workflow', 'Your First Workflow', 'Create a small verification workflow for every pull request.', 'Beginner', 4, workflowExample),
  page('workflow-syntax', 'Workflow Syntax', 'Learn the YAML building blocks used by GitHub Actions.', 'Beginner', 5, workflowExample),
  page('events-and-triggers', 'Events and Triggers', 'Choose when automation should start and how to keep it focused.', 'Beginner', 6, `## Start with intent

The \`on\` key defines events. Use \`pull_request\` for feedback before merge and \`push\` on \`main\` for post-merge delivery.

\`\`\`yaml
on:
  pull_request:
  push:
    branches: [main]
\`\`\`

Narrowing branch and path filters keeps feedback fast without hiding important failures.`),
  page('jobs-and-steps', 'Jobs and Steps', 'Compose independent jobs from readable, ordered steps.', 'Beginner', 7, `## Jobs are the units of work

A job runs on one runner. Its steps execute in order and share the checked-out workspace. Use separate jobs when work can run in parallel or needs a different environment. Use \`needs\` when a job must wait for another job to succeed.`),
  page('runners', 'Runners', 'Select the operating system and environment that executes a job.', 'Intermediate', 8, `## Hosted runners

\`ubuntu-latest\` is a good default for this Node.js project. Runners are ephemeral: install what you need and never rely on state left by a previous job.`),
  page('actions-and-marketplace', 'Actions and Marketplace', 'Reuse trusted actions while keeping their inputs visible and reviewable.', 'Intermediate', 9, `## Reuse carefully

Actions package common tasks such as checkout, Node setup, caching, and artifact uploads. Prefer official or well-maintained actions and pin major versions deliberately.`),
  page('continuous-integration', 'Continuous Integration', 'Build confidence by validating every proposed change.', 'Beginner', 10, `## CI is a team habit

CI is more than a YAML file: small branches, fast tests, and required checks make integration predictable. This project uses \`npm run verify\` as one repeatable entry point.`),
  page('continuous-delivery', 'Continuous Delivery', 'Keep every successful change ready for a human-approved release.', 'Intermediate', 11, `## Ready to release

Continuous delivery extends CI with packaging and deployment preparation. The release path is exercised frequently, even when production release still requires approval.`),
  page('continuous-deployment', 'Continuous Deployment', 'Understand the safeguards needed when merges release automatically.', 'Advanced', 12, `## Automate the last mile

Continuous deployment sends every change that passes policy to production. Use protected environments, rollback plans, observability, and small changes to make that automation safe.`),
  page('build-test-release', 'Build, Test, and Release', 'Connect verification, artifacts, and release steps into one pipeline.', 'Intermediate', 13, `## A practical pipeline

Build once, test the built output, then promote the same artifact. This avoids a release that differs from what CI actually validated.`),
  page('secrets-and-variables', 'Secrets and Variables', 'Configure workflows without exposing credentials in source control.', 'Advanced', 14, `## Keep sensitive values out of logs

Store credentials in GitHub Actions secrets and non-sensitive configuration in variables. Pass only the values a step needs, and never echo a secret for debugging.`),
  page('artifacts-and-caching', 'Artifacts and Caching', 'Speed up workflows and preserve useful build output.', 'Intermediate', 15, `## Cache dependencies, store results

Caching npm's download directory can speed up installs. Artifacts are different: they preserve files such as a compiled \`dist\` directory for later jobs or inspection.`),
  page('matrix-builds', 'Matrix Builds', 'Test a project against several supported versions without duplicating YAML.', 'Intermediate', 16, `## Expand a job deliberately

\`\`\`yaml
strategy:
  matrix:
    node: [22, 24]
\`\`\`

Keep the matrix aligned with versions you actually support so it remains useful rather than noisy.`),
  page('reusable-workflows', 'Reusable Workflows', 'Share trusted pipeline behavior across repositories and teams.', 'Advanced', 17, `## Make policy reusable

A reusable workflow centralizes common verification or deployment behavior. Define explicit inputs and secrets so callers know exactly what the workflow requires.`),
  page('workflow-security', 'Workflow Security', 'Reduce the attack surface of automation running with repository permissions.', 'Advanced', 18, `## Treat workflows as production code

Grant only required permissions, avoid executing untrusted pull-request code with write tokens, pin third-party actions thoughtfully, and review workflow changes carefully.`),
  page('create-first-workflow', 'Create Your First Workflow', 'A hands-on lab for adding verification to a repository.', 'Beginner', 19, `## Lab: add verification

Create \`.github/workflows/verify.yml\`, add checkout and Node setup steps, run \`npm ci\`, and finish with \`npm run verify\`. Push the branch and inspect the Actions run before opening your pull request.`),
  page('automate-tests', 'Automate Tests', 'Make the test suite a required part of code review.', 'Beginner', 20, `## Lab: fail safely

Introduce a small failing test locally, confirm the workflow catches it, then fix the implementation. This proves the check is exercising the code rather than merely reporting success.`),
  page('build-node-app', 'Build a Node.js Application', 'Compile TypeScript and preserve the output as an artifact.', 'Intermediate', 21, `## Lab: package the app

Run \`npm run build\` in CI and upload \`dist/**\` as an artifact. A later job can download that exact output for deployment.`),
  page('deploy-application', 'Deploy an Application', 'Promote a verified build to a hosting environment.', 'Intermediate', 22, `## Lab: deployment gates

Add deployment only after verification succeeds. Configure the hosting token as a repository secret and use an environment for approvals and protection rules.`),
  page('troubleshoot-failed-runs', 'Troubleshoot Failed Runs', 'Read logs systematically and turn failures into actionable fixes.', 'Beginner', 23, `## Lab: follow the first failure

Start with the first red step, reproduce its command locally, and inspect the runner's Node and dependency versions. Avoid rerunning blindly: the first meaningful error usually explains the rest.`),
];

export const navigation = [
  { title: 'Getting Started', items: ['introduction', 'prerequisites', 'installation', 'your-first-workflow'] },
  { title: 'GitHub Actions Fundamentals', items: ['workflow-syntax', 'events-and-triggers', 'jobs-and-steps', 'runners', 'actions-and-marketplace'] },
  { title: 'CI/CD Concepts', items: ['continuous-integration', 'continuous-delivery', 'continuous-deployment', 'build-test-release'] },
  { title: 'Advanced Workflows', items: ['secrets-and-variables', 'artifacts-and-caching', 'matrix-builds', 'reusable-workflows', 'workflow-security'] },
  { title: 'Hands-on Labs', items: ['create-first-workflow', 'automate-tests', 'build-node-app', 'deploy-application', 'troubleshoot-failed-runs'] },
];

export const getDoc = (slug: string) => docs.find((doc) => doc.slug === slug);
