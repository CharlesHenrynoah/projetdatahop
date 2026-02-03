import { useParams, useNavigate, Link } from 'react-router-dom'
import { RECOMMANDATIONS_MOCK } from '../data/recommandations'
import { LABELS_PRIORITE } from '../data/recommandations'
import './ActionDetailPage.css'

export default function ActionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const reco = RECOMMANDATIONS_MOCK.find((r) => r.id === id)

  if (!reco) {
    return (
      <main className="page">
        <p>Recommandation introuvable.</p>
        <Link to="/recommandations">← Retour à la liste</Link>
      </main>
    )
  }

  const { justification, impactEstime } = reco
  const prioriteClass = `action-priorite--${reco.priorite}`

  return (
    <main className="page page--action-detail">
      <div className="page-header">
        <Link to="/recommandations" className="back-link">
          ← Liste des recommandations
        </Link>
      </div>

      <article className="action-card" aria-labelledby="action-title">
        <h1 id="action-title" className="action-title">
          Action recommandée
        </h1>

        <p className="action-proposee">{reco.actionProposee}</p>

        <div className="action-meta">
          <span className={`action-priorite ${prioriteClass}`}>
            Priorité : {LABELS_PRIORITE[reco.priorite]}
          </span>
          <span className="action-service">{reco.service}</span>
        </div>

        {/* 3️⃣ Déclencheur : une ligne clé pour confiance et explicabilité */}
        {reco.declencheur && (
          <div className="action-declencheur" role="status">
            <strong>Déclencheur</strong>
            <p>{reco.declencheur}</p>
          </div>
        )}

        <section className="action-section" aria-labelledby="justification-title">
          <h2 id="justification-title" className="action-section-title">
            Justification
          </h2>
          <ul className="action-justification">
            <li>
              <strong>Règles déclenchées :</strong>{' '}
              {justification.reglesDeclenchees.join(', ')}
            </li>
            <li>
              <strong>Données sources :</strong> {justification.donneesSources}
            </li>
            <li>
              <strong>Seuils franchis :</strong> {justification.seuilsFranchis}
            </li>
          </ul>
        </section>

        <section className="action-section" aria-labelledby="impact-title">
          <h2 id="impact-title" className="action-section-title">
            Impact estimé
          </h2>
          <ul className="action-impact">
            <li>
              <strong>Occupation :</strong> {impactEstime.occupation}
            </li>
            <li>
              <strong>Délais patients :</strong> {impactEstime.delaisPatients}
            </li>
            <li>
              <strong>Charge RH :</strong> {impactEstime.chargeRH}
            </li>
          </ul>
        </section>

        <div className="action-buttons">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/recommandations/${reco.id}/simuler`)}
          >
            Simuler
          </button>
          <button type="button" className="btn btn-success">
            Appliquer
          </button>
          <button type="button" className="btn btn-secondary">
            Reporter
          </button>
          <button type="button" className="btn btn-outline">
            Ignorer (avec raison)
          </button>
        </div>
      </article>
    </main>
  )
}
