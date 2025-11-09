<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1bQEggaTxVL2lIM9hg_N5-OsOX7HxYWJJ

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Integração com Supabase

Para ativar o Supabase (autenticação e banco de dados):

1) Instale as dependências:

```
npm i @supabase/supabase-js
```

2) Configure variáveis no ambiente do Vite. Use `.env` baseado em `.env.example`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

3) Tabelas sugeridas (SQL). Crie em seu projeto Supabase:

```sql
create table if not exists transactions (
  id text primary key,
  description text,
  date date,
  amount numeric,
  category text,
  subcategory text,
  type text,
  paymentMethod text,
  notes text
);

create table if not exists recurring_transactions (
  id text primary key,
  description text,
  amount numeric,
  frequency text,
  nextDate date,
  category text,
  subcategory text,
  type text
);

create table if not exists bills (
  id text primary key,
  description text,
  dueDay int,
  isAutoDebit boolean default false,
  amount numeric,
  category text,
  subcategory text
);

create table if not exists payslips (
  id text primary key,
  month int,
  year int,
  netTotal numeric,
  grossTotal numeric,
  deductionsTotal numeric,
  payments jsonb,
  deductions jsonb
);

-- Regras de RLS: habilite e permita leitura/escrita ao usuário autenticado se desejar.
```

4) Código
- `lib/supabase.ts`: inicializa o cliente usando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `lib/db.ts`: helpers para `fetchAll`, `bulkUpsert` e autenticação (`signInWithEmailLink`, `signOut`, `getSession`).

5) Uso básico

```ts
import db, { signInWithEmailLink, getSession, signOut } from '@/lib/db';

// login por magic link
await signInWithEmailLink('seu@email.com');

// obter dados
const tx = await db.fetchTransactions();

// salvar dados
await db.upsertTransactions(tx);
```

Observação: a aplicação atual carrega dados via `localStorage`. A coordenação com Supabase pode ser feita sincronizando no `useEffect` após alterações ou migrando fonte de dados primária conforme necessidade.
