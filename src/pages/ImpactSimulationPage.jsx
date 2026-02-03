import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { RECOMMANDATIONS_MOCK } from '../data/recommandations'
import './ImpactSimulationPage.css'

export default function ImpactSimulationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const reco = RECOMMANDATIONS_MOCK.find((r) => r.id === id)

  const [params, setParams] = useState({
    nbLits: 10,
    effectifsDeplaces: 3,
    dureeHeures: 24,
  })
  const [simule, setSimule] = useState(false)

  if (!reco) {
    return (
      <main className="page">
        <p>Recommandation introuvable.</p>
        <Link to="/recommandations">← Retour à la liste</Link>
      </main>
    )
  }

  const handleSimuler = () => setSimule(true)

  const resultatsMock = simule
    ? {
        occupationAvant: 88,
        occupationApres: 84,
        fluxPatientsAvant: 120,
        fluxPatientsApres: 115,
        tensionRHAvant: 72,
        tensionRHApres: 78,
        stocksAvant: 'Critique',
        stocksApres: 'Stable',
      }
    : null

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
          >
            Lancer la simulation
          </button>
        </section>

        <section className="impact-resultats" aria-label="Résultats simulés">
          <h2 className="impact-section-title">Résultats simulés</h2>
          {!simule ? (
            <p className="impact-placeholder">
              Ajustez les paramètres et lancez la simulation pour afficher les résultats.
            </p>
          ) : (
            <>
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
                      <td>Taux d'occupation (%)</td>
                      <td>{resultatsMock.occupationAvant}</td>
                      <td className="impact-apres">{resultatsMock.occupationApres}</td>
                      <td className="impact-delta impact-delta--positif">
                        {resultatsMock.occupationApres - resultatsMock.occupationAvant} %
                      </td>
                    </tr>
                    <tr>
                      <td>Flux patients (/jour)</td>
                      <td>{resultatsMock.fluxPatientsAvant}</td>
                      <td>{resultatsMock.fluxPatientsApres}</td>
                      <td className="impact-delta impact-delta--negatif">
                        {resultatsMock.fluxPatientsApres - resultatsMock.fluxPatientsAvant}
                      </td>
                    </tr>
                    <tr>
                      <td>Tension RH (%)</td>
                      <td>{resultatsMock.tensionRHAvant}</td>
                      <td className="impact-apres">{resultatsMock.tensionRHApres}</td>
                      <td className="impact-delta impact-delta--positif">
                        +{resultatsMock.tensionRHApres - resultatsMock.tensionRHAvant} %
                      </td>
                    </tr>
                    <tr>
                      <td>Stocks</td>
                      <td>{resultatsMock.stocksAvant}</td>
                      <td>{resultatsMock.stocksApres}</td>
                      <td className="impact-delta impact-delta--positif">Amélioration</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="impact-kpi-hint">
                Courbes d'évolution et KPI détaillés — à brancher sur vos données temps réel.
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
          )}
        </section>
      </div>
    </main>
  )
}
