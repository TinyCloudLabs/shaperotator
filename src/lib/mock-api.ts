import {
  createMockAccount,
  DEMO_API_KEY,
  type ShapeAccount,
} from "./account";

export interface MockApiResult {
  status: number;
  body: { account: ShapeAccount } | { error: string };
}

export function getMockAccount(
  authorization: string | null,
  accountUrl: unknown,
): MockApiResult {
  if (authorization !== `Bearer ${DEMO_API_KEY}`) {
    return {
      status: 401,
      body: { error: "Invalid Shape API key" },
    };
  }

  if (typeof accountUrl !== "string") {
    return {
      status: 400,
      body: { error: "accountUrl is required" },
    };
  }

  try {
    return {
      status: 200,
      body: { account: createMockAccount(accountUrl) },
    };
  } catch (error) {
    return {
      status: 400,
      body: {
        error:
          error instanceof Error ? error.message : "Invalid Shape account URL",
      },
    };
  }
}
