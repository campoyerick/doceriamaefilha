import { STORE_INFO } from './personaManager.js';

class OrderManager {
  constructor() {
    this.ongoingOrders = new Map();
  }

  startOrder(userId) {
    this.ongoingOrders.set(userId, {
      step: 0,
      data: {}
    });
    return this.getNextQuestion(userId);
  }

  getNextQuestion(userId) {
    const order = this.ongoingOrders.get(userId);
    if (!order) return null;

    const questions = [
      "Por favor, me informe o seu nome completo:",
      "Qual a data e horário de entrega? (Ex: 25/12 às 15h)",
      "Qual o tamanho do bolo? (Ex: 2kg)",
      "Qual o sabor principal do bolo?",
      "Alguma decoração especial? (Descreva ou envie uma foto)",
      "Endereço completo para entrega:",
      "Forma de pagamento: (PIX ou pessoalmente)"
    ];

    if (order.step < questions.length) {
      return questions[order.step];
    }
    return null;
  }

  processAnswer(userId, answer) {
    const order = this.ongoingOrders.get(userId);
    if (!order) return null;

    const fields = [
      'name',
      'deliveryTime',
      'size',
      'flavor',
      'decoration',
      'address',
      'paymentMethod'
    ];

    order.data[fields[order.step]] = answer;
    order.step++;

    return this.getNextQuestion(userId);
  }

  completeOrder(userId) {
    const order = this.ongoingOrders.get(userId);
    if (!order) return null;
    
    const orderData = order.data;
    this.ongoingOrders.delete(userId);
    
    return {
      ...orderData,
      userId,
      timestamp: new Date().toISOString()
    };
  }

  getStoreInfo() {
    return STORE_INFO;
  }

  formatOrderMessage(order) {
    return `*NOVO PEDIDO CONCLUÍDO* 🎂\n\n` +
      `*Cliente:* ${order.name}\n` +
      `*Contato:* ${order.userId.split('@')[0]}\n` +
      `*Entrega:* ${order.deliveryTime}\n` +
      `*Tamanho:* ${order.size}\n` +
      `*Sabor:* ${order.flavor}\n` +
      `*Decoração:* ${order.decoration || 'Padrão'}\n` +
      `*Endereço:* ${order.address}\n` +
      `*Pagamento:* ${order.paymentMethod}\n\n` +
      `_Pedido recebido em ${new Date().toLocaleString()}_`;
  }
}

export const orderManager = new OrderManager();