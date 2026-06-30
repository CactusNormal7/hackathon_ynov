import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import StatusBadge from "./components/StatusBadge.jsx";
import { useChat } from "./hooks/useChat.js";
import { useServerStatus } from "./hooks/useServerStatus.js";
import { MODEL_NAME } from "./config.js";
import logoWordmark from "./assets/logo-wordmark.svg";
import "./App.css";

export default function App() {
  const status = useServerStatus();
  const { messages, isStreaming, error, send, stop, clear } = useChat();
  const offline = status === "offline";

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <img src={logoWordmark} alt="TechCorp Industries" className="topbar__logo" />
          <div className="topbar__divider" />
          <div className="topbar__product">
            <span>Assistant financier</span>
            <code>{MODEL_NAME}</code>
          </div>
        </div>
        <div className="topbar__actions">
          <StatusBadge status={status} />
          <button className="ghost-btn" onClick={clear}>
            <span className="ghost-btn__icon" aria-hidden="true">+</span>
            Nouvelle conversation
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Informations de session">
          <section className="sidebar__section">
            <h2>Session</h2>
            <dl className="metric-list">
              <div>
                <dt>Serveur</dt>
                <dd>ollama</dd>
              </div>
              <div>
                <dt>Endpoint</dt>
                <dd>/ollama/api/chat</dd>
              </div>
              <div>
                <dt>Messages</dt>
                <dd>{messages.length}</dd>
              </div>
            </dl>
          </section>
          <section className="sidebar__section">
            <h2>Paramètres</h2>
            <div className="model-card">
              <span>Modèle actif</span>
              <code>{MODEL_NAME}</code>
            </div>
          </section>
        </aside>

        <main className="main">
          <ChatWindow messages={messages} isStreaming={isStreaming} />
        </main>
      </div>

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
