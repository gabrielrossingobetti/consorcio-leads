import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notasPlanejamento, validarPlanejamento } from '@/lib/planejamento.mjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 })
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Formato inválido.' }, { status: 415 })
  }

  let body: unknown
  try {
    const raw = await request.text()
    if (raw.length > 12000) {
      return NextResponse.json({ error: 'Pedido muito grande.' }, { status: 413 })
    }
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 })
  }

  const validacao = validarPlanejamento(body)
  if (!validacao.ok) {
    return NextResponse.json({ error: validacao.error }, { status: 400 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json(
      { error: 'O envio está indisponível. Tente novamente em instantes.' },
      { status: 503 },
    )
  }

  try {
    const data = validacao.data
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const row = {
      id: data.request_id,
      nome: data.nome,
      whatsapp: data.whatsapp,
      bem: data.bem,
      valor: data.valor,
      status: 'novo',
      notas: notasPlanejamento(data),
      utm_source: data.atribuicao.utm_source || null,
      utm_medium: data.atribuicao.utm_medium || null,
      utm_campaign: data.atribuicao.utm_campaign || null,
      utm_content: data.atribuicao.utm_content || null,
    }
    const { error } = await db.from('leads_captacao').insert(row)
    if (error?.code === '23505') {
      // Uma resposta perdida pode levar a uma repetição. Só confirmar se
      // o registro já salvo corresponde exatamente a este mesmo pedido.
      const { data: anterior, error: consultaErro } = await db
        .from('leads_captacao')
        .select('id,nome,whatsapp,bem,valor,notas')
        .eq('id', row.id)
        .single()
      if (!consultaErro && anterior &&
          anterior.nome === row.nome && anterior.whatsapp === row.whatsapp &&
          anterior.bem === row.bem && Number(anterior.valor) === row.valor &&
          anterior.notas === row.notas) {
        return NextResponse.json({ success: true, id: row.id })
      }
    }
    if (error) {
      console.error('Falha ao salvar planejamento:', error.code)
      return NextResponse.json(
        { error: 'Não conseguimos salvar seu pedido. Seus dados continuam no formulário para tentar novamente.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ success: true, id: row.id }, { status: 201 })
  } catch {
    console.error('Falha de conexão ao salvar planejamento')
    return NextResponse.json(
      { error: 'Não conseguimos confirmar o envio. Tente novamente.' },
      { status: 503 },
    )
  }
}
