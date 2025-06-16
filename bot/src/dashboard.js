import blessed from "blessed";
import contrib from "blessed-contrib";
import {
  loadPersonas,
  savePersonas,
  getCurrentPersona,
  setCurrentPersona,
  setBotName,
  getBotName,
} from "./personaManager.js";

export async function createDashboard() {
  const screen = blessed.screen({
    smartCSR: true,
    title: "Bianca Bot Dashboard",
    fullUnicode: true,
  });

  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  // Componentes do dashboard
  const statusBox = grid.set(0, 0, 2, 12, blessed.box, {
    label: "Status do Bot",
    content: "Inicializando...",
    tags: true,
    style: {
      fg: "white",
      bg: "blue",
      border: { fg: "#f0f0f0" },
    },
  });

  const statsTable = grid.set(2, 0, 4, 6, contrib.table, {
    keys: true,
    label: "Estatísticas",
    columnSpacing: 2,
    columnWidth: [15, 10],
  });

  statsTable.setData({
    headers: ["Métrica", "Valor"],
    data: [
      ["Mensagens Recebidas", "0"],
      ["Respostas Enviadas", "0"],
      ["Erros", "0"],
      ["Sessões Ativas", "0"],
    ],
  });

  const logBox = grid.set(6, 0, 6, 6, blessed.log, {
    label: "Log de Atividade",
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: " ", inverse: true },
  });

  const messageTable = grid.set(2, 6, 4, 6, contrib.table, {
    keys: true,
    label: "Últimas Mensagens",
    columnSpacing: 2,
    columnWidth: [20, 40],
  });

  // Painel de controle
  const controlBox = grid.set(0, 6, 2, 6, blessed.list, {
    label: "Personas Disponíveis",
    items: [],
    keys: true,
    style: {
      selected: {
        bg: "blue",
      },
    },
  });

  const botNameBox = grid.set(6, 6, 1, 6, blessed.textbox, {
    label: "Nome da IA",
    content: getBotName(),
    inputOnFocus: true,
    border: { type: "line" },
    style: {
      fg: "white",
      bg: "black",
      border: { fg: "#f0f0f0" },
    },
  });

  const applyButton = grid.set(7, 6, 1, 3, blessed.button, {
    content: "Aplicar",
    align: "center",
    padding: { top: 1, bottom: 1 },
    style: {
      bg: "green",
      focus: { bg: "darkgreen" },
    },
  });

  const restartButton = grid.set(7, 9, 1, 3, blessed.button, {
    content: "Reiniciar",
    align: "center",
    padding: { top: 1, bottom: 1 },
    style: {
      bg: "yellow",
      focus: { bg: "darkyellow" },
    },
  });

  const personaForm = grid.set(8, 6, 4, 6, blessed.form, {
    label: "Gerenciar Personas",
    keys: true,
    content: "Adicionar/Remover Personas",
    border: { type: "line" },
  });

  const personaName = blessed.textbox({
    parent: personaForm,
    top: 1,
    height: 3,
    width: "90%",
    left: "center",
    label: "Nome",
    border: { type: "line" },
    inputOnFocus: true,
  });

  const personaPrompt = blessed.textbox({
    parent: personaForm,
    top: 5,
    height: 6,
    width: "90%",
    left: "center",
    label: "Prompt",
    border: { type: "line" },
    inputOnFocus: true,
    multiline: true,
  });

  const addPersonaBtn = blessed.button({
    parent: personaForm,
    top: 12,
    left: "25%",
    width: "20%",
    content: "Adicionar",
    align: "center",
    padding: { top: 1, bottom: 1 },
    style: {
      bg: "green",
      focus: { bg: "darkgreen" },
    },
  });

  const removePersonaBtn = blessed.button({
    parent: personaForm,
    top: 12,
    left: "55%",
    width: "20%",
    content: "Remover",
    align: "center",
    padding: { top: 1, bottom: 1 },
    style: {
      bg: "red",
      focus: { bg: "darkred" },
    },
  });

  // Array para armazenar as últimas mensagens
  const lastMessages = [];
  messageTable.setData({
    headers: ["Remetente", "Mensagem"],
    data: lastMessages,
  });

  // Carregar personas
  const personas = await loadPersonas();
  const currentPersona = getCurrentPersona();

  // Atualizar lista de personas
  function updatePersonaList() {
    controlBox.setItems(
      personas.map((p) =>
        p.name === currentPersona.name ? `✓ ${p.name}` : p.name
      )
    );
    controlBox.select(
      personas.findIndex((p) => p.name === currentPersona.name)
    );
    screen.render();
  }

  updatePersonaList();

  // Estilo global
  screen.style = {
    bg: "#1e1e1e",
    border: { fg: "#c0c0c0" },
  };

  // Lista de elementos focáveis
  const focusableElements = [
    controlBox,
    botNameBox,
    applyButton,
    restartButton,
    personaName,
    personaPrompt,
    addPersonaBtn,
    removePersonaBtn,
  ];

  let currentFocusIndex = 0;

  // Função para focar em um elemento
  function focusElement(index) {
    // Remover destaque de todos os elementos
    focusableElements.forEach((el) => {
      if (el.style.border) {
        el.style.border.fg = "black";
      }
    });

    // Atualizar índice
    currentFocusIndex = index;
    if (currentFocusIndex >= focusableElements.length) currentFocusIndex = 0;
    if (currentFocusIndex < 0) currentFocusIndex = focusableElements.length - 1;

    // Aplicar destaque ao elemento atual
    const element = focusableElements[currentFocusIndex];
    if (element.style.border) {
      element.style.border.fg = "yellow";
    }

    element.focus();
    screen.render();
  }

  // Inicializar foco (mas não renderiza ainda)
  focusElement(0);

  // Atalhos de teclado
  screen.key(["escape", "q", "C-c"], () => process.exit(0));
  screen.key(["r"], () => screen.render());
  screen.key(["tab"], () => focusElement(currentFocusIndex + 1));
  screen.key(["S-tab"], () => focusElement(currentFocusIndex - 1));
  screen.key(["enter"], () => {
    const focusedElement = focusableElements[currentFocusIndex];
    if (focusedElement.type === "button") {
      focusedElement.emit("press");
    } else if (focusedElement.type === "textbox") {
      focusedElement.focus();
      screen.render();
    } else if (focusedElement.type === "list") {
      // Simular seleção na lista
      const selectedIndex = focusedElement.selected;
      setCurrentPersona(personas[selectedIndex]);
      updatePersonaList();
      logBox.add(
        `{green-fg}Persona alterada para: ${personas[selectedIndex].name}{/}`
      );
      screen.render();
    }
  });

  // Eventos
  controlBox.on("select", async (item, index) => {
    setCurrentPersona(personas[index]);
    updatePersonaList();
    logBox.add(`{green-fg}Persona alterada para: ${personas[index].name}{/}`);
    screen.render();
  });

  applyButton.on("press", () => {
    const newName = botNameBox.getValue();
    setBotName(newName);
    logBox.add(`{green-fg}Nome da IA alterado para: ${newName}{/}`);
    botNameBox.setContent(newName);
    screen.render();
  });

  restartButton.on("press", () => {
    logBox.add("{yellow-fg}Reiniciando o bot...{/}");
    screen.render();
    // Emitir evento para reiniciar o bot
    process.emit("restartBot");
  });

  addPersonaBtn.on("press", async () => {
    const name = personaName.getValue();
    const prompt = personaPrompt.getValue();

    if (name && prompt) {
      personas.push({ name, prompt });
      await savePersonas(personas);
      updatePersonaList();
      logBox.add(`{green-fg}Persona adicionada: ${name}{/}`);
      personaName.clearValue();
      personaPrompt.clearValue();
      screen.render();
    }
  });

  removePersonaBtn.on("press", async () => {
    if (personas.length > 1) {
      const index = controlBox.selected;
      const removed = personas.splice(index, 1)[0];
      await savePersonas(personas);
      updatePersonaList();
      logBox.add(`{red-fg}Persona removida: ${removed.name}{/}`);
      screen.render();
    } else {
      logBox.add("{red-fg}Erro: Deve haver pelo menos uma persona{/}");
      screen.render();
    }
  });

  return {
    screen,
    render: () => {
      screen.render();
      focusElement(0);
    },
    updateStatus: (text, color = "green") => {
      statusBox.setContent(`{bold}${text}{/bold}`);
      statusBox.style.bg = color;
      screen.render();
    },

    updateStats: (stats) => {
      statsTable.setData({
        headers: ["Métrica", "Valor"],
        data: [
          ["Mensagens Recebidas", stats.received.toString()],
          ["Respostas Enviadas", stats.sent.toString()],
          ["Erros", stats.errors.toString()],
          ["Sessões Ativas", stats.sessions.toString()],
        ],
      });
      screen.render();
    },

    addLog: (text, type = "info") => {
      const colors = {
        info: "{blue-fg}",
        success: "{green-fg}",
        warn: "{yellow-fg}",
        error: "{red-fg}",
      };

      logBox.add(
        `${colors[type]}[${new Date().toLocaleTimeString()}]{/} ${text}`
      );
      screen.render();
    },

    addMessage: (from, text) => {
      const shortFrom = from.includes('@') ? from.split('@')[0] : from;
      const shortText = text.length > 35 ? text.substring(0, 35) + "..." : text;

      lastMessages.push([shortFrom, shortText]);
      if (lastMessages.length > 5) lastMessages.shift();

      if (text.length > 35) {
        if (text.includes("Cardápio")) {
          shortText = "Solicitou cardápio";
        } else if (text.includes("•")) {
          shortText = "Selecionou item do menu";
        } else {
          shortText = text.substring(0, 35) + "...";
        }
      }

      messageTable.setData({
        headers: ["Remetente", "Mensagem"],
        data: lastMessages,
      });

      screen.render();
    },

    getCurrentPersona: () => getCurrentPersona(),
  };
}
