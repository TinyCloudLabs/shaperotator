import { describe, expect, test } from "bun:test";
import {
  SHAPEROTATOR_SPACE,
  shaperotatorManifest,
} from "./tinycloud-manifest";

describe("TinyCloud manifest", () => {
  test("limits storage access to the account record prefix", () => {
    expect(shaperotatorManifest.space).toBe(SHAPEROTATOR_SPACE);
    expect(shaperotatorManifest.permissions).toEqual([
      {
        service: "tinycloud.kv",
        space: "shaperotator",
        path: "accounts/",
        actions: ["put"],
        skipPrefix: true,
      },
    ]);
  });
});
