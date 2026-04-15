
window.GAME_DATA = {
  arcs: [
    { name: "Arranque", tag: "blue", months: [1, 12] },
    { name: "Expansão", tag: "green", months: [13, 24] },
    { name: "Pressão", tag: "amber", months: [25, 36] },
    { name: "Choque", tag: "red", months: [37, 48] },
    { name: "Virada", tag: "violet", months: [49, 60] },
  ],
  eventPools: {
    early: [
      {
        id: "early_caixa",
        type: "mix",
        title: "Caixa apertado no começo",
        desc: "O mês começa com vendas abaixo do esperado e o caixa fica sensível a qualquer gasto fora da curva.",
        note: "No início, o principal perigo é uma sequência pequena de más decisões.",
        terms: ["fluxo_caixa", "capital_de_giro", "reserva_emergencia"],
        formula: "Caixa saudável = entrada suficiente para cobrir saída e ainda sobrar margem de segurança.",
        choices: [
          {
            label: "Cortar despesas não essenciais",
            detail: "Reduz a pressão no curto prazo.",
            learn: "Controle de custo é proteção de caixa.",
            effect: g => {
              g.expenseBase = Math.max(52000, g.expenseBase - 3500);
              g.supplierRep -= 2;
              g.clientTrust += 1;
              return { type: "good", text: "Você enxugou a estrutura e ganhou fôlego operacional." };
            },
          },
          {
            label: "Fazer promoção agressiva",
            detail: "Ganha volume, mas pressiona margem.",
            learn: "Vender muito nem sempre significa lucrar mais.",
            effect: g => {
              g.revenueBase += 4500;
              g.clientTrust += 8;
              g.macro.demand += 4;
              g.cash -= 3000;
              return { type: "neutral", text: "A promoção trouxe movimento, porém sacrificou parte da margem." };
            },
          },
          {
            label: "Usar reserva para sustentar a operação",
            detail: "Protege o ritmo, mas reduz a folga.",
            learn: "Reserva de emergência existe para momentos assim.",
            effect: g => {
              g.cash += 8000;
              g.macro.risk -= 1;
              g.creditScore += 4;
              return { type: "good", text: "A reserva segurou o caixa e evitou estresse imediato." };
            },
          },
        ],
      },
      {
        id: "early_cliente_novo",
        type: "pos",
        title: "Novo cliente B2B",
        desc: "Uma rede regional quer comprar em volume, mas pede prazo e desconto no primeiro contrato.",
        note: "Escalar vendas costuma exigir aceitar um pouco mais de risco comercial.",
        terms: ["inadimplencia", "custo_oportunidade", "score_credito"],
        formula: "Volume maior pode compensar margem menor se o risco de calote ficar controlado.",
        choices: [
          {
            label: "Fechar contrato com prazo curto",
            detail: "Menor risco, menor apelo.",
            learn: "Prazo curto protege o capital de giro.",
            effect: g => {
              g.cash += 12000;
              g.revenueBase += 2500;
              g.clientTrust += 8;
              g.creditScore += 5;
              return { type: "good", text: "Você fechou um contrato seguro e aumentou a previsibilidade." };
            },
          },
          {
            label: "Dar desconto forte para ganhar escala",
            detail: "Pode abrir porta para crescimento.",
            learn: "Estratégia comercial também tem custo de oportunidade.",
            effect: g => {
              g.cash += 7000;
              g.revenueBase += 6500;
              g.clientTrust += 12;
              g.macro.demand += 5;
              return { type: "good", text: "O volume aumentou e a empresa ficou mais visível no mercado." };
            },
          },
        ],
      },
      {
        id: "early_estoque",
        type: "mix",
        title: "Estoque envelhecendo",
        desc: "Parte do estoque ficou parado tempo demais e precisa ser girada antes de virar prejuízo.",
        note: "Estoque parado é dinheiro preso.",
        terms: ["liquidez", "custo_oportunidade", "ativo"],
        formula: "Se o estoque gira rápido, o caixa volta mais cedo.",
        choices: [
          {
            label: "Dar liquidação controlada",
            detail: "Transforma estoque parado em caixa.",
            learn: "Liquidez ajuda a recuperar valor antes da perda.",
            effect: g => {
              g.cash += 9500;
              g.clientTrust += 4;
              g.expenseBase -= 1000;
              return { type: "good", text: "Você liberou capital preso no estoque." };
            },
          },
          {
            label: "Segurar preço e esperar",
            detail: "Tenta defender a margem.",
            learn: "Às vezes esperar custa mais do que reduzir o preço.",
            effect: g => {
              g.macro.demand -= 3;
              g.revenueBase += 1500;
              g.creditScore -= 4;
              return { type: "neutral", text: "Você preservou preço, mas aumentou o risco de obsolescência." };
            },
          },
        ],
      },
      {
        id: "early_fluxo_recebiveis",
        type: "mix",
        title: "Antecipação de recebíveis",
        desc: "O banco oferece transformar vendas futuras em caixa imediato, com desconto na operação.",
        note: "É uma solução útil, mas não deve virar muleta.",
        terms: ["antecipacao_recebiveis", "cet", "fluxo_caixa"],
        formula: "Receber antes melhora liquidez, mas reduz o valor líquido da venda.",
        choices: [
          {
            label: "Antecipar uma parte pequena",
            detail: "Resolve o aperto sem exagerar no custo.",
            learn: "Nem todo crédito precisa ser total.",
            effect: g => {
              g.cash += 10000;
              g.creditScore += 2;
              g.debt += 1500;
              return { type: "neutral", text: "Você reforçou o caixa com custo moderado." };
            },
          },
          {
            label: "Não antecipar e aguardar pagamento",
            detail: "Protege o resultado, mas exige disciplina.",
            learn: "Liquidez e rentabilidade nem sempre caminham juntas.",
            effect: g => {
              g.clientTrust += 3;
              g.macro.risk -= 1;
              return { type: "good", text: "Você manteve a margem, mas precisou confiar no calendário de recebimento." };
            },
          },
        ],
      },
      {
        id: "early_marketing",
        type: "pos",
        title: "Campanha digital funciona",
        desc: "Uma ação simples nas redes trouxe mais pedidos do que o esperado.",
        note: "Em fase inicial, pequenos impulsos de demanda fazem diferença.",
        terms: ["demanda", "custo_oportunidade"],
        formula: "Marketing pode aumentar a demanda sem crescer proporcionalmente a estrutura.",
        choices: [
          {
            label: "Reinvestir no canal que funcionou",
            detail: "Amplia o alcance do ganho.",
            learn: "Testar e escalar é uma lógica útil em negócios.",
            effect: g => {
              g.revenueBase += 4000;
              g.clientTrust += 10;
              g.cash -= 2000;
              return { type: "good", text: "A campanha virou uma máquina de aquisição melhor estruturada." };
            },
          },
          {
            label: "Manter como ação pontual",
            detail: "Evita gasto recorrente.",
            learn: "Nem todo sucesso precisa virar despesa fixa.",
            effect: g => {
              g.cash += 5000;
              g.macro.demand += 2;
              return { type: "neutral", text: "Você colheu o ganho pontual e evitou inflar o custo fixo." };
            },
          },
        ],
      },
    ],
    growth: [
      {
        id: "growth_selic_up",
        type: "major",
        title: "Banco Central eleva a Selic",
        desc: "O governo endurece a política monetária. O crédito fica mais caro, os bancos apertam as condições e o mercado desacelera.",
        note: "Evento macro grande: o impacto atinge dívida, consumo e investimentos ao mesmo tempo.",
        terms: ["selic", "spread_bancario", "custo_oportunidade"],
        formula: "Selic maior tende a encarecer capital e diminuir apetite por risco.",
        choices: [
          {
            label: "Travar dívida com taxa fixa",
            detail: "Protege contra novas altas.",
            learn: "Fixar custo pode reduzir incerteza futura.",
            effect: g => {
              g.debtRate = Math.max(g.debtRate, 0.038);
              g.creditScore += 5;
              g.cash -= 4000;
              return { type: "good", text: "Você travou parte do custo financeiro antes de novos apertos." };
            },
          },
          {
            label: "Reduzir expansão e preservar caixa",
            detail: "Cresce menos, mas com mais controle.",
            learn: "Quando juros sobem, prudência vira vantagem.",
            effect: g => {
              g.revenueBase -= 1000;
              g.expenseBase -= 2500;
              g.macro.risk -= 2;
              return { type: "good", text: "Você desacelerou a operação para atravessar o aperto de juros." };
            },
          },
          {
            label: "Apostar em crescimento mesmo assim",
            detail: "Busca ganho de mercado, mas com risco maior.",
            learn: "A taxa Selic altera o custo do erro.",
            effect: g => {
              g.revenueBase += 5000;
              g.debt += 5000;
              g.creditScore -= 6;
              return { type: "neutral", text: "Você escolheu crescer contra a maré e comprou mais risco." };
            },
          },
        ],
      },
      {
        id: "growth_automacao",
        type: "pos",
        title: "Automação no estoque",
        desc: "Um sistema simples de controle reduz perdas, retrabalho e pedido errado.",
        note: "Investir em eficiência costuma ter retorno silencioso, mas persistente.",
        terms: ["margem_bruta", "ebitda", "ativo"],
        formula: "Eficiência operacional tende a melhorar a margem sem aumentar tanto a receita.",
        choices: [
          {
            label: "Adotar a automação já",
            detail: "Corta desperdício rapidamente.",
            learn: "Eficiência também é lucro.",
            effect: g => {
              g.expenseBase -= 5000;
              g.cash -= 6000;
              g.creditScore += 4;
              return { type: "good", text: "A operação ficou mais enxuta e menos sujeita a erros." };
            },
          },
          {
            label: "Testar em uma unidade primeiro",
            detail: "Mexe menos no caixa.",
            learn: "Piloto reduz risco de implantação.",
            effect: g => {
              g.expenseBase -= 2500;
              g.cash -= 2500;
              g.clientTrust += 2;
              return { type: "neutral", text: "Você reduziu risco, mas também o ganho imediato." };
            },
          },
        ],
      },
      {
        id: "growth_contrato",
        type: "pos",
        title: "Contrato recorrente fechado",
        desc: "Um cliente grande quer compra mensal constante por um ano.",
        note: "Receita previsível ajuda bastante em fase de crescimento.",
        terms: ["ponto_equilibrio", "fluxo_caixa", "margem_liquida"],
        formula: "Receita recorrente suaviza o fluxo de caixa.",
        choices: [
          {
            label: "Aceitar com reajuste trimestral",
            detail: "Protege contra inflação.",
            learn: "Indexar contrato ajuda a defender margem.",
            effect: g => {
              g.revenueBase += 9000;
              g.clientTrust += 8;
              g.macro.demand += 3;
              return { type: "good", text: "A previsibilidade aumentou e a empresa ganhou fôlego." };
            },
          },
          {
            label: "Aceitar sem reajuste para ganhar mercado",
            detail: "Mais agressivo comercialmente.",
            learn: "Preço baixo hoje pode ser estratégia de entrada.",
            effect: g => {
              g.revenueBase += 12000;
              g.expenseBase += 2000;
              g.clientTrust += 10;
              return { type: "good", text: "Você ganhou escala, mas deixou a margem mais sensível." };
            },
          },
        ],
      },
      {
        id: "growth_cambio",
        type: "mix",
        title: "Câmbio sobe e encarece insumos",
        desc: "Itens importados e partes dolarizadas pressionam custo. O fornecedor repassa parte do aumento.",
        note: "A alta do câmbio pode aparecer com atraso, mas chega no custo final.",
        terms: ["cambio", "inflacao", "margem_bruta"],
        formula: "Câmbio mais alto costuma ampliar custos de compra e logística.",
        choices: [
          {
            label: "Repassar parte do aumento ao preço",
            detail: "Protege margem.",
            learn: "Preço é uma ferramenta defensiva.",
            effect: g => {
              g.revenueBase += 2000;
              g.macro.demand -= 2;
              g.cash += 2500;
              return { type: "neutral", text: "Você repassou parte do choque ao mercado." };
            },
          },
          {
            label: "Negociar com fornecedores e segurar a ponta",
            detail: "Tenta preservar o cliente.",
            learn: "Relacionamento com fornecedor reduz volatilidade.",
            effect: g => {
              g.supplierRep += 8;
              g.expenseBase -= 2500;
              g.cash -= 1000;
              return { type: "good", text: "Você aliviou a pressão sem elevar tanto o preço final." };
            },
          },
        ],
      },
      {
        id: "growth_tax",
        type: "mix",
        title: "Mudança tributária local",
        desc: "Uma regra municipal altera a cobrança de parte dos custos, mexendo no resultado líquido.",
        note: "Nem todo choque é de mercado; política pública também pesa.",
        terms: ["margem_liquida", "custo_oportunidade"],
        formula: "Mudanças tributárias afetam o lucro mesmo quando a receita não muda.",
        choices: [
          {
            label: "Adaptar preço e processo",
            detail: "Protege o resultado final.",
            learn: "Conformidade custa, mas improvisar pode custar mais.",
            effect: g => {
              g.expenseBase -= 1800;
              g.revenueBase += 1500;
              return { type: "good", text: "Você ajustou a empresa antes de a mudança pesar demais." };
            },
          },
          {
            label: "Esperar para ver",
            detail: "Evita mexer cedo demais.",
            learn: "Adiamento pode ser caro quando o problema é estrutural.",
            effect: g => {
              g.macro.taxPressure += 3;
              g.creditScore -= 2;
              return { type: "neutral", text: "Você ganhou tempo, mas o risco tributário continuou no horizonte." };
            },
          },
        ],
      },
    ],
    pressure: [
      {
        id: "pressure_inadimplencia",
        type: "neg",
        title: "Inadimplência em alta",
        desc: "Alguns clientes atrasaram pagamentos e a previsão de entrada ficou menos confiável.",
        note: "Quando o mercado aperta, recebíveis viram ponto sensível.",
        terms: ["inadimplencia", "fluxo_caixa", "score_credito"],
        formula: "Atraso de clientes força a empresa a financiar o próprio negócio.",
        choices: [
          {
            label: "Cobrar com desconto para receber rápido",
            detail: "Melhora o caixa, reduz a margem.",
            learn: "Receber cedo vale mais em crise.",
            effect: g => {
              g.cash += 12000;
              g.revenueBase -= 1500;
              g.clientTrust -= 3;
              return { type: "good", text: "Você acelerou recebimentos e reduziu o risco de aperto.", };
            },
          },
          {
            label: "Manter cobrança firme e formal",
            detail: "Preserva margem e reputação contratual.",
            learn: "Disciplina comercial também protege o caixa.",
            effect: g => {
              g.creditScore += 4;
              g.clientTrust -= 2;
              g.debt -= 2500;
              return { type: "neutral", text: "Você endureceu a cobrança para preservar a régua financeira." };
            },
          },
        ],
      },
      {
        id: "pressure_reajuste",
        type: "mix",
        title: "Reajuste de fornecedor",
        desc: "Fornecedor principal avisou que vai aumentar preços por causa do próprio custo e da inflação acumulada.",
        note: "A pressão sobre margem bruta fica mais forte quando a cadeia inteira sobe junto.",
        terms: ["inflacao", "margem_bruta", "spread_bancario"],
        formula: "Custos maiores sem reajuste de preço comprimem o lucro.",
        choices: [
          {
            label: "Renegociar volume por preço",
            detail: "Troca previsibilidade por desconto.",
            learn: "Volume pode comprar margem.",
            effect: g => {
              g.supplierRep += 6;
              g.expenseBase -= 4500;
              g.cash += 1000;
              return { type: "good", text: "A negociação reduziu o impacto do reajuste." };
            },
          },
          {
            label: "Trocar parte do fornecedor",
            detail: "Melhora preço, cria transição.",
            learn: "Diversificar fornecedor reduz dependência.",
            effect: g => {
              g.supplierRep -= 2;
              g.expenseBase -= 2500;
              g.macro.risk += 2;
              return { type: "neutral", text: "Você ganhou flexibilidade, mas teve custo de transição." };
            },
          },
          {
            label: "Repasse total ao preço final",
            detail: "Protege margem imediata.",
            learn: "Preço é defesa, mas pode afetar demanda.",
            effect: g => {
              g.revenueBase += 3500;
              g.macro.demand -= 4;
              return { type: "neutral", text: "Você preservou margem, porém a demanda ficou mais frágil." };
            },
          },
        ],
      },
      {
        id: "pressure_credit",
        type: "major",
        title: "Crédito no mercado fica seletivo",
        desc: "Os bancos apertam critérios, exigem mais garantia e reduzem linhas para empresas com pior score.",
        note: "Evento grande: a empresa perde acesso fácil ao dinheiro barato.",
        terms: ["score_credito", "garantia", "spread_bancario"],
        formula: "Quando o crédito seca, o valor do score sobe e a dívida antiga pesa mais.",
        choices: [
          {
            label: "Fortalecer caixa antes de pedir crédito",
            detail: "Passa segurança ao banco.",
            learn: "Caixa alto melhora poder de negociação.",
            effect: g => {
              g.cash -= 3000;
              g.creditScore += 8;
              g.debtRate -= 0.003;
              return { type: "good", text: "Você se posicionou melhor para negociar novas linhas." };
            },
          },
          {
            label: "Oferecer garantia adicional",
            detail: "Reduz taxa, mas aumenta risco patrimonial.",
            learn: "Garantia barata não é gratuita.",
            effect: g => {
              g.creditScore += 12;
              g.debtRate -= 0.006;
              g.cash += 5000;
              return { type: "good", text: "A garantia melhorou a taxa e destravou liquidez." };
            },
          },
          {
            label: "Evitar novas dívidas e encolher a operação",
            detail: "Defensiva extrema.",
            learn: "Sobrevivência às vezes vale mais que crescimento.",
            effect: g => {
              g.revenueBase -= 3500;
              g.expenseBase -= 3500;
              g.macro.risk -= 3;
              return { type: "neutral", text: "Você recuou para proteger o caixa e atravessar a fase mais dura." };
            },
          },
        ],
      },
      {
        id: "pressure_competidor",
        type: "mix",
        title: "Competidor faz guerra de preço",
        desc: "Um concorrente reduziu preços com agressividade e tenta roubar sua carteira.",
        note: "Mercado competitivo exige equilíbrio entre defesa e margem.",
        terms: ["custo_oportunidade", "margem_liquida"],
        formula: "Preço menor pode aumentar volume, mas corrói o resultado líquido.",
        choices: [
          {
            label: "Melhorar serviço e entrega",
            detail: "Compete além do preço.",
            learn: "Diferenciação ajuda a evitar guerra destrutiva.",
            effect: g => {
              g.clientTrust += 10;
              g.expenseBase += 1000;
              g.revenueBase += 2500;
              return { type: "good", text: "Você se diferenciou e protegeu a base de clientes." };
            },
          },
          {
            label: "Entrar na guerra de preços",
            detail: "Tenta defender volume a qualquer custo.",
            learn: "Nem toda briga de preço vale a pena.",
            effect: g => {
              g.revenueBase += 3000;
              g.macro.demand += 1;
              g.expenseBase += 2500;
              g.creditScore -= 5;
              return { type: "neutral", text: "Você segurou mercado, mas apertou a margem." };
            },
          },
        ],
      },
      {
        id: "pressure_logistica",
        type: "neg",
        title: "Logística emperrada",
        desc: "Atrasos em transporte e distribuição reduzem a velocidade de entrega.",
        note: "Quando a operação trava, a percepção do cliente cai junto.",
        terms: ["liquidez", "ativo", "fluxo_caixa"],
        formula: "Logística lenta pode transformar boa venda em mau atendimento.",
        choices: [
          {
            label: "Contratar apoio logístico temporário",
            detail: "Resolve mais rápido.",
            learn: "Terceirizar pode ser ponte útil.",
            effect: g => {
              g.cash -= 5000;
              g.clientTrust += 7;
              g.revenueBase += 2000;
              return { type: "good", text: "A operação desengasgou e o atendimento melhorou." };
            },
          },
          {
            label: "Reorganizar rotas e prioridades",
            detail: "Menor custo, mais trabalho interno.",
            learn: "Processo bom evita custo recorrente.",
            effect: g => {
              g.expenseBase -= 1800;
              g.clientTrust += 3;
              g.macro.risk -= 1;
              return { type: "neutral", text: "Você ganhou eficiência com um ajuste operacional mais barato." };
            },
          },
        ],
      },
    ],
    shock: [
      {
        id: "shock_crise_global",
        type: "major",
        title: "Crise global derruba o apetite do mercado",
        desc: "Uma crise internacional mexe com confiança, crédito e consumo. O país sente a desaceleração e o comprador fica mais cauteloso.",
        note: "Esse tipo de evento muda o ambiente inteiro, não apenas um setor.",
        terms: ["pib", "demanda", "reserva_emergencia"],
        formula: "Crises globais reduzem demanda, encarecem crédito e aumentam volatilidade.",
        choices: [
          {
            label: "Proteger caixa e reduzir exposição",
            detail: "Defensivo, mas sólido.",
            learn: "Em crise sistêmica, liquidez é poder.",
            effect: g => {
              g.cash += 8000;
              g.macro.demand -= 6;
              g.expenseBase -= 3500;
              g.creditScore += 4;
              return { type: "good", text: "Você reforçou a resistência da empresa para atravessar a turbulência." };
            },
          },
          {
            label: "Aproveitar concorrentes fracos para crescer",
            detail: "Mais agressivo e arriscado.",
            learn: "Crise também abre espaço para quem aguenta.",
            effect: g => {
              g.revenueBase += 7000;
              g.debt += 5000;
              g.clientTrust += 6;
              return { type: "neutral", text: "Você foi ofensivo em meio ao caos e tentou ganhar participação." };
            },
          },
        ],
      },
      {
        id: "shock_estoque",
        type: "neg",
        title: "Quebra de estoque",
        desc: "Parte da mercadoria vence, estraga ou precisa ser baixada para liberar espaço.",
        note: "Perda de estoque é um golpe direto no resultado.",
        terms: ["ativo", "margem_bruta", "liquidez"],
        formula: "Baixa de estoque corrói lucro e piora o giro do ativo.",
        choices: [
          {
            label: "Liquidação imediata",
            detail: "Recupera parte do valor.",
            learn: "Venda rápida pode ser melhor que perda total.",
            effect: g => {
              g.cash += 6000;
              g.expenseBase += 1000;
              g.clientTrust += 2;
              return { type: "neutral", text: "Você converteu parte da perda em caixa." };
            },
          },
          {
            label: "Abater tudo de uma vez",
            detail: "Tira o problema da frente.",
            learn: "Assumir a perda pode simplificar o balanço.",
            effect: g => {
              g.cash -= 4000;
              g.creditScore -= 6;
              g.macro.risk += 2;
              return { type: "bad", text: "A baixa afetou o resultado e apertou a percepção do mercado." };
            },
          },
        ],
      },
      {
        id: "shock_cyber",
        type: "major",
        title: "Ataque cibernético derruba sistemas",
        desc: "O pedido trava, a comunicação falha e o suporte fica sobrecarregado. O problema não é só técnico: é reputacional.",
        note: "Eventos de tecnologia afetam caixa, confiança e operação ao mesmo tempo.",
        terms: ["ativo", "fluxo_caixa", "liquidez"],
        formula: "Interrupções operacionais têm custo financeiro e também de imagem.",
        choices: [
          {
            label: "Restaurar rápido com consultoria",
            detail: "Mais caro, mas acelera a volta.",
            learn: "Recuperação rápida reduz perdas secundárias.",
            effect: g => {
              g.cash -= 12000;
              g.clientTrust += 4;
              g.creditScore += 2;
              return { type: "good", text: "Você comprou velocidade de recuperação e reduziu o dano duradouro." };
            },
          },
          {
            label: "Usar a crise para rever processos",
            detail: "Recupera com mudança estrutural.",
            learn: "Crise pode virar reforma operacional.",
            effect: g => {
              g.expenseBase -= 3000;
              g.revenueBase += 2000;
              g.clientTrust -= 2;
              return { type: "neutral", text: "Você aproveitou o choque para fortalecer a estrutura interna." };
            },
          },
        ],
      },
      {
        id: "shock_governo",
        type: "major",
        title: "Governo aperta tributação temporária",
        desc: "Medida emergencial eleva a carga sobre parte da operação para tentar equilibrar as contas públicas.",
        note: "Política fiscal pode mudar a conta do mês sem mudar as vendas.",
        terms: ["pib", "margem_liquida", "custo_oportunidade"],
        formula: "Tributos maiores reduzem o lucro disponível e podem travar investimento.",
        choices: [
          {
            label: "Recalcular preços e cortar desperdício",
            detail: "Defesa organizada.",
            learn: "Eficiência é a resposta mais rápida a tributos maiores.",
            effect: g => {
              g.expenseBase -= 4000;
              g.revenueBase += 1500;
              g.creditScore += 3;
              return { type: "good", text: "Você absorveu o choque fiscal com ajuste operacional." };
            },
          },
          {
            label: "Suspender expansão e preservar caixa",
            detail: "Corta ambição para atravessar a fase.",
            learn: "Sobrevivência segura pode valer mais do que crescimento forçado.",
            effect: g => {
              g.cash += 5000;
              g.macro.risk -= 2;
              g.macro.demand -= 1;
              return { type: "neutral", text: "Você ficou mais conservador para não quebrar o plano financeiro." };
            },
          },
        ],
      },
    ],
    recovery: [
      {
        id: "recovery_desconto_divida",
        type: "pos",
        title: "Chance de renegociar dívida",
        desc: "O credor aceita conversar. Há espaço para reduzir juros em troca de prazo e organização.",
        note: "Renegociação bem-feita pode destravar crescimento futuro.",
        terms: ["rolagem_divida", "cet", "score_credito"],
        formula: "Alongar prazo reduz pressão mensal, mas pode aumentar custo total.",
        choices: [
          {
            label: "Alongar e baixar a parcela",
            detail: "Alívio imediato.",
            learn: "Prazo maior melhora o fôlego, mas deve ser monitorado.",
            effect: g => {
              g.debtTerms = Math.min(24, g.debtTerms + 8);
              g.debtRate = Math.max(0.028, g.debtRate - 0.004);
              g.creditScore += 7;
              return { type: "good", text: "A dívida ficou mais respirável e o caixa ganhou margem de manobra." };
            },
          },
          {
            label: "Pagar um pedaço à vista e negociar o resto",
            detail: "Menos custo total.",
            learn: "Amortizar antes reduz juros futuros.",
            effect: g => {
              g.cash -= 10000;
              g.debt -= 12000;
              g.creditScore += 10;
              return { type: "good", text: "Você reduziu o saldo devedor e melhorou a imagem no mercado." };
            },
          },
        ],
      },
      {
        id: "recovery_nova_linha",
        type: "mix",
        title: "Nova linha de capital de giro",
        desc: "Com a empresa mais organizada, surge uma linha mais barata para financiar o giro.",
        note: "Crédito mais barato pode ser útil, desde que não vire dependência.",
        terms: ["capital_de_giro", "spread_bancario", "garantia"],
        formula: "Linhas melhores ajudam a operar, mas só fazem sentido com disciplina.",
        choices: [
          {
            label: "Usar apenas como reserva",
            detail: "Guarda como proteção.",
            learn: "Crédito preventivo pode evitar custo de emergência.",
            effect: g => {
              g.cash += 14000;
              g.debt += 8000;
              g.debtRate -= 0.002;
              return { type: "good", text: "Você reforçou a reserva sem expandir demais o risco." };
            },
          },
          {
            label: "Usar para crescer vendas",
            detail: "Acelera a expansão.",
            learn: "Capital de giro pode virar combustível de crescimento.",
            effect: g => {
              g.revenueBase += 6500;
              g.cash += 6000;
              g.creditScore -= 2;
              return { type: "neutral", text: "Você transformou o crédito em crescimento, com algum risco adicional." };
            },
          },
        ],
      },
      {
        id: "recovery_pib",
        type: "pos",
        title: "Economia volta a acelerar",
        desc: "A confiança melhora e o PIB volta a crescer. O mercado reage com mais pedidos e menos cautela.",
        note: "Recuperações costumam favorecer quem ficou vivo e organizado.",
        terms: ["pib", "demanda", "margem_liquida"],
        formula: "Crescimento econômico costuma elevar volume e ajudar a diluir custos fixos.",
        choices: [
          {
            label: "Expandir cobertura comercial",
            detail: "Aproveita o embalo do mercado.",
            learn: "Crescimento forte pede disciplina para não desorganizar o caixa.",
            effect: g => {
              g.revenueBase += 7000;
              g.macro.demand += 7;
              g.clientTrust += 5;
              return { type: "good", text: "Você surfou a retomada e vendeu mais sem perder totalmente o controle." };
            },
          },
          {
            label: "Manter conservador e ganhar consistência",
            detail: "Prefere estabilidade.",
            learn: "Nem sempre é preciso correr atrás do pico da expansão.",
            effect: g => {
              g.cash += 6000;
              g.creditScore += 3;
              g.expenseBase -= 1500;
              return { type: "good", text: "Você cresceu com cautela e preservou a estrutura financeira." };
            },
          },
        ],
      },
      {
        id: "recovery_investimento",
        type: "pos",
        title: "Excesso de caixa para investir",
        desc: "Depois de meses de ajuste, sobra caixa. A dúvida é entre rentabilizar ou manter reserva.",
        note: "Quando a operação fica mais saudável, o caixa também precisa trabalhar.",
        terms: ["cdb", "lci", "diversificacao"],
        formula: "Liquidez, risco e retorno precisam ser balanceados.",
        choices: [
          {
            label: "Montar reserva em LCI e CDB",
            detail: "Mistura proteção e retorno.",
            learn: "Diversificação reduz dependência de uma só aposta.",
            effect: g => {
              g.cash -= 20000;
              g.invested += 20000;
              g.investRate = Math.max(g.investRate, 0.0095);
              g.creditScore += 4;
              return { type: "good", text: "Você organizou a reserva e deixou parte do caixa rendendo." };
            },
          },
          {
            label: "Segurar tudo em caixa",
            detail: "Prioriza segurança máxima.",
            learn: "Caixa parado protege, mas pode perder oportunidade.",
            effect: g => {
              g.cash += 2000;
              g.macro.risk -= 1;
              return { type: "neutral", text: "Você privilegiou liquidez total e abriu mão de um pouco de rendimento." };
            },
          },
        ],
      },
    ],
    major: [
      {
        id: "major_reforma",
        type: "major",
        title: "Reforma tributária entra em fase de transição",
        desc: "O sistema começa a mudar e a empresa precisa adaptar cadastro, precificação e relatórios com antecedência.",
        note: "Mudança estrutural costuma exigir custos de organização e tecnologia.",
        terms: ["margem_liquida", "pib", "custo_oportunidade"],
        formula: "Mudanças grandes podem aumentar custo no curto prazo e reduzir risco no longo prazo.",
        choices: [
          {
            label: "Preparar o sistema agora",
            detail: "Paga o custo antes.",
            learn: "Antecipar adaptação pode evitar erro caro depois.",
            effect: g => {
              g.cash -= 7000;
              g.expenseBase -= 1800;
              g.creditScore += 5;
              return { type: "good", text: "Você se preparou cedo e reduziu o risco de um susto futuro." };
            },
          },
          {
            label: "Esperar a regra ficar mais clara",
            detail: "Evita gastar antes da hora.",
            learn: "Nem todo custo antecipado compensa.",
            effect: g => {
              g.macro.risk += 2;
              g.cash += 2000;
              return { type: "neutral", text: "Você adiou a adaptação, poupando caixa no curto prazo." };
            },
          },
        ],
      },
      {
        id: "major_supply_shock",
        type: "major",
        title: "Choque global de supply chain",
        desc: "Portos lentos, fretes voláteis e peças em falta apertam a cadeia de fornecimento.",
        note: "Um choque logístico grande pode multiplicar atrasos e custo ao mesmo tempo.",
        terms: ["cambio", "liquidez", "fluxo_caixa"],
        formula: "Problemas de abastecimento costumam pressionar custo e tempo de entrega.",
        choices: [
          {
            label: "Aumentar estoque de segurança",
            detail: "Evita ruptura, mas prende capital.",
            learn: "Reserva operacional é boa, mas tem custo.",
            effect: g => {
              g.cash -= 10000;
              g.expenseBase += 1200;
              g.clientTrust += 6;
              return { type: "good", text: "Você se protegeu de falta de produto com mais estoque de segurança." };
            },
          },
          {
            label: "Redesenhar fornecedores e rotas",
            detail: "Mais trabalho agora, menos dependência depois.",
            learn: "Diversificar cadeia reduz risco sistêmico.",
            effect: g => {
              g.supplierRep += 5;
              g.expenseBase -= 2200;
              g.macro.risk -= 2;
              return { type: "good", text: "Você aproveitou a crise para reduzir dependência da cadeia antiga." };
            },
          },
        ],
      },
      {
        id: "major_credit_freeze",
        type: "major",
        title: "Mercado entra em modo defensivo",
        desc: "Os investidores ficam mais seletivos, os bancos exigem mais garantias e a liquidez seca de repente.",
        note: "Eventos de liquidez costumam punir quem estava muito alavancado.",
        terms: ["spread_bancario", "garantia", "liquidez"],
        formula: "Liquidez menor significa crédito mais duro e negociação mais longa.",
        choices: [
          {
            label: "Reforçar caixa e esperar a poeira baixar",
            detail: "Postura conservadora.",
            learn: "Sobreviver ao aperto de liquidez é meio caminho andado.",
            effect: g => {
              g.cash += 9000;
              g.debtRate += 0.002;
              g.creditScore += 4;
              return { type: "good", text: "Você preservou capital e diminuiu a vulnerabilidade ao mercado seco." };
            },
          },
          {
            label: "Buscar garantia e negociar rápido",
            detail: "Tenta aproveitar janelas curtas.",
            learn: "Garantia boa acelera negociação.",
            effect: g => {
              g.cash += 6000;
              g.debtRate -= 0.003;
              g.debt += 2000;
              return { type: "neutral", text: "Você fechou uma saída mais rápida, com custo de alavancagem adicional." };
            },
          },
        ],
      },
      {
        id: "major_reposicionamento",
        type: "major",
        title: "Reposicionamento estratégico da marca",
        desc: "A empresa muda foco de mercado e tenta sair da guerra de preço para um nicho mais rentável.",
        note: "Viradas grandes alteram o motor do negócio, não só a propaganda.",
        terms: ["margem_bruta", "margem_liquida", "custo_oportunidade"],
        formula: "Reposicionamento pode reduzir volume no curto prazo e elevar margem no longo prazo.",
        choices: [
          {
            label: "Aumentar proposta de valor",
            detail: "Compensa com serviço e qualidade.",
            learn: "Mudar de posição pode proteger margem.",
            effect: g => {
              g.clientTrust += 12;
              g.revenueBase += 6000;
              g.expenseBase += 1500;
              return { type: "good", text: "Você foi para um nicho melhor e valorizou sua marca." };
            },
          },
          {
            label: "Reduzir portfólio para focar no essencial",
            detail: "Menos variedade, mais eficiência.",
            learn: "Foco pode melhorar processo e rentabilidade.",
            effect: g => {
              g.expenseBase -= 4500;
              g.cash += 3000;
              g.supplierRep += 4;
              return { type: "good", text: "Você simplificou a operação e reduziu ruído operacional." };
            },
          },
        ],
      },
      {
        id: "major_aquisicao",
        type: "major",
        title: "Oferta de aquisição inesperada",
        desc: "Um concorrente maior quer comprar parte da operação. A proposta parece tentadora, mas muda completamente a estratégia.",
        note: "Uma fusão pode acelerar crescimento ou encerrar autonomia cedo demais.",
        terms: ["ativo", "custo_oportunidade", "margem_liquida"],
        formula: "Vender parte do negócio troca autonomia por liquidez imediata.",
        choices: [
          {
            label: "Aceitar a proposta parcial",
            detail: "Entra caixa, sai controle.",
            learn: "Aquisição é decisão de capital e de estratégia.",
            effect: g => {
              g.cash += 35000;
              g.debt -= 8000;
              g.creditScore += 8;
              return { type: "good", text: "Você monetizou parte do valor da empresa sem encerrar o projeto." };
            },
          },
          {
            label: "Recusar e continuar independente",
            detail: "Mantém a trajetória própria.",
            learn: "Nem toda oferta boa combina com seus objetivos.",
            effect: g => {
              g.revenueBase += 4500;
              g.clientTrust += 4;
              g.macro.risk -= 1;
              return { type: "neutral", text: "Você preservou autonomia e continuou apostando na tese da empresa." };
            },
          },
        ],
      },
      {
        id: "major_greve",
        type: "major",
        title: "Greve no setor logístico",
        desc: "Transportadoras e centros de distribuição param parcialmente. A entrega desacelera e o custo de urgência dispara.",
        note: "Quando a logística para, o caixa sente antes mesmo do faturamento cair.",
        terms: ["fluxo_caixa", "liquidez", "ponto_equilibrio"],
        formula: "Greves podem afetar tanto receita quanto custo, dependendo da resposta da empresa.",
        choices: [
          {
            label: "Criar rotas alternativas",
            detail: "Mais caro, mas mantém operação.",
            learn: "Plano B logístico reduz interrupção.",
            effect: g => {
              g.cash -= 6000;
              g.clientTrust += 6;
              g.expenseBase += 1200;
              return { type: "good", text: "Você manteve a entrega funcionando com custo adicional controlado." };
            },
          },
          {
            label: "Parar promoções e priorizar pedidos críticos",
            detail: "Foca no essencial.",
            learn: "Nem toda demanda deve ser tratada igual durante crises.",
            effect: g => {
              g.revenueBase -= 2000;
              g.expenseBase -= 2200;
              g.macro.risk += 1;
              return { type: "neutral", text: "Você enxugou a operação para atravessar a greve com menos dano." };
            },
          },
        ],
      },
    ],
  },
};
