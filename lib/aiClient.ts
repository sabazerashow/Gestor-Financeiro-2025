export type GenerateRequest = {
  model?: string;
  contents: any;
  expectJson?: boolean;
  config?: Record<string, any>;
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
    const text = await res.text();
    throw new Error(text || 'Falha ao chamar IA');
  }
  const data = await res.json();
  return data as { text: string };
}

