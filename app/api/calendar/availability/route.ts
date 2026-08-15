import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient, CALENDAR_ID, generateSlots, SLOT_DURATION } from '@/lib/google-calendar'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date') // YYYY-MM-DD
    if (!dateStr) return NextResponse.json({ error: 'date required' }, { status: 400 })

    const date = new Date(dateStr + 'T00:00:00-03:00')
    const slots = generateSlots(date)

    // Busca eventos existentes no dia
    const calendar = getCalendarClient()
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const events = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,
    })

    const busyRanges = (events.data.items || []).map(e => ({
      start: new Date(e.start?.dateTime || e.start?.date || ''),
      end: new Date(e.end?.dateTime || e.end?.date || ''),
    }))

    // Filtra slots livres
    const now = new Date()
    const availableSlots = slots
      .filter(slot => {
        // Não mostrar horários passados
        if (slot <= now) return false
        const slotEnd = new Date(slot.getTime() + SLOT_DURATION * 60 * 1000)
        // Verifica conflito com eventos existentes
        return !busyRanges.some(busy => slot < busy.end && slotEnd > busy.start)
      })
      .map(slot => slot.toISOString())

    return NextResponse.json({ slots: availableSlots })
  } catch (err) {
    console.error('Calendar availability error:', err)
    return NextResponse.json({ error: 'Erro ao buscar disponibilidade' }, { status: 500 })
  }
}
