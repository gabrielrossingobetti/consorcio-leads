# Revisão da landing e do simulador — 15/09/2026

## Parecer

O simulador deve ajudar a pessoa a entender o que está pedindo e levar esse contexto ao WhatsApp. A hipótese inicial mais coerente com o problema relatado é um percurso curto de qualificação, com duas intenções de atendimento no mesmo canal. Um botão direto pode gerar mais aberturas; isso não basta para concluir que gera mais clientes. Não há evidência disponível para chamar qualquer versão de “perfeita” ou atribuir uma taxa de conversão esperada.

Esta revisão usa o código do projeto, os três prints enviados, páginas públicas da referência, pesquisas de usabilidade e documentação oficial. Não houve acesso à conta Google Ads, às conversas ou às vendas. As aproximadamente 160 conversões e a baixa qualidade são relatos do anunciante, não números auditados.

## Diagnóstico e alterações

| Ponto observado | Consequência provável | Alteração preparada |
| --- | --- | --- |
| Fonte Syne 800 e espaçamento negativo intenso nos grandes títulos | Letras muito próximas e linhas excessivas, como mostram os prints | DM Sans variável, peso 650, espaçamento moderado e entrelinha maior; sem deformar a fonte |
| Longa explicação antes da captação | Visitante precisa percorrer conteúdo para começar | Simulador logo após a abertura, antes da explicação em três passos |
| Aparência predominantemente plana | Pouca diferenciação entre apresentação e ação | Camadas de luz, moldura com profundidade, imagem ampla, seção azul profunda e detalhes de movimento |
| Crédito disponível apenas por barra e sugestões | Dificuldade para informar um valor específico | Campo digitável, sugestões e controle por teclado, com mensagem de erro junto ao valor |
| Formulário sem exemplo numérico sobre lance | Pouco aprendizado antes do contato | Exemplo opcional de 25%, mostrando a dedução e o crédito restante |
| Um atendimento para pessoas com níveis diferentes de conhecimento | Conversa pode começar fora do momento da pessoa | Duas intenções explícitas e mensagens diferentes para o mesmo WhatsApp |
| Dificuldade para identificar abandono | Volume final esconde a etapa problemática | Eventos de início, conclusão da primeira etapa e falhas, sem nome ou telefone |

As consequências da tabela são hipóteses de experiência e negócio. O código e os prints permitem localizar os pontos; a magnitude do impacto exige observação real.

## O que a pesquisa sustenta

**Nielsen Norman Group — formulários.** A recomendação é reduzir perguntas desnecessárias, manter rótulos visíveis, usar uma coluna, explicar formatos e preservar dados quando ocorre erro. Aplicação: não pedir e-mail, CPF, CEP ou agenda neste contato inicial; manter nome e telefone identificados, além de orçamento e momento de compra, que têm função no atendimento. Não se presume que uma diretriz tenha o mesmo efeito quantitativo em consórcio. [Website Forms Usability](https://www.nngroup.com/articles/web-form-design/).

**Nielsen Norman Group — carga cognitiva.** Dividir por assuntos, exibir progresso e revelar detalhes conforme a necessidade ajuda a tornar formulários complexos compreensíveis. Aplicação: duas etapas visíveis; lance embutido opcional; condições adicionais expansíveis; revisão do objetivo antes do envio. O estudo não prova que duas etapas sempre vencem uma. [4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/).

**Baymard — requisitos dos campos.** Identificar o que é obrigatório ou opcional reduz incerteza. Sua pesquisa citada se concentra em checkout e criação de conta; não é um experimento da Lidera. Aplicação: identificar a simulação do lance como opcional, a intenção como obrigatória e informar as exigências da etapa de contato. [Required and Optional Fields](https://baymard.com/blog/required-optional-form-fields).

**Embracon — referência observada.** A página pública combina produto explícito, linguagem de conquista, imagens, chamadas para simular e explicações. Aplicação: hierarquia e clareza do produto na identidade Lidera. A existência desses elementos não comprova a performance da página da Embracon. Não se transferem sua marca, suas credenciais, números, imagens ou depoimentos. [Página consultada](https://www.embracon.com.br/).

**Limite do apelo visual.** A aparência pode influenciar a percepção de facilidade, mas também esconder problemas de uso. Por isso os efeitos ficam na apresentação; campos e ações mantêm padrões familiares. A preferência por movimento reduzido é respeitada. [NN/G: Aesthetic-Usability Effect](https://www.nngroup.com/articles/aesthetic-usability-effect/).

## Lance embutido: como o exemplo deve ser lido

O anunciante informou a possibilidade de usar 25% da carta. O regulamento público de veículos da Ademicon admite lance embutido conforme critérios do grupo, na cláusula 46.1. A cláusula 50 mostra que a base de classificação do lance pode incluir encargos. O regulamento geral consultado não confirma que 25% seja permitido para todo grupo ou produto. Por isso, a landing usa um exemplo condicionado e não uma oferta universal. [Regulamento de veículos, abril de 2025](https://www.ademicon.com.br/api/media/file/REGULAMENTO-VEICULOS.pdf).

| Conta ilustrativa | Carta de R$ 100.000 | Carta de R$ 400.000 |
| --- | ---: | ---: |
| Parte do crédito destinada ao lance: 25% | R$ 25.000 | R$ 100.000 |
| Crédito restante para comprar, se o lance vencer | R$ 75.000 | R$ 300.000 |

O dinheiro destinado ao lance sai da própria carta. Isso não significa que a parcela, taxas ou todos os compromissos cairão 25%, nem prevê quando ocorrerá a contemplação. O exemplo não estima probabilidade de vencer. Para comprar um bem que custa R$ 100 mil com esse lance, uma carta de R$ 100 mil não deixa R$ 100 mil disponíveis para a compra.

A página registra que a pessoa explorou o exemplo. O servidor calcula novamente a dedução e o saldo, e a mensagem do WhatsApp repete que a utilização depende do grupo. Assim, um resultado editado no navegador não vira um valor confiável no cadastro.

## Por que manter orçamento e momento de compra

O objetivo comercial é receber contatos mais compatíveis. Tirar todas as perguntas favorece a velocidade, mas também remove contexto. A faixa mensal ajuda a escolher uma proposta possível; “Quero orientação” evita obrigar um iniciante a inventar um valor. A necessidade imediata exige uma explicação clara sobre contemplação antes de qualquer proposta.

Essas respostas não aprovam, reprovam ou qualificam automaticamente uma pessoa. Quem não tem dinheiro para lance pode ser adequado ao consórcio. Quem declara querer contratar pode ainda estar buscando crédito imediato. A qualificação depende da conversa e de condições reais do plano.

A reserva própria permanece para o atendimento. O exemplo de lance embutido não implica uma declaração de falta de dinheiro, nem substitui a análise do objetivo.

## Como decidir se a revisão trouxe clientes melhores

| Etapa | Evidência necessária | O que não deve ser presumido |
| --- | --- | --- |
| Início | Primeiro foco ou alteração de um controle do formulário | Apenas visitar a página não é iniciar um pedido |
| Objetivo concluído | Passagem válida para a etapa 2, uma vez por montagem do formulário | Isso ainda não é um contato |
| Pedido salvo | Resposta confirmada da API e identificador correspondente | Clique em enviar não comprova salvamento |
| WhatsApp aberto | Tentativa de navegação ou clique no link de apoio | Abertura não comprova mensagem enviada |
| Conversa válida | Atendimento recebeu uma mensagem e identificou a necessidade | Não é a mesma métrica do evento do site |
| Qualificado e adesão | Resultado comercial confirmado, com critérios consistentes | Checkbox ou valor alto de carta não comprova qualidade |

Os eventos novos são `planejamento_iniciado`, `planejamento_etapa_concluida` e `planejamento_erro`. Eles servem para diagnóstico, sem inscrição automática como conversões de lances. O evento `planejamento_enviado` continua dependente de gravação confirmada. O início é uma interação do formulário, não uma pessoa única ou sessão global; voltar ou trocar de produto precisa ser considerado na análise.

Comparar custo por qualificado e por adesão, com contatos únicos, origem e tempo de maturação. Exemplo hipotético: CPL de R$ 10 com 5% de qualificação resulta em R$ 200 por qualificado; CPL de R$ 25 com 25% resulta em R$ 100. Isso mostra por que mais leads baratos podem ser piores, sem representar os resultados desta conta.

Experimento posterior: comparar o formulário breve com uma entrada direta no WhatsApp, mantendo produto, oferta, atendimento e tráfego comparáveis. Definir antes o resultado principal, orçamento máximo, duração suficiente para o ciclo comercial e amostra a partir da taxa real de qualificação. Não encerrar ao aparecer uma venda ou escolher a variante apenas pelo número de aberturas.

## CPA e a campanha antiga

O CPA desejado orienta o sistema a buscar as conversões configuradas dentro de uma meta de custo. Uma meta restritiva pode limitar volume; aumentá-la não escolhe automaticamente pessoas com maior chance de fechar. Minha recomendação é verificar primeiro o sinal de conversão, a intenção dos termos e a página de chegada. [Google: CPA desejado](https://support.google.com/google-ads/answer/6268632?hl=pt-BR).

Ações primárias, metas da campanha e metas personalizadas determinam quais eventos entram nos lances. Portanto, é necessário conferir como o antigo `whatsapp_qualificado` estava configurado; seu nome não prova que houve uma conversa qualificada. [Google: ações primárias e secundárias](https://support.google.com/google-ads/answer/11461796?hl=pt-BR).

Não recomendo reativar ou transformar a campanha de aproximadamente 160 conversões com base apenas nessa contagem. Se o histórico útil já for de automóvel, pode haver motivo para recuperá-la. Se vier principalmente de imóvel ou cliques sem contato, trocar palavras não valida esse histórico. A decisão deve cruzar termos, custo, ações de conversão, URLs, conversas e vendas. O roteiro e os relatórios necessários estão em [lidera-lancamento.md](lidera-lancamento.md).

## Verificação e limites desta entrega

- 16 testes automatizados aprovados: entrada, preservação da origem, gravação, falha de banco, repetição, colisão, cálculo monetário, recálculo no servidor e mensagem de WhatsApp.
- Build de produção do Next.js e TypeScript concluído localmente. Lint dos arquivos alterados aprovado.
- Nenhum pedido real foi criado e nenhuma mensagem foi enviada em testes.
- Acesso local pelo navegador foi bloqueado nesta sessão (`ERR_BLOCKED_BY_CLIENT`). A conferência visual em desktop e celular e o teste de uso com pessoas continuam pendentes. Não há nota de Lighthouse nem resultado medido de conversão.
- Para simular parcelas comerciais reais, ainda é necessária a tabela vigente dos grupos: crédito, prazo, taxa, demais custos, reajustes e regras de lance. O formulário atual simula objetivo e efeito do lance; não inventa uma parcela.
- A implementação está na branch de revisão. Publicação, configuração de conversões e análise quantitativa da conta ainda dependem das verificações descritas no roteiro.
