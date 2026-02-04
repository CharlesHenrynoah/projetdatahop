import { createContext, useContext, useState } from 'react'
import { RECOMMANDATIONS_MOCK } from '../data/recommandations'

const RecommandationsContext = createContext({
  recommandations: [],
  setRecommandations: () => {},
})

export function RecommandationsProvider({ children }) {
  const [recommandations, setRecommandations] = useState(RECOMMANDATIONS_MOCK)
  return (
    <RecommandationsContext.Provider value={{ recommandations, setRecommandations }}>
      {children}
    </RecommandationsContext.Provider>
  )
}

export function useRecommandations() {
  const ctx = useContext(RecommandationsContext)
  if (!ctx) throw new Error('useRecommandations must be used within RecommandationsProvider')
  return ctx
}
