(() => {
  const GAME_DATA = window.GAME_DATA || { arcs: [], eventPools: {}, phaseThemes: {} };
  const OFFICE_DATA = window.OFFICE_DATA || { catalog: [], rentBaseRate: 0.0165, financingMonths: 24 };

  const original = {
    updateUI: window.updateUI,
    renderEvent: window.renderEvent,
    makeChoice: window.makeChoice,
    openQuickMenu: window.openQuickMenu,
    nextMonth: window.nextMonth,
    endGame: window.endGame,
    openOfficeMenu: window.openOfficeMenu,
  };

  const STAFF_BASE = {
    count: 4,
    salary: 2500,
    morale: 72,
    training: 1,
    monotony: 10,
    tempPowerBoost: 0,
    workPower: 1,
    payroll: 0,
  };

  const STAFF_EVENT_POOLS = {
    critical: [
      {
        title: "Autodesligamento em cadeia",
        desc: "O ambiente ficou tão pesado que parte da equipe pediu para sair de uma vez.",
        note: "Humor muito baixo aumenta a chance de perdas inesperadas.",
        type: "bad",
        effect(state) {
          const lost = Math.min(state.staff.count, 2 + Math.floor(Math.random() * 2));
          state.staff.count = Math.max(0, state.staff.count - lost);
          state.staff.morale = Math.max(0, state.staff.morale - 10);
          state.staff.monotony = Math.max(0, state.staff.monotony - 6);
          state.creditScore = Math.max(0, state.creditScore - 10);
          return `Perda de ${lost} funcionário(s) e queda de moral.`;
        },
      },
      {
        title: "Processo trabalhista",
        desc: "Horas extras e tensão viraram uma disputa formal.",
        note: "Quando a equipe entra em colapso, o custo jurídico aparece.",
        type: "bad",
        effect(state) {
          const fine = 4500 + Math.round(Math.random() * 4000);
          state.cash = Math.max(0, state.cash - fine);
          state.debt = Math.max(0, state.debt + Math.round(fine * 0.25));
          state.staff.morale = Math.max(0, state.staff.morale - 8);
          return `Multa e despesas extras de ${fmt(fine)}.`;
        },
      },
      {
        title: "Sabotagem pequena",
        desc: "Uma falha proposital atrasou uma entrega importante.",
        note: "Desorganização severa costuma virar prejuízo direto.",
        type: "bad",
        effect(state) {
          const loss = 3000 + Math.round(Math.random() * 4200);
          state.cash = Math.max(0, state.cash - loss);
          state.staff.morale = Math.max(0, state.staff.morale - 4);
          state.macro.risk = clamp(state.macro.risk + 5, 0, 100);
          return `Perda operacional de ${fmt(loss)}.`;
        },
      },
    ],
    low: [
      {
        title: "Pedido urgente de aumento",
        desc: "A equipe deixou claro que o salário já não compensa a pressão.",
        note: "Às vezes pagar melhor sai mais barato do que perder gente.",
        type: "mix",
        effect(state) {
          state.staff.salary = Math.round(state.staff.salary * 1.06);
          state.staff.morale = Math.min(100, state.staff.morale + 9);
          state.staff.monotony = Math.max(0, state.staff.monotony - 6);
          state.cash = Math.max(0, state.cash - 2000);
          return `Salário-base subiu 6% e a moral reagiu melhor.`;
        },
      },
      {
        title: "Briga de corredor",
        desc: "Um mal-entendido virou clima ruim entre colegas.",
        note: "Humor baixo e monotonia formam uma combinação perigosa.",
        type: "bad",
        effect(state) {
          state.staff.morale = Math.max(0, state.staff.morale - 7);
          state.staff.monotony = Math.min(100, state.staff.monotony + 8);
          state.macro.risk = clamp(state.macro.risk + 2, 0, 100);
          return "A tensão caiu direto na produtividade.";
        },
      },
      {
        title: "Atestado em sequência",
        desc: "Vários funcionários ficaram fora ao mesmo tempo.",
        note: "Absenteísmo em alta reduz a força de trabalho do mês.",
        type: "bad",
        effect(state) {
          const temp = Math.min(0.2, 0.08 + Math.random() * 0.1);
          state.staff.tempPowerBoost -= temp;
          state.staff.morale = Math.max(0, state.staff.morale - 3);
          state.cash = Math.max(0, state.cash - 1200);
          return `A força de trabalho caiu ${Math.round(temp * 100)}% neste mês.`;
        },
      },
    ],
    mid: [
      {
        title: "Treinamento relâmpago",
        desc: "A equipe se organizou para aprender um processo novo sem travar a operação.",
        note: "Treino sobe produtividade sem precisar contratar mais gente.",
        type: "good",
        effect(state) {
          state.staff.training = Math.min(5, state.staff.training + 1);
          state.staff.morale = Math.min(100, state.staff.morale + 4);
          state.staff.monotony = Math.max(0, state.staff.monotony - 8);
          state.cash = Math.max(0, state.cash - 3200);
          return "Treinamento concluído com ganho real de eficiência.";
        },
      },
      {
        title: "Reclamação por espaço",
        desc: "O escritório ficou apertado demais para o volume atual de pessoas.",
        note: "Capacidade mal ajustada afeta o humor e o ritmo.",
        type: "bad",
        effect(state) {
          state.staff.morale = Math.max(0, state.staff.morale - 5);
          state.staff.monotony = Math.min(100, state.staff.monotony + 6);
          return "A lotação desconfortável pesou no clima da equipe.";
        },
      },
      {
        title: "Mutirão para fechar o mês",
        desc: "A equipe se juntou para empurrar uma entrega crítica.",
        note: "Quando a moral está mediana, o time ainda consegue virar o jogo.",
        type: "good",
        effect(state) {
          state.staff.tempPowerBoost += 0.12;
          state.staff.morale = Math.min(100, state.staff.morale + 5);
          state.staff.monotony = Math.max(0, state.staff.monotony - 5);
          return "A força de trabalho ganhou um empurrão extra neste mês.";
        },
      },
    ],
    high: [
      {
        title: "Mini festa de meta batida",
        desc: "A equipe celebrou um mês muito acima do esperado.",
        note: "Bom humor mantém o time mais forte por mais tempo.",
        type: "good",
        effect(state) {
          state.staff.morale = Math.min(100, state.staff.morale + 8);
          state.staff.monotony = Math.max(0, state.staff.monotony - 14);
          state.staff.tempPowerBoost += 0.08;
          state.cash = Math.max(0, state.cash - 1800);
          return "O clima ficou leve e a produtividade subiu.";
        },
      },
      {
        title: "Indicação interna de talento",
        desc: "Alguém da equipe trouxe um novo candidato muito bom.",
        note: "Moral alta também ajuda a atrair gente melhor.",
        type: "good",
        effect(state) {
          if (state.staff.count < totalEmployeeLimit()) {
            state.staff.count += 1;
          }
          state.staff.training = Math.min(5, state.staff.training + 1);
          state.staff.morale = Math.min(100, state.staff.morale + 4);
          return "Você ganhou mais um reforço quase sem custo de aquisição.";
        },
      },
      {
        title: "Projeto fora da curva",
        desc: "Um pequeno grupo encontrou um processo melhor e salvou tempo no mês.",
        note: "As melhores equipes costumam gerar ganhos que não estavam no plano.",
        type: "good",
        effect(state) {
          state.staff.tempPowerBoost += 0.15;
          state.staff.training = Math.min(5, state.staff.training + 1);
          state.staff.morale = Math.min(100, state.staff.morale + 3);
          return "O time entregou mais com a mesma estrutura.";
        },
      },
    ],
  };

  function officeCatalog() {
    return Array.isArray(OFFICE_DATA.catalog) ? OFFICE_DATA.catalog : [];
  }

  function cloneOffice(office, overrides = {}) {
    return {
      ...office,
      ...overrides,
      marketValue: overrides.marketValue ?? office.baseValue,
      status: overrides.status ?? "available",
      financedBalance: overrides.financedBalance ?? 0,
      financingMonthsLeft: overrides.financingMonthsLeft ?? 0,
      financingMonthlyPayment: overrides.financingMonthlyPayment ?? 0,
      rentMonthsHeld: overrides.rentMonthsHeld ?? 0,
    };
  }

  function officeValue(office) {
    return Math.max(0, Math.round(office?.marketValue || office?.baseValue || 0));
  }

  function officeRent(office) {
    return Math.max(0, Math.round(officeValue(office) * (office?.rentRate || OFFICE_DATA.rentBaseRate || 0.0165)));
  }

  function officeMaintenance(office) {
    return Math.max(0, Math.round(office?.monthlyMaintenance || 0));
  }

  function officeFinancingPayment(price) {
    return Math.max(0, Math.round((price / (OFFICE_DATA.financingMonths || 24)) * 1.06));
  }

  function officeLabel(office) {
    if (!office) return "Sem escritório";
    const status = office.id === "starter"
      ? "Sede inicial"
      : office.status === "rented"
        ? "Alugado"
        : office.status === "owned"
          ? "Próprio"
          : "Disponível";
    return `${office.name} — ${status}`;
  }

  function activeOffices() {
    return (state.offices || []).filter((office) => office.status === "owned" || office.status === "financed" || office.status === "rented");
  }

  function totalEmployeeLimit() {
    return activeOffices().reduce((sum, office) => sum + Math.max(0, office.employeeLimit || 0), 0);
  }

  function officeStructureScore() {
    const offices = activeOffices();
    if (!offices.length) return 0.8;
    const score = offices.reduce((sum, office) => sum + ((office.comfort || 0) + (office.ambience || 0)) / 200, 0) / offices.length;
    return clamp(score, 0.55, 1.18);
  }

  function calcStaffPayroll() {
    const staff = state.staff || STAFF_BASE;
    const taxLoad = 1 + (state.macro?.taxPressure || 0) / 220;
    return Math.round((staff.count || 0) * (staff.salary || 0) * taxLoad);
  }

  function calcWorkPower() {
    const staff = state.staff || STAFF_BASE;
    if (!staff.count) return 0;
    const capacity = Math.max(1, totalEmployeeLimit());
    const occupancy = clamp((staff.count || 0) / capacity, 0, 1.4);
    const moraleFactor = 0.4 + (staff.morale || 0) / 100;
    const trainingFactor = 0.85 + (staff.training || 0) * 0.1;
    const structureFactor = officeStructureScore();
    const crowdFactor = occupancy > 0.9 ? Math.max(0.72, 1 - (occupancy - 0.9) * 0.42) : 1 + (0.9 - occupancy) * 0.06;
    const tempBoost = 1 + Math.max(-0.4, staff.tempPowerBoost || 0);
    return Math.max(0.05, ((staff.count || 0) * moraleFactor * trainingFactor * structureFactor * crowdFactor * tempBoost) / 4.2);
  }

  function refreshStaffStats() {
    const staff = state.staff || STAFF_BASE;
    staff.workPower = calcWorkPower();
    staff.payroll = calcStaffPayroll();
    state.staff = staff;
    return staff;
  }

  function enforceEmployeeLimit(reason = "") {
    const cap = totalEmployeeLimit();
    const staff = state.staff || STAFF_BASE;
    if (staff.count > cap) {
      const excess = staff.count - cap;
      staff.count = cap;
      staff.morale = Math.max(0, staff.morale - 8);
      staff.monotony = Math.min(100, staff.monotony + 5);
      addLog(`Capacidade dos escritórios caiu e ${excess} funcionário(s) foram demitidos automaticamente${reason ? ` (${reason})` : ""}.`, "bad");
    }
    state.staff = staff;
    refreshStaffStats();
  }

  function recalcPatrimony() {
    const officeAssets = (state.offices || []).reduce((sum, office) => sum + officePatrimonyValue(office), 0);
    const officeLiabilities = (state.offices || []).reduce((sum, office) => sum + Math.max(0, office.financedBalance || 0), 0);
    state.financingLiability = officeLiabilities;
    const bonus = state.patrimonyBonus || 0;
    state.patrimony = Math.max(0, Math.round(state.cash + officeAssets + (state.invested || 0) - state.debt - officeLiabilities + bonus));
    return state.patrimony;
  }

  function officePatrimonyValue(office) {
    if (!office) return 0;
    if (office.status === "rented" || office.status === "available") return 0;
    return officeValue(office);
  }

  function totalOfficeValue() {
    return (state.offices || []).reduce((sum, office) => sum + officePatrimonyValue(office), 0);
  }

  function calcOfficeExpense(office) {
    if (!office || office.status === "available") return 0;
    let cost = officeMaintenance(office);
    if (office.status === "rented") cost += officeRent(office);
    return cost;
  }

  function totalOfficeCost() {
    return (state.offices || []).reduce((sum, office) => sum + calcOfficeExpense(office), 0);
  }

  function totalFinancingCost() {
    return (state.offices || []).reduce((sum, office) => sum + ((office.status === "financed" && office.financingMonthlyPayment) ? office.financingMonthlyPayment : 0), 0);
  }

  function totalRecurringCost() {
    const fixed = Object.values(state.monthlyCosts || {}).reduce((sum, value) => sum + value, 0);
    return fixed + totalOfficeCost() + totalFinancingCost() + refreshStaffStats().payroll;
  }

  function ownedOfficeCount() {
    return (state.offices || []).filter((office) => office.status === "owned" || office.status === "financed").length;
  }

  function canTradeOffice() {
    return ownedOfficeCount() + (state.offices || []).filter((office) => office.status === "rented").length > 1;
  }

  function findOfficeById(id) {
    return (state.offices || []).find((office) => office.id === id);
  }

  function syncOfficeInflation() {
    const infl = state.macro?.inflation || 0;
    (state.offices || []).forEach((office) => {
      if (office.status === "available") return;
      const appreciation = office.annualAppreciation || 1;
      office.marketValue = Math.round(officeValue(office) * (1 + infl / 100) * appreciation);
      if (office.status === "rented") {
        office.rentMonthsHeld = (office.rentMonthsHeld || 0) + 1;
      }
    });
  }

  function initOffices() {
    const catalog = officeCatalog();
    state.offices = [
      cloneOffice(catalog[0], {
        status: "owned",
        acquiredBy: "starter",
        marketValue: catalog[0]?.baseValue || 0,
      }),
      ...catalog.slice(1).map((office) => cloneOffice(office, { status: "available" })),
    ];
    state.activeOfficeId = "starter";
    enforceEmployeeLimit("ajuste inicial");
    recalcPatrimony();
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
      const downPayment = Math.round(price * 0.25);
      if (state.cash < downPayment) {
        addLog(`Caixa insuficiente para a entrada de ${office.name}.`, "bad");
        return;
      }
      state.cash -= downPayment;
      office.status = "financed";
      office.acquiredBy = "financed";
      office.financedBalance = price - downPayment;
      office.financingMonthsLeft = OFFICE_DATA.financingMonths || 24;
      office.financingMonthlyPayment = officeFinancingPayment(office.financedBalance);
      addLog(`Escritório ${office.name} financiado. Entrada de ${fmt(downPayment)} e saldo parcelado.`, "good");
    }
    state.activeOfficeId = office.id;
    enforceEmployeeLimit("expansão da empresa");
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
    enforceEmployeeLimit("novo aluguel");
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
    enforceEmployeeLimit("cancelamento de aluguel");
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
    const saleValue = Math.round(officeValue(office) * 0.88);
    state.cash += saleValue;
    office.status = "available";
    office.acquiredBy = null;
    office.financedBalance = 0;
    office.financingMonthsLeft = 0;
    office.financingMonthlyPayment = 0;
    addLog(`Escritório ${office.name} vendido por ${fmt(saleValue)}.`, "good");
    enforceEmployeeLimit("venda de escritório");
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
    enforceEmployeeLimit("compra de escritório alugado");
    recalcPatrimony();
    updateUI();
    openOfficeMenu();
  }

  function hireEmployees(amount = 1) {
    const staff = state.staff || { ...STAFF_BASE };
    const cap = totalEmployeeLimit();
    const free = Math.max(0, cap - staff.count);
    const qty = Math.max(0, Math.min(amount, free));
    if (!qty) {
      addLog("Não há espaço livre para contratar mais funcionários.", "bad");
      return;
    }
    const onboarding = qty * 1200;
    if (state.cash < onboarding) {
      addLog(`Caixa insuficiente para contratar ${qty} funcionário(s).`, "bad");
      return;
    }
    state.cash -= onboarding;
    staff.count += qty;
    staff.morale = Math.min(100, staff.morale + 2 * qty);
    staff.monotony = Math.max(0, staff.monotony - 2 * qty);
    state.staff = staff;
    refreshStaffStats();
    addLog(`${qty} funcionário(s) contratados.`, "good");
    playSfx("hire");
    recalcPatrimony();
    updateUI();
    openStaffMenu();
  }

  function fireEmployees(amount = 1, silent = false) {
    const staff = state.staff || { ...STAFF_BASE };
    const qty = Math.max(0, Math.min(amount, staff.count));
    if (!qty) {
      addLog("Não há funcionários para demitir.", "bad");
      return;
    }
    staff.count -= qty;
    staff.morale = Math.max(0, staff.morale - (silent ? 2 : 4));
    staff.monotony = Math.min(100, staff.monotony + 2);
    state.staff = staff;
    refreshStaffStats();
    addLog(`${qty} funcionário(s) demitidos.`, silent ? "info" : "bad");
    playSfx("fire");
    recalcPatrimony();
    updateUI();
    openStaffMenu();
  }

  function trainTeam() {
    const staff = state.staff || { ...STAFF_BASE };
    const cost = 4500;
    if (state.cash < cost) {
      addLog("Caixa insuficiente para treinar a equipe.", "bad");
      return;
    }
    if (staff.training >= 5) {
      addLog("A equipe já está no limite prático de treinamento.", "info");
      return;
    }
    state.cash -= cost;
    staff.training = Math.min(5, staff.training + 1);
    staff.morale = Math.min(100, staff.morale + 5);
    staff.monotony = Math.max(0, staff.monotony - 10);
    state.staff = staff;
    refreshStaffStats();
    addLog("Treinamento concluído com ganho de eficiência.", "good");
    playSfx("training");
    recalcPatrimony();
    updateUI();
    openStaffMenu();
  }

  function raiseSalaries(mult = 0.06) {
    const staff = state.staff || { ...STAFF_BASE };
    state.staff.salary = Math.round(staff.salary * (1 + mult));
    staff.morale = Math.min(100, staff.morale + 8);
    staff.monotony = Math.max(0, staff.monotony - 4);
    state.staff = staff;
    refreshStaffStats();
    addLog(`Salário-base reajustado em ${Math.round(mult * 100)}%.`, "good");
    playSfx("good");
    recalcPatrimony();
    updateUI();
    openStaffMenu();
  }

  function teamBreak() {
    const staff = state.staff || { ...STAFF_BASE };
    const cost = 2200;
    if (state.cash < cost) {
      addLog("Caixa insuficiente para liberar uma pausa para a equipe.", "bad");
      return;
    }
    state.cash -= cost;
    staff.morale = Math.min(100, staff.morale + 6);
    staff.monotony = Math.max(0, staff.monotony - 12);
    staff.tempPowerBoost += 0.05;
    state.staff = staff;
    refreshStaffStats();
    addLog("Pausa da equipe melhorou o clima do escritório.", "good");
    playSfx("good");
    recalcPatrimony();
    updateUI();
    openStaffMenu();
  }

  function openStaffMenu() {
    const staff = refreshStaffStats();
    const cap = totalEmployeeLimit();
    const occupancy = cap ? ((staff.count || 0) / cap) * 100 : 0;
    const html = `<div class="modal-grid cols-2">
      <div class="term-card">
        <h4>Equipe atual</h4>
        <div class="tiny">Funcionários: ${staff.count} / ${cap}</div>
        <div class="tiny">Poder de trabalho: ${staff.workPower.toFixed(2)}x</div>
        <div class="tiny">Humor: ${Math.round(staff.morale)}%</div>
        <div class="tiny">Treinamento: ${staff.training}/5</div>
        <div class="tiny">Monotonia: ${Math.round(staff.monotony)}%</div>
        <div class="tiny">Média salarial: ${fmt(staff.salary)}</div>
        <div class="tiny">Folha mensal estimada: ${fmt(staff.payroll)}</div>
        <div class="tiny">Ocupação dos escritórios: ${occupancy.toFixed(0)}%</div>
      </div>
      <div class="term-card">
        <h4>Ações</h4>
        <div class="tiny">Contratações e demissões dependem da capacidade total dos escritórios.</div>
        <div class="tiny" style="margin-top:8px">Salário, treinamento e conforto do escritório mexem direto com moral e produtividade.</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px">
          <button class="btn small primary" onclick="hireEmployees(1)">Contratar 1</button>
          <button class="btn small" onclick="hireEmployees(5)">Contratar 5</button>
          <button class="btn small danger" onclick="fireEmployees(1)">Demitir 1</button>
          <button class="btn small danger" onclick="fireEmployees(5)">Demitir 5</button>
          <button class="btn small" onclick="trainTeam()">Treinar</button>
          <button class="btn small" onclick="raiseSalaries(0.06)">Aumentar salário</button>
          <button class="btn small" onclick="teamBreak()">Pausa da equipe</button>
        </div>
      </div>
    </div>`;

    openOverlay(
      "Gestão de funcionários",
      "Contratação, demissão, treinamento e moral da equipe.",
      html,
      `<button class="btn primary" onclick="closeOverlay()">Fechar</button>`,
      true,
    );
  }

  function applyThemeForMonth(month) {
    const phase = phaseKey(month);
    const theme = GAME_DATA.phaseThemes?.[phase] || {
      start: "#eff6ff",
      end: "#e2e8f0",
      glow: "rgba(79, 70, 229, 0.28)",
      accent: "#4f46e5",
    };

    document.documentElement.style.setProperty("--bg-gradient", `linear-gradient(135deg, ${theme.start} 0%, ${theme.end} 100%)`);
    document.documentElement.style.setProperty("--theme-glow", theme.glow);
    document.documentElement.style.setProperty("--theme-accent", theme.accent);
    document.body.dataset.phase = phase;

    if (state.themePhase !== phase) {
      state.themePhase = phase;
      playMusicForPhase(phase);
    }
    return phase;
  }

  const audioState = {
    music: null,
    phase: "",
    cache: new Map(),
  };

  function getAudioUrl(folder, name) {
    return `audios/${folder}/${name}.mp3`;
  }

  function playSfx(name) {
    try {
      const url = getAudioUrl("sound-effects", name);
      const audio = new Audio(url);
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch {
      /* silencioso */
    }
  }

  function playMusicForPhase(phase) {
    const map = {
      early: "arranque",
      growth: "expansao",
      pressure: "pressao",
      shock: "choque",
      recovery: "virada",
    };
    const track = map[phase] || map.early;
    const url = getAudioUrl("musics", track);

    try {
      state.started = false;

    if (audioState.music) {
        audioState.music.pause();
        audioState.music = null;
      }
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.24;
      audioState.music = audio;
      audioState.phase = phase;
      audio.play().catch(() => {});
    } catch {
      /* silencioso */
    }
  }

  function maybeTriggerStaffEvent(rng) {
    const staff = state.staff || STAFF_BASE;
    if (!staff.count) return null;

    const chance = clamp(0.08 + (55 - staff.morale) / 140 + staff.monotony / 300, 0.08, 0.44);
    if (rng() > chance) return null;

    let pool = STAFF_EVENT_POOLS.mid;
    if (staff.morale <= 25) pool = STAFF_EVENT_POOLS.critical;
    else if (staff.morale <= 48) pool = STAFF_EVENT_POOLS.low;
    else if (staff.morale >= 78) pool = STAFF_EVENT_POOLS.high;

    if (!pool || !pool.length) return null;
    return pool[Math.floor(rng() * pool.length)];
  }

  function renderStaffEvent(ev) {
    if (!ev) return;
    const eventArea = el("event-area");
    if (!eventArea) return;

    const cls = ev.type === "bad" ? "neg" : ev.type === "good" ? "pos" : "mix";
    eventArea.innerHTML += `<div class="event ${cls}" style="margin-top:14px;border-left-style:dashed">
      <div class="card-title" style="margin-bottom:10px"><div class="event-title" style="margin-bottom:0">Equipe: ${ev.title}</div><span class="badge blue">Funcionários</span></div>
      <div class="event-desc">${ev.desc}</div>
      <div class="event-note"><strong>Resultado:</strong> ${ev.effectText || "Sem efeito."}</div>
      <div class="mini-note" style="margin-top:8px">${ev.note || ""}</div>
    </div>`;
  }

  function updateUI() {
    original.updateUI();
    const staff = refreshStaffStats();
    const phase = phaseKey(state.month || 1);
    if (state.started) {
      applyThemeForMonth(state.month || 1);
    } else {
      const theme = GAME_DATA.phaseThemes?.[phase] || {
        start: "#eff6ff",
        end: "#e2e8f0",
        glow: "rgba(79, 70, 229, 0.28)",
        accent: "#4f46e5",
      };
      document.documentElement.style.setProperty("--bg-gradient", `linear-gradient(135deg, ${theme.start} 0%, ${theme.end} 100%)`);
      document.documentElement.style.setProperty("--theme-glow", theme.glow);
      document.documentElement.style.setProperty("--theme-accent", theme.accent);
      document.body.dataset.phase = phase;
    }

    const staffCount = el("staff-count");
    if (staffCount) staffCount.textContent = `${staff.count} / ${totalEmployeeLimit()}`;

    const staffPower = el("staff-power");
    if (staffPower) staffPower.textContent = `${staff.workPower.toFixed(2)}x`;

    const staffMorale = el("staff-morale");
    if (staffMorale) staffMorale.textContent = `${Math.round(staff.morale)}%`;

    const staffSalary = el("staff-salary");
    if (staffSalary) staffSalary.textContent = fmt(staff.salary);

    const staffPanel = el("staff-panel");
    if (staffPanel) {
      staffPanel.innerHTML = `
        <div class="tiny">Funcionários: ${staff.count} / ${totalEmployeeLimit()}</div>
        <div class="tiny">Poder de trabalho: ${staff.workPower.toFixed(2)}x</div>
        <div class="tiny">Humor: ${Math.round(staff.morale)}%</div>
        <div class="tiny">Treinamento: ${staff.training}/5</div>
        <div class="tiny">Monotonia: ${Math.round(staff.monotony)}%</div>
        <div class="tiny">Média salarial: ${fmt(staff.salary)}</div>
      `;
    }
  }

  function monthlyTick() {
    const rng = seededRand(state.seed + state.month * 97 + 13);
    const macro = state.macro;
    const staff = state.staff || { ...STAFF_BASE };

    macro.selic = clamp(macro.selic + (rng() - 0.5) * 1.05 + (macro.risk > 55 ? 0.24 : -0.04), 6, 20);
    macro.inflation = clamp(macro.inflation + (rng() - 0.5) * 0.75 + (state.debt > 100000 ? 0.09 : 0), 2, 15);
    macro.fx = clamp(macro.fx + (rng() - 0.5) * 0.32 + (macro.risk > 60 ? 0.11 : 0), 4.2, 8.2);
    macro.demand = clamp(macro.demand + (rng() - 0.5) * 4.6 + (state.clientTrust - 55) / 36 - (macro.risk - 25) / 96, 18, 120);
    macro.risk = clamp(macro.risk + (rng() - 0.5) * 5 + (state.debt > 120000 ? 1.4 : 0) - (state.cash > 130000 ? 0.25 : 0), 0, 100);
    macro.taxPressure = clamp(macro.taxPressure + (rng() - 0.5) * 1.35 + (macro.inflation > 7 ? 0.22 : 0), 0, 100);
    macro.confidence = clamp(macro.confidence + (rng() - 0.5) * 3 + (macro.demand > 70 ? 0.5 : -0.3) - (macro.risk > 60 ? 0.8 : 0), 0, 100);

    state.debtRate = clamp(0.027 + macro.selic * 0.0028 + (100 - state.creditScore) / 5600, 0.03, 0.14);

    const officeCost = totalOfficeCost() + totalFinancingCost();
    const fixedCost = Object.values(state.monthlyCosts || {}).reduce((sum, value) => sum + value, 0);

    const capacity = Math.max(1, totalEmployeeLimit());
    const occupancy = clamp((staff.count || 0) / capacity, 0, 1.4);
    const quality = officeStructureScore();
    const salaryMood = clamp((staff.salary || 0) / 2500, 0.7, 1.5);
    const crowdPenalty = occupancy > 0.9 ? Math.max(0.72, 1 - (occupancy - 0.9) * 0.34) : 1 + (0.9 - occupancy) * 0.03;
    const moraleSwing = clamp(0.94 + (staff.morale - 50) / 220, 0.72, 1.25);
    const monotonyPenalty = clamp(1 - (staff.monotony || 0) / 600, 0.82, 1.0);

    staff.morale = clamp(
      staff.morale
      + ((staff.salary || 2500) >= 2800 ? 1.2 : -1.1)
      + (quality - 0.8) * 18
      - Math.max(0, occupancy - 0.8) * 22
      - (staff.monotony || 0) * 0.22
      + (rng() - 0.5) * 3,
      0,
      100,
    );
    staff.monotony = clamp((staff.monotony || 0) + 1.8 + Math.max(0, occupancy - 0.82) * 2.6 - (quality > 0.88 ? 0.9 : 0), 0, 100);

    state.staff = staff;
    refreshStaffStats();

    const staffEvent = maybeTriggerStaffEvent(rng);
    state.staffEvent = null;
    if (staffEvent) {
      const effectText = staffEvent.effect?.(state) || "Sem efeito.";
      state.staffEvent = { ...staffEvent, effectText };
      refreshStaffStats();
      addLog(`Equipe: ${staffEvent.title}.`, staffEvent.type === "good" ? "good" : staffEvent.type === "bad" ? "bad" : "info");
      playSfx("alert");
    }

    const workPower = refreshStaffStats().workPower;
    const revenueNoise = 0.92 + rng() * 0.18;
    const expenseNoise = 0.94 + rng() * 0.22;
    const demandFactor = 0.68 + macro.demand / 150 + state.clientTrust / 320 + macro.confidence / 380 + staff.morale / 640;
    const expenseFactor = 0.9 + macro.inflation / 16 + macro.taxPressure / 255 + Math.max(0, macro.fx - 5) / 17 + (100 - state.supplierRep) / 320;

    const staffPayroll = staff.payroll;
    const monthRevenue = Math.round(state.revenueBase * demandFactor * revenueNoise * workPower);
    const monthExpense = Math.round((state.expenseBase + fixedCost + officeCost + staffPayroll) * expenseFactor * expenseNoise);
    let profit = monthRevenue - monthExpense;
    let extraExpense = 0;

    if (macro.risk > 65 && rng() < 0.4) {
      extraExpense = Math.round(3500 + rng() * 9500);
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
        const penalty = Math.round(shortfall * 0.14);
        state.debt += penalty;
        addLog(`Caixa insuficiente para pagar tudo. Multa e juros adicionam ${fmt(penalty)} à dívida.`, "bad");
        state.creditScore = Math.max(0, state.creditScore - 30);
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
      staff.salary = Math.round(staff.salary * (1 + (macro.inflation / 100) * 0.42));
      staff.monotony = Math.max(0, staff.monotony - 6);
      addLog(`Mês ${state.month}: salários e imóveis tiveram reajuste anual pela inflação.`, "info");
    }

    staff.tempPowerBoost = 0;
    state.staff = staff;
    refreshStaffStats();
    enforceEmployeeLimit("fechamento mensal");
    recalcPatrimony();

    if (state.cash < 0) {
      state.cash = 0;
      state.gameOver = true;
      addLog(`Mês ${state.month}: caixa zerado — empresa não conseguiu sustentar a operação.`, "bad");
    }

    state.cashHistory.push(state.cash);
  }

  function calcScore() {
    const s = profitStats();
    const staff = refreshStaffStats();
    const profitPart = clamp(Math.round((s.totalProfit / 70000) * 220), -120, 220);
    const patrimonyPart = clamp(Math.round((state.patrimony / 450000) * 200), 0, 200);
    const debtPart = clamp(Math.round(180 - (state.debt / 130000) * 180), 0, 180);
    const staffPart = clamp(Math.round((staff.morale * 1.35) + (staff.workPower * 28)), 0, 180);
    const controlPart = clamp(Math.round(((state.creditScore - 300) / 4) + ((state.cash > 0 ? 1 : 0) * 22)), 0, 220);
    return clamp(Math.round(profitPart + patrimonyPart + debtPart + staffPart + controlPart), 0, 1000);
  }

  function endGame() {
    const score = calcScore();
    const s = profitStats();
    const staff = refreshStaffStats();

    let title = "";
    let summary = "";
    let badge = "blue";

    if (score >= 720) {
      title = "CEO Financeiro";
      summary = "Você fechou a campanha com caixa, lucro e equipe funcionando de verdade.";
      badge = "green";
    } else if (score >= 520) {
      title = "Gestor Resiliente";
      summary = "A empresa aguentou a pancada e conseguiu terminar com controle razoável.";
      badge = "blue";
    } else if (score >= 320) {
      title = "Sobrevivente de Mercado";
      summary = "Você não afundou, mas a operação ficou apertada e a equipe sentiu o peso.";
      badge = "amber";
    } else {
      title = "Reestruturação Dura";
      summary = "A empresa perdeu fôlego antes do fim. O próximo ciclo precisa de caixa e equipe mais bem protegidos.";
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
      endSummary.textContent = `${summary} Lucro acumulado: ${fmt(s.totalProfit)}. Patrimônio final: ${fmt(state.patrimony)}. Equipe final: ${staff.count} funcionário(s), moral ${Math.round(staff.morale)}%.`;
    }

    state.started = false;

    if (audioState.music) {
      audioState.music.pause();
      audioState.music = null;
    }

    showScreen("end-screen");
  }

  function openQuickMenu() {
    const staff = refreshStaffStats();
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
        <h4>Equipe e operação</h4>
        <div class="tiny">Funcionários: ${staff.count} / ${totalEmployeeLimit()}</div>
        <div class="tiny">Poder de trabalho: ${staff.workPower.toFixed(2)}x</div>
        <div class="tiny">Humor: ${Math.round(staff.morale)}%</div>
        <div class="tiny">Último evento de equipe: ${state.staffEvent ? state.staffEvent.title : "Sem evento"}</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px">
          <button class="btn small primary" onclick="openStaffMenu()">Gerenciar equipe</button>
        </div>
      </div>
      <div class="term-card">
        <h4>Resumo do mês</h4>
        <div class="tiny">Lucro acumulado: ${fmt(state.cumulativeProfit)}</div>
        <div class="tiny">Custos mensais: ${fmt(totalRecurringCost())}</div>
        <div class="tiny">Último evento: ${state.currentEvent ? state.currentEvent.title : "Sem evento ativo"}</div>
        <div class="tiny" style="margin-top:8px">O resultado mensal depende de mercado, equipe, escritórios e decisões.</div>
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

  function renderEvent(ev) {
    original.renderEvent(ev);
    renderStaffEvent(state.staffEvent);
  }

  function makeChoice(idx) {
    playSfx("click");
    return original.makeChoice(idx);
  }

  function nextMonth() {
    playSfx("tick");
    return original.nextMonth();
  }

  function startGame() {
    state.cash = 170000;
    state.debt = 52000;
    state.debtRate = 0.046;
    state.debtTerms = 12;
    state.creditScore = 540;
    state.revenueBase = 70000;
    state.expenseBase = 76000;
    state.supplierRep = 60;
    state.clientTrust = 66;
    state.invested = 0;
    state.investRate = 0;
    state.month = 0;
    state.gameOver = false;
    state.recentLogs = [];
    state.cashHistory = [170000];
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
    state.staff = { ...STAFF_BASE };
    state.staffEvent = null;
    state.themePhase = "";
    state.started = true;
    state.monthlyCosts = {
      payroll: 5800,
      marketing: 6200,
      logistics: 7200,
      software: 2100,
      utilities: 3100,
      training: 900,
    };
    state.activeOfficeId = "starter";
    state.macro = {
      selic: 10.7,
      inflation: 5.2,
      fx: 5.15,
      demand: 61,
      risk: 24,
      taxPressure: 19,
      confidence: 68,
    };

    initOffices();
    buildSchedule();
    refreshGlossaryCount();
    updateUI();
    showScreen("game-screen");
    closeOverlay();
    playMusicForPhase("early");
    nextMonth();
  }

  function trimOfficeStateIfNeeded() {
    enforceEmployeeLimit("ajuste de capacidade");
  }

  window.cloneOffice = cloneOffice;
  window.officeValue = officeValue;
  window.officeRent = officeRent;
  window.officeMaintenance = officeMaintenance;
  window.officeFinancingPayment = officeFinancingPayment;
  window.officeLabel = officeLabel;
  window.calcOfficeExpense = calcOfficeExpense;
  window.officePatrimonyValue = officePatrimonyValue;
  window.recalcPatrimony = recalcPatrimony;
  window.ownedOfficeCount = ownedOfficeCount;
  window.totalOfficeCost = totalOfficeCost;
  window.totalFinancingCost = totalFinancingCost;
  window.totalRecurringCost = totalRecurringCost;
  window.totalOfficeValue = totalOfficeValue;
  window.findOfficeById = findOfficeById;
  window.initOffices = initOffices;
  window.syncOfficeInflation = syncOfficeInflation;
  window.canTradeOffice = canTradeOffice;
  window.buyOffice = buyOffice;
  window.rentOffice = rentOffice;
  window.cancelRentOffice = cancelRentOffice;
  window.sellOffice = sellOffice;
  window.convertRentedOffice = convertRentedOffice;
  window.hireEmployees = hireEmployees;
  window.fireEmployees = fireEmployees;
  window.trainTeam = trainTeam;
  window.raiseSalaries = raiseSalaries;
  window.teamBreak = teamBreak;
  window.openStaffMenu = openStaffMenu;
  window.updateUI = updateUI;
  window.monthlyTick = monthlyTick;
  window.calcScore = calcScore;
  window.endGame = endGame;
  window.openQuickMenu = openQuickMenu;
  window.renderEvent = renderEvent;
  window.makeChoice = makeChoice;
  window.nextMonth = nextMonth;
  window.startGame = startGame;
  window.applyThemeForMonth = applyThemeForMonth;
  window.playSfx = playSfx;
  window.playMusicForPhase = playMusicForPhase;
  window.trimOfficeStateIfNeeded = trimOfficeStateIfNeeded;
})();
