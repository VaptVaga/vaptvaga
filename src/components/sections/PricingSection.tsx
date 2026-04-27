import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Building2, UserCircle2, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  initialRole?: 'freelancer' | 'company';
}

export const PricingSection: React.FC<PricingSectionProps> = ({ initialRole = 'freelancer' }) => {
  const [role, setRole] = useState<'freelancer' | 'company'>(initialRole);

  const plans = {
    freelancer: [
      {
        name: 'Grátis',
        price: '0',
        period: '/mês',
        features: [
          'Até 2 candidaturas por mês',
          'Perfil Verificado',
          'Acesso ao feed de vagas',
          'Chat direto com empresas',
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
          'Selo PRO no perfil',
          'Alertas instantâneos de vagas',
          'Destaque nas buscas locais',
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
          'Suporte via e-mail',
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
          'Filtros avançados de busca',
        ],
        cta: 'Assinar Agora',
        highlighted: true,
      },
    ],
  };

  return (
    <section id="planos" className="py-24 px-6 bg-surface-container-low transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Flexibilidade para o seu Momento
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight leading-tight">
            Escolha o plano ideal <br className="hidden md:block" />
            para o seu <span className="text-primary italic">momento.</span>
          </h2>
          
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
            Transparência total e flexibilidade para você focar no que importa: 
            staff de qualidade ou renda extra imediata.
          </p>

          {/* Role Toggle */}
          <div className="flex justify-center pt-8">
            <div className="p-1.5 bg-surface-container-high rounded-2xl flex items-center shadow-inner ring-1 ring-black/5">
              <button
                onClick={() => setRole('company')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  role === 'company'
                    ? 'bg-white text-primary shadow-md ring-1 ring-black/5 scale-105'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Sou Empresa
              </button>
              <button
                onClick={() => setRole('freelancer')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  role === 'freelancer'
                    ? 'bg-white text-primary shadow-md ring-1 ring-black/5 scale-105'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <UserCircle2 className="w-4 h-4" />
                Sou Freelancer
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, x: role === 'company' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: role === 'company' ? 20 : -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full col-span-2"
            >
              {plans[role].map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col p-10 md:p-12 rounded-[2.5rem] relative group border-t-2 border-transparent transition-all duration-500 hover:translate-y-[-8px] ${
                    plan.highlighted
                      ? 'bg-primary text-on-primary shadow-2xl shadow-primary/30 ring-4 ring-primary/20'
                      : 'bg-surface-container-lowest border-surface-container text-on-surface hover:shadow-xl hover:shadow-black/5'
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
                      <span className="text-5xl font-black italic">R$ {plan.price}</span>
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
                      <li key={fIndex} className="flex items-start gap-4 group/item">
                        <div className={`mt-1 p-0.5 rounded-full transition-transform group-hover/item:scale-110 ${
                          plan.highlighted ? 'bg-white/20' : 'bg-primary/10'
                        }`}>
                          <Check className={`w-3.5 h-3.5 ${
                            plan.highlighted ? 'text-white' : 'text-primary'
                          }`} strokeWidth={3} />
                        </div>
                        <span className="font-semibold leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={role === 'company' ? '/cadastro?type=company' : '/cadastro?type=freelancer'}
                    className={`w-full py-5 rounded-full font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95 group/btn ${
                      plan.highlighted
                        ? 'bg-white text-primary hover:bg-surface-bright shadow-lg'
                        : 'bg-on-surface text-white hover:bg-on-surface/90 shadow-lg shadow-black/5'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                  </Link>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Subtle helper text for mobile */}
        <p className="mt-12 text-center text-sm font-bold text-on-surface-variant flex items-center justify-center gap-2 md:hidden">
          <span className="material-symbols-outlined text-sm">swipe</span>
          Deslize para ver os detalhes
        </p>
      </div>
    </section>
  );
};
