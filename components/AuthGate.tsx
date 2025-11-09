import React from 'react';
import { signInWithGoogle, signInWithEmailLink } from '@/lib/db';

interface AuthGateProps {
  onSignedIn?: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onSignedIn }) => {
  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      onSignedIn?.();
    } catch (e) {
      alert('Falha ao iniciar login com Google');
      console.error(e);
    }
  };

  const handleMagicLink = async () => {
    const email = prompt('Digite seu e-mail para receber o link:');
    if (!email) return;
    try {
      await signInWithEmailLink(email);
      alert('Link enviado! Verifique seu e-mail.');
    } catch (e) {
      alert('Falha ao enviar link');
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-lg shadow-md p-6 bg-[var(--card)]">
        <h1 className="text-2xl font-bold mb-2">Finance Pilot</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">Entre para sincronizar seus dados com o Supabase.</p>

        <button
          className="w-full mb-3 px-4 py-2 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
          onClick={handleGoogle}
        >
          Entrar com Google
        </button>

        <button
          className="w-full px-4 py-2 rounded-md bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
          onClick={handleMagicLink}
        >
          Receber link por e-mail
        </button>
      </div>
    </div>
  );
};

export default AuthGate;
