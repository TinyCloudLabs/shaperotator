import { setMigrationKey } from "./migration-key-store";

export interface AdminApiResult {
  status: number;
  body:
    | {
        migrationKey: string;
        updatedAt: string;
        operation: "generated" | "updated";
      }
    | { error: string };
}

export function manageMigrationKey(
  authorization: string | null,
  adminToken: string,
  requestedKey: unknown,
): AdminApiResult {
  if (!adminToken) {
    return {
      status: 503,
      body: { error: "Admin endpoint is not configured" },
    };
  }

  if (authorization !== `Bearer ${adminToken}`) {
    return {
      status: 401,
      body: { error: "Invalid admin token" },
    };
  }

  if (requestedKey !== undefined && typeof requestedKey !== "string") {
    return {
      status: 400,
      body: { error: "migrationKey must be a string" },
    };
  }

  try {
    const result = setMigrationKey(requestedKey);
    return {
      status: 200,
      body: {
        migrationKey: result.state.migrationKey,
        updatedAt: result.state.updatedAt!,
        operation: result.operation,
      },
    };
  } catch (error) {
    return {
      status: 400,
      body: {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update migration key",
      },
    };
  }
}
