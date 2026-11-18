import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Zap,
  Building2,
  UserCircle2,
  ArrowRight,
  CreditCard,
  QrCode,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  getStripeEnvStatus,
  getPlanStripeCatalog,
  type StripePlanCatalogEntry,
} from '@/lib/stripeConnect';

const Pricing = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [role, setRole] = useState<'freelancer' | 'company'>(
    profile?.role === 'freelancer' ? 'freelancer' : 'company'
  );
  const [checkoutPlan, setCheckoutPlan] = useState<{
    name: string;
    price: string;
    catalog: StripePlanCatalogEntry;
  } | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<'card' | 'pix'>('card');
  const stripeEnv = getStripeEnvStatus();

  const plans = {
    freelancer: [
      {
        name: 'Grátis',
        price: '0',
        period: '/mês',
        features: [
          'Acesso ao feed de vagas',
          '2 candidaturas por mês',
          'Chat com empresas',
        ],
        cta: 'Começar agora',
        highlighted: false,
      },
      {
        name: 'Vapt PRO',
        price: '14,90',
        period: '/mês',
        features: [
          'Candidaturas ilimitadas',
          'Selo Freela PRO no perfil',
          'Destaque nas buscas',
          'Suporte prioritário',
        ],
        cta: 'Assinar Vapt PRO',
        highlighted: true,
      },
    ],
    company: [
      {
        name: 'Grátis',
        price: '0',
        period: '/mês',
        features: [
          'Publicar 1 vaga/mês',
          'Chat liberado com 1 candidato',
          'Gestão básica de candidatos',
        ],
        cta: 'Começar agora',
        highlighted: false,
      },
      {
        name: 'Negócio Ágil',
        price: '49,90',
        period: '/mês',
        features: [
          'Vagas ilimitadas',
          'Chat liberado com TODOS os candidatos',
          'Suporte prioritário nacional',
          'Dashboard de escala mensal',
        ],
        cta: 'Assinar Agora',
        highlighted: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full overflow-hidden -z-10 h-[600px]">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[80%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[-5%] right-[-10%] w-[30%] h-[60%] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Planos VaptVaga V2
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-on-surface tracking-tight"
          >
            Escolha o plano ideal <br className="hidden md:block" />
            para o seu <span className="text-primary italic">momento.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium"
          >
            Transparência total e flexibilidade para você focar no que importa: 
            staff de qualidade ou renda extra imediata.
          </motion.p>

          {/* Role Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center pt-8"
          >
            <div className="p-1.5 bg-surface-container rounded-2xl flex items-center shadow-inner">
              <button
                onClick={() => setRole('company')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  role === 'company'
                    ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Sou Empresa
              </button>
              <button
                onClick={() => setRole('freelancer')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  role === 'freelancer'
                    ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <UserCircle2 className="w-4 h-4" />
                Sou Freelancer
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch relative">
          <AnimatePresence mode="wait">
            {plans[role].map((plan, index) => (
              <motion.div
                key={`${role}-${plan.name}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex flex-col p-10 md:p-12 rounded-[2.5rem] relative group border-t-2 border-transparent transition-all hover:translate-y-[-4px] ${
                  plan.highlighted
                    ? 'bg-primary text-on-primary shadow-2xl shadow-primary/30 ring-4 ring-primary/20'
                    : 'bg-surface-container-low border-surface-container text-on-surface hover:shadow-xl hover:shadow-black/5'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                    Mais Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-xl font-bold uppercase tracking-widest ${
                    plan.highlighted ? 'text-primary-fixed-dim' : 'text-primary'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-black">R$ {plan.price}</span>
                    <span className={`text-sm font-bold ${
                      plan.highlighted ? 'text-primary-fixed-dim' : 'text-on-surface-variant'
                    }`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <div className={`w-full h-px mb-8 ${
                  plan.highlighted ? 'bg-white/10' : 'bg-on-surface-variant/10'
                }`} />

                <ul className="space-y-5 mb-12 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-4">
                      <div className={`mt-1 p-0.5 rounded-full ${
                        plan.highlighted ? 'bg-secondary-container' : 'bg-primary/10'
                      }`}>
                        <Check className={`w-3.5 h-3.5 ${
                          plan.highlighted ? 'text-on-secondary-container' : 'text-primary'
                        }`} strokeWidth={3} />
                      </div>
                      <span className="font-semibold leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate(`/cadastro?type=${role}`);
                      return;
                    }
                    if (!plan.highlighted) {
                      toast({
                        title: 'Plano Grátis Ativo',
                        description: 'Você já está utilizando os recursos gratuitos.',
                      });
                      return;
                    }
                    setCheckoutPlan({
                      name: plan.name,
                      price: plan.price,
                      catalog: getPlanStripeCatalog(role),
                    });
                  }}
                  className={`w-full py-5 rounded-full font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95 group/btn ${
                    plan.highlighted
                      ? 'bg-white text-primary hover:bg-surface-bright'
                      : 'bg-on-surface text-white hover:bg-on-surface/90'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* FAQ Preview or Trust Note */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center space-y-6"
        >
            <p className="text-sm text-on-surface-variant font-bold uppercase tracking-widest">
                Transações seguras com criptografia de ponta a ponta
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 grayscale opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Pix_logo.svg" alt="Pix" className="h-5" />
            </div>
        </motion.div>
      </div>

      {/* Modal: Stripe Checkout Assinatura */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutPlan(null)}
              className="fixed inset-0 bg-on-surface/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              className="relative z-[96] w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-[#635BFF]/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#635BFF] text-white flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF]">
                      Stripe Checkout Seguro
                    </p>
                    <h3 className="font-headline font-extrabold text-base text-on-surface">
                      Assinar {checkoutPlan.name}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutPlan(null)}
                  className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Assinatura Mensal</p>
                    <p className="font-headline font-extrabold text-base text-on-surface">
                      {checkoutPlan.name}
                    </p>
                  </div>
                  <span className="font-headline font-black text-2xl text-primary">
                    R$ {checkoutPlan.price}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('card')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                      checkoutMethod === 'card'
                        ? 'bg-[#635BFF] text-white border-[#635BFF]'
                        : 'bg-surface-container-low text-on-surface border-outline-variant/50'
                    }`}
                  >
                    <CreditCard size={14} /> Cartão Stripe
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('pix')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                      checkoutMethod === 'pix'
                        ? 'bg-[#635BFF] text-white border-[#635BFF]'
                        : 'bg-surface-container-low text-on-surface border-outline-variant/50'
                    }`}
                  >
                    <QrCode size={14} /> PIX via Stripe
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-secondary-container/50 text-on-secondary-container text-xs flex items-start gap-2">
                  <ShieldCheck size={16} className="shrink-0 mt-0.5 text-secondary" />
                  <div className="space-y-1">
                    <p>
                      Conectado à conta Stripe <strong>{stripeEnv.platformAccountName}</strong> (
                      <code className="font-mono text-[11px]">{stripeEnv.platformAccountId}</code>
                      {stripeEnv.livemode ? ' • Live' : ' • Sandbox BRL'}).
                    </p>
                    <p className="text-[11px] opacity-80 font-mono">
                      Produto: {checkoutPlan.catalog.productId} • Preço: {checkoutPlan.catalog.priceId}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.open(checkoutPlan.catalog.paymentLinkUrl, '_blank', 'noopener,noreferrer');
                    toast({
                      title: `🚀 Checkout Stripe (${checkoutPlan.name}) aberto!`,
                      description: `Assinatura vinculada ao preço ${checkoutPlan.catalog.priceId} (${
                        checkoutMethod === 'card' ? 'Cartão Stripe' : 'PIX via Stripe'
                      }).`,
                    });
                    setCheckoutPlan(null);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:brightness-110 text-white font-headline font-bold text-sm shadow-md shadow-[#635BFF]/25 flex items-center justify-center gap-2"
                >
                  <span>Abrir Stripe Checkout • R$ {checkoutPlan.price}</span>
                  <ExternalLink size={15} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;
