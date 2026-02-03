import './Zone1Contexte.css'

export default function Zone1Contexte({ scenarios, scenario, onScenarioChange }) {
  return (
    <section className="zone1-contexte" aria-label="Contexte et sélection du scénario">
      <h1 className="zone1-title">Simulation de scénarios</h1>
      <p className="zone1-subtitle">
        Tester l'impact d'un événement sur les flux hospitaliers
      </p>
      <div className="zone1-scenarios" role="group" aria-label="Choisir un scénario">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`zone1-card ${scenario === s.id ? 'zone1-card--active' : ''}`}
            onClick={() => onScenarioChange(s.id)}
            aria-pressed={scenario === s.id}
          >
            <span className="zone1-card-icon">{s.icon}</span>
            <span className="zone1-card-label">{s.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
