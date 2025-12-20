import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// Removido uso direto do SDK; usaremos chamada REST com fetch

dotenv.config({ path: process.env.SERVER_ENV_PATH || '.env.server.local' });
dotenv.config(); // fallback to .env

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
const GLM_API_KEY = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
const APP_ACCESS_TOKEN = process.env.APP_ACCESS_TOKEN || null;

console.log('--- Configuração do Servidor de IA ---');
console.log(`Porta: ${PORT}`);
console.log(`Gemini Key: ${GEMINI_API_KEY ? 'Configurada ✅' : 'AUSENTE ❌'}`);
console.log(`GLM Key: ${GLM_API_KEY ? 'Configurada ✅' : 'AUSENTE ❌'}`);
console.log('--------------------------------------');

if (!GEMINI_API_KEY && !GLM_API_KEY) {
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: contents }] }],
      generationConfig: expectJson ? { responseMimeType: 'application/json' } : undefined,
    };

    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Erro REST Generative:', errText);
      return res.status(500).json({ error: 'Falha ao gerar conteúdo' });
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

// Endpoint para GLM API
app.post('/api/ai/glm', async (req, res) => {
  try {
    if (!GLM_API_KEY) {
      return res.status(500).json({ error: 'GLM_API_KEY não configurado no servidor' });
    }

    const { model = 'glm-4', messages, temperature = 0.7, max_tokens = 1000 } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages é obrigatório e deve ser um array' });
    }

    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const body = {
      model,
      messages,
      temperature,
      max_tokens,
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Erro GLM API:', errText);
      return res.status(500).json({ error: 'Falha ao gerar conteúdo com GLM' });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err) {
    console.error('Erro no /api/ai/glm:', err);
    return res.status(500).json({ error: 'Falha ao gerar conteúdo com GLM' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend de IA rodando em http://localhost:${PORT}`);
});
