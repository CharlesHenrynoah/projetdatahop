const ROWS_CONFIG = [
  { key: 'admissions', label: 'Admissions' },
  { key: 'occupation', label: 'Occupation des lits' },
  { key: 'rh', label: 'Disponibilité RH' },
]

const LEGENDE_SEUILS = [
  { color: 'var(--color-vert)', label: 'Maîtrisé', seuil: '≤ 70 %' },
  { color: 'var(--color-orange)', label: 'Tension', seuil: '71–85 %' },
  { color: 'var(--color-rouge)', label: 'Saturation', seuil: '> 85 %' },
]

function formatTimestamp(date) {
  if (!date) return ''
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function Zone3Resultats({
  results,
  hasSimulated,
  getStatusColor,
  etatInitial,
  simulationTimestamp,
  llmAnalysis,
  llmLoading,
  llmIndicatorsUsed,
  onVoirActionsRecommandees,
}) {
  const etat = etatInitial ?? { admissions: 100, occupation: 82, rh: 88 }

  // Avant : priorité aux résultats (Gemini peut générer avant + après), sinon état initial
  const getAvant = (key) => {
    if (results && hasSimulated && results[key]?.avant != null) return results[key].avant
    return etat[key] ?? '—'
  }
  const getApres = (key) => (results && hasSimulated ? results[key]?.apres : null)
  const getDelta = (key) => {
    if (!results || !hasSimulated) return null
    const { avant, apres } = results[key]
    if (avant == null || apres == null) return null
    const delta = apres - avant
    const pct = avant === 0 ? 0 : Math.round((delta / avant) * 100)
    return { delta, pct }
  }

  return (
    <section
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 overflow-x-auto ${hasSimulated ? 'animate-zone3-fade-in' : ''}`}
      aria-label="Résultats et comparaison avant après"
    >
      <h2 className="text-lg font-semibold text-gray-800 mt-0 mb-2">
        Impact de la simulation
      </h2>
      {llmIndicatorsUsed && (
        <p className="text-xs font-medium text-green-700 mb-2">
          Chiffres Avant / Après générés par Gemini (LLM)
        </p>
      )}
      <p className="text-sm font-semibold text-gray-600 mb-3">
        Situation actuelle (avant simulation)
      </p>
      <div className="min-w-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className="text-left py-2.5 px-3 font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
                Indicateur
              </th>
              <th scope="col" className="text-left py-2.5 px-3 font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
                Avant
              </th>
              <th scope="col" className="text-left py-2.5 px-3 font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
                Après
              </th>
              <th scope="col" className="text-left py-2.5 px-3 font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
                Delta
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS_CONFIG.map(({ key, label }) => {
              const apres = getApres(key)
              const deltaInfo = getDelta(key)
              const color = apres !== null ? getStatusColor(apres) : null
              return (
                <tr key={key}>
                  <td className="py-2.5 px-3 text-gray-800 border-b border-gray-100">{label}</td>
                  <td className="py-2.5 px-3 text-gray-800 border-b border-gray-100">{getAvant(key)}</td>
                  <td className="py-2.5 px-3 border-b border-gray-100" style={color ? { color } : undefined}>
                    {apres !== null ? apres : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-semibold border-b border-gray-100">
                    {deltaInfo ? (
                      <span
                        style={{
                          color: deltaInfo.delta >= 0 ? 'var(--color-rouge)' : 'var(--color-vert)',
                        }}
                      >
                        {deltaInfo.delta >= 0 ? '+' : ''}
                        {deltaInfo.delta} ({deltaInfo.pct >= 0 ? '+' : ''}
                        {deltaInfo.pct} %)
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
        {LEGENDE_SEUILS.map(({ color, label, seuil }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span className="font-bold" style={{ color }} aria-hidden>●</span>
            <span>{label}</span>
            <span className="text-gray-500 text-[0.75rem]">({seuil})</span>
          </span>
        ))}
      </div>
      {hasSimulated && (
        <div className="mt-4 inline-flex items-center gap-3 py-2 px-3 bg-green-50 border border-green-200 rounded-lg" role="status">
          <span className="text-sm font-semibold text-green-800">Simulation exécutée</span>
          {simulationTimestamp && (
            <span className="text-xs text-green-700">{formatTimestamp(simulationTimestamp)}</span>
          )}
        </div>
      )}
      {hasSimulated && (llmLoading || llmAnalysis) && (
        <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            Analyse LLM (Gemini)
          </h3>
          {llmLoading && !llmAnalysis && (
            <p className="text-sm text-blue-700">Chargement de l&apos;analyse…</p>
          )}
          {llmAnalysis && (
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{llmAnalysis}</p>
          )}
        </div>
      )}
      {hasSimulated && (
        <div className="mt-4">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 active:scale-[0.98] transition-all"
            onClick={onVoirActionsRecommandees}
          >
            Voir actions recommandées
          </button>
        </div>
      )}
    </section>
  )
}
