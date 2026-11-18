import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  KeyRound,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  ShieldAlert,
  Copy,
  Check,
  ScanLine,
  Loader2,
  MapPin,
} from 'lucide-react';
import { generateShiftCheckinCode } from '@/lib/scheduleStorage';

interface DeterministicQrSvgProps {
  value: string;
  size?: number;
}

const DeterministicQrSvg: React.FC<DeterministicQrSvgProps> = ({ value, size = 180 }) => {
  const grid = useMemo(() => {
    const dim = 21;
    const matrix: boolean[][] = Array.from({ length: dim }, () => Array(dim).fill(false));

    const drawFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[startR + r][startC + c] = isBorder || isCenter;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, dim - 7);
    drawFinder(dim - 7, 0);

    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }

    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= dim - 8;
        const inBottomLeft = r >= dim - 8 && c < 8;
        if (inTopLeft || inTopRight || inBottomLeft) continue;

        const bitSeed = (hash ^ (r * 73 + c * 137)) >>> 0;
        matrix[r][c] = bitSeed % 2 === 0;
      }
    }

    return matrix;
  }, [value]);

  const cellSize = size / 21;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`QR Code do turno ${value}`}
      className="rounded-xl bg-white p-2 border border-outline-variant/60 shadow-sm"
    >
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill="#0A132B"
            />
          ) : null
        )
      )}
    </svg>
  );
};

interface CheckinModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (method: 'code' | 'qr', codeValue: string) => void | Promise<void>;
  shiftId?: string;
  shiftTitle: string;
  companyName: string;
  addressLabel?: string;
  expectedCode?: string;
  isSubmitting?: boolean;
}

const WAIT_SECONDS = 5;

const CheckinModalContent: React.FC<Omit<CheckinModalProps, 'open'>> = ({
  onClose,
  onConfirm,
  shiftId,
  shiftTitle,
  companyName,
  addressLabel,
  expectedCode,
  isSubmitting = false,
}) => {
  const expected = (expectedCode || generateShiftCheckinCode(shiftId, companyName)).toUpperCase();

  const [secondsLeft, setSecondsLeft] = useState<number>(WAIT_SECONDS);
  const [method, setMethod] = useState<'qr' | 'code'>('qr');
  const [codeInput, setCodeInput] = useState<string>('');
  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);
  const [qrScannedCode, setQrScannedCode] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const handleSimulateQrScan = () => {
    setValidationError(null);
    setIsScanningQr(true);
    window.setTimeout(() => {
      setIsScanningQr(false);
      setQrScannedCode(expected);
      setCodeInput(expected);
    }, 650);
  };

  const handleConfirmClick = async () => {
    if (secondsLeft > 0 || isSubmitting) return;

    const chosenCode =
      method === 'qr' ? (qrScannedCode || '').trim().toUpperCase() : codeInput.trim().toUpperCase();

    if (method === 'qr' && !qrScannedCode) {
      setValidationError('Escaneie o QR Code disponibilizado no app/site da VaptVaga do contratante.');
      return;
    }

    if (method === 'code' && chosenCode.length < 4) {
      setValidationError(
        'Digite o código completo de check-in fornecido pelo contratante no app/site da VaptVaga.'
      );
      return;
    }

    setValidationError(null);
    await onConfirm(method, chosenCode);
  };

  const progressPercent = ((WAIT_SECONDS - secondsLeft) / WAIT_SECONDS) * 100;
  const isUnlocked = secondsLeft === 0;
  const canConfirm =
    isUnlocked &&
    !isSubmitting &&
    (method === 'qr' ? Boolean(qrScannedCode) : codeInput.trim().length >= 4);

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
          <div className="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0">
            <QrCode size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-primary">
              Confirmação Obrigatória de Turno
            </p>
            <h3 className="font-headline font-extrabold text-base text-on-surface truncate">
              Check-in no Local
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar popup de check-in"
          className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5 overflow-y-auto">
        {/* Shift Info */}
        <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 space-y-1">
          <p className="font-headline font-bold text-sm text-on-surface">{shiftTitle}</p>
          <p className="text-xs font-semibold text-primary">{companyName}</p>
          {addressLabel && (
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1 pt-0.5">
              <MapPin size={12} className="shrink-0" />
              <span>{addressLabel}</span>
            </p>
          )}
        </div>

        {/* Mandatory Security Warning */}
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert size={19} />
          </div>
          <div className="space-y-1">
            <p className="font-headline font-extrabold text-xs sm:text-sm text-amber-950">
              Atenção: Só comece a trabalhar depois de fazer o check-in!
            </p>
            <p className="text-xs text-amber-900 leading-relaxed">
              Solicite ao contratante o <strong>QR Code</strong> ou o{' '}
              <strong>Código do Turno</strong> que ele disponibilizará no{' '}
              <strong>app/site da VaptVaga</strong> dele. Iniciar as atividades antes da
              confirmação impede a validação automática do seu turno e do repasse PIX.
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
                  ? 'Leitura de aviso concluída! Você já pode confirmar o check-in.'
                  : `Aguarde ${secondsLeft}s para liberar o check-in...`}
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

        {/* Method Tabs: QR Code vs Code */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-surface-container-low border border-outline-variant/50">
            <button
              type="button"
              onClick={() => {
                setMethod('qr');
                setValidationError(null);
              }}
              className={`py-2.5 px-3 rounded-xl font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                method === 'qr'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <QrCode size={15} />
              <span>Ler QR Code</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('code');
                setValidationError(null);
              }}
              className={`py-2.5 px-3 rounded-xl font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                method === 'code'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <KeyRound size={15} />
              <span>Digitar Código</span>
            </button>
          </div>

          {method === 'qr' ? (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col items-center text-center gap-3">
              {qrScannedCode ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center">
                    <CheckCircle2 size={34} />
                  </div>
                  <div>
                    <p className="font-headline font-extrabold text-sm text-on-surface">
                      QR Code do Contratante Validado!
                    </p>
                    <p className="text-xs text-secondary font-bold mt-0.5">
                      Código do turno: {qrScannedCode}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative w-32 h-32 rounded-2xl bg-surface-container-lowest border-2 border-dashed border-primary/50 flex flex-col items-center justify-center gap-2 overflow-hidden">
                    {isScanningQr ? (
                      <>
                        <ScanLine size={36} className="text-primary animate-bounce" />
                        <span className="text-[11px] font-bold text-primary">Lendo QR Code...</span>
                      </>
                    ) : (
                      <>
                        <QrCode size={42} className="text-primary/70" />
                        <span className="text-[10px] font-semibold text-on-surface-variant px-2">
                          Aponte para o QR Code da Empresa
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateQrScan}
                    disabled={isScanningQr}
                    className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-primary hover:text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ScanLine size={15} />
                    <span>
                      {isScanningQr ? 'Escaneando...' : 'Escanear QR Code do Contratante'}
                    </span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                  Código do Turno (disponível no VaptVaga do contratante)
                </label>
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.toUpperCase());
                    setValidationError(null);
                  }}
                  placeholder={`Ex: ${expected}`}
                  maxLength={12}
                  className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/70 text-base font-mono font-black tracking-widest text-center text-on-surface focus:border-primary outline-none uppercase"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-on-surface-variant">
                <span>Peça este código ao gerente/responsável no local.</span>
                <button
                  type="button"
                  onClick={() => {
                    setCodeInput(expected);
                    setValidationError(null);
                  }}
                  className="font-bold text-primary hover:underline shrink-0"
                >
                  Preencher ({expected})
                </button>
              </div>
            </div>
          )}

          {validationError && (
            <div className="p-3 rounded-xl bg-error-container text-error text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
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
          onClick={handleConfirmClick}
          disabled={!canConfirm}
          className={`flex-1 py-3 px-5 rounded-xl font-headline font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            canConfirm
              ? 'bg-primary hover:bg-primary-dark text-on-primary shadow-lg shadow-primary/25 active:scale-95'
              : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-75'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Validando GPS e Check-in...</span>
            </>
          ) : !isUnlocked ? (
            <>
              <Clock size={16} />
              <span>Aguarde {secondsLeft}s...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Confirmar Check-in e Iniciar Turno</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export const CheckinModal: React.FC<CheckinModalProps> = ({ open, ...props }) => {
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
          <CheckinModalContent
            key={`${props.shiftId || 'shift'}-${props.shiftTitle}`}
            {...props}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

interface CompanyCheckinPassModalProps {
  open: boolean;
  onClose: () => void;
  shiftId?: string;
  shiftTitle: string;
  companyName: string;
}

export const CompanyCheckinPassModal: React.FC<CompanyCheckinPassModalProps> = ({
  open,
  onClose,
  shiftId,
  shiftTitle,
  companyName,
}) => {
  const [copied, setCopied] = useState(false);
  const checkinCode = generateShiftCheckinCode(shiftId, companyName);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checkinCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[94] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/45 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            className="relative z-[95] w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-secondary">
                    Passe de Entrada do Turno
                  </p>
                  <h3 className="font-headline font-extrabold text-base text-on-surface">
                    QR Code & Código de Check-in
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center space-y-5">
              <div>
                <p className="font-headline font-bold text-sm text-on-surface">{shiftTitle}</p>
                <p className="text-xs font-semibold text-primary mt-0.5">{companyName}</p>
              </div>

              <DeterministicQrSvg value={`VAPTVAGA:CHECKIN:${checkinCode}`} size={196} />

              <div className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
                <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                  Código Alternativo para Digitação
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-black tracking-[0.2em] text-primary">
                    {checkinCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/70 text-on-surface hover:text-primary transition-colors"
                    aria-label="Copiar código de check-in"
                  >
                    {copied ? <Check size={16} className="text-secondary" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Apresente este QR Code ou informe o código acima para o freelancer na chegada,{' '}
                <strong className="text-on-surface">antes de ele iniciar o trabalho</strong>.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
