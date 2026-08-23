import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  build: {
    // Separa las librerías grandes en chunks propios: cachean mejor entre
    // despliegues y se descargan solo cuando la página que las usa se carga
    // (p. ej. recharts solo al abrir el dashboard).
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("d3-")) return "recharts";
          if (id.includes("framer-motion")) return "framer";
          if (id.includes("@chakra-ui") || id.includes("@emotion")) return "chakra";
          if (id.includes("react-router")) return "router";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("@tanstack")) return "query";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          )
            return "react-vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
