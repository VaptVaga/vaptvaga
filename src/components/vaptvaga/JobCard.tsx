import { Calendar, MapPin, Zap, Bookmark, Star, ArrowRight, Clock, CheckCircle2, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { formatBudget } from '@/lib/types';
import { formatDistanceKm } from '@/lib/geolocation';
import type { JobDrawerData } from './JobDetailsDrawer';

interface JobCardProps {
  job: JobDrawerData & {
    status?: string | null;
    imageUrl?: string;
    valor_da_diaria?: number | null;
  };
  onApply?: () => void;
  onViewDetails?: () => void;
  showApply?: boolean;
  isApplied?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  gastronomia: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
  eventos: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600',
  logistica: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
  varejo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600',
  cafeteria: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600',
};

export const JobCard = ({
  job,
  onApply,
  onViewDetails,
  showApply = true,
  isApplied = false,
  isSaved = false,
  onToggleSave,
}: JobCardProps) => {
  const dateStr = (() => {
    try {
      const dateToUse = job.shift_date || job.data_do_turno;
      if (!dateToUse) return 'Turno imediato';
      const d = new Date(dateToUse);
      if (Number.isNaN(d.getTime())) return dateToUse;
      return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return job.shift_date || job.data_do_turno || 'Turno imediato';
    }
  })();

  const categoryText = (
    job.category ||
    job.classificacao ||
    job.required_skills?.[0] ||
    'Geral'
  ).toString();
  const normalizedCategory = categoryText.toLowerCase();

  const imageUrl =
    job.imageUrl ||
    Object.entries(CATEGORY_IMAGES).find(([key]) => normalizedCategory.includes(key))?.[1] ||
    CATEGORY_IMAGES.gastronomia;

  const companyName = job.company_name || job.employer?.name || 'Empresa Parceira';
  const locationLabel = [job.bairro, job.city || job.cidade || job.employer?.cidade].filter(Boolean).join(', ') || 'Região Metropolitana';
  const budgetText = formatBudget(job.budget || (job.valor_da_diaria ? `R$ ${job.valor_da_diaria}` : null));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      className="group bg-surface-container-lowest rounded-2xl p-4 md:p-5 shadow-[0_6px_24px_rgba(10,19,43,0.04)] hover:shadow-[0_14px_32px_rgba(10,19,43,0.08)] transition-all duration-300 flex flex-col md:flex-row gap-4 md:gap-5 relative overflow-hidden border border-outline-variant/70"
    >
      {/* Visual Cover */}
      <div
        onClick={onViewDetails}
        className="w-full md:w-52 h-44 md:h-auto rounded-xl overflow-hidden relative flex-shrink-0 bg-surface-container-high cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={job.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-black/20" />
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-sm flex items-center gap-1 ${
            job.isUrgent
              ? 'bg-tertiary text-on-tertiary'
              : 'bg-primary text-on-primary'
          }`}
        >
          <Zap size={12} className="fill-current" />
          {job.isUrgent ? 'Urgente Hoje' : 'Destaque'}
        </span>
        <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1 drop-shadow">
          <Clock size={13} /> {job.horario || 'Turno 6h'}
        </div>
      </div>

      {/* Body Details */}
      <div className="flex flex-col justify-between flex-1 gap-4">
        <div className="flex flex-col gap-2">
          {/* Company & Bookmark */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center uppercase shrink-0">
                {companyName.substring(0, 2)}
              </div>
              <span className="text-xs font-semibold text-on-surface truncate">
                {companyName}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline shrink-0" />
              <span className="text-xs text-secondary font-bold flex items-center gap-0.5 shrink-0">
                <Star size={13} className="fill-current" /> 4.9
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleSave}
              aria-label={isSaved ? 'Remover dos salvos' : 'Salvar vaga'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                isSaved
                  ? 'bg-primary-container text-primary'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Job Title */}
          <h2
            onClick={onViewDetails}
            className="text-lg md:text-xl font-bold font-headline text-on-surface group-hover:text-primary transition-colors line-clamp-2 cursor-pointer"
          >
            {job.title || 'Vaga Freelancer'}
          </h2>

          {/* Logistics Badges */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-primary shrink-0" />
              <span className="capitalize">{dateStr}</span>
            </span>
            <button
              type="button"
              onClick={onViewDetails}
              className="flex items-center gap-1.5 hover:text-primary transition-colors text-left"
            >
              <MapPin size={15} className="text-primary shrink-0" />
              <span>{locationLabel}</span>
              {job.distanceKm !== null && job.distanceKm !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                  <Compass size={10} />
                  {formatDistanceKm(job.distanceKm)}
                </span>
              )}
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface">
              {categoryText}
            </span>
            {job.required_skills?.slice(0, 2).map((skill: string) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-container-low text-on-surface-variant"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Financial Value & CTA Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 bg-surface-container-low -mx-4 md:-mx-5 -mb-4 md:-mb-5 px-4 md:px-5 py-3.5 rounded-b-2xl border-t border-outline-variant/50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-extrabold font-headline text-primary">
                {budgetText}
              </span>
              <span className="text-xs font-semibold text-on-surface-variant">/turno</span>
            </div>
            <span className="text-[11px] font-bold text-secondary flex items-center gap-1">
              <Zap size={12} className="fill-current" /> Pagamento rápido via PIX
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onViewDetails && (
              <Button
                type="button"
                variant="outline"
                onClick={onViewDetails}
                className="h-10 px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant flex-1 sm:flex-none"
              >
                Detalhes
              </Button>
            )}
            {showApply && !isApplied ? (
              <Button
                type="button"
                onClick={onApply}
                className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-dark text-on-primary text-xs font-bold shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center gap-1.5 flex-1 sm:flex-none"
              >
                <span>Candidatar</span>
                <ArrowRight size={15} />
              </Button>
            ) : (
              <span className="h-10 px-4 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-bold flex items-center justify-center gap-1.5 flex-1 sm:flex-none">
                <CheckCircle2 size={15} />
                <span>Candidatado</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
