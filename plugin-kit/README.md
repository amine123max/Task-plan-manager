# Plugin Kit

[English](README.md) | [Chinese](README.zh-CN.md)

This starter kit turns `task-plan-manager` into a practical cross-IDE and CLI distribution package.

## Supported adapter model

- `core/`: shared local bridge service
- `vscode/`: VS Code-compatible adapter distributed as `.vsix`
- `jetbrains/`: JetBrains adapter distributed as plugin zip
- `cli/`: generic command-line adapter distributed through npm

## Direct download channels

- VS Code Marketplace
- Open VSX
- JetBrains Marketplace
- npm registry for CLI users
- GitHub Releases for direct artifact downloads

## CI build

Upload this package to GitHub and run `.github/workflows/build-plugins.yml`.
It will produce editor artifacts, and you can publish the CLI package separately through npm.

## Files to read next

- `distribution.md`
- `distribution.zh-CN.md`
- `protocol.md`
