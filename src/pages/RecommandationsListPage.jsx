import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  RECOMMANDATIONS_MOCK,
  ETATS_RECOM,
  PRIORITES,
  LABELS_ETAT,
  LABELS_TYPE,
  LABELS_PRIORITE,
} from '../data/recommandations'
import './RecommandationsListPage.css'

export default function RecommandationsListPage() {
  const [recommandations] = useState(RECOMMANDATIONS_MOCK)
  const [filtreType, setFiltreType] = useState('')
  const [filtrePriorite, setFiltrePriorite] = useState('')
  const [filtreService, setFiltreService] = useState('')
  const [filtreEtat, setFiltreEtat] = useState('')

  /** 1️⃣ Signal d'urgence globale : comptes par priorité (toutes les reco, pas filtrées) */
  const signalUrgence = useMemo(() => {
    const counts = { [PRIORITES.CRITIQUE]: 0, [PRIORITES.HAUTE]: 0, [PRIORITES.MOYENNE]: 0, [PRIORITES.BASSE]: 0 }
    recommandations.forEach((r) => {
      if (counts[r.priorite] !== undefined) counts[r.priorite]++
    })
    return counts
  }, [recommandations])

  const filtrees = useMemo(() => {
    return recommandations.filter((r) => {
      if (filtreType && r.type !== filtreType) return false
      if (filtrePriorite && r.priorite !== filtrePriorite) return false
      if (filtreService && !r.service.toLowerCase().includes(filtreService.toLowerCase())) return false
      if (filtreEtat && r.etat !== filtreEtat) return false
      return true
    })
  }, [recommandations, filtreType, filtrePriorite, filtreService, filtreEtat])

  const servicesUniques = useMemo(() => {
    const set = new Set(recommandations.map((r) => r.service))
    return Array.from(set)
  }, [recommandations])

  return (
    <main className="page page--recommandations">
      <div className="page-header">
        <h1 className="page-title">Recommandations & Décisions</h1>
        <p className="page-subtitle">
          Recommandations générées par le moteur de règles
        </p>
        {/* 1️⃣ Signal d'urgence globale */}
        <div className="signal-urgence" role="status" aria-label="Résumé des priorités">
          {signalUrgence[PRIORITES.CRITIQUE] > 0 && (
            <span className="signal-item signal-item--critique">
              <span className="signal-dot" aria-hidden>🔴</span>
              {signalUrgence[PRIORITES.CRITIQUE]} critique
            </span>
          )}
          {signalUrgence[PRIORITES.HAUTE] > 0 && (
            <span className="signal-item signal-item--haute">
              <span className="signal-dot" aria-hidden>🟠</span>
              {signalUrgence[PRIORITES.HAUTE]} haute
            </span>
          )}
          {signalUrgence[PRIORITES.MOYENNE] > 0 && (
            <span className="signal-item signal-item--moyenne">
              <span className="signal-dot" aria-hidden>🟡</span>
              {signalUrgence[PRIORITES.MOYENNE]} moyenne
            </span>
          )}
          {signalUrgence[PRIORITES.BASSE] > 0 && (
            <span className="signal-item signal-item--basse">
              <span className="signal-dot" aria-hidden>🟢</span>
              {signalUrgence[PRIORITES.BASSE]} basse
            </span>
          )}
        </div>
        {/* 2️⃣ Bouton config règles : plus visible, levier système */}
        <div className="page-actions">
          <Link to="/recommandations/regles" className="btn btn-config">
            <span className="btn-config-icon" aria-hidden>⚙️</span>
            Configurer les règles
          </Link>
        </div>
      </div>

      <section className="filtres" aria-label="Filtres">
        <h2 className="filtres-title">Filtres</h2>
        <div className="filtres-row">
          <label className="filtre-group">
            <span className="filtre-label">Type</span>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="filtre-select"
            >
              <option value="">Tous</option>
              {Object.entries(LABELS_TYPE).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="filtre-group">
            <span className="filtre-label">Priorité</span>
            <select
              value={filtrePriorite}
              onChange={(e) => setFiltrePriorite(e.target.value)}
              className="filtre-select"
            >
              <option value="">Toutes</option>
              {Object.entries(LABELS_PRIORITE).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="filtre-group">
            <span className="filtre-label">Service</span>
            <select
              value={filtreService}
              onChange={(e) => setFiltreService(e.target.value)}
              className="filtre-select"
            >
              <option value="">Tous</option>
              {servicesUniques.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="filtre-group">
            <span className="filtre-label">État</span>
            <select
              value={filtreEtat}
              onChange={(e) => setFiltreEtat(e.target.value)}
              className="filtre-select"
            >
              <option value="">Tous</option>
              {Object.entries(LABELS_ETAT).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="recommandations-list" aria-label="Liste des recommandations">
        <h2 className="recommandations-list-title">
          Liste ({filtrees.length} recommandation{filtrees.length !== 1 ? 's' : ''})
        </h2>
        <ul className="recommandations-cards">
          {filtrees.map((r) => (
            <li
              key={r.id}
              className={`reco-card reco-card--etat-${r.etat} ${r.etat === ETATS_RECOM.NOUVELLE ? 'reco-card--nouvelle' : ''} ${r.etat === ETATS_RECOM.VUE ? 'reco-card--vue' : ''}`}
            >
              <div className="reco-card-badges">
                <span className={`reco-badge reco-badge--type-${r.type}`}>
                  {LABELS_TYPE[r.type]}
                </span>
                <span className={`reco-badge reco-badge--priorite-${r.priorite}`}>
                  {LABELS_PRIORITE[r.priorite]}
                </span>
                <span className={`reco-badge reco-badge--etat reco-badge--etat-${r.etat}`}>
                  {r.etat === ETATS_RECOM.NOUVELLE && <span className="reco-badge-point" aria-hidden />}
                  {LABELS_ETAT[r.etat]}
                </span>
              </div>
              <p className="reco-card-action">{r.actionProposee}</p>
              {r.declencheur && (
                <p className="reco-card-declencheur">{r.declencheur}</p>
              )}
              <p className="reco-card-service">{r.service}</p>
              <Link to={`/recommandations/${r.id}`} className="reco-card-link">
                Voir détail →
              </Link>
            </li>
          ))}
        </ul>
        {filtrees.length === 0 && (
          <p className="recommandations-empty">Aucune recommandation ne correspond aux filtres.</p>
        )}
      </section>
    </main>
  )
}
