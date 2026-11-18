import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  X,
  Calendar,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

interface ConfirmPresenceModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shiftTitle: string;
  companyName: string;
  shiftDateLabel?: string;
  locationLabel?: string;
}

const WAIT_SECONDS = 5;

const ConfirmPresenceModalContent: React.FC<Omit<ConfirmPresenceModalProps, 'open'>> = ({
  onClose,
  onConfirm,
  shiftTitle,
  companyName,
  shiftDateLabel,
  locationLabel,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(WAIT_SECONDS);
  const [awareChecked, setAwareChecked] = useState<boolean>(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const isUnlocked = secondsLeft === 0;
  const canConfirm = isUnlocked && awareChecked;
  const progressPercent = ((WAIT_SECONDS - secondsLeft) / WAIT_SECONDS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 14 }}
      className="relative z-[95] w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-amber-700">
              Termo de Compromisso do Turno
            </p>
            <h3 className="font-headline font-extrabold text-base text-on-surface truncate">
              Confirmar Presença
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar popup de confirmar presença"
          className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5 overflow-y-auto">
        {/* Shift Summary */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50 space-y-1.5">
          <p className="font-headline font-bold text-sm text-on-surface">{shiftTitle}</p>
          <p className="text-xs font-semibold text-primary">{companyName}</p>
          <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-on-surface-variant">
            {shiftDateLabel && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} className="text-primary" />
                {shiftDateLabel}
              </span>
            )}
            {locationLabel && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} className="text-primary" />
                {locationLabel}
              </span>
            )}
          </div>
        </div>

        {/* Penalty Warning Alert */}
        <div className="p-4 rounded-2xl bg-error-container/60 border-2 border-error/40 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={18} />
          </div>
          <div className="space-y-1.5">
            <p className="font-headline font-extrabold text-xs sm:text-sm text-on-error-container">
              Aviso Importante sobre Falta e Penalidades
            </p>
            <p className="text-xs text-on-error-container/90 leading-relaxed">
              Se você <strong>confirmar a presença</strong> neste turno e{' '}
              <strong>não comparecer</strong>, e <strong>não apresentar justificativa</strong>{' '}
              ou a <strong>justificativa apresentada for inválida</strong>, você{' '}
              <strong>poderá ser punido</strong> na VaptVaga (com perda de nota/reputação,
              remoção de prioridade no radar e possível suspensão ou bloqueio da conta).
            </p>
          </div>
        </div>

        {/* 5-Second Mandatory Wait Progress */}
        <div
          className={`p-3.5 rounded-2xl border transition-colors ${
            isUnlocked
              ? 'bg-secondary-container/60 border-secondary/30'
              : 'bg-primary-container/40 border-primary/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-headline font-bold mb-2">
            <span className="flex items-center gap-1.5 text-on-surface">
              {isUnlocked ? (
                <CheckCircle2 size={15} className="text-secondary" />
              ) : (
                <Clock size={15} className="text-primary animate-pulse" />
              )}
              <span>
                {isUnlocked
                  ? 'Leitura concluída! Você já pode confirmar sua presença.'
                  : `Leia o aviso com atenção • Aguarde ${secondsLeft}s...`}
              </span>
            </span>
            <span className={isUnlocked ? 'text-secondary font-black' : 'text-primary font-black'}>
              {isUnlocked ? 'Liberado' : `${secondsLeft}s`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                isUnlocked ? 'bg-secondary' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 cursor-pointer">
          <input
            type="checkbox"
            checked={awareChecked}
            onChange={(e) => setAwareChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-outline text-primary focus:ring-primary"
          />
          <span className="text-xs text-on-surface leading-relaxed">
            Estou ciente do meu compromisso de comparecer no dia e horário combinados e das regras
            de justificativa e punição da VaptVaga em caso de falta sem justificativa válida.
          </span>
        </label>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-outline-variant/60 bg-surface-container-lowest flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs sm:text-sm"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`flex-1 py-3 px-5 rounded-xl font-headline font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            canConfirm
              ? 'bg-primary hover:bg-primary-dark text-on-primary shadow-lg shadow-primary/25 active:scale-95'
              : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-75'
          }`}
        >
          {!isUnlocked ? (
            <>
              <Clock size={16} />
              <span>Aguarde {secondsLeft}s...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Confirmar Presença no Turno</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export const ConfirmPresenceModal: React.FC<ConfirmPresenceModalProps> = ({ open, ...props }) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[94] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={props.onClose}
            className="fixed inset-0 bg-on-surface/45 backdrop-blur-sm"
          />
          <ConfirmPresenceModalContent
            key={`${props.shiftTitle}-${props.companyName}`}
            {...props}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
