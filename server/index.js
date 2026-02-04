/**
 * Backend minimal pour appeler Gemini (clé API côté serveur).
 * Lancement : npm run start (lance API + front) ou GEMINI_API_KEY=xxx npm run server
 * La clé peut être dans un fichier .env à la racine du projet.
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json())

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Cache des réponses Gemini pour la démo (réduit les appels et préserve le quota)
const DEMO_CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const demoTextCache = new Map()   // clé: `demo:${step}:${scenarioId}` -> { text, ts }
const demoIndicatorsCache = new Map() // clé: `demoInd:${scenarioId}` -> { avant, apres, problemDetected, ts }

function getCached(key, cache) {
  const entry = cache.get(key)
  if (!entry || Date.now() - entry.ts > DEMO_CACHE_TTL_MS) return null
  return entry.data
}

function setCached(key, data, cache) {
  cache.set(key, { data, ts: Date.now() })
}

/** Message d'erreur lisible à partir de la réponse Gemini (statut + corps). */
function parseGeminiError(status, errText) {
  let msg = ''
  let code = null
  try {
    const body = errText ? JSON.parse(errText) : {}
    code = body?.error?.code ?? body?.error?.status
    const m = (body?.error?.message || body?.message || '').toLowerCase()
    const statusReason = (body?.error?.status || '').toLowerCase()
    const is429 = status === 429 || code === 429 || statusReason.includes('resource_exhausted') || m.includes('quota') || m.includes('exhausted') || m.includes('429')
    const is403 = status === 403 || code === 403 || statusReason.includes('permission') || m.includes('api key') || m.includes('invalid') || m.includes('unregistered') || m.includes('403')

    if (is429) {
      msg = 'Quota API Gemini dépassé (trop de requêtes ou limite du jour). Réessayez dans quelques minutes ou demain. La démo fonctionne sans IA en attendant.'
    } else if (is403) {
      msg = 'Clé API Gemini invalide ou non activée. Créez une clé sur https://aistudio.google.com/app/apikey et mettez GEMINI_API_KEY dans le fichier .env à la racine du projet.'
    } else if (status === 401 || code === 401) {
      msg = 'Clé API Gemini manquante ou refusée. Vérifiez GEMINI_API_KEY dans .env.'
    } else if (body?.error?.message) {
      msg = body.error.message.slice(0, 200)
    } else if (m) {
      msg = (body?.error?.message || body?.message || '').slice(0, 200)
    }
  } catch (_) {}

  if (!msg) {
    if (status === 429 || code === 429) msg = 'Quota API Gemini dépassé. Réessayez plus tard.'
    else if (status === 403 || code === 403) msg = 'Clé API Gemini invalide ou non activée (voir .env et Google AI Studio).'
    else if (status === 401 || code === 401) msg = 'Clé API manquante ou invalide.'
    else msg = `Gemini a renvoyé une erreur (${status || code || '?'}). Vérifiez votre clé dans .env et relancez npm run start.`
  }
  return msg
}

// Santé de l'API (pour vérifier que le serveur tourne et que la clé est chargée)
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    api: 'demo',
    geminiConfigured: !!GEMINI_API_KEY,
  })
})

app.post('/api/simulate', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY non configurée', comment: null })
  }
  const { scenario, scenarioLabel, params, etatInitial, results, dataSummary } = req.body || {}
  const avant = etatInitial || {}
  const apres = results ? {
    admissions: results.admissions?.apres,
    occupation: results.occupation?.apres,
    rh: results.rh?.apres,
  } : {}

  const dataContext = dataSummary && dataSummary.length > 0
    ? `Contexte des données récentes (fichier hospital_data.json) :\n${JSON.stringify(dataSummary.slice(0, 5), null, 0)}`
    : 'Pas de données historiques fournies.'

  const prompt = `Tu es un assistant expert en gestion hospitalière. Analyse cette simulation en 3-4 phrases courtes en français.

Scénario simulé : ${scenarioLabel || scenario || 'Non précisé'}
Hypothèses : Taux admission ${params?.tauxAdmission ?? '-'} %, Personnel dispo ${params?.personnelDisponible ?? '-'} %, Capacité lits ${params?.capaciteLits ?? '-'} %.

Situation AVANT (données du fichier ou référence) : Admissions ${avant.admissions ?? '-'}, Occupation lits ${avant.occupation ?? '-'} %, RH ${avant.rh ?? '-'} %.
Situation APRÈS simulation : Admissions ${apres.admissions ?? '-'}, Occupation lits ${apres.occupation ?? '-'} %, RH ${apres.rh ?? '-'} %.

${dataContext}

Donne une analyse concise : impact du scénario, niveau de risque (maîtrisé / tension / saturation), et une recommandation concrète (ex. renfort personnel, ouverture de lits). Réponds uniquement en texte, sans titre ni puces.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.3 },
      }),
    })
    if (!response.ok) {
      const errText = await response.text()
      const errMsg = parseGeminiError(response.status, errText)
      return res.status(502).json({ error: errMsg, detail: errText?.slice(0, 200) || null, comment: null })
    }
    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
    if (data?.candidates?.[0]?.finishReason && data.candidates[0].finishReason !== 'STOP' && data.candidates[0].finishReason !== 'MAX_TOKENS') {
      return res.status(502).json({ error: 'Réponse Gemini bloquée ou incomplète', comment: null })
    }
    return res.json({ comment: text })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur serveur', comment: null })
  }
})

// Simulation : Gemini génère les chiffres Avant/Après (Impact de la simulation)
app.post('/api/simulate/indicators', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY non configurée', results: null })
  }
  const { scenario, scenarioLabel, params, etatInitial, dataSummary } = req.body || {}
  const avant = etatInitial || {}

  const prompt = `Tu es un expert en gestion hospitalière. Pour une simulation du scénario "${scenarioLabel || scenario}", génère des indicateurs réalistes "Avant" et "Après" simulation.

Contexte actuel (Avant) : admissions ${avant.admissions ?? '-'}/jour, occupation lits ${avant.occupation ?? '-'} %, disponibilité RH ${avant.rh ?? '-'} %.
Hypothèses : taux admission ${params?.tauxAdmission ?? 85} %, personnel dispo ${params?.personnelDisponible ?? 90} %, capacité lits ${params?.capaciteLits ?? 78} %.

L'impact "Après" doit être cohérent avec le scénario (ex. épidémie = hausse admissions et occupation, baisse RH possible ; grève = baisse RH et tension).

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après :
{"admissions":{"avant":number,"apres":number},"occupation":{"avant":number,"apres":number},"rh":{"avant":number,"apres":number}}
- admissions : entiers (ex. 80-400), avant peut reprendre le contexte, apres varie selon le scénario.
- occupation et rh : entiers 0-99 (pourcentages). Après doit refléter l'impact (ex. occupation monte en épidémie, rh baisse en grève).`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 384, temperature: 0.2 },
      }),
    })
    if (!response.ok) {
      const errText = await response.text()
      const errMsg = parseGeminiError(response.status, errText)
      return res.status(502).json({ error: errMsg, results: null })
    }
    const data = await response.json()
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    if (!raw) return res.json({ results: null, error: 'Réponse LLM vide.' })

    const parsed = (() => {
      try {
        const m = raw.match(/\{[\s\S]*\}/)
        return m ? JSON.parse(m[0]) : JSON.parse(raw)
      } catch {
        return null
      }
    })()

    if (
      !parsed?.admissions || parsed.admissions.avant == null || parsed.admissions.apres == null ||
      !parsed?.occupation || parsed.occupation.avant == null || parsed.occupation.apres == null ||
      !parsed?.rh || parsed.rh.avant == null || parsed.rh.apres == null
    ) {
      return res.json({ results: null, error: 'Format LLM invalide.' })
    }

    const norm = (o) => ({
      avant: Math.max(0, Math.round(Number(o?.avant) ?? 0)),
      apres: Math.max(0, Math.round(Number(o?.apres) ?? 0)),
    })
    const results = {
      admissions: norm(parsed.admissions),
      occupation: {
        avant: Math.min(99, Math.max(0, Math.round(Number(parsed.occupation?.avant) ?? 0))),
        apres: Math.min(99, Math.max(0, Math.round(Number(parsed.occupation?.apres) ?? 0))),
      },
      rh: {
        avant: Math.min(99, Math.max(0, Math.round(Number(parsed.rh?.avant) ?? 0))),
        apres: Math.min(99, Math.max(0, Math.round(Number(parsed.rh?.apres) ?? 0))),
      },
    }
    return res.json({ results })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur serveur', results: null })
  }
})

// Mode Démo : texte généré par le LLM pour chaque étape (contexte, détection, recommandation, impact)
app.post('/api/demo', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY non configurée', text: null })
  }
  const { step, scenarioId, scenarioLabel, etatInitial, etatApres, dataSummary } = req.body || {}
  const avant = etatInitial || {}
  const apres = etatApres || {}

  const dataContext = dataSummary && dataSummary.length > 0
    ? `Données récentes (fichier) : ${JSON.stringify(dataSummary.slice(0, 3))}`
    : ''

  const prompts = {
    1: `Rédige en 2-3 phrases le contexte initial pour une démo hospitalière. Données actuelles : admissions ${avant.admissions ?? '-'}, occupation lits ${avant.occupation ?? '-'} %, disponibilité RH ${avant.rh ?? '-'} %. ${dataContext}. Ton : factuel, pas de liste à puces.`,
    2: `En une phrase, décris la détection d'un problème (dépassement de seuil) pour le scénario "${scenarioLabel || scenarioId}". Contexte : occupation ${avant.occupation ?? '-'} %, RH ${avant.rh ?? '-'} %. Réponds en une seule phrase.`,
    4: `Pour le scénario "${scenarioLabel || scenarioId}" avec état avant (occupation ${avant.occupation ?? '-'} %, admissions ${avant.admissions ?? '-'}, RH ${avant.rh ?? '-'} %), propose une recommandation concrète en 1-2 phrases (ex. ouvrir des lits, redéployer du personnel). Pas de titre.`,
    6: `Résume en une phrase l'impact d'une décision : avant (occupation ${avant.occupation ?? '-'} %, RH ${avant.rh ?? '-'} %) → après (occupation ${apres.occupation ?? '-'} %, RH ${apres.rh ?? '-'} %). Message positif et factuel, en français.`,
  }
  const prompt = prompts[step]
  if (!prompt) {
    return res.json({ text: null })
  }

  const cacheKey = `demo:${step}:${scenarioId || 'default'}`
  const cached = getCached(cacheKey, demoTextCache)
  if (cached !== null) {
    return res.json(cached)
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 256, temperature: 0.3 },
      }),
    })
    if (!response.ok) {
      const errText = await response.text()
      const errMsg = parseGeminiError(response.status, errText)
      return res.status(502).json({ error: errMsg, detail: errText?.slice(0, 200) || null, text: null })
    }
    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
    const finishReason = data?.candidates?.[0]?.finishReason
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      return res.status(502).json({ error: 'Réponse Gemini bloquée ou incomplète', text: null })
    }
    if (!text && data?.promptFeedback?.blockReason) {
      return res.status(502).json({ error: 'Contenu bloqué par les filtres de sécurité', text: null })
    }
    const payload = { text }
    setCached(cacheKey, payload, demoTextCache)
    return res.json(payload)
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur serveur', text: null })
  }
})

// Indicateurs Avant/Après générés ou corrigés par le LLM en temps réel (détecte si données manquantes/fallback)
app.post('/api/demo/indicators', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY non configurée', avant: null, apres: null, problemDetected: null })
  }
  const { scenarioId, scenarioLabel, etatInitial, etatApres, dataFromFile, dataSummary } = req.body || {}
  const avant = etatInitial || {}
  const apres = etatApres || {}

  const isLikelyFallback =
    (avant.occupation === 92 && avant.admissions === 120 && avant.rh === 68) ||
    (apres.occupation === 74 && apres.admissions === 95 && apres.rh === 82)

  const prompt = `Tu es un expert en gestion hospitalière. Pour la démo du scénario "${scenarioLabel || scenarioId}", on affiche un tableau "Avant / Après décision" avec ces indicateurs actuels :
- AVANT : occupation ${avant.occupation ?? '-'} %, admissions ${avant.admissions ?? '-'}/jour, disponibilité RH ${avant.rh ?? '-'} %.
- APRÈS : occupation ${apres.occupation ?? '-'} %, admissions ${apres.admissions ?? '-'}, RH ${apres.rh ?? '-'} %.
Données réelles chargées depuis fichier : ${dataFromFile ? 'oui' : 'non'}.
${isLikelyFallback ? "Ces chiffres ressemblent à des valeurs par défaut (fallback) car le fichier n'est pas chargé ou manquant : tu DOIS proposer des indicateurs réalistes cohérents avec le scénario et indiquer qu'un problème a été détecté." : 'Propose des indicateurs Avant/Après réalistes et cohérents pour ce scénario (après = amélioration attendue après décision).'}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, au format suivant (remplace par tes valeurs numériques réalistes) :
{"avant":{"occupation":number,"admissions":number,"rh":number},"apres":{"occupation":number,"admissions":number,"rh":number},"problemDetected":string ou null}
- occupation et rh : entiers entre 50 et 99 pour avant ; après doit montrer une amélioration (ex. occupation baisse, rh monte).
- admissions : entier réaliste (ex. 80-350/jour) ; après peut diminuer ou rester stable selon le scénario.
- problemDetected : si tu as détecté des données manquantes ou fallback, mets une phrase courte en français ; sinon null.`

  const indCacheKey = `demoInd:${scenarioId || 'default'}`
  const cachedInd = getCached(indCacheKey, demoIndicatorsCache)
  if (cachedInd !== null) {
    return res.json(cachedInd)
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.2 },
      }),
    })
    if (!response.ok) {
      const errText = await response.text()
      const errMsg = parseGeminiError(response.status, errText)
      return res.status(502).json({ error: errMsg, detail: errText?.slice(0, 200) || null, avant: null, apres: null, problemDetected: null })
    }
    const data = await response.json()
    const finishReason = data?.candidates?.[0]?.finishReason
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      return res.status(502).json({ error: 'Réponse Gemini bloquée ou incomplète', avant: null, apres: null, problemDetected: null })
    }
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    if (!raw) return res.json({ avant: null, apres: null, problemDetected: 'Réponse LLM vide.' })

    const parsed = (() => {
      try {
        const m = raw.match(/\{[\s\S]*\}/)
        return m ? JSON.parse(m[0]) : JSON.parse(raw)
      } catch {
        return null
      }
    })()
    if (!parsed || !parsed.avant || !parsed.apres) {
      return res.json({
        avant: { occupation: avant.occupation, admissions: avant.admissions, rh: avant.rh },
        apres: { occupation: apres.occupation, admissions: apres.admissions, rh: apres.rh },
        problemDetected: 'Impossible de parser la réponse LLM.',
      })
    }
    const norm = (o) => ({
      occupation: Math.min(99, Math.max(0, Math.round(Number(o.occupation) || 0))),
      admissions: Math.max(0, Math.round(Number(o.admissions) || 0)),
      rh: Math.min(99, Math.max(0, Math.round(Number(o.rh) || 0))),
    })
    const payload = {
      avant: norm(parsed.avant),
      apres: norm(parsed.apres),
      problemDetected: parsed.problemDetected && String(parsed.problemDetected).trim() || null,
    }
    setCached(indCacheKey, payload, demoIndicatorsCache)
    return res.json(payload)
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur serveur', avant: null, apres: null, problemDetected: null })
  }
})

// Simulation d'impact : Gemini simule Avant/Après pour une décision (lits, effectifs, durée)
app.post('/api/simulation/impact', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(200).json({
      ok: false,
      error: 'GEMINI_API_KEY non configurée',
      occupationAvant: null,
      occupationApres: null,
      fluxPatientsAvant: null,
      fluxPatientsApres: null,
      tensionRHAvant: null,
      tensionRHApres: null,
      stocksAvant: null,
      stocksApres: null,
    })
  }
  const { actionProposee, service, nbLits, effectifsDeplaces, dureeHeures, latest } = req.body || {}
  if (!actionProposee || !service) {
    return res.status(400).json({
      ok: false,
      error: 'Body doit contenir actionProposee et service',
      occupationAvant: null,
      occupationApres: null,
      fluxPatientsAvant: null,
      fluxPatientsApres: null,
      tensionRHAvant: null,
      tensionRHApres: null,
      stocksAvant: null,
      stocksApres: null,
    })
  }
  const nbL = Math.max(1, Math.min(50, Number(nbLits) || 10))
  const eff = Math.max(0, Math.min(20, Number(effectifsDeplaces) || 0))
  const dur = Math.max(1, Math.min(168, Number(dureeHeures) || 24))
  const ctxFile = latest && (latest.admissions != null || latest.occupiedBeds != null)
    ? `Contexte actuel (fichier) : admissions ${latest.admissions ?? '-'}/jour, lits occupés ${latest.occupiedBeds ?? '-'}, personnel ${latest.availableStaff ?? '-'}. Utilise ces valeurs pour "Avant" si cohérent.`
    : 'Pas de données fichier : invente un contexte hospitalier réaliste pour Avant.'

  const prompt = `Tu es un expert en gestion hospitalière. Simule l'impact de la décision suivante avec les paramètres donnés.

Décision : ${actionProposee}
Service : ${service}
Paramètres : ${nbL} lits ouverts/concernés, ${eff} effectifs déplacés, durée ${dur} h.

${ctxFile}

Réponds UNIQUEMENT par un JSON valide, sans texte avant ou après :
{"occupationAvant":number,"occupationApres":number,"fluxPatientsAvant":number,"fluxPatientsApres":number,"tensionRHAvant":number,"tensionRHApres":number,"stocksAvant":string,"stocksApres":string}
- occupationAvant/Apres : taux d'occupation des lits (0-99 %). Ouvrir des lits doit en général faire baisser l'occupation.
- fluxPatientsAvant/Apres : flux patients/jour (entiers réalistes, ex. 80-200). Peut diminuer légèrement si meilleure capacité.
- tensionRHAvant/tensionRHApres : tension RH en % (0-99). Déplacer des effectifs peut améliorer la tension sur le service cible.
- stocksAvant/stocksApres : l'un de "Critique" | "Tension" | "Stable" | "Confort". Après doit être >= avant en niveau si la décision aide les stocks.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.2 },
      }),
    })
    if (!response.ok) {
      const errText = await response.text()
      let apiMessage = ''
      try {
        const errJson = JSON.parse(errText)
        apiMessage = errJson?.error?.message || errJson?.message || errText?.slice(0, 200) || ''
      } catch {
        apiMessage = errText?.slice(0, 200) || ''
      }
      const status = response.status
      const reason =
        status === 429
          ? 'Quota Gemini dépassé (trop de requêtes). Réessayez plus tard ou passez à un plan payant.'
          : status === 401
            ? 'Clé API Gemini invalide ou révoquée. Vérifiez GEMINI_API_KEY dans .env.'
            : status === 403
              ? 'Accès refusé (API non activée ou région). Activez l’API Generative Language dans Google Cloud.'
              : status === 404
                ? 'Modèle Gemini introuvable. Vérifiez le nom du modèle (ex. gemini-2.0-flash).'
                : apiMessage
                  ? `Gemini : ${apiMessage}`
                  : parseGeminiError(status, apiMessage || '')
      console.warn('[simulation/impact] Gemini API error:', status, apiMessage?.slice(0, 150))
      return res.status(200).json({
        ok: false,
        error: reason,
        detail: apiMessage?.slice(0, 300) || null,
        occupationAvant: null,
        occupationApres: null,
        fluxPatientsAvant: null,
        fluxPatientsApres: null,
        tensionRHAvant: null,
        tensionRHApres: null,
        stocksAvant: null,
        stocksApres: null,
      })
    }
    const data = await response.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    if (!raw) {
      return res.json({
        ok: false,
        error: 'Réponse LLM vide.',
        occupationAvant: null,
        occupationApres: null,
        fluxPatientsAvant: null,
        fluxPatientsApres: null,
        tensionRHAvant: null,
        tensionRHApres: null,
        stocksAvant: null,
        stocksApres: null,
      })
    }
    const parsed = (() => {
      try {
        const m = raw.match(/\{[\s\S]*\}/)
        return m ? JSON.parse(m[0]) : JSON.parse(raw)
      } catch {
        return null
      }
    })()
    if (!parsed || typeof parsed.occupationAvant !== 'number') {
      return res.json({
        ok: false,
        error: 'Format LLM invalide (attendu: indicateurs numériques et stocks).',
        occupationAvant: null,
        occupationApres: null,
        fluxPatientsAvant: null,
        fluxPatientsApres: null,
        tensionRHAvant: null,
        tensionRHApres: null,
        stocksAvant: null,
        stocksApres: null,
      })
    }
    const clamp = (v, min, max) => Math.round(Math.max(min, Math.min(max, Number(v) || 0)))
    const stockVal = (s) => (['Critique', 'Tension', 'Stable', 'Confort'].includes(String(s)) ? s : 'Stable')
    const result = {
      ok: true,
      occupationAvant: clamp(parsed.occupationAvant, 0, 99),
      occupationApres: clamp(parsed.occupationApres, 0, 99),
      fluxPatientsAvant: Math.max(0, Math.round(Number(parsed.fluxPatientsAvant) || 0)),
      fluxPatientsApres: Math.max(0, Math.round(Number(parsed.fluxPatientsApres) || 0)),
      tensionRHAvant: clamp(parsed.tensionRHAvant, 0, 99),
      tensionRHApres: clamp(parsed.tensionRHApres, 0, 99),
      stocksAvant: stockVal(parsed.stocksAvant),
      stocksApres: stockVal(parsed.stocksApres),
    }
    return res.json(result)
  } catch (e) {
    return res.status(200).json({
      ok: false,
      error: e.message || 'Erreur serveur',
      occupationAvant: null,
      occupationApres: null,
      fluxPatientsAvant: null,
      fluxPatientsApres: null,
      tensionRHAvant: null,
      tensionRHApres: null,
      stocksAvant: null,
      stocksApres: null,
    })
  }
})

// Prévisions : Gemini génère TOUTES les prévisions (courbes + Besoins en ressources) à partir du fichier
app.post('/api/forecast/resources', async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'server/index.js:forecast/resources:entry', message: 'Route hit', data: { hasKey: !!GEMINI_API_KEY, keyPrefix: GEMINI_API_KEY ? String(GEMINI_API_KEY).slice(0, 10) : null }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A' }) }).catch(() => {});
  // #endregion
  if (!GEMINI_API_KEY) {
    return res.status(200).json({ days: null, error: 'GEMINI_API_KEY non configurée' })
  }
  const { latest, recent, formulaForecast, horizon } = req.body || {}
  if (!latest || !Array.isArray(recent)) {
    return res.status(400).json({ error: 'Body doit contenir latest et recent (tableau)', days: null })
  }
  const H = Math.min(Math.max(Number(horizon) || 14, 7), 30)
  const lastDate = latest.date || ''
  const toDate = (d) => (d instanceof Date ? d : new Date(d))
  const dates = []
  let d = new Date(toDate(lastDate))
  for (let i = 0; i < H; i++) {
    d.setDate(d.getDate() + 1)
    dates.push(d.toISOString().split('T')[0])
  }
  const n = recent.length || 1
  const avgAdm = recent.reduce((s, x) => s + (x.admissions || 0), 0) / n
  const avgBeds = recent.reduce((s, x) => s + (x.occupiedBeds || 0), 0) / n
  const avgStaff = recent.reduce((s, x) => s + (x.availableStaff || 0), 0) / n
  const baseline = Array.isArray(formulaForecast) && formulaForecast.length >= H
    ? `Prévision statistique (même fichier) à utiliser comme base — J+1: adm ${formulaForecast[0]?.admissions ?? '-'} lits ${formulaForecast[0]?.occupiedBeds ?? '-'} pers ${formulaForecast[0]?.availableStaff ?? '-'} ; ... J+${H}: adm ${formulaForecast[H - 1]?.admissions ?? '-'} lits ${formulaForecast[H - 1]?.occupiedBeds ?? '-'} pers ${formulaForecast[H - 1]?.availableStaff ?? '-'}.`
    : ''

  const datesList = dates.map((dt, i) => `"${dt}"`).join(',')
  const prompt = `Tu es un expert en prévisions hospitalières. Génère des prévisions pour les ${H} prochains jours à partir des données du fichier ET de ton analyse. Chaque jour : admissions (entier), lits occupés (0-1780), personnel (160-240).

Données du fichier (hospital_data.json) :
- Dernier jour : ${lastDate}, admissions ${latest.admissions ?? '-'}, lits ${latest.occupiedBeds ?? '-'}, personnel ${latest.availableStaff ?? '-'}.
- Historique (${recent.length} j) : moyennes adm ~${Math.round(avgAdm)}, lits ~${Math.round(avgBeds)}, pers ~${Math.round(avgStaff)}.
${baseline}

Réponds UNIQUEMENT par un JSON valide, sans texte avant/après :
{"days":[{"date":"YYYY-MM-DD","admissions":number,"occupiedBeds":number,"availableStaff":number}, ...]}
- Exactement ${H} éléments. Dates dans l'ordre : ${datesList}. Tous les champs entiers.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.2 },
      }),
    })
    if (!response.ok) {
      const errText = await response.text()
      let apiMessage = ''
      try {
        const errJson = JSON.parse(errText)
        apiMessage = errJson?.error?.message || errJson?.message || errText?.slice(0, 200) || ''
      } catch {
        apiMessage = errText?.slice(0, 200) || ''
      }
      const status = response.status
      const reason =
        status === 429
          ? 'Quota Gemini dépassé (trop de requêtes). Réessayez plus tard.'
          : status === 401
            ? 'Clé API Gemini invalide. Vérifiez GEMINI_API_KEY dans .env.'
            : status === 403
              ? 'Accès refusé. Activez l’API Generative Language dans Google Cloud.'
              : apiMessage ? `Gemini : ${apiMessage}` : parseGeminiError(status, apiMessage || '')
      console.warn('[forecast/resources] Gemini API error:', status, apiMessage?.slice(0, 150))
      return res.status(200).json({ days: null, error: reason, detail: apiMessage?.slice(0, 300) || null })
    }
    const data = await response.json()
    const finishReason = data?.candidates?.[0]?.finishReason
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'server/index.js:gemini-response', message: 'Gemini 200', data: { finishReason, hasCandidates: !!data?.candidates?.length, rawLength: (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').length }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'D' }) }).catch(() => {});
    // #endregion
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      console.warn('[forecast/resources] Gemini finishReason:', finishReason)
      return res.status(200).json({ days: null, error: 'Réponse Gemini incomplète', detail: finishReason })
    }
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    if (!raw) return res.json({ days: null, error: 'Réponse LLM vide.' })

    const parsed = (() => {
      try {
        const m = raw.match(/\{[\s\S]*\}/)
        return m ? JSON.parse(m[0]) : JSON.parse(raw)
      } catch {
        return null
      }
    })()

    if (!parsed?.days || !Array.isArray(parsed.days) || parsed.days.length < 1) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'server/index.js:parse-fail', message: 'Parse or days invalid', data: { hasParsed: !!parsed, daysLength: parsed?.days?.length }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'E' }) }).catch(() => {});
      // #endregion
      return res.json({ days: null, error: 'Format LLM invalide (attendu: days avec ' + H + ' éléments).' })
    }

    const days = parsed.days.slice(0, H).map((row, i) => ({
      date: row.date || dates[i] || '',
      admissions: Math.min(600, Math.max(0, Math.round(Number(row.admissions) ?? 0))),
      occupiedBeds: Math.min(1780, Math.max(0, Math.round(Number(row.occupiedBeds) ?? 0))),
      availableStaff: Math.min(240, Math.max(160, Math.round(Number(row.availableStaff) ?? 0))),
    }))
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'server/index.js:success', message: 'Returning days', data: { daysCount: days.length }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A' }) }).catch(() => {});
    // #endregion
    return res.json({ days })
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'server/index.js:catch', message: 'Server exception', data: { err: e.message }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'B' }) }).catch(() => {});
    // #endregion
    console.warn('[forecast/resources] Server error:', e.message)
    return res.status(200).json({ days: null, error: e.message || 'Erreur serveur' })
  }
})

app.listen(PORT, () => {
  console.log(`Server API (Gemini) sur http://localhost:${PORT}`)
  if (!GEMINI_API_KEY) {
    console.warn('⚠ GEMINI_API_KEY absente : créez un fichier .env à la racine avec GEMINI_API_KEY=votre_cle (https://aistudio.google.com/app/apikey)')
  }
})
