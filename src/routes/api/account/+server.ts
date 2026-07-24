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

  const accountCode =
    typeof payload === "object" && payload !== null && "accountCode" in payload
      ? (payload as { accountCode?: unknown }).accountCode
      : undefined;
  const result = getMockAccount(
    request.headers.get("authorization"),
    accountCode,
  );

  return json(result.body, { status: result.status });
};
