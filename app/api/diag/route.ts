export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  return Response.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    prefix: url.slice(0, 13),
    length: url.length,
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
