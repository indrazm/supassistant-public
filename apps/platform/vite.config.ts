import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// API dev port; override with API_PORT when 3000 is taken.
const apiTarget = `http://localhost:${process.env.API_PORT ?? "3000"}`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  server: {
    proxy: {
      // Auth (and future API) calls go to the Hono API server.
      "/api": apiTarget,
    },
  },
});
