import { DEFAULT_MIGRATION_KEY } from "../account";

export const DEV_ADMIN_TOKEN = "shapedemo_admin_token";

export interface MigrationKeyState {
  migrationKey: string;
  updatedAt: string | null;
}

let state: MigrationKeyState = {
  migrationKey: DEFAULT_MIGRATION_KEY,
  updatedAt: null,
};

function assertMigrationKey(value: string): string {
  if (!/^\d{9}$/.test(value)) {
    throw new Error("Migration key must be exactly 9 digits");
  }
  return value;
}

function generateNineDigitKey(): string {
  let generated = state.migrationKey;
  while (generated === state.migrationKey) {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    generated = String(100_000_000 + (random[0]! % 900_000_000));
  }
  return generated;
}

export function getMigrationKeyState(): MigrationKeyState {
  return { ...state };
}

export function isCurrentMigrationKey(value: string): boolean {
  return value === state.migrationKey;
}

export function setMigrationKey(value?: string): {
  state: MigrationKeyState;
  operation: "generated" | "updated";
} {
  const operation = value === undefined ? "generated" : "updated";
  state = {
    migrationKey:
      value === undefined ? generateNineDigitKey() : assertMigrationKey(value),
    updatedAt: new Date().toISOString(),
  };
  return { state: getMigrationKeyState(), operation };
}

export function resetMigrationKeyForTests(): void {
  state = {
    migrationKey: DEFAULT_MIGRATION_KEY,
    updatedAt: null,
  };
}
