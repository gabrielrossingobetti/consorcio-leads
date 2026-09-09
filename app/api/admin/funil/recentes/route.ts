import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DIAS: Record<string, number | null> = { hoje: 0, '7d': 7, '30d': 30, tudo: null }

/**
 * Atividade recente. Mostra só os eventos que valem acompanhar — os passos
 * intermediários poluem a lista sem dizer nada que o funil acima já não diga.
 */
const RELEVANTES = ['reuniao_confirmada', 'whatsapp_projeto_enviado', 'contato_no_agendamento']

export async function GET(req: NextRequest) {
  const periodo = req.nextUrl.searchParams.get('periodo') ?? '30d'
  const dias = periodo in DIAS ? DIAS[periodo] : 30

  let q = supabase
    .from('funnel_events')
    .select('created_at, evento, nome, whatsapp, bem, valor')
    .in('evento', RELEVANTES)
    .order('created_at', { ascending: false })
    .limit(50)

  if (dias !== null) {
    const desde = new Date()
    if (dias === 0) desde.setHours(0, 0, 0, 0)
    else desde.setDate(desde.getDate() - dias)
    q = q.gte('created_at', desde.toISOString())
  }

  const { data } = await q
  return NextResponse.json({ recentes: data ?? [] })
}
