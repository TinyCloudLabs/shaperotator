import { beforeEach, describe, expect, test } from "bun:test";
import { DEFAULT_MIGRATION_KEY, DEMO_ACCOUNT_CODE } from "./account";
import { getMockAccount } from "./mock-api";
import {
  resetMigrationKeyForTests,
  setMigrationKey,
} from "./server/migration-key-store";

describe("mock Shape API", () => {
  beforeEach(() => {
    resetMigrationKeyForTests();
  });

  test("requires a 9-digit bearer token", () => {
    const result = getMockAccount(null, DEMO_ACCOUNT_CODE);
    expect(result.status).toBe(401);
    expect(result.body).toEqual({
      error: "Migration key must be exactly 9 digits",
    });
    expect(
      getMockAccount("Bearer 12345678", DEMO_ACCOUNT_CODE).status,
    ).toBe(401);
  });

  test("rejects the wrong 9-digit demo key", () => {
    const result = getMockAccount("Bearer 987654321", DEMO_ACCOUNT_CODE);
    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: "Invalid migration key" });
  });

  test("returns deterministic account JSON for an authorized request", () => {
    const authorization = `Bearer ${DEFAULT_MIGRATION_KEY}`;
    const first = getMockAccount(authorization, DEMO_ACCOUNT_CODE);
    const second = getMockAccount(authorization, DEMO_ACCOUNT_CODE);

    expect(first.status).toBe(200);
    expect(first).toEqual(second);
  });

  test("returns a client error for an invalid account code", () => {
    const result = getMockAccount(`Bearer ${DEFAULT_MIGRATION_KEY}`, "a");
    expect(result.status).toBe(400);
  });

  test("accepts the current key and immediately rejects the rotated key", () => {
    setMigrationKey("987654321");

    expect(
      getMockAccount(
        `Bearer ${DEFAULT_MIGRATION_KEY}`,
        DEMO_ACCOUNT_CODE,
      ).status,
    ).toBe(401);
    expect(
      getMockAccount("Bearer 987654321", DEMO_ACCOUNT_CODE).status,
    ).toBe(200);
  });
});
