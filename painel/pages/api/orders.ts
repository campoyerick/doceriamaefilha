import type { NextApiRequest, NextApiResponse } from 'next';

// Banco de dados em memória (substitua por um banco real em produção)
let orders: any[] = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const order = req.body;
    orders.push(order);
    return res.status(201).json({ success: true });
  }

  if (req.method === 'GET') {
    // Ordenar pedidos do mais recente para o mais antigo
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return res.status(200).json(sortedOrders);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      return res.json(orders[orderIndex]);
    }
    
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  res.status(405).end();
}