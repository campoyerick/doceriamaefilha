import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { customerId, orderId, newDateTime } = req.body;
  
  try {
    // Aqui você enviaria a mensagem para o bot principal
    // Em um sistema real, isso seria uma chamada para seu backend principal
    // ou diretamente para o serviço do bot
    
    // Simulação: enviar mensagem para o cliente via WhatsApp
    const message = `Seu pedido #${orderId} foi reagendado para ${newDateTime}. Por favor, confirme se este novo horário está ok.`;
    
    // Esta URL seria do seu backend principal que envia mensagens WhatsApp
    await axios.post('http://localhost:3001/api/send-message', {
      customerId,
      message
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao reagendar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}