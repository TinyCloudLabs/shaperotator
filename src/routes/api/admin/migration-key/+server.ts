import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { manageMigrationKey } from "$lib/server/admin-api";
import { DEV_ADMIN_TOKEN } from "$lib/server/migration-key-store";

export const POST: RequestHandler = async ({ request }) => {
  const rawBody = await request.text();
  let payload: unknown = {};

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return json({ error: "Request body must be JSON" }, { status: 400 });
    }
  }

  const migrationKey =
    typeof payload === "object" &&
    payload !== null &&
    "migrationKey" in payload
      ? (payload as { migrationKey?: unknown }).migrationKey
      : undefined;
  const adminToken =
    env.SHAPE_DEMO_ADMIN_TOKEN ?? (dev ? DEV_ADMIN_TOKEN : "");
  const result = manageMigrationKey(
    request.headers.get("authorization"),
    adminToken,
    migrationKey,
  );

  return json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
};
