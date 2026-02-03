import './Zone2Parametres.css'

export default function Zone2Parametres({ params, onParamChange, onSimuler, paramsValid }) {
  return (
    <section className="zone2-parametres" aria-label="Paramètres de simulation">
      <h2 className="zone2-title">Hypothèses de simulation</h2>
      <div className="zone2-sliders">
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
      <div className="zone2-action">
        <button
          type="button"
          className="zone2-btn-simuler"
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

function Slider({ id, label, min, max, value, onChange }) {
  return (
    <div className="zone2-slider">
      <label htmlFor={id} className="zone2-slider-label">
        {label}
      </label>
      <div className="zone2-slider-row">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="zone2-slider-input"
        />
        <span className="zone2-slider-value" aria-live="polite">
          {value} %
        </span>
      </div>
      <div className="zone2-slider-bounds">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
