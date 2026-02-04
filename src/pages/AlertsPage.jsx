// src/pages/AlertsPage.jsx (PAGE 5)
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import NoDataMessage from '../components/NoDataMessage'
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Lightbulb,
} from 'lucide-react'

const ALL_ALERTS = [
  {
    id: 'AL001',
    level: 'critical',
    service: 'réanimation',
    title: 'Saturation à 98 %',
    description:
      '176 lits occupés / 180. Blocage admissions prévu dans 2 h.',
    since: '35 min',
    impact: 'Élevé',
    color: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
  },
  {
    id: 'AL002',
    level: 'high',
    service: 'urgences',
    title: 'Tension RH + affluence',
    description:
      '45 patients en attente, seulement 28 personnels disponibles.',
    since: '1h 20min',
    impact: 'Moyen',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  },
  {
    id: 'AL003',
    level: 'medium',
    service: 'pharmacie',
    title: 'Stocks bas en antibiotiques',
    description:
      "Niveau à 38 %. Risque rupture sous 48 h si pic épidémique.",
    since: '4h 12min',
    impact: 'Moyen',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  },
  {
    id: 'AL004',
    level: 'low',
    service: 'imagerie',
    title: 'Retard dans les examens',
    description:
      "File d'attente de 12 patients pour IRM. Délai estimé : 3 h.",
    since: '2h 45min',
    impact: 'Faible',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <AlertTriangle className="w-5 h-5 text-blue-500" />,
  },
]

export default function AlertsPage() {
  const { dataReady, dataFromFile } = useData()
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterService, setFilterService] = useState('all')

  if (!dataReady) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        Chargement des données…
      </div>
    )
  }
  if (!dataFromFile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">⚠ Centre des alertes</h1>
        <NoDataMessage />
      </div>
    )
  }

  const alerts = ALL_ALERTS.filter(
    (alert) =>
      (filterLevel === 'all' || alert.level === filterLevel) &&
      (filterService === 'all' || alert.service === filterService)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ⚠ Centre des alertes
        </h1>
        <p className="text-gray-500 mt-1">
          Surveillance en temps réel des seuils critiques — Données du fichier
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Filtrer les alertes
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Affinez votre vue selon les critères
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Tous niveaux</option>
              <option value="critical">🚨 Critique</option>
              <option value="high">⚠ Élevé</option>
              <option value="medium">🔶 Moyen</option>
              <option value="low">🔷 Faible</option>
            </select>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Tous services</option>
              <option value="réanimation">Réanimation</option>
              <option value="urgences">Urgences</option>
              <option value="pharmacie">Pharmacie</option>
              <option value="imagerie">Imagerie</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-800">
                Alertes critiques
              </p>
              <p className="text-2xl font-bold text-red-900 mt-1">1</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-800">
                Alertes élevées
              </p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">1</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-800">
                Alertes moyennes
              </p>
              <p className="text-2xl font-bold text-orange-900 mt-1">1</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-800">
                Services stables
              </p>
              <p className="text-2xl font-bold text-green-900 mt-1">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des alertes actives
          </h2>
          <span className="text-sm text-gray-500">
            {alerts.length} alerte(s) trouvée(s)
          </span>
        </div>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucune alerte active
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tous les indicateurs sont dans les seuils normaux.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-xl p-5 ${alert.color} transition-all hover:shadow-md`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">{alert.icon}</div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900">
                            {alert.title}
                          </span>
                          <span
                            className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              alert.level === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : alert.level === 'high'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : alert.level === 'medium'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {alert.level === 'critical' && '🚨 CRITIQUE'}
                            {alert.level === 'high' && '⚠ ÉLEVÉ'}
                            {alert.level === 'medium' && '🔶 MOYEN'}
                            {alert.level === 'low' && '🔷 FAIBLE'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">
                          {alert.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            {alert.service.charAt(0).toUpperCase() +
                              alert.service.slice(1)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            Détection : il y a {alert.since}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            Impact : {alert.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                    <Link
                      to="/recommandations"
                      className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir détails
                    </Link>
                    <Link
                      to="/recommandations"
                      className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Recommandations
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Historique des résolutions
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    Saturation lits résolue
                  </p>
                  <p className="text-sm text-gray-500">
                    Résolu il y a 2h 15min — Ouverture de 20 lits supplémentaires
                  </p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">
                RÉSOLU
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
