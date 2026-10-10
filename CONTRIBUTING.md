# Contributing to Inkroom

Thank you for your interest in contributing to **Inkroom**! Inkroom is a free, open-source, real-time classroom whiteboard built to make collaborative teaching effortless anywhere in the world.

## Ground Rules

- Be respectful and considerate. We adhere to the [Code of Conduct](./CODE_OF_CONDUCT.md).
- Keep changes focused and atomic. One pull request per logical feature or bug fix.
- Follow the repository's architecture and design decisions documented in [`docs/architecture.md`](./docs/architecture.md) and [`docs/adr/`](./docs/adr/).
- Ensure automated tests and linter checks pass before opening a pull request.

## Monorepo Architecture

Inkroom is organized as a pnpm monorepo managed with Turborepo:

```
inkroom/
├─ apps/
│  ├─ web/         # Vite + React 18+ SPA (PWA client)
│  └─ server/      # Fastify + Hocuspocus real-time collaboration backend
├─ packages/
│  ├─ core/        # Headless whiteboard geometry, CRDT, spatial index, exporters
│  ├─ ui/          # Radix-based UI components & design system
│  └─ shared/      # Common types, zod schemas, permissions & constants
├─ docs/           # Architecture decision records and guides
└─ docker/         # Production container setups
```

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (recommended: `v22` / `v24 LTS`)
- **pnpm**: `v9.x` or `v11.x` (`npm install -g pnpm`)
- **Git**

### Installation

```bash
git clone https://github.com/Levi9111/inkroom.git
cd inkroom
pnpm install
```

### Running Locally

```bash
# Run both web client and collaboration server concurrently
pnpm dev

# Or run individual applications
pnpm --filter @inkroom/server dev
pnpm --filter @inkroom/web dev
```

The web application runs on `http://localhost:5173` and the collaboration server runs on `http://localhost:8080`.

## Git Commit Guidelines

We use **Conventional Commits** to keep the commit history informative and parseable for automatic changelogs:

```
<type>(<scope>): <short description>
```

### Allowed Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Code formatting changes (no production logic change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Tooling, build config, dependency bumps
- `ci`: CI/CD workflows and actions

### Examples
- `feat(core): implement ramer-douglas-peucker stroke simplification`
- `fix(web): prevent touch event interference during stylus input`
- `docs(adr): record decision for hocuspocus persistence adapter`

## Pull Request Process

1. Fork the repository and create your feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with meaningful conventional commit messages.
3. Run tests, linter, and type checks:
   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```
4. Push your branch to GitHub and submit a Pull Request.
5. In your PR description, explain the rationale, reference any open issue, and provide before/after screenshots for UI changes.

## License

By contributing to Inkroom, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
