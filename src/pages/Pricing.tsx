import { useState } from 'react';
import { ArrowLeft, Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

type Tab = 'freelancer' | 'company';

const plans = {
  freelancer: {
    free: {
      price: 'R$ 0',
      features: ['2 candidaturas por mês', 'Visibilidade padrão', 'Aguarda contato da empresa'],
      limitations: ['Limite de 2 candidaturas', 'Sem destaque no perfil'],
    },
    premium: {
      price: 'R$ 19,90',
      features: ['Candidaturas ilimitadas', 'Destaque no topo das listas', 'Contato prioritário', 'Badge de Premium'],
    },
  },
  company: {
    free: {
      price: 'R$ 0',
      features: ['1 vaga por mês', 'Ver 1 candidato', 'Acesso básico'],
      limitations: ['Contato bloqueado após 1º candidato', 'Limite de 1 vaga'],
    },
    premium: {
      price: 'R$ 49,90',
      features: ['Vagas ilimitadas', 'Ver todos os candidatos', 'Botão WhatsApp liberado', 'Destaque nas buscas', 'Suporte prioritário'],
    },
  },
};

const Pricing = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('freelancer');

  const plan = plans[tab];

  return (
    <div className="min-h-screen bg-background px-5">
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-black text-foreground">Planos</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-secondary p-1">
        {(['freelancer', 'company'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
              tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {t === 'freelancer' ? 'Para Freelancers' : 'Para Empresas'}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 space-y-4 pb-10"
      >
        {/* Free Plan */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground">Free</h3>
          <p className="mt-1 text-3xl font-black text-foreground">{plan.free.price}<span className="text-base font-medium text-muted-foreground">/mês</span></p>
          <div className="mt-5 space-y-3">
            {plan.free.features.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-success" />
                <span className="text-foreground">{f}</span>
              </div>
            ))}
            {plan.free.limitations?.map((l) => (
              <div key={l} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-destructive">✕</span>
                <span className="text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-5 h-12 w-full rounded-xl font-bold">
            Plano atual
          </Button>
        </div>

        {/* Premium Plan */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-card p-6">
          <div className="absolute right-4 top-4">
            <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              <Zap size={12} fill="currentColor" /> Recomendado
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground">Premium</h3>
          <p className="mt-1 text-3xl font-black text-foreground">
            {plan.premium.price}<span className="text-base font-medium text-muted-foreground">/mês</span>
          </p>
          <div className="mt-5 space-y-3">
            {plan.premium.features.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-success" />
                <span className="text-foreground">{f}</span>
              </div>
            ))}
          </div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button variant="success" className="mt-5 h-12 w-full rounded-xl text-base font-black">
              Assinar Agora
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Pricing;
