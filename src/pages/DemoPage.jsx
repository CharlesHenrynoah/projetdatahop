import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { hospitalData } from '../components/DataGenerator'

const SCENARIOS_DEMO = [
  {
    id: 'epidemie',
    titre: 'Épidémie soudaine',
    description:
      'Montée brutale des admissions (type grippe / virus). Détection, simulation et recommandation d\'ouverture de lits.',
  },
  {
    id: 'pic_saisonnier',
    titre: 'Pic saisonnier hivernal',
    description:
      'Augmentation prévisible des flux en hiver. Anticipation et ajustement des capacités.',
  },
  {
    id: 'greve',
    titre: 'Grève partielle du personnel',
    description:
      'Réduction des effectifs. Simulation de l\'impact et redéploiement recommandé.',
  },
  {
    id: 'canicule',
    titre: 'Canicule / vague de chaleur',
    description:
      'Afflux de patients (déshydratation, malaise). Renfort urgences et plan blanc déclenché.',
  },
  {
    id: 'rupture_stock',
    titre: 'Rupture de stock critique',
    description:
      'Risque de rupture sur un médicament ou consommable. Alerte et réapprovisionnement prioritaire.',
  },
  {
    id: 'saturation_urgences',
    titre: 'Saturation des urgences',
    description:
      "Temps d'attente et taux d'occupation en hausse. Réorientation et ouverture de lits de court séjour.",
  },
  {
    id: 'absentéisme',
    titre: 'Absentéisme massif',
    description:
      'Baisse soudaine des effectifs (maladie, congés). Simulation RH et recommandations de renfort.',
  },
  {
    id: 'evenement_exceptionnel',
    titre: 'Événement exceptionnel',
    description:
      'Accident collectif ou catastrophe. Plan blanc, mobilisation des lits et des équipes.',
  },
]

const CONTEXTE_INITIAL_DEFAULT =
  'Contexte de départ : flux habituels, capacités connues. Données fictives préchargées pour la démo.'

const ETAPES = [
  { id: 1, label: 'Situation initiale', texte: CONTEXTE_INITIAL_DEFAULT },
  {
    id: 2,
    label: 'Détection du problème',
    texte:
      "Le système détecte un dépassement de seuil (ex. taux d'occupation > 85 %). Une alerte est générée.",
  },
  {
    id: 3,
    label: 'Simulation de scénario',
    texte:
      "Un scénario est simulé pour anticiper l'évolution (admissions, occupation, RH). Aucune action réelle.",
  },
  {
    id: 4,
    label: 'Recommandation proposée',
    texte:
      'Le moteur de règles propose une action (ex. ouvrir des lits, redéployer du personnel).',
  },
  {
    id: 5,
    label: 'Décision simulée',
    texte:
      'La décision est simulée avant application : vous voyez l\'impact attendu Avant / Après.',
  },
  {
    id: 6,
    label: 'Impact après décision',
    texte:
      "Résultat après décision : indicateurs améliorés. La démo montre la valeur ajoutée du pilotage.",
  },
]

/** Textes de repli par scénario quand Gemini est indisponible (quota, etc.) — démo reste convaincante */
function getFallbackTextForStep(step, scenarioId, scenarioTitre) {
  const titre = scenarioTitre || 'Scénario'
  const byStep = {
    1: `Contexte initial : flux habituels pour la démo « ${titre} ». Données de référence chargées ; capacités connues. Aucune donnée réelle de patients.`,
    2: `Pour le scénario « ${titre} », le système a détecté un dépassement de seuil (occupation ou tension RH). Une alerte a été générée.`,
    4: `Pour « ${titre} », le moteur de règles recommande une action adaptée : ouverture de lits, redéploiement de personnel ou alerte stocks selon le cas.`,
    6: `Après application de la recommandation pour « ${titre} », les indicateurs s’améliorent : baisse de l’occupation ou hausse de la disponibilité RH. La démo illustre l’intérêt du pilotage.`,
  }
  return byStep[step] || ETAPES.find((e) => e.id === step)?.texte || CONTEXTE_INITIAL_DEFAULT
}

const DONNEES_AVANT_FALLBACK = { occupation: 92, admissions: 120, rh: 68 }

// Même logique que la page Simulation pour générer "Après" à partir de "Avant" et du scénario
const DEMO_PARAMS = { tauxAdmission: 85, personnelDisponible: 90, capaciteLits: 78 }
function computeApresFromAvant(etatInitial, scenarioId) {
  const factor = { epidemie: 1.35, pic_saisonnier: 1.15, greve: 0.72, exceptionnel: 1.5, canicule: 1.2, rupture_stock: 0.95, saturation_urgences: 1.1, absentéisme: 0.75, evenement_exceptionnel: 1.5 }[scenarioId] ?? 1
  const admissionsApres = Math.round(etatInitial.admissions * (DEMO_PARAMS.tauxAdmission / 100) * factor)
  const occupationApres = Math.min(99, Math.round(etatInitial.occupation * (100 / DEMO_PARAMS.capaciteLits) * 0.95))
  const rhApres = Math.round(etatInitial.rh * (DEMO_PARAMS.personnelDisponible / 100))
  return { occupation: occupationApres, admissions: admissionsApres, rh: rhApres }
}

export default function DemoPage() {
  const { dataFromFile, recordCount, donnesAvantFromFile } = useData()
  const dataSummary = hospitalData.hasData() ? hospitalData.getLastNDays(5) : []

  const [scenarioId, setScenarioId] = useState(null)
  const [etape, setEtape] = useState(1)
  const [contexteInitial, setContexteInitial] = useState(CONTEXTE_INITIAL_DEFAULT)
  const [llmTextByStep, setLlmTextByStep] = useState({})
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmIndicators, setLlmIndicators] = useState(null)
  const [llmIndicatorsLoading, setLlmIndicatorsLoading] = useState(false)
  const [llmIndicatorsError, setLlmIndicatorsError] = useState(null)
  const [apiDemoError, setApiDemoError] = useState(null)
  const [apiHealth, setApiHealth] = useState({ status: 'idle', geminiConfigured: false })
  const [indicatorsRefreshTrigger, setIndicatorsRefreshTrigger] = useState(0)
  const indicateursFetchedFor = useRef(null)

  // Données "Avant" = contexte (fichier) > hospitalData.getLatest() (secours) > fallback
  const donnesAvant = useMemo(() => {
    if (donnesAvantFromFile) return donnesAvantFromFile
    const latest = hospitalData.getLatest()
    if (latest) {
      const totalBeds = 1800
      const occupation = totalBeds > 0 ? Math.round((latest.occupiedBeds / totalBeds) * 100) : 0
      const rh = Math.round((latest.availableStaff / 220) * 100)
      return { occupation, admissions: latest.admissions, rh }
    }
    return DONNEES_AVANT_FALLBACK
  }, [donnesAvantFromFile, recordCount, dataFromFile])

  const donnesApres = useMemo(() => {
    if (!scenarioId) return { ...donnesAvant }
    return computeApresFromAvant(donnesAvant, scenarioId)
  }, [donnesAvant, scenarioId])

  const scenario = scenarioId
    ? SCENARIOS_DEMO.find((s) => s.id === scenarioId)
    : null

  // Vérification de l’API au chargement de la page (intégration API)
  useEffect(() => {
    setApiHealth((prev) => ({ ...prev, status: 'loading' }))
    fetch('/api/health')
      .then((r) => r.json().catch(() => ({})))
      .then((d) => {
        if (d?.ok) {
          setApiHealth({ status: d.geminiConfigured ? 'ok' : 'no-key', geminiConfigured: !!d.geminiConfigured })
        } else {
          setApiHealth({ status: 'error', geminiConfigured: false })
        }
      })
      .catch(() => setApiHealth({ status: 'error', geminiConfigured: false }))
  }, [])

  // Mise à jour du contexte initial quand les données fichier sont disponibles
  useEffect(() => {
    if (!donnesAvantFromFile) return
    setContexteInitial(
      `Contexte (données du fichier) : ${donnesAvantFromFile.admissions} admissions, occupation ${donnesAvantFromFile.occupation} %, disponibilité RH ${donnesAvantFromFile.rh} %. Flux habituels, capacités connues.`
    )
  }, [donnesAvantFromFile])

  const fetchLlmStep = async (step) => {
    setLlmLoading(true)
    setApiDemoError(null)
    const fallbackText = getFallbackTextForStep(step, scenarioId, scenario?.titre)
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          scenarioId,
          scenarioLabel: scenario?.titre,
          etatInitial: donnesAvant,
          etatApres: donnesApres,
          dataSummary,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        let msg = data?.error || (res.status === 503 ? 'Clé Gemini manquante. Ajoutez GEMINI_API_KEY dans un fichier .env à la racine.' : `API erreur ${res.status}. Vérifiez que le serveur tourne.`)
        if (msg === 'Erreur Gemini' && data?.detail) {
          const raw = (data.detail || '').toLowerCase()
          if (raw.includes('429') || raw.includes('exhausted') || raw.includes('quota')) {
            msg = 'Quota API Gemini dépassé (trop de requêtes ou limite du jour). Réessayez dans quelques minutes ou demain. La démo continue avec les textes par défaut.'
          } else {
            msg = `Gemini a refusé la requête. ${data.detail.slice(0, 100)}…`
          }
        } else if (msg === 'Erreur Gemini') {
          msg = 'La clé API Gemini est absente, invalide ou le quota est dépassé. Mettez GEMINI_API_KEY dans .env (https://aistudio.google.com/app/apikey) puis relancez npm run start.'
        }
        setApiDemoError(msg)
        // La démo continue : on affiche le texte par défaut pour cette étape
        setLlmTextByStep((p) => ({ ...p, [step]: fallbackText }))
        if (step === 1) setContexteInitial(fallbackText)
        setLlmLoading(false)
        return
      }
      if (data.text) {
        setLlmTextByStep((p) => ({ ...p, [step]: data.text }))
        if (step === 1) setContexteInitial(data.text)
        setApiDemoError(null)
      }
    } catch (err) {
      setApiDemoError('Serveur API injoignable. Lancez "npm run start" (backend + frontend). Si le serveur tourne, ajoutez GEMINI_API_KEY dans .env à la racine.')
      setLlmTextByStep((p) => ({ ...p, [step]: fallbackText }))
      if (step === 1) setContexteInitial(fallbackText)
      setLlmLoading(false)
      return
    }
    setLlmLoading(false)
  }

  useEffect(() => {
    if (!scenario || !etape || ![1, 2, 4, 6].includes(etape)) return
    if (llmTextByStep[etape]) return
    fetchLlmStep(etape)
  }, [etape, scenario?.id])

  // Indicateurs Avant/Après générés ou corrigés par le LLM en temps réel (étape 4+ ; rafraîchissement possible)
  useEffect(() => {
    if (!scenario || etape < 4) {
      if (etape < 4) indicateursFetchedFor.current = null
      setLlmIndicators(null)
      setLlmIndicatorsError(null)
      return
    }
    const key = `${scenario.id}-${etape >= 4}-${indicatorsRefreshTrigger}`
    if (indicateursFetchedFor.current === key) return
    indicateursFetchedFor.current = key
    setLlmIndicatorsLoading(true)
    setLlmIndicators(null)
    setLlmIndicatorsError(null)
    fetch('/api/demo/indicators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioId,
        scenarioLabel: scenario.titre,
        etatInitial: donnesAvant,
        etatApres: donnesApres,
        dataFromFile,
        dataSummary,
      }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) {
          setLlmIndicatorsError(data?.error || (r.status === 503 ? 'Clé Gemini non configurée' : `Erreur ${r.status}`))
          indicateursFetchedFor.current = null
          return { ok: false, data }
        }
        return { ok: true, data }
      })
      .then((result) => {
        if (!result?.ok) return
        const data = result.data
        if (data.avant && data.apres) {
          setLlmIndicators({ avant: data.avant, apres: data.apres, problemDetected: data.problemDetected || null })
          setLlmIndicatorsError(null)
        } else {
          setLlmIndicatorsError(data?.error || 'Réponse LLM invalide.')
          indicateursFetchedFor.current = null
        }
      })
      .catch((err) => {
        setLlmIndicatorsError(err?.message || 'Impossible de joindre l\'API. Lancez npm run start.')
        indicateursFetchedFor.current = null
      })
      .finally(() => setLlmIndicatorsLoading(false))
  }, [etape, scenario?.id, indicatorsRefreshTrigger])

  const handleRafraichirIndicateurs = () => {
    indicateursFetchedFor.current = null
    setLlmIndicators(null)
    setLlmIndicatorsError(null)
    setIndicatorsRefreshTrigger((t) => t + 1)
  }

  const handleChoisirScénario = (id) => {
    setScenarioId(id)
    setEtape(1)
    setLlmTextByStep({})
    setLlmIndicators(null)
    setLlmIndicatorsError(null)
    setApiDemoError(null)
    indicateursFetchedFor.current = null
  }

  const handleEtapeSuivante = () => {
    if (etape < 6) setEtape((e) => e + 1)
  }

  const handleEtapePrecedente = () => {
    if (etape > 1) setEtape((e) => e - 1)
  }

  const handleRejouer = () => {
    setEtape(1)
    indicateursFetchedFor.current = null
  }
  const handleChangerScénario = () => {
    setScenarioId(null)
    setEtape(1)
    setLlmIndicators(null)
    setLlmIndicatorsError(null)
    indicateursFetchedFor.current = null
  }

  const texteEtapeCourante =
    etape === 1
      ? contexteInitial
      : (llmTextByStep[etape] || ETAPES.find((e) => e.id === etape)?.texte)
  const showAvantApres = etape >= 4
  const displayAvant = llmIndicators?.avant ?? donnesAvant
  const displayApres = llmIndicators?.apres ?? donnesApres
  const deltaOccupation = displayApres.occupation - displayAvant.occupation
  const isFallbackValues =
    !llmIndicators &&
    displayAvant.occupation === DONNEES_AVANT_FALLBACK.occupation &&
    displayAvant.admissions === DONNEES_AVANT_FALLBACK.admissions &&
    displayAvant.rh === DONNEES_AVANT_FALLBACK.rh
  const messagePedago =
    llmTextByStep[6] ||
    (deltaOccupation <= 0
      ? `Grâce à la simulation et aux recommandations, la saturation des lits a été réduite de ${-deltaOccupation} %.`
      : `Après décision : occupation des lits à ${displayApres.occupation} % (évolution ${deltaOccupation >= 0 ? '+' : ''}${deltaOccupation} %).`)
  const showMessagePedago = showAvantApres

  return (
    <div className="space-y-6">
      {/* En-tête comme Dashboard / Prévisions / Alertes / Infos */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mode Démo</h1>
        <p className="text-gray-500 mt-1">
          Choisissez un scénario pour lancer une démo guidée. Textes et tableau Avant/Après sont générés par l’API (LLM Gemini).
        </p>
        {/* Statut d’intégration API */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {apiHealth.status === 'loading' && (
            <span className="text-sm text-gray-500">Vérification de l’API…</span>
          )}
          {apiHealth.status === 'ok' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
              ✓ API connectée — Gemini configuré (textes et indicateurs en temps réel)
            </span>
          )}
          {apiHealth.status === 'no-key' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
              ⚠ API connectée — Ajoutez GEMINI_API_KEY dans .env pour la génération LLM
            </span>
          )}
          {apiHealth.status === 'error' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200">
              ✗ API non disponible — Lancez <code className="bg-red-200/50 px-1 rounded">npm run start</code> à la racine du projet
            </span>
          )}
        </div>
        {apiDemoError && (
          <div className="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            {(() => {
              const isQuota = apiDemoError.toLowerCase().includes('quota') || apiDemoError.includes('429')
              return isQuota ? (
                <>
                  <p className="font-semibold">Quota Gemini atteint</p>
                  <p className="mt-1">Les limites gratuites de l’API ont été atteintes. Réessayez dans quelques minutes ou demain. La démo s’affiche avec les textes par défaut en attendant.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Gemini indisponible</p>
                  <p className="mt-1">{apiDemoError}</p>
                  <p className="mt-2 text-xs text-amber-700">
                    Créez un fichier <code className="bg-amber-100 px-1 rounded">.env</code> à la racine avec <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY=votre_cle</code> (<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>), puis relancez <code className="bg-amber-100 px-1 rounded">npm run start</code>.
                  </p>
                </>
              )
            })()}
          </div>
        )}
        {dataFromFile && !apiDemoError && (
          <p className="mt-2 text-sm font-medium text-green-700 bg-green-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200">
            ✓ Données du fichier utilisées — Contexte et recommandations enrichis par le LLM (Gemini)
          </p>
        )}
      </div>

      {!scenario ? (
        /* Sélecteur de scénario — carte comme les autres pages */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Choisir un scénario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCENARIOS_DEMO.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleChoisirScénario(s.id)}
                className="text-left p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all bg-white"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{s.titre}</h3>
                <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                <span className="text-sm font-medium text-blue-600">
                  Lancer la démo →
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Parcours guidé */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Parcours guidé
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Scénario : {scenario.titre}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {ETAPES.map((e) => (
                <span
                  key={e.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    e.id === etape
                      ? 'bg-blue-600 text-white'
                      : e.id < etape
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                      e.id === etape
                        ? 'bg-white/20'
                        : e.id < etape
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {e.id}
                  </span>
                  {e.label}
                </span>
              ))}
            </div>
            {etape === 1 ? (
              <div className="mb-4">
                <label
                  htmlFor="demo-contexte-initial"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contexte initial
                  {llmLoading && etape === 1 && (
                    <span className="ml-2 text-blue-600 font-normal">— Génération en cours par le LLM…</span>
                  )}
                  {llmTextByStep[1] && !llmLoading && (
                    <span className="ml-2 text-green-600 font-normal">— Généré par le LLM (Gemini)</span>
                  )}
                </label>
                <textarea
                  id="demo-contexte-initial"
                  value={contexteInitial}
                  onChange={(e) => setContexteInitial(e.target.value)}
                  placeholder={CONTEXTE_INITIAL_DEFAULT}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>
            ) : (
              texteEtapeCourante && (
                <div className="mb-4">
                  <p className="py-3 px-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-gray-700 text-sm">
                    {texteEtapeCourante}
                  </p>
                  {llmTextByStep[etape] && (
                    <p className="mt-2 text-xs text-blue-600">Analyse LLM (Gemini)</p>
                  )}
                </div>
              )
            )}
            {llmLoading && etape !== 1 && (
              <p className="text-sm text-blue-600 mb-2">Génération de l&apos;analyse LLM…</p>
            )}
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleEtapePrecedente}
                disabled={etape <= 1}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Étape précédente
              </button>
              <button
                type="button"
                onClick={handleEtapeSuivante}
                disabled={etape >= 6}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Étape suivante →
              </button>
            </div>
          </div>

          {/* Avant / Après */}
          {showAvantApres && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Avant / Après décision
              </h2>
              {llmIndicatorsLoading && (
                <p className="text-sm text-blue-600 mb-4">
                  Génération des indicateurs en temps réel par le LLM (Gemini)…
                </p>
              )}
              {llmIndicators && !llmIndicatorsLoading && (
                <p className="text-sm text-green-700 mb-2">
                  Indicateurs générés ou corrigés par le LLM en temps réel pour le scénario « {scenario?.titre} ».
                </p>
              )}
              {llmIndicators?.problemDetected && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <span className="font-medium">Problème détecté par le LLM :</span> {llmIndicators.problemDetected}
                </div>
              )}
              {llmIndicatorsError && !llmIndicatorsLoading && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  <span className="font-medium">Indicateurs LLM :</span> {llmIndicatorsError} Affichage des valeurs calculées.
                </div>
              )}
              {dataFromFile && recordCount > 0 && !llmIndicators && (
                <p className="text-sm text-green-700 mb-4">
                  Données « Avant » = dernier jour du fichier (hospital_data.json). « Après » = modèle de simulation.
                </p>
              )}
              {isFallbackValues && apiHealth.status === 'ok' && !llmIndicatorsLoading && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex flex-wrap items-center gap-3">
                  <span>Valeurs par défaut (92 %, 120, 68 %). Pour des indicateurs générés par le LLM :</span>
                  <button
                    type="button"
                    onClick={handleRafraichirIndicateurs}
                    className="px-3 py-1.5 rounded-lg bg-amber-200 text-amber-900 font-medium text-sm hover:bg-amber-300"
                  >
                    Rafraîchir les indicateurs (LLM)
                  </button>
                </div>
              )}
              {showAvantApres && !isFallbackValues && (
                <p className="mb-2">
                  <button
                    type="button"
                    onClick={handleRafraichirIndicateurs}
                    disabled={llmIndicatorsLoading}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                  >
                    {llmIndicatorsLoading ? 'Génération…' : 'Rafraîchir les indicateurs'}
                  </button>
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                        Indicateur
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                        Avant décision
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                        Après décision
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                        Évolution
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Occupation des lits (%)</td>
                      <td className="py-3 px-4 text-red-600 font-medium">
                        {llmIndicatorsLoading ? '—' : `${displayAvant.occupation} %`}
                      </td>
                      <td className="py-3 px-4 text-green-600 font-medium">
                        {llmIndicatorsLoading ? '—' : `${displayApres.occupation} %`}
                      </td>
                      <td className="py-3 px-4 text-green-600 font-medium">
                        {llmIndicatorsLoading ? '—' : `${displayApres.occupation - displayAvant.occupation} %`}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Admissions (jour)</td>
                      <td className="py-3 px-4">{llmIndicatorsLoading ? '—' : displayAvant.admissions}</td>
                      <td className="py-3 px-4">{llmIndicatorsLoading ? '—' : displayApres.admissions}</td>
                      <td className="py-3 px-4 text-green-600 font-medium">
                        {llmIndicatorsLoading ? '—' : (displayApres.admissions - displayAvant.admissions >= 0 ? '+' : '') + (displayApres.admissions - displayAvant.admissions)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Disponibilité RH (%)</td>
                      <td className="py-3 px-4 text-red-600 font-medium">
                        {llmIndicatorsLoading ? '—' : `${displayAvant.rh} %`}
                      </td>
                      <td className="py-3 px-4 text-green-600 font-medium">
                        {llmIndicatorsLoading ? '—' : `${displayApres.rh} %`}
                      </td>
                      <td className="py-3 px-4 text-green-600 font-medium">
                        {llmIndicatorsLoading ? '—' : `+${displayApres.rh - displayAvant.rh} %`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Message pédagogique */}
          {showMessagePedago && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-medium">{messagePedago}</p>
            </div>
          )}

          {/* Contrôles — même style que les autres pages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRejouer}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50"
            >
              Rejouer la démo
            </button>
            <button
              type="button"
              onClick={handleChangerScénario}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50"
            >
              Changer de scénario
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 font-medium text-sm hover:bg-blue-50"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
