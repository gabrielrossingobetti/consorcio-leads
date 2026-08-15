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

const EVENTO_LABEL: Record<string, string> = {
  step_escolha:        '👀 Chegou na escolha',
  clicou_agendar:      '📅 Clicou em Agendar reunião',
  clicou_fechar:       '✊ Clicou em Quero entrar',
  fechar_form_abriu:   '📝 Abriu a ficha',
  ficha_enviada:       '✅ Enviou a ficha',
  reuniao_confirmada:  '🗓️ Confirmou a reunião',
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

export default function AdminFunil() {
  const [counts, setCounts] = useState<FunnelRow[]>([])
  const [recentes, setRecentes] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/funil/stats'),
        fetch('/api/admin/funil/recentes'),
      ])
      const d1 = await r1.json()
      const d2 = await r2.json()
      setCounts(d1.counts ?? [])
      setRecentes(d2.recentes ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const total = counts.find(r => r.evento === 'step_escolha')?.count ?? 0
  const agendaram = counts.find(r => r.evento === 'reuniao_confirmada')?.count ?? 0
  const fecharam = counts.find(r => r.evento === 'ficha_enviada')?.count ?? 0

  const ORDEM = [
    'step_escolha',
    'clicou_agendar',
    'clicou_fechar',
    'fechar_form_abriu',
    'ficha_enviada',
    'reuniao_confirmada',
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Funil de leads</h1>
            <p className="text-sm text-gray-400">Últimos 30 dias</p>
          </div>
          <button
            onClick={load}
            className="text-sm text-blue-600 hover:underline"
          >
            Atualizar
          </button>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Chegaram na escolha', value: total, color: 'text-gray-900' },
            { label: 'Reuniões confirmadas', value: agendaram, color: 'text-blue-700' },
            { label: 'Fichas enviadas', value: fecharam, color: 'text-green-700' },
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
          ) : (
            <div className="space-y-3">
              {ORDEM.map(evento => {
                const row = counts.find(r => r.evento === evento)
                const count = row?.count ?? 0
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={evento}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{EVENTO_LABEL[evento] ?? evento}</span>
                      <span className="font-bold text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
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
