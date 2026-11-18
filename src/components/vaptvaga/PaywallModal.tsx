import { Zap, Crown, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getPlanStripeCatalog, STRIPE_PLATFORM_CONFIG } from '@/lib/stripeConnect';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  type: 'company' | 'freelancer';
}

export const PaywallModal = ({ open, onClose, type }: PaywallModalProps) => {
  const navigate = useNavigate();

  const isFreelancer = type === 'freelancer';
  const catalog = getPlanStripeCatalog(type);
  const planName = isFreelancer ? 'Vapt PRO' : 'Negócio Ágil';
  const priceLabel = catalog.priceLabel;
  const benefits = isFreelancer
    ? [
        'Candidaturas ilimitadas todos os meses',
        'Selo Freela PRO no topo das buscas',
        'Alertas imediatos de vagas relâmpago',
      ]
    : [
        'Publicações de vagas ilimitadas por mês',
        'Chat oficial no app liberado com TODOS os candidatos',
        'Suporte prioritário para urgências operacionais',
      ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-on-surface/45 backdrop-blur-sm p-4 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-md flex-col items-center gap-5 rounded-3xl bg-surface-container-lowest p-7 md:p-8 text-center shadow-2xl border border-outline-variant"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
            >
              <X size={16} />
            </button>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-primary">
              <Zap size={32} className="fill-current" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-extrabold uppercase tracking-wider">
                <Crown size={12} /> {planName}
              </span>
              <h2 className="font-headline text-2xl font-extrabold text-on-surface">
                Limite do plano grátis atingido!
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {isFreelancer
                  ? 'Você atingiu o limite de 2 candidaturas mensais. Garanta as melhores diárias antes de todo mundo.'
                  : 'Libere vagas ilimitadas e o contato direto com todos os candidatos qualificados.'}
              </p>
            </div>

            <ul className="w-full space-y-2 text-left bg-surface-container-low p-4 rounded-2xl">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs font-semibold text-on-surface">
                  <CheckCircle2 size={15} className="text-secondary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="w-full space-y-2.5 pt-1">
              <Button
                type="button"
                onClick={() => {
                  window.open(catalog.paymentLinkUrl, '_blank', 'noopener,noreferrer');
                  onClose();
                }}
                className="h-13 w-full rounded-full bg-[#635BFF] hover:brightness-110 text-white font-headline font-extrabold text-sm shadow-lg shadow-[#635BFF]/25 flex items-center justify-center gap-2"
              >
                <span>Assinar via Stripe — {priceLabel}</span>
                <ExternalLink size={15} />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate('/planos');
                }}
                className="w-full h-11 rounded-full font-headline font-bold text-xs"
              >
                Comparar Planos e Métodos PIX
              </Button>
              <p className="text-[10px] font-mono text-on-surface-variant">
                Plataforma: {STRIPE_PLATFORM_CONFIG.platformAccountId} • {catalog.priceId}
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="w-full h-10 rounded-full text-on-surface-variant font-semibold text-xs"
              >
                Continuar no plano grátis
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
