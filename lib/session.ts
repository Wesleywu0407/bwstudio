import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  admin?: boolean;
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ??
    // dev fallback;正式環境必須在 .env 設定 32+ 字元的 SESSION_SECRET
    "dev-only-insecure-session-secret-change-me",
  cookieName: "bob_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/** 寫入類 API 共用的守門;未登入回 null,由呼叫端回 401 */
export async function requireAdmin() {
  const session = await getSession();
  return session.admin ? session : null;
}
