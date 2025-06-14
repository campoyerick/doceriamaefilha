import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "./config.js";

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const conversationHistory = new Map();

export async function generateReply(prompt, userId, personaPrompt) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }

  const history = conversationHistory.get(userId);

  // Se for a primeira mensagem, adicionar o prompt da persona
  if (history.length === 0) {
    history.push({ role: 'user', parts: [{ text: personaPrompt }] });
    history.push({ role: 'model', parts: [{ text: 'Entendido, vou atuar conforme as instruções' }] });
  }

  history.push({ role: 'user', parts: [{ text: prompt }] });

  try {
    const model = genAI.getGenerativeModel({ 
      model: config.GEMINI_MODEL || "gemini-1.5-flash-latest"
    });
    
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const reply = response.text();

    history.push({ role: 'model', parts: [{ text: reply }] });

    return reply;
  } catch (err) {
    throw new Error(`Erro na Gemini: ${err.message}`);
  }
}

// Limpar histórico de conversa
export function clearConversation(userId) {
  conversationHistory.delete(userId);
}