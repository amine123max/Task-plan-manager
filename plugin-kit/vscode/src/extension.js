const vscode = require("vscode");

let currentPlan = null;
let currentPanel = null;
let idleTimer = null;

function config() {
  return vscode.workspace.getConfiguration("taskPlan");
}

function bridgeUrl() {
  return String(config().get("bridgeUrl") || "http://127.0.0.1:42670").replace(/\/$/, "");
}

async function request(path, options = {}) {
  const response = await fetch(`${bridgeUrl()}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  return response.json();
}

function renderPlanHtml(plan) {
  const items = plan.steps.map((step) => {
    const icon = step.status === "completed" ? "[x]" : step.status === "in_progress" ? "[>]" : "[ ]";
    return `<li><code>${icon}</code> ${step.title}</li>`;
  }).join("\n");

  return `<!doctype html>
  <html>
    <body>
      <h2>Task Plan</h2>
      <p>Thread: <code>${plan.threadId}</code></p>
      <p>
        <button id="wakeBtn">Wake + Diagnose</button>
      </p>
      <ul>${items}</ul>
      <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('wakeBtn').addEventListener('click', () => {
          vscode.postMessage({ type: 'wakeAndDiagnose' });
        });
      </script>
    </body>
  </html>`;
}

function ensurePanel() {
  if (currentPanel) {
    return currentPanel;
  }

  currentPanel = vscode.window.createWebviewPanel(
    "taskPlanPanel",
    "Task Plan",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  currentPanel.webview.onDidReceiveMessage(async (message) => {
    if (message?.type === "wakeAndDiagnose") {
      await vscode.commands.executeCommand("taskPlan.wakeAndDiagnose");
    }
  });

  currentPanel.onDidDispose(() => {
    currentPanel = null;
  });

  return currentPanel;
}

function showPlan(plan) {
  const panel = ensurePanel();
  panel.webview.html = renderPlanHtml(plan);
  currentPlan = plan;
}

async function sendHeartbeat() {
  if (!currentPlan) {
    return;
  }
  await request("/sessions/heartbeat", {
    method: "POST",
    body: JSON.stringify({ threadId: currentPlan.threadId })
  });
}

function startIdleWatch(context) {
  if (idleTimer) {
    clearInterval(idleTimer);
  }

  idleTimer = setInterval(async () => {
    if (!currentPlan) {
      return;
    }

    try {
      const status = await request(`/sessions/${currentPlan.threadId}/status`);
      if (!status.suggestWakeup) {
        return;
      }

      const action = await vscode.window.showWarningMessage(
        "Current long task looks idle. Wake and diagnose now?",
        "Wake + Diagnose"
      );

      if (action === "Wake + Diagnose") {
        await vscode.commands.executeCommand("taskPlan.wakeAndDiagnose");
      }
    } catch (error) {
      console.error(error);
    }
  }, Math.max(1, Number(config().get("idleThresholdMinutes") || 5)) * 60 * 1000);

  context.subscriptions.push({ dispose: () => clearInterval(idleTimer) });
}

async function evaluateInput() {
  const text = await vscode.window.showInputBox({ prompt: "Describe the task" });
  if (!text) {
    return;
  }

  const result = await request("/plan/evaluate", {
    method: "POST",
    body: JSON.stringify({ text, threadId: currentPlan?.threadId })
  });

  if (!result.shouldPlan) {
    vscode.window.showInformationMessage(`No task list created: ${result.reason}`);
    return;
  }

  showPlan(result.plan);
  await sendHeartbeat();
}

async function refreshCurrentPlan() {
  const text = await vscode.window.showInputBox({ prompt: "Add follow-up scope to the current plan" });
  if (!text) {
    return;
  }

  const result = await request("/plan/evaluate", {
    method: "POST",
    body: JSON.stringify({ text, threadId: currentPlan?.threadId })
  });

  if (result.shouldPlan) {
    showPlan(result.plan);
    await sendHeartbeat();
  }
}

async function markCurrentStepDone() {
  if (!currentPlan) {
    vscode.window.showInformationMessage("No active task plan.");
    return;
  }

  const currentStep = currentPlan.steps.find((step) => step.status === "in_progress") || currentPlan.steps.find((step) => step.status === "pending");
  if (!currentStep) {
    vscode.window.showInformationMessage("All steps are already complete.");
    return;
  }

  const result = await request("/plan/progress", {
    method: "POST",
    body: JSON.stringify({ threadId: currentPlan.threadId, stepId: currentStep.id, status: "completed" })
  });

  showPlan(result.plan);
  await sendHeartbeat();
}

async function wakeAndDiagnose() {
  try {
    const health = await request("/health");
    if (!health.ok) {
      vscode.window.showErrorMessage("Bridge health check failed.");
      return;
    }

    const diagnostics = await request(`/diagnostics/chain?threadId=${encodeURIComponent(currentPlan?.threadId || "")}`);
    const wake = await request("/wake", {
      method: "POST",
      body: JSON.stringify({ threadId: currentPlan?.threadId || "" })
    });

    const message = [
      diagnostics.message,
      wake.message,
      diagnostics.threadFound ? `Idle: ${Math.round((diagnostics.idleForMs || 0) / 1000)}s` : "No retained thread yet."
    ].join(" ");

    vscode.window.showInformationMessage(message);
  } catch (error) {
    vscode.window.showErrorMessage("Wake + diagnose failed. The bridge may be disconnected.");
  }
}

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand("taskPlan.evaluateInput", evaluateInput));
  context.subscriptions.push(vscode.commands.registerCommand("taskPlan.refreshCurrentPlan", refreshCurrentPlan));
  context.subscriptions.push(vscode.commands.registerCommand("taskPlan.markCurrentStepDone", markCurrentStepDone));
  context.subscriptions.push(vscode.commands.registerCommand("taskPlan.wakeAndDiagnose", wakeAndDiagnose));
  startIdleWatch(context);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
