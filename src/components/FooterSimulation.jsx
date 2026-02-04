export default function FooterSimulation({ onReset, hasSimulated }) {
  return (
    <footer
      className="mt-auto pt-5 border-t border-gray-200 flex flex-wrap items-center gap-4"
      role="contentinfo"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
        <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden />
        Mode Simulation actif
      </div>
      <p className="m-0 text-xs text-gray-500">
        Aucune donnée réelle — aucune action n'est appliquée
      </p>
      <button
        type="button"
        className="ml-auto py-2 px-4 text-sm font-medium text-gray-500 bg-transparent border border-gray-300 rounded-md hover:text-gray-700 hover:border-gray-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        onClick={onReset}
        disabled={!hasSimulated}
        aria-disabled={!hasSimulated}
      >
        Reset simulation
      </button>
    </footer>
  )
}
