import React, { useState } from 'react';
import { signInWithGithub, signInWithEmail, signUpWithEmail } from '@/lib/db';

interface AuthGateProps {
  onSignedIn?: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onSignedIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        alert('Cadastro realizado! Se necessário, verifique seu e-mail.');
      }
      onSignedIn?.();
    } catch (e: any) {
      setError(e?.message || 'Falha na autenticação');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGithub = async () => {
    try {
      await signInWithGithub();
      onSignedIn?.();
    } catch (e) {
      alert('Falha ao iniciar login com GitHub');
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <div className="w-full max-w-md rounded-xl shadow-2xl p-8 bg-[var(--card)] border border-[var(--border)]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[var(--primary)]/10 mb-4">
            <i className="fas fa-wallet text-[var(--primary)] text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Pilot</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            {isLogin ? 'Bem-vindo de volta! Entre na sua conta.' : 'Crie sua conta e comece a pilotar suas finanças.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-[var(--destructive)]/10 text-[var(--destructive)] text-sm border border-[var(--destructive)]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 opacity-80">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 opacity-80">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-lg shadow-[var(--primary)]/20"
          >
            {loading ? (
              <i className="fas fa-circle-notch animate-spin mr-2"></i>
            ) : null}
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <span className="bg-[var(--card)] px-4 text-[var(--muted-foreground)] text-xs uppercase tracking-widest relative z-10">ou continue com</span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--border)] -z-0"></div>
        </div>

        <button
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[var(--border)] rounded-lg hover:bg-[var(--surface)] transition-colors active:scale-[0.98]"
          onClick={handleGithub}
        >
          <i className="fab fa-github text-xl"></i>
          <span className="text-sm font-medium">GitHub</span>
        </button>

        <div className="mt-8 text-center text-sm">
          <span className="text-[var(--muted-foreground)]">
            {isLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}
          </span>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1.5 font-bold text-[var(--primary)] hover:underline"
          >
            {isLogin ? 'Cadastre-se' : 'Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
