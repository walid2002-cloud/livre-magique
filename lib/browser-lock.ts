export type LockAccount = {
  studentId: string;
  passwordHash: string;
  browserId: string;
  sessionId: string;
};

export type LockStore = {
  accounts: LockAccount[];
  adminSessions: string[];
  revokedSessions: string[];
  recoveries: { studentId: string; at: string }[];
};

export function emptyLock(): LockStore {
  return { accounts: [], adminSessions: [], revokedSessions: [], recoveries: [] };
}

export function claimBrowser(
  source: LockStore,
  input: { studentId: string; passwordHash: string; browserId: string; sessionId: string },
): { store: LockStore; status: "ok" | "denied" | "wrong"; sessionId?: string } {
  const store: LockStore = {
    accounts: source.accounts.map((item) => ({ ...item })),
    adminSessions: [...source.adminSessions],
    revokedSessions: [...source.revokedSessions],
    recoveries: source.recoveries.map((item) => ({ ...item })),
  };
  const row = store.accounts.find((item) => item.studentId === input.studentId);
  if (!row) {
    store.accounts.push({
      studentId: input.studentId,
      passwordHash: input.passwordHash,
      browserId: input.browserId,
      sessionId: input.sessionId,
    });
    return { store, status: "ok", sessionId: input.sessionId };
  }
  if (row.passwordHash !== input.passwordHash) return { store: source, status: "wrong" };
  if (row.browserId !== input.browserId) return { store: source, status: "denied" };
  return { store: source, status: "ok", sessionId: row.sessionId };
}

export function releaseBrowser(source: LockStore, studentId: string): LockStore {
  const row = source.accounts.find((item) => item.studentId === studentId);
  return {
    accounts: source.accounts.filter((item) => item.studentId !== studentId),
    adminSessions: [...source.adminSessions],
    revokedSessions: row ? [...source.revokedSessions, row.sessionId] : [...source.revokedSessions],
    recoveries: source.recoveries.filter((item) => item.studentId !== studentId),
  };
}

export function askRecovery(source: LockStore, studentId: string, at: string): LockStore {
  if (!source.accounts.some((item) => item.studentId === studentId)) return source;
  if (source.recoveries.some((item) => item.studentId === studentId)) return source;
  return { ...source, recoveries: [...source.recoveries, { studentId, at }] };
}

export function sessionAllowed(source: LockStore, sessionId: string) {
  if (!sessionId) return true;
  return !source.revokedSessions.includes(sessionId);
}
