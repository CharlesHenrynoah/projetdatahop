function Slider({ id, label, min, max, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-600">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-theme flex-1 h-2 rounded bg-gray-200 appearance-none cursor-pointer accent-blue-700"
        />
        <span className="min-w-[3.5rem] text-sm font-semibold text-gray-800" aria-live="polite">
          {value} %
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function Zone2Parametres({ params, onParamChange, onSimuler, paramsValid }) {
  return (
    <section
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
      aria-label="Paramètres de simulation"
    >
      <h2 className="text-lg font-semibold text-gray-800 mt-0 mb-4">
        Hypothèses de simulation
      </h2>
      <div className="flex flex-col gap-5">
        <Slider
          id="tauxAdmission"
          label="Taux d'admission (%)"
          min={0}
          max={100}
          value={params.tauxAdmission}
          onChange={(v) => onParamChange('tauxAdmission', v)}
        />
        <Slider
          id="personnelDisponible"
          label="Personnel disponible (%)"
          min={0}
          max={100}
          value={params.personnelDisponible}
          onChange={(v) => onParamChange('personnelDisponible', v)}
        />
        <Slider
          id="capaciteLits"
          label="Capacité en lits (%)"
          min={0}
          max={100}
          value={params.capaciteLits}
          onChange={(v) => onParamChange('capaciteLits', v)}
        />
      </div>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="px-8 py-3 text-base font-semibold text-white bg-blue-700 rounded-lg shadow-md shadow-blue-700/30 hover:bg-blue-800 active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all"
          onClick={onSimuler}
          disabled={!paramsValid}
          aria-disabled={!paramsValid}
        >
          Simuler
        </button>
      </div>
    </section>
  )
}
