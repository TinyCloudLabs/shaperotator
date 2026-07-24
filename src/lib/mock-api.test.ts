import { describe, expect, test } from "bun:test";
import { DEMO_ACCOUNT_URL, DEMO_API_KEY } from "./account";
import { getMockAccount } from "./mock-api";

describe("mock Shape API", () => {
  test("requires the demo bearer token", () => {
    const result = getMockAccount(null, DEMO_ACCOUNT_URL);
    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: "Invalid Shape API key" });
  });

  test("returns deterministic account JSON for an authorized request", () => {
    const authorization = `Bearer ${DEMO_API_KEY}`;
    const first = getMockAccount(authorization, DEMO_ACCOUNT_URL);
    const second = getMockAccount(authorization, DEMO_ACCOUNT_URL);

    expect(first.status).toBe(200);
    expect(first).toEqual(second);
  });

  test("returns a client error for an invalid account link", () => {
    const result = getMockAccount(`Bearer ${DEMO_API_KEY}`, "invalid");
    expect(result.status).toBe(400);
  });
});
