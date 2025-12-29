import { createClient } from '@supabase/supabase-js';

// Helper to clean environment variables (trims spaces and removes surrounding quotes)
const cleanEnvVar = (val: string | undefined) => {
  if (!val) return undefined;
  return val.trim().replace(/^["']|["']$/g, '');
};

// Vite expõe variáveis com prefixo VITE_ no client
const supabaseUrl = cleanEnvVar(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const supabaseAnonKey = cleanEnvVar(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

// Flag para desabilitar autenticação (bypass). Por padrão, desabilita em localhost.
const rawDisable = (import.meta as any).env?.VITE_AUTH_DISABLED as string | undefined;
const isLocalhost = typeof window !== 'undefined' && window.location?.hostname === 'localhost';
export const isAuthDisabled = rawDisable
  ? ['1', 'true', 'yes', 'on'].includes(String(rawDisable).toLowerCase())
  : false; // Ativado por padrão para permitir login no localhost

// Disponibilidade do Supabase
export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

// Auth ativa somente se supabase estiver configurado e não estiver desabilitada
export const isAuthActive = isSupabaseEnabled && !isAuthDisabled;

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as any);

export default supabase;
