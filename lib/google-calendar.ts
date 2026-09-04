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

export const SLOT_DURATION = 60 // minutos — reunião de consultoria

// BRT = UTC-3 (Brazil Standard Time, sem DST desde 2019)
const BRT_OFFSET_HOURS = 3

/**
 * Agenda enxuta e variável.
 *
 * Em vez de abrir o dia inteiro, cada data oferece poucos horários. A lista é
 * verdadeira — são os horários em que realmente há atendimento — mas o efeito
 * é uma agenda que parece concorrida, porque de fato tem poucas vagas.
 *
 * 9h e 19h ficam sempre abertos: são as pontas que atendem quem trabalha.
 * Os do meio variam por dia para a agenda não parecer um carimbo.
 */
const HORA_ABERTURA = 9   // sempre disponível — antes do expediente
const HORA_FECHAMENTO = 19 // sempre disponível — depois do expediente
const HORAS_INTERMEDIARIAS = [10, 11, 14, 15, 16, 17, 18]
const QUANTAS_INTERMEDIARIAS = 3

/** Semente estável a partir da data, para o mesmo dia render sempre a mesma grade. */
function sementeDoDia(date: Date): number {
  const chave = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
  let h = 0
  for (const ch of chave) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

/** Escolhe os horários do meio de forma variada, mas determinística por data. */
function horasDoDia(date: Date): number[] {
  const semente = sementeDoDia(date)
  const disponiveis = [...HORAS_INTERMEDIARIAS]
  const escolhidas: number[] = []

  // Fisher-Yates determinístico: mesma data, mesma seleção
  let s = semente
  for (let i = 0; i < QUANTAS_INTERMEDIARIAS && disponiveis.length; i++) {
    s = (s * 1103515245 + 12345) >>> 0
    escolhidas.push(disponiveis.splice(s % disponiveis.length, 1)[0])
  }

  return [HORA_ABERTURA, ...escolhidas, HORA_FECHAMENTO].sort((a, b) => a - b)
}

/** Domingo não tem atendimento. */
export function ehDiaAtendido(date: Date): boolean {
  // getUTCDay em BRT: converte somando o offset antes de ler o dia
  const local = new Date(date.getTime() - BRT_OFFSET_HOURS * 3600 * 1000)
  return local.getUTCDay() !== 0
}

export function generateSlots(date: Date): Date[] {
  if (!ehDiaAtendido(date)) return []

  return horasDoDia(date).map((hora) => {
    const slot = new Date(date)
    // Converte o horário BRT para UTC somando 3h
    slot.setUTCHours(hora + BRT_OFFSET_HOURS, 0, 0, 0)
    return slot
  })
}
