import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  type: 'company' | 'freelancer';
}

export const PaywallModal = ({ open, onClose, type }: PaywallModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-card p-8 text-center shadow-xl"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Zap size={40} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Limite atingido!</h2>
            <p className="mt-2 text-muted-foreground">
              {type === 'freelancer'
                ? 'Garanta as melhores diárias antes de todo mundo.'
                : 'Libere o contato de todos os candidatos qualificados.'}
            </p>
          </div>
          <div className="w-full space-y-3">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button variant="success" className="h-14 w-full text-lg font-black">
                Assinar Premium — {type === 'freelancer' ? 'R$19,90' : 'R$49,90'}/mês
              </Button>
            </motion.div>
            <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground">
              Continuar no plano grátis
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
