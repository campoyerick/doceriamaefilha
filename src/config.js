import dotenv from 'dotenv';
dotenv.config();

export default {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: 'gemini-2.0-flash',
  WHATSAPP_SESSION_FILE: './session.json',
};
