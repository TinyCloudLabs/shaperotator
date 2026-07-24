import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getMockAccount } from "$lib/mock-api";

export const POST: RequestHandler = async ({ request }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const accountUrl =
    typeof payload === "object" && payload !== null && "accountUrl" in payload
      ? (payload as { accountUrl?: unknown }).accountUrl
      : undefined;
  const result = getMockAccount(
    request.headers.get("authorization"),
    accountUrl,
  );

  return json(result.body, { status: result.status });
};
