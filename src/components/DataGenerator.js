// src/components/DataGenerator.js
// Données UNIQUEMENT depuis le fichier public/hospital_data.json (export du notebook).
// Aucune donnée fictive générée : si le fichier est absent, les données restent vides.
export class HospitalDataGenerator {
  constructor() {
    this.data = []
  }

  /** Connecte l'app au fichier de données (export du notebook → public/hospital_data.json) */
  setDataFromFile(jsonArray) {
    if (!Array.isArray(jsonArray)) return
    this.data = jsonArray.length === 0
      ? []
      : jsonArray.map((row, i) => ({
          id: row.id ?? i + 1,
          date: row.date,
          admissions: row.admissions ?? 0,
          occupiedBeds: row.occupiedBeds ?? row.lits_occupees ?? 0,
          availableStaff: row.availableStaff ?? row.personnel_present ?? 0,
          stockLevel: row.stockLevel ?? 85,
          service: row.service ?? 'urgences',
          dayOfWeek: new Date(row.date).getDay(),
          isWeekend: [0, 6].includes(new Date(row.date).getDay()),
        }))
  }

  hasData() {
    return this.data.length > 0
  }

  getLatest() {
    return this.data.length > 0 ? this.data[this.data.length - 1] : null
  }

  getLastNDays(n) {
    return this.data.slice(-Math.max(0, n))
  }

  /**
   * Prévisions basées sur les données réelles du fichier :
   * - ratios lits/admissions et tendance personnel calculés sur les derniers jours
   * - continuité avec le dernier jour (pas de saut au premier jour de prévision)
   * - variation déterministe pour reproductibilité
   */
  getForecast(days = 14) {
    const latest = this.getLatest()
    if (!latest) return []
    const recent = this.getLastNDays(Math.min(14, this.data.length))
    if (recent.length === 0) return []

    // Ratios issus des données réelles (derniers jours)
    const sumAdm = recent.reduce((s, d) => s + d.admissions, 0)
    const sumBeds = recent.reduce((s, d) => s + d.occupiedBeds, 0)
    const sumStaff = recent.reduce((s, d) => s + d.availableStaff, 0)
    const ratioBedsPerAdmission = sumAdm > 0 ? sumBeds / sumAdm : latest.occupiedBeds / Math.max(1, latest.admissions)
    const avgStaff = recent.length > 0 ? sumStaff / recent.length : latest.availableStaff
    const avgAdmissions = sumAdm / recent.length

    // Légère tendance admissions (dernier vs moyenne) pour prolonger la courbe
    const trendAdm = avgAdmissions > 0 ? (latest.admissions - avgAdmissions) / avgAdmissions : 0
    const cap = (v, min, max) => Math.round(Math.max(min, Math.min(max, v)))

    const forecast = []
    for (let i = 1; i <= days; i++) {
      const date = new Date(latest.date)
      date.setDate(date.getDate() + i)
      const month = date.getMonth()
      const seasonalFactor = month === 0 || month === 1 ? 1.02 : month === 6 || month === 7 ? 1.01 : 0.99
      // J+1 proche du dernier jour, puis évolution avec tendance + saisonnalité (déterministe via i)
      const drift = 1 + trendAdm * 0.3 + (seasonalFactor - 1) + (i % 3 === 0 ? 0.01 : i % 3 === 1 ? -0.01 : 0)
      const admissions = cap(
        latest.admissions * (1 + (drift - 1) * Math.min(1, i / 7)),
        0,
        600
      )
      const occupiedBeds = cap(
        Math.round(admissions * ratioBedsPerAdmission),
        0,
        1780
      )
      const availableStaff = cap(
        Math.round(avgStaff + (latest.availableStaff - avgStaff) * Math.max(0, 1 - i / 14)),
        160,
        240
      )
      forecast.push({
        date: date.toISOString().split('T')[0],
        admissions,
        occupiedBeds,
        availableStaff,
        uncertainty: Math.min(35, 10 + i * 1.5),
      })
    }
    return forecast
  }
}

export const hospitalData = new HospitalDataGenerator()
