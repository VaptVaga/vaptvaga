import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const SignupMobile: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: fullName,
          role: role,
          aceita_email: aceitaEmail,
          aceita_whatsapp: aceitaWhatsapp,
        });

      if (profileError) {
        console.error(profileError);
        setError(`Erro do BD: ${profileError.message || profileError.details || 'Desconhecido'}`);
        setLoading(false);
      } else {
        await refreshProfile();
        navigate(role === 'freelancer' ? '/freelancer/onboarding' : '/company/dashboard');
      }
    }
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
          <div className="w-10"></div>
        </header>

        <div className="px-6 pt-4 relative z-10">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">
              Crie sua conta
            </h1>
            <p className="text-on-surface-variant text-sm">
              Escolha seu perfil e comece agora.
            </p>
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
              className="w-full h-14 mt-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50" 
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
