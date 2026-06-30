import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import StatusBadge from "./components/StatusBadge.jsx";
import { useChat } from "./hooks/useChat.js";
import { useServerStatus } from "./hooks/useServerStatus.js";
import { MODEL_NAME } from "./config.js";
import "./App.css";

export default function App() {
  const status = useServerStatus();
  const { messages, isStreaming, error, send, stop, clear } = useChat();
  const offline = status === "offline";

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__title">
          <h1>TechCorp · Assistant Financier</h1>
          <code className="topbar__model">{MODEL_NAME}</code>
        </div>
        <div className="topbar__actions">
          <StatusBadge status={status} />
          <button className="ghost-btn" onClick={clear} disabled={isStreaming}>
            Nouvelle conversation
          </button>
        </div>
      </header>

      <main className="main">
        <ChatWindow messages={messages} isStreaming={isStreaming} />
      </main>

      {error && <div className="banner banner--error">{error}</div>}

      <footer className="footer">
        <MessageInput
          onSend={send}
          onStop={stop}
          isStreaming={isStreaming}
          disabled={offline}
        />
      </footer>
    </div>
  );
}
