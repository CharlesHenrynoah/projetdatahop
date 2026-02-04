// src/pages/DashboardPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { hospitalData } from '../components/DataGenerator'
import NoDataMessage from '../components/NoDataMessage'
import KPI from '../components/KPI'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#93c5fd']

export default function DashboardPage() {
  const { dataReady, dataFromFile, dataSource, recordCount } = useData()
  const [period, setPeriod] = useState('30')
  const data = hospitalData.getLastNDays(parseInt(period))
  const latest = hospitalData.getLatest()

  if (!dataReady) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        Chargement des données…
      </div>
    )
  }
  if (!dataFromFile || !latest) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard Principal</h1>
        <NoDataMessage />
      </div>
    )
  }

  const bedOccupancy = Math.round((latest.occupiedBeds / 1800) * 100)
  const staffRatio = Math.round((latest.availableStaff / 220) * 100)
  const stockStatus = latest.stockLevel

  const admissionsData = data.map((d) => ({
    date: d.date.slice(5),
    admissions: d.admissions,
  }))
  const bedsData = data.map((d) => ({
    date: d.date.slice(5),
    occupied: d.occupiedBeds,
    available: 1800 - d.occupiedBeds,
  }))
  const pieData = [
    { name: 'Occupés', value: latest.occupiedBeds },
    { name: 'Disponibles', value: 1800 - latest.occupiedBeds },
  ]

  const admissionsStatus =
    latest.admissions > 420 ? 'critical' : latest.admissions > 380 ? 'warning' : 'good'
  const stockStatusLabel =
    stockStatus < 50 ? 'critical' : stockStatus < 70 ? 'warning' : 'good'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          📊 Dashboard Principal
        </h1>
        <p className="text-gray-500 mt-1">
          Vue d&apos;ensemble des flux hospitaliers — Données du fichier sur{' '}
          {period} jours
        </p>
        {dataSource && (
          <p className="mt-2 text-sm font-medium text-green-700 bg-green-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200">
            ✓ Données chargées depuis <code className="bg-green-100 px-1 rounded">{dataSource}</code>
            {' '}({recordCount} enregistrements)
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="7">7 jours</option>
          <option value="30">30 jours</option>
          <option value="90">90 jours</option>
          <option value="120">120 jours (complet)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI
          title="Taux d'occupation des lits"
          value={`${bedOccupancy}%`}
          trend={bedOccupancy - 85}
          status={
            bedOccupancy > 90 ? 'critical' : bedOccupancy > 85 ? 'warning' : 'good'
          }
        />
        <KPI
          title="Personnel disponible"
          value={`${latest.availableStaff}/220`}
          trend={Math.round(((latest.availableStaff - 190) / 190) * 100)}
          status={
            latest.availableStaff < 170
              ? 'critical'
              : latest.availableStaff < 190
                ? 'warning'
                : 'good'
          }
        />
        <KPI
          title="Admissions aujourd'hui"
          value={latest.admissions}
          trend={Math.round(((latest.admissions - 300) / 300) * 100)}
          status={admissionsStatus}
        />
        <KPI
          title="Niveau des stocks"
          value={`${stockStatus}%`}
          trend={stockStatus - 75}
          status={stockStatusLabel}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des admissions
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={admissionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <defs>
                  <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="admissions"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Occupation des lits
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="#ef4444" name="Occupés" />
                <Bar dataKey="available" fill="#10b981" name="Disponibles" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alertes synthétiques */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            ⚠ Alertes actives
          </h2>
          <span className="text-sm text-gray-500">Mise à jour en temps réel</span>
        </div>
        <div className="space-y-4">
          {bedOccupancy > 90 && (
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    Saturation lits critique
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Taux d&apos;occupation à {bedOccupancy}%. Seulement{' '}
                    {1800 - latest.occupiedBeds} lits disponibles. Risque blocage
                    admissions dans les prochaines heures.
                  </p>
                  <Link
                    to="/recommandations"
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    💡 Voir recommandations
                  </Link>
                </div>
              </div>
            </div>
          )}
          {latest.availableStaff < 170 && (
            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">
                    Tension RH élevée
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Seulement {latest.availableStaff} personnels disponibles (
                    {staffRatio}%). Risque fatigue équipe et erreurs médicales.
                  </p>
                  <Link
                    to="/recommandations"
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    💡 Voir recommandations
                  </Link>
                </div>
              </div>
            </div>
          )}
          {bedOccupancy <= 90 && latest.availableStaff >= 170 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-green-800">
                ✅ Aucune alerte active
              </h3>
              <p className="mt-1 text-sm text-green-700">
                La situation hospitalière est stable et sous contrôle.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 max-w-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Répartition lits (dernier jour)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
