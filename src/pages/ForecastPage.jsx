// src/pages/ForecastPage.jsx
import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { hospitalData } from '../components/DataGenerator'
import NoDataMessage from '../components/NoDataMessage'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  Legend,
} from 'recharts'

export default function ForecastPage() {
  const { dataReady, dataFromFile, dataSource, recordCount } = useData()
  const [horizon, setHorizon] = useState(14)
  const [llmResources, setLlmResources] = useState(null)
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmError, setLlmError] = useState(null)
  const forecast = hospitalData.getForecast(horizon)
  const historical = hospitalData.getLastNDays(30)

  useEffect(() => {
    if (!dataFromFile || !hospitalData.hasData()) return
    const latest = hospitalData.getLatest()
    const recent = hospitalData.getLastNDays(14)
    const formulaForecast = hospitalData.getForecast(horizon)
    if (!latest || recent.length === 0) return
    setLlmLoading(true)
    setLlmError(null)
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ForecastPage.jsx:effect', message: 'Sending forecast request', data: { horizon, dataFromFile: !!dataFromFile }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'C' }) }).catch(() => {});
    // #endregion
    fetch('/api/forecast/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latest, recent, formulaForecast, horizon }),
    })
      .then((r) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ForecastPage.jsx:fetch-then', message: 'Response received', data: { ok: r.ok, status: r.status }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'C' }) }).catch(() => {});
        // #endregion
        return r.json()
      })
      .then((data) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ForecastPage.jsx:data', message: 'Parsed response', data: { hasError: !!data?.error, errorMsg: data?.error?.slice?.(0, 80), daysLength: data?.days?.length }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'C' }) }).catch(() => {});
        // #endregion
        if (data.error && !data.days) {
          const msg = data.detail ? `${data.error}: ${data.detail}` : data.error
          setLlmError(msg)
          setLlmResources(null)
        } else {
          setLlmResources(data.days || null)
          setLlmError(null)
        }
      })
      .catch((err) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/bd9b5dc6-0d6e-45b2-90be-0ef2c7367774', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ForecastPage.jsx:catch', message: 'Fetch failed', data: { err: String(err?.message || err) }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'C' }) }).catch(() => {});
        // #endregion
        setLlmError('API injoignable')
        setLlmResources(null)
      })
      .finally(() => setLlmLoading(false))
  }, [dataFromFile, horizon])

  if (!dataReady) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        Chargement des données…
      </div>
    )
  }
  if (!dataFromFile || !hospitalData.hasData()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">🔮 Prévisions</h1>
        <NoDataMessage />
      </div>
    )
  }

  const last14Hist = historical.slice(-14)
  const llmOk = llmResources && llmResources.length >= horizon
  const forecastSource = llmOk ? llmResources : []
  const chartData = [
    ...last14Hist.map((d) => ({
      date: d.date.slice(5),
      admissionsHistorique: d.admissions,
      admissionsPrevision: null,
      admissions: d.admissions,
      type: 'historique',
    })),
    ...forecastSource.map((f, i) => ({
      date: (f.date || '').slice(5),
      admissionsHistorique: null,
      admissionsPrevision: f.admissions ?? 0,
      admissions: f.admissions ?? 0,
      uncertainty: f.uncertainty ?? Math.min(35, 10 + (i + 1) * 1.5),
      type: 'prévision',
    })),
  ]

  const bedsForecast = forecastSource.map((f) => ({
    date: (f.date || '').slice(5),
    occupied: f.occupiedBeds ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🔮 Prévisions</h1>
        <p className="text-gray-500 mt-1">
          Modèles statistiques basés sur les tendances historiques — Données du fichier
        </p>
        {dataSource && (
          <p className="mt-2 text-sm font-medium text-green-700 bg-green-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200">
            ✓ Historique et prévisions basés sur <code className="bg-green-100 px-1 rounded">{dataSource}</code>
            {' '}({recordCount} jours chargés)
          </p>
        )}
      </div>

      {/* Contrôles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Horizon de prévision
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sélectionnez la période à prévoir
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-2">
              {[7, 14, 21, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setHorizon(days)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    horizon === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days} jours
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700">
                <span className="font-medium">ℹ Information :</span> Toutes
                les sections utilisent automatiquement <strong>fichier + LLM (Gemini)</strong>. Les prévisions ne s&apos;affichent qu&apos;une fois le LLM connecté. L&apos;incertitude augmente avec l&apos;horizon (zone ombrée).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Prévisions admissions — Prochains {horizon} jours
        </h2>
        {!llmOk && !llmLoading && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            Les prévisions (fichier + LLM) s&apos;afficheront ici une fois le serveur et Gemini connectés.
          </div>
        )}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                        <p className="font-medium">{data.date}</p>
                        <p className="text-gray-700 mt-1">
                          Admissions : {Math.round(data.admissions ?? data.admissionsHistorique ?? data.admissionsPrevision ?? 0)}
                        </p>
                        {data.type === 'prévision' && data.uncertainty != null && (
                          <p className="text-yellow-600 text-sm mt-1">
                            ± {data.uncertainty} % d&apos;incertitude
                          </p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              {/* Zone d'incertitude */}
              <Area
                type="monotone"
                dataKey="admissions"
                stroke="none"
                fill="#fecaca"
                fillOpacity={0.3}
                isAnimationActive={false}
              />
              {/* Ligne historique */}
              <Line
                type="monotone"
                dataKey="admissionsHistorique"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                name="Historique"
              />
              {/* Ligne prévision */}
              <Line
                type="monotone"
                dataKey="admissionsPrevision"
                stroke="#dc2626"
                strokeWidth={3}
                dot={false}
                name="Prévision"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-xs font-medium text-red-700 mb-1">Zone rouge</p>
            <p className="text-sm text-red-800">Incertitude élevée (±25-35 %)</p>
            <p className="text-xs text-red-600 mt-1">
              Prévisions à long terme — À utiliser avec prudence
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-xs font-medium text-yellow-700 mb-1">Zone orange</p>
            <p className="text-sm text-yellow-800">Incertitude modérée (±15-25 %)</p>
            <p className="text-xs text-yellow-600 mt-1">
              Prévisions à moyen terme — Utile pour la planification
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs font-medium text-green-700 mb-1">Zone verte</p>
            <p className="text-sm text-green-800">Incertitude faible (±5-15 %)</p>
            <p className="text-xs text-green-600 mt-1">
              Prévisions à court terme — Fiables pour l&apos;opérationnel
            </p>
          </div>
        </div>
      </div>

      {/* Besoins en ressources — générés par le LLM (Gemini) ou fallback formules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Besoins en ressources prévus
          </h2>
          {llmLoading && (
            <span className="text-sm text-amber-600">Génération par le LLM…</span>
          )}
          {llmError && !llmLoading && (
            <span className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200" title={llmError}>
              Prévisions indisponibles — connectez le LLM (serveur + GEMINI_API_KEY)
            </span>
          )}
          {llmOk && !llmLoading && (
            <span className="text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-200">
              Toutes les sections : données du fichier + LLM (Gemini)
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Lits nécessaires</h3>
            <div className="space-y-3">
              {!llmOk && !llmLoading && (
                <p className="text-sm text-amber-700 py-2">Prévisions (fichier + LLM) à venir.</p>
              )}
              {forecastSource.slice(0, 3).map((row, i) => {
                const bedsNeeded = row.occupiedBeds ?? Math.min(1780, Math.round((row.admissions ?? 0) * 2.5))
                const occupancy = Math.round((bedsNeeded / 1800) * 100)
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm text-gray-600">
                      J+{i + 1} (
                      {new Date(row.date || '').toLocaleDateString('fr-FR', {
                        weekday: 'short',
                      })}
                      )
                    </span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        {bedsNeeded} lits
                      </span>
                      <div
                        className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          occupancy > 95
                            ? 'bg-red-100 text-red-800'
                            : occupancy > 90
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {occupancy} % occupation
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Personnel requis</h3>
            <div className="space-y-3">
              {!llmOk && !llmLoading && (
                <p className="text-sm text-amber-700 py-2">Prévisions (fichier + LLM) à venir.</p>
              )}
              {forecastSource.slice(0, 3).map((row, i) => {
                const staffNeeded = row.availableStaff ?? Math.max(160, Math.round(200 - ((row.admissions ?? 300) - 300) * 0.22))
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm text-gray-600">
                      J+{i + 1} (
                      {new Date(row.date || '').toLocaleDateString('fr-FR', {
                        weekday: 'short',
                      })}
                      )
                    </span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        {staffNeeded} personnels
                      </span>
                      <div
                        className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          staffNeeded < 170
                            ? 'bg-red-100 text-red-800'
                            : staffNeeded < 190
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {staffNeeded < 170
                          ? '⚠ Tension'
                          : staffNeeded < 190
                            ? '⚠ Surveillance'
                            : '✅ Suffisant'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Prévision lits occupés */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Prévision occupation des lits
        </h2>
        {!llmOk && !llmLoading && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            Courbe (fichier + LLM) après connexion du serveur et Gemini.
          </div>
        )}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bedsForecast}>
              <defs>
                <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="occupied"
                stroke="#ef4444"
                fill="url(#colorOccupied)"
                name="Lits occupés (prévision)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Note :</strong> Tout le board Prévisions (courbes + Besoins en ressources) est géré par le <strong>fichier</strong> (hospital_data.json) et le <strong>LLM (Gemini)</strong>. L’incertitude augmente avec l’horizon temporel.
      </div>
    </div>
  )
}
