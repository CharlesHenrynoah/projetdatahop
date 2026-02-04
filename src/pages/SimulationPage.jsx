import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { hospitalData } from '../components/DataGenerator'
import SimulationScreen from '../components/SimulationScreen'

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

/** Valeurs par défaut si aucun fichier de données */
const ETAT_INITIAL_FALLBACK = { admissions: 100, occupation: 82, rh: 88 }

function computeMockResults(params, scenarioId, etatInitial) {
  const factor = { epidemie: 1.35, pic_saisonnier: 1.15, greve: 0.72, exceptionnel: 1.5 }[scenarioId] ?? 1
  const admissionsApres = Math.round(etatInitial.admissions * (params.tauxAdmission / 100) * factor)
  const occupationApres = Math.min(99, Math.round(etatInitial.occupation * (100 / params.capaciteLits) * 0.95))
  const rhApres = Math.round(etatInitial.rh * (params.personnelDisponible / 100))
  return {
    admissions: { avant: etatInitial.admissions, apres: admissionsApres },
    occupation: { avant: etatInitial.occupation, apres: occupationApres },
    rh: { avant: etatInitial.rh, apres: rhApres },
  }
}

function getStatusColor(value) {
  if (value <= 70) return 'var(--color-vert)'
  if (value <= 85) return 'var(--color-orange)'
  return 'var(--color-rouge)'
}

export default function SimulationPage() {
  const navigate = useNavigate()
  const { dataFromFile, dataReady } = useData()
  const latest = hospitalData.getLatest()

  // État initial : dernier jour du fichier si disponible, sinon valeurs par défaut
  const etatInitial = useMemo(() => {
    if (dataReady && dataFromFile && latest) {
      const totalBeds = 1800
      const occupationPct = totalBeds > 0 ? Math.round((latest.occupiedBeds / totalBeds) * 100) : 0
      const rhPct = Math.round((latest.availableStaff / 220) * 100)
      return {
        admissions: latest.admissions,
        occupation: Math.min(99, occupationPct),
        rh: Math.min(100, rhPct),
      }
    }
    return ETAT_INITIAL_FALLBACK
  }, [dataReady, dataFromFile, latest])

  const [scenario, setScenario] = useState('epidemie')
  const [params, setParams] = useState({ ...DEFAULT_PARAMS })
  const [results, setResults] = useState(null)
  const [hasSimulated, setHasSimulated] = useState(false)
  const [simulationTimestamp, setSimulationTimestamp] = useState(null)
  const [llmAnalysis, setLlmAnalysis] = useState(null)
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmIndicatorsUsed, setLlmIndicatorsUsed] = useState(false)

  const handleScenarioChange = useCallback((id) => {
    setScenario(id)
    setParams({ ...DEFAULT_PARAMS })
    setResults(null)
    setHasSimulated(false)
    setSimulationTimestamp(null)
    setLlmAnalysis(null)
    setLlmIndicatorsUsed(false)
  }, [])

  const handleParamChange = useCallback((key, value) => {
    setParams((p) => ({ ...p, [key]: value }))
  }, [])

  const handleSimuler = useCallback(async () => {
    setHasSimulated(true)
    setSimulationTimestamp(new Date())
    setLlmAnalysis(null)
    setLlmLoading(true)
    const scenarioLabel = SCENARIOS.find((s) => s.id === scenario)?.label ?? scenario
    const dataSummary = hospitalData.hasData() ? hospitalData.getLastNDays(5) : []
    let r = null
    try {
      const indicatorsRes = await fetch('/api/simulate/indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          scenarioLabel,
          params,
          etatInitial,
          dataSummary,
        }),
      })
      const indicatorsData = await indicatorsRes.json().catch(() => ({}))
      if (indicatorsData.results) {
        r = indicatorsData.results
        setLlmIndicatorsUsed(true)
      }
    } catch {
      // API indicateurs injoignable, on utilisera le calcul local
    }
    if (!r) {
      r = computeMockResults(params, scenario, etatInitial)
      setLlmIndicatorsUsed(false)
    }
    setResults(r)
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          scenarioLabel,
          params,
          etatInitial,
          results: r,
          dataSummary,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.comment) setLlmAnalysis(data.comment)
    } catch {
      // pas de backend ou erreur : on affiche rien
    } finally {
      setLlmLoading(false)
    }
  }, [params, scenario, etatInitial])

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS })
    setResults(null)
    setHasSimulated(false)
    setSimulationTimestamp(null)
    setLlmAnalysis(null)
    setLlmIndicatorsUsed(false)
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
      etatInitial={etatInitial}
      simulationTimestamp={simulationTimestamp}
      llmAnalysis={llmAnalysis}
      llmLoading={llmLoading}
      llmIndicatorsUsed={llmIndicatorsUsed}
      onVoirActionsRecommandees={() =>
        navigate('/recommandations', {
          state: {
            fromSimulation: true,
            scenario,
            scenarioLabel: SCENARIOS.find((s) => s.id === scenario)?.label,
            results,
            etatInitial,
            llmAnalysis,
          },
        })
      }
    />
  )
}
