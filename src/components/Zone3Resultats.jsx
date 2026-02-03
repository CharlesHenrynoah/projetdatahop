import './Zone3Resultats.css'

const ROWS_CONFIG = [
  { key: 'admissions', label: 'Admissions' },
  { key: 'occupation', label: 'Occupation des lits' },
  { key: 'rh', label: 'Disponibilité RH' },
]

/** Légende avec seuils explicites */
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
  onVoirActionsRecommandees,
}) {
  const etat = etatInitial ?? { admissions: 100, occupation: 82, rh: 88 }

  const getAvant = (key) => etat[key] ?? '—'
  const getApres = (key) => (results && hasSimulated ? results[key]?.apres : null)
  const getDelta = (key) => {
    if (!results || !hasSimulated) return null
    const { avant, apres } = results[key]
    const delta = apres - avant
    const pct = avant === 0 ? 0 : Math.round((delta / avant) * 100)
    return { delta, pct }
  }

  return (
    <section className="zone3-resultats" aria-label="Résultats et comparaison avant après">
      <h2 className="zone3-title">Impact de la simulation</h2>

      {/* 1️⃣ Indication explicite de l'état "Avant simulation" */}
      <p className="zone3-label-avant">Situation actuelle (avant simulation)</p>

      {/* 2️⃣ Structure toujours visible : Indicateur | Avant | Après | Delta (placeholders si pas encore simulé) */}
      <div className={`zone3-table-wrap ${hasSimulated ? 'zone3-table-wrap--animated' : ''}`}>
        <table className="zone3-table">
          <thead>
            <tr>
              <th scope="col">Indicateur</th>
              <th scope="col">Avant</th>
              <th scope="col">Après</th>
              <th scope="col">Delta</th>
            </tr>
          </thead>
          <tbody>
            {ROWS_CONFIG.map(({ key, label }) => {
              const apres = getApres(key)
              const deltaInfo = getDelta(key)
              const color = apres !== null ? getStatusColor(apres) : null
              return (
                <tr key={key}>
                  <td>{label}</td>
                  <td>{getAvant(key)}</td>
                  <td style={color ? { color } : undefined}>
                    {apres !== null ? apres : '—'}
                  </td>
                  <td className="zone3-delta">
                    {deltaInfo ? (
                      <span
                        style={{
                          color:
                            deltaInfo.delta >= 0 ? 'var(--color-rouge)' : 'var(--color-vert)',
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

      {/* 3️⃣ Légende avec seuils explicites */}
      <div className="zone3-legend">
        {LEGENDE_SEUILS.map(({ color, label, seuil }) => (
          <span key={label} className="zone3-legend-item">
            <span className="zone3-legend-dot" style={{ color }} aria-hidden>●</span>
            <span style={{ color: '#4a5568' }}>{label}</span>
            <span className="zone3-legend-seuil">({seuil})</span>
          </span>
        ))}
      </div>

      {/* 5️⃣ Feedback visuel post-simulation */}
      {hasSimulated && (
        <div className="zone3-feedback" role="status">
          <span className="zone3-feedback-text">Simulation exécutée</span>
          {simulationTimestamp && (
            <span className="zone3-feedback-time">
              {formatTimestamp(simulationTimestamp)}
            </span>
          )}
        </div>
      )}

      {/* 4️⃣ Lien explicite vers la décision */}
      {hasSimulated && (
        <div className="zone3-actions">
          <button
            type="button"
            className="zone3-btn-actions"
            onClick={onVoirActionsRecommandees}
          >
            Voir actions recommandées
          </button>
        </div>
      )}
    </section>
  )
}
