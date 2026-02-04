import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecommandations } from '../context/RecommandationsContext'
import { useData } from '../context/DataContext'
import { hospitalData } from '../components/DataGenerator'
import './ImpactSimulationPage.css'

const STOCK_ORDER = ['Critique', 'Tension', 'Stable', 'Confort']
function stockDelta(avant, apres) {
  const iAv = STOCK_ORDER.indexOf(avant)
  const iAp = STOCK_ORDER.indexOf(apres)
  if (iAv < 0 || iAp < 0) return '—'
  if (iAp > iAv) return 'Amélioration'
  if (iAp < iAv) return 'Dégradation'
  return 'Stable'
}

export default function ImpactSimulationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dataFromFile } = useData()
  const { recommandations } = useRecommandations()
  const reco = recommandations.find((r) => r.id === id)

  const [params, setParams] = useState({
    nbLits: 10,
    effectifsDeplaces: 3,
    dureeHeures: 24,
  })
  const [simule, setSimule] = useState(false)
  const [resultats, setResultats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [llmError, setLlmError] = useState(null)

  if (!reco) {
    return (
      <main className="page">
        <p>Recommandation introuvable.</p>
        <Link to="/recommandations">← Retour à la liste</Link>
      </main>
    )
  }

  const handleSimuler = () => {
    setSimule(true)
    setLlmError(null)
    setResultats(null)
    setLoading(true)
    const latest = dataFromFile && hospitalData.hasData() ? hospitalData.getLatest() : null
    const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || ''
    const fullUrl = apiBase ? `${String(apiBase).replace(/\/$/, '')}/api/simulation/impact` : '/api/simulation/impact'
    const fallbackResultats = {
      occupationAvant: 88,
      occupationApres: 84,
      fluxPatientsAvant: 120,
      fluxPatientsApres: 115,
      tensionRHAvant: 72,
      tensionRHApres: 78,
      stocksAvant: 'Critique',
      stocksApres: 'Stable',
    }
    fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionProposee: reco.actionProposee,
        service: reco.service,
        nbLits: params.nbLits,
        effectifsDeplaces: params.effectifsDeplaces,
        dureeHeures: params.dureeHeures,
        latest: latest ? { admissions: latest.admissions, occupiedBeds: latest.occupiedBeds, availableStaff: latest.availableStaff } : undefined,
      }),
    })
      .then((r) => {
        const ct = r.headers.get('content-type') || ''
        if (!ct.includes('application/json')) {
          throw new Error(r.status === 502 || r.status === 503 ? 'Serveur ou proxy indisponible' : `Réponse non-JSON (${r.status})`)
        }
        return r.json()
      })
      .then((data) => {
        if (data.ok && data.occupationAvant != null) {
          setResultats({
            occupationAvant: data.occupationAvant,
            occupationApres: data.occupationApres,
            fluxPatientsAvant: data.fluxPatientsAvant,
            fluxPatientsApres: data.fluxPatientsApres,
            tensionRHAvant: data.tensionRHAvant,
            tensionRHApres: data.tensionRHApres,
            stocksAvant: data.stocksAvant,
            stocksApres: data.stocksApres,
          })
          setLlmError(null)
        } else {
          const detail = data.detail ? ` — ${data.detail}` : ''
          setLlmError((data.error || 'Réponse invalide') + detail)
          setResultats(fallbackResultats)
        }
      })
      .catch((err) => {
        const msg = err?.message || ''
        const isNetwork = msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')
        setLlmError(
          isNetwork || !msg
            ? 'Serveur API injoignable. Lancez « npm run dev » (API + front) ou « npm run server » sur le port 3001.'
            : msg
        )
        setResultats(fallbackResultats)
      })
      .finally(() => setLoading(false))
  }

  return (
    <main className="page page--impact">
      <div className="page-header">
        <Link to={`/recommandations/${id}`} className="back-link">
          ← Retour à l'action recommandée
        </Link>
      </div>

      <h1 className="impact-title">Simulation d'impact</h1>
      <p className="impact-subtitle">
        Tester la décision avant de l'appliquer
      </p>

      <section className="impact-rappel" aria-label="Action sélectionnée">
        <h2 className="impact-section-title">Action sélectionnée</h2>
        <p className="impact-action">{reco.actionProposee}</p>
        <p className="impact-service">{reco.service}</p>
      </section>

      <div className="impact-grid">
        <section className="impact-params" aria-label="Paramètres ajustables">
          <h2 className="impact-section-title">Paramètres</h2>
          <div className="impact-param">
            <label className="impact-param-label">Nombre de lits</label>
            <input
              type="number"
              min={1}
              max={50}
              value={params.nbLits}
              onChange={(e) => setParams((p) => ({ ...p, nbLits: Number(e.target.value) }))}
              className="impact-param-input"
            />
          </div>
          <div className="impact-param">
            <label className="impact-param-label">Effectifs déplacés</label>
            <input
              type="number"
              min={0}
              max={20}
              value={params.effectifsDeplaces}
              onChange={(e) => setParams((p) => ({ ...p, effectifsDeplaces: Number(e.target.value) }))}
              className="impact-param-input"
            />
          </div>
          <div className="impact-param">
            <label className="impact-param-label">Durée (heures)</label>
            <input
              type="number"
              min={1}
              max={168}
              value={params.dureeHeures}
              onChange={(e) => setParams((p) => ({ ...p, dureeHeures: Number(e.target.value) }))}
              className="impact-param-input"
            />
          </div>
          <button
            type="button"
            className="btn btn-primary impact-btn-simuler"
            onClick={handleSimuler}
            disabled={loading}
          >
            {loading ? 'Simulation en cours…' : 'Lancer la simulation'}
          </button>
        </section>

        <section className="impact-resultats" aria-label="Résultats simulés">
          <h2 className="impact-section-title">Résultats simulés</h2>
          {!simule ? (
            <p className="impact-placeholder">
              Ajustez les paramètres et lancez la simulation pour afficher les résultats.
            </p>
          ) : loading ? (
            <p className="impact-placeholder" style={{ color: 'var(--color-primary, #2563eb)' }}>
              Génération par l&apos;IA (Gemini)…
            </p>
          ) : resultats ? (
            <>
              {llmError && (
                <p className="impact-llm-error" role="alert">
                  {llmError} — Affichage des valeurs de démonstration.
                </p>
              )}
              {!llmError && (
                <p className="impact-llm-ok">
                  Résultats simulés par l&apos;IA (Gemini).
                </p>
              )}
              <div className="impact-avant-apres">
                <table className="impact-table">
                  <thead>
                    <tr>
                      <th scope="col">Indicateur</th>
                      <th scope="col">Avant</th>
                      <th scope="col">Après</th>
                      <th scope="col">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Taux d&apos;occupation (%)</td>
                      <td>{resultats.occupationAvant}</td>
                      <td className="impact-apres">{resultats.occupationApres}</td>
                      <td className={`impact-delta ${resultats.occupationApres - resultats.occupationAvant <= 0 ? 'impact-delta--positif' : 'impact-delta--negatif'}`}>
                        {resultats.occupationApres - resultats.occupationAvant} %
                      </td>
                    </tr>
                    <tr>
                      <td>Flux patients (/jour)</td>
                      <td>{resultats.fluxPatientsAvant}</td>
                      <td>{resultats.fluxPatientsApres}</td>
                      <td className={`impact-delta ${resultats.fluxPatientsApres - resultats.fluxPatientsAvant <= 0 ? 'impact-delta--positif' : 'impact-delta--negatif'}`}>
                        {resultats.fluxPatientsApres - resultats.fluxPatientsAvant}
                      </td>
                    </tr>
                    <tr>
                      <td>Tension RH (%)</td>
                      <td>{resultats.tensionRHAvant}</td>
                      <td className="impact-apres">{resultats.tensionRHApres}</td>
                      <td className={`impact-delta ${resultats.tensionRHApres - resultats.tensionRHAvant >= 0 ? 'impact-delta--positif' : 'impact-delta--negatif'}`}>
                        {resultats.tensionRHApres - resultats.tensionRHAvant >= 0 ? '+' : ''}{resultats.tensionRHApres - resultats.tensionRHAvant} %
                      </td>
                    </tr>
                    <tr>
                      <td>Stocks</td>
                      <td>{resultats.stocksAvant}</td>
                      <td>{resultats.stocksApres}</td>
                      <td className={`impact-delta ${stockDelta(resultats.stocksAvant, resultats.stocksApres) === 'Amélioration' ? 'impact-delta--positif' : stockDelta(resultats.stocksAvant, resultats.stocksApres) === 'Dégradation' ? 'impact-delta--negatif' : ''}`}>
                        {stockDelta(resultats.stocksAvant, resultats.stocksApres)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="impact-kpi-hint">
                Courbes d&apos;évolution et KPI détaillés — à brancher sur vos données temps réel.
              </p>
              <div className="impact-actions">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => navigate('/recommandations')}
                >
                  Appliquer cette décision
                </button>
                <Link to={`/recommandations/${id}`} className="btn btn-secondary">
                  Retour au détail
                </Link>
              </div>
            </>
          ) : (
            <p className="impact-placeholder">
              Aucun résultat — réessayez ou vérifiez que le serveur et Gemini sont connectés.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
