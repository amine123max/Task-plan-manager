# Planning Rules

Use these rules every time a request benefits from planning.

## When to plan

- Use planning for multi-step implementation, debugging, file edits, multi-phase research, or when the user explicitly asks for a plan.
- Skip planning for brief casual chat, simple factual replies, translations, rewrites, and obvious single-step actions.
- If the task can be completed safely in one direct response or one obvious action, do not create a task list.

## Decomposition quality

- Prefer 3-10 subtasks per request.
- Keep each subtask atomic: one action, one completion signal.
- Write action-first text (for example: `Add health check endpoint`).
- Keep dependencies explicit when order matters.
- Split large vague items into smaller implementation and verification tasks.

## Plan continuity

- Treat the plan file as a long-lived source of truth.
- Append new requests as new batches unless the user asks to merge into an existing batch.
- For follow-up scope, append tasks to the latest open batch when appropriate.
- Never delete old batches unless the user asks explicitly.
- Default mode is no file persistence; only write a plan file when explicitly requested.

## Status hygiene

- New tasks start as `- [ ]`.
- Mark tasks complete with `- [x]` only when done.
- Keep identifiers stable so users can reference specific items.

## update_plan sync

- Publish task breakdowns through `update_plan` only when the request benefits from planning or the user explicitly asks for it.
- Use only `pending`, `in_progress`, and `completed` statuses.
- Keep at most one `in_progress` step at a time.
- When new user scope is added later, append additional plan steps in `update_plan` instead of resetting all prior open steps.
- Keep `update_plan` and markdown plan states aligned to avoid conflicting progress views.
- If markdown persistence is not requested, keep progress only in `update_plan`.
