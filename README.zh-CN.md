# Task-plan-manager

[English](README.md) | [Chinese](README.zh-CN.md)

![openai](https://img.shields.io/badge/openai-0A0A0A?style=flat-square&logo=openai&logoColor=white) ![ai-agent](https://img.shields.io/badge/ai--agent-2563EB?style=flat-square) ![task-planning](https://img.shields.io/badge/task--planning-0F766E?style=flat-square) ![workflow](https://img.shields.io/badge/workflow-7C3AED?style=flat-square) ![developer-tools](https://img.shields.io/badge/developer--tools-334155?style=flat-square) ![productivity](https://img.shields.io/badge/productivity-15803D?style=flat-square) ![vscode-extension](https://img.shields.io/badge/vscode--extension-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white) ![jetbrains-plugin](https://img.shields.io/badge/jetbrains--plugin-111111?style=flat-square&logo=jetbrains&logoColor=white) ![cli-tool](https://img.shields.io/badge/cli--tool-CA8A04?style=flat-square)

Task-plan-manager 是一个面向长时间、多步骤工作的 Codex 规划技能与工具分发包。
它的目标是让复杂任务在 Codex、IDE 和 CLI 环境中始终保持可见、可拆解、可跟踪，并通过稳定任务列表与同步的 `update_plan` 状态避免任务中途失控。

## 项目概述

现代 AI 辅助开发常见的问题包括：

- 长任务执行时缺少清晰可见的进度
- 后续需求一来就覆盖前面的计划
- 简单请求也被过度规划
- 不同工具里的任务状态彼此不一致

Task-plan-manager 通过一套实用规划模型解决这些问题：

- 仅对实质性、长任务生成任务清单
- 对简单聊天和明显单步请求跳过规划
- 每个活跃线程只保留一份稳定任务列表
- 每次进度变化时重发完整可见清单
- 在 Codex、编辑器和 CLI 之间复用同一套规划行为

## 核心能力

- 长任务规划：将实现、调试、重构、研究等任务拆成可执行步骤。
- 稳定任务渲染：保留线程级主清单，而不是不断生成零碎的小计划。
- `update_plan` 同步：把可见任务面板视为 retained master list 的渲染结果。
- 唤起与诊断：通过本地 bridge 层提供 heartbeat、idle 检测、wake、链路诊断能力。
- 多环境分发：同时支持 Codex skill、VS Code 兼容编辑器、JetBrains IDE 和通用 CLI。

## 仓库结构

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

## 架构说明

### 1. Codex skill 层

`task-plan-manager/` 目录就是 Codex skill 本体。
它负责判断什么时候应该规划、什么时候应该跳过规划，以及如何让长任务始终围绕同一份稳定清单更新。

### 2. 共享 bridge 层

`plugin-kit/core/` 是所有适配器共用的本地桥接服务。
它负责请求评估、线程级任务状态维护、wake 与诊断接口，以及让多个前端共享同一套任务状态。

### 3. 适配器层

项目通过不同适配器家族把同一套规划模型分发出去：

- `plugin-kit/vscode/`：VS Code 兼容编辑器
- `plugin-kit/jetbrains/`：JetBrains IDE
- `plugin-kit/cli/`：终端、脚本、自动化工作流

这才是现实中支持多工具环境的方式，而不是假设一个插件可以无差别运行在所有 IDE 上。

## 安装方式

### Codex skill

将 `task-plan-manager/` 复制到 Codex 技能目录：

- Windows：`C:\Users\<你的用户名>\.codex\skills\task-plan-manager`
- macOS/Linux：`~/.codex/skills/task-plan-manager`

然后在 `~/.codex/config.toml` 中启用，并重启 Codex。

### VS Code 兼容编辑器

使用已经打包好的扩展：

- 文件：`plugin-kit/vscode/task-plan-vscode-0.1.0.vsix`
- 目标平台：VS Code Marketplace 或 Open VSX

### JetBrains IDE

从 `plugin-kit/jetbrains/` 构建并分发插件 zip。
该适配器面向 IntelliJ Platform IDE 家族。

### CLI 环境

将 `plugin-kit/cli/` 发布到 npm 后，用户可全局安装：

```bash
npm install -g task-plan-cli
```

适用于终端工作流、自动化脚本以及任何可以执行本地命令的环境。

## 分发目标

Task-plan-manager 支持四种主要分发形式：

- Codex skill 文件夹
- VS Code 兼容 `.vsix` 安装包
- JetBrains 插件 zip
- npm 分发的 CLI 包

