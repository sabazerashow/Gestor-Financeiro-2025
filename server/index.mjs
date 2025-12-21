import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// Removido uso direto do SDK; usaremos chamada REST com fetch

dotenv.config({ path: '.env.server.local' });
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

const cleanKey = (k) => (k || '').trim().replace(/^["']|["']$/g, '');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY);
const DEEPSEEK_API_KEY = cleanKey(process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY);
const APP_ACCESS_TOKEN = process.env.APP_ACCESS_TOKEN || null;

console.log('--- Configuração do Servidor de IA ---');
console.log(`Porta: ${PORT}`);
console.log(`Gemini Key: ${GEMINI_API_KEY ? 'Configurada ✅' : 'AUSENTE ❌'}`);
console.log(`DeepSeek Key: ${DEEPSEEK_API_KEY ? 'Configurada ✅' : 'AUSENTE ❌'}`);
console.log('--------------------------------------');

if (!GEMINI_API_KEY && !DEEPSEEK_API_KEY) {
  console.warn('⚠️ Nenhuma chave de API de IA configurada. O servidor pode falhar em chamadas de IA.');
}

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '5mb' })); // Aumentado para suportar contextos maiores
app.use(morgan('dev'));

// Rate limit: 20 req/min por IP
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

// Autenticação simples via Bearer opcional
app.use('/api/', (req, res, next) => {
  if (!APP_ACCESS_TOKEN) return next(); // sem auth em dev se não configurado
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!token || token !== APP_ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
});

// Usaremos a API REST do Generative Language com a chave na query string

// Endpoint genérico para geração de conteúdo
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { model = 'gemini-1.5-flash', contents, expectJson = false, config = {} } = req.body || {};

    if (!contents) return res.status(400).json({ error: 'contents é obrigatório' });

    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: contents }] }],
      generationConfig: expectJson ? { response_mime_type: 'application/json' } : undefined,
    };

    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`--- Erro Google AI [${resp.status}] ---`);
      console.error(errText);
      console.error('-----------------------------');
      return res.status(resp.status).json({ error: `IA Provider Error: ${errText}` });
    }
    const data = await resp.json();
    let text = '';
    try {
      const parts = data?.candidates?.[0]?.content?.parts || [];
      text = parts.map(p => p.text || '').join('\n');
    } catch { }
    return res.json({ text });
  } catch (err) {
    console.error('Erro no /api/ai/generate:', err);
    return res.status(500).json({ error: 'Falha ao gerar conteúdo' });
  }
});

// Endpoint para DeepSeek API
app.post('/api/ai/deepseek', async (req, res) => {
  try {
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY não configurado no servidor' });
    }

    const { model = 'deepseek-chat', messages, temperature = 0.7, max_tokens = 1000, stream = false } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages é obrigatório e deve ser um array' });
    }

    const url = 'https://api.deepseek.com/chat/completions';

    const body = {
      model,
      messages,
      temperature,
      max_tokens,
      stream
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`--- Erro DeepSeek API [${resp.status}] ---`);
      console.error(errText);
      console.error('---------------------------');
      return res.status(resp.status).json({ error: `DeepSeek Provider Error: ${errText}` });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err) {
    console.error('--- Erro Crítico no /api/ai/deepseek ---');
    console.error(err);
    if (err.response) {
      console.error('Response data:', await err.response.text());
    }
    console.error('------------------------------------------');
    return res.status(500).json({ error: `Erro interno no servidor de IA: ${err.message}` });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    node: process.version,
    config: {
      gemini: !!GEMINI_API_KEY,
      deepseek: !!DEEPSEEK_API_KEY
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend de IA rodando em http://0.0.0.0:${PORT}`);
});
