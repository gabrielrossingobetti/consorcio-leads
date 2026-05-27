import Calculadora from '@/components/calculator/Calculadora'
import AdemIconLogo from '@/components/AdemIconLogo'
import { Star, Users, Shield, CheckCircle, ChevronRight, Award, Banknote, HomeIcon as HomeIcon, Car, Briefcase } from 'lucide-react'

export const metadata = {
  title: 'Simulador de Consórcio Ademicon | Economize até 50% no seu bem',
  description: 'Compare consórcio vs financiamento em 30 segundos. Descubra quanto você economiza e fale com um especialista da Ademicon.',
}

const DEPOIMENTOS = [
  {
    nome: 'Mariana Costa',
    cidade: 'São Paulo, SP',
    texto: 'Sempre achei que consórcio era complicado. Fiz a simulação, vi que economizaria R$ 87.000 no financiamento e fechei em uma semana. Melhor decisão da minha vida.',
    bem: 'Imóvel',
    economia: 'R$ 87.000',
  },
  {
    nome: 'Ricardo Alves',
    cidade: 'Campinas, SP',
    texto: 'Tinha financiamento ativo e estava pagando juros absurdos. Migrei para o consórcio e reduzi minha parcela em R$ 800 por mês. Dinheiro que fica no meu bolso.',
    bem: 'Veículo',
    economia: 'R$ 800/mês',
  },
  {
    nome: 'Fernanda Lima',
    cidade: 'Ribeirão Preto, SP',
    texto: 'O especialista me explicou tudo com clareza. Fui contemplada em 14 meses com um lance. Hoje tenho meu apartamento próprio sem ter pago uma fortuna em juros.',
    bem: 'Imóvel',
    economia: 'R$ 124.000',
  },
]

const FAQ = [
  {
    pergunta: 'Quanto tempo leva para ser contemplado?',
    resposta: 'O tempo médio de contemplação varia entre 12 e 36 meses para imóveis e 6 a 24 meses para veículos. Você pode antecipar oferecendo um lance — quanto maior o lance, maior a chance de ser contemplado mais rápido.',
  },
  {
    pergunta: 'E se eu precisar do bem com urgência?',
    resposta: 'Se a necessidade for imediata, o consórcio pode não ser a melhor escolha. Mas para quem planeja, é o instrumento mais inteligente: você paga até 50% menos no total.',
  },
  {
    pergunta: 'A Ademicon é regulamentada?',
    resposta: 'Sim. A Ademicon é regulamentada e fiscalizada pelo Banco Central do Brasil, garantindo total segurança para os consorciados.',
  },
  {
    pergunta: 'Posso usar o FGTS no consórcio?',
    resposta: 'Sim! Para consórcios de imóveis, você pode usar o FGTS tanto para dar um lance quanto para reduzir o saldo devedor após ser contemplado.',
  },
  {
    pergunta: 'O que acontece se eu não conseguir pagar uma parcela?',
    resposta: 'O consorciado inadimplente fica suspenso das assembleias, mas o grupo continua. É possível regularizar a situação e voltar a participar normalmente.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <AdemIconLogo size="md" />
          <a
            href="#simulador"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          >
            Simular agora
          </a>
        </div>
      </header>

      {/* HERO + CALCULADORA */}
      <section id="simulador" className="bg-gradient-to-br from-slate-50 via-white to-red-50 px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Texto hero */}
          <div>
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <Award className="w-3.5 h-3.5" /> Maior administradora de consórcios do Brasil
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
              Conquiste seu bem pagando até{' '}
              <span className="text-red-600">50% menos</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Descubra em 30 segundos quanto você economiza escolhendo consórcio em vez de financiamento. Sem juros, sem surpresas.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              {[
                { icon: Shield, text: 'Regulado pelo Banco Central' },
                { icon: Users, text: '+12.000 clientes ativos' },
                { icon: Star, text: '4.9 estrelas no Google' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon className="w-4 h-4 text-red-500" />
                  {text}
                </div>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-800">
                <strong>Simulação 100% gratuita</strong> — sem compromisso, sem cadastro obrigatório
              </p>
            </div>
          </div>

          {/* Calculadora */}
          <div>
            <div className="bg-white rounded-3xl shadow-2xl shadow-red-100 border border-gray-100 p-6 md:p-8">
              <Calculadora />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Simulação gratuita • Sem compromisso • Especialistas humanos
            </p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Como funciona o consórcio?</h2>
            <p className="text-gray-500 text-lg">Simples, transparente e sem juros</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Banknote,
                titulo: 'Você paga uma parcela mensal',
                descricao: 'Sem juros, apenas uma taxa administrativa. Sua parcela é muito menor do que a de um financiamento.',
                cor: 'bg-blue-50 text-blue-600',
              },
              {
                step: '02',
                icon: Users,
                titulo: 'Participa de um grupo',
                descricao: 'Todos os meses, um ou mais consorciados são contemplados por sorteio ou lance e recebem a carta de crédito.',
                cor: 'bg-purple-50 text-purple-600',
              },
              {
                step: '03',
                icon: HomeIcon,
                titulo: 'Recebe sua carta de crédito',
                descricao: 'Ao ser contemplado, você usa o crédito para comprar seu bem à vista — o que garante poder de negociação.',
                cor: 'bg-red-50 text-red-600',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="text-center">
                  <div className={`w-16 h-16 ${item.cor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-4xl font-black text-gray-100 mb-2">{item.step}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.titulo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.descricao}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* COMPARATIVO FINANCIAMENTO VS CONSÓRCIO */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              O que o banco <span className="text-red-600">não quer</span> que você saiba
            </h2>
            <p className="text-gray-500 text-lg">Simulação real para um imóvel de R$ 350.000</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Financiamento */}
            <div className="bg-white border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="font-bold text-red-600 uppercase text-sm tracking-wide">Financiamento bancário</span>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Parcela mensal</span>
                  <span className="font-bold text-red-600">R$ 3.850</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Total pago em 20 anos</span>
                  <span className="font-bold text-red-700">R$ 924.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Só de juros</span>
                  <span className="font-bold text-red-500">R$ 574.000</span>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-red-700 text-sm font-semibold">Você paga 2,6x o valor do imóvel</p>
              </div>
            </div>
            {/* Consórcio */}
            <div className="bg-white border-2 border-green-400 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">ESCOLHA INTELIGENTE</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-bold text-green-700 uppercase text-sm tracking-wide">Consórcio Ademicon</span>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Parcela mensal</span>
                  <span className="font-bold text-green-600">R$ 1.750</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Total pago em 20 anos</span>
                  <span className="font-bold text-green-700">R$ 409.500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Juros</span>
                  <span className="font-bold text-green-500">R$ 0,00</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-green-700 text-sm font-semibold">Economia de <strong>R$ 514.500</strong></p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="#simulador" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg text-lg">
              Calcular minha economia
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Para quem é o consórcio Ademicon?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: HomeIcon,
                titulo: 'Quem quer imóvel próprio',
                descricao: 'Casas, apartamentos, terrenos e imóveis comerciais. Realize o sonho da casa própria sem pagar juros abusivos.',
                cor: 'bg-blue-600',
              },
              {
                icon: Car,
                titulo: 'Quem quer trocar de carro',
                descricao: 'Carros, motos, caminhões e implementos agrícolas. A forma mais econômica de renovar sua frota.',
                cor: 'bg-emerald-600',
              },
              {
                icon: Briefcase,
                titulo: 'Quem quer investir no negócio',
                descricao: 'Capital para expansão, franquias, equipamentos ou reforma do seu negócio com parcelas que cabem no orçamento.',
                cor: 'bg-purple-600',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.titulo} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 ${item.cor} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.titulo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.descricao}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-16 px-4 bg-red-600">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Quem já realizou o sonho</h2>
            <p className="text-red-100 text-lg">Histórias reais de clientes Ademicon</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((d) => (
              <div key={d.nome} className="bg-white rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{d.texto}"</p>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{d.nome}</p>
                    <p className="text-gray-400 text-xs">{d.cidade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{d.bem}</p>
                    <p className="font-bold text-green-600 text-sm">Economizou {d.economia}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Perguntas frequentes</h2>
            <p className="text-gray-500">Tire todas as suas dúvidas antes de simular</p>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details key={item.pergunta} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition-colors list-none">
                  {item.pergunta}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {item.resposta}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Pronto para parar de pagar juros?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Faça sua simulação gratuita agora e descubra quanto você pode economizar.
          </p>
          <a
            href="#simulador"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-5 rounded-xl transition-all hover:shadow-2xl text-xl"
          >
            Simular gratuitamente
            <ChevronRight className="w-6 h-6" />
          </a>
          <p className="text-gray-500 text-sm mt-4">
            Sem compromisso • Resposta em até 2 horas • 100% gratuito
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 py-10 px-6 border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <AdemIconLogo size="sm" />
              <p className="text-gray-500 text-xs mt-3 max-w-xs leading-relaxed">
                Maior administradora de consórcios do Brasil. Regulada e fiscalizada pelo Banco Central do Brasil.
              </p>
            </div>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Informações legais</p>
              <p>Ademicon Administradora de Consórcios S/A</p>
              <p>CNPJ: 84.911.098/0001-29</p>
              <p>Rua Pinheiro Guimarães, 400 — Rio de Janeiro, RJ</p>
              <p>Autorizada pelo Banco Central do Brasil</p>
            </div>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Contato</p>
              <p>Simulação e atendimento via WhatsApp</p>
              <p>Resposta em até 2 horas úteis</p>
              <p className="mt-3">
                <a href="#simulador" className="text-red-500 hover:text-red-400 font-semibold">
                  Fazer simulação gratuita →
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Ademicon Administradora de Consórcios S/A. Todos os direitos reservados.</p>
            <p className="text-center">
              As simulações apresentadas são estimativas com base em taxas médias de mercado e não constituem proposta formal de contrato.
            </p>
          </div>
        </div>
      </footer>

    </main>
  )
}
