// Configuration centrale de l'app.
// Le nom du modèle doit correspondre à celui créé par l'INFRA :
//   ollama create phi3-financial -f ollama_server/Modelfile
export const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || "phi3-financial";

// Toutes les requêtes passent par le préfixe "/ollama" relayé par le proxy Vite
// (voir vite.config.js) vers http://localhost:11434.
export const OLLAMA_PREFIX = "/ollama";

export const SYSTEM_PROMPT =
  "You are a financial assistant specialized in helping financial analysts at " +
  "TechCorp Industries. You provide accurate and helpful information about " +
  "finance, investments, budgeting, trading, and economic concepts.";
