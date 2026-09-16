# Contributing

Thanks for your interest in improving EstimateCards. This project aims to stay small, practical, and easy to review.

## Local Setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Copy the environment template:

```bash
cp .env.example .env
```

4. Add your Firebase web app values to `.env`.
5. Start the app:

```bash
npm run dev
```

## Branches

Create a branch from `main`:

```bash
git switch main
git pull
git switch -c feature/short-description
```

Use clear branch names such as:

- `feature/add-room-timer`
- `fix/presence-cleanup`
- `docs/update-readme`

## Build and Checks

Before opening a pull request, run:

```bash
npm run build
```

The repository has a `lint` script, but root ESLint dependencies are not fully configured yet. CI currently runs the production build as the required check.

## Pull Requests

Pull requests should:

- Explain the problem and solution.
- Keep changes focused and reviewable.
- Include screenshots for UI changes when practical.
- Avoid unrelated formatting churn.
- Avoid committing generated files, `.env`, Firebase debug logs, or credentials.

## Coding Standards

- Use TypeScript and existing React patterns.
- Keep components and hooks small and readable.
- Prefer Firebase rules for security enforcement, not client-only checks.
- Trim and limit user input before writing to Firebase.
- Keep console logging out of production code unless it is intentional and useful.
- Do not introduce paid services or large architecture changes without discussion.

## Reporting Bugs or Suggesting Features

Open a GitHub issue with:

- A clear title.
- Steps to reproduce, if it is a bug.
- Expected behavior.
- Actual behavior.
- Screenshots or logs when useful.
- Browser/device details for UI issues.

For security concerns, please follow [SECURITY.md](SECURITY.md).
