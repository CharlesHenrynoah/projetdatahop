import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRecommandations } from '../context/RecommandationsContext'
import {
  ETATS_RECOM,
  PRIORITES,
  TYPES_RECOM,
  LABELS_ETAT,
  LABELS_TYPE,
  LABELS_PRIORITE,
} from '../data/recommandations'

const PRIORITY_STYLES = {
  [PRIORITES.CRITIQUE]: 'text-red-700',
  [PRIORITES.HAUTE]: 'text-orange-700',
  [PRIORITES.MOYENNE]: 'text-yellow-700',
  [PRIORITES.BASSE]: 'text-green-700',
}

const TYPE_BADGE_STYLES = {
  [TYPES_RECOM.LITS]: 'bg-blue-100 text-blue-800',
  [TYPES_RECOM.RH]: 'bg-purple-100 text-purple-800',
  [TYPES_RECOM.STOCKS]: 'bg-amber-100 text-amber-800',
}

export default function RecommandationsListPage() {
  const location = useLocation()
  const simulationContext = location.state?.fromSimulation ? location.state : null
  const { recommandations } = useRecommandations()
  const [filtreType, setFiltreType] = useState('')
  const [flashMessage, setFlashMessage] = useState(null)

  useEffect(() => {
    const msg = location.state?.message
    if (msg) {
      setFlashMessage(msg)
      window.history.replaceState({}, '', location.pathname)
      const t = setTimeout(() => setFlashMessage(null), 4000)
      return () => clearTimeout(t)
    }
  }, [location.state?.message, location.pathname])
  const [filtrePriorite, setFiltrePriorite] = useState('')
  const [filtreService, setFiltreService] = useState('')
  const [filtreEtat, setFiltreEtat] = useState('')

  const signalUrgence = useMemo(() => {
    const counts = {
      [PRIORITES.CRITIQUE]: 0,
      [PRIORITES.HAUTE]: 0,
      [PRIORITES.MOYENNE]: 0,
      [PRIORITES.BASSE]: 0,
    }
    recommandations.forEach((r) => {
      if (counts[r.priorite] !== undefined) counts[r.priorite]++
    })
    return counts
  }, [recommandations])

  const filtrees = useMemo(() => {
    return recommandations.filter((r) => {
      if (filtreType && r.type !== filtreType) return false
      if (filtrePriorite && r.priorite !== filtrePriorite) return false
      if (
        filtreService &&
        !r.service.toLowerCase().includes(filtreService.toLowerCase())
      )
        return false
      if (filtreEtat && r.etat !== filtreEtat) return false
      return true
    })
  }, [
    recommandations,
    filtreType,
    filtrePriorite,
    filtreService,
    filtreEtat,
  ])

  const servicesUniques = useMemo(() => {
    const set = new Set(recommandations.map((r) => r.service))
    return Array.from(set)
  }, [recommandations])

  return (
    <div className="space-y-6">
      {flashMessage && (
        <div className="text-sm font-medium text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-200" role="status">
          ✓ {flashMessage}
        </div>
      )}
      {/* En-tête comme les autres pages */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Recommandations & Décisions
          </h1>
          <p className="text-gray-500 mt-1">
            Recommandations générées par le moteur de règles
          </p>
          {simulationContext && (
            <p className="mt-2 text-sm font-medium text-green-700 bg-green-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200">
              ✓ Connecté à la dernière simulation ({simulationContext.scenarioLabel || simulationContext.scenario})
            </p>
          )}
          {/* Signal d'urgence */}
          <div
            className="flex flex-wrap items-center gap-3 mt-3"
            role="status"
            aria-label="Résumé des priorités"
          >
            {signalUrgence[PRIORITES.CRITIQUE] > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${PRIORITY_STYLES[PRIORITES.CRITIQUE]}`}
              >
                <span aria-hidden>🔴</span>
                {signalUrgence[PRIORITES.CRITIQUE]} critique
              </span>
            )}
            {signalUrgence[PRIORITES.HAUTE] > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${PRIORITY_STYLES[PRIORITES.HAUTE]}`}
              >
                <span aria-hidden>🟠</span>
                {signalUrgence[PRIORITES.HAUTE]} haute
              </span>
            )}
            {signalUrgence[PRIORITES.MOYENNE] > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${PRIORITY_STYLES[PRIORITES.MOYENNE]}`}
              >
                <span aria-hidden>🟡</span>
                {signalUrgence[PRIORITES.MOYENNE]} moyenne
              </span>
            )}
            {signalUrgence[PRIORITES.BASSE] > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${PRIORITY_STYLES[PRIORITES.BASSE]}`}
              >
                <span aria-hidden>🟢</span>
                {signalUrgence[PRIORITES.BASSE]} basse
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/recommandations/nouvelle"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 shrink-0"
          >
            <span aria-hidden>➕</span>
            Créer une recommandation
          </Link>
          <Link
            to="/recommandations/regles"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-600 bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-100 shrink-0"
          >
            <span aria-hidden>⚙️</span>
            Configurer les règles
          </Link>
        </div>
      </div>

      {/* Contexte de la simulation (quand on arrive depuis Simulation de scénarios) */}
      {simulationContext && (simulationContext.results || simulationContext.llmAnalysis) && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Suite à votre simulation
          </h2>
          {simulationContext.scenarioLabel && (
            <p className="text-sm text-gray-600 mb-4">
              Scénario : <strong>{simulationContext.scenarioLabel}</strong>
            </p>
          )}
          {simulationContext.results && simulationContext.etatInitial && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-semibold text-gray-600">Indicateur</th>
                    <th className="text-left py-2 pr-4 font-semibold text-gray-600">Avant</th>
                    <th className="text-left py-2 pr-4 font-semibold text-gray-600">Après</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4">Admissions</td>
                    <td className="py-2 pr-4">{simulationContext.etatInitial.admissions}</td>
                    <td className="py-2 pr-4">{simulationContext.results.admissions?.apres ?? '—'}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4">Occupation des lits (%)</td>
                    <td className="py-2 pr-4">{simulationContext.etatInitial.occupation}</td>
                    <td className="py-2 pr-4">{simulationContext.results.occupation?.apres ?? '—'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Disponibilité RH (%)</td>
                    <td className="py-2 pr-4">{simulationContext.etatInitial.rh}</td>
                    <td className="py-2 pr-4">{simulationContext.results.rh?.apres ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {simulationContext.llmAnalysis && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Analyse LLM (Gemini)</h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{simulationContext.llmAnalysis}</p>
            </div>
          )}
        </div>
      )}

      {/* Filtres — carte blanche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </span>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Tous</option>
              {Object.entries(LABELS_TYPE).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Priorité
            </span>
            <select
              value={filtrePriorite}
              onChange={(e) => setFiltrePriorite(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Toutes</option>
              {Object.entries(LABELS_PRIORITE).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </span>
            <select
              value={filtreService}
              onChange={(e) => setFiltreService(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Tous</option>
              {servicesUniques.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              État
            </span>
            <select
              value={filtreEtat}
              onChange={(e) => setFiltreEtat(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Tous</option>
              {Object.entries(LABELS_ETAT).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Liste des recommandations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Liste ({filtrees.length} recommandation
          {filtrees.length !== 1 ? 's' : ''})
        </h2>
        {filtrees.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">
            Aucune recommandation ne correspond aux filtres.
          </p>
        ) : (
          <ul className="space-y-4">
            {filtrees.map((r) => (
              <li
                key={r.id}
                className={`rounded-xl border p-5 transition-all ${
                  r.etat === ETATS_RECOM.NOUVELLE
                    ? 'border-l-4 border-l-blue-500 bg-blue-50/30 border-gray-200'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          TYPE_BADGE_STYLES[r.type] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {LABELS_TYPE[r.type]}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          r.priorite === PRIORITES.CRITIQUE
                            ? 'bg-red-100 text-red-800'
                            : r.priorite === PRIORITES.HAUTE
                              ? 'bg-orange-100 text-orange-800'
                              : r.priorite === PRIORITES.MOYENNE
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {LABELS_PRIORITE[r.priorite]}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          r.etat === ETATS_RECOM.NOUVELLE
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {r.etat === ETATS_RECOM.NOUVELLE && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                        {LABELS_ETAT[r.etat]}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">
                      {r.actionProposee}
                    </p>
                    {r.declencheur && (
                      <p className="text-sm text-gray-600 mb-2">
                        {r.declencheur}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">{r.service}</p>
                  </div>
                  <Link
                    to={`/recommandations/${r.id}`}
                    className="shrink-0 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Voir détail →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
