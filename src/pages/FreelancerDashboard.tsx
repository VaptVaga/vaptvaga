import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Filter, Loader2, Search } from 'lucide-react';
import { JobCard } from '@/components/vaptvaga/JobCard';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { BottomNav } from '@/components/vaptvaga/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs, useApplyToJob, useMonthlyApplicationCount } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const skillFilterOptions = [
  'Garçom', 'Barman', 'Cozinheiro', 'Auxiliar de Cozinha', 'Chapa',
  'Vendedor', 'Operador de Caixa', 'Atendente', 'Faxineiro', 'Copeira',
  'Promotor', 'Hostess', 'Recepcionista', 'Segurança', 'Motoboy',
  'Entregador', 'DJ', 'Fotógrafo', 'Montador', 'Carregador',
];

const FreelancerDashboard = () => {
  const { profile, user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [filterCidade, setFilterCidade] = useState('');
  const [filterBairro, setFilterBairro] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  const isFree = profile?.subscriber !== 'premium';
  const limit = 2;

  const activeFilters = {
    status: 'open' as const,
    ...(filterCidade ? { cidade: filterCidade } : {}),
    ...(filterBairro ? { bairro: filterBairro } : {}),
    ...(filterSkill ? { skill: filterSkill } : {}),
    ...(searchText.trim() ? { search: searchText.trim() } : {}),
  };

  const { data: jobs, isLoading } = useJobs(activeFilters);
  const { data: monthlyCount = 0 } = useMonthlyApplicationCount(user?.id);
  const applyMutation = useApplyToJob();

  const activeFilterCount = [filterCidade, filterBairro, filterSkill, searchText.trim()].filter(Boolean).length;

  const clearFilters = () => {
    setSearchText('');
    setFilterCidade('');
    setFilterBairro('');
    setFilterSkill('');
  };

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
            <p className="text-sm text-muted-foreground">Olá, {profile?.name?.split(' ')[0]} 👋</p>
            <h1 className="text-xl font-black text-foreground">Vagas na sua região</h1>
          </div>
          {isFree && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {remaining} restantes
            </span>
          )}
        </div>

        {/* Search bar + filter toggle */}
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar vagas..."
              className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground'
            }`}
          >
            <Filter size={18} />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Filtros</p>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs font-medium text-primary">
                      Limpar tudo
                    </button>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Cidade</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={filterCidade}
                      onChange={(e) => setFilterCidade(e.target.value)}
                      placeholder="Ex: São Paulo"
                      className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Bairro */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Bairro</label>
                  <input
                    value={filterBairro}
                    onChange={(e) => setFilterBairro(e.target.value)}
                    placeholder="Ex: Centro"
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Skill */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Habilidade</label>
                  <div className="flex flex-wrap gap-1.5">
                    {skillFilterOptions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => setFilterSkill(filterSkill === skill ? '' : skill)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          filterSkill === skill
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                category: job.required_skills?.[0] || 'Geral',
                budget: job.budget,
                shift_date: (job as any).data_do_turno || job.created_at,
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
            <p className="text-lg font-bold">Nenhuma vaga encontrada</p>
            <p className="mt-1 text-sm">
              {activeFilterCount > 0
                ? 'Tente ajustar os filtros para ver mais resultados.'
                : 'Volte mais tarde para conferir novas oportunidades.'}
            </p>
            {activeFilterCount > 0 && (
              <Button variant={"outline" as any} size={"sm" as any} onClick={clearFilters} className="mt-4">
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="freelancer" />
      <BottomNav />
    </div>
  );
};

export default FreelancerDashboard;
