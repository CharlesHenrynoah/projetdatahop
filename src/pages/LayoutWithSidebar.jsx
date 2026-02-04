// Layout unique : sidebar à gauche, contenu des pages à droite
import { Outlet, NavLink } from 'react-router-dom'
import { useData } from '../context/DataContext'
import {
  Home,
  List,
  BookOpen,
  Play,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react'

// Deux blocs identiques : Simulation (comme Dashboard) et Dashboard Hôpital
const SIDEBAR_SECTIONS = [
  {
    title: 'Simulation & Décisions',
    links: [
      { to: '/', label: 'Simulation scénarios', icon: Home, end: true },
      { to: '/recommandations', label: 'Recommandations', icon: List, end: false },
      { to: '/recommandations/regles', label: 'Règles', icon: BookOpen, end: true },
      { to: '/demo', label: 'Mode Démo', icon: Play, end: true },
    ],
  },
  {
    title: 'Dashboard Hôpital',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: BarChart2, end: true },
      { to: '/dashboard/forecast', label: 'Prévisions', icon: TrendingUp, end: true },
      { to: '/dashboard/alerts', label: 'Alertes', icon: AlertTriangle, end: true },
      { to: '/dashboard/infos', label: 'ℹ Informations & Conformité RGPD', icon: Info, end: true },
    ],
  },
]

export default function LayoutWithSidebar() {
  const { dataFromFile, dataSource, recordCount } = useData()
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar gauche */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                Projet DATA 2026
              </h1>
              <p className={`text-xs font-medium ${dataFromFile ? 'text-green-600' : 'text-red-600'}`}>
              {dataFromFile ? 'Données : fichier' : 'Données fictives'}
            </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h2>
              <ul className="space-y-0.5">
                {section.links.map((link) => (
                  <li key={link.to + (link.end ? '-end' : '')}>
                    <NavLink
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      <link.icon className="w-5 h-5 mr-3 shrink-0" />
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">
              <span className="font-medium">RGPD :</span> Données 100 %
              artificielles. Usage pédagogique uniquement.
            </p>
          </div>
        </div>
      </aside>

      {/* Contenu principal à droite */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-2 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-gray-500">
            ⚠ MODE SIMULATION – Aucune valeur opérationnelle
          </span>
          {dataFromFile && dataSource && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
              Données réelles : {dataSource} ({recordCount} enregistrements)
            </span>
          )}
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
