import { OpenKey, OpenKeyProvider, type AuthResult } from "@openkey/sdk";
import { TinyCloudWeb } from "@tinycloud/web-sdk";
import { accountKvKey, type ShapeAccount } from "./account";
import {
  SHAPEROTATOR_SPACE,
  shaperotatorManifest,
} from "./tinycloud-manifest";

const viteEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | boolean | undefined>;
}).env;
const defaultTinyCloudHost = viteEnv?.DEV
  ? "http://127.0.0.1:8000"
  : "https://node.tinycloud.xyz";
const tinyCloudHost =
  (viteEnv?.VITE_TINYCLOUD_HOST as string | undefined) ??
  defaultTinyCloudHost;

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

interface TinyCloudResult {
  ok: boolean;
  error?: { message?: string };
}

let openkey: OpenKey | null = null;
let tinycloud: any | null = null;

function getOpenKey(): OpenKey {
  if (!openkey) {
    openkey = new OpenKey({
      host: "https://openkey.so",
      appName: "Shaperotator",
      externalProvider: (globalThis as { ethereum?: Eip1193Provider }).ethereum,
    });
  }
  return openkey;
}

export async function connectTinyCloud(): Promise<AuthResult> {
  const authResult = await getOpenKey().connect();
  const provider = new OpenKeyProvider(getOpenKey(), authResult);

  tinycloud = new TinyCloudWeb({
    provider,
    tinycloudHosts: [tinyCloudHost],
    spacePrefix: SHAPEROTATOR_SPACE,
    autoCreateSpace: true,
    manifest: shaperotatorManifest,
  });

  await tinycloud.signIn();
  return authResult;
}

export async function importAccount(account: ShapeAccount): Promise<string> {
  if (!tinycloud) {
    throw new Error("Log in to TinyCloud before migrating");
  }

  const key = accountKvKey(account.accountId);
  const result = (await tinycloud.kv
    .withPrefix("accounts/")
    .put(account.accountId, {
      account,
      importedAt: new Date().toISOString(),
      importer: "xyz.tinycloud.shaperotator",
    })) as TinyCloudResult;

  if (!result.ok) {
    throw new Error(result.error?.message || "TinyCloud KV write failed");
  }

  return key;
}
