import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Loader2,
  Search,
  BellRing,
  Zap,
  SlidersHorizontal,
  Navigation,
  ChevronDown,
  Utensils,
  PartyPopper,
  Truck,
  Package,
  Coffee,
  Briefcase,
  Bookmark,
  Map as MapIcon,
  List,
  LocateFixed,
  Compass,
} from 'lucide-react';
import { JobCard } from '@/components/vaptvaga/JobCard';
import { JobDetailsDrawer, type JobDrawerData } from '@/components/vaptvaga/JobDetailsDrawer';
import { JobsMapCanvas } from '@/components/vaptvaga/JobsMapCanvas';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  useJobs,
  useApplyToJob,
  useMonthlyApplicationCount,
  useMyApplications,
} from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';
import { DEMO_JOBS } from '@/lib/demoData';
import {
  type GeoCoordinates,
  resolveCoordinates,
  calculateDistanceKm,
  detectUserLocation,
} from '@/lib/geolocation';

const categories = [
  { id: 'all', name: 'Todas', icon: null },
  { id: 'gastronomia', name: 'Gastronomia & Salão', icon: Utensils },
  { id: 'eventos', name: 'Eventos & Festas', icon: PartyPopper },
  { id: 'logistica', name: 'Logística & Entregas', icon: Truck },
  { id: 'varejo', name: 'Varejo & Estoque', icon: Package },
  { id: 'cafeteria', name: 'Cafeterias', icon: Coffee },
];

type HighlightFilter = 'all' | 'urgent' | 'saved';

const FreelancerFeed = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showPaywall, setShowPaywall] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const [highlightFilter, setHighlightFilter] = useState<HighlightFilter>('all');
  const [alertsActive, setAlertsActive] = useState(false);
  const [drawerJob, setDrawerJob] = useState<JobDrawerData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapJobId, setSelectedMapJobId] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<GeoCoordinates | null>(null);
  const [gpsLocationLabel, setGpsLocationLabel] = useState<string | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(true);

  // Filter state
  const searchText = searchParams.get('q') || '';
  const setSearchText = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('q', val);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };
  const [filterCidade, setFilterCidade] = useState('');

  const isFree = profile?.subscriber !== 'premium';
  const limit = 2;

  const userCoords = useMemo<GeoCoordinates>(
    () => gpsCoords || resolveCoordinates(profile || undefined),
    [gpsCoords, profile]
  );

  const handleDetectGps = async () => {
    setIsLocatingGps(true);
    try {
      const detected = await detectUserLocation();
      setGpsCoords({ latitude: detected.latitude, longitude: detected.longitude });
      const label = [detected.bairro, detected.cidade].filter(Boolean).join(', ');
      setGpsLocationLabel(label || 'Localização GPS ativa');
      setSortByDistance(true);
      toast({
        title: '📍 GPS conectado!',
        description: label
          ? `Vagas ordenadas pela distância até ${label}.`
          : 'Distâncias atualizadas com base na sua posição atual.',
      });
    } catch (err: unknown) {
      toast({
        title: 'Não foi possível acessar o GPS',
        description: err instanceof Error ? err.message : 'Verifique as permissões de localização.',
        variant: 'destructive',
      });
    } finally {
      setIsLocatingGps(false);
    }
  };

  const { data: supabaseJobs, isLoading, error, isError } = useJobs({ status: 'open' });
  const { data: myApplications } = useMyApplications(user?.id);
  const { data: monthlyCount = 0 } = useMonthlyApplicationCount(user?.id);
  const applyMutation = useApplyToJob();

  const alreadyAppliedIds = useMemo(
    () =>
      new Set<string>([
        ...Array.from(appliedJobs),
        ...(myApplications?.map((a) => a.job_id) || []),
      ]),
    [appliedJobs, myApplications]
  );

  // Merge Supabase jobs with demo jobs fallback when DB is empty
  const allJobs: JobDrawerData[] = useMemo(() => {
    const realJobs =
      supabaseJobs && supabaseJobs.length > 0
        ? (supabaseJobs as unknown as JobDrawerData[])
        : [];
    const baseList = realJobs.length > 0 ? realJobs : DEMO_JOBS;
    return baseList.map((job) => ({
      ...job,
      distanceKm: calculateDistanceKm(userCoords, resolveCoordinates(job)),
    }));
  }, [supabaseJobs, userCoords]);

  const filteredJobs = useMemo(() => {
    const filtered = allJobs.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const company = (job.company_name || job.employer?.name || '').toLowerCase();
      const desc = (job.description || '').toLowerCase();
      const city = (job.cidade || job.city || '').toLowerCase();
      const skillsText = [
        job.category,
        job.classificacao,
        ...(job.required_skills || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        if (
          !title.includes(q) &&
          !company.includes(q) &&
          !desc.includes(q) &&
          !skillsText.includes(q)
        ) {
          return false;
        }
      }

      if (filterCidade && !city.includes(filterCidade.toLowerCase())) {
        return false;
      }

      if (activeCategory !== 'all') {
        if (!skillsText.includes(activeCategory) && !title.includes(activeCategory)) {
          return false;
        }
      }

      if (highlightFilter === 'urgent' && !job.isUrgent) {
        return false;
      }

      if (highlightFilter === 'saved' && !savedJobs.has(job.id)) {
        return false;
      }

      return true;
    });

    if (sortByDistance) {
      return [...filtered].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }
    return filtered;
  }, [allJobs, searchText, filterCidade, activeCategory, highlightFilter, savedJobs, sortByDistance]);

  const handleApply = async (jobId: string, jobTitle?: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (alreadyAppliedIds.has(jobId)) {
      toast({ title: 'Você já se candidatou', description: 'Aguarde o contato da empresa.' });
      return;
    }
    if (isFree && monthlyCount + appliedJobs.size >= limit) {
      setShowPaywall(true);
      return;
    }

    if (jobId.startsWith('demo-')) {
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      toast({
        title: '✅ Candidatura enviada!',
        description: `Sua aplicação para "${jobTitle || 'a vaga'}" foi enviada. Acompanhe em Minhas Candidaturas.`,
      });
      return;
    }

    try {
      await applyMutation.mutateAsync({ job_id: jobId, freelancer_id: user.id });
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      toast({
        title: '✅ Candidatura enviada!',
        description: 'A empresa entrará em contato exclusivamente pelo Chat Oficial no aplicativo.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tente novamente.';
      if (msg.includes('duplicate')) {
        toast({ title: 'Você já se candidatou a esta vaga' });
        setAppliedJobs((prev) => new Set(prev).add(jobId));
      } else {
        toast({ title: 'Erro', description: msg, variant: 'destructive' });
      }
    }
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        toast({ title: 'Vaga removida dos salvos' });
      } else {
        next.add(jobId);
        toast({ title: 'Vaga salva nos favoritos!' });
      }
      return next;
    });
  };

  const handleToggleAlerts = () => {
    setAlertsActive((prev) => !prev);
    toast({
      title: alertsActive ? 'Alertas pausados' : '🔔 Alerta de vagas ativado!',
      description: alertsActive
        ? 'Você pode reativar notificações quando quiser.'
        : 'Você será avisado assim que surgirem turnos na sua região.',
    });
  };

  const remaining = Math.max(0, limit - (monthlyCount + appliedJobs.size));

  return (
    <div className="min-h-screen bg-transparent w-full font-body">
      {/* Top Stat Bar & Page Context Header */}
      <section className="flex flex-col gap-6 px-4 md:px-8 pt-6 mb-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Tempo Real
              </span>
              <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                <MapPin size={14} className="text-primary" />
                Sua localização: {gpsLocationLabel || profile?.cidade || 'Belo Horizonte'}
              </span>
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={isLocatingGps}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest hover:bg-primary-container text-primary text-xs font-bold border border-outline-variant/70 transition-colors disabled:opacity-60"
              >
                {isLocatingGps ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <LocateFixed size={12} />
                )}
                <span>{gpsCoords ? 'GPS Ativo ✓' : 'Usar meu GPS'}</span>
              </button>
              {isFree && (
                <span className="text-xs font-bold text-primary bg-primary-container px-2.5 py-0.5 rounded-full">
                  {remaining} {remaining === 1 ? 'candidatura grátis restante' : 'candidaturas grátis restantes'} neste mês
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-on-surface mt-1">
              Oportunidades em Aberto
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant font-normal">
              Encontre turnos imediatos, diárias com PIX garantido e vagas freelancer perto de você.
            </p>
          </div>

          {/* Action & Pulse Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleAlerts}
              className={`h-11 px-5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
                alertsActive
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container-lowest hover:bg-surface-container text-primary border border-outline-variant/70'
              }`}
            >
              <BellRing size={17} />
              <span>{alertsActive ? 'Alertas Ativos ✓' : 'Criar Alerta de Vagas'}</span>
            </button>
            <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2 rounded-2xl border border-outline-variant/70 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                <Zap size={18} className="fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Diárias Ativas Hoje
                </span>
                <span className="text-sm font-headline font-bold text-on-surface">
                  R$ 48.200 <span className="text-xs text-secondary font-semibold">• {allJobs.length} vagas</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters Dock */}
        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-lowest focus:border-primary/40 focus:ring-2 focus:ring-primary/15 transition-all"
                placeholder="Cargo, função ou nome da empresa..."
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="md:col-span-4 relative">
              <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={17} />
              <select
                className="w-full h-12 pl-11 pr-8 rounded-xl bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface appearance-none focus:outline-none focus:bg-surface-container-lowest focus:border-primary/40 transition-all font-medium cursor-pointer"
                value={filterCidade}
                onChange={(e) => setFilterCidade(e.target.value)}
              >
                <option value="">Todas as Regiões</option>
                <option value="Belo Horizonte">Belo Horizonte & Contagem - MG</option>
                <option value="São Paulo">São Paulo e Grande SP</option>
                <option value="Rio de Janeiro">Rio de Janeiro & Niterói</option>
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                size={17}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setSearchText('');
                  setFilterCidade('');
                  setActiveCategory('all');
                  setHighlightFilter('all');
                }}
                className="w-full h-12 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-2 border border-outline-variant/60 transition-all"
              >
                <SlidersHorizontal size={16} />
                <span>Limpar Filtros</span>
              </button>
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {cat.icon && (
                  <cat.icon
                    size={15}
                    className={activeCategory === cat.id ? 'text-on-primary' : 'text-primary'}
                  />
                )}
                {cat.name}
              </button>
            ))}
          </div>

          {/* Quick Highlights Filter & View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider pr-1">
                Destaques:
              </span>
              <button
                type="button"
                onClick={() => setHighlightFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  highlightFilter === 'all'
                    ? 'bg-on-surface text-surface'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Todas ({allJobs.length})
              </button>
              <button
                type="button"
                onClick={() => setHighlightFilter(highlightFilter === 'urgent' ? 'all' : 'urgent')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                  highlightFilter === 'urgent'
                    ? 'bg-tertiary text-on-tertiary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-tertiary-container hover:text-on-tertiary-container'
                }`}
              >
                <Zap size={12} /> Urgentes Hoje
              </button>
              <button
                type="button"
                onClick={() => setHighlightFilter(highlightFilter === 'saved' ? 'all' : 'saved')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                  highlightFilter === 'saved'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-primary'
                }`}
              >
                <Bookmark size={12} /> Salvas ({savedJobs.size})
              </button>
              <button
                type="button"
                onClick={() => setSortByDistance((prev) => !prev)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                  sortByDistance
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Compass size={12} /> Mais próximas
              </button>
            </div>

            {/* List / Map Toggle */}
            <div className="inline-flex items-center p-1 rounded-full bg-surface-container-low border border-outline-variant/60">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-headline font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <List size={14} />
                <span>Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-headline font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <MapIcon size={14} />
                <span>Mapa</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="px-4 md:px-8 w-full max-w-7xl mx-auto pb-8">
        {viewMode === 'map' ? (
          <JobsMapCanvas
            jobs={filteredJobs}
            userCoords={userCoords}
            selectedJobId={selectedMapJobId}
            onSelectJob={(job) => setSelectedMapJobId(job.id)}
            onOpenDetails={(job) => setDrawerJob(job)}
            onApply={(job) => handleApply(job.id, job.title)}
            alreadyAppliedIds={alreadyAppliedIds}
          />
        ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Column: Job Cards Grid */}
          <div className="xl:col-span-8 flex flex-col gap-5">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                  <Loader2 className="animate-spin mb-4 text-primary" size={32} />
                  <p>Buscando oportunidades incríveis...</p>
                </div>
              ) : isError && allJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-error">
                  <Briefcase className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="font-bold">Ocorreu um erro ao buscar vagas.</p>
                  <p className="text-sm opacity-80">{error?.message || 'Tente novamente mais tarde.'}</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={() => handleApply(job.id, job.title)}
                    onViewDetails={() => setDrawerJob(job)}
                    isApplied={alreadyAppliedIds.has(job.id)}
                    isSaved={savedJobs.has(job.id)}
                    onToggleSave={() => handleToggleSave(job.id)}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed border-outline bg-surface-container-lowest p-12 text-center"
                >
                  <Briefcase className="mx-auto h-12 w-12 text-on-surface-variant mb-4 opacity-50" />
                  <h3 className="text-lg font-bold text-on-surface font-headline">
                    Nenhuma vaga encontrada
                  </h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Tente ajustar os filtros, categoria ou cidade da sua busca.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText('');
                      setFilterCidade('');
                      setActiveCategory('all');
                      setHighlightFilter('all');
                    }}
                    className="mt-6 px-5 py-2.5 rounded-full bg-primary-container text-primary text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    Limpar todos os filtros
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Editorial Sidebar */}
          <div className="hidden xl:flex xl:col-span-4 flex-col gap-6 sticky top-28">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/70 shadow-sm flex flex-col gap-4">
              <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                <Zap size={20} className="text-primary fill-current" />
                Vagas Urgentes
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Turnos urgentes para hoje oferecem até{' '}
                <span className="font-bold text-on-surface">30% a mais</span> na diária padrão e
                aprovação imediata.
              </p>
              <button
                type="button"
                onClick={() => setHighlightFilter('urgent')}
                className="w-full mt-1 h-11 rounded-xl bg-primary-container text-primary font-headline font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors"
              >
                Filtrar vagas urgentes
              </button>
            </div>

            <div className="bg-gradient-to-br from-primary-dark via-primary to-[#002b7a] rounded-2xl p-6 shadow-lg text-on-primary flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <span className="inline-flex self-start px-2.5 py-0.5 rounded-full bg-white/15 text-[#6ffbbe] text-[10px] font-bold uppercase tracking-wider">
                Vapt PRO • R$ 14,90/mês
              </span>
              <h3 className="font-headline font-extrabold text-xl relative z-10">
                Candidate-se sem limites
              </h3>
              <p className="text-sm text-blue-100 relative z-10 leading-relaxed">
                Remova o limite mensal de 2 candidaturas, ganhe o selo PRO e apareça no topo para
                as empresas.
              </p>
              <button
                type="button"
                onClick={() => navigate('/planos')}
                className="w-full mt-1 h-11 rounded-xl bg-surface-container-lowest text-primary font-headline font-bold text-sm hover:bg-primary-container transition-all active:scale-95 relative z-10 shadow-sm"
              >
                Conhecer Planos
              </button>
            </div>
          </div>
        </div>
        )}
      </section>

      <JobDetailsDrawer
        job={drawerJob}
        open={!!drawerJob}
        onClose={() => setDrawerJob(null)}
        onApply={(j) => handleApply(j.id, j.title)}
        onOpenChat={() => {
          setDrawerJob(null);
          navigate('/chat');
        }}
        isApplied={drawerJob ? alreadyAppliedIds.has(drawerJob.id) : false}
        isSaved={drawerJob ? savedJobs.has(drawerJob.id) : false}
        onToggleSave={handleToggleSave}
        userCoords={userCoords}
      />

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="freelancer" />
    </div>
  );
};

export default FreelancerFeed;
