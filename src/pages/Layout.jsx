import { Outlet, NavLink } from 'react-router-dom'
import './Layout.css'
import './pages.css'

export default function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <span className="app-badge-dot" aria-hidden />
        <span className="app-badge-text">MODE SIMULATION – données fictives</span>
        <nav className="app-nav" aria-label="Navigation principale">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link')}
            end
          >
            Simulation de scénarios
          </NavLink>
          <NavLink
            to="/recommandations"
            className={({ isActive }) => (isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link')}
          >
            Recommandations & Décisions
          </NavLink>
          <NavLink
            to="/demo"
            className={({ isActive }) => (isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link')}
          >
            Mode Démo
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
