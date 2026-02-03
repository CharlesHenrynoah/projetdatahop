import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SimulationScreen from '../components/SimulationScreen'
import '../App.css'

const SCENARIOS = [
  { id: 'epidemie', label: 'Épidémie', icon: '🦠' },
  { id: 'pic_saisonnier', label: 'Pic saisonnier', icon: '📈' },
  { id: 'greve', label: 'Grève', icon: '⚠️' },
  { id: 'exceptionnel', label: 'Événement exceptionnel', icon: '🚨' },
]

const DEFAULT_PARAMS = {
  tauxAdmission: 85,
  personnelDisponible: 90,
  capaciteLits: 78,
}

const ETAT_INITIAL = {
  admissions: 100,
  occupation: 82,
  rh: 88,
}

function computeMockResults(params, scenarioId) {
  const factor = { epidemie: 1.35, pic_saisonnier: 1.15, greve: 0.72, exceptionnel: 1.5 }[scenarioId] ?? 1
  const admissionsApres = Math.round(ETAT_INITIAL.admissions * (params.tauxAdmission / 100) * factor)
  const occupationApres = Math.min(99, Math.round(ETAT_INITIAL.occupation * (100 / params.capaciteLits) * 0.95))
  const rhApres = Math.round(ETAT_INITIAL.rh * (params.personnelDisponible / 100))
  return {
    admissions: { avant: ETAT_INITIAL.admissions, apres: admissionsApres },
    occupation: { avant: ETAT_INITIAL.occupation, apres: occupationApres },
    rh: { avant: ETAT_INITIAL.rh, apres: rhApres },
  }
}

function getStatusColor(value) {
  if (value <= 70) return 'var(--color-vert)'
  if (value <= 85) return 'var(--color-orange)'
  return 'var(--color-rouge)'
}

export default function SimulationPage() {
  const navigate = useNavigate()
  const [scenario, setScenario] = useState('epidemie')
  const [params, setParams] = useState({ ...DEFAULT_PARAMS })
  const [results, setResults] = useState(null)
  const [hasSimulated, setHasSimulated] = useState(false)
  const [simulationTimestamp, setSimulationTimestamp] = useState(null)

  const handleScenarioChange = useCallback((id) => {
    setScenario(id)
    setParams({ ...DEFAULT_PARAMS })
    setResults(null)
    setHasSimulated(false)
    setSimulationTimestamp(null)
  }, [])

  const handleParamChange = useCallback((key, value) => {
    setParams((p) => ({ ...p, [key]: value }))
  }, [])

  const handleSimuler = useCallback(() => {
    const r = computeMockResults(params, scenario)
    setResults(r)
    setHasSimulated(true)
    setSimulationTimestamp(new Date())
  }, [params, scenario])

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS })
    setResults(null)
    setHasSimulated(false)
    setSimulationTimestamp(null)
  }, [])

  const paramsValid =
    params.tauxAdmission >= 0 &&
    params.tauxAdmission <= 100 &&
    params.personnelDisponible >= 0 &&
    params.personnelDisponible <= 100 &&
    params.capaciteLits >= 0 &&
    params.capaciteLits <= 100

  return (
    <SimulationScreen
      scenarios={SCENARIOS}
      scenario={scenario}
      onScenarioChange={handleScenarioChange}
      params={params}
      onParamChange={handleParamChange}
      onSimuler={handleSimuler}
      onReset={handleReset}
      paramsValid={paramsValid}
      results={results}
      hasSimulated={hasSimulated}
      getStatusColor={getStatusColor}
      etatInitial={ETAT_INITIAL}
      simulationTimestamp={simulationTimestamp}
      onVoirActionsRecommandees={() => navigate('/recommandations')}
    />
  )
}
