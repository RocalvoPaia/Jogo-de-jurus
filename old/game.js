const fmt = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR");
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const TERMS = (typeof window !== "undefined" && window.TERMS) ? window.TERMS : {};
const getGameData = () =>
  (typeof window !== "undefined" && window.GAME_DATA)
    ? window.GAME_DATA
    : { arcs: [], events: [] };

const state = {
  cash: 150000,
  debt: 30000,
  debtRate: 0.032,
  debtTerms: 12,
  creditScore: 600,
  revenue: 80000,
  expenses: 70000,
  supplierRep: 70,
  clientTrust: 80,
  invested: 0,
  investRate: 0,
  knowledge: false,
  month: 0,
  gameOver: false,
  schedule: {},
  learnedTerms: new Map(),
  recentLogs: [],
  cashHistory: [150000],
  currentEvent: null,
  seed: Math.floor(Math.random() * 999999),
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
  if (month <= 6) return 0;
  if (month <= 12) return 1;
  if (month <= 18) return 2;
  return 3;
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
      <div class="tiny">Dívida: ${fmt(state.debt)}</div>
      <div class="tiny">Score: ${Math.round(state.creditScore)}</div>
      <div class="tiny">Mês atual: ${state.month} / 24</div>
    </div>
    <div class="term-card">
      <h4>Resumo do mês</h4>
      <div class="tiny">Seu resultado mensal depende de receita, despesas e decisões estratégicas.</div>
      <div class="tiny" style="margin-top:8px">Último evento: ${state.currentEvent ? state.currentEvent.title : "Sem evento ativo"}</div>
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

function openHealthMenu() {
  const html = `<div class="modal-grid cols-2">
    <div class="term-card">
      <h4>Saúde da empresa</h4>
      <div class="tiny">Fornecedor: ${state.supplierRep}%</div>
      <div class="tiny">Clientes: ${state.clientTrust}%</div>
      <div class="tiny">Crédito de mercado: ${clamp(state.creditScore - 300, 0, 100)}%</div>
    </div>
    <div class="term-card">
      <h4>Interpretação</h4>
      <div class="tiny">Valores acima de 70% indicam folga operacional.</div>
      <div class="tiny" style="margin-top:8px">Acompanhe esses dados antes de tomar decisões de risco.</div>
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
    .slice(0, 8)
    .map((x) => `<div class="log-item ${x.kind}">${x.text}</div>`)
    .join("");

  const arr = state.cashHistory.slice(-12);
  const maxCash = Math.max(1, ...arr);

  const cashBars = arr
    .map(
      (v) =>
        `<div style="width:14px;height:calc(${Math.max(12, Math.round((v / maxCash) * 72))}px);background:linear-gradient(180deg,#4e7cff,#7d6cff);border-radius:8px;margin-right:4px"></div>`,
    )
    .join("");

  const html =
    `<div class="modal-grid cols-2">
      <div class="term-card">
        <h4>Últimos movimentos</h4>
        <div class="tiny">${history || "Sem histórico disponível."}</div>
      </div>
      <div class="term-card">
        <h4>Fluxo de caixa</h4>
        <div class="tiny">
          <div style="display:flex;align-items:flex-end;gap:4px;height:90px;margin-top:12px">${cashBars}</div>
        </div>
      </div>
    </div>`;

  openOverlay(
    "Histórico completo",
    "Dados de caixa e decisões recentes.",
    html,
    `<button class="btn primary" onclick="closeOverlay()">Fechar</button>`,
    true,
  );
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
  if (newTerms.length) showTermUnlock(newTerms, sourceTitle);
}

function addLog(text, kind = "info") {
  state.recentLogs.unshift({ text, kind });
  state.recentLogs = state.recentLogs.slice(0, 18);

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
  for (let i = 1; i <= 24; i++) {
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
    const h = Math.max(6, Math.round((v / max) * 62));
    bar.style.height = `${h}px`;
    bar.style.width = "100%";
    bar.style.borderRadius = "8px 8px 0 0";
    bar.style.background =
      v >= max * 0.5
        ? "linear-gradient(180deg,#2db77e,#a7f1c9)"
        : "linear-gradient(180deg,#e85d5d,#ffb1b1)";
    box.appendChild(bar);
  });
}

function updateUI() {
  const gameData = getGameData();

  const cashEl = el("cash");
  if (cashEl) {
    cashEl.textContent = fmt(state.cash);
    cashEl.className = "value " + (state.cash < 20000 ? "neg" : state.cash < 50000 ? "warn" : "pos");
  }

  const debtEl = el("debt");
  if (debtEl) {
    debtEl.textContent = fmt(state.debt);
    debtEl.className = "value " + (state.debt > 50000 ? "neg" : state.debt > 20000 ? "warn" : "pos");
  }

  const scoreEl = el("score");
  if (scoreEl) {
    scoreEl.textContent = Math.round(state.creditScore);
    scoreEl.className =
      "value " + (state.creditScore < 400 ? "neg" : state.creditScore < 600 ? "warn" : "pos");
  }

  const monthEl = el("month");
  if (monthEl) monthEl.textContent = `${state.month} / 24`;

  const arc = gameData.arcs?.[arcIndex(state.month)];
  const arcBadge = el("arc-badge");
  if (arcBadge) {
    arcBadge.textContent = arc?.name || "Fim";
    arcBadge.className = `badge ${arc?.tag || "blue"}`;
  }

  const supplierBar = el("supplier-bar");
  if (supplierBar) supplierBar.style.width = `${clamp(state.supplierRep, 0, 100)}%`;

  const clientBar = el("client-bar");
  if (clientBar) clientBar.style.width = `${clamp(state.clientTrust, 0, 100)}%`;

  const creditBar = el("credit-bar");
  if (creditBar) creditBar.style.width = `${clamp(state.creditScore - 300, 0, 100)}%`;

  const learningCount = el("learning-count");
  if (learningCount) learningCount.textContent = `${state.learnedTerms.size}/${termsCount()}`;

  refreshGlossaryCount();
  renderProgress();
  renderCashHistory();
}

function buildSchedule() {
  const gameData = getGameData();
  const rng = seededRand(state.seed);
  const schedule = {};
  const arcs = Array.isArray(gameData.arcs) ? gameData.arcs : [];
  const eventGroups = Array.isArray(gameData.events) ? gameData.events : [];

  arcs.forEach((arc, ai) => {
    const evs = [...(eventGroups[ai] || [])];
    const [start, end] = arc.months || [1, 1];
    const months = [];
    for (let m = start; m <= end; m++) months.push(m);

    if (!months.length || !evs.length) return;

    const shuffledMonths = [...months].sort(() => rng() - 0.5);

    evs.forEach((ev, idx) => {
      let m = shuffledMonths[idx % shuffledMonths.length];

      if (schedule[m]) {
        const freeMonth = shuffledMonths.find((mm) => !schedule[mm]);
        if (freeMonth) m = freeMonth;
        else return;
      }

      schedule[m] = ev;
    });
  });

  state.schedule = schedule;
}

function monthlyTick() {
  const monthRevenue = state.revenue * (0.9 + Math.random() * 0.2);
  const profit = monthRevenue - state.expenses;

  state.cash += profit;
  addLog(`Mês ${state.month}: faturamento ${fmt(monthRevenue)} e lucro ${fmt(profit)}.`, "info");

  if (state.debt > 0 && state.debtTerms > 0) {
    const interest = state.debt * state.debtRate;
    const principal = state.debt / state.debtTerms;
    const payment = Math.min(interest + principal, Math.max(0, state.cash));

    state.cash -= payment;
    state.debt = Math.max(0, state.debt - principal);
    state.debtTerms = Math.max(0, state.debtTerms - 1);

    addLog(`Mês ${state.month}: parcela paga ${fmt(payment)} (juros: ${fmt(interest)}).`, "bad");
  }

  if (state.invested > 0 && state.investRate > 0) {
    const gain = state.invested * state.investRate;
    state.invested += gain;
    addLog(`Mês ${state.month}: investimento rendeu ${fmt(gain)}.`, "good");
  }

  state.cashHistory.push(state.cash);
}

function startGame() {
  state.cash = 150000;
  state.debt = 30000;
  state.debtRate = 0.032;
  state.debtTerms = 12;
  state.creditScore = 600;
  state.revenue = 80000;
  state.expenses = 70000;
  state.supplierRep = 70;
  state.clientTrust = 80;
  state.invested = 0;
  state.investRate = 0;
  state.knowledge = false;
  state.month = 0;
  state.gameOver = false;
  state.recentLogs = [];
  state.cashHistory = [150000];
  state.learnedTerms = new Map();
  state.seed = Math.floor(Math.random() * 999999);

  buildSchedule();
  updateUI();
  showScreen("game-screen");
  closeOverlay();
  nextMonth();
}

function renderEvent(ev) {
  if (!ev) return;

  const typeClass = ev.type === "neg" ? "neg" : ev.type === "pos" ? "pos" : "mix";
  const terms = Array.isArray(ev.terms) ? ev.terms : [];
  const choices = Array.isArray(ev.choices) ? ev.choices : [];

  const chips = terms
    .map((k) => {
      const title = TERMS[k]?.title || "Termo";
      return `<button class="term-chip new" onclick="openTerm('${k}')">${title}</button>`;
    })
    .join("");

  const eventArea = el("event-area");
  if (eventArea) {
    eventArea.innerHTML =
      `<div class="event ${typeClass}">
        <div class="event-title">${ev.title || ""}</div>
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
        <div class="event-title">Mês tranquilo</div>
        <div class="event-desc">Operação normal. Caixa atual: ${fmt(state.cash)}. Dívida: ${fmt(state.debt)}.</div>
        <div class="event-note">Bom momento para respirar e avançar sem pressa.</div>
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
  if (state.month >= 24 || state.gameOver) {
    endGame();
    return;
  }

  state.month += 1;
  monthlyTick();
  updateUI();

  const ev = state.schedule[state.month];
  const phaseLabel = el("phase-label");

  if (ev) {
    state.currentEvent = ev;
    if (phaseLabel) phaseLabel.textContent = `Mês ${state.month} — evento`;
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
  if (state.cash < 5000) {
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
  let s = 0;
  s += Math.min(40, Math.round((state.cash / 200000) * 40));
  s += Math.min(25, Math.round((state.creditScore / 800) * 25));
  s += state.debt > 50000 ? 0 : state.debt > 20000 ? 10 : 15;
  s += Math.min(
    20,
    Math.round((state.supplierRep / 100) * 10 + (state.clientTrust / 100) * 10),
  );
  return clamp(s, 0, 100);
}

function endGame() {
  const score = calcScore();
  let title = "";
  let summary = "";
  let badge = "blue";

  if (score >= 85) {
    title = "CEO Financeiro";
    summary = "Gestão exemplar. Você dominou juros compostos, negociou bem e cresceu sem perder o controle do caixa.";
    badge = "green";
  } else if (score >= 65) {
    title = "Gestor Experiente";
    summary = "Bom desempenho. Algumas decisões custaram juros desnecessários, mas a empresa se manteve saudável.";
    badge = "blue";
  } else if (score >= 45) {
    title = "Empreendedor em Aprendizado";
    summary = "A empresa sobreviveu, mas com cicatrizes. Você já entendeu que tempo também custa dinheiro.";
    badge = "amber";
  } else {
    title = "Recuperação Judicial";
    summary = "Os juros compostos venceram a disputa. Vale recomeçar com decisões mais cautelosas.";
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
  if (endSummary) endSummary.textContent = summary;

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
        "Uma ajuda rápida para quem quer começar sem ler muita coisa.",
        `<div class="modal-grid cols-2">
          <div class="term-card">
            <h4>Objetivo</h4>
            <div class="tiny">Manter a empresa viva por 24 meses, evitando que a dívida cresça mais do que o caixa suporta.</div>
          </div>
          <div class="term-card">
            <h4>Termos explicados na hora</h4>
            <div class="tiny">Sempre que um termo novo aparecer, ele será desbloqueado e salvo no glossário.</div>
          </div>
          <div class="term-card">
            <h4>Decisões rápidas</h4>
            <div class="tiny">Cada evento traz poucas opções para não sobrecarregar a atenção.</div>
          </div>
          <div class="term-card">
            <h4>Glossário progressivo</h4>
            <div class="tiny">Use o botão “Glossário” para rever tudo o que já foi apresentado.</div>
          </div>
        </div>`,
        `<button class="btn primary" onclick="closeOverlay()">Entendi</button>`,
        true,
      );
    });
  }

  buildSchedule();
  refreshGlossaryCount();
  updateUI();
});