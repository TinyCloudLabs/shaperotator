import {
  createMockAccount,
  type ShapeAccount,
} from "./account";
import { isCurrentMigrationKey } from "./server/migration-key-store";

export interface MockApiResult {
  status: number;
  body: { account: ShapeAccount } | { error: string };
}

export function getMockAccount(
  authorization: string | null,
  accountCode: unknown,
): MockApiResult {
  if (!/^Bearer \d{9}$/.test(authorization ?? "")) {
    return {
      status: 401,
      body: { error: "Migration key must be exactly 9 digits" },
    };
  }

  const migrationKey = authorization!.slice("Bearer ".length);
  if (!isCurrentMigrationKey(migrationKey)) {
    return {
      status: 401,
      body: { error: "Invalid migration key" },
    };
  }

  if (typeof accountCode !== "string") {
    return {
      status: 400,
      body: { error: "accountCode is required" },
    };
  }

  try {
    return {
      status: 200,
      body: { account: createMockAccount(accountCode) },
    };
  } catch (error) {
    return {
      status: 400,
      body: {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Shape account code or URL",
      },
    };
  }
}
