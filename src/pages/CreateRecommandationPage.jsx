import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecommandations } from '../context/RecommandationsContext'
import {
  ETATS_RECOM,
  PRIORITES,
  TYPES_RECOM,
  REGLES_MOCK,
  SERVICES_OPTIONS,
  ACTIONS_PROPOSEES_OPTIONS,
  DECLENCHEURS_OPTIONS,
  DONNEES_SOURCES_OPTIONS,
  SEUILS_FRANCHIS_OPTIONS,
  IMPACT_OCCUPATION_OPTIONS,
  IMPACT_DELAIS_OPTIONS,
  IMPACT_CHARGE_RH_OPTIONS,
} from '../data/recommandations'
import './CreateRecommandationPage.css'

const emptyForm = () => ({
  service: '',
  type: TYPES_RECOM.LITS,
  priorite: PRIORITES.MOYENNE,
  etat: ETATS_RECOM.NOUVELLE,
  actionProposee: '',
  declencheur: '',
  reglesDeclenchees: '',
  donneesSources: '',
  seuilsFranchis: '',
  impactOccupation: '',
  impactDelaisPatients: '',
  impactChargeRH: '',
  regleId: REGLES_MOCK[0]?.id || 'r1',
})

export default function CreateRecommandationPage() {
  const navigate = useNavigate()
  const { recommandations, setRecommandations } = useRecommandations()
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState(null)

  const handleChange = (field, value) => {
    setError(null)
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const actionProposee = (form.actionProposee || '').trim()
    const service = (form.service || '').trim()
    if (!actionProposee) {
      setError("L'action proposée est obligatoire.")
      return
    }
    if (!service) {
      setError('Le service est obligatoire.')
      return
    }

    const reglesDeclenchees = form.reglesDeclenchees
      ? form.reglesDeclenchees.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const newId = 'rec' + (recommandations.length + 1) + '-' + Date.now().toString(36)
    const newReco = {
      id: newId,
      type: form.type,
      priorite: form.priorite,
      etat: form.etat,
      service,
      actionProposee,
      declencheur: (form.declencheur || '').trim() || '—',
      justification: {
        reglesDeclenchees: reglesDeclenchees.length ? reglesDeclenchees : ['—'],
        donneesSources: (form.donneesSources || '').trim() || '—',
        seuilsFranchis: (form.seuilsFranchis || '').trim() || '—',
      },
      impactEstime: {
        occupation: (form.impactOccupation || '').trim() || '—',
        delaisPatients: (form.impactDelaisPatients || '').trim() || '—',
        chargeRH: (form.impactChargeRH || '').trim() || '—',
      },
      regleId: form.regleId,
    }

    setRecommandations((prev) => [...prev, newReco])
    navigate('/recommandations', { state: { message: 'Recommandation créée.' } })
  }

  return (
    <main className="page page--create-reco">
      <div className="page-header">
        <Link to="/recommandations" className="back-link">
          ← Liste des recommandations
        </Link>
      </div>

      <h1 className="create-reco-title">Créer une recommandation</h1>
      <p className="create-reco-subtitle">
        Renseignez les champs pour ajouter une nouvelle recommandation à la liste.
      </p>

      {error && (
        <div className="create-reco-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-reco-form">
        <section className="create-reco-section">
          <h2 className="create-reco-section-title">Identification</h2>
          <div className="create-reco-grid">
            <div className="create-reco-field">
              <label className="create-reco-label">Service *</label>
              <select
                value={form.service}
                onChange={(e) => handleChange('service', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir un service —</option>
                {SERVICES_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="create-reco-field">
              <label className="create-reco-label">Type</label>
              <select
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="create-reco-input"
              >
                <option value={TYPES_RECOM.LITS}>Lits</option>
                <option value={TYPES_RECOM.RH}>RH</option>
                <option value={TYPES_RECOM.STOCKS}>Stocks</option>
              </select>
            </div>
            <div className="create-reco-field">
              <label className="create-reco-label">Priorité</label>
              <select
                value={form.priorite}
                onChange={(e) => handleChange('priorite', e.target.value)}
                className="create-reco-input"
              >
                <option value={PRIORITES.CRITIQUE}>Critique</option>
                <option value={PRIORITES.HAUTE}>Haute</option>
                <option value={PRIORITES.MOYENNE}>Moyenne</option>
                <option value={PRIORITES.BASSE}>Basse</option>
              </select>
            </div>
            <div className="create-reco-field">
              <label className="create-reco-label">État initial</label>
              <select
                value={form.etat}
                onChange={(e) => handleChange('etat', e.target.value)}
                className="create-reco-input"
              >
                <option value={ETATS_RECOM.NOUVELLE}>Nouvelle</option>
                <option value={ETATS_RECOM.VUE}>Vue</option>
                <option value={ETATS_RECOM.REPORTEE}>Reportée</option>
                <option value={ETATS_RECOM.APPLIQUEE}>Appliquée</option>
                <option value={ETATS_RECOM.IGNOREE}>Ignorée</option>
              </select>
            </div>
            <div className="create-reco-field create-reco-field--full">
              <label className="create-reco-label">Règle associée</label>
              <select
                value={form.regleId}
                onChange={(e) => handleChange('regleId', e.target.value)}
                className="create-reco-input"
              >
                {REGLES_MOCK.map((r) => (
                  <option key={r.id} value={r.id}>{r.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="create-reco-section">
          <h2 className="create-reco-section-title">Action & déclencheur</h2>
          <div className="create-reco-grid">
            <div className="create-reco-field create-reco-field--full">
              <label className="create-reco-label">Action proposée *</label>
              <select
                value={form.actionProposee}
                onChange={(e) => handleChange('actionProposee', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir une action —</option>
                {ACTIONS_PROPOSEES_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="create-reco-field create-reco-field--full">
              <label className="create-reco-label">Déclencheur</label>
              <select
                value={form.declencheur}
                onChange={(e) => handleChange('declencheur', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir un déclencheur —</option>
                {DECLENCHEURS_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="create-reco-section">
          <h2 className="create-reco-section-title">Justification</h2>
          <div className="create-reco-grid">
            <div className="create-reco-field create-reco-field--full">
              <label className="create-reco-label">Règles déclenchées</label>
              <select
                value={form.reglesDeclenchees}
                onChange={(e) => handleChange('reglesDeclenchees', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir une règle —</option>
                {REGLES_MOCK.map((r) => (
                  <option key={r.id} value={r.nom}>{r.nom}</option>
                ))}
              </select>
            </div>
            <div className="create-reco-field create-reco-field--full">
              <label className="create-reco-label">Données sources</label>
              <select
                value={form.donneesSources}
                onChange={(e) => handleChange('donneesSources', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir —</option>
                {DONNEES_SOURCES_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="create-reco-field create-reco-field--full">
              <label className="create-reco-label">Seuils franchis</label>
              <select
                value={form.seuilsFranchis}
                onChange={(e) => handleChange('seuilsFranchis', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir —</option>
                {SEUILS_FRANCHIS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="create-reco-section">
          <h2 className="create-reco-section-title">Impact estimé</h2>
          <div className="create-reco-grid">
            <div className="create-reco-field">
              <label className="create-reco-label">Occupation</label>
              <select
                value={form.impactOccupation}
                onChange={(e) => handleChange('impactOccupation', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir —</option>
                {IMPACT_OCCUPATION_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="create-reco-field">
              <label className="create-reco-label">Délais patients</label>
              <select
                value={form.impactDelaisPatients}
                onChange={(e) => handleChange('impactDelaisPatients', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir —</option>
                {IMPACT_DELAIS_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="create-reco-field">
              <label className="create-reco-label">Charge RH</label>
              <select
                value={form.impactChargeRH}
                onChange={(e) => handleChange('impactChargeRH', e.target.value)}
                className="create-reco-input"
              >
                <option value="">— Choisir —</option>
                {IMPACT_CHARGE_RH_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="create-reco-actions">
          <Link to="/recommandations" className="create-reco-btn create-reco-btn--secondary">
            Annuler
          </Link>
          <button type="submit" className="create-reco-btn create-reco-btn--primary">
            Créer la recommandation
          </button>
        </div>
      </form>
    </main>
  )
}
