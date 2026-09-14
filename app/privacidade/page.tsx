import type { Metadata } from 'next'
import Link from 'next/link'
import { LideraBrand } from '@/components/landing/LideraLanding'
import '@/components/landing/lidera.css'

export const metadata: Metadata = {
  title: 'Privacidade | Consórcio Lidera',
  description: 'Como são utilizados os dados enviados no pedido de planejamento de consórcio.',
  robots: { index: true, follow: true },
}

export default function Privacidade() {
  return (
    <main className="lidera-site">
      <article className="lp-container lp-privacy">
        <LideraBrand />
        <h1>Aviso de privacidade</h1>
        <p>Versão de 14 de setembro de 2026. Este aviso descreve o tratamento de dados no pedido de planejamento da Consórcio Lidera.</p>
        <h2>Quem atende seu pedido</h2>
        <p>O canal de atendimento desta página é a Consórcio Lidera, com atendimento de Gabriel Rossin Gobetti. Para perguntas sobre seus dados, entre em contato pelo <a href="https://wa.me/5511993929660" target="_blank" rel="noopener noreferrer">WhatsApp (11) 99392-9660</a>.</p>
        <h2>Dados que você informa</h2>
        <p>O formulário coleta nome, WhatsApp, tipo de bem, crédito desejado, faixa de orçamento mensal, momento de compra e reserva declarada para lance. Também registra suas confirmações sobre o pedido de contato e a ciência das condições de contemplação, junto com a data do pedido.</p>
        <h2>Para que usamos essas informações</h2>
        <p>Para responder ao seu pedido, entender seu objetivo e orientar a conversa sobre consórcio. O envio não contrata um produto e não implica aprovação de crédito nem contemplação. As informações também podem ajudar a avaliar a qualidade do atendimento e das campanhas que originam os pedidos.</p>
        <h2>Origem da visita e tecnologias de análise</h2>
        <p>A página pode registrar parâmetros de campanha e identificadores de clique, como UTM, gclid, wbraid e gbraid, quando presentes no endereço. Eles ajudam a relacionar o pedido à sua origem e podem ser mantidos no armazenamento da sessão do navegador.</p>
        <p>O site utiliza tecnologias do Google para análise de acesso e publicidade, e pode usar o Microsoft Clarity para compreender a navegação. Essas tecnologias podem tratar informações do dispositivo e da interação com a página. O evento do novo formulário informa produto, momento declarado e identificador do pedido; ele não inclui nome ou telefone.</p>
        <h2>Serviços envolvidos</h2>
        <p>O funcionamento da página envolve hospedagem na Vercel e armazenamento no Supabase. Serviços de análise e atendimento podem processar dados de acordo com suas próprias condições, inclusive fora do Brasil. Ao continuar pelo WhatsApp, você também estará usando um serviço da Meta.</p>
        <p>A administradora responsável por eventual proposta será identificada antes da contratação. Qualquer etapa adicional que exija documentos ou informações será explicada durante o atendimento.</p>
        <h2>Conservação e seus direitos</h2>
        <p>Os dados devem ser mantidos pelo período necessário ao atendimento, às finalidades informadas e às obrigações aplicáveis. Você pode solicitar informações sobre o tratamento, acesso, correção ou exclusão, quando cabível, e revogar uma autorização de contato. Use o canal acima para exercer seus direitos.</p>
        <h2>Como continuar</h2>
        <p>Você pode conhecer a página sem preencher o formulário. Se optar por enviar um pedido, confirme que compreendeu este aviso e que deseja o contato sobre seu planejamento.</p>
        <p><Link href="/">Voltar para a Consórcio Lidera</Link></p>
      </article>
    </main>
  )
}
