import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/authContext';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [step, setStep] = useState<'auth' | 'role'>('auth');
  const [email, setEmail] = useState('');

  const preselectedRole = searchParams.get('role') as 'company' | 'freelancer' | null;

  const handleAuth = () => {
    if (preselectedRole) {
      handleSelectRole(preselectedRole);
    } else {
      setStep('role');
    }
  };

  const handleSelectRole = (role: 'company' | 'freelancer') => {
    login({
      id: 'mock-user-1',
      role,
      subscription_tier: 'free',
      full_name: role === 'company' ? 'Restaurante Sabor & Arte' : 'Carlos Silva',
      whatsapp: '11999887766',
      avatar_url: '',
      skills: role === 'freelancer' ? ['Garçom', 'Barman'] : undefined,
      company_name: role === 'company' ? 'Restaurante Sabor & Arte' : undefined,
      city: 'São Paulo',
    });
    navigate('/onboarding');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-5">
      <button onClick={() => navigate(-1)} className="py-4 text-muted-foreground">
        <ArrowLeft size={22} />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col justify-center pb-20"
      >
        <h1 className="text-2xl font-black text-foreground">
          Vapt<span className="text-primary">Vaga</span>
        </h1>

        {step === 'auth' ? (
          <div className="mt-8 space-y-4">
            <p className="text-muted-foreground">
              Entre com seu e-mail para começar a trabalhar ou contratar.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="h-13 w-full rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button onClick={handleAuth} className="h-13 w-full rounded-xl text-base font-bold">
                <Mail size={18} />
                Continuar com e-mail
              </Button>
            </motion.div>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">ou</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleAuth}
              className="h-13 w-full rounded-xl text-base font-medium"
            >
              Continuar com Google
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="text-lg font-bold text-foreground">Como você quer usar o VaptVaga?</p>
            <motion.div whileTap={{ scale: 0.96 }}>
              <button
                onClick={() => handleSelectRole('company')}
                className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  🏢
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Sou Empresa</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Quero encontrar freelancers para meu negócio
                  </p>
                </div>
              </button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }}>
              <button
                onClick={() => handleSelectRole('freelancer')}
                className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-2xl">
                  💼
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Sou Freelancer</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Quero encontrar diárias para trabalhar
                  </p>
                </div>
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
