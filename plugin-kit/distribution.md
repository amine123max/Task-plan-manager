# Distribution Design

## Adapter families

### 1. VS Code-compatible family

Ship one extension package for editors that can consume VS Code extensions.
Typical delivery formats:

- VS Code Marketplace listing
- Open VSX listing
- direct `.vsix` download from GitHub Releases

### 2. JetBrains family

Ship one IntelliJ Platform plugin package for JetBrains IDEs.
Typical delivery formats:

- JetBrains Marketplace listing
- direct plugin zip from GitHub Releases

### 3. CLI family

Ship one Node-based CLI adapter for any environment that can execute local commands.
Typical delivery formats:

- npm registry
- direct tarball download from GitHub Releases

This is the practical way to support broad CLI usage without creating separate plugins for every shell.

## Direct download strategy

To support installation from editor ecosystems and CLI channels:

1. keep a dedicated adapter folder per family
2. give each adapter its own package metadata
3. build a release artifact per family
4. publish artifacts both to official marketplaces and GitHub Releases

## Packaging commands

### VS Code-compatible adapter

```bash
cd plugin-kit/vscode
npm install
npm run package
```

### JetBrains adapter

```bash
cd plugin-kit/jetbrains
gradle buildPlugin
```

### CLI adapter

```bash
cd plugin-kit/cli
npm pack
npm publish
```
