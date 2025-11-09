// Lightweight OCR helpers using tesseract.js with lazy loading.
// If tesseract.js is not installed, calls will throw an informative error.

const MONTHS_PT = [
  'janeiro','fevereiro','março','marco','abril','maio','junho',
  'julho','agosto','setembro','outubro','novembro','dezembro'
];

function normalizeMoney(brStr: string): number {
  // Convert Brazilian format like 1.234,56 to 1234.56
  const cleaned = brStr.replace(/[^0-9,\.]/g, '')
    .replace(/\./g, '')
    .replace(/,(\d{2})$/, '.$1');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

async function preprocessImageDataUrl(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxWidth = 1800;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.floor(img.width * scale);
      const height = Math.floor(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context não disponível'));
      // Um leve ajuste de contraste/claridade ajuda o OCR em capturas de tela
      // Sem custo alto de CPU
      (ctx as any).filter = 'contrast(1.15) brightness(1.05)';
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}

export async function recognizeTextFromDataUrl(dataUrl: string, lang: string = 'por'): Promise<string> {
  try {
    const Tesseract: any = await import('tesseract.js');
    // Pré-processar para melhorar contraste e reduzir tamanho
    const canvas = await preprocessImageDataUrl(dataUrl);
    // Tentar português primeiro
    try {
      const result = await Tesseract.recognize(canvas, lang);
      return result?.data?.text || '';
    } catch (primaryErr) {
      console.warn('Reconhecimento em "por" falhou, tentando "eng"...', primaryErr);
      const resultEng = await Tesseract.recognize(canvas, 'eng');
      return resultEng?.data?.text || '';
    }
  } catch (e) {
    console.error('OCR fallback indisponível (tesseract.js).', e);
    throw new Error('OCR indisponível: instale "tesseract.js" para usar o fallback.');
  }
}

// Structured OCR: retorna linhas com bounding boxes para separar colunas
export async function recognizePayslip(dataUrl: string, lang: string = 'por'): Promise<{ text: string; lines: any[] }>{
  const Tesseract: any = await import('tesseract.js');
  const canvas = await preprocessImageDataUrl(dataUrl);
  let result: any;
  try {
    result = await Tesseract.recognize(canvas, lang);
  } catch {
    result = await Tesseract.recognize(canvas, 'eng');
  }
  const text = result?.data?.text || '';
  const lines = result?.data?.lines || [];
  return { text, lines };
}

export function parsePayslipFromText(text: string): {
  month: number;
  year: number;
  payments: { description: string; value: number }[];
  deductions: { description: string; value: number }[];
  grossTotal: number;
  deductionsTotal: number;
  netTotal: number;
} {
  const lower = text.toLowerCase();

  // Detect month/year
  let month = 0;
  for (let i = 0; i < MONTHS_PT.length; i++) {
    if (lower.includes(MONTHS_PT[i])) { month = i + 1; break; }
  }
  const yearMatch = lower.match(/\b(20\d{2})\b/);
  let year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  const lines = text.split(/\r?\n/).map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);

  const payments: { description: string; value: number }[] = [];
  const deductions: { description: string; value: number }[] = [];

  // Helpers
  const currencyRegex = /(?:(?:\d{1,3}(?:[\.\s]\d{3})*|\d+),(?:\d{2}))/g; // 27.577,06
  const isDeductionKeyword = (desc: string) => /\b(pens|pensão|irrf|imp\s*renda|irpf|fusma|depdir|descont|taxa|mensal|deduz|imposto|consign|emprest|inss|fgts)\b/i.test(desc);

  // Extração específica de "Mês de Pagamento: Agosto / 2025"
  const monthYearMatch = text.match(/M[êe]s\s+de\s+Pagamento\s*[:\-]?\s*([A-Za-zçã]+)\s*[\/\-]?\s*(\d{4})/i);
  if (monthYearMatch) {
    const mStr = monthYearMatch[1].toLowerCase();
    const yStr = monthYearMatch[2];
    const idx = MONTHS_PT.findIndex(m => m === mStr);
    if (idx >= 0) {
      month = idx + 1;
    }
    if (/^20\d{2}$/.test(yStr)) {
      year = parseInt(yStr, 10);
    }
  }

  // Parser mais tolerante: considerar qualquer linha com valores como item,
  // ignorando cabeçalhos e áreas de totais
  let seenHeader = false;
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (/descri[cç][aã]o/.test(lowerLine) && /pagamentos/.test(lowerLine)) {
      seenHeader = true;
      continue;
    }
    if (/^totais\b/i.test(line) || /total\s+l[ií]quido/i.test(line)) {
      // Não tratar linhas de totais como itens
      continue;
    }
    if (/c[oó]digo\s+de\s+autentica[cç][aã]o/i.test(lowerLine)) {
      continue;
    }

    const amounts = Array.from(line.matchAll(currencyRegex)).map(m => m[0]);
    if (amounts.length === 0) continue;

    // Descrição: tudo antes do primeiro valor
    const firstAmountIndex = line.indexOf(amounts[0]);
    let description = line.substring(0, firstAmountIndex).trim();
    description = description.replace(/\b(cc|oc|om|dep|ac|moeda|estado|par[aâ]metros)\b.*$/i, '').trim();
    if (!description) {
      // Se não viu cabeçalho, mas a linha tem valores, ainda assim registrar
      description = 'Item';
    }

    if (amounts.length >= 2) {
      payments.push({ description, value: normalizeMoney(amounts[0]) });
      deductions.push({ description, value: normalizeMoney(amounts[1]) });
    } else {
      const val = normalizeMoney(amounts[0]);
      if (isDeductionKeyword(description)) {
        deductions.push({ description, value: val });
      } else {
        payments.push({ description, value: val });
      }
    }
  }

  // Totals parsing: search lines containing Totais or Total líquido
  let grossTotal = 0, deductionsTotal = 0, netTotal = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/totais\s+em\s*r\$/i.test(lines[i]) || /^totais\b/i.test(lines[i])) {
      const bucket: number[] = [];
      for (let j = i; j < Math.min(i + 6, lines.length); j++) {
        const nums = Array.from(lines[j].matchAll(currencyRegex)).map(m => normalizeMoney(m[0]));
        bucket.push(...nums);
        if (bucket.length >= 3) break;
      }
      if (bucket.length >= 3) {
        grossTotal = bucket[0];
        deductionsTotal = bucket[1];
        netTotal = bucket[2];
        break;
      }
    }
    if (/total\s+l[ií]quido/i.test(lines[i])) {
      const nums = Array.from(lines[i].matchAll(currencyRegex)).map(m => normalizeMoney(m[0]));
      if (nums.length > 0) {
        netTotal = nums[nums.length - 1];
      }
    }
  }

  // Compute totals if missing
  if (!grossTotal) grossTotal = payments.reduce((a, b) => a + b.value, 0);
  if (!deductionsTotal) deductionsTotal = deductions.reduce((a, b) => a + b.value, 0);
  if (!netTotal) netTotal = Math.max(0, grossTotal - deductionsTotal);

  return {
    month: month || new Date().getMonth() + 1,
    year,
    payments,
    deductions,
    grossTotal,
    deductionsTotal,
    netTotal,
  };
}

// Parser usando posições de palavras para separar "Pagamentos" de "Descontos"
export function parsePayslipFromStructured(ocrLines: any[], fallbackText: string): {
  month: number;
  year: number;
  payments: { description: string; value: number }[];
  deductions: { description: string; value: number }[];
  grossTotal: number;
  deductionsTotal: number;
  netTotal: number;
} {
  const currencyRegex = /(?:(?:\d{1,3}(?:[\.\s]\d{3})*|\d+),(?:\d{2}))/;
  const payments: { description: string; value: number }[] = [];
  const deductions: { description: string; value: number }[] = [];

  // Encontrar linha de cabeçalho com as colunas
  let headerY = -1;
  let paymentX = -1;
  let discountX = -1;
  for (const ln of ocrLines || []) {
    const text = (ln?.text || '').toLowerCase();
    if (text.includes('descri') && text.includes('pagament') && text.includes('descont')) {
      headerY = ln?.bbox?.y1 ?? ln?.bbox?.y0 ?? 0;
      const words = ln?.words || [];
      for (const w of words) {
        const wt = (w?.text || '').toLowerCase();
        const cx = w?.bbox ? (w.bbox.x0 + w.bbox.x1) / 2 : -1;
        if (wt.startsWith('pagament')) paymentX = cx;
        if (wt.startsWith('descont')) discountX = cx;
      }
      break;
    }
  }

  // Se não achar cabeçalho, tenta clusters de valores como fallback
  if (paymentX < 0 || discountX < 0) {
    const xs: number[] = [];
    for (const ln of ocrLines || []) {
      const words = ln?.words || [];
      for (const w of words) {
        const tx = String(w?.text || '');
        if (currencyRegex.test(tx)) {
          const cx = w?.bbox ? (w.bbox.x0 + w.bbox.x1) / 2 : -1;
          if (cx >= 0) xs.push(cx);
        }
      }
    }
    if (xs.length >= 2) {
      xs.sort((a,b) => a-b);
      const mid = Math.floor(xs.length/2);
      paymentX = xs.slice(0, mid).reduce((a,b)=>a+b,0) / Math.max(1, mid);
      discountX = xs.slice(mid).reduce((a,b)=>a+b,0) / Math.max(1, xs.length - mid);
    }
  }

  // Processar linhas abaixo do cabeçalho
  for (const ln of ocrLines || []) {
    const yTop = ln?.bbox?.y0 ?? 0;
    if (headerY >= 0 && yTop <= headerY) continue; // acima do cabeçalho
    const words = ln?.words || [];
    if (!words || words.length === 0) continue;
    const amounts = words.filter((w: any) => currencyRegex.test(String(w?.text || '')));
    if (amounts.length === 0) continue;

    const cxAmounts = amounts.map((w: any) => ({ cx: (w.bbox.x0 + w.bbox.x1)/2, text: String(w.text) }));
    const descWords = words.filter((w: any) => {
      const cx = w?.bbox ? (w.bbox.x0 + w.bbox.x1)/2 : -1;
      return cx >= 0 && (paymentX < 0 || cx < paymentX - 10) && !currencyRegex.test(String(w?.text || ''));
    }).map((w: any) => String(w.text));
    const description = descWords.join(' ').trim() || 'Item';

    for (const am of cxAmounts) {
      const val = normalizeMoney(am.text);
      if (paymentX >= 0 && discountX >= 0) {
        const dPay = Math.abs(am.cx - paymentX);
        const dDisc = Math.abs(am.cx - discountX);
        if (dPay <= dDisc) {
          payments.push({ description, value: val });
        } else {
          deductions.push({ description, value: val });
        }
      } else {
        if (/\b(pens|pensão|irrf|imp\s*renda|irpf|fusma|depdir|descont)\b/i.test(description)) {
          deductions.push({ description, value: val });
        } else {
          payments.push({ description, value: val });
        }
      }
    }
  }

  // Totais: procurar linha que contenha "Totais" ou "Total líquido"
  let grossTotal = 0, deductionsTotal = 0, netTotal = 0;
  for (const ln of ocrLines || []) {
    const text = String(ln?.text || '');
    if (/totais\s+em\s*r\$/i.test(text) || /^totais\b/i.test(text)) {
      const nums = (ln?.words || [])
        .map((w: any) => String(w?.text || ''))
        .filter((t: string) => /\d+[\.,]\d{2}/.test(t))
        .map((t: string) => normalizeMoney(t));
      if (nums.length >= 3) {
        grossTotal = nums[0];
        deductionsTotal = nums[1];
        netTotal = nums[2];
        break;
      }
    }
    if (/total\s+l[ií]quido/i.test(text)) {
      const nums = (ln?.words || [])
        .map((w: any) => String(w?.text || ''))
        .filter((t: string) => /\d+[\.,]\d{2}/.test(t))
        .map((t: string) => normalizeMoney(t));
      if (nums.length > 0) netTotal = nums[nums.length - 1];
    }
  }

  if (!grossTotal) grossTotal = payments.reduce((a,b) => a + b.value, 0);
  if (!deductionsTotal) deductionsTotal = deductions.reduce((a,b) => a + b.value, 0);
  if (!netTotal) netTotal = Math.max(0, grossTotal - deductionsTotal);

  // Mês/Ano a partir do texto de fallback
  const lower = fallbackText.toLowerCase();
  let month = 0;
  for (let i = 0; i < MONTHS_PT.length; i++) {
    if (lower.includes(MONTHS_PT[i])) { month = i + 1; break; }
  }
  const monthYearMatch = fallbackText.match(/M[êe]s\s+de\s+Pagamento\s*[:\-]?\s*([A-Za-zçã]+)\s*[\/\-]?\s*(\d{4})/i);
  if (monthYearMatch) {
    const mStr = monthYearMatch[1].toLowerCase();
    const idx = MONTHS_PT.findIndex(m => m === mStr);
    if (idx >= 0) month = idx + 1;
  }
  const yearMatch = lower.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  return {
    month: month || new Date().getMonth() + 1,
    year,
    payments,
    deductions,
    grossTotal,
    deductionsTotal,
    netTotal,
  };
}
