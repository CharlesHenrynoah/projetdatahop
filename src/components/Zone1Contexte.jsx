export default function Zone1Contexte({ scenarios, scenario, onScenarioChange }) {
  return (
    <section className="pb-4 border-b border-gray-200" aria-label="Contexte et sélection du scénario">
      <h1 className="text-2xl font-bold text-gray-900 m-0">
        Simulation de scénarios
      </h1>
      <p className="mt-1.5 mb-4 text-gray-600 text-[0.95rem]">
        Tester l'impact d'un événement sur les flux hospitaliers
      </p>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Choisir un scénario">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
              scenario === s.id
                ? 'border-blue-700 bg-blue-50 text-blue-700 ring-2 ring-blue-700/30'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onScenarioChange(s.id)}
            aria-pressed={scenario === s.id}
          >
            <span className="text-lg" aria-hidden>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
