import { useCallback, useRef, useState } from "react";
import { streamChat } from "../api/ollama.js";

// Gère l'historique de conversation et l'envoi en streaming.
export function useChat() {
  const [messages, setMessages] = useState([]); // {id, role, content}
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const send = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || isStreaming) return;

      setError(null);
      const userMsg = { id: crypto.randomUUID(), role: "user", content };
      const assistantId = crypto.randomUUID();

      // On affiche le message user + une bulle assistant vide qui se remplira.
      const history = [...messages, userMsg];
      setMessages([
        ...history,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat(
          history.map(({ role, content }) => ({ role, content })),
          {
            signal: controller.signal,
            onToken: (token) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + token }
                    : m,
                ),
              );
            },
          },
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Erreur de communication avec le serveur.");
          // Retire la bulle assistant vide en cas d'échec.
          setMessages((prev) =>
            prev.filter((m) => !(m.id === assistantId && m.content === "")),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isStreaming, error, send, stop, clear };
}
