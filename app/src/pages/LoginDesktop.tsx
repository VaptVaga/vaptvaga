import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const LoginDesktop: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : authError.message);
      setLoading(false);
    } else {
      // Success is handled by AuthContext listener, but we can navigate here too
      navigate('/');
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex items-center justify-center p-6 w-full">
      <div className="w-full max-w-[520px]">
        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0px_24px_48px_rgba(17,28,45,0.06)] flex flex-col items-stretch">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center text-white">
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
              className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant opacity-30"></div>
            </div>
            <span className="relative bg-surface-container-lowest px-4 text-xs font-bold uppercase tracking-widest text-outline">ou continue com</span>
          </div>

          {/* Social Logins */}
          <div className="flex flex-col gap-3 font-semibold">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-3 h-12 rounded-xl border border-outline-variant bg-white hover:bg-surface-container-low transition-colors px-6 text-[15px] text-on-surface-variant shadow-sm group w-full disabled:opacity-50"
              disabled={loading}
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"/>
                <path d="M46.74 24.55c0-1.65-.15-3.23-.42-4.75H24v9.03h12.79c-.55 2.96-2.22 5.47-4.73 7.15l7.35 5.7c4.3-3.96 6.78-9.8 6.78-16.13z" fill="#4285F4"/>
                <path d="M10.54 28.59c-.48-1.42-.75-2.93-.75-4.5s.27-3.08.75-4.5L2.56 13.22C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z" fill="#FBBC05"/>
                <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.35-5.7c-2.21 1.5-5.03 2.51-8.54 2.51-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"/>
                <path d="M0 0h48v48H0z" fill="none"/>
              </svg>
              <span>Continuar com Google</span>
            </button>
          </div>

          {/* Footer Card */}
          <div className="mt-10 pt-8 border-t border-outline-variant/20 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              Não tem uma conta? 
              <Link to="/onboarding/role" className="text-secondary font-bold hover:underline ml-1">Cadastre-se agora</Link>
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
