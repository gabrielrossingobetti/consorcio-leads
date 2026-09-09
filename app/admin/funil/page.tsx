'use client'

import { useEffect, useState } from 'react'

interface FunnelRow {
  evento: string
  count: number
}

interface LeadRow {
  created_at: string
  evento: string
  nome: string | null
  whatsapp: string | null
  bem: string | null
  valor: number | null
}

// Etapas do funil atual. As antigas (ficha, CPF, "quero entrar") saíram do
// fluxo, então medir por elas mostrava zero e escondia onde a pessoa some.
const EVENTO_LABEL: Record<string, string> = {
  step_escolha:            '👀 Viu as duas opções',
  abriu_agenda:            '📅 Abriu o calendário',
  clicou_agendar:          '📅 Escolheu consultoria',
  horario_escolhido:       '🕐 Escolheu o horário',
  contato_no_agendamento:  '✍️ Deixou o contato',
  reuniao_confirmada:      '✅ Consultoria confirmada',
  clicou_whats_projeto:    '💬 Escolheu WhatsApp',
  whatsapp_projeto_enviado:'💬 Abriu a conversa',
}

function formatBem(bem: string | null) {
  if (bem === 'imovel') return 'Imóvel'
  if (bem === 'veiculo') return 'Veículo'
  return bem ?? '—'
}

function formatValor(v: number | null) {
  if (!v) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

const PERIODOS = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7d',   label: '7 dias' },
  { id: '30d',  label: '30 dias' },
  { id: 'tudo', label: 'Tudo' },
]

export default function AdminFunil() {
  const [counts, setCounts] = useState<FunnelRow[]>([])
  const [recentes, setRecentes] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('7d')

  async function load(p = periodo) {
    setLoading(true)
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/admin/funil/stats?periodo=${p}`),
        fetch(`/api/admin/funil/recentes?periodo=${p}`),
      ])
      const d1 = await r1.json()
      const d2 = await r2.json()
      setCounts(d1.counts ?? [])
      setRecentes(d2.recentes ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(periodo) }, [periodo])

  // Duas portas de entrada: quem viu as opções e quem caiu direto no
  // calendário vindo do bloco de contemplação.
  const total =
    (counts.find(r => r.evento === 'step_escolha')?.count ?? 0) +
    (counts.find(r => r.evento === 'abriu_agenda')?.count ?? 0)
  const agendaram = counts.find(r => r.evento === 'reuniao_confirmada')?.count ?? 0
  const whats = counts.find(r => r.evento === 'whatsapp_projeto_enviado')?.count ?? 0

  // O funil se divide depois que a pessoa vê as opções. Medir os dois
  // caminhos numa lista só faz a queda entre eles virar número sem sentido.
  const RAMO_AGENDA = [
    'clicou_agendar',
    'horario_escolhido',
    'contato_no_agendamento',
    'reuniao_confirmada',
  ]
  const RAMO_WHATS = [
    'clicou_whats_projeto',
    'whatsapp_projeto_enviado',
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Funil de leads</h1>
            <p className="text-sm text-gray-400">Pessoas, não cliques</p>
          </div>
          <button onClick={() => load(periodo)} className="text-sm text-blue-600 hover:underline">
            Atualizar
          </button>
        </div>

        {/* Período */}
        <div className="flex gap-2 mb-6">
          {PERIODOS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setPeriodo(id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                periodo === id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Entraram no funil', value: total, color: 'text-gray-900' },
            { label: 'Consultorias marcadas', value: agendaram, color: 'text-blue-700' },
            { label: 'Conversas no WhatsApp', value: whats, color: 'text-green-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`text-3xl font-bold ${color}`}>{loading ? '…' : value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Barra de funil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Etapas do funil</h2>
          {loading ? (
            <div className="text-gray-400 text-sm">Carregando...</div>
          ) : total === 0 ? (
            <div className="text-gray-400 text-sm">Ninguém entrou no funil neste período.</div>
          ) : (
            <>
              {/* Entrada — comum aos dois caminhos */}
              <Etapa rotulo="Entraram no funil" count={total} total={total} cor="bg-gray-800" />

              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Ramo titulo="Caminho da consultoria" etapas={RAMO_AGENDA} counts={counts} total={total} cor="bg-blue-500" labels={EVENTO_LABEL} />
                <Ramo titulo="Caminho do WhatsApp" etapas={RAMO_WHATS} counts={counts} total={total} cor="bg-green-600" labels={EVENTO_LABEL} />
              </div>
            </>
          )}
        </div>

        {/* Leads recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Atividade recente</h2>
          {loading ? (
            <div className="text-gray-400 text-sm">Carregando...</div>
          ) : recentes.length === 0 ? (
            <div className="text-gray-400 text-sm">Nenhuma atividade ainda.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentes.map((row, i) => (
                <div key={i} className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-800">
                      {EVENTO_LABEL[row.evento] ?? row.evento}
                      {row.nome && <span className="font-semibold"> — {row.nome}</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatBem(row.bem)}{row.valor ? ` · ${formatValor(row.valor)}` : ''}
                      {row.whatsapp ? ` · ${row.whatsapp}` : ''}
                    </div>
                  </div>
                  <span className="text-xs text-gray-300 whitespace-nowrap">{timeAgo(row.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


/** Uma etapa do funil: rótulo, quantas pessoas e a barra proporcional. */
function Etapa({ rotulo, count, total, cor, perdeu }: {
  rotulo: string; count: number; total: number; cor: string; perdeu?: number
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      {perdeu ? (
        <div className="flex items-center gap-1.5 pl-1 py-1 text-[11px] text-red-400">
          <span>↓</span>
          <span>{perdeu} {perdeu === 1 ? 'saiu' : 'saíram'} aqui</span>
        </div>
      ) : null}
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{rotulo}</span>
        <span className="font-bold text-gray-900">
          {count} <span className="text-gray-400 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${cor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Um dos dois caminhos possíveis depois que a pessoa escolhe como falar. */
function Ramo({ titulo, etapas, counts, total, cor, labels }: {
  titulo: string
  etapas: string[]
  counts: FunnelRow[]
  total: number
  cor: string
  labels: Record<string, string>
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{titulo}</h3>
      <div className="space-y-3">
        {etapas.map((evento, i) => {
          const count = counts.find(r => r.evento === evento)?.count ?? 0
          const anterior = i > 0 ? (counts.find(r => r.evento === etapas[i - 1])?.count ?? 0) : null
          const perdeu = anterior !== null && anterior > count ? anterior - count : 0
          return (
            <Etapa
              key={evento}
              rotulo={labels[evento] ?? evento}
              count={count}
              total={total}
              cor={cor}
              perdeu={perdeu}
            />
          )
        })}
      </div>
    </div>
  )
}
