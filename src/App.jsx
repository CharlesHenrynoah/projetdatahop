import { Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import SimulationPage from './pages/SimulationPage'
import ReglesPage from './pages/ReglesPage'
import RecommandationsListPage from './pages/RecommandationsListPage'
import ActionDetailPage from './pages/ActionDetailPage'
import ImpactSimulationPage from './pages/ImpactSimulationPage'
import DemoPage from './pages/DemoPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<SimulationPage />} />
        <Route path="recommandations" element={<RecommandationsListPage />} />
        <Route path="recommandations/regles" element={<ReglesPage />} />
        <Route path="recommandations/:id" element={<ActionDetailPage />} />
        <Route path="recommandations/:id/simuler" element={<ImpactSimulationPage />} />
        <Route path="demo" element={<DemoPage />} />
      </Route>
    </Routes>
  )
}
