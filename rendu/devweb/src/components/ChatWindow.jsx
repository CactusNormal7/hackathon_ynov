import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import { MODEL_NAME } from "../config.js";

// Liste scrollable des messages, auto-scroll vers le bas.
export default function ChatWindow({ messages, isStreaming }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat chat--empty">
        <div className="empty-state">
          <span className="empty-state__eyebrow">Phi-3.5-Financial</span>
          <h1>Posez une question financière</h1>
          <p>
            Analyse de budget, investissement, risque, marché ou notions économiques.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      {messages.map((m, i) => (
        <MessageBubble
          key={m.id}
          role={m.role}
          content={m.content}
          model={m.role === "assistant" ? MODEL_NAME : undefined}
          streaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
