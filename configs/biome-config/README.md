# @x9/biome-config

This package provides the shared Biome linting and formatting configuration for all projects within the `x9` monorepo.

## Installation

In any application or package within the monorepo, add this as a development dependency:

```bash
pnpm add -D @x9/biome-config
# or using npm/yarn with workspace protocol
```

## Usage

1.  Install Biome in your project if you haven't:
    ```bash
    pnpm add -D @biomejs/biome
    ```

2.  Create a `biome.json` file in your project root with the following minimal content:
    ```json
    {
      "$schema": "https://biomejs.dev/schema.json",
      "extends": ["@x9/biome-config"]
    }
    ```

3.  Add scripts to your `package.json`:
    ```json
    {
      "scripts": {
        "lint": "biome check .",
        "lint:fix": "biome check --apply .",
        "format": "biome format --write .",
        "format:check": "biome format ."
      }
    }
    ```

## Overriding Rules

You can override any rule from the shared config in your local `biome.json`:

```json
{
  "extends": ["@x9/biome-config"],
  "formatter": {
    "lineWidth": 100
  }
}
```

## Versioning

This package follows [Semantic Versioning](https://semver.org/). Bumping its version in the monorepo root will allow all consuming packages to update independently.