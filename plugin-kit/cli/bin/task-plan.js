#!/usr/bin/env node
import { diagnostics, evaluate, health, heartbeat, progress, status, wake } from "../src/client.js";

function usage() {
  console.log(`task-plan <command> [args]

Commands:
  evaluate <text> [threadId]
  progress <threadId> <stepId> <pending|in_progress|completed>
  heartbeat <threadId>
  status <threadId>
  diagnostics [threadId]
  wake [threadId]
  health
`);
}

async function main() {
  const [, , command, ...rest] = process.argv;

  if (!command || command === "--help" || command === "-h") {
    usage();
    return;
  }

  let result;

  switch (command) {
    case "evaluate":
      result = await evaluate(rest[0] || "", rest[1] || "");
      break;
    case "progress":
      result = await progress(rest[0] || "", rest[1] || "", rest[2] || "pending");
      break;
    case "heartbeat":
      result = await heartbeat(rest[0] || "");
      break;
    case "status":
      result = await status(rest[0] || "");
      break;
    case "diagnostics":
      result = await diagnostics(rest[0] || "");
      break;
    case "wake":
      result = await wake(rest[0] || "");
      break;
    case "health":
      result = await health();
      break;
    default:
      usage();
      process.exitCode = 1;
      return;
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
