'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { getAtribuicao } from '@/lib/atribuicao'
import { trackEvent } from '@/lib/gtag'
import {
  LANCES, MOMENTOS, ORCAMENTOS, PRODUTOS_PLANO,
  validarPlanejamento, type ProdutoPlano,
} from '@/lib/planejamento.mjs'

const WHATSAPP_CONSULTOR = '5511993929660'
const dinheiro = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

type Confirmacao = { id: string; valor: number; orcamento: string; momento: string; lance: string }

export default function PlanoForm({ produto }: { produto: ProdutoPlano }) {
  const config = PRODUTOS_PLANO[produto]
  const [etapa, setEtapa] = useState(1)
  const [valor, setValor] = useState(config.inicial)
  const [orcamento, setOrcamento] = useState('')
  const [momento, setMomento] = useState('')
  const [lance, setLance] = useState('')
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [ciente, setCiente] = useState(false)
  const [website, setWebsite] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  const bloqueado = useRef(false)
  const tentativa = useRef<{ assinatura: string; id: string } | null>(null)

  useEffect(() => { getAtribuicao() }, [])
  useEffect(() => {
    if (etapa > 1 || confirmacao) titulo.current?.focus({ preventScroll: true })
  }, [etapa, confirmacao])

  function continuar() {
    setErro('')
    if (etapa === 2 && (!orcamento || !momento || !lance)) {
      setErro('Escolha uma resposta em cada campo para continuar.')
      return
    }
    setEtapa(etapa + 1)
  }

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (etapa < 3) { continuar(); return }
    if (bloqueado.current) return
    setErro('')
    const payload = {
      nome, whatsapp, bem: produto, valor, orcamento, momento, lance,
      consentimento, ciente_contemplacao: ciente, website, atribuicao: getAtribuicao(),
    }
    const assinatura = JSON.stringify(payload)
    if (tentativa.current?.assinatura !== assinatura) {
      tentativa.current = { assinatura, id: crypto.randomUUID() }
    }
    const requestId = tentativa.current.id
    const validacao = validarPlanejamento({ ...payload, request_id: requestId })
    if (!validacao.ok) { setErro(validacao.error); return }

    bloqueado.current = true
    setSalvando(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      const resposta = await fetch('/api/planejamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, request_id: requestId }),
        signal: controller.signal,
      })
      const resultado = await resposta.json()
      if (!resposta.ok || resultado.success !== true || typeof resultado.id !== 'string') {
        throw new Error(resultado.error || 'Não conseguimos confirmar o envio. Tente novamente.')
      }
      setConfirmacao({ id: resultado.id, valor, orcamento, momento, lance })
      setNome('')
      setWhatsapp('')
      // Um pedido salvo ainda precisa ser validado pelo atendimento.
      // Não enviar dados pessoais nem o crédito como se fosse receita.
      try {
        trackEvent('planejamento_enviado', { bem: produto, momento, event_id: resultado.id })
      } catch { /* Uma falha de analytics não deve invalidar um contato salvo. */ }
    } catch (error) {
      setErro(error instanceof Error && error.name !== 'AbortError'
        ? error.message
        : 'Não conseguimos confirmar o envio. Seus dados foram mantidos; tente novamente.')
    } finally {
      window.clearTimeout(timeout)
      bloqueado.current = false
      setSalvando(false)
    }
  }

  if (confirmacao) {
    const mensagem = [
      'Olá! Enviei meu pedido de planejamento na Lidera.',
      'Produto: ' + (produto === 'carro' ? 'automóvel' : 'imóvel') + '.',
      'Crédito desejado: ' + dinheiro(confirmacao.valor) + '.',
      'Orçamento mensal: ' + confirmacao.orcamento + '.',
      'Momento: ' + MOMENTOS[confirmacao.momento as keyof typeof MOMENTOS] + '.',
      'Reserva: ' + LANCES[confirmacao.lance as keyof typeof LANCES] + '.',
      'Sei que a contemplação depende de sorteio ou lance, sem data garantida.',
      'Protocolo: ' + confirmacao.id,
    ].join('\n')
    return (
      <div className="lp-form lp-success" role="status">
        <span className="lp-success-icon"><Check aria-hidden="true" /></span>
        <p className="lp-eyebrow">PRIMEIRO PASSO DADO</p>
        <h3 ref={titulo} tabIndex={-1}>Seu pedido foi salvo.</h3>
        <p>Você já pode conversar com o consultor para avaliar as opções de consórcio e as condições do seu plano.</p>
        <div className="lp-summary">
          <span>Seu objetivo</span>
          <strong>{dinheiro(confirmacao.valor)} em {produto === 'carro' ? 'automóvel' : 'imóvel'}</strong>
          <small>Orçamento informado: {confirmacao.orcamento}</small>
        </div>
        <a
          className="lp-button lp-button-full"
          href={'https://wa.me/' + WHATSAPP_CONSULTOR + '?text=' + encodeURIComponent(mensagem)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('whatsapp_aberto', { bem: produto, origem: 'planejamento_salvo' })}
        >
          Continuar no WhatsApp <ArrowRight size={19} aria-hidden="true" />
        </a>
        <p className="lp-small">O WhatsApp abre com uma mensagem para você revisar e enviar.</p>
      </div>
    )
  }

  return (
    <form className="lp-form" onSubmit={enviar} aria-busy={salvando} aria-describedby={erro ? 'lp-form-error' : undefined}>
      <div className="lp-form-top">
        <span className="lp-eyebrow">SEU PLANEJAMENTO</span>
        <span className="lp-step-count">0{etapa} / 03</span>
      </div>
      <ol className="lp-stepper" aria-label="Etapas do pedido">
        {['Objetivo', 'Seu momento', 'Contato'].map((label, index) => (
          <li key={label} aria-current={etapa === index + 1 ? 'step' : undefined} className={etapa >= index + 1 ? 'is-active' : ''}>
            <span />{label}
          </li>
        ))}
      </ol>

      {etapa === 1 && (
        <div className="lp-form-stage">
          <h3 ref={titulo} tabIndex={-1}>Qual é o tamanho do seu próximo passo?</h3>
          <p>Escolha o crédito que você gostaria de ter para {produto === 'carro' ? 'o seu carro' : 'o seu imóvel'}.</p>
          <label htmlFor="credito-desejado" className="lp-field-label">Crédito desejado</label>
          <output className="lp-credit" htmlFor="credito-desejado">{dinheiro(valor)}</output>
          <input
            id="credito-desejado" className="lp-range" type="range"
            min={config.min} max={config.max} step={config.passo} value={valor}
            onChange={(event) => setValor(Number(event.target.value))}
            aria-valuetext={dinheiro(valor)}
          />
          <div className="lp-range-labels"><span>{dinheiro(config.min)}</span><span>{dinheiro(config.max)}</span></div>
          <div className="lp-presets" aria-label="Sugestões de crédito">
            {config.presets.map((preset) => (
              <button key={preset} type="button" aria-pressed={valor === preset} onClick={() => setValor(preset)}>
                {dinheiro(preset)}
              </button>
            ))}
          </div>
          <p className="lp-note">Este valor é seu objetivo de compra. As parcelas e condições serão apresentadas pelo consultor, conforme o grupo disponível.</p>
        </div>
      )}

      {etapa === 2 && (
        <div className="lp-form-stage">
          <h3 ref={titulo} tabIndex={-1}>Um plano começa com o seu momento.</h3>
          <p>Essas respostas ajudam o consultor a entender o que faz sentido para você.</p>
          <label className="lp-field-label" htmlFor="orcamento">Quanto cabe no seu orçamento por mês?</label>
          <select id="orcamento" required value={orcamento} onChange={(e) => setOrcamento(e.target.value)}>
            <option value="">Selecione uma faixa</option>
            {ORCAMENTOS.map((item) => <option key={item}>{item}</option>)}
          </select>
          <label className="lp-field-label" htmlFor="momento">Quando você precisa do bem?</label>
          <select id="momento" required value={momento} onChange={(e) => setMomento(e.target.value)}>
            <option value="">Selecione seu momento</option>
            {Object.entries(MOMENTOS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          {momento === 'imediato' && (
            <p className="lp-notice" role="status">Consórcio não garante a liberação imediata do crédito. Podemos conversar para esclarecer isso antes de qualquer contratação.</p>
          )}
          <label className="lp-field-label" htmlFor="lance">Você tem reserva para um possível lance?</label>
          <select id="lance" required value={lance} onChange={(e) => setLance(e.target.value)}>
            <option value="">Selecione uma opção</option>
            {Object.entries(LANCES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
      )}

      {etapa === 3 && (
        <div className="lp-form-stage">
          <h3 ref={titulo} tabIndex={-1}>Vamos conversar sobre seu plano?</h3>
          <p>Deixe seu contato para receber orientação sobre o consórcio de {produto === 'carro' ? 'automóvel' : 'imóvel'}.</p>
          <label className="lp-field-label" htmlFor="nome">Como podemos chamar você?</label>
          <input id="nome" name="name" autoComplete="name" required minLength={2} maxLength={80} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" disabled={salvando} />
          <label className="lp-field-label" htmlFor="whatsapp">WhatsApp com DDD</label>
          <input id="whatsapp" name="tel" type="tel" inputMode="tel" autoComplete="tel-national" required maxLength={20} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" disabled={salvando} />
          <div className="lp-honeypot" aria-hidden="true">
            <label htmlFor="website">Deixe este campo em branco</label>
            <input id="website" name="website" autoComplete="off" tabIndex={-1} value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <label className="lp-check">
            <input type="checkbox" required checked={ciente} onChange={(e) => setCiente(e.target.checked)} disabled={salvando} />
            <span>Entendo que se trata de consórcio, com contemplação por sorteio ou lance e sem data garantida.</span>
          </label>
          <label className="lp-check">
            <input type="checkbox" required checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} disabled={salvando} />
            <span>Solicito contato sobre este planejamento e li o <Link href="/privacidade" target="_blank" rel="noopener noreferrer">aviso de privacidade</Link>.</span>
          </label>
        </div>
      )}

      {erro && <p id="lp-form-error" className="lp-error" role="alert">{erro}</p>}
      <div className="lp-form-actions">
        {etapa > 1 && <button className="lp-back" type="button" disabled={salvando} onClick={() => { setErro(''); setEtapa(etapa - 1) }}>Voltar</button>}
        <button type="submit" className="lp-button lp-button-full" disabled={salvando}>
          {salvando ? 'Salvando seu pedido…' : etapa === 3 ? 'Quero meu planejamento' : 'Continuar'}
          {!salvando && <ArrowRight size={19} aria-hidden="true" />}
        </button>
      </div>
      <p className="lp-small">Sem compromisso. Este pedido não é uma contratação.</p>
    </form>
  )
}
