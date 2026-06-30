const LABELS = {
  checking: "Connexion…",
  online: "Connecté",
  offline: "Déconnecté",
};

// Indicateur de connexion au serveur d'inférence (exigé par les consignes).
export default function StatusBadge({ status }) {
  return (
    <span className={`status status--${status}`}>
      <span className="status__dot" aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
