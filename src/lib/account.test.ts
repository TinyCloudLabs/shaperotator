import { describe, expect, test } from "bun:test";
import {
  accountKvKey,
  createMockAccount,
  DEMO_ACCOUNT_CODE,
  DEMO_ACCOUNT_INPUT,
  parseAccountCode,
} from "./account";

describe("Shape account data", () => {
  test("accepts a direct Shape account code", () => {
    expect(parseAccountCode(DEMO_ACCOUNT_CODE)).toBe("shapedemo-account");
  });

  test("extracts the account code from supported URL shapes", () => {
    expect(parseAccountCode(DEMO_ACCOUNT_INPUT)).toBe("shapedemo-account");
    expect(
      parseAccountCode("https://shape.example/migrate?accountId=account_123"),
    ).toBe("account_123");
    expect(parseAccountCode("https://shape.example/accounts/path-account")).toBe(
      "path-account",
    );
  });

  test("rejects malformed codes and URLs", () => {
    expect(() => parseAccountCode("a")).toThrow(
      "valid Shape account code or URL",
    );
    expect(() => parseAccountCode("ftp://shape.example/accounts/demo")).toThrow(
      "HTTP or HTTPS",
    );
  });

  test("generates stable pseudo-random JSON from the account ID", () => {
    const first = createMockAccount(DEMO_ACCOUNT_INPUT);
    const second = createMockAccount(DEMO_ACCOUNT_INPUT);
    const other = createMockAccount("another-account");

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
