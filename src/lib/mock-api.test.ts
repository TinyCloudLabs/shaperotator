import { describe, expect, test } from "bun:test";
import { DEMO_ACCOUNT_CODE, DEMO_API_KEY } from "./account";
import { getMockAccount } from "./mock-api";

describe("mock Shape API", () => {
  test("requires a 9-digit bearer token", () => {
    const result = getMockAccount(null, DEMO_ACCOUNT_CODE);
    expect(result.status).toBe(401);
    expect(result.body).toEqual({
      error: "Shape API key must be exactly 9 digits",
    });
    expect(
      getMockAccount("Bearer 12345678", DEMO_ACCOUNT_CODE).status,
    ).toBe(401);
  });

  test("rejects the wrong 9-digit demo key", () => {
    const result = getMockAccount("Bearer 987654321", DEMO_ACCOUNT_CODE);
    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: "Invalid Shape API key" });
  });

  test("returns deterministic account JSON for an authorized request", () => {
    const authorization = `Bearer ${DEMO_API_KEY}`;
    const first = getMockAccount(authorization, DEMO_ACCOUNT_CODE);
    const second = getMockAccount(authorization, DEMO_ACCOUNT_CODE);

    expect(first.status).toBe(200);
    expect(first).toEqual(second);
  });

  test("returns a client error for an invalid account code", () => {
    const result = getMockAccount(`Bearer ${DEMO_API_KEY}`, "a");
    expect(result.status).toBe(400);
  });
});
