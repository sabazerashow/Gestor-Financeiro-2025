import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// Removido uso direto do SDK; usaremos chamada REST com fetch

dotenv.config({ path: process.env.SERVER_ENV_PATH || '.env.server.local' });
dotenv.config(); // fallback to .env

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const APP_ACCESS_TOKEN = process.env.APP_ACCESS_TOKEN || null;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY não definido. Configure no ambiente do servidor.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

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
      contents: [{ role: 'user', parts: [{ text: contents }]}],
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
    } catch {}
    return res.json({ text });
  } catch (err) {
    console.error('Erro no /api/ai/generate:', err);
    return res.status(500).json({ error: 'Falha ao gerar conteúdo' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend de IA rodando em http://localhost:${PORT}`);
});
