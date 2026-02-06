# Turborepo Template

A modern, production-ready TypeScript monorepo template powered by **Turborepo**, designed for building scalable CLI applications and tools.

## 🚀 Features

- **Turborepo** - High-performance build system for monorepos
- **TypeScript** - Full type safety across the entire project
- **pnpm Workspaces** - Fast, disk-efficient package management
- **Vite** - Lightning-fast development and build tool
- **React** - Modern UI components (optional)
- **Biome** - Fast code linting and formatting
- **Storybook** - Component documentation and testing
- **Playwright** - End-to-end testing
- **Husky + Commitlint** - Git hooks and conventional commits
- **Changesets** - Version and changelog management

## 📦 Project Structure

```
turborepo-template/
├── apps/                   # Applications
│   ├── app/               # Flutter application
│   └── web/               # React (Vite) application
├── packages/              # Reusable packages and libraries
│   ├── ui/               # UI component library
│   ├── utils/            # Utility functions
│   └── shared-types/     # Shared TypeScript types
├── configs/              # Shared configurations
│   └── biome-config/     # Biome linting configuration
└── scripts/              # Build and automation scripts
```

## 🎯 Quick Start

### Prerequisites

- Node.js 24.11.1 or later
- pnpm 10.25.0 or later

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

## 📝 Available Scripts

### Development

```bash
# Start all development servers
pnpm dev

# Start specific package
pnpm dev:ui
```

### Build & Optimization

```bash
# Build all packages
pnpm build

# Clean build artifacts
pnpm clean

# Type checking
pnpm type-check
```

### Code Quality

```bash
# Lint all files
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Testing

```bash
# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Install Playwright browsers
pnpm playwright:install

# Show test report
pnpm playwright:show-report
```

### Documentation

```bash
# Storybook for UI components
pnpm sbk:ui

# Storybook for features
pnpm sbk:features

# Storybook for player
pnpm sbk:player
```

### Release Management

```bash
# Create changeset
pnpm version

# Version packages
pnpm changeset:version

# Publish packages
pnpm changeset:publish
```

## 🏗️ Creating New Packages

To create a new package in the monorepo:

1. Create a new directory in `packages/` or `apps/`:
   ```bash
  mkdir packages/my-package
  cd packages/my-package
   ```

2. Create a `package.json`:
   ```json
   {
     "name": "@template/my-package",
     "version": "0.0.1",
     "description": "My package description",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsup",
       "type-check": "tsc --noEmit"
     }
   }
   ```

3. Create a `tsconfig.json` extending the base config:
   ```json
   {
     "extends": "../../configs/tsconfig.base.json",
     "compilerOptions": {
       "declaration": true,
       "outDir": "./dist"
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist"]
   }
   ```

4. Create `src/` directory with your code

5. Run `pnpm install` to update the workspace

## 📋 Naming Conventions

All packages use the `@template` namespace:

- `@template/ui` - UI components
- `@template/utils` - Utilities
- `@template/shared-types` - Type definitions
- `@template/biome-config` - Linting configuration

When creating new packages, follow the same pattern: `@template/package-name`

## 🔧 Configuration Files

- **`turbo.json`** - Turborepo configuration
- **`pnpm-workspace.yaml`** - pnpm workspace configuration
- **`biome.json`** - Biome linter and formatter config
- **`tsconfig.base.json`** - Base TypeScript configuration
- **`commitlint.config.js`** - Commit message linting

## 📚 Technology Stack

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | 5.3.3+ | Type safety |
| Turborepo | 1.13.4+ | Build orchestration |
| pnpm | 10.25.0+ | Package management |
| Vite | 5.0.0+ | Build tool |
| React | 19.2.3+ | UI library |
| Biome | 2.3.8+ | Linting & formatting |
| Storybook | 8.6.14+ | Component documentation |
| Playwright | 1.57.0+ | E2E testing |

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run `pnpm lint:fix` to format code
4. Commit with conventional commit messages
5. Create a changeset with `pnpm version`
6. Submit a pull request

## 📄 License

MIT

## 🆘 Troubleshooting

### Port conflicts

If development servers fail due to port conflicts:
- UI Storybook: `STORYBOOK_PORT=6006 pnpm sbk:ui`
- Features Storybook: `STORYBOOK_PORT=6007 pnpm sbk:features`
- Player Storybook: `STORYBOOK_PORT=6008 pnpm sbk:player`

### Clean install

```bash
# Remove node_modules and lock files
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

---

**Happy coding! 🚀**
