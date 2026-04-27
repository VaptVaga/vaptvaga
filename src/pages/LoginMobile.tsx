import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const LoginMobile: React.FC = () => {
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
      navigate('/');
    }
  };

  return (
    <div className="bg-surface-container-lowest font-body text-on-surface antialiased min-h-screen">
      <div className="flex flex-col min-h-screen">
        {/* Native-feel Header */}
        <header className="sticky top-0 z-10 bg-surface-container-lowest/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} aria-label="Voltar" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back_ios_new</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="font-headline font-extrabold text-lg tracking-tight">VaptVaga</span>
          </div>
          
          <div className="w-10"></div> {/* Spacer for balance */}
        </header>

        <main className="flex-grow px-6 pt-4 pb-12">
          {/* Welcome Text */}
          <div className="mb-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Bem-vindo de volta</h1>
            <p className="text-on-surface-variant text-sm font-medium leading-relaxed">Entre na sua conta para gerenciar suas vagas ou freelas.</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">E-mail</label>
              <input 
                className="w-full h-14 px-5 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-outline/60 text-on-surface" 
                placeholder="nome@exemplo.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Senha</label>
              <div className="relative">
                <input 
                  className="w-full h-14 px-5 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-outline/60 text-on-surface" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <a className="text-xs font-bold text-primary hover:underline py-2" href="#">Esqueceu sua senha?</a>
            </div>
            
            <button 
              className="w-full h-14 bg-primary text-white font-headline font-bold rounded-full shadow-lg shadow-primary/25 active:scale-[0.97] transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50" 
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

          {/* Bottom Action */}
          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              Não tem uma conta? 
              <Link to="/cadastro" className="text-secondary font-bold hover:underline ml-1">Cadastre-se</Link>
            </p>
          </div>

        </main>

        {/* System Footer */}
        <footer className="pb-10 px-6">
          <div className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-outline">
            <a className="hover:text-on-surface" href="#">Privacidade</a>
            <a className="hover:text-on-surface" href="#">Termos</a>
            <a className="hover:text-on-surface" href="#">Ajuda</a>
          </div>
        </footer>
      </div>
    </div>
  );
};
