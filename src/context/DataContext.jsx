import { createContext, useContext, useState, useEffect } from 'react'
import { hospitalData } from '../components/DataGenerator'

const TOTAL_BEDS = 1800
const REF_STAFF = 220

/** À partir du dernier enregistrement du fichier, calcule { occupation, admissions, rh } pour la démo */
function computeDonnesAvantFromRaw(rawArray) {
  if (!Array.isArray(rawArray) || rawArray.length === 0) return null
  const last = rawArray[rawArray.length - 1]
  const occupiedBeds = last.occupiedBeds ?? last.lits_occupees ?? 0
  const admissions = last.admissions ?? 0
  const availableStaff = last.availableStaff ?? last.personnel_present ?? 0
  const occupation = TOTAL_BEDS > 0 ? Math.round((occupiedBeds / TOTAL_BEDS) * 100) : 0
  const rh = REF_STAFF > 0 ? Math.round((availableStaff / REF_STAFF) * 100) : 0
  return { occupation, admissions, rh }
}

const DataContext = createContext({
  dataReady: false,
  dataFromFile: false,
  dataSource: null,
  recordCount: 0,
  donnesAvantFromFile: null,
})

export function DataProvider({ children }) {
  const [dataReady, setDataReady] = useState(false)
  const [dataFromFile, setDataFromFile] = useState(false)
  const [dataSource, setDataSource] = useState(null)
  const [recordCount, setRecordCount] = useState(0)
  const [donnesAvantFromFile, setDonnesAvantFromFile] = useState(null)

  useEffect(() => {
    fetch('/hospital_data.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const array = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : [])
        hospitalData.setDataFromFile(array)
        const hasData = array.length > 0
        setDataFromFile(hasData)
        setDataSource('hospital_data.json')
        setRecordCount(array.length)
        setDonnesAvantFromFile(hasData ? computeDonnesAvantFromRaw(array) : null)
        setDataReady(true)
      })
      .catch(() => {
        setDataReady(true)
        setDataFromFile(false)
        setDataSource(null)
        setRecordCount(0)
        setDonnesAvantFromFile(null)
      })
  }, [])

  return (
    <DataContext.Provider value={{ dataReady, dataFromFile, dataSource, recordCount, donnesAvantFromFile }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
