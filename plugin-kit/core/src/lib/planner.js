const LONG_TASK_KEYWORDS = [
  /implement/i,
  /build/i,
  /design/i,
  /debug/i,
  /refactor/i,
  /integrate/i,
  /deploy/i,
  /test/i,
  /research/i,
  /optimi[sz]e/i,
  /fix/i,
  /\u5b9e\u73b0/,
  /\u5f00\u53d1/,
  /\u8bbe\u8ba1/,
  /\u8c03\u8bd5/,
  /\u91cd\u6784/,
  /\u90e8\u7f72/,
  /\u6d4b\u8bd5/,
  /\u4fee\u590d/,
  /\u89c4\u5212/
];

const SIMPLE_PATTERNS = [
  /^(hi|hello|thanks|thank you|ok|okay|yes|no)[.!?\s]*$/i,
  /^(\u4f60\u597d|\u8c22\u8c22|\u597d\u7684|\u55ef|\u662f\u7684|\u4e0d\u662f)[\u3002\uff01!\s]*$/
];

function normalizeText(text) {
  return String(text ?? "").trim();
}

export function shouldPlan(text) {
  const normalized = normalizeText(text);
  const lineCount = normalized.split(/\r?\n/).filter(Boolean).length;
  const longByLength = normalized.length >= 120;
  const longByLines = lineCount >= 3;
  const explicitPlan = /task-plan|update_plan|todo|plan|\u62c6\u89e3|\u5206\u89e3|\u4efb\u52a1\u6e05\u5355|\u89c4\u5212/i.test(normalized);
  const longByKeyword = LONG_TASK_KEYWORDS.some((pattern) => pattern.test(normalized));
  const simple = normalized.length <= 60 && lineCount <= 1 && SIMPLE_PATTERNS.some((pattern) => pattern.test(normalized));

  if (!normalized) {
    return { value: false, reason: "empty_request" };
  }

  if (simple) {
    return { value: false, reason: "simple_chat" };
  }

  if (explicitPlan || longByLength || longByLines || longByKeyword) {
    return { value: true, reason: explicitPlan ? "explicit_plan" : "long_request" };
  }

  return { value: false, reason: "single_step_request" };
}

function candidateSteps(text) {
  const normalized = normalizeText(text);
  const steps = [];

  if (/design|\u8bbe\u8ba1/i.test(normalized)) {
    steps.push("Clarify the design scope");
    steps.push("Draft the target UI or UX changes");
  }

  if (/debug|fix|repair|\u4fee\u590d|\u8c03\u8bd5/i.test(normalized)) {
    steps.push("Reproduce the reported issue");
    steps.push("Trace the root cause");
    steps.push("Patch the failing behavior");
  }

  if (/implement|build|create|\u5f00\u53d1|\u5b9e\u73b0|\u6784\u5efa/i.test(normalized)) {
    steps.push("Inspect the current code paths");
    steps.push("Implement the main change");
  }

  if (/test|verify|\u9a8c\u8bc1|\u6d4b\u8bd5/i.test(normalized)) {
    steps.push("Verify behavior with focused checks");
  }

  steps.push("Summarize the result and next action");

  return [...new Set(steps)].slice(0, 6);
}

function toStepObjects(titles, existingSteps = []) {
  const dedupedTitles = [...new Set([...existingSteps.map((step) => step.title), ...titles])];

  return dedupedTitles.map((title, index) => {
    const previous = existingSteps.find((step) => step.title === title);
    if (previous) {
      return previous;
    }

    return {
      id: `step-${index + 1}`,
      title,
      status: index === 0 && !existingSteps.some((step) => step.status === "in_progress") ? "in_progress" : "pending"
    };
  }).map((step, index, list) => {
    if (list.some((item) => item.status === "in_progress")) {
      return step;
    }
    if (index === 0 && step.status === "pending") {
      return { ...step, status: "in_progress" };
    }
    return step;
  });
}

export function buildPlan(threadId, text, existingThread = null) {
  const existingSteps = existingThread?.steps ?? [];
  const titles = candidateSteps(text);
  const steps = toStepObjects(titles, existingSteps);

  return {
    threadId,
    sourceText: text,
    steps,
    updatedAt: new Date().toISOString(),
    lastHeartbeatAt: Date.now()
  };
}

export function updateProgress(thread, stepId, status) {
  const allowed = new Set(["pending", "in_progress", "completed"]);
  if (!allowed.has(status)) {
    throw new Error(`Unsupported status: ${status}`);
  }

  const nextSteps = thread.steps.map((step) => {
    if (step.id !== stepId) {
      return step;
    }
    return { ...step, status };
  });

  let hasInProgress = nextSteps.some((step) => step.status === "in_progress");
  if (!hasInProgress) {
    const nextPendingIndex = nextSteps.findIndex((step) => step.status === "pending");
    if (nextPendingIndex >= 0) {
      nextSteps[nextPendingIndex] = { ...nextSteps[nextPendingIndex], status: "in_progress" };
      hasInProgress = true;
    }
  }

  if (hasInProgress) {
    let seenInProgress = false;
    for (let index = 0; index < nextSteps.length; index += 1) {
      if (nextSteps[index].status !== "in_progress") {
        continue;
      }
      if (!seenInProgress) {
        seenInProgress = true;
        continue;
      }
      nextSteps[index] = { ...nextSteps[index], status: "pending" };
    }
  }

  return {
    ...thread,
    steps: nextSteps,
    updatedAt: new Date().toISOString(),
    lastHeartbeatAt: Date.now()
  };
}

export function idleStatus(thread, idleThresholdMs = 5 * 60 * 1000) {
  const idleForMs = Date.now() - (thread.lastHeartbeatAt ?? Date.now());
  return {
    threadId: thread.threadId,
    idleForMs,
    suggestWakeup: idleForMs >= idleThresholdMs,
    updatedAt: thread.updatedAt
  };
}
