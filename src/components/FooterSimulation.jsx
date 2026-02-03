import './FooterSimulation.css'

export default function FooterSimulation({ onReset, hasSimulated }) {
  return (
    <footer className="footer-simulation" role="contentinfo">
      <div className="footer-badge">
        <span className="footer-badge-dot" aria-hidden />
        Mode Simulation actif
      </div>
      <p className="footer-disclaimer">
        Aucune donnée réelle — aucune action n'est appliquée
      </p>
      <button
        type="button"
        className="footer-reset"
        onClick={onReset}
        disabled={!hasSimulated}
        aria-disabled={!hasSimulated}
      >
        Reset simulation
      </button>
    </footer>
  )
}
