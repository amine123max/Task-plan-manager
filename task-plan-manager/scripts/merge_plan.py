#!/usr/bin/env python3
"""Append decomposed tasks into a persistent markdown plan file."""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path

MARKER_START = "<!-- BATCHES_START -->"
MARKER_END = "<!-- BATCHES_END -->"

DEFAULT_TEMPLATE = """# Task Plan

This file is a living plan. Add new work as batches and keep history intact.

## Plan Batches
<!-- BATCHES_START -->
<!-- BATCHES_END -->
"""

BATCH_BLOCK_RE = re.compile(
    r"^### Batch B(?P<id>\d{3}): (?P<title>[^\n]+)\n(?P<body>.*?)(?=^### Batch B\d{3}: |\Z)",
    re.MULTILINE | re.DOTALL,
)
STATUS_RE = re.compile(r"^Status:\s*(open|closed)\s*$", re.MULTILINE | re.IGNORECASE)
TASK_ID_RE_TEMPLATE = r"^- \[[ xX]\] B{batch_id}-(\d{{2}})\s+"


def default_plan_path() -> Path:
    return Path.home() / ".codex" / "plans" / "task-plan-manager-plan.md"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Merge new task items into a persistent markdown plan."
    )
    parser.add_argument(
        "--plan",
        default=str(default_plan_path()),
        help="Path to plan markdown file. Defaults to ~/.codex/plans/task-plan-manager-plan.md.",
    )
    parser.add_argument(
        "--title",
        help="Batch title when creating a new batch. Required unless --append-latest-open is used.",
    )
    parser.add_argument(
        "--source",
        default="user request",
        help="Source summary for the batch.",
    )
    parser.add_argument(
        "--task",
        action="append",
        default=[],
        help="Task item text. Repeat this flag for multiple tasks.",
    )
    parser.add_argument(
        "--append-latest-open",
        action="store_true",
        help="Append tasks to the latest open batch instead of creating a new batch.",
    )
    return parser.parse_args()


def ensure_plan_file(plan_path: Path) -> None:
    if plan_path.exists():
        return
    plan_path.parent.mkdir(parents=True, exist_ok=True)
    plan_path.write_text(DEFAULT_TEMPLATE, encoding="utf-8")


def ensure_markers(content: str) -> str:
    if MARKER_START in content and MARKER_END in content:
        return content
    suffix = (
        "\n\n## Plan Batches\n"
        f"{MARKER_START}\n"
        f"{MARKER_END}\n"
    )
    return content.rstrip() + suffix


def split_marker_region(content: str) -> tuple[str, str, str]:
    start = content.index(MARKER_START)
    end = content.index(MARKER_END)
    before = content[: start + len(MARKER_START)]
    middle = content[start + len(MARKER_START) : end]
    after = content[end:]
    return before, middle, after


def extract_batch_matches(middle: str) -> list[re.Match[str]]:
    return list(BATCH_BLOCK_RE.finditer(middle))


def get_max_batch_id(matches: list[re.Match[str]]) -> int:
    if not matches:
        return 0
    return max(int(match.group("id")) for match in matches)


def is_open_batch(match: re.Match[str]) -> bool:
    status_match = STATUS_RE.search(match.group(0))
    if not status_match:
        return False
    return status_match.group(1).lower() == "open"


def get_next_task_number(block: str, batch_id: int) -> int:
    task_re = re.compile(TASK_ID_RE_TEMPLATE.format(batch_id=f"{batch_id:03d}"), re.MULTILINE)
    found = task_re.findall(block)
    if not found:
        return 1
    return max(int(v) for v in found) + 1


def normalize_tasks(tasks: list[str]) -> list[str]:
    normalized = [task.strip() for task in tasks if task and task.strip()]
    if not normalized:
        raise ValueError("At least one non-empty --task is required.")
    return normalized


def render_task_lines(batch_id: int, start_number: int, tasks: list[str]) -> str:
    lines = []
    for offset, task in enumerate(tasks):
        number = start_number + offset
        lines.append(f"- [ ] B{batch_id:03d}-{number:02d} {task}")
    return "\n".join(lines)


def render_new_batch(batch_id: int, title: str, source: str, tasks: list[str]) -> str:
    created = dt.date.today().isoformat()
    task_lines = render_task_lines(batch_id, 1, tasks)
    return (
        f"### Batch B{batch_id:03d}: {title}\n"
        f"Created: {created}\n"
        "Status: open\n"
        f"Source: {source}\n\n"
        f"{task_lines}\n"
    )


def append_new_batch(middle: str, title: str, source: str, tasks: list[str]) -> tuple[str, int]:
    matches = extract_batch_matches(middle)
    batch_id = get_max_batch_id(matches) + 1
    block = render_new_batch(batch_id, title, source, tasks)

    base = middle.strip()
    if not base:
        updated = f"\n{block}\n"
    else:
        updated = f"\n{base}\n\n{block}\n"
    return updated, batch_id


def append_to_latest_open(middle: str, tasks: list[str]) -> tuple[str, int]:
    matches = extract_batch_matches(middle)
    open_matches = [match for match in matches if is_open_batch(match)]
    if not open_matches:
        raise ValueError("No open batch found. Create a new batch first.")

    target = open_matches[-1]
    batch_id = int(target.group("id"))
    block_text = target.group(0)
    next_number = get_next_task_number(block_text, batch_id)
    task_lines = render_task_lines(batch_id, next_number, tasks)

    replacement = block_text.rstrip() + "\n" + task_lines + "\n"
    updated = middle[: target.start()] + replacement + middle[target.end() :]
    return updated, batch_id


def main() -> None:
    args = parse_args()
    tasks = normalize_tasks(args.task)
    plan_path = Path(args.plan)

    ensure_plan_file(plan_path)
    content = plan_path.read_text(encoding="utf-8")
    content = ensure_markers(content)
    before, middle, after = split_marker_region(content)

    if args.append_latest_open:
        updated_middle, batch_id = append_to_latest_open(middle, tasks)
    else:
        if not args.title or not args.title.strip():
            raise ValueError("--title is required when creating a new batch.")
        updated_middle, batch_id = append_new_batch(
            middle=middle,
            title=args.title.strip(),
            source=args.source.strip(),
            tasks=tasks,
        )

    updated_content = before + updated_middle + after
    plan_path.write_text(updated_content, encoding="utf-8")
    print(f"Updated plan: {plan_path}")
    print(f"Batch: B{batch_id:03d}")
    print(f"Added tasks: {len(tasks)}")


if __name__ == "__main__":
    main()
