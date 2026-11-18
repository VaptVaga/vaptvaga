import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  Eye,
  TrendingUp,
  Briefcase,
  Star,
  Wallet,
  Navigation,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyApplications } from '@/hooks/useSupabase';
import { formatBudget } from '@/lib/types';
import { DEMO_APPLICATIONS } from '@/lib/demoData';
import { JobDetailsDrawer, type JobDrawerData } from '@/components/vaptvaga/JobDetailsDrawer';
import { ConfirmPresenceModal } from '@/components/vaptvaga/ConfirmPresenceModal';
import { toast } from '@/hooks/use-toast';
import {
  resolveCoordinates,
  calculateDistanceKm,
  formatDistanceKm,
  getGoogleMapsDirectionsUrl,
} from '@/lib/geolocation';

type FilterTab = 'all' | 'confirmado' | 'em_analise' | 'finalizado';

const FreelancerApplications: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [drawerJob, setDrawerJob] = useState<JobDrawerData | null>(null);
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
  const [confirmedPresenceIds, setConfirmedPresenceIds] = useState<Set<string>>(new Set());
  const [presenceModalApp, setPresenceModalApp] = useState<{
    id: string;
    title: string;
    companyName: string;
    dateLabel: string;
    locationLabel: string;
  } | null>(null);

  const { data: realApplications, isLoading } = useMyApplications(user?.id);
  const userCoords = useMemo(() => resolveCoordinates(profile || undefined), [profile]);

  const normalizedApplications = useMemo(() => {
    const mappedReal = (realApplications || []).map((app) => {
      const rawStatus = (app.status || '').toLowerCase();
      const normalizedStatus: 'confirmado' | 'em_analise' | 'finalizado' =
        rawStatus === 'accepted' || rawStatus === 'confirmed' || rawStatus === 'confirmado'
          ? 'confirmado'
          : rawStatus === 'completed' || rawStatus === 'finalizado'
            ? 'finalizado'
            : 'em_analise';

      return {
        id: app.id,
        job_id: app.job_id,
        status: normalizedStatus,
        created_at: app.created_at,
        paidPix: normalizedStatus === 'finalizado',
        job: {
          id: app.job?.id || app.job_id,
          title: app.job?.title || 'Vaga Freelancer',
          company_name: app.job?.employer?.name || 'Empresa Parceira',
          cidade: app.job?.cidade || profile?.cidade || 'Belo Horizonte',
          bairro: app.job?.bairro || '',
          latitude: app.job?.latitude ?? null,
          longitude: app.job?.longitude ?? null,
          budget: formatBudget(app.job?.budget || null),
          data_do_turno: app.job?.data_do_turno || app.created_at,
          horario: '18:00 às 00:00 (6h)',
          description: app.job?.description,
          required_skills: app.job?.required_skills,
        } as JobDrawerData,
      };
    });

    return mappedReal.length > 0 ? mappedReal : DEMO_APPLICATIONS;
  }, [realApplications, profile?.cidade]);

  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') return normalizedApplications;
    return normalizedApplications.filter((a) => a.status === activeTab);
  }, [normalizedApplications, activeTab]);

  const upcomingShifts = normalizedApplications.filter((a) => a.status === 'confirmado');

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: `Todas (${normalizedApplications.length})` },
    {
      id: 'confirmado',
      label: `Confirmadas (${normalizedApplications.filter((a) => a.status === 'confirmado').length})`,
    },
    {
      id: 'em_analise',
      label: `Em Análise (${normalizedApplications.filter((a) => a.status === 'em_analise').length})`,
    },
    {
      id: 'finalizado',
      label: `Finalizadas (${normalizedApplications.filter((a) => a.status === 'finalizado').length})`,
    },
  ];

  const handleRateCompany = (appId: string, companyName: string) => {
    setRatedIds((prev) => new Set(prev).add(appId));
    toast({
      title: '⭐ Avaliação registrada!',
      description: `Obrigado por avaliar ${companyName}. Isso ajuda outros freelancers.`,
    });
  };

  return (
    <div className="min-h-screen bg-transparent w-full font-body">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Application List (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
                Minhas Candidaturas
              </h1>
              <p className="text-sm md:text-base text-on-surface-variant mt-1">
                Acompanhe suas{' '}
                <span className="font-bold text-primary">
                  {normalizedApplications.length} candidaturas
                </span>{' '}
                e turnos confirmados em tempo real.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-full font-headline text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-on-surface text-surface shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/70 hover:bg-surface-container'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Application Cards Stack */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 text-center text-on-surface-variant">
                  Carregando suas candidaturas...
                </div>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map((app, index) => {
                  const companyName =
                    app.job.company_name || app.job.employer?.name || 'Empresa Parceira';
                  const locationStr = [app.job.bairro, app.job.cidade].filter(Boolean).join(', ');
                  const jobCoords = resolveCoordinates(app.job);
                  const distanceKm = calculateDistanceKm(userCoords, jobCoords);
                  const directionsUrl = getGoogleMapsDirectionsUrl({
                    destLat: jobCoords.latitude,
                    destLng: jobCoords.longitude,
                    destQuery: `${companyName} ${locationStr}`.trim(),
                    originLat: userCoords.latitude,
                    originLng: userCoords.longitude,
                  });
                  const isConfirmed = app.status === 'confirmado';
                  const isFinished = app.status === 'finalizado';

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`bg-surface-container-lowest p-5 md:p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col gap-5 transition-all ${
                        isFinished ? 'opacity-90' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary-container text-primary font-headline font-black text-lg flex items-center justify-center shrink-0">
                            {companyName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold font-headline text-on-surface leading-snug">
                              {app.job.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span>
                                {companyName}
                                {locationStr ? ` • ${locationStr}` : ''}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low text-primary text-[10px] font-bold">
                                <MapPin size={10} />
                                {formatDistanceKm(distanceKm)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <span
                          className={`self-start px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider shrink-0 ${
                            isConfirmed
                              ? 'bg-secondary-container text-on-secondary-container'
                              : isFinished
                                ? 'bg-surface-container text-on-surface-variant'
                                : 'bg-primary-container text-primary'
                          }`}
                        >
                          {isConfirmed
                            ? 'Confirmado'
                            : isFinished
                              ? 'Finalizado'
                              : 'Em Análise'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3.5 px-4 rounded-xl bg-surface-container-low border border-outline-variant/40">
                        <div className="flex items-center gap-3">
                          <Wallet size={18} className="text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                              {isFinished ? 'Pagamento Recebido' : 'Diária Prevista'}
                            </p>
                            <p className="font-bold text-sm text-on-surface">
                              {app.job.budget || 'A combinar'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                              Data e Horário
                            </p>
                            <p className="font-bold text-sm text-on-surface">
                              {app.job.data_do_turno
                                ? new Date(app.job.data_do_turno).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                  })
                                : 'Imediato'}{' '}
                              • {app.job.horario || '18:00 - 00:00'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => setDrawerJob(app.job)}
                          className="flex-1 py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-outline-variant/60"
                        >
                          <Eye size={16} />
                          <span>Ver Detalhes & Mapa</span>
                        </button>

                        {!isFinished && (
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-outline-variant/60"
                          >
                            <Navigation size={15} className="text-primary" />
                            <span>Rota Maps</span>
                          </a>
                        )}

                        {isConfirmed && (
                          <button
                            type="button"
                            disabled={confirmedPresenceIds.has(app.id)}
                            onClick={() =>
                              setPresenceModalApp({
                                id: app.id,
                                title: app.job.title,
                                companyName,
                                dateLabel: `${
                                  app.job.data_do_turno
                                    ? new Date(app.job.data_do_turno).toLocaleDateString('pt-BR')
                                    : 'Hoje'
                                } • ${app.job.horario || '18:00 - 00:00'}`,
                                locationLabel: locationStr || 'Região Metropolitana',
                              })
                            }
                            className={`py-3 px-4 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                              confirmedPresenceIds.has(app.id)
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-secondary hover:brightness-95 text-on-secondary shadow-sm'
                            }`}
                          >
                            <CheckCircle2 size={15} />
                            <span>
                              {confirmedPresenceIds.has(app.id)
                                ? 'Presença Confirmada ✓'
                                : 'Confirmar Presença'}
                            </span>
                          </button>
                        )}

                        {isFinished ? (
                          <button
                            type="button"
                            disabled={ratedIds.has(app.id)}
                            onClick={() => handleRateCompany(app.id, companyName)}
                            className={`flex-1 py-3 px-4 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                              ratedIds.has(app.id)
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low'
                            }`}
                          >
                            <Star size={16} className={ratedIds.has(app.id) ? 'fill-current' : ''} />
                            <span>{ratedIds.has(app.id) ? 'Empresa Avaliada ✓' : 'Avaliar Empresa'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/chat')}
                            className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                          >
                            <MessageSquare size={16} />
                            <span>Abrir Chat</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-outline bg-surface-container-lowest p-12 text-center space-y-3">
                  <Briefcase className="mx-auto text-on-surface-variant opacity-50" size={36} />
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    Nenhuma candidatura nesta categoria
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    Explore novas oportunidades disponíveis na sua região e candidate-se em 1 clique.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/freelancer/vagas')}
                    className="mt-2 px-6 py-3 rounded-full bg-primary text-on-primary font-headline font-bold text-xs shadow-sm"
                  >
                    Buscar Vagas Agora
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT SIDEBAR: Upcoming Shifts & Forecasted Earnings (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-28">
            {/* Próximos Turnos */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold font-headline text-on-surface">
                  Próximos Turnos
                </h2>
                <span className="w-9 h-9 flex items-center justify-center bg-primary-container text-primary rounded-full">
                  <Calendar size={17} />
                </span>
              </div>

              <div className="space-y-4">
                {upcomingShifts.length > 0 ? (
                  upcomingShifts.map((shift) => {
                    const shiftCoords = resolveCoordinates(shift.job);
                    const shiftRouteUrl = getGoogleMapsDirectionsUrl({
                      destLat: shiftCoords.latitude,
                      destLng: shiftCoords.longitude,
                      destQuery: `${shift.job.company_name || ''} ${shift.job.bairro || ''} ${shift.job.cidade || ''}`.trim(),
                      originLat: userCoords.latitude,
                      originLng: userCoords.longitude,
                    });
                    return (
                    <div
                      key={shift.id}
                      className="flex gap-3.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40"
                    >
                      <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shrink-0">
                        <span className="text-[10px] font-bold uppercase text-primary">Hoje</span>
                        <span className="text-xl font-black font-headline text-on-surface leading-tight">
                          {new Date().getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-headline font-bold text-sm text-on-surface truncate">
                          {shift.job.title}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          {shift.job.company_name}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                            <Clock size={12} />
                            <span>{shift.job.horario || '18:30 - 00:30'}</span>
                          </div>
                          <a
                            href={shiftRouteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary hover:underline"
                          >
                            <Navigation size={11} />
                            Rota
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                  })
                ) : (
                  <p className="text-xs text-on-surface-variant py-2">
                    Nenhum turno confirmado no momento.
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/freelancer/agenda')}
                  className="w-full py-3 rounded-xl bg-primary-container hover:bg-primary text-primary hover:text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Calendar size={14} />
                  <span>Abrir Minha Agenda Completa</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/freelancer/vagas')}
                  className="w-full py-3 rounded-xl border border-primary/25 text-primary font-headline font-bold text-xs hover:bg-primary hover:text-on-primary transition-all"
                >
                  Encontrar Novos Turnos
                </button>
              </div>
            </div>

            {/* Stats Card: Ganhos Previstos */}
            <div className="bg-gradient-to-br from-primary-dark via-primary to-[#002b7a] p-6 rounded-2xl relative overflow-hidden text-white shadow-lg">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <p className="text-blue-100 font-headline font-bold uppercase tracking-widest text-[11px]">
                  Ganhos Previstos
                </p>
                <p className="text-white text-3xl sm:text-4xl font-black font-headline">R$ 840,00</p>
                <div className="flex items-center gap-2 text-[#6ffbbe] text-xs font-bold">
                  <TrendingUp size={15} />
                  <span>+12% em relação ao mês passado</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/freelancer/dashboard')}
                  className="mt-2 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-headline font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Abrir Central de Ganhos & PIX</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <JobDetailsDrawer
        job={drawerJob}
        open={!!drawerJob}
        onClose={() => setDrawerJob(null)}
        onOpenChat={() => {
          setDrawerJob(null);
          navigate('/chat');
        }}
        isApplied={true}
        userCoords={userCoords}
      />

      <ConfirmPresenceModal
        open={!!presenceModalApp}
        onClose={() => setPresenceModalApp(null)}
        onConfirm={() => {
          if (!presenceModalApp) return;
          setConfirmedPresenceIds((prev) => new Set(prev).add(presenceModalApp.id));
          toast({
            title: '✅ Presença confirmada!',
            description: `Compromisso confirmado com ${presenceModalApp.companyName}.`,
          });
          setPresenceModalApp(null);
        }}
        shiftTitle={presenceModalApp?.title || 'Turno'}
        companyName={presenceModalApp?.companyName || 'Empresa Parceira'}
        shiftDateLabel={presenceModalApp?.dateLabel}
        locationLabel={presenceModalApp?.locationLabel}
      />
    </div>
  );
};

export default FreelancerApplications;
