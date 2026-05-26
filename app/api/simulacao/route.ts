import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('simulacoes')
      .insert({
        bem: body.bem,
        valor: body.valor,
        parcela_consorcio: body.parcelaConsorcio,
        parcela_financiamento: body.parcelaFinanciamento,
        total_consorcio: body.totalConsorcio,
        total_financiamento: body.totalFinanciamento,
        economia_total: body.economiaTotal,
        prazo_meses: body.prazoMeses,
        converteu_lead: false,
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_content: body.utm_content || null,
        ja_tentou_financiar: body.ja_tentou_financiar || null,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('Erro ao salvar simulação:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
