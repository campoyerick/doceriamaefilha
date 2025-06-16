import { Queue } from 'bullmq';

export const messageQueue = new Queue('messageQueue', {
  connection: {
    host: 'localhost',
    port: 6379
  },
  limiter: {
    max: 10,       // Máximo de 10 mensagens por segundo
    duration: 1000 // Em 1 segundo
  }
});