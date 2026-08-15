import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient, CALENDAR_ID, SLOT_DURATION } from '@/lib/google-calendar'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, whatsapp, bem, valor, slotIso } = body

    if (!nome || !whatsapp || !bem || !slotIso) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const slotStart = new Date(slotIso)
    const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION * 60 * 1000)

    // Cria evento no Google Calendar
    const calendar = getCalendarClient()
    const event = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `Reunião Consórcio — ${nome}`,
        description: `WhatsApp: ${whatsapp}\nBem: ${bem}\nValor da carta: R$ ${Number(valor).toLocaleString('pt-BR')}`,
        start: { dateTime: slotStart.toISOString(), timeZone: 'America/Sao_Paulo' },
        end: { dateTime: slotEnd.toISOString(), timeZone: 'America/Sao_Paulo' },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 60 },
          ],
        },
      },
    })

    // Salva no Supabase
    await supabase.from('agendamentos').insert({
      nome,
      whatsapp,
      bem,
      valor: Number(valor),
      slot_inicio: slotStart.toISOString(),
      slot_fim: slotEnd.toISOString(),
      google_event_id: event.data.id,
      status: 'agendado',
    })

    return NextResponse.json({ success: true, eventId: event.data.id })
  } catch (err) {
    console.error('Calendar book error:', err)
    return NextResponse.json({ error: 'Erro ao agendar reunião' }, { status: 500 })
  }
}
