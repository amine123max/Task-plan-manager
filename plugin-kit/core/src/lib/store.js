const threads = new Map();

export function getThread(threadId) {
  return threads.get(threadId) ?? null;
}

export function upsertThread(thread) {
  threads.set(thread.threadId, thread);
  return thread;
}

export function touchThread(threadId) {
  const existing = threads.get(threadId);
  if (!existing) {
    return null;
  }

  existing.lastHeartbeatAt = Date.now();
  threads.set(threadId, existing);
  return existing;
}

export function nextThreadId() {
  return `thread-${Date.now().toString(36)}`;
}
