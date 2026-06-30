# DEV WEB — Interface chat React (Phi-3.5-Financial)

Interface de chat React/Vite branchée sur le serveur d'inférence Ollama de l'équipe INFRA.

## Lancer en une commande

```bash
npm install && npm run dev
```

Ouvre http://localhost:5173.

> Prérequis : Ollama tourne sur `http://localhost:11434` avec le modèle créé par l'INFRA :
> ```bash
> ollama create phi3-financial -f ../../ollama_server/Modelfile
> ollama serve
> ```

## Fonctionnalités (livrables DEV WEB)

- 💬 Chat temps réel en **streaming** (endpoint Ollama `/api/chat`)
- 📜 **Historique** de conversation conservé et renvoyé au modèle à chaque tour
- 🟢 **Indicateur de connexion** au serveur (Connecté / Déconnecté), sondé toutes les 5 s
- ⏹️ Bouton Stop pour interrompre une génération, "Nouvelle conversation" pour réinitialiser

## Configuration

| Variable | Défaut | Rôle |
|---|---|---|
| `OLLAMA_URL` | `http://localhost:11434` | Serveur Ollama ciblé par le proxy Vite |
| `VITE_MODEL_NAME` | `phi3-financial` | Nom du modèle Ollama à interroger |

Exemple si l'INFRA expose le serveur ailleurs :

```bash
OLLAMA_URL=http://192.168.1.42:11434 VITE_MODEL_NAME=phi3-financial npm run dev
```

## Architecture

```
src/
├── config.js              # nom du modèle, system prompt, préfixe API
├── api/ollama.js          # pingServer() + streamChat() (parsing NDJSON)
├── hooks/
│   ├── useServerStatus.js # polling du statut connecté/déconnecté
│   └── useChat.js         # état de l'historique + envoi en streaming
├── components/
│   ├── ChatWindow.jsx     # liste des messages + auto-scroll
│   ├── MessageBubble.jsx  # bulle user/assistant
│   ├── MessageInput.jsx   # zone de saisie (Entrée = envoyer)
│   └── StatusBadge.jsx    # pastille de connexion
├── App.jsx                # assemblage
└── main.jsx               # point d'entrée React
```

Le **proxy Vite** (`vite.config.js`) relaie `/ollama/*` vers Ollama : ça évite tout problème
de CORS côté navigateur. Le front n'appelle jamais le port 11434 en direct.
