import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { REGLES_MOCK } from '../data/recommandations'

function formatCondition(r) {
  const { type, operateur, seuil, unite } = r.condition
  return `${type} ${operateur} ${seuil} ${unite}`
}

const CONDITION_TYPES = [
  { value: 'occupation', label: 'Occupation (%)' },
  { value: 'stock', label: 'Stock (unités)' },
  { value: 'rh', label: 'Tension RH (%)' },
]
const OPERATEURS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '==', label: '=' },
]
const UNITES = [
  { value: '%', label: '%' },
  { value: 'unités', label: 'unités' },
  { value: 'jours', label: 'jours' },
  { value: 'heures', label: 'heures' },
]
const TYPE_JOUR = [
  { value: 'semaine', label: 'Semaine' },
  { value: 'weekend', label: 'Week-end' },
  { value: 'tous', label: 'Tous les jours' },
]
const ACTION_TYPES = [
  { value: 'lits', label: 'Lits' },
  { value: 'rh', label: 'RH' },
  { value: 'stocks', label: 'Stocks' },
]
const SCOPE_SERVICES = [
  { value: 'Medecine interne', label: 'Médecine interne' },
  { value: 'Urgences', label: 'Urgences' },
  { value: 'Urgence', label: 'Urgence' },
  { value: 'Global', label: 'Global' },
  { value: 'Pharmacie', label: 'Pharmacie' },
  { value: 'Bloc operatoire', label: 'Bloc opératoire' },
]
const ACTION_LIBELLES = [
  { value: 'Ouvrir lits', label: 'Ouvrir lits' },
  { value: 'Alerte stocks', label: 'Alerte stocks' },
  { value: 'Redéploiement RH', label: 'Redéploiement RH' },
  { value: 'Alertes', label: 'Alertes' },
]

const emptyForm = () => ({
  nom: '',
  active: true,
  condition: { type: 'occupation', operateur: '>', seuil: 85, unite: '%' },
  contexte: { typeJour: 'semaine', scope: 'Medecine interne' },
  action: { type: 'lits', libelle: 'Ouvrir lits' },
})

export default function ReglesPage() {
  const [regles, setRegles] = useState(REGLES_MOCK)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [formError, setFormError] = useState(null)

  const toggleRegle = (id) => {
    setRegles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    )
  }

  const handleCreerModifier = (id = null) => {
    setFormError(null)
    if (id) {
      const r = regles.find((x) => x.id === id)
      if (r) {
        setForm({
          nom: r.nom,
          active: r.active,
          condition: { ...r.condition },
          contexte: { ...r.contexte },
          action: { ...r.action },
        })
      } else setForm(emptyForm())
    } else {
      setForm(emptyForm())
    }
    setEditingId(id)
    setFormOpen(true)
  }

  useEffect(() => {
    if (!formOpen) return
    if (form.condition.type === 'occupation' || form.condition.type === 'rh') {
      setForm((f) => ({ ...f, condition: { ...f.condition, unite: '%' } }))
    } else if (form.condition.type === 'stock') {
      setForm((f) => ({ ...f, condition: { ...f.condition, unite: 'unités' } }))
    }
  }, [formOpen, form.condition.type])

  const handleFermerForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setFormError(null)
  }

  const handleChange = (field, value) => {
    setFormError(null)
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setForm((f) => ({
        ...f,
        [parent]: { ...f[parent], [child]: value },
      }))
    } else {
      setForm((f) => ({ ...f, [field]: value }))
    }
  }

  const handleEnregistrer = () => {
    const nom = (form.nom || '').trim()
    const scope = (form.contexte.scope || '').trim()
    const libelle = (form.action.libelle || '').trim()
    if (!nom) {
      setFormError('Le nom de la règle est obligatoire.')
      return
    }
    if (!scope) {
      setFormError('Le contexte (scope / service) est obligatoire.')
      return
    }
    if (!libelle) {
      setFormError("L'action (libellé) est obligatoire.")
      return
    }
    const seuil = Number(form.condition.seuil)
    if (Number.isNaN(seuil)) {
      setFormError('Le seuil doit être un nombre.')
      return
    }

    if (editingId) {
      setRegles((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                nom,
                active: form.active,
                condition: { ...form.condition, seuil },
                contexte: { ...form.contexte, scope },
                action: { ...form.action, libelle },
              }
            : r
        )
      )
    } else {
      const nextId = 'r' + (regles.length + 1) + '-' + Date.now().toString(36)
      setRegles((prev) => [
        ...prev,
        {
          id: nextId,
          nom,
          active: form.active,
          condition: { ...form.condition, seuil },
          contexte: { ...form.contexte, scope },
          action: { ...form.action, libelle },
        },
      ])
    }
    handleFermerForm()
  }

  return (
    <div className="space-y-6">
      {/* En-tête comme Dashboard / Prévisions / Alertes / Infos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moteur de règles</h1>
          <p className="text-gray-500 mt-1">
            Définir les règles qui déclenchent des recommandations
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/recommandations"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50"
          >
            ← Liste des recommandations
          </Link>
          <button
            type="button"
            onClick={() => handleCreerModifier()}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
          >
            Créer / Modifier une règle
          </button>
        </div>
      </div>

      {/* Règles existantes — carte comme les autres pages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Règles existantes
        </h2>
        <ul className="space-y-4">
          {regles.map((r) => (
            <li
              key={r.id}
              className={`rounded-xl border p-5 transition-all ${
                r.active
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-50 border-gray-100 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {r.nom}
                    </h3>
                    <label className="flex items-center gap-2 shrink-0">
                      <input
                        type="checkbox"
                        checked={r.active}
                        onChange={() => toggleRegle(r.id)}
                        aria-label={`Activer / désactiver la règle ${r.nom}`}
                        className="rounded border-gray-300 text-green-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">
                        {r.active ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Condition
                      </p>
                      <p className="text-sm text-gray-800">
                        {formatCondition(r)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Contexte
                      </p>
                      <p className="text-sm text-gray-800">
                        {r.contexte.typeJour} — {r.contexte.scope}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Action
                      </p>
                      <p className="text-sm text-gray-800">
                        {r.action.libelle} ({r.action.type})
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCreerModifier(r.id)}
                  className="shrink-0 px-3 py-2 rounded-lg border border-blue-600 text-blue-600 font-medium text-sm hover:bg-blue-50"
                >
                  Modifier
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal formulaire Créer / Modifier une règle */}
      {formOpen && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="regle-form-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 id="regle-form-title" className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Modifier la règle' : 'Créer une règle'}
            </h2>

            {formError && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                {formError}
              </p>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la règle *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="ex. Occupation médecine > 85 %"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="regle-active"
                  checked={form.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-blue-500"
                />
                <label htmlFor="regle-active" className="text-sm text-gray-700">Règle active</label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Condition</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Type</label>
                    <select
                      value={form.condition.type}
                      onChange={(e) => handleChange('condition.type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {CONDITION_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Opérateur</label>
                    <select
                      value={form.condition.operateur}
                      onChange={(e) => handleChange('condition.operateur', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {OPERATEURS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Seuil</label>
                    <input
                      type="number"
                      value={form.condition.seuil}
                      onChange={(e) => handleChange('condition.seuil', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min={0}
                      step={form.condition.type === 'stock' ? 1 : 0.1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Unité</label>
                    <select
                      value={form.condition.unite}
                      onChange={(e) => handleChange('condition.unite', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {UNITES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contexte</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Type de jour</label>
                    <select
                      value={form.contexte.typeJour}
                      onChange={(e) => handleChange('contexte.typeJour', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {TYPE_JOUR.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Scope / Service *</label>
                    <select
                      value={form.contexte.scope}
                      onChange={(e) => handleChange('contexte.scope', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {!SCOPE_SERVICES.some((o) => o.value === form.contexte.scope) && form.contexte.scope && (
                        <option value={form.contexte.scope}>{form.contexte.scope}</option>
                      )}
                      {SCOPE_SERVICES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Action</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Type d&apos;action</label>
                    <select
                      value={form.action.type}
                      onChange={(e) => handleChange('action.type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {ACTION_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Libellé *</label>
                    <select
                      value={form.action.libelle}
                      onChange={(e) => handleChange('action.libelle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {!ACTION_LIBELLES.some((o) => o.value === form.action.libelle) && form.action.libelle && (
                        <option value={form.action.libelle}>{form.action.libelle}</option>
                      )}
                      {ACTION_LIBELLES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleFermerForm}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleEnregistrer}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
              >
                {editingId ? 'Enregistrer' : 'Créer la règle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
