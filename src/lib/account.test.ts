import { describe, expect, test } from "bun:test";
import {
  accountKvKey,
  createMockAccount,
  DEMO_ACCOUNT_URL,
  parseAccountId,
} from "./account";

describe("Shape account data", () => {
  test("extracts the account ID from a Shape account URL", () => {
    expect(parseAccountId(DEMO_ACCOUNT_URL)).toBe("shapedemo-account");
    expect(parseAccountId("https://shape.example/a/account_123?view=full")).toBe(
      "account_123",
    );
  });

  test("rejects malformed links and account IDs", () => {
    expect(() => parseAccountId("not a url")).toThrow("valid Shape account URL");
    expect(() => parseAccountId("https://shape.example/accounts/a")).toThrow(
      "valid account ID",
    );
  });

  test("generates stable pseudo-random JSON from the account ID", () => {
    const first = createMockAccount(DEMO_ACCOUNT_URL);
    const second = createMockAccount(DEMO_ACCOUNT_URL);
    const other = createMockAccount(
      "https://shape.example/accounts/another-account",
    );

    expect(first).toEqual(second);
    expect(other).not.toEqual(first);
    expect(first.accountId).toBe("shapedemo-account");
    expect(first.source.mock).toBe(true);
  });

  test("maps account records to the declared KV prefix", () => {
    expect(accountKvKey("shapedemo-account")).toBe(
      "accounts/shapedemo-account",
    );
  });
});
