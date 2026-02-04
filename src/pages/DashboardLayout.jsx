// src/pages/DashboardLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Home,
  BarChart2,
  AlertTriangle,
  Info,
} from 'lucide-react'

const pages = [
  { name: 'Dashboard', icon: Home, path: '/dashboard', page: 1 },
  { name: 'Prévisions', icon: BarChart2, path: '/dashboard/forecast', page: 3 },
  { name: 'Alertes', icon: AlertTriangle, path: '/dashboard/alerts', page: 5 },
  { name: 'Infos & Conformité', icon: Info, path: '/dashboard/infos', page: 7 },
]

export default function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Dashboard Hôpital Pitié-Salpêtrière
              </h1>
              <p className="text-xs text-red-600 font-medium mt-0.5">
                ⚠ DONNÉES FICTIVES - USAGE PÉDAGOGIQUE UNIQUEMENT
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Projet DATA 2026</span>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Page {pages.find((p) => p.path === location.pathname)?.page || '1'}
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="mt-6">
            <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h2>
            <ul className="space-y-1">
              {pages.map((page) => (
                <li key={page.path}>
                  <Link
                    to={page.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      location.pathname === page.path
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <page.icon className="w-5 h-5 mr-3" />
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
                <p className="text-xs text-red-700">
                  <span className="font-medium">RGPD :</span> Aucune donnée
                  réelle de patients n&apos;est utilisée. Toutes les données sont
                  générées artificiellement.
                </p>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Outlet />
          <footer className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
            <p>
              🔒 Conformité RGPD — Données fictives générées artificiellement —
              Projet DATA 2026 — Hôpital Pitié-Salpêtrière (AP-HP)
            </p>
            <p className="mt-1 text-red-600 font-medium">
              ⚠ Prototype pédagogique — Aucune valeur opérationnelle — Ne pas
              utiliser pour piloter un établissement réel
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
