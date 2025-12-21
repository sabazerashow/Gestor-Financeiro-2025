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
    let errorMessage = 'Falha ao chamar IA';
    const resClone = res.clone();
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = await resClone.text() || errorMessage;
    }
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
    let errorMessage = 'Falha ao chamar DeepSeek API';
    const resClone = res.clone();
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = await resClone.text() || errorMessage;
    }
    console.error(`AI Client DeepSeek Error [${res.status}]:`, errorMessage);
    throw new Error(errorMessage);
  }
  const data = await res.json();
  return data;
}

export function cleanJsonString(s: string): string {
  return s.replace(/```json/g, '').replace(/```/g, '').trim();
}

