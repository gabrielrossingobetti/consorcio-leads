import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

export function getCalendarClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set')
  const credentials = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))
  const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES })
  return google.calendar({ version: 'v3', auth })
}

export const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!

// Horários de trabalho: seg-dom 9:30-19:00, slots de 30min
export const WORK_HOURS = { start: 9 * 60 + 30, end: 19 * 60 } // minutos desde meia-noite
export const SLOT_DURATION = 30 // minutos

// BRT = UTC-3 (Brazil Standard Time, sem DST desde 2019)
const BRT_OFFSET_HOURS = 3

export function generateSlots(date: Date): Date[] {
  const slots: Date[] = []
  // Converte horários BRT para UTC adicionando 3h
  const start = new Date(date)
  start.setUTCHours(Math.floor(WORK_HOURS.start / 60) + BRT_OFFSET_HOURS, WORK_HOURS.start % 60, 0, 0)
  const end = new Date(date)
  end.setUTCHours(Math.floor(WORK_HOURS.end / 60) + BRT_OFFSET_HOURS, WORK_HOURS.end % 60, 0, 0)

  let current = new Date(start)
  while (current < end) {
    slots.push(new Date(current))
    current = new Date(current.getTime() + SLOT_DURATION * 60 * 1000)
  }
  return slots
}
