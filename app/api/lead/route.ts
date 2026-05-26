import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Salva o lead
    const { data: lead, error: leadError } = await supabase
      .from('leads_captacao')
      .insert({
        nome: body.nome,
        whatsapp: body.whatsapp,
        email: body.email || null,
        bem: body.bem,
        valor: body.valor,
        simulacao_id: body.simulacao_id || null,
        status: 'novo',
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_content: body.utm_content || null,
        ja_tentou_financiar: body.ja_tentou_financiar || null,
      })
      .select('id')
      .single()

    if (leadError) throw leadError

    // Marca a simulação como convertida
    if (body.simulacao_id) {
      await supabase
        .from('simulacoes')
        .update({ converteu_lead: true })
        .eq('id', body.simulacao_id)
    }

    return NextResponse.json({ id: lead.id, success: true })
  } catch (err) {
    console.error('Erro ao salvar lead:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
