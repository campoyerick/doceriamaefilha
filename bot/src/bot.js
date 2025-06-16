import whatsapp from "whatsapp-web.js";
const { Client, LocalAuth } = whatsapp;
import qrcode from "qrcode";
import { generateReply } from "./ai.js";
import { getCurrentPersona } from "./personaManager.js";
import axios from 'axios';

// Estado global para estatísticas
const stats = {
  received: 0,
  sent: 0,
  errors: 0,
  sessions: 0
};

// Sistema de filas em memória
class MemoryQueue {
  constructor(concurrency = 5, rateLimit = 10) {
    this.queue = [];
    this.concurrency = concurrency;
    this.rateLimit = rateLimit; // Mensagens por segundo
    this.activeCount = 0;
    this.lastProcessed = Date.now();
  }

  add(task) {
    this.queue.push(task);
    this.process();
  }

  async process() {
    if (this.activeCount >= this.concurrency || this.queue.length === 0) return;
    
    // Rate limiting
    const now = Date.now();
    const elapsed = now - this.lastProcessed;
    const minInterval = 1000 / this.rateLimit;
    
    if (elapsed < minInterval) {
      setTimeout(() => this.process(), minInterval - elapsed);
      return;
    }

    this.activeCount++;
    this.lastProcessed = now;
    
    const task = this.queue.shift();
    try {
      await task();
    } catch (error) {
      console.error('Error processing task:', error);
    } finally {
      this.activeCount--;
      this.process();
    }
  }
}

export function startBot(dashboard, showDashboard) {
  stats.sessions++;
  
  // Configuração da fila com 5 workers e limite de 10 msg/seg
  const messageQueue = new MemoryQueue(5, 10);
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "bianca-session",
    }),
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    }
  });

  // Função para enviar pedido ao painel
  const sendOrderToDashboard = async (order) => {
    try {
      await axios.post('http://localhost:3000/api/orders', order);
      dashboard.addLog(`Pedido enviado para o painel: ${order.customerName}`);
    } catch (err) {
      dashboard.addLog(`Erro ao enviar pedido: ${err.message}`, 'error');
    }
  };

  // Função para processar mensagens
  const processMessage = async (message, dashboard) => {
    const userId = message.from;
    stats.received++;
    dashboard.updateStats(stats);
    dashboard.addMessage(userId, message.body);
    dashboard.addLog(`Processando: ${userId}: ${message.body}`);

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
        await client.sendMessage(userId, reply);
        stats.sent++;
        dashboard.updateStats(stats);
        dashboard.addLog(`Resposta enviada para ${userId}`, 'success');
        
        // Detecção de pedido concluído
        if (message.body.toLowerCase().includes('comprovante') && message.hasMedia) {
          const order = {
            id: `PED-${Date.now()}`,
            timestamp: new Date().toISOString(),
            customerId: userId,
            customerName: "Cliente WhatsApp",
            customerPhone: userId.split('@')[0],
            items: ["Pedido via WhatsApp"],
            total: 0,
            deliveryDate: "A definir",
            status: "pending",
            paymentMethod: "PIX",
            note: "Comprovante enviado"
          };
          await sendOrderToDashboard(order);
        }
      } else {
        dashboard.addLog(`Resposta vazia para ${userId}`, 'warn');
      }
    } catch (err) {
      stats.errors++;
      dashboard.updateStats(stats);
      dashboard.addLog(`Erro ao responder: ${err.message}`, 'error');
      
      try {
        await client.sendMessage(userId, "Ocorreu um erro ao processar sua mensagem 😞");
      } catch (sendError) {
        dashboard.addLog(`Falha ao enviar mensagem de erro: ${sendError.message}`, 'error');
      }
    }
  };

  client.on("qr", async (qr) => {
    dashboard.addLog('QR Code gerado, aguardando leitura', 'warn');
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
    
    // Adicionar mensagem à fila para processamento assíncrono
    messageQueue.add(async () => {
      const media = message.hasMedia ? await message.downloadMedia() : null;
      await processMessage({
        body: message.body,
        from: message.from,
        hasMedia: message.hasMedia,
        media
      }, dashboard);
    });
  });

  client.on("disconnected", (reason) => {
    dashboard.updateStatus(`Desconectado: ${reason}`, 'red');
    dashboard.addLog(`Cliente desconectado: ${reason}`, 'error');
    setTimeout(() => {
      dashboard.addLog('Tentando reconectar...', 'warn');
      startBot(dashboard, showDashboard);
    }, 10000);
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