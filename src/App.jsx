import { Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { RecommandationsProvider } from './context/RecommandationsContext'
import LayoutWithSidebar from './pages/LayoutWithSidebar'
import SimulationPage from './pages/SimulationPage'
import ReglesPage from './pages/ReglesPage'
import RecommandationsListPage from './pages/RecommandationsListPage'
import CreateRecommandationPage from './pages/CreateRecommandationPage'
import ActionDetailPage from './pages/ActionDetailPage'
import ImpactSimulationPage from './pages/ImpactSimulationPage'
import DemoPage from './pages/DemoPage'
import DashboardPage from './pages/DashboardPage'
import ForecastPage from './pages/ForecastPage'
import AlertsPage from './pages/AlertsPage'
import InfosPage from './pages/InfosPage'
import './App.css'

export default function App() {
  return (
    <DataProvider>
    <RecommandationsProvider>
    <Routes>
      <Route path="/" element={<LayoutWithSidebar />}>
        <Route index element={<SimulationPage />} />
        <Route path="recommandations" element={<RecommandationsListPage />} />
        <Route path="recommandations/regles" element={<ReglesPage />} />
        <Route path="recommandations/nouvelle" element={<CreateRecommandationPage />} />
        <Route path="recommandations/:id" element={<ActionDetailPage />} />
        <Route path="recommandations/:id/simuler" element={<ImpactSimulationPage />} />
        <Route path="demo" element={<DemoPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dashboard/forecast" element={<ForecastPage />} />
        <Route path="dashboard/alerts" element={<AlertsPage />} />
        <Route path="dashboard/infos" element={<InfosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </RecommandationsProvider>
    </DataProvider>
  )
}
