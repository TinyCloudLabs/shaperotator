import { beforeEach, describe, expect, test } from "bun:test";
import { DEFAULT_MIGRATION_KEY } from "../account";
import { manageMigrationKey } from "./admin-api";
import {
  getMigrationKeyState,
  resetMigrationKeyForTests,
} from "./migration-key-store";

const ADMIN_TOKEN = "test-admin-token";

describe("migration-key admin API", () => {
  beforeEach(() => {
    resetMigrationKeyForTests();
  });

  test("requires a separately configured admin token", () => {
    expect(manageMigrationKey(null, ADMIN_TOKEN, undefined)).toEqual({
      status: 401,
      body: { error: "Invalid admin token" },
    });
    expect(manageMigrationKey("Bearer anything", "", undefined)).toEqual({
      status: 503,
      body: { error: "Admin endpoint is not configured" },
    });
    expect(getMigrationKeyState().migrationKey).toBe(DEFAULT_MIGRATION_KEY);
  });

  test("generates and activates a new 9-digit key", () => {
    const result = manageMigrationKey(
      `Bearer ${ADMIN_TOKEN}`,
      ADMIN_TOKEN,
      undefined,
    );

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ operation: "generated" });
    if ("migrationKey" in result.body) {
      expect(result.body.migrationKey).toMatch(/^\d{9}$/);
      expect(result.body.migrationKey).not.toBe(DEFAULT_MIGRATION_KEY);
      expect(getMigrationKeyState().migrationKey).toBe(
        result.body.migrationKey,
      );
    }
  });

  test("sets an admin-supplied 9-digit key", () => {
    const result = manageMigrationKey(
      `Bearer ${ADMIN_TOKEN}`,
      ADMIN_TOKEN,
      "987654321",
    );

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      migrationKey: "987654321",
      operation: "updated",
    });
    expect(getMigrationKeyState().migrationKey).toBe("987654321");
  });

  test("rejects invalid replacement keys without changing the active key", () => {
    const result = manageMigrationKey(
      `Bearer ${ADMIN_TOKEN}`,
      ADMIN_TOKEN,
      "12345",
    );

    expect(result).toEqual({
      status: 400,
      body: { error: "Migration key must be exactly 9 digits" },
    });
    expect(getMigrationKeyState().migrationKey).toBe(DEFAULT_MIGRATION_KEY);
  });
});
