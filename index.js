import { createDashboard } from './src/dashboard.js';
import { startBot } from './src/bot.js';
import blessed from 'blessed';

async function main() {
  // Criação inicial da tela de espera
  const loadingScreen = blessed.screen({
    smartCSR: true,
    title: 'Carregando Bianca Bot...',
    fullUnicode: true
  });

  const loadingBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '50%',
    height: '5',
    content: '{bold}Aguardando conexão com WhatsApp...{/bold}\n\nPor favor, escaneie o QR Code que aparecerá no terminal.',
    tags: true,
    align: 'center',
    valign: 'middle',
    style: {
      fg: 'white',
      bg: 'blue',
      border: { fg: '#f0f0f0' }
    }
  });

  loadingScreen.append(loadingBox);
  loadingScreen.render();

  // Cria o dashboard mas não exibe ainda
  const dashboard = await createDashboard();
  
  // Variável para controlar se o dashboard já foi mostrado
  let dashboardShown = false;

  // Função para exibir o dashboard quando estiver pronto
  const showDashboard = () => {
    if (!dashboardShown) {
      loadingScreen.destroy();
      dashboard.render(); // Chama a função render do dashboard
      dashboardShown = true;
    }
  };

  // Inicia o bot passando o dashboard e a função de exibição
  const stopBot = startBot(dashboard, showDashboard);

  // Evento para reiniciar o bot
  process.on('restartBot', () => {
    stopBot();
    if (dashboardShown) {
      dashboard.screen.destroy();
    } else {
      loadingScreen.destroy();
    }
    main(); // Reinicia o processo
  });
}

main();