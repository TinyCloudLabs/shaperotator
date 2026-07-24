export const DEFAULT_MIGRATION_KEY = "123456789";
export const DEMO_ACCOUNT_CODE = "shapedemo-account";
export const DEMO_ACCOUNT_INPUT =
  "https://shape.example/migrate?code=shapedemo-account";

export interface ShapeAccount {
  accountId: string;
  profile: {
    displayName: string;
    email: string;
    company: string;
    role: string;
    region: string;
  };
  subscription: {
    plan: "Starter" | "Team" | "Scale";
    status: "active";
    seats: number;
  };
  usage: {
    projects: number;
    workflows: number;
    collaborators: number;
    storageMb: number;
  };
  source: {
    provider: "shape";
    accountReference: string;
    mock: true;
  };
}

function validateAccountCode(value: string): string {
  const accountCode = value.trim();
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,63}$/.test(accountCode)) {
    throw new Error("Enter a valid Shape account code or URL");
  }
  return accountCode;
}

export function parseAccountCode(accountReference: string): string {
  const value = accountReference.trim();
  if (!value) {
    throw new Error("Enter a Shape account code or URL");
  }

  if (!value.includes("://")) {
    return validateAccountCode(value);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid Shape account code or URL");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Shape account URL must use HTTP or HTTPS");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  return validateAccountCode(
    url.searchParams.get("code") ??
      url.searchParams.get("accountId") ??
      segments.at(-1) ??
      "",
  );
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = value + Math.imul(value ^ (value >>> 7), 61 | value) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)]!;
}

export function createMockAccount(accountReference: string): ShapeAccount {
  const accountId = parseAccountCode(accountReference);
  const random = seededRandom(hashSeed(accountId));
  const firstName = pick(
    ["Avery", "Jordan", "Morgan", "Riley", "Taylor", "Sasha"],
    random,
  );
  const lastName = pick(
    ["Chen", "Diaz", "Khan", "Okafor", "Silva", "Williams"],
    random,
  );
  const company = pick(
    ["Acme Systems", "Northstar Studio", "Orbit Works", "Pine Labs"],
    random,
  );

  return {
    accountId,
    profile: {
      displayName: `${firstName} ${lastName}`,
      email: `${firstName}.${lastName}@example.test`.toLowerCase(),
      company,
      role: pick(
        ["Developer", "Operations Lead", "Product Manager", "Founder"],
        random,
      ),
      region: pick(["US East", "US West", "EU Central", "Asia Pacific"], random),
    },
    subscription: {
      plan: pick(["Starter", "Team", "Scale"] as const, random),
      status: "active",
      seats: 2 + Math.floor(random() * 48),
    },
    usage: {
      projects: 1 + Math.floor(random() * 20),
      workflows: 5 + Math.floor(random() * 150),
      collaborators: 1 + Math.floor(random() * 30),
      storageMb: 100 + Math.floor(random() * 9900),
    },
    source: {
      provider: "shape",
      accountReference: accountReference.trim(),
      mock: true,
    },
  };
}

export function accountKvKey(accountId: string): string {
  return `accounts/${accountId}`;
}
