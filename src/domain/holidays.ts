import { addDays } from 'date-fns'

export type Holiday = {
  date: string // YYYY-MM-DD (lokales Datum)
  name: string
}

function toIsoDateLocal(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Berechnet Ostersonntag (gregorianischer Kalender) nach dem
 * Meeus/Jones/Butcher-Algorithmus.
 */
export function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 = März, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/**
 * Gesetzliche Feiertage in NRW mit christlichem Ursprung.
 * (Nicht enthalten: Neujahr, 1. Mai, Tag der Deutschen Einheit usw.)
 */
export function getNrwChristianPublicHolidays(year: number): Holiday[] {
  const easter = easterSunday(year)

  const list: Holiday[] = [
    { date: toIsoDateLocal(addDays(easter, -2)), name: 'Karfreitag' },
    { date: toIsoDateLocal(addDays(easter, 1)), name: 'Ostermontag' },
    { date: toIsoDateLocal(addDays(easter, 39)), name: 'Christi Himmelfahrt' },
    { date: toIsoDateLocal(addDays(easter, 50)), name: 'Pfingstmontag' },
    { date: toIsoDateLocal(addDays(easter, 60)), name: 'Fronleichnam' },
    { date: `${year}-11-01`, name: 'Allerheiligen' },
    { date: `${year}-12-25`, name: '1. Weihnachtstag' },
    { date: `${year}-12-26`, name: '2. Weihnachtstag' },
  ]

  return list
}

