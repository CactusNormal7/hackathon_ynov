import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Le proxy évite les soucis de CORS : le front appelle "/ollama/..."
// et Vite relaie vers le serveur Ollama de l'équipe INFRA.
// Surchargeable avec la variable d'env OLLAMA_URL au lancement.
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/ollama": {
        target: OLLAMA_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ""),
      },
    },
  },
});
