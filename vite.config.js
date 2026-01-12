import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" lets the built site work on Vercel, Netlify, or a GitHub Pages sub-path.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
