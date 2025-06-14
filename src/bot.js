import whatsapp from "whatsapp-web.js";
const { Client, LocalAuth } = whatsapp;
import qrcode from "qrcode";
import { generateReply, clearConversation } from "./ai.js";
import { getCurrentPersona } from "./personaManager.js";

// Estado global para estatísticas
const stats = {
  received: 0,
  sent: 0,
  errors: 0,
  sessions: 0
};

export function startBot(dashboard, showDashboard) {
  stats.sessions++;
  
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "bianca-session",
    }),
    puppeteer: {
      args: ["--no-sandbox"],
    }
  });

  client.on("qr", async (qr) => {
    dashboard.addLog('QR Code gerado, aguardando leitura', 'warn');
    // Gerar QR Code como string
    const qrString = await new Promise((resolve, reject) => {
      qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
        if (err) reject(err);
        else resolve(url);
      });
    });
    console.log('QR Code para conexão:\n');
    console.log(qrString);
  });

  client.on("ready", () => {
    showDashboard();
    dashboard.updateStatus('Conectado e Pronto ⚡', 'green');
    dashboard.addLog('WhatsApp conectado com sucesso', 'success');
  });

  client.on("message", async (message) => {
    if (message.from === "status@broadcast" || message.fromMe) return;
    if (!message.body || message.body.trim() === "") return;

    const userId = message.from;
    stats.received++;
    dashboard.updateStats(stats);
    dashboard.addMessage(userId, message.body);
    dashboard.addLog(`Mensagem de ${userId}: ${message.body}`);

    try {
      // Obter persona atual
      const persona = dashboard.getCurrentPersona();
      
      // Gerar resposta usando a persona atual
      const reply = await generateReply(
        message.body, 
        userId,
        persona.prompt
      );
      
      if (reply && reply.trim() !== "") {
        await message.reply(reply);
        stats.sent++;
        dashboard.updateStats(stats);
        dashboard.addLog(`Resposta enviada para ${userId}`, 'success');
      } else {
        dashboard.addLog(`Resposta vazia para ${userId}`, 'warn');
      }
    } catch (err) {
      stats.errors++;
      dashboard.updateStats(stats);
      dashboard.addLog(`Erro ao responder: ${err.message}`, 'error');
      
      try {
        await message.reply("Ocorreu um erro ao processar sua mensagem 😞");
      } catch (sendError) {
        dashboard.addLog(`Falha ao enviar mensagem de erro: ${sendError.message}`, 'error');
      }
    }
  });

  client.on("disconnected", (reason) => {
    dashboard.updateStatus(`Desconectado: ${reason}`, 'red');
    dashboard.addLog(`Cliente desconectado: ${reason}`, 'error');
    setTimeout(() => {
      dashboard.addLog('Tentando reconectar...', 'warn');
      startBot(dashboard, showDashboard);
    }, 5000);
  });

  client.initialize();
  
  // Retornar função para parar o bot
  return () => {
    try {
      client.destroy();
      dashboard.addLog('Bot parado com sucesso', 'success');
    } catch (err) {
      dashboard.addLog(`Erro ao parar bot: ${err.message}`, 'error');
    }
  };
}