// Une bulle de message. role = "user" | "assistant".
export default function MessageBubble({ role, content, streaming, model }) {
  const isUser = role === "user";
  return (
    <div className={`bubble-row ${isUser ? "bubble-row--user" : ""}`}>
      <div className={`avatar avatar--${role}`} aria-hidden="true">
        {isUser ? "U" : "AI"}
      </div>
      <div className={`bubble-stack ${isUser ? "bubble-stack--user" : ""}`}>
        <div className={`bubble bubble--${role}`}>
          {content}
          {streaming && <span className="cursor" />}
        </div>
        {model && <code className="bubble-meta">{model}</code>}
      </div>
    </div>
  );
}
