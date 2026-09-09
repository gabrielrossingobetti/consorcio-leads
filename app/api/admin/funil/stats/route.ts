import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Funil de verdade: conta PESSOAS distintas por etapa, não eventos soltos.
 *
 * Antes somava ocorrências, então uma etapa podia aparecer com menos gente
 * que a seguinte — a mesma pessoa contava várias vezes num passo e nenhuma
 * no outro. Agora cada etapa conta sessões únicas, e o funil só encolhe.
 *
 * Sessões antigas (antes desta mudança) não têm identificador; para não
 * sumirem do relatório, cada evento sem sessão vale como uma pessoa.
 */
const DIAS: Record<string, number | null> = {
  hoje: 0,
  '7d': 7,
  '30d': 30,
  tudo: null,
}

export async function GET(req: NextRequest) {
  const periodo = req.nextUrl.searchParams.get('periodo') ?? '30d'
  const dias = periodo in DIAS ? DIAS[periodo] : 30

  let q = supabase.from('funnel_events').select('evento, sessao, id, created_at')

  if (dias !== null) {
    const desde = new Date()
    if (dias === 0) desde.setHours(0, 0, 0, 0)
    else desde.setDate(desde.getDate() - dias)
    q = q.gte('created_at', desde.toISOString())
  }

  const { data, error } = await q
  if (error) return NextResponse.json({ counts: [], erro: error.message }, { status: 500 })

  // etapa -> conjunto de pessoas
  const porEtapa = new Map<string, Set<string>>()
  const todasPessoas = new Set<string>()

  for (const row of data ?? []) {
    const pessoa = row.sessao || `evt:${row.id}`
    if (!porEtapa.has(row.evento)) porEtapa.set(row.evento, new Set())
    porEtapa.get(row.evento)!.add(pessoa)
    todasPessoas.add(pessoa)
  }

  const counts = Array.from(porEtapa, ([evento, pessoas]) => ({
    evento,
    count: pessoas.size,
  }))

  return NextResponse.json({ counts, pessoas: todasPessoas.size, periodo })
}
