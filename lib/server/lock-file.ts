import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { emptyLock, type LockStore } from "@/lib/browser-lock";

const file = path.join(tmpdir(), "lm-browser-lock.json");
let chain: Promise<unknown> = Promise.resolve();

async function read(): Promise<LockStore> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as LockStore;
    return {
      accounts: parsed.accounts ?? [],
      adminSessions: parsed.adminSessions ?? [],
      revokedSessions: parsed.revokedSessions ?? [],
      recoveries: parsed.recoveries ?? [],
    };
  } catch {
    return emptyLock();
  }
}

export function updateLock(change: (store: LockStore) => LockStore) {
  const run = chain.then(async () => {
    const current = await read();
    const next = change(current);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(next));
    return next;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readLock() {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as LockStore;
    return {
      accounts: parsed.accounts ?? [],
      adminSessions: parsed.adminSessions ?? [],
      revokedSessions: parsed.revokedSessions ?? [],
      recoveries: parsed.recoveries ?? [],
    };
  } catch {
    return emptyLock();
  }
}
