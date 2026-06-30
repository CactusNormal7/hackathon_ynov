import { useState } from "react";

// Zone de saisie. Entrée pour envoyer, Maj+Entrée pour un retour à la ligne.
export default function MessageInput({ onSend, onStop, isStreaming, disabled }) {
  const [value, setValue] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      submit(e);
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        className="composer__input"
        rows={1}
        placeholder={
          disabled
            ? "Serveur indisponible — vérifiez Ollama (port 11434)"
            : "Posez une question financière…"
        }
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {isStreaming ? (
        <button type="button" className="composer__btn stop" onClick={onStop}>
          Stop
        </button>
      ) : (
        <button
          type="submit"
          className="composer__btn"
          disabled={disabled || !value.trim()}
        >
          Envoyer
        </button>
      )}
    </form>
  );
}
