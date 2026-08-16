import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient, CALENDAR_ID, SLOT_DURATION } from '@/lib/google-calendar'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const BEM_LABEL: Record<string, string> = {
  imovel: 'Imóvel', carro: 'Veículo', negocio: 'Negócio',
  reforma: 'Reforma', investidor: 'Investimento',
}

async function notificarAgendamento(nome: string, whatsapp: string, bem: string, valor: number, slotStart: Date) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const bemLabel = BEM_LABEL[bem] || bem
  const valorFmt = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  const dataFmt = slotStart.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  await resend.emails.send({
    from: 'Simulador Consórcio <onboarding@resend.dev>',
    to: ['gabrielrossingobetti@gmail.com'],
    subject: `📅 Reunião agendada — ${nome} (${dataFmt})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1e40af;margin-top:0">📅 Nova reunião no calendário!</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px">👤 Nome</td><td style="padding:8px 0;font-weight:bold;color:#111">${nome}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">📱 WhatsApp</td><td style="padding:8px 0;font-weight:bold;color:#111">${whatsapp}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">🏷️ Bem</td><td style="padding:8px 0;font-weight:bold;color:#111">${bemLabel}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">💰 Valor</td><td style="padding:8px 0;font-weight:bold;color:#111">${valorFmt}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">📆 Data/hora</td><td style="padding:8px 0;font-weight:bold;color:#1e40af">${dataFmt}</td></tr>
        </table>
        <a href="https://wa.me/55${whatsapp}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#25d366;color:white;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
          📲 Confirmar no WhatsApp
        </a>
      </div>
    `,
  })
}

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

    // Notificação imediata por email
    await notificarAgendamento(nome, whatsapp, bem, Number(valor), slotStart).catch((e) => console.error('Erro email agendamento:', e))

    return NextResponse.json({ success: true, eventId: event.data.id })
  } catch (err) {
    console.error('Calendar book error:', err)
    return NextResponse.json({ error: 'Erro ao agendar reunião' }, { status: 500 })
  }
}
