import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Páginas antigas da marca "Indica Consórcio". Elas carregavam o funil
   * anterior (com as duas perguntas de qualificação) e nome de marca errado.
   * A landing atual já cobre imóvel, automóvel e negócio no mesmo seletor,
   * então manter quatro páginas com o mesmo conteúdo só multiplicaria o
   * trabalho de cada ajuste.
   *
   * Redirecionamento em vez de exclusão: quem tiver o link salvo ou vier de
   * um índice antigo continua chegando em algum lugar útil, e o 308 avisa
   * buscadores para transferirem o histórico para a raiz.
   */
  async redirects() {
    return [
      { source: "/consorcio-imovel", destination: "/", permanent: true },
      { source: "/consorcio-veiculo", destination: "/", permanent: true },
      // Nada aponta para /obrigado — sobrou de uma versão anterior do funil.
      { source: "/obrigado", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
