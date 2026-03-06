import process from "node:process";

const DEFAULT_BRIDGE_URL = process.env.TASK_PLAN_BRIDGE_URL || "http://127.0.0.1:42670";

function buildUrl(path) {
  return `${DEFAULT_BRIDGE_URL.replace(/\/$/, "")}${path}`;
}

async function send(path, method = "GET", body) {
  const response = await fetch(buildUrl(path), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(json));
  }
  return json;
}

export async function evaluate(text, threadId = "") {
  return send("/plan/evaluate", "POST", { text, threadId });
}

export async function progress(threadId, stepId, status) {
  return send("/plan/progress", "POST", { threadId, stepId, status });
}

export async function heartbeat(threadId) {
  return send("/sessions/heartbeat", "POST", { threadId });
}

export async function status(threadId) {
  return send(`/sessions/${encodeURIComponent(threadId)}/status`);
}

export async function diagnostics(threadId = "") {
  return send(`/diagnostics/chain?threadId=${encodeURIComponent(threadId)}`);
}

export async function wake(threadId = "") {
  return send("/wake", "POST", { threadId });
}

export async function health() {
  return send("/health");
}
