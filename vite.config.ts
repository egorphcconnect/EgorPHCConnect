import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts.
    server: { entry: "server" },
  },

  // Use Vercel when building outside Lovable.
  nitro: {
    preset: "vercel",
  },
});