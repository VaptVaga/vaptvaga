import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Building2, UserSearch } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'freelancer' | 'company'>('freelancer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      toast({ title: 'Erro', description: error, variant: 'destructive' });
    } else if (!isLogin) {
      toast({ title: '📧 Verifique seu e-mail', description: 'Enviamos um link de confirmação.' });
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const inputClass =
    'w-full h-14 px-5 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-outline/60 text-on-surface text-base font-body outline-none';
  const labelClass =
    'font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1';

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased flex flex-col md:items-center md:justify-center md:p-6">
      {/* ─── MOBILE HEADER ─── */}
      <header className="sticky top-0 z-10 bg-surface-container-lowest/80 backdrop-blur-md px-4 py-4 flex items-center justify-between md:hidden">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-headline font-extrabold text-lg tracking-tight">VaptVaga</span>
        </div>
        <div className="w-10" />
      </header>

      {/* ─── DESKTOP CARD WRAPPER ─── */}
      <div className="w-full md:max-w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface-container-lowest md:rounded-xl md:p-12 md:shadow-[0px_24px_48px_rgba(17,28,45,0.06)] relative overflow-hidden"
        >
          {/* ─── DESKTOP BRAND HEADER ─── */}
          <div className="hidden md:flex flex-col items-center gap-6 mb-10">
            {isLogin ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
                  </svg>
                </div>
                <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">VaptVaga</h1>
              </div>
            ) : (
              <span className="font-headline text-3xl font-black text-primary tracking-tighter">VaptVaga</span>
            )}
            <div className="text-center space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.02em] text-on-surface">
                {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                {isLogin ? 'Entre na sua conta para gerenciar suas vagas ou freelas.' : 'Escolha seu perfil e comece agora.'}
              </p>
            </div>
          </div>

          {/* ─── MOBILE TITLE ─── */}
          <div className="px-6 pt-4 md:hidden">
            <div className="mb-6">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">
                {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h1>
              <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                {isLogin ? 'Entre na sua conta para gerenciar suas vagas ou freelas.' : 'Escolha seu perfil e comece agora.'}
              </p>
            </div>
          </div>

          <div className="px-6 pb-10 md:px-0 md:pb-0">
            {/* ─── ROLE SELECTOR (signup only) ─── */}
            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`flex items-center md:flex-col md:items-start gap-4 md:gap-0 p-5 md:p-6 bg-surface-container-low rounded-xl border-2 transition-all text-left group w-full ${
                    role === 'company' ? 'border-primary' : 'border-transparent hover:border-primary/20'
                  }`}
                >
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform md:mb-4 ${
                    role === 'company' ? 'bg-primary' : 'bg-white'
                  }`}>
                    <Building2 size={24} className={role === 'company' ? 'text-white' : 'text-primary'} />
                  </div>
                  <div>
                    <span className="font-bold text-on-surface text-base md:text-sm block">Sou Empresa</span>
                    <span className="text-xs md:text-[10px] text-on-surface-variant leading-tight">Busco talentos para projetos</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`flex items-center md:flex-col md:items-start gap-4 md:gap-0 p-5 md:p-6 bg-surface-container-low rounded-xl border-2 transition-all text-left group w-full ${
                    role === 'freelancer' ? 'border-primary' : 'border-transparent hover:border-primary/20'
                  }`}
                >
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform md:mb-4 ${
                    role === 'freelancer' ? 'bg-primary' : 'bg-white'
                  }`}>
                    <UserSearch size={24} className={role === 'freelancer' ? 'text-white' : 'text-primary'} />
                  </div>
                  <div>
                    <span className="font-bold text-on-surface text-base md:text-sm block">Sou Freelancer</span>
                    <span className="text-xs md:text-[10px] text-on-surface-variant leading-tight">Busco novas oportunidades</span>
                  </div>
                </button>
              </div>
            )}

            {/* ─── FORM ─── */}
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className={labelClass}>Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className={inputClass}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className={labelClass}>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className={inputClass}
                />
              </div>

              <div className={!isLogin ? 'grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4' : ''}>
                <div className="space-y-2">
                  <label className={labelClass}>Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className={labelClass}>Confirmar Senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <a href="#" className="text-xs font-bold text-primary hover:underline py-1">
                    Esqueceu sua senha?
                  </a>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className={`w-full h-14 bg-primary text-white font-headline font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60 mt-4 ${
                  isLogin ? 'rounded-full' : 'rounded-xl'
                }`}
              >
                {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Minha Conta'}
                {!isLogin && !loading && <ArrowRight size={18} />}
              </motion.button>
            </form>

            {/* ─── TOGGLE LOGIN/SIGNUP ─── */}
            <div className={`text-center ${isLogin ? 'mt-10 pt-8 border-t border-outline-variant/20' : 'mt-12'}`}>
              <p className="text-sm font-medium text-on-surface-variant">
                {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className={`font-bold hover:underline ml-1 ${isLogin ? 'text-secondary' : 'text-primary'}`}
                >
                  {isLogin ? 'Cadastre-se agora' : 'Entrar'}
                </button>
              </p>
            </div>
          </div>

          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />
        </motion.div>

        {/* ─── FOOTER LINKS ─── */}
        <div className="py-8 md:mt-8 flex justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-outline">
          <a href="#" className="hover:text-on-surface transition-colors">Privacidade</a>
          <a href="#" className="hover:text-on-surface transition-colors">Termos</a>
          <a href="#" className="hover:text-on-surface transition-colors">Ajuda</a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
