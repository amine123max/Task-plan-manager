---
name: task-plan-manager
description: Planning orchestrator for substantive work. Decompose multi-step or implementation-oriented requests into small actionable subtasks and publish progress through update_plan before execution. Skip planning for brief casual chat, simple questions, and obvious single-step tasks unless the user explicitly asks for a plan.
---

# Task Plan Manager

## Overview

Turn each request into execution-ready subtasks and persist them in one living plan file.
Preserve prior plan history and append follow-up work instead of rewriting existing batches.
Mirror substantive work in `update_plan` so progress is visible in the plan panel.
Default to `update_plan` only. Do not write real tasks to markdown files unless the user explicitly asks to persist.
Skip task lists for brief casual conversation, simple factual replies, and low-complexity single-step work.

## Workflow

1. Decide whether planning is needed.
- Skip `update_plan` for short conversation, lightweight Q&A, translations, rewrites, and obvious one-step actions.
- Use `update_plan` for multi-step implementation, debugging, file edits, research with several phases, or when the user asks for a plan.

2. Decompose the request into subtasks.
- Generate 2-8 tasks depending on complexity.
- Keep tasks atomic and testable.
- Keep one clear active step and mark the rest as pending.

3. Sync the plan to `update_plan` immediately.
- Call `update_plan` before doing substantive work when planning is required.
- Keep exactly one step as `in_progress`; keep the rest `pending` or `completed`.
- When follow-up scope arrives, append new steps instead of replacing existing open steps.
- Update statuses continuously as work advances so the user can see real-time progress.

4. Persist only on explicit request.
- Only when the user explicitly requests writing/saving to file, use `scripts/merge_plan.py`.
- Default file path for persistence: `C:\Users\Amine\.codex\plans\task-plan-manager-plan.md`.
- If not explicitly requested, skip file writes.

5. Report back to the user.
- Show which plan file was updated.
- Show the batch id that received new tasks.
- Show the exact added tasks so the user can review quickly.

## Planning Rules

- Do not delete historical tasks unless the user explicitly asks.
- Default to appending in the same plan file used previously.
- Keep status markers as checkboxes (`- [ ]`, `- [x]`) for easy progress updates.
- Keep task text action-first, for example `Implement login endpoint`.
- If the user adds scope later, append tasks instead of replacing existing open tasks.
- Reflect the same steps in `update_plan` and keep statuses synchronized with actual execution state.
- Do not persist real tasks to markdown unless user explicitly asks for persistence.
- Do not create a task list for obviously simple or conversational requests unless the user explicitly asks for one.

## References

### scripts/
- `scripts/merge_plan.py`: append new task batches or append follow-up tasks to the latest open batch.

### references/
- `references/planning_rules.md`: quality bar for decomposition and backlog hygiene.

### assets/
- `assets/plan-template.md`: initial file structure for a persistent plan.
