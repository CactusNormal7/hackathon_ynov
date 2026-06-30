import { useEffect, useState } from "react";
import { pingServer } from "../api/ollama.js";

// Sonde périodiquement le serveur d'inférence et renvoie son état.
// status: "checking" | "online" | "offline"
export function useServerStatus(intervalMs = 5000) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    let controller;

    async function check() {
      controller = new AbortController();
      try {
        await pingServer(controller.signal);
        if (!cancelled) setStatus("online");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, [intervalMs]);

  return status;
}
