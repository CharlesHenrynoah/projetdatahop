import { useState } from 'react'
import { Link } from 'react-router-dom'
import './DemoPage.css'

const SCENARIOS_DEMO = [
  {
    id: 'epidemie',
    titre: 'Épidémie soudaine',
    description: 'Montée brutale des admissions (type grippe / virus). Détection, simulation et recommandation d’ouverture de lits.',
  },
  {
    id: 'pic_saisonnier',
    titre: 'Pic saisonnier hivernal',
    description: 'Augmentation prévisible des flux en hiver. Anticipation et ajustement des capacités.',
  },
  {
    id: 'greve',
    titre: 'Grève partielle du personnel',
    description: 'Réduction des effectifs. Simulation de l’impact et redéploiement recommandé.',
  },
  {
    id: 'canicule',
    titre: 'Canicule / vague de chaleur',
    description: 'Afflux de patients (déshydratation, malaise). Renfort urgences et plan blanc déclenché.',
  },
  {
    id: 'rupture_stock',
    titre: 'Rupture de stock critique',
    description: 'Risque de rupture sur un médicament ou consommable. Alerte et réapprovisionnement prioritaire.',
  },
  {
    id: 'saturation_urgences',
    titre: 'Saturation des urgences',
    description: "Temps d'attente et taux d'occupation en hausse. Réorientation et ouverture de lits de court séjour.",
  },
  {
    id: 'absentéisme',
    titre: 'Absentéisme massif',
    description: 'Baisse soudaine des effectifs (maladie, congés). Simulation RH et recommandations de renfort.',
  },
  {
    id: 'evenement_exceptionnel',
    titre: 'Événement exceptionnel',
    description: 'Accident collectif ou catastrophe. Plan blanc, mobilisation des lits et des équipes.',
  },
]

const CONTEXTE_INITIAL_DEFAULT = 'Contexte de départ : flux habituels, capacités connues. Données fictives préchargées pour la démo.'

const ETAPES = [
  { id: 1, label: 'Situation initiale', texte: CONTEXTE_INITIAL_DEFAULT },
  { id: 2, label: 'Détection du problème', texte: 'Le système détecte un dépassement de seuil (ex. taux d\'occupation > 85 %). Une alerte est générée.' },
  { id: 3, label: 'Simulation de scénario', texte: 'Un scénario est simulé pour anticiper l\'évolution (admissions, occupation, RH). Aucune action réelle.' },
  { id: 4, label: 'Recommandation proposée', texte: 'Le moteur de règles propose une action (ex. ouvrir des lits, redéployer du personnel).' },
  { id: 5, label: 'Décision simulée', texte: 'La décision est simulée avant application : vous voyez l\'impact attendu Avant / Après.' },
  { id: 6, label: 'Impact après décision', texte: 'Résultat après décision : indicateurs améliorés. La démo montre la valeur ajoutée du pilotage.' },
]

const DONNEES_AVANT = {
  occupation: 92,
  admissions: 120,
  rh: 68,
}
const DONNEES_APRES = {
  occupation: 74,
  admissions: 95,
  rh: 82,
}
const MESSAGE_PEDAGOGIQUE = "Grâce à la simulation et aux recommandations, la saturation des lits a été réduite de 18 %."

export default function DemoPage() {
  const [scenarioId, setScenarioId] = useState(null)
  const [etape, setEtape] = useState(1)
  const [contexteInitial, setContexteInitial] = useState(CONTEXTE_INITIAL_DEFAULT)

  const scenario = scenarioId ? SCENARIOS_DEMO.find((s) => s.id === scenarioId) : null

  const handleChoisirScénario = (id) => {
    setScenarioId(id)
    setEtape(1)
  }

  const handleEtapeSuivante = () => {
    if (etape < 6) setEtape((e) => e + 1)
  }

  const handleEtapePrecedente = () => {
    if (etape > 1) setEtape((e) => e - 1)
  }

  const handleRejouer = () => {
    setEtape(1)
  }

  const handleChangerScénario = () => {
    setScenarioId(null)
    setEtape(1)
  }

  const texteEtapeCourante = etape === 1 ? contexteInitial : ETAPES.find((e) => e.id === etape)?.texte

  const showAvantApres = etape >= 4
  const showMessagePedago = etape >= 5

  return (
    <main className="demo-page">
      {/* ZONE 1 — Bandeau "Mode Démo" */}
      <header className="demo-bandeau">
        <div className="demo-bandeau-inner">
          <span className="demo-badge">MODE DÉMONSTRATION</span>
          <span className="demo-mention">Données fictives – scénario préchargé</span>
          <Link to="/" className="demo-btn-quitter">
            Quitter la démo
          </Link>
        </div>
      </header>

      <div className="demo-content">
        {!scenario ? (
          /* ZONE 2 — Sélecteur de scénario */
          <section className="demo-selecteur" aria-label="Choisir un scénario de démonstration">
            <h1 className="demo-title">Mode Démonstration</h1>
            <p className="demo-intro">
              Choisissez un scénario pour lancer une démo guidée, reproductible et sans donnée réelle.
            </p>
            <div className="demo-scenarios">
              {SCENARIOS_DEMO.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="demo-scenario-card"
                  onClick={() => handleChoisirScénario(s.id)}
                >
                  <h2 className="demo-scenario-titre">{s.titre}</h2>
                  <p className="demo-scenario-desc">{s.description}</p>
                  <span className="demo-scenario-cta">Lancer la démo →</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <>
            {/* ZONE 3 — Parcours guidé (timeline) */}
            <section className="demo-parcours" aria-label="Parcours guidé">
              <h2 className="demo-parcours-title">Parcours guidé</h2>
              <p className="demo-scenario-courant">Scénario : {scenario.titre}</p>
              <ul className="demo-timeline" role="list">
                {ETAPES.map((e) => (
                  <li
                    key={e.id}
                    className={`demo-timeline-item ${e.id === etape ? 'demo-timeline-item--active' : ''} ${e.id < etape ? 'demo-timeline-item--done' : ''}`}
                  >
                    <span className="demo-timeline-num">{e.id}</span>
                    <span className="demo-timeline-label">{e.label}</span>
                  </li>
                ))}
              </ul>
              {etape === 1 ? (
                <div className="demo-contexte-initial-wrap">
                  <label htmlFor="demo-contexte-initial" className="demo-contexte-initial-label">
                    Contexte initial
                  </label>
                  <textarea
                    id="demo-contexte-initial"
                    className="demo-contexte-initial-input"
                    value={contexteInitial}
                    onChange={(e) => setContexteInitial(e.target.value)}
                    placeholder={CONTEXTE_INITIAL_DEFAULT}
                    rows={4}
                    aria-label="Description de la situation initiale"
                  />
                </div>
              ) : (
                texteEtapeCourante && (
                  <p className="demo-etape-texte" role="status">
                    {texteEtapeCourante}
                  </p>
                )
              )}
              <div className="demo-nav-etapes">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleEtapePrecedente}
                  disabled={etape <= 1}
                >
                  ← Étape précédente
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEtapeSuivante}
                  disabled={etape >= 6}
                >
                  Étape suivante →
                </button>
              </div>
            </section>

            {/* ZONE 4 — Visualisation Avant / Après */}
            {showAvantApres && (
              <section className="demo-avant-apres" aria-label="Comparaison avant après décision">
                <h2 className="demo-section-title">Avant / Après décision</h2>
                <div className="demo-table-wrap">
                  <table className="demo-table">
                    <thead>
                      <tr>
                        <th scope="col">Indicateur</th>
                        <th scope="col">Avant décision</th>
                        <th scope="col">Après décision</th>
                        <th scope="col">Évolution</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Occupation des lits (%)</td>
                        <td className="demo-avant">{DONNEES_AVANT.occupation} %</td>
                        <td className="demo-apres">{DONNEES_APRES.occupation} %</td>
                        <td className="demo-delta demo-delta--positif">
                          {DONNEES_APRES.occupation - DONNEES_AVANT.occupation} %
                        </td>
                      </tr>
                      <tr>
                        <td>Admissions (jour)</td>
                        <td>{DONNEES_AVANT.admissions}</td>
                        <td>{DONNEES_APRES.admissions}</td>
                        <td className="demo-delta demo-delta--positif">
                          {DONNEES_APRES.admissions - DONNEES_AVANT.admissions}
                        </td>
                      </tr>
                      <tr>
                        <td>Disponibilité RH (%)</td>
                        <td className="demo-avant">{DONNEES_AVANT.rh} %</td>
                        <td className="demo-apres">{DONNEES_APRES.rh} %</td>
                        <td className="demo-delta demo-delta--positif">
                          +{DONNEES_APRES.rh - DONNEES_AVANT.rh} %
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ZONE 5 — Message pédagogique */}
            {showMessagePedago && (
              <section className="demo-message" role="status">
                <p className="demo-message-text">{MESSAGE_PEDAGOGIQUE}</p>
              </section>
            )}

            {/* ZONE 6 — Contrôles de la démo */}
            <footer className="demo-controles">
              <button type="button" className="btn btn-secondary" onClick={handleRejouer}>
                Rejouer la démo
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleChangerScénario}>
                Changer de scénario
              </button>
              <Link to="/" className="btn btn-outline-demo">
                Revenir à l'accueil
              </Link>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}
