import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

function formatValor(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

async function notificarEmail(body: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const bemLabel: Record<string, string> = {
    imovel: 'Imóvel', carro: 'Carro', moto: 'Moto', negocio: 'Negócio',
    reforma: 'Reforma', investidor: 'Investidor',
  }
  const bem = bemLabel[body.bem as string] || (body.bem as string)
  const valor = formatValor(Number(body.valor))
  const economia = formatValor(Number(body.economiaTotal))
  const parcela = formatValor(Number(body.parcelaConsorcio))

  await resend.emails.send({
    from: 'Simulador Consórcio <onboarding@resend.dev>',
    to: ['gabrielrossingobetti@gmail.com'],
    subject: `🔔 Novo lead — ${body.nome} (${bem} ${valor})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#c0392b;margin-top:0">🔔 Novo lead no simulador!</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px">👤 Nome</td><td style="padding:8px 0;font-weight:bold;color:#111">${body.nome}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">📱 WhatsApp</td><td style="padding:8px 0;font-weight:bold;color:#111">${body.whatsapp}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">🏷️ Bem</td><td style="padding:8px 0;font-weight:bold;color:#111">${bem}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">💰 Valor do bem</td><td style="padding:8px 0;font-weight:bold;color:#111">${valor}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">📉 Parcela consórcio</td><td style="padding:8px 0;font-weight:bold;color:#111">${parcela}/mês</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">✅ Economia total</td><td style="padding:8px 0;font-weight:bold;color:#16a34a">${economia}</td></tr>
        </table>
        <a href="https://wa.me/55${body.whatsapp}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#25d366;color:white;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
          📲 Chamar no WhatsApp agora
        </a>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabaseAdmin
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

    // Envia email com todos os dados completos
    await notificarEmail(body).catch((e) => console.error('Erro email:', e))

    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('Erro ao salvar simulação:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
