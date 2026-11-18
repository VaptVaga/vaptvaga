import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Store,
  CheckCircle2,
  Zap,
  Bookmark,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { formatBudget } from '@/lib/types';
import { LocationMap } from './LocationMap';
import type { GeoCoordinates } from '@/lib/geolocation';

export interface JobDrawerData {
  id: string;
  title: string;
  description?: string | null;
  budget?: string | null;
  valor_da_diaria?: number | null;
  cidade?: string | null;
  bairro?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  data_do_turno?: string | null;
  shift_date?: string | null;
  horario?: string | null;
  required_skills?: string[] | null;
  classificacao?: string | null;
  category?: string | null;
  company_name?: string | null;
  employer?: {
    id?: string;
    name?: string | null;
    cidade?: string | null;
    avatar_url?: string | null;
  } | null;
  perks?: string[];
  requirements?: string[];
  isUrgent?: boolean;
}

interface JobDetailsDrawerProps {
  job: JobDrawerData | null;
  open: boolean;
  onClose: () => void;
  onApply?: (job: JobDrawerData) => void;
  onOpenChat?: (job: JobDrawerData) => void;
  isApplied?: boolean;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  userCoords?: GeoCoordinates | null;
}

export const JobDetailsDrawer: React.FC<JobDetailsDrawerProps> = ({
  job,
  open,
  onClose,
  onApply,
  onOpenChat,
  isApplied = false,
  isSaved = false,
  onToggleSave,
  userCoords,
}) => {
  if (!job) return null;

  const companyName = job.company_name || job.employer?.name || 'Empresa Parceira';
  const cityLabel = [job.bairro, job.cidade || job.city || job.employer?.cidade].filter(Boolean).join(', ') || 'Região Metropolitana';
  const budgetLabel = formatBudget(
    job.budget || (job.valor_da_diaria ? `R$ ${job.valor_da_diaria}` : null)
  );
  const rawDate = job.shift_date || job.data_do_turno;
  const formattedDate = (() => {
    if (!rawDate) return 'Turno imediato / A combinar';
    try {
      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return rawDate;
      return d.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
      });
    } catch {
      return rawDate;
    }
  })();

  const requirements =
    job.requirements && job.requirements.length > 0
      ? job.requirements
      : [
          'Pontualidade e boa comunicação com clientes e equipe.',
          'Traje operacional adequado (roupa escura / sapato fechado).',
          ...(job.required_skills?.map((s) => `Experiência ou habilidade em ${s}.`) || []),
        ];

  const perks =
    job.perks && job.perks.length > 0
      ? job.perks
      : ['Pagamento via PIX após o turno', 'Refeição no local', 'Ambiente verificado VaptVaga'];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/35 backdrop-blur-sm"
          />

          {/* Slide-in Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative z-[81] w-full max-w-lg bg-surface-container-lowest h-full shadow-[-24px_0_64px_rgba(10,19,43,0.14)] flex flex-col overflow-hidden"
          >
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/60 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <h2 className="font-headline font-extrabold text-lg text-on-surface">
                  Detalhes da Vaga
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar detalhes"
                className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <X size={18} />
              </button>
            </header>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Card */}
              <section className="rounded-2xl bg-surface-container-low p-5 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container text-primary font-headline font-black text-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {job.employer?.avatar_url ? (
                      <img src={job.employer.avatar_url} alt={companyName} className="w-full h-full object-cover" />
                    ) : (
                      companyName.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                        <Store size={14} />
                        {companyName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                        <ShieldCheck size={11} /> Verificada
                      </span>
                    </div>
                    <h1 className="font-headline text-xl font-extrabold text-on-surface leading-snug">
                      {job.title}
                    </h1>
                  </div>
                </div>

                {/* Financial Box */}
                <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60">
                  <div>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-on-surface-variant">
                      Valor Líquido da Diária
                    </p>
                    <p className="text-2xl font-headline font-black text-primary mt-0.5">
                      {budgetLabel}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold flex items-center gap-1">
                    <Zap size={13} className="fill-current" />
                    <span>PIX Garantido</span>
                  </div>
                </div>
              </section>

              {/* Summary Logistics */}
              <section className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                      Data do Turno
                    </p>
                    <p className="text-sm font-bold text-on-surface capitalize">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                      Horário Previsto
                    </p>
                    <p className="text-sm font-bold text-on-surface">
                      {job.horario || '18:00 às 00:00 (6 horas)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                      Localização
                    </p>
                    <p className="text-sm font-bold text-on-surface">{cityLabel}</p>
                  </div>
                </div>
              </section>

              {/* Interactive Location Map & Route */}
              <section className="space-y-2.5">
                <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-secondary" />
                  Mapa & Como Chegar
                </h3>
                <LocationMap
                  title={companyName}
                  addressLabel={cityLabel}
                  latitude={job.latitude}
                  longitude={job.longitude}
                  bairro={job.bairro}
                  cidade={job.cidade || job.city || job.employer?.cidade}
                  userCoords={userCoords}
                  heightClassName="h-44"
                />
              </section>

              {/* Description */}
              <section className="space-y-2.5">
                <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-primary" />
                  Descrição das Atividades
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {job.description ||
                    'Oportunidade para atuação imediata em turno operacional. Buscamos profissional proativo, com facilidade de trabalho em equipe e foco em atendimento ágil e cordial.'}
                </p>
              </section>

              {/* Benefits / Perks */}
              <section className="space-y-2.5">
                <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-secondary" />
                  Benefícios Inclusos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {perks.map((perk) => (
                    <span
                      key={perk}
                      className="px-3 py-1.5 rounded-full bg-secondary-container/70 text-on-secondary-container text-xs font-bold"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </section>

              {/* Requirements */}
              <section className="space-y-2.5">
                <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-primary" />
                  Requisitos
                </h3>
                <ul className="space-y-2.5">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                      <CheckCircle2 size={17} className="text-primary shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Sticky Footer Actions */}
            <footer className="sticky bottom-0 bg-surface-container-lowest border-t border-outline-variant/60 p-5 space-y-2.5">
              {isApplied ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 py-3.5 px-4 rounded-full bg-secondary-container text-on-secondary-container font-headline font-bold text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>Candidatura Enviada</span>
                  </div>
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={() => onOpenChat(job)}
                      className="py-3.5 px-5 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm flex items-center gap-2 transition-colors"
                    >
                      <MessageSquare size={17} />
                      <span>Chat</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onApply?.(job)}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark hover:brightness-105 text-on-primary font-headline font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={18} className="fill-current" />
                  <span>Candidatura em 1 Clique</span>
                </button>
              )}

              {onToggleSave && (
                <button
                  type="button"
                  onClick={() => onToggleSave(job.id)}
                  className={`w-full py-3 rounded-full font-headline font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                    isSaved
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Bookmark size={15} className={isSaved ? 'fill-current' : ''} />
                  <span>{isSaved ? 'Vaga salva nos favoritos' : 'Salvar para ver depois'}</span>
                </button>
              )}
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
