# Task-plan-manager

[English](README.md) | [Chinese](README.zh-CN.md)
- `openai` - `ai-agent` - `task-planning` - `workflow` - `developer-tools` - `productivity` - `vscode-extension` - `jetbrains-plugin` - `cli-tool`

Task-plan-manager is a planning-focused Codex skill and tooling package built for long-running, multi-step work.
It keeps complex requests visible, structured, and trackable through a retained task list, synchronized `update_plan` state, and reusable adapters for Codex, IDEs, and CLI workflows.

## Overview

Modern AI-assisted development often breaks down in the same places:

- long tasks lose visible progress
- follow-up requests overwrite the previous plan
- simple requests get over-planned
- different tools show different task states

Task-plan-manager addresses that by enforcing a practical planning model:

- create task lists only for substantial work
- skip planning for simple chat and obvious one-step requests
- retain one stable task list per active thread
- refresh the full visible list whenever progress changes
- reuse the same planning behavior across Codex, editors, and command-line workflows

## Core Capabilities

- Long-task planning: decompose implementation, debugging, refactoring, and research tasks into actionable steps.
- Stable task rendering: keep one retained thread plan instead of replacing it with fragmented mini-plans.
- `update_plan` synchronization: treat the visible task panel as the rendering of the retained master list.
- Wake and diagnostics support: expose heartbeat, idle detection, wake, and chain-diagnostics hooks through the local bridge.
- Multi-environment distribution: support Codex skill usage, VS Code-compatible editors, JetBrains IDEs, and generic CLI environments.

## Repository Layout

```text
Task-plan-manager/
├── README.md
├── README.zh-CN.md
├── UPLOAD.md
├── UPLOAD.zh-CN.md
├── task-plan-manager/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── references/planning_rules.md
│   ├── scripts/merge_plan.py
│   └── assets/plan-template.md
└── plugin-kit/
    ├── core/
    ├── vscode/
    ├── jetbrains/
    ├── cli/
    ├── distribution.md
    ├── distribution.zh-CN.md
    └── protocol.md
```

## Architecture

### 1. Codex skill layer

The `task-plan-manager/` folder contains the skill logic used by Codex.
It decides when planning is required, when planning should be skipped, and how long tasks should stay aligned with one retained list.

### 2. Shared bridge layer

The `plugin-kit/core/` service acts as the shared backend for all adapters.
It evaluates requests, keeps per-thread task state, exposes wake and diagnostics endpoints, and lets multiple frontends share the same plan model.

### 3. Adapter layer

The project distributes the same planning model through multiple adapter families:

- `plugin-kit/vscode/` for VS Code-compatible editors
- `plugin-kit/jetbrains/` for JetBrains IDEs
- `plugin-kit/cli/` for generic terminal and automation workflows

This is the practical way to support broad tool coverage without pretending that one binary plugin can run everywhere.

## Installation

### Codex skill

Copy `task-plan-manager/` into the Codex skill directory:

- Windows: `C:\Users\<username>\.codex\skills\task-plan-manager`
- macOS/Linux: `~/.codex/skills/task-plan-manager`

Enable it in `~/.codex/config.toml`, then restart Codex.

### VS Code-compatible editors

Install the packaged extension:

- file: `plugin-kit/vscode/task-plan-vscode-0.1.0.vsix`
- marketplace target: VS Code Marketplace or Open VSX

### JetBrains IDEs

Build and distribute the plugin zip from `plugin-kit/jetbrains/`.
This adapter is structured for IntelliJ Platform IDEs.

### CLI environments

Publish `plugin-kit/cli/` to npm and install globally:

```bash
npm install -g task-plan-cli
```

This adapter is intended for terminal-centric workflows, automation pipelines, and any environment that can execute local commands.

