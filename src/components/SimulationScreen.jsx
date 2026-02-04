import Zone1Contexte from './Zone1Contexte'
import Zone2Parametres from './Zone2Parametres'
import Zone3Resultats from './Zone3Resultats'
import FooterSimulation from './FooterSimulation'

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
  llmAnalysis,
  llmLoading,
  llmIndicatorsUsed,
  onVoirActionsRecommandees,
}) {
  return (
    <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto">
      <Zone1Contexte
        scenarios={scenarios}
        scenario={scenario}
        onScenarioChange={onScenarioChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
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
          llmAnalysis={llmAnalysis}
          llmLoading={llmLoading}
          llmIndicatorsUsed={llmIndicatorsUsed}
          onVoirActionsRecommandees={onVoirActionsRecommandees}
        />
      </div>
      <FooterSimulation onReset={onReset} hasSimulated={hasSimulated} />
    </main>
  )
}
