import { Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { formatBudget } from '@/lib/types';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    category: string;
    budget: string | null;
    shift_date: string;
    company_name: string;
    city: string;
    description: string;
  };
  onApply?: () => void;
  showApply?: boolean;
}

export const JobCard = ({ job, onApply, showApply = true }: JobCardProps) => {
  const dateStr = (() => {
    try {
      const d = new Date(job.shift_date);
      return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return job.shift_date;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            {job.category}
          </span>
          <h3 className="mt-2 text-base font-bold leading-tight text-foreground">
            {job.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={13} />
            {job.company_name} • {job.city}
          </p>
        </div>
        <div className="text-right">
          <p className="tabular-nums text-lg font-black text-success">
            {formatBudget(job.budget)}
          </p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">
            Diária
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary p-2.5 text-sm text-muted-foreground">
        <Calendar size={15} />
        <span>{dateStr}</span>
      </div>

      {showApply && (
        <motion.div whileTap={{ scale: 0.96 }} className="mt-4">
          <Button
            onClick={onApply}
            className="h-12 w-full rounded-xl text-base font-bold"
          >
            Candidatar-se Agora
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
