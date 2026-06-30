import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

// Liste scrollable des messages, auto-scroll vers le bas.
export default function ChatWindow({ messages, isStreaming }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat chat--empty">
        <p>👋 Assistant financier TechCorp</p>
        <span>Posez une question sur la finance, les investissements, le budget…</span>
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
          streaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
