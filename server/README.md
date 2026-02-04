# API Simulation (Gemini)

Le serveur expose `POST /api/simulate` pour que la page **Simulation de scénarios** envoie les données au LLM Gemini et affiche une analyse.

## Lancer les deux en même temps (recommandé)

Une seule commande lance le serveur API et le front Vite :

```bash
npm run start
```

La clé Gemini peut être dans un fichier **.env** à la racine du projet :

```bash
cp .env.example .env
# Édite .env et mets ta clé : GEMINI_API_KEY=ta_clé
```

Puis :

```bash
npm run start
```

## Lancer séparément

- Terminal 1 : `npm run server` (avec `GEMINI_API_KEY` dans .env ou `GEMINI_API_KEY=xxx npm run server`)
- Terminal 2 : `npm run dev`

Le serveur écoute sur **http://localhost:3001**. Vite proxy les appels `/api/*` vers ce serveur.
