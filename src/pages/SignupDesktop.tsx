import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const SignupDesktop: React.FC = () => {
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
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6 w-full">
      <main className="w-full max-w-[520px] bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0px_24px_48px_rgba(17,28,45,0.06)] relative overflow-hidden">
        {/* Header Section */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="font-headline text-3xl font-black text-primary tracking-tighter">VaptVaga</span>
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface mb-2">
            Crie sua conta
          </h1>
          <p className="text-on-surface-variant text-sm">
            Escolha seu perfil e comece agora.
          </p>
        </header>

        {/* Profile Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            type="button"
            onClick={() => setRole('company')}
            className={`flex flex-col items-start p-6 rounded-lg border-2 transition-all text-left group ${role === 'company' ? 'bg-surface-container-low border-primary' : 'bg-surface-container-low border-transparent hover:border-primary/20'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-110 ${role === 'company' ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
              <span className="material-symbols-outlined">business</span>
            </div>
            <span className="font-bold text-on-surface text-sm">Sou Empresa</span>
            <span className="text-[10px] text-on-surface-variant mt-1 leading-tight">Busco talentos para projetos</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setRole('freelancer')}
            className={`flex flex-col items-start p-6 rounded-lg border-2 transition-all text-left group ${role === 'freelancer' ? 'bg-surface-container-low border-primary' : 'bg-surface-container-low border-transparent hover:border-primary/20'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-110 ${role === 'freelancer' ? 'bg-primary text-white' : 'bg-white text-primary'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
            </div>
            <span className="font-bold text-on-surface text-sm">Sou Freelancer</span>
            <span className="text-[10px] text-on-surface-variant mt-1 leading-tight">Busco novas oportunidades</span>
          </button>
        </div>

        {/* Registration Form */}
        <form className="space-y-5" onSubmit={handleSignUp}>
          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="font-body font-bold text-on-surface ml-1 text-sm" htmlFor="full_name">Nome Completo</label>
            <input 
              className="w-full h-14 px-5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50" 
              id="full_name" 
              placeholder="Ex: João Silva" 
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
                <label className="font-body font-bold text-on-surface ml-1 text-sm" htmlFor="email">E-mail</label>
                <input 
                  className="w-full h-14 px-5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50" 
                  id="email" 
                  placeholder="seu@email.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-body font-bold text-on-surface ml-1 text-sm" htmlFor="password">Senha</label>
                  <input 
                    className="w-full h-14 px-5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-body font-bold text-on-surface ml-1 text-sm" htmlFor="confirm_password">Confirmar Senha</label>
                  <input 
                    className="w-full h-14 px-5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50" 
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
            className="w-full h-14 mt-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Criar Minha Conta
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>


        {/* Footer Link */}
        <footer className="mt-12 text-center">
          <p className="text-on-surface-variant text-sm font-medium">
            Já tem uma conta? 
            <Link to="/login" className="text-primary font-bold hover:underline ml-1">Entrar</Link>
          </p>
        </footer>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none"></div>
      </main>
    </div>
  );
};
