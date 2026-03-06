# VS Code Adapter

This extension is a starter adapter for the local task-plan bridge.

## Commands

- `Task Plan: Evaluate Input`
- `Task Plan: Refresh Current Plan`
- `Task Plan: Mark Current Step Done`
- `Task Plan: Wake And Diagnose`

## Wake button

The task-plan panel includes a `Wake + Diagnose` button.
It checks whether the local bridge is reachable, inspects the retained thread task list, and issues a wake signal for long-running idle work.

## Notes

- The bridge service must be running first.
- The extension intentionally skips task lists when the bridge decides the request is simple.
- For long tasks, the extension keeps one retained thread plan and refreshes the same panel.
