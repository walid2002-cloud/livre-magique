export async function claimSession(studentId: string, password: string) {
  try {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "claim", studentId, password }),
    });
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    if (res.ok) return { ok: true as const };
    return { ok: false as const, status: res.status, error: body?.error || "Ce navigateur n'est pas autorisé." };
  } catch {
    return { ok: false as const, status: 0, error: "Le serveur de session ne répond pas. Réessaie." };
  }
}

export async function recoverSession(studentId: string) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "recover", studentId }),
  });
  return res.ok;
}

export async function bindAdminSession(identifiant: string, password: string) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "admin", identifiant, password }),
  });
  return res.ok;
}

export async function releaseBrowser(studentId: string) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "release", studentId }),
  });
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  if (res.ok) return { ok: true as const };
  return { ok: false as const, error: body?.error || "La réinitialisation a échoué." };
}
