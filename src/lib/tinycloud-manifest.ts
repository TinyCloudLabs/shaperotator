import type { Manifest } from "@tinycloud/web-sdk";

export const SHAPEROTATOR_SPACE = "shaperotator";

export const shaperotatorManifest: Manifest = {
  manifest_version: 1,
  app_id: "xyz.tinycloud.shaperotator",
  name: "Shaperotator",
  description: "Import a Shape account record into user-owned TinyCloud KV.",
  space: SHAPEROTATOR_SPACE,
  prefix: "",
  defaults: false,
  includePublicSpace: false,
  permissions: [
    {
      service: "tinycloud.kv",
      space: SHAPEROTATOR_SPACE,
      path: "accounts/",
      actions: ["put"],
      skipPrefix: true,
    },
  ],
};
