const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Banco de dados em memória (substitua por um banco real em produção)
let orders = [];

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer);

  // API para receber pedidos do bot
  server.post('/api/orders', express.json(), (req, res) => {
    const order = req.body;
    orders.push(order);
    
    // Enviar atualização via Socket.IO
    io.emit('new-order', order);
    
    res.status(201).json({ success: true });
  });

  // API para listar pedidos
  server.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  // API para atualizar status do pedido
  server.put('/api/orders/:id', express.json(), (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      io.emit('update-order', orders[orderIndex]);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Pedido não encontrado' });
    }
  });

  // Next.js handle all other requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado ao painel');
    
    socket.on('disconnect', () => {
      console.log('Cliente desconectado do painel');
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Painel pronto em http://localhost:${PORT}`);
  });
});