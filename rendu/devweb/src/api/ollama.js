import { MODEL_NAME, OLLAMA_PREFIX, SYSTEM_PROMPT } from "../config.js";

// Vérifie que le serveur Ollama répond (utilisé pour le badge de statut).
export async function pingServer(signal) {
  const res = await fetch(`${OLLAMA_PREFIX}/api/tags`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { models: [...] }
}

// Envoie l'historique au endpoint /api/chat d'Ollama en streaming (NDJSON).
// `messages` : [{ role: "user"|"assistant", content }]
// `onToken`  : callback appelé à chaque fragment de texte reçu.
export async function streamChat(messages, { onToken, signal }) {
  const payload = {
    model: MODEL_NAME,
    stream: true,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
  };

  const res = await fetch(`${OLLAMA_PREFIX}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Ollama a répondu ${res.status}. ${detail}`.trim());
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Ollama renvoie un objet JSON par ligne.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const chunk = JSON.parse(trimmed);
      const token = chunk?.message?.content ?? "";
      if (token) {
        full += token;
        onToken(token);
      }
    }
  }

  return full;
}
