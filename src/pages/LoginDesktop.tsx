import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { rateLimiter } from '../lib/rateLimit';

export const LoginDesktop: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError(null);

    // Bloqueia tentativas abusivas (máx 5 tentativas a cada 15 min por email)
    const limit = rateLimiter.checkAndRecord('login', 5, 15 * 60 * 1000, loginEmail);
    if (!limit.allowed) {
      setError(`Muitas tentativas. Tente novamente em ${rateLimiter.formatRemainingTime(limit.remainingMs)}.`);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPass,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : authError.message);
      setLoading(false);
    } else {
      rateLimiter.reset('login', loginEmail);
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await doLogin(email, password);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex items-center justify-center p-6 w-full">
      <div className="w-full max-w-[520px]">
        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0px_24px_48px_rgba(17,28,45,0.06)] flex flex-col items-stretch">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">VaptVaga</h1>
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.02em] text-on-surface">Bem-vindo de volta</h2>
              <p className="text-on-surface-variant text-sm font-medium">Entre na sua conta para gerenciar suas vagas ou freelas.</p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">E-mail</label>
              <div className="relative">
                <input 
                  className="w-full h-14 px-5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/60 text-on-surface" 
                  placeholder="nome@exemplo.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">Senha</label>
              </div>
              <div className="relative">
                <input 
                  className="w-full h-14 px-5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/60 text-on-surface" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <a className="text-xs font-bold text-primary hover:underline" href="#">Esqueceu sua senha?</a>
            </div>
            <button 
              className="w-full h-14 bg-primary text-white font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Entrar'
              )}
            </button>

            {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => doLogin('gabrielrodcarvalho2008@gmail.com', '1962008')}
                  disabled={loading}
                  className="flex-1 h-10 bg-secondary/10 text-secondary text-xs font-bold rounded-lg border border-secondary/20 hover:bg-secondary/20 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  Dev: Empresa
                </button>
                <button
                  type="button"
                  onClick={() => doLogin('gabrielrodcarvalho2008@gmail.com', '1962008')}
                  disabled={loading}
                  className="flex-1 h-10 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  Dev: Gabriel
                </button>
              </div>
            )}
          </form>

          {/* Footer Card */}
          <div className="mt-10 pt-8 border-t border-outline-variant/20 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              Não tem uma conta? 
              <Link to="/cadastro" className="text-secondary font-bold hover:underline ml-1">Cadastre-se agora</Link>
            </p>
          </div>
        </div>

        {/* System Footer View */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-outline">
          <a className="hover:text-on-surface transition-colors" href="#">Privacidade</a>
          <a className="hover:text-on-surface transition-colors" href="#">Termos</a>
          <a className="hover:text-on-surface transition-colors" href="#">Ajuda</a>
        </div>
      </div>
    </div>
  );
};
