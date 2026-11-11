import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { lessonSlug?: string; studentId?: string } | null;
  if (!body?.lessonSlug || !body.studentId) {
    return NextResponse.json({ error: "Requête incomplète." }, { status: 400 });
  }
  if (!process.env.BUNNY_TOKEN_KEY) {
    return NextResponse.json({ error: "Bunny n'est pas configuré.", grant: null }, { status: 503 });
  }
  return NextResponse.json({ error: "La signature Bunny reste à brancher.", grant: null }, { status: 501 });
}
