'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Car, Home, Check, ChevronDown } from 'lucide-react'
import PlanoForm from './PlanoForm'
import { getAtribuicao } from '@/lib/atribuicao'
import type { ProdutoPlano } from '@/lib/planejamento.mjs'
import './lidera.css'

const PRODUTOS = {
  carro: {
    rotulo: 'Automóveis', titulo: 'Seu próximo carro.',
    descricao: 'Planeje a compra do seu carro com consórcio. Conte seu objetivo e receba orientação para escolher um plano que faça sentido para você.',
    imagem: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85',
    alt: 'Automóvel branco em uma paisagem aberta',
    categoria: 'LIBERDADE PARA ESCOLHER',
    detalhe: 'Um plano para sair do lugar.',
    caminho: '/consorcio-veiculo',
  },
  imovel: {
    rotulo: 'Imóveis', titulo: 'Seu próximo endereço.',
    descricao: 'Planeje a compra do seu imóvel com consórcio. Conte seu objetivo e receba orientação para escolher um plano que faça sentido para você.',
    imagem: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    alt: 'Casa contemporânea com jardim e grandes janelas',
    categoria: 'ESPAÇO PARA UM NOVO CAPÍTULO',
    detalhe: 'Um plano para chamar de seu.',
    caminho: '/consorcio-imovel',
  },
}

export function LideraBrand() {
  return (
    <Link href="/" className="lp-brand" aria-label="Consórcio Lidera, início">
      <span className="lp-brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>lidera<span className="lp-brand-dot">.</span><small>CONSÓRCIO</small></span>
    </Link>
  )
}

export default function LideraLanding({
  produtoInicial = 'carro', origemCarta = false,
}: { produtoInicial?: ProdutoPlano; origemCarta?: boolean }) {
  const [produto, setProduto] = useState<ProdutoPlano>(produtoInicial)
  const [formVisivel, setFormVisivel] = useState(false)
  const planner = useRef<HTMLElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const atual = PRODUTOS[produto]
  const outro = produto === 'carro' ? 'imovel' : 'carro'

  useEffect(() => {
    getAtribuicao()
    const observer = new IntersectionObserver(
      ([entry]) => setFormVisivel(entry.isIntersecting),
      { threshold: 0.05 },
    )
    if (planner.current) observer.observe(planner.current)
    let frame = 0
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (progress.current) progress.current.style.transform = 'scaleX(' + (total > 0 ? window.scrollY / total : 0) + ')'
      frame = 0
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  function mudarProduto(proximo: ProdutoPlano) {
    setProduto(proximo)
    const url = new URL(window.location.href)
    url.pathname = PRODUTOS[proximo].caminho
    url.searchParams.set('produto', proximo)
    // Mantém os identificadores da visita e uma URL coerente ao recarregar.
    window.history.replaceState(null, '', url.toString())
  }

  return (
    <div className="lidera-site">
      <a className="lp-skip" href="#conteudo">Ir para o conteúdo</a>
      <div ref={progress} className="lp-reading-progress" aria-hidden="true" />
      <header className="lp-header">
        <div className="lp-container lp-nav">
          <LideraBrand />
          <nav aria-label="Navegação principal">
            <a href="#como-funciona">Como funciona</a>
            <a href="#duvidas">Dúvidas</a>
          </nav>
          <a className="lp-nav-cta" href="#planejar">Planejar minha compra <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
      </header>

      <main id="conteudo">
        <section className="lp-hero">
          <div className="lp-container">
            <div className="lp-hero-top">
              <p className="lp-eyebrow"><span className="lp-live-dot" /> CONQUISTAS COMEÇAM COM UM PLANO</p>
              <div className="lp-product-switch" role="group" aria-label="O que você quer conquistar?">
                <button type="button" aria-pressed={produto === 'carro'} onClick={() => mudarProduto('carro')}><Car size={18} aria-hidden="true" /> Automóveis</button>
                <button type="button" aria-pressed={produto === 'imovel'} onClick={() => mudarProduto('imovel')}><Home size={18} aria-hidden="true" /> Imóveis</button>
              </div>
            </div>
            <div className="lp-hero-grid">
              <div className="lp-hero-copy" key={produto}>
                <p className="lp-product-kicker">CONSÓRCIO DE {produto === 'carro' ? 'AUTOMÓVEL' : 'IMÓVEL'}</p>
                <h1>{atual.titulo}<br /><span>No seu ritmo.</span></h1>
                <p className="lp-hero-description">{atual.descricao}</p>
                <a href="#planejar" className="lp-button">Quero planejar minha compra <ArrowRight size={20} aria-hidden="true" /></a>
                <p className="lp-hero-footnote"><Check size={15} aria-hidden="true" /> Orientação gratuita e sem compromisso</p>
                {origemCarta && <p className="lp-notice">Você está conhecendo um consórcio ainda não contemplado. Esta página não oferece carta contemplada nem garante crédito imediato.</p>}
              </div>
              <div className="lp-hero-visual">
                <div className="lp-photo-frame">
                  <Image key={produto} src={atual.imagem} alt={atual.alt} fill sizes="(max-width: 800px) 100vw, 52vw" loading="eager" fetchPriority="high" className="lp-hero-photo" />
                  <div className="lp-photo-shade" />
                  <div className="lp-photo-caption"><span>{atual.categoria}</span><strong>{atual.detalhe}</strong></div>
                  <span className="lp-image-disclaimer">Imagem ilustrativa</span>
                </div>
                <div className="lp-floating-card">
                  <span className="lp-card-icon">{produto === 'carro' ? <Car aria-hidden="true" /> : <Home aria-hidden="true" />}</span>
                  <div><small>Seu objetivo, sua escolha</small><strong>Consórcio de {produto === 'carro' ? 'automóvel' : 'imóvel'}</strong><span>Com orientação em cada etapa.</span></div>
                  <span className="lp-card-check"><Check size={15} aria-hidden="true" /></span>
                </div>
                <div className="lp-orbit" aria-hidden="true" />
              </div>
            </div>
            <div className="lp-hero-trust">
              <span><Check size={16} aria-hidden="true" /> Compra planejada</span>
              <span><Check size={16} aria-hidden="true" /> Contemplação por sorteio ou lance</span>
              <span><Check size={16} aria-hidden="true" /> Condições apresentadas antes de contratar</span>
            </div>
          </div>
        </section>

        <section className="lp-container lp-intro" id="como-funciona">
          <div className="lp-section-heading">
            <p className="lp-eyebrow">ENTENDA ANTES DE DECIDIR</p>
            <h2>Um grande objetivo.<br /><span>Um passo de cada vez.</span></h2>
          </div>
          <p className="lp-section-description">Consórcio é uma forma de compra planejada em grupo. Você contribui mensalmente e utiliza o crédito após a contemplação e o cumprimento das condições do contrato.</p>
          <div className="lp-steps-grid">
            <article className="lp-step-card"><span className="lp-step-number">01</span><span className="lp-step-line" /><h3>Defina sua conquista.</h3><p>Escolha o tipo de bem e o crédito desejado. Avalie prazo, parcelas, taxas e regras do grupo com o consultor.</p></article>
            <article className="lp-step-card"><span className="lp-step-number">02</span><span className="lp-step-line" /><h3>Construa seu plano.</h3><p>Você paga as contribuições e participa das assembleias. A contemplação acontece por sorteio ou lance, conforme as regras do grupo.</p></article>
            <article className="lp-step-card"><span className="lp-step-number">03</span><span className="lp-step-line" /><h3>Realize a compra.</h3><p>Após a contemplação e a aprovação das condições exigidas, use o crédito para adquirir o bem permitido pelo contrato.</p></article>
          </div>
          <div className="lp-disclosure"><span>CLAREZA DESDE O COMEÇO</span><p>Consórcio não tem juros de financiamento. Há taxa de administração e podem existir fundo de reserva, seguro e reajustes, conforme o contrato. Não há garantia de data de contemplação.</p></div>
        </section>

        <section id="planejar" className="lp-planner-section" ref={planner}>
          <div className="lp-container lp-planner-grid">
            <div className="lp-planner-copy">
              <p className="lp-eyebrow"><span className="lp-live-dot" /> O PRÓXIMO PASSO É SEU</p>
              <h2>Seu plano começa<br />com <span>você.</span></h2>
              <p>Antes de falar em parcelas, vamos entender seu objetivo. Assim, a conversa começa com o que realmente importa para a sua compra.</p>
              <ul className="lp-benefits">
                <li><span><Check size={16} aria-hidden="true" /></span>Crédito alinhado ao que você quer comprar</li>
                <li><span><Check size={16} aria-hidden="true" /></span>Conversa sobre seu orçamento e seu momento</li>
                <li><span><Check size={16} aria-hidden="true" /></span>Explicação das condições antes de qualquer decisão</li>
              </ul>
              <div className="lp-consultant"><span className="lp-consultant-avatar">G</span><p><strong>Gabriel Rossin Gobetti</strong><span>Atendimento da Consórcio Lidera</span></p></div>
              <p className="lp-planner-note">Precisa comprar imediatamente? Conte isso no formulário. A contemplação no consórcio não tem data garantida.</p>
            </div>
            <PlanoForm key={produto} produto={produto} />
          </div>
        </section>

        <section className="lp-container lp-choice-section">
          <div className="lp-choice-copy"><p className="lp-eyebrow">DECIDA COM INFORMAÇÃO</p><h2>Planejar também é<br />ter <span>clareza.</span></h2><p>Uma boa escolha considera seu orçamento, seu prazo e as regras do plano. Conte com uma conversa direta para entender essas condições.</p></div>
          <div className="lp-choice-items">
            <article><span>01</span><div><h3>O que cabe no seu mês</h3><p>O orçamento que você informa orienta a conversa. O valor definitivo da parcela depende do plano e deve considerar as taxas e os reajustes previstos.</p></div></article>
            <article><span>02</span><div><h3>O que esperar de um lance</h3><p>Uma reserva pode permitir a oferta de lance. O resultado depende das regras e da assembleia; nenhum percentual garante contemplação.</p></div></article>
            <article><span>03</span><div><h3>O que conferir no contrato</h3><p>Administradora, crédito, prazo, taxa de administração, demais custos e regras de contemplação. Tire suas dúvidas antes de aderir.</p></div></article>
          </div>
        </section>

        <section className="lp-faq-section" id="duvidas">
          <div className="lp-container lp-faq-grid">
            <div><p className="lp-eyebrow">SEM COMPLICAR</p><h2>Suas dúvidas<br />merecem <span>respostas.</span></h2><p>A compra começa com informação.</p><a href="#planejar" className="lp-text-link">Quero conversar sobre meu plano <ArrowRight size={18} aria-hidden="true" /></a></div>
            <div className="lp-faq-list">
              {[
                ['Isso é consórcio ou financiamento?', 'É consórcio: uma modalidade de compra planejada em grupo. O crédito só pode ser utilizado após a contemplação e o cumprimento das condições contratuais. Não é um empréstimo ou financiamento com liberação imediata.'],
                ['Existe uma data garantida para ser contemplado?', 'Não. A contemplação ocorre por sorteio ou lance, conforme as regras do grupo. Nem a antecipação de parcelas nem um lance específico garantem uma data de contemplação.'],
                ['Consórcio tem custos além do crédito?', 'Sim. Há taxa de administração e podem existir fundo de reserva, seguro e reajustes previstos no contrato. Peça a composição completa da parcela e as regras de atualização antes de contratar.'],
                ['Preciso ter dinheiro para dar lance?', 'É possível participar dos sorteios sem ofertar lance, observadas as condições do contrato. Se você tiver uma reserva, o consultor pode explicar as modalidades de lance e seus efeitos sobre o plano.'],
                ['Este formulário já contrata um consórcio?', 'Não. Ele registra seu interesse e as informações que você escolheu compartilhar para uma conversa. A proposta e o contrato serão apresentados separadamente, com as condições aplicáveis.'],
              ].map(([pergunta, resposta]) => (
                <details key={pergunta}><summary>{pergunta}<ChevronDown size={20} aria-hidden="true" /></summary><p>{resposta}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-container lp-other-product">
          <div><p className="lp-eyebrow">OUTRAS CONQUISTAS TAMBÉM CABEM NO PLANO</p><h3>Pensando em {outro === 'imovel' ? 'um imóvel' : 'um carro'}?</h3></div>
          <Link className="lp-button lp-button-outline" href={PRODUTOS[outro].caminho}>Conhecer consórcio de {outro === 'imovel' ? 'imóvel' : 'automóvel'} <ArrowRight size={18} aria-hidden="true" /></Link>
        </section>
        <section className="lp-final-cta">
          <div className="lp-container"><p className="lp-eyebrow">UM NOVO CAPÍTULO COMEÇA COM UMA ESCOLHA</p><h2>O próximo passo<br />tem a sua direção.</h2><a href="#planejar" className="lp-button lp-button-light">Começar meu planejamento <ArrowRight size={20} aria-hidden="true" /></a></div>
          <span className="lp-final-ring" aria-hidden="true" />
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top"><LideraBrand /><p>Conquistas com planejamento.<br />Decisões com clareza.</p><Link href="/privacidade">Privacidade</Link></div>
          <p>A Consórcio Lidera é o canal de atendimento desta página. A identificação da administradora e as condições específicas do grupo devem constar da proposta e do contrato apresentados antes da adesão.</p>
          <p>Consórcio sujeito a taxa de administração e demais condições contratuais. Contemplação por sorteio ou lance, sem data garantida. Os valores selecionados são objetivos de crédito, não ofertas de parcela ou garantia de aprovação. Imagens ilustrativas.</p>
          <div className="lp-footer-bottom"><span>© {new Date().getFullYear()} Consórcio Lidera</span><span>Atendimento: Gabriel Rossin Gobetti</span></div>
        </div>
      </footer>
      <a href="#planejar" className={'lp-mobile-cta' + (formVisivel ? ' is-hidden' : '')} tabIndex={formVisivel ? -1 : undefined} aria-hidden={formVisivel || undefined}>Planejar meu {produto === 'carro' ? 'carro' : 'imóvel'} <ArrowRight size={18} aria-hidden="true" /></a>
    </div>
  )
}
