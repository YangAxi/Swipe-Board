import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  resolve: { preserveSymlinks: true },
  // Some managed Windows sandboxes cannot watch path ancestors. Opt out only there.
  server: { watch: process.env.SWIPE_DEMO_NO_WATCH === "1" ? null : undefined },
});
