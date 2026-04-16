
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


(function () {
  const g = window.GAME_DATA;
  if (!g || g.__officeExpansionApplied) return;
  g.__officeExpansionApplied = true;

  const push = (pool, events) => {
    if (!g.eventPools[pool]) g.eventPools[pool] = [];
    g.eventPools[pool].push(...events);
  };

  const e = (id, type, title, desc, note, terms, formula, choices) => ({
    id,
    type,
    title,
    desc,
    note,
    terms,
    formula,
    choices,
  });

  const c = (label, detail, learn, effect) => ({
    label,
    detail,
    learn,
    effect,
  });

  push("early", [
    e(
      "early_fornecedor_boleto",
      "mix",
      "Fornecedor oferece desconto",
      "Um fornecedor libera um abatimento bom se você pagar mais cedo e fechar um contrato maior.",
      "No começo, desconto e prazo podem valer mais do que insistir no preço cheio.",
      ["capital_de_giro", "fluxo_caixa", "custo_oportunidade"],
      "Desconto agora pode reduzir gasto futuro, mas trava caixa por um tempo.",
      [
        c(
          "Fechar o acordo",
          "Ganha desconto e previsibilidade.",
          "Negociar bem também é gestão de caixa.",
          (g) => {
            g.cash -= 3500;
            g.expenseBase -= 1800;
            g.supplierRep += 6;
            return { type: "good", text: "Você reduziu custo fixo com uma negociação mais esperta." };
          },
        ),
        c(
          "Recusar e manter liquidez",
          "Protege o caixa neste mês.",
          "Nem todo desconto compensa a perda de fôlego.",
          (g) => {
            g.cash += 1200;
            g.creditScore += 2;
            return { type: "neutral", text: "Você preservou caixa, mas deixou uma economia passar." };
          },
        ),
      ],
    ),
    e(
      "early_sistema_organizado",
      "pos",
      "Rotina interna fica mais clara",
      "Sua equipe começa a padronizar processos simples de operação e cadastro.",
      "Pequenas melhorias de organização costumam aparecer primeiro no custo, depois no lucro.",
      ["processos", "eficiencia_operacional"],
      "Processo melhor costuma reduzir desperdício sem exigir mais vendas.",
      [
        c(
          "Formalizar a rotina",
          "Cria padrão de trabalho.",
          "Organização vira ganho recorrente.",
          (g) => {
            g.expenseBase -= 1200;
            g.clientTrust += 3;
            return { type: "good", text: "A operação ficou mais redonda e mais barata." };
          },
        ),
        c(
          "Deixar como está",
          "Evita mudança imediata.",
          "Nem toda melhoria precisa ser grande para existir.",
          (g) => {
            g.supplierRep += 1;
            return { type: "neutral", text: "Você manteve a estrutura atual sem mexer em custos." };
          },
        ),
      ],
    ),
    e(
      "early_pedido_extra",
      "pos",
      "Pedido extra inesperado",
      "Uma venda fora da curva aparece e melhora o caixa do mês.",
      "Entradas pequenas em fase inicial podem mudar bastante a confiança do negócio.",
      ["liquidez", "demanda"],
      "Receita extra ajuda quando o custo está controlado.",
      [
        c(
          "Atender com prioridade",
          "Monetiza o pedido rápido.",
          "Caixa rápido reduz aperto.",
          (g) => {
            g.cash += 9500;
            g.revenueBase += 1800;
            g.clientTrust += 2;
            return { type: "good", text: "O pedido entrou no caixa e deu fôlego extra." };
          },
        ),
        c(
          "Exigir pagamento antecipado",
          "Reduz risco e melhora a previsibilidade.",
          "Recebimento seguro vale muito no começo.",
          (g) => {
            g.cash += 7000;
            g.creditScore += 3;
            return { type: "good", text: "Você ganhou segurança de recebimento." };
          },
        ),
      ],
    ),
    e(
      "early_marketing_sutil",
      "mix",
      "Ação local de marketing funciona",
      "Uma campanha simples em bairros estratégicos traz retorno acima do esperado.",
      "Gastos pequenos em marketing podem ser úteis quando a base ainda é leve.",
      ["demanda", "custo_oportunidade"],
      "Marketing certo aumenta a receita, mas precisa caber no caixa.",
      [
        c(
          "Repetir a campanha",
          "Amplia o alcance.",
          "Escalar o que funcionou pode valer muito.",
          (g) => {
            g.revenueBase += 3200;
            g.monthlyCosts.marketing += 900;
            g.clientTrust += 4;
            return { type: "good", text: "A campanha virou um canal mais forte de demanda." };
          },
        ),
        c(
          "Encerrar após o teste",
          "Protege margem.",
          "Gasto recorrente precisa ter retorno claro.",
          (g) => {
            g.cash += 1500;
            g.macro.demand += 1;
            return { type: "neutral", text: "Você aproveitou o teste sem transformar isso em custo fixo." };
          },
        ),
      ],
    ),
    e(
      "early_ajuste_custos",
      "neg",
      "Contas pequenas começaram a somar",
      "Vários gastos pequenos entraram ao mesmo tempo e apertaram a operação.",
      "Muitos custos pequenos podem fazer mais estrago do que um gasto grande isolado.",
      ["fluxo_caixa", "gasto_fixos"],
      "Cortar vazamentos agora evita dor depois.",
      [
        c(
          "Revisar contratos",
          "Reduz sangria de caixa.",
          "Gerenciar custo é mais seguro do que correr atrás do prejuízo.",
          (g) => {
            g.expenseBase -= 2200;
            g.monthlyCosts.utilities -= 300;
            g.supplierRep -= 1;
            return { type: "good", text: "Você enxugou pequenas saídas que estavam consumindo a margem." };
          },
        ),
        c(
          "Deixar para o próximo mês",
          "Adia o problema.",
          "Ignorar custo costuma cobrar juros invisíveis.",
          (g) => {
            g.creditScore -= 3;
            g.monthlyCosts.training += 200;
            return { type: "bad", text: "Os custos continuam ali e o aperto ficou maior." };
          },
        ),
      ],
    ),
  ]);

  push("growth", [
    e(
      "growth_novo_endereco",
      "major",
      "Mudança para endereço melhor",
      "Surge a chance de mudar para um escritório mais forte e com imagem melhor.",
      "Quando a empresa cresce, a sede passa a influenciar percepção e patrimonialização.",
      ["ativo", "patrimonio", "custo_oportunidade"],
      "Imóvel melhor pode elevar patrimônio e fortalecer a marca, mas custa mais.",
      [
        c(
          "Usar o momento para migrar",
          "Melhora a presença da empresa.",
          "Patrimônio e imagem podem crescer juntos.",
          (g) => {
            g.cash -= 12000;
            g.revenueBase += 4200;
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 6000;
            g.clientTrust += 6;
            return { type: "good", text: "Você subiu o nível da empresa sem perder o ritmo comercial." };
          },
        ),
        c(
          "Ficar onde está",
          "Preserva caixa.",
          "Nem toda fase pede expansão de estrutura.",
          (g) => {
            g.cash += 3000;
            g.expenseBase -= 900;
            return { type: "neutral", text: "Você guardou caixa para outras prioridades." };
          },
        ),
      ],
    ),
    e(
      "growth_crm",
      "pos",
      "Novo CRM melhora o follow-up",
      "A empresa passa a registrar contatos e histórico de clientes com mais consistência.",
      "Processos de relacionamento podem aumentar conversão sem elevar tanto o gasto.",
      ["relacionamento", "processos"],
      "Relacionamento melhor reduz perdas na venda.",
      [
        c(
          "Adotar a ferramenta",
          "Aumenta organização comercial.",
          "Pequena tecnologia pode render por meses.",
          (g) => {
            g.revenueBase += 2500;
            g.monthlyCosts.software += 650;
            g.clientTrust += 5;
            return { type: "good", text: "A equipe vendeu melhor e com mais controle." };
          },
        ),
        c(
          "Aguardar mais um trimestre",
          "Evita custo novo.",
          "Timing também é decisão.",
          (g) => {
            g.creditScore += 1;
            return { type: "neutral", text: "Você segurou a decisão e manteve o orçamento estável." };
          },
        ),
      ],
    ),
    e(
      "growth_negociacao_longa",
      "mix",
      "Cliente pede prazo maior",
      "Um comprador quer alongar prazo de pagamento para fechar um lote maior.",
      "Prazo pode aumentar volume, mas afeta o fôlego do caixa.",
      ["inadimplencia", "capital_de_giro"],
      "Volume e prazo caminham juntos quando o crédito precisa ser bem administrado.",
      [
        c(
          "Aceitar com limite",
          "Mantém chance de crescer.",
          "Risco controlado vale mais do que volume cego.",
          (g) => {
            g.cash += 6000;
            g.revenueBase += 3000;
            g.creditScore += 2;
            return { type: "good", text: "Você cresceu sem exagerar no risco comercial." };
          },
        ),
        c(
          "Recusar o prazo",
          "Protege a liquidez.",
          "Nem todo pedido vale o custo financeiro.",
          (g) => {
            g.clientTrust -= 1;
            g.cash += 2000;
            return { type: "neutral", text: "Você manteve o caixa mais protegido." };
          },
        ),
      ],
    ),
    e(
      "growth_equipe_estreita",
      "pos",
      "Equipe melhora produtividade",
      "As pessoas começam a entregar mais com a mesma estrutura.",
      "Produtividade pode transformar estrutura fixa em receita adicional.",
      ["eficiencia_operacional", "produtividade"],
      "Produzir mais com o mesmo custo aumenta margem.",
      [
        c(
          "Reforçar treinamentos",
          "Consolida o ganho.",
          "Capacitação costuma voltar em eficiência.",
          (g) => {
            g.expenseBase -= 1500;
            g.monthlyCosts.training += 600;
            g.supplierRep += 2;
            return { type: "good", text: "A operação ficou mais eficiente e preparada." };
          },
        ),
        c(
          "Apenas registrar o avanço",
          "Sem novos gastos.",
          "Nem toda melhora precisa virar investimento imediato.",
          (g) => {
            g.revenueBase += 1500;
            return { type: "good", text: "O ganho de produtividade entrou sem custo extra." };
          },
        ),
      ],
    ),
    e(
      "growth_aluguel_operacional",
      "neg",
      "Aluguel operacional sobe",
      "Cadeiras, internet, energia e serviços relacionados ao escritório ficaram mais caros.",
      "Custos estruturais sobem silenciosamente se não houver revisão.",
      ["gasto_fixos", "inflação"],
      "Quando a inflação aperta, custos recorrentes aparecem primeiro.",
      [
        c(
          "Trocar alguns contratos",
          "Reduz parte do impacto.",
          "Renegociar não é fraqueza, é proteção.",
          (g) => {
            g.monthlyCosts.utilities -= 500;
            g.monthlyCosts.software -= 200;
            g.expenseBase -= 1000;
            return { type: "good", text: "Você amortecou a subida dos custos fixos." };
          },
        ),
        c(
          "Aceitar o aumento",
          "Evita atrito agora.",
          "Sem revisão, custo cresce sozinho.",
          (g) => {
            g.monthlyCosts.utilities += 600;
            g.creditScore -= 2;
            return { type: "bad", text: "Os custos subiram e a margem sentiu o impacto." };
          },
        ),
      ],
    ),
    e(
      "growth_estoque_mais_rapido",
      "mix",
      "Estoque gira mais rápido",
      "A operação compra e vende com mais agilidade do que antes.",
      "Giro rápido melhora liquidez e ajuda a financiar crescimento.",
      ["liquidez", "capital_de_giro"],
      "Estoque que gira rápido libera caixa e reduz risco de parada.",
      [
        c(
          "Aumentar reposição",
          "Aproveita a velocidade.",
          "Girar bem é melhor do que acumular.",
          (g) => {
            g.revenueBase += 3800;
            g.cash -= 2500;
            g.clientTrust += 3;
            return { type: "good", text: "A velocidade de giro melhorou as vendas." };
          },
        ),
        c(
          "Manter o ritmo atual",
          "Evita pressão extra.",
          "Crescimento também precisa de controle.",
          (g) => {
            g.cash += 1800;
            g.expenseBase -= 700;
            return { type: "neutral", text: "Você preservou folga financeira para o próximo passo." };
          },
        ),
      ],
    ),
  ]);

  push("pressure", [
    e(
      "pressure_impostos",
      "major",
      "Pressão tributária aumenta",
      "Uma mudança fiscal eleva os custos de operação e reduz margem no curto prazo.",
      "Em fase de pressão, imposto e estrutura apertam ao mesmo tempo.",
      ["tributos", "margem", "custo_fixo"],
      "Mais imposto significa menos caixa livre se o preço não subir junto.",
      [
        c(
          "Repassar parte ao preço",
          "Defende margem.",
          "Preço e tributo precisam conversar.",
          (g) => {
            g.revenueBase += 2200;
            g.expenseBase += 1200;
            g.clientTrust -= 1;
            return { type: "good", text: "Você protegeu parte da margem sem perder o cliente totalmente." };
          },
        ),
        c(
          "Segurar preço para não perder demanda",
          "Mantém competitividade.",
          "Nem sempre a resposta é repassar tudo.",
          (g) => {
            g.clientTrust += 2;
            g.cash -= 3500;
            return { type: "neutral", text: "Você sustentou demanda, mas absorveu mais custo." };
          },
        ),
      ],
    ),
    e(
      "pressure_frete",
      "neg",
      "Frete ficou mais caro",
      "A logística ficou mais pesada e o custo de entrega subiu de forma sensível.",
      "Logística ruim corrói margem mesmo quando o comercial vai bem.",
      ["logistica", "gasto_fixos"],
      "Frete é custo que aparece rápido no resultado.",
      [
        c(
          "Otimizar rotas",
          "Reduz parte do impacto.",
          "Eficiência logística sempre ajuda.",
          (g) => {
            g.monthlyCosts.logistics -= 900;
            g.expenseBase -= 1200;
            return { type: "good", text: "Você redesenhou a logística e reduziu o estrago." };
          },
        ),
        c(
          "Absorver por enquanto",
          "Evita mudanças internas.",
          "Adiar ajuste custa caro.",
          (g) => {
            g.cash -= 2500;
            g.creditScore -= 2;
            return { type: "bad", text: "O aumento de frete bateu direto na operação." };
          },
        ),
      ],
    ),
    e(
      "pressure_reuniao_locacao",
      "mix",
      "Imóvel alugado pede revisão",
      "O proprietário do imóvel quer rever o contrato antes do prazo padrão.",
      "Aluguel em alta costuma pressionar caixa, mas também pode ser trocado por um espaço melhor ou mais barato.",
      ["patrimonio", "aluguel", "inflação"],
      "Ao lidar com aluguel, é preciso olhar o valor do imóvel e o custo recorrente ao mesmo tempo.",
      [
        c(
          "Negociar permanência",
          "Ganha estabilidade.",
          "Estabilidade de contrato vale muito em cenário instável.",
          (g) => {
            g.cash -= 1800;
            g.clientTrust += 2;
            return { type: "neutral", text: "Você manteve o espaço sem perder tanta previsibilidade." };
          },
        ),
        c(
          "Procurar espaço melhor",
          "Pode reduzir custo depois.",
          "Mudar sede às vezes melhora o jogo todo.",
          (g) => {
            g.expenseBase -= 900;
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 1800;
            return { type: "good", text: "Você começou a reposicionar a empresa para um espaço mais inteligente." };
          },
        ),
      ],
    ),
    e(
      "pressure_estoque_parado",
      "neg",
      "Estoque começou a ficar parado",
      "O capital está preso em produtos que não giram mais na velocidade desejada.",
      "Quando o estoque para, a empresa sente falta de caixa antes de sentir falta de lucro.",
      ["liquidez", "custo_oportunidade"],
      "Estoque parado reduz retorno do capital.",
      [
        c(
          "Liquidação parcial",
          "Converte parte do estoque em caixa.",
          "Caixa vivo vale mais do que estoque morto.",
          (g) => {
            g.cash += 7000;
            g.revenueBase -= 1200;
            g.expenseBase -= 700;
            return { type: "good", text: "Você destravou parte do capital parado." };
          },
        ),
        c(
          "Segurar preço",
          "Tenta preservar margem.",
          "Preço alto demais pode impedir giro.",
          (g) => {
            g.clientTrust -= 2;
            g.macro.demand -= 2;
            return { type: "bad", text: "O estoque continuou parado por mais tempo." };
          },
        ),
      ],
    ),
    e(
      "pressure_credito_caro",
      "mix",
      "Crédito bancário encarece",
      "As linhas de crédito chegam com taxas piores e exigências mais duras.",
      "Em aperto financeiro, o custo do dinheiro importa tanto quanto a receita.",
      ["selic", "spread_bancario"],
      "Juro alto pune empresas que dependem demais de capital de terceiros.",
      [
        c(
          "Reduzir dependência do banco",
          "Protege o caixa futuro.",
          "Menos dívida costuma significar menos pressão.",
          (g) => {
            g.debt = Math.max(0, g.debt - 6000);
            g.creditScore += 4;
            return { type: "good", text: "Você cortou parte da exposição ao crédito caro." };
          },
        ),
        c(
          "Seguir usando crédito",
          "Compra tempo.",
          "Nem todo empréstimo é ruim, mas ele cobra preço.",
          (g) => {
            g.debt += 8500;
            g.cash += 3000;
            return { type: "neutral", text: "Você comprou fôlego, mas ficou mais exposto a juros." };
          },
        ),
      ],
    ),
    e(
      "pressure_time_interno",
      "pos",
      "Time responde sob pressão",
      "A equipe começa a entregar mais rápido para segurar o resultado.",
      "Pressão pode gerar eficiência, desde que não queime a operação.",
      ["produtividade", "eficiencia_operacional"],
      "Sob pressão, eficiência pode subir por um tempo.",
      [
        c(
          "Reconhecer o esforço",
          "Melhora confiança interna.",
          "Equipe engajada entrega mais.",
          (g) => {
            g.clientTrust += 2;
            g.supplierRep += 2;
            g.expenseBase -= 900;
            return { type: "good", text: "A operação ficou mais enxuta e coordenada." };
          },
        ),
        c(
          "Apertar ainda mais",
          "Força performance no curto prazo.",
          "Pressão excessiva pode custar caro depois.",
          (g) => {
            g.revenueBase += 1800;
            g.monthlyCosts.training -= 300;
            return { type: "neutral", text: "Você ganhou velocidade, mas a operação ficou mais tensa." };
          },
        ),
      ],
    ),
  ]);

  push("shock", [
    e(
      "shock_crise_imobiliaria",
      "major",
      "Crise no mercado imobiliário",
      "Os valores de imóveis e aluguéis ficam mais instáveis por alguns meses.",
      "Quando o mercado imobiliário oscila, patrimônio e custo mensal podem andar em direções opostas.",
      ["patrimonio", "aluguel", "ativo"],
      "Patrimônio imobiliário pode subir ou cair, mas o custo do aluguel ainda pesa todo mês.",
      [
        c(
          "Segurar imóveis bons",
          "Protege patrimônio de longo prazo.",
          "Ativos fortes ajudam em crise.",
          (g) => {
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 9000;
            g.clientTrust += 2;
            return { type: "good", text: "Você protegeu a base patrimonial." };
          },
        ),
        c(
          "Trocar por espaço mais barato",
          "Corta custo imediato.",
          "Liquidez pode ser melhor que status.",
          (g) => {
            g.expenseBase -= 2500;
            g.cash += 5000;
            return { type: "good", text: "Você aliviou o caixa com uma troca mais pragmática." };
          },
        ),
      ],
    ),
    e(
      "shock_falha_sistema",
      "neg",
      "Falha de sistema interno",
      "Um erro operacional derruba parte do fluxo de pedidos e gera retrabalho.",
      "Problema técnico costuma aparecer como custo, não como evento isolado.",
      ["processos", "custos_variaveis"],
      "Falha operacional vira gasto extra e perda de receita.",
      [
        c(
          "Contratar suporte imediato",
          "Recupera o processo mais rápido.",
          "Parar pouco pode custar menos do que continuar errado.",
          (g) => {
            g.cash -= 5000;
            g.expenseBase -= 800;
            g.clientTrust += 1;
            return { type: "good", text: "Você resolveu o problema antes que ele espalhasse mais dano." };
          },
        ),
        c(
          "Corrigir internamente",
          "Evita gastos novos.",
          "Capacidade interna resolve muita coisa.",
          (g) => {
            g.revenueBase -= 1800;
            g.supplierRep += 1;
            return { type: "neutral", text: "A operação caiu um pouco, mas sem custo externo grande." };
          },
        ),
      ],
    ),
    e(
      "shock_demanda_desaba",
      "neg",
      "Demanda desaba na região",
      "O mercado local desacelera e os pedidos ficam mais escassos por alguns meses.",
      "Quando a demanda cai, o problema quase sempre aparece como ociosidade.",
      ["demanda", "fluxo_caixa"],
      "Menos demanda derruba receita se a estrutura ficar pesada demais.",
      [
        c(
          "Reduzir estrutura rapidamente",
          "Defende a margem.",
          "Cortar cedo pode salvar a operação.",
          (g) => {
            g.expenseBase -= 3200;
            g.monthlyCosts.marketing -= 700;
            g.creditScore += 1;
            return { type: "good", text: "Você enxugou a operação para sobreviver à queda." };
          },
        ),
        c(
          "Insistir em vender mais",
          "Busca compensar no volume.",
          "Às vezes a solução é melhorar o funil, não apenas empurrar volume.",
          (g) => {
            g.revenueBase += 1200;
            g.cash -= 2800;
            return { type: "neutral", text: "Você tentou reagir com vendas, mas o mercado não ajudou tanto." };
          },
        ),
      ],
    ),
    e(
      "shock_renegociacao_aluguel",
      "mix",
      "Renegociação difícil de aluguel",
      "O contrato do escritório entra em uma fase mais dura e o custo sobe bastante.",
      "Se o imóvel está caro demais, vale revisar o contrato ou até trocar de ponto.",
      ["aluguel", "gasto_fixos", "patrimonio"],
      "Reajustes fortes costumam afetar caixa antes de afetar imagem.",
      [
        c(
          "Negociar novo contrato",
          "Reduz o aumento.",
          "Renegociar é melhor do que sangrar todo mês.",
          (g) => {
            g.monthlyCosts.utilities -= 400;
            g.cash -= 2200;
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 1200;
            return { type: "good", text: "Você segurou parte do aumento do aluguel." };
          },
        ),
        c(
          "Procurar uma saída",
          "Abre espaço para mudança.",
          "Sair de um contrato ruim às vezes é o melhor negócio.",
          (g) => {
            g.expenseBase -= 1000;
            g.cash += 1800;
            return { type: "neutral", text: "Você começou a escapar do custo mais pesado." };
          },
        ),
      ],
    ),
    e(
      "shock_estoque_obsoleto",
      "neg",
      "Estoque ficou obsoleto",
      "Parte do estoque perdeu valor e precisa ser desovada com desconto.",
      "Obsolescência mexe com caixa, margem e confiança do mercado.",
      ["liquidez", "estoque", "custo_oportunidade"],
      "Quando o estoque envelhece, o preço ideal passa a ser um preço rápido.",
      [
        c(
          "Queimar com desconto",
          "Recupera caixa agora.",
          "Caixa de hoje pode valer mais do que margem amanhã.",
          (g) => {
            g.cash += 11000;
            g.revenueBase -= 2200;
            g.clientTrust += 1;
            return { type: "good", text: "Você recuperou dinheiro preso no estoque obsoleto." };
          },
        ),
        c(
          "Tentar vender pelo preço cheio",
          "Defende margem.",
          "Nem sempre o mercado aceita esperar.",
          (g) => {
            g.macro.demand -= 3;
            g.creditScore -= 2;
            return { type: "bad", text: "A demora aumentou a perda de valor." };
          },
        ),
      ],
    ),
    e(
      "shock_financiamento_pesa",
      "mix",
      "Financiamento pesa no caixa",
      "Obrigações parceladas começaram a pesar mais do que o esperado.",
      "Quando a dívida encurta o fôlego, patrimônio sem caixa vira armadilha.",
      ["patrimonio", "fluxo_caixa", "capital_de_giro"],
      "Patrimônio cresce, mas a liquidez precisa acompanhar.",
      [
        c(
          "Pagar antecipado um pedaço",
          "Reduz o peso futuro.",
          "Menos parcela significa mais liberdade.",
          (g) => {
            g.debt = Math.max(0, g.debt - 7000);
            g.cash -= 2500;
            g.creditScore += 3;
            return { type: "good", text: "Você tirou um pouco do peso financeiro do caminho." };
          },
        ),
        c(
          "Manter o plano",
          "Preserva caixa imediato.",
          "Postergar nem sempre é ruim, mas o custo continua ali.",
          (g) => {
            g.cash += 1800;
            g.creditScore -= 1;
            return { type: "neutral", text: "Você segurou caixa agora, mas manteve a pressão da dívida." };
          },
        ),
      ],
    ),
  ]);

  push("recovery", [
    e(
      "recovery_reposicao",
      "pos",
      "Reposição da demanda",
      "O mercado começa a reagir e os pedidos voltam a crescer.",
      "Recuperação costuma recompensar quem sobreviveu à fase de pressão.",
      ["demanda", "recuperacao"],
      "Quando a demanda volta, as estruturas enxutas colhem mais rápido.",
      [
        c(
          "Retomar marketing",
          "Acelera a retomada.",
          "Recuperação exige visibilidade.",
          (g) => {
            g.revenueBase += 3600;
            g.monthlyCosts.marketing += 500;
            g.clientTrust += 3;
            return { type: "good", text: "Você voltou a ganhar tração comercial." };
          },
        ),
        c(
          "Subir preço com calma",
          "Protege margem.",
          "Recuperação também é hora de corrigir preço.",
          (g) => {
            g.revenueBase += 2200;
            g.cash += 2500;
            return { type: "good", text: "Você melhorou a margem sem espantar o mercado." };
          },
        ),
      ],
    ),
    e(
      "recovery_imovel_valorizado",
      "major",
      "Imóvel valoriza novamente",
      "A sede principal volta a ganhar valor e reforça o patrimônio da companhia.",
      "Ativos bem escolhidos ajudam a atravessar ciclos inteiros.",
      ["patrimonio", "ativo"],
      "Valorização imobiliária melhora o balanço e o score final.",
      [
        c(
          "Reconhecer o ganho",
          "Aumenta o patrimônio.",
          "Ativo valorizado conta no resultado final.",
          (g) => {
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 14000;
            g.creditScore += 6;
            return { type: "good", text: "Seu patrimônio ganhou força de novo." };
          },
        ),
        c(
          "Usar como garantia",
          "Abre crédito.",
          "Ativo forte pode apoiar crescimento.",
          (g) => {
            g.cash += 6000;
            g.debt += 3000;
            return { type: "neutral", text: "Você converteu parte da valorização em flexibilidade financeira." };
          },
        ),
      ],
    ),
    e(
      "recovery_ganho_operacional",
      "pos",
      "Operação mais afinada",
      "A empresa passa a produzir e vender com menos desperdício.",
      "Depois da pressão, eficiência costuma ficar permanente.",
      ["eficiencia_operacional", "margem"],
      "Eficiência reforça margem mesmo sem crescer demais.",
      [
        c(
          "Consolidar processos",
          "Torna o ganho recorrente.",
          "Melhoria que vira rotina vale mais.",
          (g) => {
            g.expenseBase -= 1600;
            g.clientTrust += 2;
            return { type: "good", text: "A empresa ficou mais leve e mais lucrativa." };
          },
        ),
        c(
          "Manter sem mexer",
          "Evita novos custos.",
          "Nem todo ganho precisa virar projeto.",
          (g) => {
            g.cash += 1200;
            return { type: "neutral", text: "Você colheu o ganho sem expandir a estrutura." };
          },
        ),
      ],
    ),
    e(
      "recovery_time_renovacao",
      "mix",
      "Momento de renovar o escritório",
      "Agora existe espaço para trocar um imóvel ruim por algo mais estratégico.",
      "Na recuperação, sede e imagem podem virar vantagem competitiva.",
      ["patrimonio", "aluguel", "custo_oportunidade"],
      "Melhor escritório pode pagar parte do custo com imagem e eficiência.",
      [
        c(
          "Investir em espaço melhor",
          "Aumenta conforto e valor.",
          "Ativo bom ajuda no longo prazo.",
          (g) => {
            g.cash -= 9000;
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 7000;
            g.revenueBase += 2000;
            return { type: "good", text: "Você reforçou a sede e também a imagem do negócio." };
          },
        ),
        c(
          "Permanecer no atual",
          "Guarda caixa para outro uso.",
          "Fazer nada também é uma escolha financeira.",
          (g) => {
            g.cash += 2500;
            g.monthlyCosts.utilities -= 200;
            return { type: "neutral", text: "Você preservou liquidez para oportunidades melhores." };
          },
        ),
      ],
    ),
    e(
      "recovery_reserva",
      "pos",
      "Reserva começa a fazer diferença",
      "A empresa percebe que a reserva acumulada lá atrás evita apertos agora.",
      "Liquidez suficiente dá liberdade para decidir melhor na retomada.",
      ["reserva_emergencia", "liquidez"],
      "Reserva forte melhora o score de sobrevivência.",
      [
        c(
          "Reforçar reserva",
          "Aumenta segurança.",
          "Reserva protege o próximo ciclo.",
          (g) => {
            g.cash -= 5000;
            g.creditScore += 5;
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 2500;
            return { type: "good", text: "Você transformou folga em proteção real." };
          },
        ),
        c(
          "Usar no crescimento",
          "Acelera a retomada.",
          "Caixa existe para ser usado com consciência.",
          (g) => {
            g.revenueBase += 2700;
            g.cash += 2000;
            return { type: "good", text: "Você colocou a reserva para trabalhar no crescimento." };
          },
        ),
      ],
    ),
    e(
      "recovery_cliente_fiel",
      "pos",
      "Cliente antigo volta a comprar",
      "Um cliente recorrente retorna com volume maior do que o esperado.",
      "Base fiel costuma ser mais valiosa que uma venda pontual.",
      ["relacionamento", "demanda"],
      "Cliente fiel aumenta previsibilidade de receita.",
      [
        c(
          "Amarrar contrato",
          "Ganha previsibilidade.",
          "Previsibilidade é uma forma de valor.",
          (g) => {
            g.cash += 8500;
            g.clientTrust += 5;
            g.revenueBase += 1500;
            return { type: "good", text: "A relação comercial ficou mais forte." };
          },
        ),
        c(
          "Manter como pedido avulso",
          "Evita concessões.",
          "Nem todo cliente precisa virar contrato.",
          (g) => {
            g.cash += 5000;
            g.creditScore += 1;
            return { type: "neutral", text: "Você valorizou o volume sem abrir mão de flexibilidade." };
          },
        ),
      ],
    ),
  ]);

  push("major", [
    e(
      "major_juros_controlo",
      "major",
      "Juros começam a aliviar",
      "Depois de um período pesado, a taxa básica dá sinais de alívio.",
      "Juro menor ajuda dívida, investimento e compra de imóveis.",
      ["selic", "credito", "capital_de_giro"],
      "Quando o juro cai, o custo do erro também diminui.",
      [
        c(
          "Reprecificar dívida",
          "Reduz a pressão financeira.",
          "Juro menor melhora fôlego.",
          (g) => {
            g.debtRate = Math.max(0.03, g.debtRate - 0.008);
            g.creditScore += 4;
            return { type: "good", text: "Você aproveitou o alívio para baixar o custo financeiro." };
          },
        ),
        c(
          "Acelerar expansão",
          "Aproveita a janela.",
          "Custo de capital menor pode justificar crescer.",
          (g) => {
            g.revenueBase += 5000;
            g.cash -= 4000;
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 2000;
            return { type: "good", text: "Você usou a janela para crescer de forma mais agressiva." };
          },
        ),
      ],
    ),
    e(
      "major_regra_contratual",
      "major",
      "Nova regra de contrato comercial",
      "O mercado passa a exigir mais clareza nos contratos e mais controle de risco.",
      "Quando a regra muda, empresa organizada sofre menos.",
      ["contratos", "risco", "score_credito"],
      "Mais controle comercial reduz perdas escondidas.",
      [
        c(
          "Ajustar processos e cláusulas",
          "Fortalece governança.",
          "Boa governança melhora reputação.",
          (g) => {
            g.clientTrust += 4;
            g.supplierRep += 4;
            g.expenseBase -= 800;
            return { type: "good", text: "Sua operação ficou mais profissional." };
          },
        ),
        c(
          "Seguir como está",
          "Evita retrabalho.",
          "Às vezes o custo de adaptação aparece depois.",
          (g) => {
            g.creditScore -= 5;
            g.cash += 1200;
            return { type: "neutral", text: "Você evitou mudança imediata, mas assumiu um pouco mais de risco." };
          },
        ),
      ],
    ),
    e(
      "major_valor_marca",
      "pos",
      "Marca da empresa ganha valor",
      "A imagem da companhia melhora no mercado e passa a valer mais para parceiros.",
      "Marca forte também é patrimônio, mesmo quando não aparece no caixa.",
      ["patrimonio", "marca", "ativo"],
      "Marca boa aumenta valor percebido do negócio.",
      [
        c(
          "Investir em reputação",
          "Aumenta valor de longo prazo.",
          "Imagem sólida também é ativo.",
          (g) => {
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 8000;
            g.clientTrust += 6;
            g.revenueBase += 2200;
            return { type: "good", text: "Sua marca passou a valer mais dentro do jogo." };
          },
        ),
        c(
          "Monetizar a visibilidade",
          "Traz caixa imediato.",
          "Valor de marca pode virar receita.",
          (g) => {
            g.cash += 7000;
            g.monthlyCosts.marketing += 400;
            return { type: "good", text: "Você converteu reputação em caixa." };
          },
        ),
      ],
    ),
    e(
      "major_estrutura_financeira",
      "major",
      "Reestruturação financeira",
      "Chegou a hora de reorganizar ativos, dívidas e custos para o próximo ciclo.",
      "Reestruturação é onde patrimônio e liquidez finalmente se encontram.",
      ["patrimonio", "liquidez", "fluxo_caixa"],
      "Uma estrutura financeira melhor faz o score subir de forma consistente.",
      [
        c(
          "Reduzir passivos",
          "Diminui a pressão.",
          "Menos passivo deixa o patrimônio mais sólido.",
          (g) => {
            g.debt = Math.max(0, g.debt - 12000);
            g.debtRate = Math.max(0.028, g.debtRate - 0.006);
            g.creditScore += 8;
            return { type: "good", text: "Sua estrutura financeira ficou mais leve." };
          },
        ),
        c(
          "Aumentar caixa de segurança",
          "Traz folga operacional.",
          "Liquidez pode valer mais do que expansão apressada.",
          (g) => {
            g.cash += 14000;
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 3000;
            return { type: "good", text: "Você reforçou o colchão financeiro da empresa." };
          },
        ),
      ],
    ),
    e(
      "major_oportunidade_imovel",
      "major",
      "Excelente oportunidade imobiliária",
      "Um imóvel alinhado ao seu porte aparece por um valor abaixo do mercado.",
      "Comprar bem um imóvel melhora patrimônio e pode reduzir custo no longo prazo.",
      ["patrimonio", "aluguel", "ativo"],
      "A melhor compra é a que resolve caixa, imagem e patrimônio de uma vez.",
      [
        c(
          "Comprar o imóvel",
          "Aumenta patrimônio já.",
          "Ativo certo pode valer muito no score final.",
          (g) => {
            g.cash -= 22000;
            g.patrimonyBonus = (g.patrimonyBonus || 0) + 18000;
            g.revenueBase += 2500;
            return { type: "good", text: "Você fez uma aquisição imobiliária forte." };
          },
        ),
        c(
          "Desistir e ficar líquido",
          "Mantém flexibilidade.",
          "Nem toda oportunidade cabe no caixa do momento.",
          (g) => {
            g.cash += 3000;
            g.creditScore += 2;
            return { type: "neutral", text: "Você guardou caixa para uma chance ainda melhor." };
          },
        ),
      ],
    ),
  ]);
})();
