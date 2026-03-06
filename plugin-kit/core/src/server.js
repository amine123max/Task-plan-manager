import http from "node:http";
import { URL } from "node:url";
import { buildPlan, idleStatus, shouldPlan, updateProgress } from "./lib/planner.js";
import { getThread, nextThreadId, touchThread, upsertThread } from "./lib/store.js";

const PORT = Number(process.env.TASK_PLAN_BRIDGE_PORT ?? 42670);
const HOST = process.env.TASK_PLAN_BRIDGE_HOST ?? "127.0.0.1";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function diagnosticsPayload(thread) {
  if (!thread) {
    return {
      bridgeConnected: true,
      threadFound: false,
      suggestWakeup: false,
      message: "Bridge is reachable, but no retained thread plan was found."
    };
  }

  const status = idleStatus(thread);
  return {
    bridgeConnected: true,
    threadFound: true,
    threadId: thread.threadId,
    idleForMs: status.idleForMs,
    suggestWakeup: status.suggestWakeup,
    message: status.suggestWakeup
      ? "Thread looks idle. Wake and refresh are recommended."
      : "Thread is still active."
  };
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, { ok: true, service: "task-plan-bridge" });
    }

    if (request.method === "GET" && url.pathname === "/diagnostics/chain") {
      const threadId = url.searchParams.get("threadId") || "";
      const thread = threadId ? getThread(threadId) : null;
      return sendJson(response, 200, diagnosticsPayload(thread));
    }

    if (request.method === "POST" && url.pathname === "/plan/evaluate") {
      const payload = await readJson(request);
      const text = String(payload.text ?? "");
      const decision = shouldPlan(text);
      if (!decision.value) {
        return sendJson(response, 200, { shouldPlan: false, reason: decision.reason });
      }

      const threadId = payload.threadId || nextThreadId();
      const existing = getThread(threadId);
      const plan = buildPlan(threadId, text, existing);
      upsertThread(plan);
      return sendJson(response, 200, { shouldPlan: true, reason: decision.reason, threadId, plan });
    }

    if (request.method === "POST" && url.pathname === "/plan/progress") {
      const payload = await readJson(request);
      const thread = getThread(String(payload.threadId ?? ""));
      if (!thread) {
        return sendJson(response, 404, { error: "thread_not_found" });
      }
      const updated = updateProgress(thread, String(payload.stepId ?? ""), String(payload.status ?? "pending"));
      upsertThread(updated);
      return sendJson(response, 200, { ok: true, plan: updated });
    }

    if (request.method === "POST" && url.pathname === "/sessions/heartbeat") {
      const payload = await readJson(request);
      const thread = touchThread(String(payload.threadId ?? ""));
      if (!thread) {
        return sendJson(response, 404, { error: "thread_not_found" });
      }
      return sendJson(response, 200, { ok: true, threadId: thread.threadId, lastHeartbeatAt: thread.lastHeartbeatAt });
    }

    if (request.method === "GET" && url.pathname.startsWith("/sessions/") && url.pathname.endsWith("/status")) {
      const threadId = url.pathname.replace(/^\/sessions\//, "").replace(/\/status$/, "");
      const thread = getThread(threadId);
      if (!thread) {
        return sendJson(response, 404, { error: "thread_not_found" });
      }
      return sendJson(response, 200, idleStatus(thread));
    }

    if (request.method === "POST" && url.pathname === "/wake") {
      const payload = await readJson(request);
      const thread = getThread(String(payload.threadId ?? ""));
      if (!thread) {
        return sendJson(response, 200, {
          ok: false,
          wakeIssued: false,
          ...diagnosticsPayload(null)
        });
      }
      const touched = touchThread(thread.threadId);
      const diagnostics = diagnosticsPayload(touched);
      return sendJson(response, 200, {
        ok: true,
        wakeIssued: true,
        ...diagnostics,
        message: diagnostics.suggestWakeup
          ? "Wake signal issued. The thread still looks idle, so a refresh is recommended."
          : "Wake signal issued. The thread is reachable."
      });
    }

    return sendJson(response, 404, { error: "not_found" });
  } catch (error) {
    return sendJson(response, 500, { error: "internal_error", message: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`task-plan-bridge listening on http://${HOST}:${PORT}`);
});
