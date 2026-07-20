import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

function formatValor(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

async function notificarEmail(body: {
  nome: string
  whatsapp: string
  bem: string
  valor: number
  ja_tentou_financiar?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const bemLabel: Record<string, string> = {
    imovel: 'Imóvel', carro: 'Carro', negocio: 'Negócio',
    reforma: 'Reforma', investidor: 'Investidor',
  }
  const bem = bemLabel[body.bem] || body.bem
  const valor = formatValor(body.valor)
  const perfil = body.ja_tentou_financiar || '—'

  await resend.emails.send({
    from: 'Simulador Consórcio <onboarding@resend.dev>',
    to: ['gabrielrossingobetti@gmail.com'],
    subject: `🔔 Novo lead — ${body.nome} (${bem} ${valor})`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1e40af;margin-top:0">🔔 Novo lead no simulador!</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;width:120px">👤 Nome</td><td style="padding:8px 0;font-weight:bold;color:#111">${body.nome}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">📱 WhatsApp</td><td style="padding:8px 0;font-weight:bold;color:#111">${body.whatsapp}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">🏷️ Bem</td><td style="padding:8px 0;font-weight:bold;color:#111">${bem}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">💰 Valor</td><td style="padding:8px 0;font-weight:bold;color:#111">${valor}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">📋 Perfil</td><td style="padding:8px 0;font-weight:bold;color:#111">${perfil}</td></tr>
        </table>
        <a href="https://wa.me/55${body.whatsapp}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#25d366;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
          Chamar no WhatsApp
        </a>
      </div>
    `,
  })
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, valor, ja_tentou_financiar } = body
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('leads_captacao')
      .update({ valor: valor ?? null, ja_tentou_financiar: ja_tentou_financiar || null })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao atualizar lead:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Salva o lead
    const { data: lead, error: leadError } = await supabaseAdmin
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
      await supabaseAdmin
        .from('simulacoes')
        .update({ converteu_lead: true })
        .eq('id', body.simulacao_id)
    }

    // Email enviado pela rota /api/simulacao (quando tiver todos os dados)

    return NextResponse.json({ id: lead.id, success: true })
  } catch (err) {
    console.error('Erro ao salvar lead:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
