'use client'

import { Trophy, Gavel, Wallet, ShieldAlert, FileCheck, TrendingDown, CalendarCheck, MessageCircle } from 'lucide-react'
import { BemType, formatCurrency } from '@/lib/calculos'
import { PortaId } from '@/lib/portas'
import { trackEvent, registrarWhatsappIniciado } from '@/lib/gtag'

/**
 * Bloco de contemplação. O conteúdo muda conforme a porta, porque as duas
 * audiências chegam com crenças opostas:
 *
 *  porta 'sonho' — quem buscou "consórcio de imóvel" NÃO levantou a questão
 *    do prazo. Falar de demora aqui planta uma dúvida que ela não tinha e
 *    ataca o próprio produto que a gente vende. Então o enquadramento é
 *    positivo: você escolhe a velocidade.
 *
 *  porta 'carta' — quem buscou "carta contemplada" JÁ acredita que demora,
 *    tanto que foi procurar cota pronta. Para ela, falar de velocidade é
 *    responder o que ela perguntou, e o argumento anti-ágio é o que a
 *    converte para carta nova.
 *
 * Nenhuma das duas versões diz que consórcio é lento. Em nenhuma delas o
 * valor do lance aparece — o número é o motivo da conversa existir.
 */

const CAMINHOS = [
  {
    Icon: Trophy,
    titulo: 'Por sorteio, todo mês',
    desc: 'Você concorre desde a primeira parcela, sem pagar nada a mais por isso.',
  },
  {
    Icon: Gavel,
    titulo: 'Por lance com recursos próprios',
    desc: 'Com capital disponível dá para antecipar bastante — inclusive logo nos primeiros meses.',
  },
  {
    // O caminho que quase ninguém conhece e que amplia muito quem consegue
    // antecipar: não exige dinheiro novo, sai da própria carta.
    Icon: Wallet,
    titulo: 'Por lance embutido, sem tirar do bolso',
    desc: 'Parte da própria carta vira o lance. Você recebe um crédito um pouco menor, mas antecipa a contemplação sem precisar de capital extra — só seguindo com as parcelas.',
  },
]

const RISCOS_AGIO = [
  {
    Icon: ShieldAlert,
    titulo: 'A carta existe, a contemplação não',
    desc: 'Você paga o ágio, recebe a cota — e descobre que ainda precisa dar lance para ser contemplado.',
  },
  {
    Icon: FileCheck,
    titulo: 'A cessão não é aprovada',
    desc: 'A administradora precisa autorizar a transferência. Sem isso, o dinheiro sai e a carta não fica no seu nome.',
  },
  {
    Icon: TrendingDown,
    titulo: 'O ágio não abate nada',
    desc: 'É lucro de quem vendeu. Você continua devendo o mesmo saldo, só que pagou a mais para entrar na fila.',
  },
]

const WHATSAPP = '5511993929660'

interface Props {
  bem: BemType
  valor: number
  porta: PortaId
  onAgendar: () => void
}

export default function BlocoLance({ bem, valor, porta, onAgendar }: Props) {
  const bemLabel = bem === 'imovel' ? 'imóvel' : 'veículo'
  const ehCarta = porta === 'carta'

  const textoWhats = encodeURIComponent(
    `Olá! Simulei um ${bemLabel} de ${formatCurrency(valor)} no site e quero entender ` +
      `a estratégia de contemplação para o meu caso.`
  )

  function abrirWhats() {
    // Leitura de funil + conversão. As duas saídas do bloco valem igual:
    // esta e o agendamento são as únicas conversões da página.
    trackEvent('whatsapp_bloco_contemplacao', { bem, valor, porta })
    registrarWhatsappIniciado({ bem, valor, porta })
    window.open(`https://wa.me/${WHATSAPP}?text=${textoWhats}`, '_blank', 'noopener')
  }

  const itens = ehCarta ? RISCOS_AGIO : CAMINHOS

  return (
    <section className="rounded-2xl border-2 border-[var(--c-gold)]/25 bg-[var(--c-gold-bg)] p-6 md:p-9">
      <p className="eyebrow mb-4 text-[var(--c-gold)]">
        {ehCarta ? 'Quer ser contemplado logo' : 'Contemplação'}
      </p>

      <h2 className="font-display text-[1.6rem] font-extrabold leading-[1.12] tracking-tight text-[var(--c-ink)] md:text-[2.1rem]">
        {ehCarta ? (
          <>
            Você não precisa comprar carta
            <br className="hidden md:block" /> contemplada de ninguém.
          </>
        ) : (
          <>
            Você escolhe a velocidade
            <br className="hidden md:block" /> da sua contemplação.
          </>
        )}
      </h2>

      <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[var(--c-ink-mid)]">
        {ehCarta
          ? 'Muita gente procura carta já contemplada para não esperar. Antes de pagar ágio a um desconhecido, vale olhar três coisas:'
          : 'Todo mês o grupo contempla, e existem três caminhos até a sua vez — você decide qual usar:'}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {itens.map(({ Icon, titulo, desc }) => (
          <div key={titulo} className="flex gap-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
              <Icon
                className={`h-4 w-4 ${ehCarta ? 'text-[var(--c-red)]' : 'text-[var(--c-gold)]'}`}
              />
            </div>
            <div>
              <p className="text-[14.5px] font-bold text-[var(--c-ink)]">{titulo}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-[var(--c-ink-mid)]">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fecho — igual nas duas portas: a conta é o motivo da conversa */}
      <div className="mt-6 rounded-xl bg-white p-5 md:p-6">
        <p className="text-[15.5px] font-bold leading-snug text-[var(--c-ink)] md:text-[17px]">
          {ehCarta
            ? 'Dá para ser contemplado logo nos primeiros meses dando lance direto na administradora — sem ágio, com contrato registrado.'
            : 'Com a estratégia de lance certa dá para antecipar bastante a sua contemplação.'}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--c-ink-mid)]">
          Qual dos caminhos faz sentido depende do seu grupo e de quanto você tem disponível
          hoje — inclusive se for zero. O especialista analisa o seu caso, monta a estratégia
          e mostra em quanto tempo dá para ser contemplado.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={abrirWhats}
            className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full border-2 border-[var(--c-green)] px-6 py-3.5 text-[14.5px] font-bold text-[var(--c-green)] transition-colors hover:bg-[var(--c-green-bg)]"
          >
            <MessageCircle className="h-4.5 w-4.5" />
            Falar agora no WhatsApp
          </button>
          <button
            onClick={onAgendar}
            className="cta-primary inline-flex flex-1 items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-[14.5px] font-bold"
          >
            <CalendarCheck className="h-4.5 w-4.5" />
            Receber consultoria gratuita
          </button>
        </div>

        {/* O formato (vídeo, 15 min) é dito na tela do calendário, antes de qualquer
            compromisso. Aqui a linha fala do que a pessoa ganha, não do que ela gasta. */}
        <p className="mt-3.5 text-center text-[12.5px] text-[var(--c-ink-faint)]">
          Análise do seu caso · Sem custo · Sem compromisso de contratar
        </p>
      </div>
    </section>
  )
}
