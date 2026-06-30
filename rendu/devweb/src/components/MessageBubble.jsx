// Une bulle de message. role = "user" | "assistant".
export default function MessageBubble({ role, content, streaming }) {
  const isUser = role === "user";
  return (
    <div className={`bubble-row ${isUser ? "bubble-row--user" : ""}`}>
      <div className={`bubble bubble--${role}`}>
        {content}
        {streaming && <span className="cursor" />}
      </div>
    </div>
  );
}
