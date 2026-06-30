import { useEffect, useRef, useState } from "react";
import { MODEL_NAME } from "../config.js";

// Zone de saisie. Entrée pour envoyer, Maj+Entrée pour un retour à la ligne.
export default function MessageInput({ onSend, onStop, isStreaming, disabled }) {
  const [value, setValue] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (!textAreaRef.current) return;
    textAreaRef.current.style.height = "auto";
    textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 132)}px`;
  }, [value]);

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
        ref={textAreaRef}
        className="composer__input"
        rows={1}
        placeholder={
          disabled
            ? "Serveur indisponible - vérifiez Ollama (port 11434)"
            : "Posez une question financière..."
        }
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="composer__footer">
        <code>model: {MODEL_NAME}</code>
        {isStreaming ? (
          <button type="button" className="composer__btn composer__btn--stop" onClick={onStop}>
            Stop
          </button>
        ) : (
          <button
            type="submit"
            className="composer__btn"
            disabled={disabled || !value.trim()}
            aria-label="Envoyer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m22 2-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
