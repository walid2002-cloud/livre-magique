import { NextResponse } from "next/server";
import { askRecovery, claimBrowser, releaseBrowser, sessionAllowed } from "@/lib/browser-lock";
import { hashPassword } from "@/lib/password";
import { createSeed } from "@/lib/seed";
import { readLock, updateLock } from "@/lib/server/lock-file";

export const runtime = "nodejs";

const YEAR = 60 * 60 * 24 * 400;

function token() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

function readCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") ?? "";
  const hit = raw.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

function cookie(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

function clearCookie(name: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

export async function GET(request: Request) {
  const sessionId = readCookie(request, "lm_session");
  const store = await readLock();
  if (!sessionAllowed(store, sessionId)) {
    return NextResponse.json({ ok: false, error: "Cette session n'est plus valable." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    studentId?: string;
    password?: string;
    identifiant?: string;
  } | null;
  const action = body?.action || "claim";

  if (action === "admin") {
    const identifiant = body?.identifiant?.trim().toLowerCase() || "";
    const admin = createSeed().admins.find((item) => item.identifiant === identifiant);
    if (!admin || admin.passwordHash !== hashPassword(body?.password || "")) {
      return NextResponse.json({ ok: false, error: "Admin refusé." }, { status: 401 });
    }
    const sessionId = token();
    await updateLock((store) => ({ ...store, adminSessions: [...store.adminSessions, sessionId].slice(-20) }));
    const response = NextResponse.json({ ok: true });
    response.headers.append("set-cookie", cookie("lm_admin", sessionId, 60 * 60 * 12));
    return response;
  }

  if (action === "release" || action === "revoke") {
    const adminSession = readCookie(request, "lm_admin");
    const studentId = body?.studentId?.trim() || "";
    if (!studentId) return NextResponse.json({ ok: false, error: "Élève manquant." }, { status: 400 });
    const current = await readLock();
    if (!current.adminSessions.includes(adminSession)) {
      return NextResponse.json({ ok: false, error: "Reconnecte-toi en admin pour réinitialiser le navigateur." }, { status: 401 });
    }
    await updateLock((store) => releaseBrowser(store, studentId));
    return NextResponse.json({ ok: true });
  }

  if (action === "recover") {
    const studentId = body?.studentId?.trim() || "";
    if (!studentId) return NextResponse.json({ ok: false, error: "Compte manquant." }, { status: 400 });
    await updateLock((store) => askRecovery(store, studentId, new Date().toISOString()));
    return NextResponse.json({ ok: true });
  }

  const studentId = body?.studentId?.trim() || "";
  const password = body?.password || "";
  if (!studentId || password.length < 6) {
    return NextResponse.json({ ok: false, error: "Connexion incomplète." }, { status: 400 });
  }
  let browserId = readCookie(request, "lm_browser");
  const freshBrowser = !browserId;
  if (!browserId) browserId = token();
  let status: "ok" | "denied" | "wrong" = "wrong";
  let sessionId = "";
  await updateLock((store) => {
    const claimed = claimBrowser(store, {
      studentId,
      passwordHash: hashPassword(password),
      browserId,
      sessionId: token(),
    });
    status = claimed.status;
    sessionId = claimed.sessionId || "";
    return claimed.store;
  });
  if (status === "wrong") {
    return NextResponse.json({ ok: false, error: "Mot de passe refusé pour ce navigateur." }, { status: 401 });
  }
  if (status === "denied") {
    return NextResponse.json(
      { ok: false, error: "Ce compte est déjà ouvert dans un autre navigateur. Demande une réinitialisation : ton compte n'est pas fermé pour toujours." },
      { status: 409 },
    );
  }
  const response = NextResponse.json({ ok: true, studentId });
  if (freshBrowser) response.headers.append("set-cookie", cookie("lm_browser", browserId, YEAR));
  if (sessionId) response.headers.append("set-cookie", cookie("lm_session", sessionId, 60 * 60 * 24 * 30));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.headers.append("set-cookie", clearCookie("lm_session"));
  return response;
}
