// Builds a single-file preview (React loaded from CDN) for the hosted preview link.
// You don't need this to deploy; `npm run build` is the real build.
import { defineConfig } from "vite";
export default defineConfig({
  esbuild: { jsx: "transform", jsxFactory: "React.createElement", jsxFragment: "React.Fragment" },
  build: {
    outDir: "artifact-build",
    cssCodeSplit: false,
    rollupOptions: {
      input: "src/main.jsx",
      external: ["react", "react-dom/client"],
      output: { format: "iife", globals: { react: "React", "react-dom/client": "ReactDOM" }, entryFileNames: "app.js", assetFileNames: "app.[ext]" },
    },
  },
});
