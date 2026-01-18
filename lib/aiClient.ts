export type GenerateRequest = {
  model?: string;
  contents: any;
  expectJson?: boolean;
  config?: Record<string, any>;
};

export type GLMRequest = {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
};

async function extractApiErrorMessage(res: Response, defaultMessage: string) {
  const cloned = res.clone();
  const statusHint = `${res.status}${res.statusText ? ` ${res.statusText}` : ''}`.trim();

  let bodyText = '';
  try {
    bodyText = (await cloned.text())?.trim() || '';
  } catch { }

  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText);
      if (parsed && typeof parsed === 'object' && typeof parsed.error === 'string' && parsed.error.trim()) {
        return parsed.error.trim();
      }
    } catch { }

    if (/ECONNREFUSED|connect\s+ECONNREFUSED|proxy error/i.test(bodyText)) {
      return 'Backend de IA indisponível. Inicie o servidor na porta 4000 (npm run dev).';
    }

    return bodyText;
  }

  return `${defaultMessage}${statusHint ? ` (${statusHint})` : ''}`;
}

export async function generateContent(req: GenerateRequest, options?: { token?: string }) {
  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errorMessage = await extractApiErrorMessage(res, 'Falha ao chamar IA');
    console.error(`AI Client Gemini Error [${res.status}]:`, errorMessage);
    throw new Error(errorMessage);
  }
  const data = await res.json();
  return data as { text: string };
}

export async function generateDeepSeekContent(req: GLMRequest, options?: { token?: string }) {
  const res = await fetch('/api/ai/deepseek', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errorMessage = await extractApiErrorMessage(res, 'Falha ao chamar DeepSeek API');
    console.error(`AI Client DeepSeek Error [${res.status}]:`, errorMessage);
    throw new Error(errorMessage);
  }
  const data = await res.json();
  return data;
}

export function cleanJsonString(s: string): string {
  return s.replace(/```json/g, '').replace(/```/g, '').trim();
}

