'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calculadora from '@/components/calculator/Calculadora'
import AdemIconLogo from '@/components/AdemIconLogo'
import { ChevronRight, TrendingUp, Shield, Users, Star, CheckCircle2, Building2, Award, DollarSign, BarChart3, Target } from 'lucide-react'

const FAQ = [
  { pergunta: 'Como o consórcio funciona como investimento?', resposta: 'Você entra em um grupo, paga parcelas mensais e quando for contemplado, recebe uma carta de crédito com o valor contratado. A carta valoriza junto com a inflação e você pode usar o crédito para comprar um imóvel ou bem que se valoriza — gerando retorno real.' },
  { pergunta: 'Qual o retorno esperado?', resposta: 'A carta de crédito é reajustada pelo INCC (imóveis) ou outros índices, acompanhando a valorização do mercado. Estratégias com lance embutido podem gerar retornos significativos dependendo do tempo de contemplação.' },
  { pergunta: 'É mais seguro que a poupança?', resposta: 'O consórcio é regulado pelo Banco Central do Brasil — o mesmo órgão que regula bancos. Seu patrimônio está protegido. E ao contrário da poupança, o crédito acompanha a valorização real dos ativos.' },
  { pergunta: 'Posso revender a carta de crédito contemplada?', resposta: 'Sim. Uma carta contemplada pode ser vendida ou transferida, o que abre oportunidade para quem usa o consórcio como estratégia de capital — compra, aguarda contemplação e revende com lucro.' },
  { pergunta: 'Qual o valor mínimo para investir via consórcio?', resposta: 'Depende do plano. Cartas de imóvel partem de R$ 100.000 com parcelas a partir de aproximadamente R$ 500/mês. É acessível para quem quer construir patrimônio de forma planejada.' },
]

export default function ConsorcioInvestimentoPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [faqAberto, setFaqAberto] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/"><AdemIconLogo size="md" /></a>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
            <a href="/#produtos" className="hover:text-red-600 transition-colors">Produtos</a>
            <a href="/#como-funciona" className="hover:text-red-600 transition-colors">Como funciona</a>
            <a href="/#comparativo" className="hover:text-red-600 transition-colors">Por que consórcio?</a>
            <a href="/#faq" className="hover:text-red-600 transition-colors">Dúvidas</a>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all hover:shadow-lg"
          >
            Simular agora
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gray-900 flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80&auto=format&fit=crop"
          alt="Investimento inteligente"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-6">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm font-semibold uppercase tracking-widest">Consórcio como Investimento</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
                Construa patrimônio<br />
                <span className="text-red-400">com inteligência.</span>
              </h1>

              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Enquanto a poupança rende menos que a inflação, o consórcio te dá acesso a uma carta de crédito que{' '}
                <strong className="text-white">se valoriza com o mercado imobiliário</strong> — sem juros, sem IOF, sem taxa de administração bancária.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  Simular meu investimento
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Simulação gratuita · Sem compromisso</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* POR QUE INVESTIR */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-400 text-sm uppercase tracking-widest font-semibold mb-10">
            Por que usar o consórcio como instrumento de investimento
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                titulo: 'Carta valoriza com o mercado',
                desc: 'O valor da carta de crédito é reajustado pelos índices do setor (INCC para imóveis). Seu poder de compra cresce — diferente de deixar dinheiro parado na poupança.',
                cor: 'text-blue-500',
                bg: 'bg-blue-50',
              },
              {
                icon: Target,
                titulo: 'Lance embutido como alavancagem',
                desc: 'A estratégia de lance embutido permite usar parte da própria carta como lance. Você é contemplado mais rápido e maximiza o retorno sobre o capital investido.',
                cor: 'text-purple-500',
                bg: 'bg-purple-50',
              },
              {
                icon: DollarSign,
                titulo: 'Compra à vista = desconto',
                desc: 'Com a carta de crédito em mãos, você compra imóvel ou bem à vista. Vendedores dão 5–15% de desconto para pagamento à vista — retorno imediato no ato da compra.',
                cor: 'text-green-500',
                bg: 'bg-green-50',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
              >
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 ${item.cor}`} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{item.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVO INVESTIMENTOS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              Onde seu dinheiro trabalha<br />
              <span className="text-red-600">mais por você?</span>
            </h2>
            <p className="text-gray-500 text-lg">Comparativo real de opções de investimento</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                titulo: 'Poupança',
                retorno: '~6% ao ano',
                inflacao: 'Perde para inflação',
                liquidez: 'Alta',
                patrimonio: 'Não gera patrimônio real',
                destaque: false,
                bg: 'bg-gray-50 border border-gray-200',
                badge: null,
              },
              {
                titulo: 'Consórcio',
                retorno: 'Carta corrigida pelo INCC',
                inflacao: 'Preserva poder de compra',
                liquidez: 'Média (contemplação)',
                patrimonio: 'Gera patrimônio real',
                destaque: true,
                bg: 'bg-gray-900',
                badge: 'RECOMENDADO',
              },
              {
                titulo: 'Tesouro Direto',
                retorno: '~12% ao ano',
                inflacao: 'Protege da inflação',
                liquidez: 'Alta',
                patrimonio: 'Financeiro apenas',
                destaque: false,
                bg: 'bg-gray-50 border border-gray-200',
                badge: null,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${item.bg} rounded-3xl p-8 relative`}
              >
                {item.badge && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {item.badge}
                  </div>
                )}
                <h3 className={`text-xl font-black mb-6 ${item.destaque ? 'text-white' : 'text-gray-800'}`}>{item.titulo}</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Retorno', valor: item.retorno },
                    { label: 'Inflação', valor: item.inflacao },
                    { label: 'Liquidez', valor: item.liquidez },
                    { label: 'Patrimônio', valor: item.patrimonio },
                  ].map((row, j) => (
                    <div key={j} className={`pb-3 ${j < 3 ? `border-b ${item.destaque ? 'border-white/10' : 'border-gray-200'}` : ''}`}>
                      <p className={`text-xs uppercase tracking-wide mb-1 ${item.destaque ? 'text-gray-400' : 'text-gray-400'}`}>{row.label}</p>
                      <p className={`text-sm font-semibold ${item.destaque ? 'text-white' : 'text-gray-700'}`}>{row.valor}</p>
                    </div>
                  ))}
                </div>
                {item.destaque && (
                  <div className="mt-6 space-y-2">
                    {['Carta reajustada pelo mercado', 'Compra à vista = desconto', 'Regulado pelo Banco Central', 'Estratégia de lance embutido'].map((v, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:shadow-xl"
            >
              Simular minha estratégia de investimento
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO DARK */}
      <section className="bg-red-900 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Building2, numero: 'R$140bi', label: 'em créditos comercializados', sub: 'Volume que comprova solidez' },
              { icon: Users, numero: '+641mil', label: 'clientes atendidos', sub: 'Experiência comprovada' },
              { icon: Award, numero: '+35 anos', label: 'de mercado', sub: 'Tradição e confiança' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <item.icon className="w-8 h-8 text-red-300 mx-auto mb-3" />
                <p className="text-5xl font-black text-white mb-1">{item.numero}</p>
                <p className="text-red-200 font-semibold">{item.label}</p>
                <p className="text-red-400 text-sm mt-1">{item.sub}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 md:p-12 text-center">
            <Shield className="w-10 h-10 text-red-300 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-3">100% regulada pelo Banco Central do Brasil</h2>
            <p className="text-red-200 text-lg max-w-2xl mx-auto">
              Seu patrimônio está protegido. Os grupos são auditados mensalmente e você tem garantia legal sobre cada parcela investida.
            </p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA A ESTRATÉGIA */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Como funciona a estratégia de investimento</h2>
            <p className="text-gray-500 text-lg">Do primeiro aporte ao patrimônio real</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', cor: 'bg-blue-100 text-blue-600', titulo: 'Escolha o valor da carta', desc: 'Defina o tamanho do crédito que quer acessar. Quanto maior a carta, maior o potencial de retorno.' },
              { num: '02', cor: 'bg-purple-100 text-purple-600', titulo: 'Aporte mensalmente', desc: 'Parcelas previsíveis e sem juros. Você sabe exatamente o que vai pagar do começo ao fim.' },
              { num: '03', cor: 'bg-orange-100 text-orange-600', titulo: 'Use o lance embutido', desc: 'Ofereça parte da própria carta como lance para ser contemplado mais rápido — sem desembolso extra.' },
              { num: '04', cor: 'bg-green-100 text-green-600', titulo: 'Compre ativo com desconto', desc: 'Com a carta, compra o bem à vista. O desconto de 5–15% é retorno imediato sobre seu investimento.' },
            ].map((item) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-16 h-16 ${item.cor} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black`}>
                  {item.num}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{item.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-6 bg-red-600">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">Quem já usa consórcio para investir</h2>
            <p className="text-red-100 text-lg">Estratégias reais de quem construiu patrimônio</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { nome: 'André Campos', cidade: 'São Paulo, SP', texto: 'Entrei com carta de R$ 300k, usei lance embutido de 25% e fui contemplado em 8 meses. Comprei o imóvel com 12% de desconto à vista. Retorno excelente.', economia: 'Retorno de 18% no período' },
              { nome: 'Beatriz Oliveira', cidade: 'Rio de Janeiro, RJ', texto: 'Usava poupança e via meu dinheiro perder valor. Migrei para o consórcio como estratégia. Hoje tenho um patrimônio real que se valoriza com o mercado imobiliário.', economia: 'R$ 200k em patrimônio' },
              { nome: 'Roberto Mendes', cidade: 'Goiânia, GO', texto: 'Sou investidor e uso o consórcio em paralelo com a bolsa. A previsibilidade e a proteção pelo Bacen me dão segurança que outros investimentos não têm.', economia: 'Portfólio diversificado' },
            ].map((d) => (
              <motion.div
                key={d.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&quot;{d.texto}&quot;</p>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{d.nome}</p>
                    <p className="text-gray-400 text-xs">{d.cidade}</p>
                  </div>
                  <p className="font-bold text-green-600 text-xs text-right">{d.economia}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Dúvidas sobre consórcio como investimento</h2>
            <p className="text-gray-500">Respostas diretas sobre a estratégia</p>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {item.pergunta}
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-3 ${faqAberto === i ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqAberto === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                        {item.resposta}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <TrendingUp className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">Comece a construir patrimônio hoje.</h2>
          <p className="text-gray-400 text-lg mb-8">
            Simule sua estratégia de investimento via consórcio. É gratuito e você vê os números em menos de 2 minutos.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-5 rounded-full transition-all hover:shadow-2xl text-xl hover:scale-105"
          >
            Simular carta de investimento
            <ChevronRight className="w-6 h-6" />
          </button>
          <p className="text-gray-500 text-sm mt-4">Sem compromisso · Resposta em até 2 horas · 100% gratuito</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <AdemIconLogo size="sm" />
              <p className="text-gray-500 text-xs mt-3 max-w-xs leading-relaxed">
                Indicação de consórcio com as melhores condições do mercado. Atendimento personalizado e sem burocracia.
              </p>
            </div>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Outros produtos</p>
              {[
                { label: 'Consórcio de Imóveis', href: '/consorcio-imovel' },
                { label: 'Consórcio de Veículos', href: '/consorcio-veiculo' },
                { label: 'Carta de Investimento', href: '/consorcio-investimento' },
              ].map((p) => (
                <a key={p.label} href={p.href} className="block hover:text-red-500 transition-colors">{p.label}</a>
              ))}
            </div>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Contato</p>
              <p>Simulação e atendimento via WhatsApp</p>
              <p>Resposta em até 2 horas úteis</p>
              <button onClick={() => setModalOpen(true)} className="mt-3 block text-red-500 hover:text-red-400 font-semibold">
                Fazer simulação gratuita →
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Indica Consórcio. Todos os direitos reservados.</p>
            <p className="text-center">As simulações são estimativas com base em taxas médias de mercado e não constituem proposta formal de contrato.</p>
          </div>
        </div>
      </footer>

      {/* WHATSAPP */}
      <a
        href="https://wa.me/5511993929660?text=Ol%C3%A1!%20Tenho%20interesse%20em%20usar%20cons%C3%B3rcio%20como%20investimento."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-bold px-5 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-sm">Tire suas dúvidas</span>
      </a>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                <Calculadora onClose={() => setModalOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
