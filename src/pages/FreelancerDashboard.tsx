import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, Loader2 } from 'lucide-react';
import { JobCard } from '@/components/vaptvaga/JobCard';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { BottomNav } from '@/components/vaptvaga/BottomNav';
import { useAuth } from '@/lib/authContext';
import { useJobs, useApplyToJob, useMonthlyApplicationCount } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const isFree = user?.subscriber !== 'premium';
  const limit = 2;

  const { data: jobs, isLoading } = useJobs({ status: 'open' });
  const { data: monthlyCount = 0 } = useMonthlyApplicationCount(user?.id);
  const applyMutation = useApplyToJob();

  const handleApply = async (jobId: string) => {
    if (!user) return;
    if (appliedJobs.has(jobId)) {
      toast({ title: 'Você já se candidatou', description: 'Aguarde o contato da empresa.' });
      return;
    }
    if (isFree && (monthlyCount + appliedJobs.size) >= limit) {
      setShowPaywall(true);
      return;
    }
    try {
      await applyMutation.mutateAsync({ job_id: jobId, freelancer_id: user.id });
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      toast({
        title: '✅ Candidatura enviada!',
        description: 'A empresa entrará em contato via WhatsApp.',
      });
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        toast({ title: 'Você já se candidatou a esta vaga' });
        setAppliedJobs((prev) => new Set(prev).add(jobId));
      } else {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      }
    }
  };

  const remaining = Math.max(0, limit - (monthlyCount + appliedJobs.size));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pb-2 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Olá, {user?.name?.split(' ')[0]} 👋</p>
            <h1 className="text-xl font-black text-foreground">Vagas na sua região</h1>
          </div>
          {isFree && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {remaining} restantes
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground">
          <MapPin size={16} />
          <span>{user?.cidade || 'Todas as cidades'}</span>
          <button className="ml-auto text-primary">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3 px-5">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={{
                id: job.id,
                title: job.title,
                category: job.classificacao || 'Geral',
                budget: job.budget,
                shift_date: job.created_at,
                company_name: job.employer?.name || 'Empresa',
                city: job.cidade || '',
                description: job.description || '',
              }}
              onApply={() => handleApply(job.id)}
              showApply={!appliedJobs.has(job.id)}
            />
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-bold">Nenhuma vaga disponível</p>
            <p className="mt-1 text-sm">Volte mais tarde para conferir novas oportunidades.</p>
          </div>
        )}
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="freelancer" />
      <BottomNav />
    </div>
  );
};

export default FreelancerDashboard;
