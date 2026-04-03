import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const OnboardingRoleMobile: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'freelancer' | 'company'>('freelancer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aceitaEmail, setAceitaEmail] = useState(false);
  const [aceitaWhatsapp, setAceitaWhatsapp] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create profile
      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .insert({
          id: authData.user.id,
          name: fullName,
          role: role as string,
          aceita_email: aceitaEmail,
          aceita_whatsapp: aceitaWhatsapp,
        });

      if (profileError) {
        setError('Erro ao criar perfil. Por favor, tente novamente.');
        setLoading(false);
      } else {
        navigate(role === 'freelancer' ? '/freelancer/dashboard' : '/company/dashboard');
      }
    }
  };

  const handleSocialSignUp = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          role: role
        }
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="w-full min-h-screen bg-surface-container-lowest flex flex-col relative pb-10">
        
        {/* App Header with Back Arrow */}
        <header className="sticky top-0 z-10 bg-surface-container-lowest/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} aria-label="Voltar" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-on-surface text-2xl">arrow_back</span>
          </button>
          <div className="inline-flex items-center">
            <span className="font-headline text-xl font-black text-primary tracking-tighter">VaptVaga</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </header>

        <div className="px-6 pt-4 relative z-10">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Crie sua conta</h1>
            <p className="text-on-surface-variant text-sm">Escolha seu perfil e comece agora.</p>
          </div>

          {/* Profile Selection */}
          <div className="flex flex-col gap-3 mb-8">
            <button 
              type="button"
              onClick={() => setRole('company')}
              className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left w-full ${role === 'company' ? 'bg-surface-container-low border-primary' : 'bg-surface-container-low border-transparent hover:border-primary/20'}`}
            >
              <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-sm ${role === 'company' ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                <span className="material-symbols-outlined text-2xl">business</span>
              </div>
              <div>
                <span className="font-bold text-on-surface text-base block">Sou Empresa</span>
                <span className="text-xs text-on-surface-variant leading-tight">Busco talentos para projetos</span>
              </div>
            </button>
            
            <button 
              type="button"
              onClick={() => setRole('freelancer')}
              className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left w-full ${role === 'freelancer' ? 'bg-surface-container-low border-primary' : 'bg-surface-container-low border-transparent hover:border-primary/20'}`}
            >
              <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-sm ${role === 'freelancer' ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
              </div>
              <div>
                <span className="font-bold text-on-surface text-base block">Sou Freelancer</span>
                <span className="text-xs text-on-surface-variant leading-tight">Busco novas oportunidades</span>
              </div>
            </button>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSignUp}>
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="font-body font-bold text-on-surface text-sm ml-1" htmlFor="full_name">Nome Completo</label>
              <input 
                className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50 text-base" 
                id="full_name" 
                placeholder="Ex: João Silva" 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="font-body font-bold text-on-surface text-sm ml-1" htmlFor="email">E-mail</label>
              <input 
                className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50 text-base" 
                id="email" 
                placeholder="seu@email.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="font-body font-bold text-on-surface text-sm ml-1" htmlFor="password">Senha</label>
                <input 
                  className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50 text-base" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="font-body font-bold text-on-surface text-sm ml-1" htmlFor="confirm_password">Confirmar Senha</label>
                <input 
                  className="w-full h-14 px-5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50 text-base" 
                  id="confirm_password" 
                  placeholder="••••••••" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-3 pt-2">
              <p className="font-body font-bold text-on-surface text-sm ml-1">Notificações</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceitaEmail}
                  onChange={(e) => setAceitaEmail(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low"
                />
                <span className="text-sm text-on-surface-variant leading-snug">Aceito receber notificações por <strong className="text-on-surface">e-mail</strong></span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceitaWhatsapp}
                  onChange={(e) => setAceitaWhatsapp(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low"
                />
                <span className="text-sm text-on-surface-variant leading-snug">Aceito receber notificações por <strong className="text-on-surface">WhatsApp</strong></span>
              </label>
            </div>

            <button
              className="w-full h-14 mt-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Criar Minha Conta
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-outline">
              <span className="bg-surface-container-lowest px-4">Ou registre-se com</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleSocialSignUp('google')}
              className="h-14 flex items-center justify-center gap-3 bg-white border border-outline-variant hover:bg-surface-container-low rounded-xl transition-all font-bold text-on-surface-variant text-[15px] px-6 shadow-sm active:scale-[0.98] w-full disabled:opacity-50"
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"/>
                <path d="M46.74 24.55c0-1.65-.15-3.23-.42-4.75H24v9.03h12.79c-.55 2.96-2.22 5.47-4.73 7.15l7.35 5.7c4.3-3.96 6.78-9.8 6.78-16.13z" fill="#4285F4"/>
                <path d="M10.54 28.59c-.48-1.42-.75-2.93-.75-4.5s.27-3.08.75-4.5L2.56 13.22C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z" fill="#FBBC05"/>
                <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.35-5.7c-2.21 1.5-5.03 2.51-8.54 2.51-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"/>
                <path d="M0 0h48v48H0z" fill="none"/>
              </svg>
              Continuar com Google
            </button>
          </div>

          {/* Footer Link */}
          <footer className="mt-12 text-center pb-8">
            <p className="text-on-surface-variant text-sm font-medium">
              Já tem uma conta? 
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">Entrar</Link>
            </p>
          </footer>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none"></div>
      </main>
    </div>
  );
};
