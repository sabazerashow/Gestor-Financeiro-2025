import { createClient } from '@supabase/supabase-js';

// Vite expõe variáveis com prefixo VITE_ no client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Evita crash em build quando variáveis não estão presentes;
// o consumidor pode checar se supabase está habilitado via isEnabled.
export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as any);

export default supabase;
