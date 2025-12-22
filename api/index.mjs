import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Note: In Vercel, environment variables are available via process.env directly.
// We don't need to load .env files manually.

const cleanKey = (k) => (k || '').trim().replace(/^["']|["']$/g, '');

const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY);
const DEEPSEEK_API_KEY = cleanKey(process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY);
const APP_ACCESS_TOKEN = process.env.APP_ACCESS_TOKEN || null;

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

// Optional simple auth
app.use('/api/', (req, res, next) => {
    if (!APP_ACCESS_TOKEN) return next();
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    if (!token || token !== APP_ACCESS_TOKEN) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    next();
});

// AI Generate (Gemini)
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { model = 'gemini-1.5-flash', contents, expectJson = false } = req.body || {};
        if (!contents) return res.status(400).json({ error: 'contents é obrigatório' });

        const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`;
        const body = {
            contents: [{ role: 'user', parts: [{ text: contents }] }],
            generationConfig: expectJson ? { response_mime_type: 'application/json' } : undefined,
        };

        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!resp.ok) {
            const errText = await resp.text();
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
        return res.status(500).json({ error: 'Falha ao gerar conteúdo' });
    }
});

// DeepSeek
app.post('/api/ai/deepseek', async (req, res) => {
    try {
        if (!DEEPSEEK_API_KEY) return res.status(500).json({ error: 'DEEPSEEK_API_KEY não configurado' });

        const { model = 'deepseek-chat', messages, temperature = 0.7, max_tokens = 1000 } = req.body || {};
        if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages é obrigatório' });

        const resp = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({ model, messages, temperature, max_tokens })
        });

        if (!resp.ok) {
            const errText = await resp.text();
            return res.status(resp.status).json({ error: `DeepSeek Provider Error: ${errText}` });
        }
        const data = await resp.json();
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ error: `Erro interno: ${err.message}` });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        vercel: true,
        config: {
            gemini: !!GEMINI_API_KEY,
            deepseek: !!DEEPSEEK_API_KEY
        }
    });
});

export default app;
