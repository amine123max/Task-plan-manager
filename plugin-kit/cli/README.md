# CLI Adapter

Generic CLI adapter for `task-plan-manager`.

## Why this covers many CLIs

Any CLI, terminal workflow, or editor extension that can run a local command can call this adapter.
That is the practical way to support "all CLI" environments without building a separate plugin for each shell.

## Install

### Local usage

```bash
cd plugin-kit/cli
npm install
npm link
```

### Global package distribution

```bash
npm publish
```

After publishing, users can install it with:

```bash
npm install -g task-plan-cli
```

## Commands

```bash
task-plan evaluate "Implement auth flow"
task-plan diagnostics
task-plan wake thread-abc
task-plan status thread-abc
task-plan progress thread-abc step-1 completed
```

## Bridge URL

Set `TASK_PLAN_BRIDGE_URL` if the bridge is not running on `http://127.0.0.1:42670`.
