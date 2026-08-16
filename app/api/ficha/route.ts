import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

function formatValor(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

const BEM_LABEL: Record<string, string> = {
  imovel: 'Imóvel', carro: 'Veículo', negocio: 'Negócio',
  reforma: 'Reforma', investidor: 'Investimento',
}

async function notificarFicha(body: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const bem = BEM_LABEL[body.bem as string] || (body.bem as string)
  const valor = formatValor(Number(body.valor))

  await resend.emails.send({
    from: 'Simulador Consórcio <onboarding@resend.dev>',
    to: ['gabrielrossingobetti@gmail.com'],
    subject: `📋 Proposta solicitada — ${body.nome} (${bem} ${valor})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#c0392b;margin-top:0">📋 Alguém quer proposta!</h2>
        <p style="color:#555;margin-bottom:16px">Preencheu o formulário <strong>"Quero minha proposta"</strong> no simulador.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px">👤 Nome</td><td style="padding:8px 0;font-weight:bold;color:#111">${body.nome}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">📱 WhatsApp</td><td style="padding:8px 0;font-weight:bold;color:#111">${body.telefone}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">🪪 CPF</td><td style="padding:8px 0;font-weight:bold;color:#111">${body.cpf}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">📧 E-mail</td><td style="padding:8px 0;font-weight:bold;color:#111">${body.email}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">🏷️ Bem</td><td style="padding:8px 0;font-weight:bold;color:#111">${bem}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">💰 Valor</td><td style="padding:8px 0;font-weight:bold;color:#111">${valor}</td></tr>
        </table>
        <a href="https://wa.me/55${body.telefone}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#25d366;color:white;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
          📲 Chamar no WhatsApp agora
        </a>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await supabase.from('fichas_cadastrais').insert(body)
    await notificarFicha(body).catch((e) => console.error('Erro email ficha:', e))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Ficha error:', err)
    return NextResponse.json({ error: 'Erro ao salvar ficha' }, { status: 500 })
  }
}
