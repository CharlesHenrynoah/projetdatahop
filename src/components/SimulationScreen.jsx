import Zone1Contexte from './Zone1Contexte'
import Zone2Parametres from './Zone2Parametres'
import Zone3Resultats from './Zone3Resultats'
import FooterSimulation from './FooterSimulation'
import './SimulationScreen.css'

export default function SimulationScreen({
  scenarios,
  scenario,
  onScenarioChange,
  params,
  onParamChange,
  onSimuler,
  onReset,
  paramsValid,
  results,
  hasSimulated,
  getStatusColor,
  etatInitial,
  simulationTimestamp,
  onVoirActionsRecommandees,
}) {
  return (
    <main className="simulation-screen">
      <Zone1Contexte
        scenarios={scenarios}
        scenario={scenario}
        onScenarioChange={onScenarioChange}
      />
      <div className="simulation-content">
        <Zone2Parametres
          params={params}
          onParamChange={onParamChange}
          onSimuler={onSimuler}
          paramsValid={paramsValid}
        />
        <Zone3Resultats
          results={results}
          hasSimulated={hasSimulated}
          getStatusColor={getStatusColor}
          etatInitial={etatInitial}
          simulationTimestamp={simulationTimestamp}
          onVoirActionsRecommandees={onVoirActionsRecommandees}
        />
      </div>
      <FooterSimulation onReset={onReset} hasSimulated={hasSimulated} />
    </main>
  )
}
