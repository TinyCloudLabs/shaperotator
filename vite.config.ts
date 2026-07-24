import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";

function shimNodeGlobals(): Plugin {
  return {
    name: "shim-node-globals",
    renderChunk(code) {
      if (!code.includes("__webpack_require__")) return null;
      return {
        code:
          'var exports = {}; if(typeof global==="undefined"){var global=globalThis;}\n' +
          code,
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [sveltekit(), shimNodeGlobals()],
  optimizeDeps: {
    include: ["@tinycloud/web-sdk", "@openkey/sdk"],
  },
});
