import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRecommandations } from '../context/RecommandationsContext'
import { LABELS_PRIORITE, ETATS_RECOM } from '../data/recommandations'
import './ActionDetailPage.css'

export default function ActionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recommandations, setRecommandations } = useRecommandations()
  const reco = recommandations.find((r) => r.id === id)
  const [messageReporter, setMessageReporter] = useState(null)
  const [appliquerModalOpen, setAppliquerModalOpen] = useState(false)
  const [reporterModalOpen, setReporterModalOpen] = useState(false)

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

  const openAppliquerModal = () => setAppliquerModalOpen(true)
  const closeAppliquerModal = () => setAppliquerModalOpen(false)

  const confirmAppliquer = () => {
    setRecommandations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, etat: ETATS_RECOM.APPLIQUEE } : r))
    )
    setAppliquerModalOpen(false)
    navigate('/recommandations', { state: { message: 'Action appliquée.' } })
  }

  const openReporterModal = () => setReporterModalOpen(true)
  const closeReporterModal = () => setReporterModalOpen(false)

  const confirmReporter = () => {
    setRecommandations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, etat: ETATS_RECOM.REPORTEE } : r))
    )
    setReporterModalOpen(false)
    setMessageReporter('Action reportée. Vous restez sur cette page.')
  }

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

        {messageReporter && (
          <div className="action-message action-message--success" role="status">
            ✓ {messageReporter}
          </div>
        )}

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
          <button type="button" className="btn btn-success" onClick={openAppliquerModal}>
            Appliquer
          </button>
          <button type="button" className="btn btn-secondary" onClick={openReporterModal}>
            Reporter
          </button>
          <button type="button" className="btn btn-outline">
            Ignorer (avec raison)
          </button>
        </div>
      </article>

      {/* Modal de confirmation Appliquer */}
      {appliquerModalOpen && (
        <div
          className="action-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="appliquer-modal-title"
          onClick={closeAppliquerModal}
        >
          <div
            className="action-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="appliquer-modal-title" className="action-modal-title">
              Confirmer l&apos;application
            </h2>
            <p className="action-modal-text">
              Vous êtes sur le point d&apos;appliquer l&apos;action : <strong>{reco.actionProposee}</strong>. Cette action sera marquée comme « Appliquée » et vous serez redirigé vers la liste.
            </p>
            <div className="action-modal-buttons">
              <button type="button" className="btn btn-outline" onClick={closeAppliquerModal}>
                Annuler
              </button>
              <button type="button" className="btn btn-success" onClick={confirmAppliquer}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation Reporter */}
      {reporterModalOpen && (
        <div
          className="action-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reporter-modal-title"
          onClick={closeReporterModal}
        >
          <div
            className="action-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="reporter-modal-title" className="action-modal-title">
              Confirmer le report
            </h2>
            <p className="action-modal-text">
              Vous êtes sur le point de reporter l&apos;action : <strong>{reco.actionProposee}</strong>. Elle sera marquée comme « Reportée » et vous resterez sur cette page.
            </p>
            <div className="action-modal-buttons">
              <button type="button" className="btn btn-outline" onClick={closeReporterModal}>
                Annuler
              </button>
              <button type="button" className="btn btn-secondary" onClick={confirmReporter}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
