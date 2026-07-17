import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  const limit = rateLimit(`login:${ip}`);
  if (!limit.ok) return Response.json({ error: "Too many attempts" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } });
  const { password } = await request.json().catch(() => ({ password: "" }));
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const hashMatches = hash ? await bcrypt.compare(String(password), hash) : false;
  const devMatches = process.env.NODE_ENV !== "production" && Boolean(process.env.ADMIN_PASSWORD) && String(password) === process.env.ADMIN_PASSWORD;
  if (!hashMatches && !devMatches) return Response.json({ error: "Invalid password" }, { status: 401 });
  const session = await getSession();
  session.admin = true;
  await session.save();
  return Response.json({ ok: true });
}
