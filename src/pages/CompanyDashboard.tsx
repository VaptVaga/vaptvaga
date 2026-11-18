import { useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Lock,
  MessageSquare,
  Loader2,
  Briefcase,
  Users,
  Eye,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  Video,
  QrCode,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { CompanyCheckinPassModal } from '@/components/vaptvaga/CheckinModal';
import { useAuth } from '@/contexts/AuthContext';
import { useMyJobs, useApplicationsForJob } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';
import { formatBudget } from '@/lib/types';
import { DEMO_COMPANY_JOBS, DEMO_APPLICANTS_BY_JOB } from '@/lib/demoData';

type CompanyViewTab = 'overview' | 'jobs' | 'candidates';

const CompanyDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [hiredIds, setHiredIds] = useState<Set<string>>(new Set());
  const [checkinPassJob, setCheckinPassJob] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const isFree = profile?.subscriber !== 'premium';
  const queryFilter = (searchParams.get('q') || '').toLowerCase();

  const activeTab: CompanyViewTab = useMemo(() => {
    if (location.pathname.startsWith('/company/vagas')) return 'jobs';
    if (location.pathname.startsWith('/company/candidatos')) return 'candidates';
    return 'overview';
  }, [location.pathname]);

  const { data: realJobs, isLoading } = useMyJobs(user?.id);

  const displayJobs = useMemo(() => {
    const base = realJobs && realJobs.length > 0 ? realJobs : DEMO_COMPANY_JOBS;
    if (!queryFilter) return base;
    return base.filter((j) => {
      const text = `${j.title} ${j.cidade || ''} ${j.bairro || ''} ${j.description || ''}`.toLowerCase();
      return text.includes(queryFilter);
    });
  }, [realJobs, queryFilter]);

  const activeJob = useMemo(
    () => displayJobs.find((j) => j.id === selectedJobId) || displayJobs[0] || null,
    [displayJobs, selectedJobId]
  );

  const isRealJobSelected = activeJob && !String(activeJob.id).startsWith('comp-job-');
  const { data: realApplications, isLoading: loadingApps } = useApplicationsForJob(
    isRealJobSelected ? activeJob?.id : undefined
  );

  const displayApplicants = useMemo(() => {
    if (isRealJobSelected && realApplications && realApplications.length > 0) {
      return realApplications.map((app) => ({
        id: app.id,
        freelancer_id: app.freelancer_id,
        name: app.freelancer?.name || 'Freelancer Verificado',
        titulo: 'Profissional Operacional',
        rating: 4.9,
        turnos: 18,
        cidade: app.freelancer?.cidade || profile?.cidade || 'Região Local',
        skills: app.freelancer?.skills || ['Atendimento', 'Pontualidade'],
        telefone: app.freelancer?.telefone || null,
        bio: 'Candidato verificado pelo VaptVaga pronto para atuação imediata no turno.',
        avatar_url: app.freelancer?.avatar_url || undefined,
      }));
    }
    if (!isRealJobSelected && activeJob) {
      return DEMO_APPLICANTS_BY_JOB[activeJob.id] || DEMO_APPLICANTS_BY_JOB['comp-job-1'];
    }
    return [];
  }, [isRealJobSelected, realApplications, activeJob, profile?.cidade]);

  const handleOpenChat = (index: number) => {
    if (isFree && index > 0) {
      setShowPaywall(true);
      return;
    }
    navigate('/chat');
  };

  const handleConfirmHire = (candId: string, candName: string) => {
    setHiredIds((prev) => new Set(prev).add(candId));
    toast({
      title: '🎉 Contratação confirmada!',
      description: `${candName} foi confirmado(a) para o turno e já recebeu a notificação.`,
    });
  };

  const companyName = profile?.name || 'Minha Empresa';
  const totalCandidatesCount = isRealJobSelected
    ? displayApplicants.length
    : Object.values(DEMO_APPLICANTS_BY_JOB).reduce((acc, list) => acc + list.length, 0);

  return (
    <div className="min-h-screen bg-transparent w-full font-body">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 lg:py-8 space-y-8">
        {/* Operational Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                <Crown size={13} />
                {isFree ? 'Plano Beta Gratuito' : 'Negócio Ágil PRO'}
              </span>
              {profile?.cidade && (
                <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                  <MapPin size={13} className="text-primary" /> {profile.cidade}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
              Olá, {companyName}
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant mt-1">
              Gerencie suas vagas urgentes, avalie candidatos e confirme turnos em minutos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/company/financeiro')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/70 font-headline font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={17} className="text-secondary" />
              <span>Financeiro & PIX</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/company/agenda')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/70 font-headline font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Calendar size={17} className="text-primary" />
              <span>Agenda & Escala</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/post-job')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap size={17} className="fill-current" />
              <span>+ Publicar Urgência</span>
            </button>
          </div>
        </header>

        {/* Sub-navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-outline-variant/60">
          {[
            { id: 'overview', label: 'Visão Geral', path: '/company/dashboard' },
            { id: 'jobs', label: `Minhas Vagas (${displayJobs.length})`, path: '/company/vagas' },
            {
              id: 'candidates',
              label: `Candidatos (${totalCandidatesCount})`,
              path: '/company/candidatos',
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`px-5 py-2.5 rounded-t-xl font-headline font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-primary text-primary bg-primary-container/30'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* KPI Stats Grid (4 cards) */}
        {activeTab === 'overview' && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <div className="bg-surface-container-lowest p-5 md:p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Vagas Ativas
                </span>
                <Briefcase size={18} className="text-primary" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-headline font-black text-on-surface">
                  {displayJobs.length}
                </span>
                <span className="text-xs font-bold text-secondary">Em aberto</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 md:p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Candidatos
                </span>
                <Users size={18} className="text-secondary" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-headline font-black text-on-surface">
                  {totalCandidatesCount}
                </span>
                <span className="text-xs font-bold text-secondary">Prontos hoje</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 md:p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Mensagens
                </span>
                <MessageSquare size={18} className="text-primary" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-headline font-black text-on-surface">5</span>
                <span className="text-xs font-bold text-error">2 não lidas</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 md:p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Visualizações
                </span>
                <Eye size={18} className="text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-headline font-black text-on-surface">142</span>
                <span className="text-xs font-bold text-secondary">+24% hoje</span>
              </div>
            </div>
          </section>
        )}

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT / MAIN COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section: Minhas Vagas (hidden only when strictly on 'candidates' tab, or shown as selector) */}
            {(activeTab === 'overview' || activeTab === 'jobs') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-extrabold font-headline text-on-surface">
                    {realJobs && realJobs.length > 0
                      ? 'Suas Vagas Publicadas'
                      : 'Vagas Publicadas (Modelo de Demonstração)'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate('/post-job')}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Nova Vaga
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/70">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : displayJobs.length > 0 ? (
                  <div className="space-y-3">
                    {displayJobs.map((job) => {
                      const isSelected = activeJob?.id === job.id;
                      return (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJobId(job.id)}
                          className={`rounded-2xl p-5 cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-surface-container-lowest border-primary ring-2 ring-primary/15 shadow-md'
                              : 'bg-surface-container-lowest border-outline-variant/70 hover:border-primary/40 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-headline font-bold text-base md:text-lg text-on-surface">
                                  {job.title}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-extrabold uppercase">
                                  {job.status === 'open' ? 'Ativa' : job.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                                <span className="font-bold text-primary">
                                  {formatBudget(job.budget)}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} /> {job.bairro ? `${job.bairro}, ` : ''}
                                  {job.cidade || 'Local não informado'}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {job.data_do_turno
                                    ? new Date(job.data_do_turno).toLocaleDateString('pt-BR')
                                    : 'Turno Imediato'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCheckinPassJob({ id: job.id, title: job.title });
                                }}
                                className="px-3 py-2 rounded-xl bg-secondary-container text-on-secondary-container hover:brightness-95 text-xs font-headline font-bold flex items-center gap-1.5 transition-all"
                              >
                                <QrCode size={14} />
                                <span>QR Check-in</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedJobId(job.id);
                                  if (activeTab === 'jobs') navigate('/company/candidatos');
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-colors ${
                                  isSelected
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                                }`}
                              >
                                Ver Candidatos
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline bg-surface-container-lowest p-12 text-center space-y-3">
                    <Briefcase size={34} className="mx-auto text-on-surface-variant opacity-50" />
                    <p className="text-lg font-bold font-headline text-on-surface">
                      Nenhuma vaga publicada ainda
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      Publique sua primeira urgência em menos de 1 minuto e receba candidatos.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/post-job')}
                      className="px-6 py-3 rounded-full bg-primary text-on-primary font-headline font-bold text-xs shadow-sm"
                    >
                      Publicar Primeira Vaga
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Section: Detailed Candidates List for Selected Job */}
            {(activeTab === 'overview' || activeTab === 'candidates') && activeJob && (
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold font-headline text-on-surface">
                      Candidatos para "{activeJob.title}"
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      {displayApplicants.length} profissionais disponíveis para este turno
                    </p>
                  </div>

                  {activeTab === 'candidates' && displayJobs.length > 1 && (
                    <select
                      value={activeJob.id}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="h-10 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-bold text-on-surface"
                    >
                      {displayJobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {loadingApps ? (
                  <div className="flex justify-center py-10 bg-surface-container-lowest rounded-2xl border border-outline-variant/70">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : displayApplicants.length > 0 ? (
                  <div className="space-y-4">
                    {displayApplicants.map((cand, index) => {
                      const isLocked = isFree && index > 0;
                      const isHired = hiredIds.has(cand.id);
                      return (
                        <motion.div
                          key={cand.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                            isLocked ? 'bg-surface-container-low/60' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4 min-w-0">
                            <div
                              className={`w-14 h-14 rounded-2xl bg-primary-container text-primary font-headline font-black text-lg flex items-center justify-center shrink-0 overflow-hidden ${
                                isLocked ? 'grayscale opacity-70' : ''
                              }`}
                            >
                              {cand.avatar_url ? (
                                <img
                                  src={cand.avatar_url}
                                  alt={cand.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                cand.name.substring(0, 2).toUpperCase()
                              )}
                            </div>

                            <div className="min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3
                                  className={`font-headline font-bold text-base text-on-surface ${
                                    isLocked ? 'blur-[4px] select-none' : ''
                                  }`}
                                >
                                  {cand.name}
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                                  <Star size={11} className="fill-current" /> {cand.rating.toFixed(1)}
                                </span>
                                <span className="text-[11px] font-semibold text-on-surface-variant">
                                  {cand.turnos} turnos concluídos
                                </span>
                              </div>

                              <p className="text-xs text-on-surface-variant leading-relaxed">
                                {cand.bio}
                              </p>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {cand.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wider"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap md:flex-col items-stretch gap-2 shrink-0 md:w-44">
                            {isLocked ? (
                              <Button
                                type="button"
                                onClick={() => setShowPaywall(true)}
                                className="h-10 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline font-bold text-xs flex items-center justify-center gap-1.5 shadow-none"
                              >
                                <Lock size={14} />
                                <span>Desbloquear Contato</span>
                              </Button>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  onClick={() => handleOpenChat(index)}
                                  className="h-10 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-1.5"
                                >
                                  <MessageSquare size={14} />
                                  <span>Abrir Chat no App</span>
                                </Button>

                                <Button
                                  type="button"
                                  disabled={isHired}
                                  onClick={() => handleConfirmHire(cand.id, cand.name)}
                                  variant="outline"
                                  className={`h-9 rounded-xl text-[11px] font-headline font-bold ${
                                    isHired
                                      ? 'bg-secondary-container text-on-secondary-container border-transparent'
                                      : 'border-outline-variant text-on-surface hover:bg-surface-container-low'
                                  }`}
                                >
                                  {isHired ? 'Contratado ✓' : 'Confirmar Contratação'}
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 p-10 text-center text-sm text-on-surface-variant">
                    Nenhum candidato aplicou a esta vaga ainda. Assim que um profissional aplicar, ele
                    aparecerá aqui.
                  </div>
                )}

                {isFree && displayApplicants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    className="w-full rounded-2xl bg-primary-container hover:bg-primary hover:text-on-primary p-4 text-center text-sm font-headline font-bold text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    <span>
                      Assine Negócio Ágil (R$ 49,90/mês) para conversar com todos os candidatos
                    </span>
                  </button>
                )}
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-28">
            {/* Candidatos em Destaque */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Talentos em Destaque
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/company/candidatos')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-3">
                {DEMO_APPLICANTS_BY_JOB['comp-job-1'].slice(0, 3).map((talent, idx) => (
                  <div
                    key={talent.id}
                    onClick={() => handleOpenChat(idx)}
                    className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-11 h-11 rounded-full bg-primary-container text-primary font-headline font-bold text-sm flex items-center justify-center shrink-0">
                      {talent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs text-on-surface truncate">{talent.name}</h4>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 shrink-0">
                          <Star size={11} className="fill-current" /> {talent.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">{talent.titulo}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary mt-0.5">
                        <CheckCircle2 size={10} /> Disponível hoje
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dica do Recrutador */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm relative overflow-hidden space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                <Video size={18} />
              </div>
              <h4 className="font-headline font-bold text-sm text-on-surface">
                Dica de Contratação Rápida
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Vagas com descrição clara do traje e benefícios (refeição ou ajuda transporte) são
                preenchidas até <strong className="text-on-surface">40% mais rápido</strong>.
              </p>
              <button
                type="button"
                onClick={() => navigate('/post-job')}
                className="inline-flex items-center gap-1 text-xs font-headline font-bold text-primary hover:underline"
              >
                <span>Criar nova vaga otimizada</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Upgrade Banner */}
            {isFree && (
              <div className="rounded-2xl bg-gradient-to-br from-on-surface to-[#16254d] p-6 text-white shadow-lg space-y-4 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary/30 rounded-full blur-2xl pointer-events-none" />
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-[#6ffbbe] text-[10px] font-bold uppercase tracking-wider">
                  <Crown size={12} /> Negócio Ágil
                </span>
                <h3 className="font-headline font-extrabold text-xl leading-tight">
                  Desbloqueie todos os talentos
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Publique vagas ilimitadas por mês e libere o chat direto no aplicativo com todos os
                  candidatos.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPaywall(true)}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs shadow-md transition-all"
                >
                  Conhecer Plano — R$ 49,90/mês
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="company" />

      <CompanyCheckinPassModal
        open={!!checkinPassJob}
        onClose={() => setCheckinPassJob(null)}
        shiftId={checkinPassJob?.id}
        shiftTitle={checkinPassJob?.title || 'Turno Publicado'}
        companyName={companyName}
      />
    </div>
  );
};

export default CompanyDashboard;
