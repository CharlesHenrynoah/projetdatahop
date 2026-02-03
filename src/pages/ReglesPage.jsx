import { useState } from 'react'
import { Link } from 'react-router-dom'
import { REGLES_MOCK } from '../data/recommandations'
import './ReglesPage.css'

export default function ReglesPage() {
  const [regles, setRegles] = useState(REGLES_MOCK)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const toggleRegle = (id) => {
    setRegles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    )
  }

  const handleCreerModifier = (id = null) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const handleFermerForm = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  return (
    <main className="page page--regles">
      <div className="page-header">
        <h1 className="page-title">Moteur de règles</h1>
        <p className="page-subtitle">
          Définir les règles qui déclenchent des recommandations
        </p>
        <div className="page-actions">
          <Link to="/recommandations" className="btn btn-secondary">
            ← Liste des recommandations
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleCreerModifier()}
          >
            Créer / Modifier une règle
          </button>
        </div>
      </div>

      <section className="regles-list" aria-label="Liste des règles">
        <h2 className="regles-list-title">Règles existantes</h2>
        <ul className="regles-cards">
          {regles.map((r) => (
            <li key={r.id} className={`regle-card ${!r.active ? 'regle-card--inactive' : ''}`}>
              <div className="regle-card-header">
                <span className="regle-card-nom">{r.nom}</span>
                <label className="regle-toggle">
                  <input
                    type="checkbox"
                    checked={r.active}
                    onChange={() => toggleRegle(r.id)}
                    aria-label={`Activer / désactiver la règle ${r.nom}`}
                  />
                  <span className="regle-toggle-slider" />
                </label>
              </div>
              <div className="regle-card-body">
                <div className="regle-block">
                  <strong>Condition</strong>
                  <p>
                    {r.condition.type} {r.condition.operateur} {r.condition.seuil} {r.condition.unite}
                  </p>
                </div>
                <div className="regle-block">
                  <strong>Contexte</strong>
                  <p>
                    {r.contexte.typeJour} — {r.contexte.scope}
                  </p>
                </div>
                <div className="regle-block">
                  <strong>Action</strong>
                  <p>{r.action.libelle} ({r.action.type})</p>
                </div>
              </div>
              <button
                type="button"
                className="regle-card-edit"
                onClick={() => handleCreerModifier(r.id)}
              >
                Modifier
              </button>
            </li>
          ))}
        </ul>
      </section>

      {formOpen && (
        <aside className="regle-form-overlay" role="dialog" aria-modal="true" aria-labelledby="regle-form-title">
          <div className="regle-form-panel">
            <h2 id="regle-form-title">
              {editingId ? 'Modifier la règle' : 'Créer une règle'}
            </h2>
            <div className="regle-form-placeholder">
              <p>Formulaire : conditions, seuils, période, contexte (type de jour, service/pôle/global), action associée.</p>
              <p className="regle-form-hint">Écran orienté admin / expert — à brancher sur votre backend.</p>
            </div>
            <div className="regle-form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleFermerForm}>
                Annuler
              </button>
              <button type="button" className="btn btn-primary" onClick={handleFermerForm}>
                Enregistrer
              </button>
            </div>
          </div>
        </aside>
      )}
    </main>
  )
}
