# Lidera: nova landing e medição de qualidade

Versão revisada em 15/09/2026. A implementação é uma proposta em branch para revisão. A continuação por WhatsApp e o formulário em duas etapas incorporam a orientação do anunciante. Este documento não é uma auditoria da conta Google Ads: não houve acesso aos relatórios privados nem alteração de anúncios, orçamento, lances ou status de campanhas. A revisão de tipografia, experiência e lance embutido está em [revisao-simulador-2026-09-15.md](revisao-simulador-2026-09-15.md).

## O que motivou a mudança

No código anterior, a raiz iniciava em imóvel, exceto quando recebia um produto explícito ou o identificador específico da campanha de automóveis. Os caminhos de veículo e imóvel redirecionavam à raiz. O efeito sobre cada anúncio depende da URL final e dos parâmetros realmente usados na conta.

No fluxo antigo de WhatsApp, o evento chamado whatsapp_qualificado era emitido ao abrir a conversa, antes de confirmar o salvamento. Isso não comprova mensagem enviada ou qualificação comercial. A existência do evento também não prova que ele era uma ação primária de lance: essa configuração precisa ser inspecionada no Google Ads.

A nova landing prioriza uma apresentação explícita de consórcio, distingue compra planejada de crédito imediato e substitui estimativas não documentadas de contemplação e comparativos financeiros por orientação sobre condições do contrato. Depoimentos e selos sem comprovação anexada ao projeto não foram reaproveitados na nova apresentação.

## Rotas e experiência

| Entrada | Comportamento |
| --- | --- |
| / | Automóvel como produto inicial |
| /?produto=imovel | Imóvel como produto inicial |
| /consorcio-veiculo | Página própria de automóvel |
| /consorcio-imovel | Página própria de imóvel |
| ?porta=carta nas novas páginas | Aviso explícito de que não é carta contemplada |
| /?produto=negocio | Fluxo legado preservado |
| /privacidade | Aviso sobre o novo formulário |

A escolha de produto atualiza o endereço e reinicia o formulário com a faixa correspondente. Imagens continuam sendo ilustrativas, sem uso de marcas, peças ou ativos da Embracon. A referência orienta hierarquia visual, destaque ao produto e clareza das chamadas; não permite concluir que a página resultante converterá mais sem experimento.

O novo fluxo contém duas etapas: objetivo de crédito, exemplo opcional de lance embutido e intenção de atendimento; contato, orçamento, urgência e confirmações. A reserva própria fica para a conversa no WhatsApp e é registrada no pedido inicial como não informada. A escolha do exemplo de 25% é registrada separadamente e recalculada no servidor. Os valores são objetivos e contas ilustrativas, não ofertas de parcela. O pedido só é confirmado após resposta de gravação bem-sucedida. Erros preservam os campos e uma repetição com a mesma chave não sobrescreve outro contato.

## Onde ficam os pedidos

POST /api/planejamento grava em leads_captacao usando SUPABASE_SERVICE_ROLE_KEY somente no servidor. A coluna notas, já prevista no supabase_setup.sql, recebe JSON com versão, respostas, origem, confirmações e identificadores de campanha. O status inicial é novo.

O novo formulário não agenda uma reunião nem dispara notificação por e-mail. O pedido fica no Supabase e, após confirmação, a página abre o WhatsApp na mesma aba. A mensagem é adaptada a quem já conhece e quer avaliar um plano ou a quem deseja entender a modalidade. A pessoa ainda revisa e envia a mensagem. Se a navegação não acontecer, a confirmação mantém um link de apoio. O painel legado de eventos não foi transformado em CRM de qualificação. Antes do lançamento, definir quem acompanha esses registros ou configurar a rotina de notificação já adotada pelo atendimento.

A presença da coluna no arquivo SQL não confirma o esquema do banco em produção. Não foi executada migração nem consulta a dados reais.

## Eventos e conversões

| Sinal | O que realmente significa | Uso proposto |
| --- | --- | --- |
| planejamento_iniciado | Primeiro foco ou alteração em um controle do formulário | Diagnóstico de início; não é lead |
| planejamento_etapa_concluida | Passagem válida da etapa 1 para a etapa 2 | Diagnóstico de abandono |
| planejamento_erro | Falha de validação, envio ou conexão | Diagnóstico, sem conteúdo dos campos |
| planejamento_enviado | API confirmou o pedido salvo | Medição do formulário; possível meta intermediária durante a implantação |
| whatsapp_aberto | Tentativa de abertura após pedido salvo ou clique no link de apoio | Observação; não chamar de lead qualificado |
| Lead qualificado, futuro | Atendimento confirmou contato válido, interesse e adequação | Meta comercial a importar após validar o processo |
| Venda/adesão, futuro | Resultado confirmado no processo comercial | Ação separada; valor deve representar a economia real do negócio |
| meeting_scheduled e whatsapp_qualificado | Eventos dos fluxos antigos | Auditar vínculos antes de qualquer alteração na conta |

Um nome de evento não define sozinho se ele será usado em lances. Conferir ações primárias, metas aplicadas à campanha e metas personalizadas; estas podem usar ações secundárias em lances. [Google: ações primárias e secundárias](https://support.google.com/google-ads/answer/11461796?hl=pt-BR).

A orientação para o futuro é retornar a qualificação ou o fechamento confirmado no atendimento, com deduplicação e origem. O Google recomenda metas de lead qualificado ou convertido nas conversões otimizadas para leads. A gravação de gclid, wbraid ou gbraid é preparação; não constitui, por si só, uma integração de importação. Método, consentimento, campos e suporte aos identificadores precisam ser configurados e validados. [Google: conversões off-line](https://support.google.com/google-ads/answer/10029210?hl=pt-BR).

Não enviar nome e telefone em parâmetros comuns de eventos GA4. Não utilizar o valor da carta como faturamento ou comissão. As prévias da Vercel e os testes ficam sem as tags de produção por padrão; NEXT_PUBLIC_ENABLE_ANALYTICS=true permite ativação explícita, e false sempre desativa.

## CPA: decisão depois da qualidade

Elevar a meta permite buscar as conversões configuradas com outra restrição de custo; não seleciona automaticamente pessoas melhores. Uma meta muito baixa pode limitar volume, mas aumentar custo com o mesmo sinal inadequado não corrige a definição de sucesso. O diagnóstico deve comparar CPA real, meta média, atraso das conversões, orçamento e qualidade comercial. [Google: CPA desejado](https://support.google.com/google-ads/answer/6268632?hl=pt-BR).

Não há recomendação de valor ou percentual sem os dados da conta e a economia das vendas. Proposta: corrigir medição e intenção, observar resultados comerciais, e só então testar a meta dentro de um limite de gasto definido.

Após alterações de meta, considerar o atraso de conversão e pelo menos um a dois ciclos antes de interpretar o efeito. Não trocar palavras, página, meta e orçamento repetidamente durante a leitura do mesmo teste. [Google: ajustes de meta](https://support.google.com/google-ads/answer/10433846?hl=pt-BR).

## Reativar a campanha antiga?

A contagem histórica, isoladamente, não decide. É necessário segmentar por produto, intenção e ação de conversão, confrontando com contatos válidos, qualificados e vendas.

- Se a campanha anterior já era relevante para automóvel, tinha procura compatível e resultados comerciais aproveitáveis, a reativação com correções pode fazer sentido.
- Se era dominada por imóvel, carta contemplada ou intenção de empréstimo, trocar suas palavras para automóvel mistura contextos. Uma campanha de automóvel com estrutura clara tende a facilitar a avaliação.
- Se a maioria das conversões era clique sem contato efetivo, primeiro reconstruir a medição. Reativar não transforma esse histórico em evidência de qualidade.

Estas são regras de decisão propostas, não conclusões sobre a conta do anunciante.

## Ordem de análise da conta

1. Exportar uma base dos últimos 90 dias e do período completo da campanha antiga: campanhas, grupos, palavras, correspondências, termos de pesquisa disponíveis, anúncios, URLs finais, custo, cliques, conversões e todas as conversões por ação.
2. Inspecionar estratégia de lances, CPA médio desejado, histórico de alterações, metas por campanha, contagem, janelas, atribuição, diagnósticos e possíveis ações sobrepostas.
3. Cruzar com o atendimento por data e origem: contato válido, respondeu, produto, motivo de desqualificação, reunião, proposta, adesão e comissão. Não publicar dados pessoais neste repositório.
4. Avaliar rede, parceiros de pesquisa, localização do usuário, opção de presença/interesse, dispositivo e horário. Decidir exclusões por evidência, sem supor que um segmento é ruim.
5. Separar intenção de automóvel, imóvel, carta já contemplada e necessidade imediata. Conferir a correspondência real entre consulta, anúncio e página.
6. Definir uma mudança principal por teste e um limite de custo. Acompanhar custo por qualificado e custo por adesão, além do CPL.

## Estrutura proposta para automóveis

Começar com uma estrutura simples de pesquisa voltada à intenção de consórcio de automóvel, dentro do orçamento disponível. Usar grupos coerentes com termos como consórcio de carro, automóvel e veículo, com versões exata e de frase como ponto de partida controlado. Correspondência ampla pode ser testada quando a medição e os resultados comerciais justificarem; não é tratada como erro universal.

Destino proposto: https://www.consorciolidera.com.br/consorcio-veiculo

A campanha de imóvel deve apontar para sua página própria. Caso não caiba operar ambos com volume útil, priorizar o produto comercial escolhido e preservar a outra campanha pausada até haver capacidade. Não há proporção de orçamento recomendada sem consulta à conta.

Candidatas a negativas, somente após examinar os termos: consultas claramente imobiliárias na campanha de automóveis; vagas e emprego; segunda via e boleto; carta contemplada quando esse produto não for oferecido; empréstimo pessoal quando a busca for incompatível. Não negativar indiscriminadamente gratuito, simular, financiamento ou sem lance: podem aparecer em pesquisas comerciais relevantes.

As negativas não cobrem automaticamente todas as variantes próximas; conferir acentos, singular/plural e o efeito de cada tipo de correspondência. [Google: palavras-chave negativas](https://support.google.com/google-ads/answer/2453972?hl=pt-BR).

Há textos de anúncio para revisão em anuncios-automoveis-rascunho.csv. Não foram enviados ao Google Ads e não incluem valores comerciais ou condições ainda não confirmadas.

## Métricas de decisão

- Taxa de qualificação = qualificados / contatos válidos únicos.
- Custo por qualificado = gasto / qualificados.
- Custo por adesão = gasto / adesões confirmadas.
- Taxa de contato = pessoas que responderam / contatos válidos.
- Receita líquida/comissão deve ser confrontada com aquisição, cancelamentos e atendimento.

A definição proposta de qualificado exige conversa válida, produto compatível, compreensão da modalidade e capacidade/orçamento a avaliar com uma oferta real. Marcar uma caixa ou declarar reserva não basta. Não desqualificar automaticamente pessoas sem lance.

## Verificação e lançamento

O workflow Landing validation executa testes de entrada, falhas de gravação, repetição, colisão, cálculo de lance embutido e mensagens por intenção, lint dos arquivos novos e build do Next. Os 16 testes e o build de produção passaram localmente em 15/09/2026. Os testes de API usam dependências isoladas e não contatam produção.

A revisão de renderização em navegador, inclusive em 360/390px e desktop, ainda é necessária. O terminal voltou a funcionar nesta etapa e permitiu validar o código. O navegador bloqueou a aplicação local com ERR_BLOCKED_BY_CLIENT; não foi contornado esse bloqueio. Não há resultado de Lighthouse, Core Web Vitals ou aumento de conversão medido.

Antes de publicar:

1. Revisar visualmente as páginas e o formulário na prévia da Vercel, incluindo teclado, texto, imagens e tela pequena.
2. Confirmar identificação comercial, administradora, canais de atendimento e aviso de privacidade conforme a operação real.
3. Validar as variáveis do Supabase, a coluna notas e uma gravação de teste em ambiente de teste. Confirmar quem recebe e atende os pedidos.
4. Conferir URLs finais dos anúncios, sobretudo os de imóvel que hoje apontem à raiz. Navegadores podem ter guardado o redirecionamento permanente antigo; atualizar os destinos explicitamente e conferir a chegada real.
5. Configurar a nova ação de conversão e sua função nos lances antes de encaminhar tráfego. Não manter a campanha otimizando apenas eventos antigos que deixaram de existir na nova página.
6. Fazer merge e publicação apenas depois de a versão estar revisada. O rollback consiste em reverter o commit da landing e restaurar a configuração de medição correspondente; os pedidos já salvos permanecem no banco.

A landing prepara a captação e a atribuição. A importação de qualificação, a análise quantitativa das campanhas e mudanças de orçamento dependem do acesso à conta e do processo comercial.

## Atendimento por WhatsApp

O caminho e os roteiros de conversa propostos estão em [atendimento-whatsapp.md](atendimento-whatsapp.md). Há uma única saída comercial, com contexto de intenção, sem exigência de reunião. A hipótese de menor atrito deve ser confrontada com taxa de conversa válida e custo por qualificado, sem pressupor ganho de conversão.
