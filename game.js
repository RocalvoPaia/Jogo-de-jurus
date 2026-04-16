
const GAME_MONTHS = 60;
const fmt = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR");
const fmtPct = (v) => `${Math.round(v * 10) / 10}%`;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const OFFICE_RENT_BASE_RATE = 0.0165;
const OFFICE_FINANCING_MONTHS = 24;

const OFFICE_CATALOG = [
  {
    id: "starter",
    name: "Sede Compacta",
    kind: "owned",
    baseValue: 32000,
    rentRate: 0.010,
    comfort: 46,
    ambience: 50,
    location: "Média",
    size: "Pequeno",
    employeeLimit: 6,
    monthlyMaintenance: 900,
    annualAppreciation: 0.95,
    description: "Escritório simples, já incorporado ao patrimônio da empresa.",
  },
  {
    id: "central",
    name: "Centro Executivo",
    kind: "flex",
    baseValue: 145000,
    rentRate: 0.0175,
    comfort: 82,
    ambience: 86,
    location: "Excelente",
    size: "Médio",
    employeeLimit: 18,
    monthlyMaintenance: 1850,
    annualAppreciation: 1.15,
    description: "Bem localizado e com boa imagem para clientes e parceiros.",
  },
  {
    id: "galpao",
    name: "Galpão Administrativo",
    kind: "flex",
    baseValue: 108000,
    rentRate: 0.0145,
    comfort: 58,
    ambience: 54,
    location: "Boa",
    size: "Grande",
    employeeLimit: 24,
    monthlyMaintenance: 1650,
    annualAppreciation: 1.05,
    description: "Mais espaço e custo equilibrado, bom para crescer sem ostentar.",
  },
  {
    id: "premium",
    name: "Escritório Premium",
    kind: "flex",
    baseValue: 285000,
    rentRate: 0.0215,
    comfort: 95,
    ambience: 92,
    location: "Excelente",
    size: "Amplo",
    employeeLimit: 40,
    monthlyMaintenance: 3200,
    annualAppreciation: 1.35,
    description: "Imagem forte e conforto alto, porém com custo pesado.",
  },
  {
    id: "bairro_estrategico",
    name: "Bairro Estratégico",
    kind: "flex",
    baseValue: 92000,
    rentRate: 0.0155,
    comfort: 68,
    ambience: 70,
    location: "Boa",
    size: "Médio",
    employeeLimit: 14,
    monthlyMaintenance: 1350,
    annualAppreciation: 1.02,
    description: "Equilíbrio entre preço e presença comercial.",
  },
  {
    id: "polo_economico",
    name: "Polo Econômico",
    kind: "flex",
    baseValue: 65000,
    rentRate: 0.0125,
    comfort: 42,
    ambience: 47,
    location: "Ruim",
    size: "Pequeno",
    employeeLimit: 8,
    monthlyMaintenance: 780,
    annualAppreciation: 0.88,
    description: "Barato para entrar, mas longe dos melhores fluxos de mercado.",
  },
];

const cloneOffice = (office, overrides = {}) => ({
  ...office,
  ...overrides,
  marketValue: overrides.marketValue ?? office.baseValue,
  status: overrides.status ?? "available",
  financedBalance: overrides.financedBalance ?? 0,
  financingMonthsLeft: overrides.financingMonthsLeft ?? 0,
  financingMonthlyPayment: overrides.financingMonthlyPayment ?? 0,
  rentMonthsHeld: overrides.rentMonthsHeld ?? 0,
});

const officeValue = (office) => Math.max(0, Math.round(office.marketValue || office.baseValue || 0));
const officeRent = (office) => Math.max(0, Math.round(officeValue(office) * (office.rentRate || OFFICE_RENT_BASE_RATE)));
const officeMaintenance = (office) => Math.max(0, Math.round(office.monthlyMaintenance || 0));
const officeFinancingPayment = (price) => Math.max(0, Math.round((price / OFFICE_FINANCING_MONTHS) * 1.06));

const officeLabel = (office) => {
  if (!office) return "Sem escritório";
  const status = office.id === "starter" ? "Sede inicial" : office.status === "rented" ? "Alugado" : office.status === "owned" ? "Próprio" : "Disponível";
  return `${office.name} — ${status}`;
};

function calcOfficeExpense(office) {
  if (!office || office.status === "available") return 0;
  let cost = officeMaintenance(office);
  if (office.status === "rented") cost += officeRent(office);
  return cost;
}

function officePatrimonyValue(office) {
  if (!office) return 0;
  if (office.status === "rented" || office.status === "available") return 0;
  return officeValue(office);
}

function recalcPatrimony() {
  const officeAssets = (state.offices || []).reduce((sum, office) => sum + officePatrimonyValue(office), 0);
  const officeLiabilities = (state.offices || []).reduce((sum, office) => sum + Math.max(0, office.financedBalance || 0), 0);
  state.financingLiability = officeLiabilities;
  const bonus = state.patrimonyBonus || 0;
  state.patrimony = Math.max(0, Math.round(state.cash + officeAssets + (state.invested || 0) - state.debt - officeLiabilities + bonus));
  return state.patrimony;
}

function ownedOfficeCount() {
  return (state.offices || []).filter((office) => office.status === "owned" || office.status === "financed").length;
}

function totalOfficeCost() {
  return (state.offices || []).reduce((sum, office) => sum + calcOfficeExpense(office), 0);
}

function totalFinancingCost() {
  return (state.offices || []).reduce((sum, office) => sum + ((office.status === "financed" && office.financingMonthlyPayment) ? office.financingMonthlyPayment : 0), 0);
}

function totalRecurringCost() {
  return Object.values(state.monthlyCosts || {}).reduce((sum, value) => sum + value, 0) + totalOfficeCost() + totalFinancingCost();
}

function totalOfficeValue() {
  return (state.offices || []).reduce((sum, office) => sum + officePatrimonyValue(office), 0);
}

function findOfficeById(id) {
  return (state.offices || []).find((office) => office.id === id);
}

function initOffices() {
  state.offices = [
    cloneOffice(OFFICE_CATALOG[0], {
      status: "owned",
      acquiredBy: "starter",
      marketValue: OFFICE_CATALOG[0].baseValue,
    }),
  ];
  state.offices = state.offices.concat(
    OFFICE_CATALOG.slice(1).map((office) => cloneOffice(office, { status: "available" })),
  );
  state.activeOfficeId = "starter";
  recalcPatrimony();
}

function syncOfficeInflation() {
  const infl = state.macro?.inflation || 0;
  (state.offices || []).forEach((office) => {
    if (office.status === "available") return;
    const appreciation = office.annualAppreciation || 1;
    office.marketValue = Math.round(officeValue(office) * (1 + infl / 100) * (appreciation / 1));
    if (office.status === "rented") {
      office.rentMonthsHeld = (office.rentMonthsHeld || 0) + 1;
    }
  });
}

function canTradeOffice() {
  return ownedOfficeCount() + (state.offices || []).filter((office) => office.status === "rented").length > 1;
}

function openOfficeMenu() {
  const cards = (state.offices || []).map((office) => {
    const rent = officeRent(office);
    const upkeep = officeMaintenance(office);
    const value = officeValue(office);
    const activeMark = state.activeOfficeId === office.id ? `<span class="badge blue">Principal</span>` : "";
    const statusBadge = office.status === "owned"
      ? '<span class="badge green">Próprio</span>'
      : office.status === "rented"
        ? '<span class="badge amber">Alugado</span>'
        : '<span class="badge blue">Disponível</span>';
    const actions = [];
    if (office.id === "starter") {
      actions.push(`<button class="btn small" disabled>Sede inicial</button>`);
    } else if (office.status === "available") {
      actions.push(`<button class="btn small primary" onclick="buyOffice('${office.id}', 'cash')">Comprar à vista</button>`);
      actions.push(`<button class="btn small" onclick="buyOffice('${office.id}', 'financed')">Comprar financiado</button>`);
      actions.push(`<button class="btn small" onclick="rentOffice('${office.id}')">Alugar</button>`);
    } else if (office.status === "rented") {
      actions.push(`<button class="btn small primary" onclick="convertRentedOffice('${office.id}')">Comprar agora</button>`);
      if (canTradeOffice()) actions.push(`<button class="btn small danger" onclick="cancelRentOffice('${office.id}')">Cancelar aluguel</button>`);
    } else if ((office.status === "owned" || office.status === "financed") && office.id !== "starter") {
      actions.push(`<button class="btn small primary" onclick="rentOffice('${office.id}')">Colocar para alugar</button>`);
      if (canTradeOffice()) actions.push(`<button class="btn small danger" onclick="sellOffice('${office.id}')">Vender</button>`);
    }

    return `<div class="term-card">
      <div class="card-title" style="align-items:flex-start">
        <div>
          <h4>${office.name}</h4>
          <div class="tiny">${office.description}</div>
        </div>
        <div style="text-align:right">${statusBadge}${activeMark}</div>
      </div>
      <div class="tiny">Valor atual: <strong>${fmt(value)}</strong></div>
      <div class="tiny">Aluguel mensal: <strong>${fmt(rent)}</strong></div>
      <div class="tiny">Manutenção mensal: <strong>${fmt(upkeep)}</strong></div>
      <div class="tiny">Comodidade: ${office.comfort}/100 • Ambiente: ${office.ambience}/100</div>
      <div class="tiny">Localização: ${office.location} • Tamanho: ${office.size}</div>
      <div class="tiny">Limite de funcionários: ${office.employeeLimit}</div>
      <div class="tiny">Financiamento restante: ${office.financingMonthsLeft ? `${office.financingMonthsLeft} meses` : "sem saldo"}${office.financingMonthlyPayment ? ` • Parcela: ${fmt(office.financingMonthlyPayment)}` : ""}</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px">${actions.join("")}</div>
    </div>`;
  }).join("");

  const html = `<div class="modal-grid cols-2">
    <div class="term-card">
      <h4>Resumo imobiliário</h4>
      <div class="tiny">Patrimônio em imóveis: ${fmt(totalOfficeValue())}</div>
      <div class="tiny">Custo mensal total: ${fmt(totalRecurringCost())}</div>
      <div class="tiny">Escritórios próprios: ${ownedOfficeCount()}</div>
      <div class="tiny">Escritórios alugados: ${(state.offices || []).filter((o) => o.status === "rented").length}</div>
      <div class="tiny" style="margin-top:8px">Os imóveis comprados aumentam o patrimônio; os alugados pesam no caixa todo mês e sobem com a inflação anual.</div>
    </div>
    <div class="term-card">
      <h4>Regras rápidas</h4>
      <div class="tiny">Você pode comprar, alugar, cancelar aluguel ou vender desde que tenha mais de um escritório sob controle.</div>
      <div class="tiny" style="margin-top:8px">O aluguel é calculado com base no valor atual do imóvel e reajustado após cada ciclo anual.</div>
      <div class="tiny" style="margin-top:8px">Comprar financiado adiciona uma obrigação mensal, mas o imóvel entra no patrimônio imediatamente.</div>
    </div>
  </div>
  <div class="modal-grid cols-1" style="margin-top:14px">${cards}</div>`;

  openOverlay(
    "Sistema de escritórios",
    "Compre, alugue, venda ou cancele contratos quando fizer sentido.",
    html,
    `<button class="btn primary" onclick="closeOverlay()">Fechar</button>`,
    true,
  );
}

function buyOffice(id, mode = "cash") {
  const office = findOfficeById(id);
  if (!office || office.status !== "available") return;

  const price = officeValue(office);
  if (mode === "cash") {
    if (state.cash < price) {
      addLog(`Caixa insuficiente para comprar ${office.name} à vista.`, "bad");
      return;
    }
    state.cash -= price;
    office.status = "owned";
    office.acquiredBy = "cash";
    office.financedBalance = 0;
    office.financingMonthsLeft = 0;
    office.financingMonthlyPayment = 0;
    addLog(`Escritório ${office.name} comprado à vista por ${fmt(price)}.`, "good");
  } else {
    const downPayment = Math.round(price * 0.2);
    if (state.cash < downPayment) {
      addLog(`Caixa insuficiente para a entrada de ${office.name}.`, "bad");
      return;
    }
    state.cash -= downPayment;
    office.status = "financed";
    office.acquiredBy = "financed";
    office.financedBalance = price - downPayment;
    office.financingMonthsLeft = OFFICE_FINANCING_MONTHS;
    office.financingMonthlyPayment = officeFinancingPayment(office.financedBalance);
    addLog(`Escritório ${office.name} financiado. Entrada de ${fmt(downPayment)} e saldo parcelado.`, "good");
  }
  state.activeOfficeId = office.id;
  recalcPatrimony();
  updateUI();
  openOfficeMenu();
}

function rentOffice(id) {
  const office = findOfficeById(id);
  if (!office || office.status !== "available") return;
  office.status = "rented";
  office.acquiredBy = "rental";
  office.rentMonthsHeld = 0;
  addLog(`Escritório ${office.name} alugado.`, "good");
  state.activeOfficeId = office.id;
  recalcPatrimony();
  updateUI();
  openOfficeMenu();
}

function cancelRentOffice(id) {
  const office = findOfficeById(id);
  if (!office || office.status !== "rented") return;
  if (!canTradeOffice()) {
    addLog("Você precisa manter pelo menos um escritório em operação.", "bad");
    return;
  }
  office.status = "available";
  office.acquiredBy = null;
  office.rentMonthsHeld = 0;
  addLog(`Aluguel de ${office.name} cancelado.`, "info");
  recalcPatrimony();
  updateUI();
  openOfficeMenu();
}

function sellOffice(id) {
  const office = findOfficeById(id);
  if (!office || !(office.status === "owned" || office.status === "financed") || office.id === "starter") return;
  if (!canTradeOffice()) {
    addLog("Você precisa manter pelo menos um escritório em operação.", "bad");
    return;
  }
  const saleValue = Math.round(officeValue(office) * 0.9);
  state.cash += saleValue;
  office.status = "available";
  office.acquiredBy = null;
  office.financedBalance = 0;
  office.financingMonthsLeft = 0;
  office.financingMonthlyPayment = 0;
  addLog(`Escritório ${office.name} vendido por ${fmt(saleValue)}.`, "good");
  recalcPatrimony();
  updateUI();
  openOfficeMenu();
}

function convertRentedOffice(id) {
  const office = findOfficeById(id);
  if (!office || office.status !== "rented") return;
  const price = officeValue(office);
  if (state.cash < price) {
    addLog(`Caixa insuficiente para comprar ${office.name}.`, "bad");
    return;
  }
  state.cash -= price;
  office.status = "owned";
  office.acquiredBy = "cash";
  office.rentMonthsHeld = 0;
  office.financedBalance = 0;
  office.financingMonthsLeft = 0;
  office.financingMonthlyPayment = 0;
  addLog(`Você comprou ${office.name} e encerrou o aluguel.`, "good");
  recalcPatrimony();
  updateUI();
  openOfficeMenu();
}

const TERMS = (typeof window !== "undefined" && window.TERMS) ? window.TERMS : {};
const getGameData = () =>
  (typeof window !== "undefined" && window.GAME_DATA)
    ? window.GAME_DATA
    : { arcs: [], eventPools: {} };

const state = {
  cash: 180000,
  debt: 45000,
  debtRate: 0.043,
  debtTerms: 12,
  creditScore: 560,
  revenueBase: 76000,
  expenseBase: 72000,
  supplierRep: 62,
  clientTrust: 68,
  invested: 0,
  investRate: 0,
  patrimony: 0,
  patrimonyBonus: 0,
  financingLiability: 0,
  monthlyCosts: {
    payroll: 9000,
    marketing: 5200,
    logistics: 6400,
    software: 1800,
    utilities: 2700,
    training: 1200,
  },
  offices: [],
  activeOfficeId: "starter",
  month: 0,
  gameOver: false,
  schedule: {},
  learnedTerms: new Map(),
  recentLogs: [],
  cashHistory: [180000],
  profitHistory: [0],
  revenueHistory: [0],
  expenseHistory: [0],
  currentEvent: null,
  seed: Math.floor(Math.random() * 999999),
  cumulativeProfit: 0,
  cumulativeRevenue: 0,
  cumulativeExpenses: 0,
  macro: {
    selic: 10.5,
    inflation: 4.8,
    fx: 5.1,
    demand: 64,
    risk: 22,
    taxPressure: 18,
    confidence: 70,
  },
};

const el = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const screen = el(id);
  if (screen) screen.classList.add("active");
}

function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function arcIndex(month) {
  if (month <= 12) return 0;
  if (month <= 24) return 1;
  if (month <= 36) return 2;
  if (month <= 48) return 3;
  return 4;
}

function phaseKey(month) {
  if (month <= 12) return "early";
  if (month <= 24) return "growth";
  if (month <= 36) return "pressure";
  if (month <= 48) return "shock";
  return "recovery";
}

function termsCount() {
  return Object.keys(TERMS).length;
}

function refreshGlossaryCount() {
  const node = el("glossary-count");
  if (node) node.textContent = `${state.learnedTerms.size}/${termsCount()}`;
}

function openOverlay(title, subtitle, bodyHtml, footerHtml, large = false) {
  const titleEl = el("overlay-title");
  const subtitleEl = el("overlay-subtitle");
  const bodyEl = el("overlay-body");
  const footerEl = el("overlay-footer");
  const panelEl = el("overlay-panel");
  const overlayEl = el("overlay");

  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle || "";
  if (bodyEl) bodyEl.innerHTML = bodyHtml;
  if (footerEl) footerEl.innerHTML = footerHtml || "";
  if (panelEl) panelEl.classList.toggle("large", !!large);
  if (overlayEl) overlayEl.classList.remove("hidden");
}

function closeOverlay() {
  const overlayEl = el("overlay");
  if (overlayEl) overlayEl.classList.add("hidden");
}

function termCard(termKey, unlocked = true, extra = "") {
  const t = TERMS[termKey];
  if (!t) {
    return `<div class="term-card locked"><h4>Termo indisponível</h4><div class="tiny">Esse termo não foi encontrado.</div></div>`;
  }
  return `<div class="term-card ${unlocked ? "" : "locked"}">
    <h4>${t.title}</h4>
    <div class="tiny">${t.short}</div>
    <div class="tiny" style="margin-top:8px">${t.explanation}</div>
    <div class="tiny" style="margin-top:8px"><strong>Exemplo simples:</strong> ${t.analogy}</div>
    ${extra ? `<div class="see">${extra}</div>` : ""}
  </div>`;
}

function openGlossary() {
  const terms = Object.entries(TERMS).map(([key, t]) => ({
    key,
    unlocked: state.learnedTerms.has(key),
    title: t.title,
  }));

  const html = `<p>Os termos abaixo vão ficando disponíveis conforme aparecem na partida. Clique em qualquer um já desbloqueado para revisar.</p>
  <div class="modal-grid cols-2">${terms
    .map((x) =>
      termCard(
        x.key,
        x.unlocked,
        x.unlocked ? `Desbloqueado no mês ${state.learnedTerms.get(x.key)}` : "Ainda não apareceu nesta partida",
      ),
    )
    .join("")}</div>`;

  openOverlay(
    "Glossário progressivo",
    "Tudo o que você já viu, explicado de forma direta.",
    html,
    `<button class="btn" onclick="closeOverlay()">Fechar</button>`,
    true,
  );
}

function openQuickMenu() {
  const html = `<div class="modal-grid cols-2">
    <div class="term-card">
      <h4>Visão imediata</h4>
      <div class="tiny">Caixa: ${fmt(state.cash)}</div>
      <div class="tiny">Patrimônio: ${fmt(state.patrimony)}</div>
      <div class="tiny">Dívida: ${fmt(state.debt)}</div>
      <div class="tiny">Score: ${Math.round(state.creditScore)}</div>
      <div class="tiny">Mês atual: ${state.month} / ${GAME_MONTHS}</div>
    </div>
    <div class="term-card">
      <h4>Resumo do mês</h4>
      <div class="tiny">Lucro acumulado: ${fmt(state.cumulativeProfit)}</div>
      <div class="tiny">Custos mensais: ${fmt(totalRecurringCost())}</div>
      <div class="tiny">Último evento: ${state.currentEvent ? state.currentEvent.title : "Sem evento ativo"}</div>
      <div class="tiny" style="margin-top:8px">O resultado mensal depende da combinação entre macroeconomia, custos, imóveis, decisões e sorte.</div>
    </div>
  </div>`;

  openOverlay(
    "Resumo rápido",
    "Tudo que você precisa saber de imediato.",
    html,
    `<button class="btn primary" onclick="closeOverlay()">Fechar</button>`,
    true,
  );
}

function openMacroMenu() {
  const macro = state.macro;
  const mood = macro.risk >= 60 ? "mercado nervoso" : macro.risk >= 35 ? "mercado cauteloso" : "mercado estável";
  const html = `<div class="modal-grid cols-2">
    <div class="term-card">
      <h4>Indicadores atuais</h4>
      <div class="tiny">Selic: ${macro.selic.toFixed(2)}%</div>
      <div class="tiny">Inflação: ${macro.inflation.toFixed(2)}%</div>
      <div class="tiny">Câmbio: R$ ${macro.fx.toFixed(2)}</div>
      <div class="tiny">Demanda: ${Math.round(macro.demand)}</div>
      <div class="tiny">Risco sistêmico: ${Math.round(macro.risk)}</div>
      <div class="tiny">Pressão tributária: ${Math.round(macro.taxPressure)}</div>
      <div class="tiny">Confiança: ${Math.round(macro.confidence)}</div>
    </div>
    <div class="term-card">
      <h4>Leitura do cenário</h4>
      <div class="tiny">${mood}.</div>
      <div class="tiny" style="margin-top:8px">Quando Selic e risco sobem juntos, a dívida pesa mais e o caixa precisa trabalhar melhor.</div>
      <div class="tiny" style="margin-top:8px">Quando demanda e confiança sobem, o volume de vendas compensa parte da pressão de custo.</div>
    </div>
  </div>`;

  openOverlay(
    "Panorama macroeconômico",
    "O que está puxando o mercado neste momento.",
    html,
    `<button class="btn primary" onclick="closeOverlay()">Fechar</button>`,
    true,
  );
}

function profitStats() {
  const profitArr = state.profitHistory.slice(1);
  const totalProfit = state.cumulativeProfit;
  const avgProfit = profitArr.length ? totalProfit / profitArr.length : 0;
  const best = profitArr.length ? Math.max(...profitArr) : 0;
  const worst = profitArr.length ? Math.min(...profitArr) : 0;
  const margin = state.cumulativeRevenue > 0 ? (totalProfit / state.cumulativeRevenue) * 100 : 0;
  const netMargin = state.cumulativeRevenue > 0 ? ((state.cumulativeRevenue - state.cumulativeExpenses) / state.cumulativeRevenue) * 100 : 0;
  return { totalProfit, avgProfit, best, worst, margin, netMargin };
}

function renderMiniBars(nodeId, values) {
  const node = el(nodeId);
  if (!node) return;
  const maxAbs = Math.max(1, ...values.map((v) => Math.abs(v)));
  node.innerHTML = values
    .map((v) => {
      const height = Math.max(8, Math.round((Math.abs(v) / maxAbs) * 72));
      const cls = v < 0 ? "bar-item negative" : "bar-item";
      return `<div class="${cls}" style="height:${height}px"></div>`;
    })
    .join("");
}

function openProfitMenu() {
  const s = profitStats();
  const html = `<div class="modal-grid cols-2">
    <div class="term-card">
      <h4>Resumo de lucro</h4>
      <div class="tiny">Lucro líquido acumulado: ${fmt(s.totalProfit)}</div>
      <div class="tiny">Lucro médio por mês: ${fmt(s.avgProfit)}</div>
      <div class="tiny">Melhor mês: ${fmt(s.best)}</div>
      <div class="tiny">Pior mês: ${fmt(s.worst)}</div>
      <div class="tiny">Margem líquida acumulada: ${s.netMargin.toFixed(1)}%</div>
    </div>
    <div class="term-card">
      <h4>Leitura rápida</h4>
      <div class="tiny">${s.totalProfit >= 0 ? "A empresa gerou resultado no período." : "A operação consumiu caixa no período."}</div>
      <div class="tiny" style="margin-top:8px">Olhe também a combinação entre lucro, dívida e confiança do mercado. Um lucro bom com dívida excessiva ainda pode esconder risco.</div>
    </div>
  </div>
  <div class="term-card" style="margin-top:14px">
    <h4>Histórico visual</h4>
    <div id="profit-popup-chart" class="mini-chart small"></div>
  </div>`;

  openOverlay(
    "Estatísticas de lucro",
    "Um retrato de performance ao longo da campanha.",
    html,
    `<button class="btn primary" onclick="closeOverlay()">Fechar</button>`,
    true,
  );

  setTimeout(() => renderMiniBars("profit-popup-chart", state.profitHistory.slice(-18)), 0);
}

function openHealthMenu() {
  const html = `<div class="modal-grid cols-2">
    <div class="term-card">
      <h4>Saúde da empresa</h4>
      <div class="tiny">Fornecedor: ${Math.round(state.supplierRep)}%</div>
      <div class="tiny">Clientes: ${Math.round(state.clientTrust)}%</div>
      <div class="tiny">Score de crédito: ${Math.round(state.creditScore)}</div>
      <div class="tiny">Crédito de mercado: ${clamp(state.creditScore - 300, 0, 100)}%</div>
    </div>
    <div class="term-card">
      <h4>Interpretação</h4>
      <div class="tiny">Valores acima de 70% indicam folga operacional.</div>
      <div class="tiny" style="margin-top:8px">Se caixa, crédito e confiança caem ao mesmo tempo, a empresa fica vulnerável a qualquer choque.</div>
    </div>
  </div>`;

  openOverlay(
    "Saúde avançada",
    "Detalhes operacionais e de crédito.",
    html,
    `<button class="btn primary" onclick="closeOverlay()">Fechar</button>`,
    true,
  );
}

function openHistoryMenu() {
  const history = state.recentLogs
    .slice(0, 10)
    .map((x) => `<div class="log-item ${x.kind}">${x.text}</div>`)
    .join("");

  const cashArr = state.cashHistory.slice(-18);
  const profitArr = state.profitHistory.slice(-18);

  const html =
    `<div class="modal-grid cols-2">
      <div class="term-card">
        <h4>Últimos movimentos</h4>
        <div class="log" style="max-height:220px">${history || '<div class="log-item info">Sem histórico disponível.</div>'}</div>
      </div>
      <div class="term-card">
        <h4>Fluxo de caixa</h4>
        <div id="cash-popup-chart" class="mini-chart small"></div>
        <div class="tiny" style="margin-top:8px">As barras mostram como o caixa evoluiu ao longo dos meses recentes.</div>
      </div>
    </div>
    <div class="term-card" style="margin-top:14px">
      <h4>Lucro mensal recente</h4>
      <div id="profit-history-chart" class="mini-chart small"></div>
    </div>`;

  openOverlay(
    "Histórico completo",
    "Dados de caixa, lucro e decisões recentes.",
    html,
    `<button class="btn primary" onclick="closeOverlay()">Fechar</button>`,
    true,
  );

  setTimeout(() => {
    renderMiniBars("cash-popup-chart", cashArr);
    renderMiniBars("profit-history-chart", profitArr);
  }, 0);
}

function showTermUnlock(newTerms, sourceTitle) {
  if (!newTerms.length) return;

  const html = `<p>Novos termos foram desbloqueados agora. Eles também ficam salvos no glossário para revisão rápida.</p>
  <div class="modal-grid">${newTerms.map((k) => termCard(k, true, `Apareceu em: ${sourceTitle}`)).join("")}</div>`;

  openOverlay(
    "Novo termo desbloqueado",
    "Uma explicação curta para continuar sem travar o ritmo.",
    html,
    `<button class="btn primary" onclick="closeOverlay()">Entendi</button>`,
    true,
  );
}

function unlockTerms(keys, sourceTitle) {
  const newTerms = [];
  (keys || []).forEach((k) => {
    if (!state.learnedTerms.has(k)) {
      state.learnedTerms.set(k, state.month);
      newTerms.push(k);
    }
  });

  refreshGlossaryCount();
  if (newTerms.length) {
    setTimeout(() => showTermUnlock(newTerms, sourceTitle), 300);
  }
}

function addLog(text, kind = "info") {
  state.recentLogs.unshift({ text, kind });
  state.recentLogs = state.recentLogs.slice(0, 24);

  const logEl = el("log");
  if (logEl) {
    logEl.innerHTML = state.recentLogs
      .map((x) => `<div class="log-item ${x.kind}">${x.text}</div>`)
      .join("");
  }
}

function renderProgress() {
  const box = el("progress");
  if (!box) return;

  box.innerHTML = "";
  for (let i = 1; i <= GAME_MONTHS; i++) {
    const d = document.createElement("div");
    d.className = "dot";
    if (i < state.month) d.classList.add("done");
    else if (i === state.month) d.classList.add("current");
    else d.classList.add("locked");
    box.appendChild(d);
  }
}

function renderCashHistory() {
  const box = el("cash-history");
  if (!box) return;

  box.innerHTML = "";
  const arr = state.cashHistory.slice(-18);
  const max = Math.max(...arr, 1);

  arr.forEach((v) => {
    const bar = document.createElement("div");
    const h = Math.max(6, Math.round((v / max) * 68));
    bar.style.height = `${h}px`;
    bar.style.width = "100%";
    bar.style.borderRadius = "8px 8px 0 0";
    bar.style.background = v >= max * 0.5 ? "linear-gradient(180deg,#2db77e,#a7f1c9)" : "linear-gradient(180deg,#e85d5d,#ffb1b1)";
    box.appendChild(bar);
  });
}

function renderProfitChart() {
  renderMiniBars("profit-chart", state.profitHistory.slice(-18));
}

function updateUI() {
  const gameData = getGameData();
  const s = profitStats();

  const cashEl = el("cash");
  if (cashEl) {
    cashEl.textContent = fmt(state.cash);
    cashEl.className = "value " + (state.cash < 25000 ? "neg" : state.cash < 65000 ? "warn" : "pos");
  }

  const debtEl = el("debt");
  if (debtEl) {
    debtEl.textContent = fmt(state.debt);
    debtEl.className = "value " + (state.debt > 100000 ? "neg" : state.debt > 40000 ? "warn" : "pos");
  }

  const scoreEl = el("score");
  if (scoreEl) {
    scoreEl.textContent = Math.round(state.creditScore);
    scoreEl.className = "value " + (state.creditScore < 420 ? "neg" : state.creditScore < 620 ? "warn" : "pos");
  }

  const monthEl = el("month");
  if (monthEl) monthEl.textContent = `${state.month} / ${GAME_MONTHS}`;

  const arc = gameData.arcs?.[arcIndex(state.month)];
  const arcBadge = el("arc-badge");
  if (arcBadge) {
    arcBadge.textContent = arc?.name || "Fim";
    arcBadge.className = `badge ${arc?.tag || "blue"}`;
  }

  const baseRevenue = el("base-revenue");
  if (baseRevenue) baseRevenue.textContent = fmt(state.revenueBase);

  const patrimonyEl = el("patrimony");
  if (patrimonyEl) {
    patrimonyEl.textContent = fmt(state.patrimony);
    patrimonyEl.className = "value " + (state.patrimony < 0 ? "neg" : state.patrimony < 150000 ? "warn" : "pos");
  }

  const monthlyCostsEl = el("monthly-costs");
  if (monthlyCostsEl) {
    monthlyCostsEl.textContent = fmt(totalRecurringCost());
  }

  const officeCountEl = el("office-count");
  if (officeCountEl) {
    const owned = ownedOfficeCount();
    const rented = (state.offices || []).filter((o) => o.status === "rented").length;
    officeCountEl.textContent = `${owned + rented} imóveis (${owned} próprios, ${rented} alugados)`;
  }

  const officeCurrentEl = el("office-current");
  if (officeCurrentEl) {
    const active = findOfficeById(state.activeOfficeId) || (state.offices || [])[0];
    officeCurrentEl.textContent = active ? officeLabel(active) : "Sem escritório";
  }

  const financeLiabilityEl = el("finance-liability");
  if (financeLiabilityEl) financeLiabilityEl.textContent = fmt(state.financingLiability || 0);

  const profitTotal = el("profit-total");
  if (profitTotal) profitTotal.textContent = fmt(s.totalProfit);

  const profitAvg = el("profit-avg");
  if (profitAvg) profitAvg.textContent = fmt(s.avgProfit);

  const profitMargin = el("profit-margin");
  if (profitMargin) profitMargin.textContent = `${s.margin.toFixed(1)}%`;

  const profitBest = el("profit-best");
  if (profitBest) profitBest.textContent = fmt(s.best);

  const costBreakdown = el("cost-breakdown");
  if (costBreakdown) {
    const c = state.monthlyCosts;
    costBreakdown.innerHTML = `
      <div class="tiny">Folha: ${fmt(c.payroll)}</div>
      <div class="tiny">Marketing: ${fmt(c.marketing)}</div>
      <div class="tiny">Logística: ${fmt(c.logistics)}</div>
      <div class="tiny">Software: ${fmt(c.software)}</div>
      <div class="tiny">Utilidades: ${fmt(c.utilities)}</div>
      <div class="tiny">Treinamento: ${fmt(c.training)}</div>
    `;
  }

  const profitWorst = el("profit-worst");
  if (profitWorst) profitWorst.textContent = fmt(s.worst);

  const profitNet = el("profit-net");
  if (profitNet) profitNet.textContent = fmt(s.totalProfit);

  const profitNetMargin = el("profit-net-margin");
  if (profitNetMargin) profitNetMargin.textContent = `${s.netMargin.toFixed(1)}%`;

  const macro = state.macro;
  const selic = el("selic");
  if (selic) selic.textContent = `${macro.selic.toFixed(2)}%`;
  const inflation = el("inflation");
  if (inflation) inflation.textContent = `${macro.inflation.toFixed(2)}%`;
  const fx = el("fx");
  if (fx) fx.textContent = `R$ ${macro.fx.toFixed(2)}`;
  const demand = el("demand");
  if (demand) demand.textContent = Math.round(macro.demand);
  const risk = el("risk");
  if (risk) risk.textContent = Math.round(macro.risk);
  const tax = el("tax");
  if (tax) tax.textContent = Math.round(macro.taxPressure);

  const macroBar = el("macro-bar");
  if (macroBar) macroBar.style.width = `${clamp(macro.risk, 0, 100)}%`;
  const macroNote = el("macro-note");
  if (macroNote) {
    macroNote.textContent = macro.risk >= 60
      ? "O ambiente está tenso; dívidas e custos tendem a pesar mais."
      : macro.risk >= 35
        ? "O mercado está misto; ajuste fino vale mais do que aposta cega."
        : "O ambiente está relativamente calmo; o foco pode ir para eficiência e crescimento.";
  }

  const supplierBar = el("supplier-bar");
  if (supplierBar) supplierBar.style.width = `${clamp(state.supplierRep, 0, 100)}%`;
  const supplierVal = el("supplier-val");
  if (supplierVal) supplierVal.textContent = `${Math.round(state.supplierRep)}%`;

  const clientBar = el("client-bar");
  if (clientBar) clientBar.style.width = `${clamp(state.clientTrust, 0, 100)}%`;
  const clientVal = el("client-val");
  if (clientVal) clientVal.textContent = `${Math.round(state.clientTrust)}%`;

  const creditBar = el("credit-bar");
  if (creditBar) creditBar.style.width = `${clamp(state.creditScore - 300, 0, 100)}%`;
  const creditVal = el("credit-val");
  if (creditVal) creditVal.textContent = Math.round(state.creditScore);

  const cashHistoryLabel = el("cash-history-label");
  if (cashHistoryLabel) cashHistoryLabel.textContent = fmt(state.cashHistory[state.cashHistory.length - 1] || state.cash);

  const advancedData = el("advanced-data");
  if (advancedData) advancedData.classList.remove("hidden");

  const learningCount = el("learning-count");
  if (learningCount) learningCount.textContent = `${state.learnedTerms.size}/${termsCount()}`;

  refreshGlossaryCount();
  renderProgress();
  renderCashHistory();
  renderProfitChart();
}

function pick(arr, rng) {
  if (!Array.isArray(arr) || !arr.length) return null;
  return arr[Math.floor(rng() * arr.length)];
}

function buildSchedule() {
  const gameData = getGameData();
  const rng = seededRand(state.seed);
  const schedule = {};
  const pools = gameData.eventPools || {};

  for (let m = 1; m <= GAME_MONTHS; m++) {
    const phase = phaseKey(m);
    const normalPool = pools[phase] || [];
    const majorPool = pools.major || [];
    const eventChance = phase === "early" ? 0.75 : phase === "growth" ? 0.8 : phase === "pressure" ? 0.86 : phase === "shock" ? 0.9 : 0.84;
    const majorChance = phase === "early" ? 0.1 : phase === "growth" ? 0.2 : phase === "pressure" ? 0.28 : phase === "shock" ? 0.35 : 0.24;

    let event = null;
    if (rng() < eventChance) {
      event = rng() < majorChance && majorPool.length ? pick(majorPool, rng) : pick(normalPool, rng);
      if (!event && majorPool.length) event = pick(majorPool, rng);
    }

    schedule[m] = event || null;
  }

  state.schedule = schedule;
}

function monthlyTick() {
  const rng = seededRand(state.seed + state.month * 97 + 13);
  const macro = state.macro;

  macro.selic = clamp(macro.selic + (rng() - 0.5) * 0.9 + (macro.risk > 55 ? 0.18 : -0.03), 6, 19);
  macro.inflation = clamp(macro.inflation + (rng() - 0.5) * 0.5 + (macro.fx > 6 ? 0.12 : 0), 2, 14);
  macro.fx = clamp(macro.fx + (rng() - 0.5) * 0.26 + (macro.risk > 60 ? 0.12 : 0), 4.2, 7.8);
  macro.demand = clamp(macro.demand + (rng() - 0.5) * 5 + (state.clientTrust - 60) / 30 - (macro.risk - 25) / 90, 20, 120);
  macro.risk = clamp(macro.risk + (rng() - 0.5) * 4 + (state.debt > 120000 ? 1.2 : 0) - (state.cash > 120000 ? 0.4 : 0), 0, 100);
  macro.taxPressure = clamp(macro.taxPressure + (rng() - 0.5) * 1.2 + (macro.inflation > 7 ? 0.2 : 0), 0, 100);
  macro.confidence = clamp(macro.confidence + (rng() - 0.5) * 3 + (macro.demand > 70 ? 0.5 : -0.3) - (macro.risk > 60 ? 0.8 : 0), 0, 100);

  state.debtRate = clamp(0.022 + macro.selic * 0.0024 + (100 - state.creditScore) / 6000, 0.025, 0.12);

  const revenueNoise = 0.9 + rng() * 0.22;
  const expenseNoise = 0.92 + rng() * 0.2;
  const demandFactor = 0.72 + macro.demand / 145 + state.clientTrust / 290 + macro.confidence / 360;
  const expenseFactor = 0.84 + macro.inflation / 18 + macro.taxPressure / 260 + Math.max(0, macro.fx - 5) / 18 + (100 - state.supplierRep) / 300;

  const extraOperatingCosts = Object.values(state.monthlyCosts || {}).reduce((sum, value) => sum + value, 0);
  const officeCosts = totalOfficeCost();
  const monthRevenue = Math.round(state.revenueBase * demandFactor * revenueNoise);
  const monthExpense = Math.round((state.expenseBase + extraOperatingCosts + officeCosts) * expenseFactor * expenseNoise);
  let profit = monthRevenue - monthExpense;
  let extraExpense = 0;

  if (macro.risk > 65 && rng() < 0.35) {
    extraExpense = Math.round(3000 + rng() * 9000);
    profit -= extraExpense;
  }

  state.cash += profit;
  state.cumulativeRevenue += monthRevenue;
  state.cumulativeExpenses += monthExpense + extraExpense;
  state.cumulativeProfit += profit;
  state.revenueHistory.push(monthRevenue);
  state.expenseHistory.push(monthExpense + extraExpense);
  state.profitHistory.push(profit);

  addLog(`Mês ${state.month}: receita ${fmt(monthRevenue)} e lucro operacional ${fmt(profit)}.`, profit >= 0 ? "good" : "bad");
  if (extraExpense) {
    addLog(`Risco extra adicionou ${fmt(extraExpense)} em custos inesperados.`, "bad");
  }

  if (state.debt > 0 && state.debtTerms > 0) {
    const interest = state.debt * state.debtRate;
    const principal = state.debt / Math.max(1, state.debtTerms);
    const due = interest + principal;
    const payment = Math.min(due, Math.max(0, state.cash));
    const paymentTowardsInterest = Math.min(payment, interest);
    const paymentTowardsPrincipal = Math.max(0, payment - paymentTowardsInterest);

    state.cash -= payment;
    state.debt = Math.max(0, state.debt - paymentTowardsPrincipal);
    state.debtTerms = Math.max(0, state.debtTerms - 1);

    addLog(`Mês ${state.month}: parcela paga ${fmt(payment)} (juros: ${fmt(interest)}).`, "bad");

    if (payment < due) {
      const shortfall = due - payment;
      const penalty = Math.round(shortfall * 0.12);
      state.debt += penalty;
      addLog(`Caixa insuficiente para pagar tudo. Multa e juros adicionam ${fmt(penalty)} à dívida.`, "bad");
      state.creditScore = Math.max(0, state.creditScore - 28);
      state.macro.risk = clamp(state.macro.risk + 4, 0, 100);
    }

    if (state.debtTerms === 0 && state.debt > 0) {
      state.debtTerms = 12;
    }
  }

  if (state.invested > 0 && state.investRate > 0) {
    const gain = Math.round(state.invested * state.investRate);
    state.invested += gain;
    state.cash += gain;
    state.cumulativeProfit += gain;
    state.profitHistory[state.profitHistory.length - 1] += gain;
    addLog(`Mês ${state.month}: investimentos renderam ${fmt(gain)}.`, "good");
  }

  (state.offices || []).forEach((office) => {
    if (office.status === "financed" && office.financingMonthsLeft > 0) {
      const payment = Math.min(office.financingMonthlyPayment || 0, Math.max(0, state.cash));
      state.cash -= payment;
      office.financedBalance = Math.max(0, Math.round((office.financedBalance || 0) - payment));
      office.financingMonthsLeft = Math.max(0, office.financingMonthsLeft - 1);
      state.cumulativeExpenses += payment;
      state.expenseHistory[state.expenseHistory.length - 1] += payment;
      state.cumulativeProfit -= payment;
      state.profitHistory[state.profitHistory.length - 1] -= payment;
      addLog(`Mês ${state.month}: parcela do ${office.name} consumiu ${fmt(payment)}.`, "bad");
      if (office.financingMonthsLeft === 0 || office.financedBalance <= 0) {
        office.status = "owned";
        office.financedBalance = 0;
        office.financingMonthlyPayment = 0;
        office.financingMonthsLeft = 0;
        addLog(`O financiamento de ${office.name} foi concluído.`, "good");
      }
    }
  });

  if (state.month % 12 === 0) {
    syncOfficeInflation();
    addLog(`Mês ${state.month}: imóveis tiveram reajuste anual pela inflação.`, "info");
  }

  recalcPatrimony();

  if (state.cash < 0) {
    state.cash = 0;
    state.gameOver = true;
    addLog(`Mês ${state.month}: caixa zerado — empresa não conseguiu sustentar a operação.`, "bad");
  }

  state.cashHistory.push(state.cash);
}

function startGame() {
  state.cash = 180000;
  state.debt = 45000;
  state.debtRate = 0.043;
  state.debtTerms = 12;
  state.creditScore = 560;
  state.revenueBase = 76000;
  state.expenseBase = 72000;
  state.supplierRep = 62;
  state.clientTrust = 68;
  state.invested = 0;
  state.investRate = 0;
  state.month = 0;
  state.gameOver = false;
  state.recentLogs = [];
  state.cashHistory = [180000];
  state.profitHistory = [0];
  state.revenueHistory = [0];
  state.expenseHistory = [0];
  state.schedule = {};
  state.currentEvent = null;
  state.learnedTerms = new Map();
  state.seed = Math.floor(Math.random() * 999999);
  state.cumulativeProfit = 0;
  state.cumulativeRevenue = 0;
  state.cumulativeExpenses = 0;
  state.patrimony = 0;
  state.patrimonyBonus = 0;
  state.financingLiability = 0;
  state.monthlyCosts = {
    payroll: 9000,
    marketing: 5200,
    logistics: 6400,
    software: 1800,
    utilities: 2700,
    training: 1200,
  };
  state.activeOfficeId = "starter";
  state.macro = {
    selic: 10.5,
    inflation: 4.8,
    fx: 5.1,
    demand: 64,
    risk: 22,
    taxPressure: 18,
    confidence: 70,
  };

  initOffices();
  buildSchedule();
  updateUI();
  showScreen("game-screen");
  closeOverlay();
  nextMonth();
}

function renderEvent(ev) {
  if (!ev) return;

  const typeClass = ev.type === "neg" ? "neg" : ev.type === "pos" ? "pos" : ev.type === "major" ? "mix" : "mix";
  const terms = Array.isArray(ev.terms) ? ev.terms : [];
  const choices = Array.isArray(ev.choices) ? ev.choices : [];

  const chips = terms
    .map((k) => {
      const title = TERMS[k]?.title || "Termo";
      return `<button class="term-chip new" onclick="openTerm('${k}')">${title}</button>`;
    })
    .join("");

  const scopeBadge = ev.type === "major" ? '<span class="badge red">Evento grande</span>' : ev.type === "neg" ? '<span class="badge red">Pressão</span>' : ev.type === "pos" ? '<span class="badge green">Oportunidade</span>' : '<span class="badge amber">Misto</span>';

  const eventArea = el("event-area");
  if (eventArea) {
    eventArea.innerHTML =
      `<div class="event ${typeClass}">
        <div class="card-title" style="margin-bottom:10px"><div class="event-title" style="margin-bottom:0">${ev.title || ""}</div>${scopeBadge}</div>
        <div class="event-desc">${ev.desc || ""}</div>
        <div class="event-note">${ev.note || ""}</div>
        <div class="terms-row">${chips}</div>
      </div>`;
  }

  const formula = el("formula");
  if (formula) {
    formula.innerHTML = `<div class="event-note"><strong>Regra do mês:</strong> ${ev.formula || ""}</div>`;
  }

  const choicesEl = el("choices");
  if (choicesEl) {
    choicesEl.innerHTML = choices
      .map(
        (c, idx) =>
          `<button class="choice" onclick="makeChoice(${idx})">
            <strong>${c.label || "Escolha"}</strong>
            <span>${c.detail || ""}</span>
            <small>O que você aprende: ${c.learn || ""}</small>
          </button>`,
      )
      .join("");
  }

  unlockTerms(terms, ev.title || "evento");
}

function showMonthSummary() {
  const eventArea = el("event-area");
  if (eventArea) {
    eventArea.innerHTML =
      `<div class="event pos">
        <div class="event-title">Mês sem evento relevante</div>
        <div class="event-desc">Operação normal. Caixa atual: ${fmt(state.cash)}. Dívida: ${fmt(state.debt)}. Lucro acumulado: ${fmt(state.cumulativeProfit)}.</div>
        <div class="event-note">Bom momento para respirar, analisar os números e avançar sem pressa.</div>
      </div>`;
  }

  const formula = el("formula");
  if (formula) formula.innerHTML = "";

  const choices = el("choices");
  if (choices) choices.innerHTML = "";

  const actionRow = el("action-row");
  if (actionRow) {
    actionRow.innerHTML = `<button class="btn primary" onclick="nextMonth()">Avançar para o próximo mês</button>`;
  }
}

function nextMonth() {
  if (state.gameOver) {
    endGame();
    return;
  }

  state.month += 1;

  if (state.month > GAME_MONTHS) {
    endGame();
    return;
  }

  monthlyTick();
  updateUI();

  const ev = state.schedule[state.month];
  const phaseLabel = el("phase-label");

  if (ev) {
    state.currentEvent = ev;
    if (phaseLabel) phaseLabel.textContent = `Mês ${state.month} — ${ev.type === "major" ? "evento macro" : "evento"}`;
    renderEvent(ev);

    const actionRow = el("action-row");
    if (actionRow) actionRow.innerHTML = "";
  } else {
    state.currentEvent = null;
    if (phaseLabel) phaseLabel.textContent = `Mês ${state.month} — relatório`;
    showMonthSummary();
  }
}

function makeChoice(idx) {
  const ev = state.currentEvent;
  if (!ev) return;

  const choices = Array.isArray(ev.choices) ? ev.choices : [];
  const choice = choices[idx];
  if (!choice) return;

  let result = { type: "info", text: "Sem efeito." };
  if (typeof choice.effect === "function") {
    result = choice.effect(state) || result;
  }

  addLog(
    `Mês ${state.month}: ${choice.label || "Escolha"}.`,
    result.type === "good" ? "good" : result.type === "bad" ? "bad" : "info",
  );

  const formula = el("formula");
  if (formula) formula.innerHTML = "";

  const choicesEl = el("choices");
  if (choicesEl) choicesEl.innerHTML = "";

  const eventArea = el("event-area");
  if (eventArea) {
    eventArea.innerHTML +=
      `<div class="event-note" style="margin-top:12px;background:${result.type === "bad" ? "#fff2f2" : result.type === "good" ? "#eefbf6" : "#fff7ea"};border-color:${result.type === "bad" ? "#ffd6d6" : result.type === "good" ? "#d2efdf" : "#ffe0b0"}">
        <strong>Resultado:</strong> ${result.text || "Sem efeito."}<br>
        <span class="mini-note">Conceito aprendido: ${choice.learn || ""}</span>
      </div>`;
  }

  updateUI();

  if (state.gameOver) {
    const actionRow = el("action-row");
    if (actionRow) actionRow.innerHTML = `<button class="btn primary" onclick="endGame()">Ver resultado final</button>`;
    return;
  }

  const actionRow = el("action-row");
  if (state.cash < 10000) {
    if (actionRow) {
      actionRow.innerHTML =
        `<button class="btn danger" onclick="endGame()">Encerrar com caixa crítico</button> <button class="btn" onclick="nextMonth()">Continuar mesmo assim</button>`;
    }
  } else {
    if (actionRow) {
      actionRow.innerHTML = `<button class="btn primary" onclick="nextMonth()">Avançar para o próximo mês</button>`;
    }
  }
}

function calcScore() {
  const s = profitStats();
  const patrimonyScore = clamp(Math.round((state.patrimony / 750000) * 260), -80, 260);
  const cashScore = clamp(Math.round((state.cash / 260000) * 160), 0, 160);
  const creditScorePart = clamp(Math.round((state.creditScore / 800) * 130), 0, 130);
  const debtPenalty = clamp(Math.round((state.debt / 180000) * 120), 0, 120);
  const trustScore = clamp(Math.round(((state.supplierRep + state.clientTrust) / 200) * 140), 0, 140);
  const profitScore = clamp(Math.round((s.totalProfit / 120000) * 180), -90, 180);
  const marginScore = clamp(Math.round((s.netMargin / 25) * 90), -60, 90);
  const officeScore = clamp(Math.round((ownedOfficeCount() * 25) + ((state.patrimony > 0 ? 1 : 0) * 10)), 0, 110);
  const stabilityScore = clamp(Math.round((state.cumulativeRevenue > 0 ? 40 : 0) + (state.macro.confidence / 100) * 40), 0, 80);
  const score = patrimonyScore + cashScore + creditScorePart + trustScore + profitScore + marginScore + officeScore + stabilityScore - debtPenalty;
  return clamp(score, 0, 1000);
}

function endGame() {
  const score = calcScore();
  let title = "";
  let summary = "";
  let badge = "blue";

  const s = profitStats();

  if (score >= 850) {
    title = "CEO Financeiro";
    summary = "Gestão exemplar. Você dominou juros, preservou caixa, fortaleceu o patrimônio e atravessou o ciclo com lucro consistente.";
    badge = "green";
  } else if (score >= 650) {
    title = "Gestor Experiente";
    summary = "Bom desempenho. A empresa resistiu bem e você tomou decisões sólidas na maior parte do tempo.";
    badge = "blue";
  } else if (score >= 450) {
    title = "Empreendedor em Aprendizado";
    summary = "A empresa sobreviveu, mas com cicatrizes. A próxima rodada pode ser melhor com mais disciplina financeira.";
    badge = "amber";
  } else {
    title = "Recuperação Judicial";
    summary = "Os choques e a dívida venceram a disputa. Vale recomeçar com mais proteção de caixa e menos alavancagem.";
    badge = "red";
  }

  const endTitle = el("end-title");
  const endCash = el("end-cash");
  const endDebt = el("end-debt");
  const endScore = el("end-score");
  const endBadge = el("end-badge");
  const endSummary = el("end-summary");

  if (endTitle) endTitle.textContent = title;
  if (endCash) endCash.textContent = fmt(state.cash);
  if (endDebt) endDebt.textContent = fmt(state.debt);
  if (endScore) endScore.textContent = `${score} pts`;
  if (endBadge) endBadge.innerHTML = `<span class="badge ${badge}">${title}</span>`;
  if (endSummary) {
    endSummary.textContent = `${summary} Lucro acumulado: ${fmt(s.totalProfit)}. Patrimônio final: ${fmt(state.patrimony)}. Melhor mês: ${fmt(s.best)}. Pior mês: ${fmt(s.worst)}.`;
  }

  showScreen("end-screen");
}

function openTerm(key) {
  const t = TERMS[key];
  if (!t) return;

  openOverlay(
    t.title,
    t.short,
    `<div class="term-card">
      <div class="tiny">${t.explanation}</div>
      <div class="tiny" style="margin-top:10px"><strong>Exemplo simples:</strong> ${t.analogy}</div>
    </div>`,
    `<button class="btn" onclick="closeOverlay()">Fechar</button>`,
  );
}

window.startGame = startGame;
window.nextMonth = nextMonth;
window.makeChoice = makeChoice;
window.endGame = endGame;
window.openGlossary = openGlossary;
window.closeOverlay = closeOverlay;
window.openTerm = openTerm;
window.openQuickMenu = openQuickMenu;
window.openMacroMenu = openMacroMenu;
window.openProfitMenu = openProfitMenu;
window.openHealthMenu = openHealthMenu;
window.openHistoryMenu = openHistoryMenu;
window.openOfficeMenu = openOfficeMenu;
window.buyOffice = buyOffice;
window.rentOffice = rentOffice;
window.cancelRentOffice = cancelRentOffice;
window.sellOffice = sellOffice;
window.convertRentedOffice = convertRentedOffice;

window.addEventListener("resize", () => {
  renderProfitChart();
});

document.addEventListener("DOMContentLoaded", () => {
  const glossaryBtn = el("glossary-btn");
  const startBtn = el("start-btn");
  const howBtn = el("how-btn");

  if (glossaryBtn) glossaryBtn.addEventListener("click", openGlossary);
  if (startBtn) startBtn.addEventListener("click", startGame);

  if (howBtn) {
    howBtn.addEventListener("click", () => {
      openOverlay(
        "Como jogar",
        "Uma ajuda rápida para começar sem travar o ritmo.",
        `<div class="modal-grid cols-2">
          <div class="term-card">
            <h4>Objetivo</h4>
            <div class="tiny">Manter a empresa viva por 60 meses, equilibrando caixa, dívida e crescimento.</div>
          </div>
          <div class="term-card">
            <h4>Eventos mais vivos</h4>
            <div class="tiny">O jogo mistura eventos pequenos e choques grandes, como Selic, crise global e mudanças tributárias.</div>
          </div>
          <div class="term-card">
            <h4>Lucro visível</h4>
            <div class="tiny">Você acompanha lucro acumulado, margem, patrimônio e histórico visual mês a mês.</div>
          </div>
          <div class="term-card">
            <h4>Escritórios</h4>
            <div class="tiny">O sistema permite comprar, alugar, vender ou cancelar contratos com impacto direto no caixa.</div>
          </div>
          <div class="term-card">
            <h4>Glossário progressivo</h4>
            <div class="tiny">Termos financeiros aparecem conforme a campanha avança e ficam salvos para revisão.</div>
          </div>
        </div>`,
        `<button class="btn primary" onclick="closeOverlay()">Entendi</button>`,
        true,
      );
    });
  }

  initOffices();
  buildSchedule();
  refreshGlossaryCount();
  updateUI();
});
