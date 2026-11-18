import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Wallet,
  Calendar,
  Award,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
  Briefcase,
  ChevronRight,
  Star,
  Navigation,
  Bell,
  Phone,
  Utensils,
  Truck,
  PartyPopper,
  Check,
  Eye,
  Compass,
  Map as MapIcon,
  QrCode,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs, useMyApplications, useApplyToJob, useMonthlyApplicationCount } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';
import { formatBudget } from '@/lib/types';
import { DEMO_JOBS, DEMO_APPLICATIONS } from '@/lib/demoData';
import { JobDetailsDrawer, type JobDrawerData } from '@/components/vaptvaga/JobDetailsDrawer';
import { LocationMap } from '@/components/vaptvaga/LocationMap';
import { CheckinModal } from '@/components/vaptvaga/CheckinModal';
import { ConfirmPresenceModal } from '@/components/vaptvaga/ConfirmPresenceModal';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import {
  resolveCoordinates,
  calculateDistanceKm,
  formatDistanceKm,
  detectUserLocation,
  getGoogleMapsDirectionsUrl,
  getWazeNavigationUrl,
} from '@/lib/geolocation';

const NEXT_SHIFT_LOCATION = {
  name: 'Restaurante Adega Imperial',
  address: 'Al. da Serra, 1140 - Vila da Serra, Nova Lima',
  bairro: 'Vila da Serra',
  cidade: 'Nova Lima',
  latitude: -19.9794,
  longitude: -43.9408,
};

export const FreelancerInicioMobile: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [pixToast, setPixToast] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [presenceConfirmed, setPresenceConfirmed] = useState(false);
  const [presenceModalOpen, setPresenceModalOpen] = useState(false);
  const [showShiftMap, setShowShiftMap] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [drawerJob, setDrawerJob] = useState<JobDrawerData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const userCoords = useMemo(() => resolveCoordinates(profile || undefined), [profile]);
  const shiftDistanceKm = useMemo(
    () => calculateDistanceKm(userCoords, NEXT_SHIFT_LOCATION),
    [userCoords]
  );

  const { data: jobs } = useJobs({ status: 'open' });
  const { data: myApplications } = useMyApplications(user?.id);
  const { data: monthlyCount = 0 } = useMonthlyApplicationCount(user?.id);
  const applyMutation = useApplyToJob();

  const isFree = profile?.subscriber !== 'premium';
  const monthlyLimit = 2;

  const displayJobs: JobDrawerData[] =
    jobs && jobs.length > 0 ? (jobs as unknown as JobDrawerData[]) : DEMO_JOBS;
  const highMatchJobs = displayJobs.slice(0, 3);

  const alreadyAppliedIds = new Set<string>([
    ...Array.from(appliedJobs),
    ...(myApplications?.map((a) => a.job_id) || []),
  ]);

  const handleApply = async (jobId: string, jobTitle: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (alreadyAppliedIds.has(jobId)) {
      toast({ title: 'Candidatura já realizada', description: 'Aguarde o contato da empresa.' });
      return;
    }
    if (isFree && monthlyCount + appliedJobs.size >= monthlyLimit) {
      setShowPaywall(true);
      return;
    }

    if (jobId.startsWith('demo-')) {
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      toast({
        title: '✅ Candidatura enviada!',
        description: `Sua candidatura para "${jobTitle}" foi registrada com prioridade.`,
      });
      return;
    }

    try {
      await applyMutation.mutateAsync({ job_id: jobId, freelancer_id: user.id });
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      toast({
        title: '✅ Candidatura enviada!',
        description: `Sua candidatura para "${jobTitle}" foi registrada com prioridade.`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Não foi possível candidatar',
        description: err instanceof Error ? err.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const handleTriggerPix = () => {
    setPixToast(true);
    setTimeout(() => setPixToast(false), 4500);
  };

  const handleConfirmCheckin = async (method: 'code' | 'qr', codeValue: string) => {
    setCheckinLoading(true);
    const methodLabel = method === 'qr' ? 'QR Code' : 'Código';
    try {
      const detected = await detectUserLocation();
      const dist = calculateDistanceKm(detected, NEXT_SHIFT_LOCATION);
      setCheckinDone(true);
      setCheckinModalOpen(false);
      toast({
        title: `📍 Check-in via ${methodLabel} Confirmado!`,
        description: `Código ${codeValue} e GPS (${formatDistanceKm(dist)} do local) validados no ${NEXT_SHIFT_LOCATION.name}.`,
      });
    } catch {
      setCheckinDone(true);
      setCheckinModalOpen(false);
      toast({
        title: `📍 Check-in via ${methodLabel} Confirmado!`,
        description: `Código ${codeValue} validado no ${NEXT_SHIFT_LOCATION.name}. Bom turno!`,
      });
    } finally {
      setCheckinLoading(false);
    }
  };

  const userName = profile?.name ? profile.name.split(' ')[0] : 'Freelancer';
  const userCity = profile?.cidade || 'Belo Horizonte e Região';

  return (
    <div className="min-h-screen bg-transparent font-body text-on-surface flex flex-col antialiased selection:bg-primary/20">
      {/* Toast Notification PIX */}
      <AnimatePresence>
        {pixToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 inset-x-4 z-50 flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-inverse-surface text-inverse-on-surface shadow-2xl"
          >
            <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center shrink-0">
              <Check size={18} className="font-black" />
            </div>
            <div className="flex flex-col text-left">
              <p className="text-xs font-headline font-bold text-white">
                Solicitação de Saque PIX iniciada!
              </p>
              <p className="text-[11px] text-gray-300">
                Valor de R$ 410,00 agendado para sua chave cadastrada.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Scrollable Area */}
      <main className="flex-1 flex flex-col w-full px-4 pt-4 space-y-6 pb-6">
        {/* 1. HEADER DE STATUS & SAUDAÇÃO HERO CARD */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-[#002b7a] p-6 text-on-primary shadow-xl shadow-primary/20">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-secondary/25 blur-2xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-md border border-white/15">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ffbbe] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6ffbbe]" />
              </span>
              <span className="font-headline text-[11px] font-bold text-[#6ffbbe] tracking-wide uppercase">
                Disponibilidade Ativa • Recebendo Vagas
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                Bem-vindo de volta 👋
              </p>
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-white leading-tight">
                Olá, {userName}! Você tem{' '}
                <span className="text-white underline decoration-[#6ffbbe] decoration-2 underline-offset-2">
                  1 turno hoje
                </span>{' '}
                e{' '}
                <span className="text-[#6ffbbe] font-bold">
                  {jobs?.length || 142} novas vagas
                </span>{' '}
                abertas em {userCity}.
              </h1>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={handleTriggerPix}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#6ffbbe] px-4 py-3 text-xs font-extrabold text-[#002113] shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <Wallet size={16} />
                <span>Sacar via PIX (R$ 410,00)</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/freelancer/vagas')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-4 py-3 text-xs font-bold text-white border border-white/20 backdrop-blur-md active:scale-95 transition-all"
              >
                <Briefcase size={16} />
                <span>Explorar Vagas Disponíveis</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. CAROUSEL HORIZONTAL DE INDICADORES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-base font-bold text-on-surface">Meus Indicadores</h2>
            <button
              type="button"
              onClick={() => navigate('/freelancer/dashboard')}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              Ver ganhos completos <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
            <div className="min-w-[230px] max-w-[230px] snap-start rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/70 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">Saldo Disponível</span>
                <span className="rounded-full bg-secondary-container p-1.5 text-secondary">
                  <Wallet size={16} />
                </span>
              </div>
              <div>
                <p className="font-headline text-2xl font-black text-on-surface">R$ 410,00</p>
                <p className="text-[11px] text-secondary font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={12} /> PIX Instantâneo liberado
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerPix}
                className="w-full flex items-center justify-center gap-1 rounded-xl bg-surface-container-low hover:bg-primary-container py-2 text-[11px] font-bold text-primary transition-colors"
              >
                <span>Transferir via PIX</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="min-w-[230px] max-w-[230px] snap-start rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/70 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">Ganhos da Semana</span>
                <span className="rounded-full bg-primary-container p-1.5 text-primary">
                  <TrendingUp size={16} />
                </span>
              </div>
              <div>
                <p className="font-headline text-2xl font-black text-on-surface">R$ 680,00</p>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '59%' }} />
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">Meta semanal R$ 1.150 (59%)</p>
              </div>
              <div className="text-[11px] text-on-surface-variant font-medium">
                Faltam aprox. 3 turnos
              </div>
            </div>

            <div className="min-w-[230px] max-w-[230px] snap-start rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/70 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">Turnos no Mês</span>
                <span className="rounded-full bg-amber-100 p-1.5 text-amber-600">
                  <Calendar size={16} />
                </span>
              </div>
              <div>
                <p className="font-headline text-2xl font-black text-on-surface">14 turnos</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Média: R$ 170 / turno</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary-container px-2 py-1 text-[10px] font-bold text-on-secondary-container self-start">
                <Check size={12} /> 100% Pontualidade
              </span>
            </div>

            <div className="min-w-[230px] max-w-[230px] snap-start rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/70 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">Reputação</span>
                <span className="rounded-full bg-primary-container p-1.5 text-primary">
                  <Award size={16} />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-headline text-2xl font-black text-on-surface">4.9</p>
                  <Star size={16} className="fill-current text-amber-400" />
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">14 avaliações 5 estrelas</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary-container px-2 py-1 text-[10px] font-bold text-primary self-start">
                <ShieldCheck size={12} /> Top Freelancer
              </span>
            </div>
          </div>
        </section>

        {/* 3. PRÓXIMO TURNO CONFIRMADO */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              Próximo Turno Confirmado
            </h2>
            <span className="text-xs font-bold text-on-secondary-container bg-secondary-container px-2.5 py-0.5 rounded-full">
              Hoje à Noite
            </span>
          </div>

          <div className="rounded-2xl border-2 border-secondary/35 bg-surface-container-lowest p-5 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                  <Clock size={12} className="text-amber-600" />
                  <span>Inicia em 3h 45m</span>
                </div>
                <h3 className="font-headline text-lg font-extrabold text-on-surface leading-tight">
                  Restaurante Adega Imperial
                </h3>
                <p className="text-xs font-semibold text-primary">Garçom de Salão Noturno</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-headline text-xl font-black text-on-surface">R$ 180,00</span>
                <span className="block text-[10px] font-bold text-secondary">PIX até 01:00h</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs rounded-xl bg-surface-container-low p-3.5">
              <div className="flex items-center gap-2 text-on-surface">
                <Clock size={15} className="text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-on-surface-variant leading-none">Horário</p>
                  <p className="font-bold text-xs mt-0.5">18:30 às 00:30</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <MapPin size={15} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-on-surface-variant leading-none">Local</p>
                  <p className="font-bold text-xs mt-0.5 truncate">
                    {NEXT_SHIFT_LOCATION.bairro} • {formatDistanceKm(shiftDistanceKm)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-on-surface-variant">
              <span className="rounded-lg bg-secondary-container px-2.5 py-1 text-on-secondary-container font-bold">
                🚗 Uber (R$ 20)
              </span>
              <span className="rounded-lg bg-surface-container px-2.5 py-1">🍽️ Jantar Incluso</span>
              <span className="rounded-lg bg-surface-container px-2.5 py-1">👔 Camisa Preta</span>
            </div>

            {showShiftMap && (
              <LocationMap
                title={NEXT_SHIFT_LOCATION.name}
                addressLabel={NEXT_SHIFT_LOCATION.address}
                latitude={NEXT_SHIFT_LOCATION.latitude}
                longitude={NEXT_SHIFT_LOCATION.longitude}
                bairro={NEXT_SHIFT_LOCATION.bairro}
                cidade={NEXT_SHIFT_LOCATION.cidade}
                userCoords={userCoords}
                heightClassName="h-44"
              />
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowShiftMap((prev) => !prev)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-colors text-center ${
                  showShiftMap
                    ? 'bg-primary-container text-primary'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                <MapIcon size={14} className="text-primary" />
                <span>{showShiftMap ? 'Ocultar Mapa' : 'Ver Mapa'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCheckinModalOpen(true)}
                disabled={checkinDone}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-extrabold shadow-sm transition-all ${
                  checkinDone
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-primary text-on-primary hover:bg-primary-dark active:scale-95'
                }`}
              >
                {checkinDone ? <CheckCircle2 size={14} /> : <QrCode size={14} />}
                <span>{checkinDone ? 'Check-in OK' : 'Check-in (QR)'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPresenceModalOpen(true)}
              disabled={presenceConfirmed}
              className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                presenceConfirmed
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-secondary text-on-secondary hover:brightness-95 shadow-sm'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>{presenceConfirmed ? 'Presença Confirmada ✓' : 'Confirmar Presença no Turno'}</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={getGoogleMapsDirectionsUrl({
                  destLat: NEXT_SHIFT_LOCATION.latitude,
                  destLng: NEXT_SHIFT_LOCATION.longitude,
                  destQuery: NEXT_SHIFT_LOCATION.address,
                  originLat: userCoords.latitude,
                  originLng: userCoords.longitude,
                })}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 rounded-xl bg-surface-container-low hover:bg-surface-container py-2.5 text-[11px] font-bold text-on-surface border border-outline-variant/60 transition-colors"
              >
                <Navigation size={13} className="text-primary" />
                <span>Maps</span>
              </a>
              <a
                href={getWazeNavigationUrl({
                  latitude: NEXT_SHIFT_LOCATION.latitude,
                  longitude: NEXT_SHIFT_LOCATION.longitude,
                  query: NEXT_SHIFT_LOCATION.address,
                })}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 rounded-xl bg-surface-container-low hover:bg-surface-container py-2.5 text-[11px] font-bold text-on-surface border border-outline-variant/60 transition-colors"
              >
                <Compass size={13} className="text-primary" />
                <span>Waze</span>
              </a>
              <button
                type="button"
                onClick={() => navigate('/freelancer/agenda')}
                className="flex items-center justify-center gap-1 rounded-xl bg-primary-container hover:bg-primary py-2.5 text-[11px] font-bold text-primary hover:text-on-primary transition-colors"
              >
                <Calendar size={13} />
                <span>Agenda</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4. MINHAS CANDIDATURAS RECENTES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-base font-bold text-on-surface">Minhas Candidaturas</h2>
            <button
              type="button"
              onClick={() => navigate('/freelancer/candidaturas')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-2.5">
            {myApplications && myApplications.length > 0
              ? myApplications.slice(0, 3).map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => navigate('/freelancer/candidaturas')}
                    className="w-full text-left rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm border border-outline-variant/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center shrink-0">
                        <Briefcase size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-headline font-bold text-on-surface truncate">
                          {app.job?.title || 'Vaga Freelancer'}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {app.job?.cidade || userCity} • {formatBudget(app.job?.budget || null)}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container shrink-0">
                      Candidatado
                    </span>
                  </button>
                ))
              : DEMO_APPLICATIONS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => navigate('/freelancer/candidaturas')}
                    className="w-full text-left rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm border border-outline-variant/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                        <Utensils size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-headline font-bold text-on-surface truncate">
                          {app.job.title}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {app.job.company_name} • {app.job.budget}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        app.status === 'confirmado'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : app.status === 'finalizado'
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status === 'confirmado'
                        ? 'Confirmado'
                        : app.status === 'finalizado'
                          ? 'PIX Pago'
                          : 'Em Análise'}
                    </span>
                  </button>
                ))}
          </div>
        </section>

        {/* 5. FEED DE OPORTUNIDADES EM ALTA */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-base font-bold text-on-surface">
                Vagas com 98% de Match
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                Com base no seu perfil e localização
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/freelancer/vagas')}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              Ver todas <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {highMatchJobs.map((job) => {
              const isApplied = alreadyAppliedIds.has(job.id);
              const jobDistance = calculateDistanceKm(userCoords, resolveCoordinates(job));
              return (
                <div
                  key={job.id}
                  className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> 98% Compatível
                      </span>
                      <h3
                        onClick={() => setDrawerJob(job)}
                        className="font-headline text-sm font-bold text-on-surface leading-tight cursor-pointer"
                      >
                        {job.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 flex-wrap">
                        <MapPin size={12} className="text-primary" />
                        <span>
                          {job.cidade || userCity} {job.bairro ? `• ${job.bairro}` : ''}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                          {formatDistanceKm(jobDistance)}
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-headline text-base font-extrabold text-primary">
                        {formatBudget(
                          job.budget || (job.valor_da_diaria ? `R$ ${job.valor_da_diaria}` : null)
                        )}
                      </span>
                      <span className="block text-[10px] font-semibold text-secondary">
                        PIX no Turno
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-surface-container-low p-2.5 flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-primary" />
                      {job.data_do_turno
                        ? new Date(job.data_do_turno).toLocaleDateString('pt-BR')
                        : 'Turno Imediato'}
                    </span>
                    <span className="font-bold text-on-surface">
                      {job.horario || 'Turno Confirmado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerJob(job)}
                      className="px-3.5 py-2.5 rounded-xl bg-surface-container-low text-xs font-bold text-on-surface flex items-center gap-1"
                    >
                      <Eye size={14} />
                      <span>Detalhes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApply(job.id, job.title)}
                      disabled={isApplied}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold shadow-sm active:scale-95 transition-all ${
                        isApplied
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-primary text-on-primary hover:bg-primary-dark'
                      }`}
                    >
                      <Zap size={14} />
                      <span>{isApplied ? 'Candidatado' : 'Candidatar 1 Clique'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. RADAR LOCAL */}
        <section className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-primary fill-primary" />
              <h2 className="font-headline text-sm font-bold text-on-surface">
                Radar de Vagas na Região
              </h2>
            </div>
            <span className="text-[11px] font-bold text-secondary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              Tempo Real
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-surface-container-low p-3 text-center space-y-1">
              <Utensils size={18} className="mx-auto text-primary" />
              <p className="font-headline text-lg font-black text-on-surface">54</p>
              <p className="text-[10px] text-on-surface-variant font-medium leading-tight">
                Gastronomia
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3 text-center space-y-1">
              <Truck size={18} className="mx-auto text-primary" />
              <p className="font-headline text-lg font-black text-on-surface">38</p>
              <p className="text-[10px] text-on-surface-variant font-medium leading-tight">
                Logística
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3 text-center space-y-1">
              <PartyPopper size={18} className="mx-auto text-primary" />
              <p className="font-headline text-lg font-black text-on-surface">27</p>
              <p className="text-[10px] text-on-surface-variant font-medium leading-tight">
                Eventos
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-primary-container/60 p-3 text-xs text-on-surface border border-primary/15">
            <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-primary font-semibold">Dica Pro:</strong> Turnos de fim de
              semana à noite têm contratação{' '}
              <strong className="text-secondary font-bold">40% mais rápida</strong>.
            </p>
          </div>
        </section>

        {/* 7. SUPORTE PLANTÃO 24H */}
        <section className="space-y-3 pb-4">
          <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm space-y-3 border border-outline-variant/70">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
                <Bell size={19} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-headline text-xs font-bold text-on-surface">
                  Ative o Alerta de Vagas Relâmpago
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Receba turnos desmarcados de última hora com diária até{' '}
                  <strong className="text-secondary font-bold">30% maior</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/planos')}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-dark px-4 py-2.5 text-xs font-bold text-on-primary active:scale-95 transition-all"
            >
              <Zap size={14} />
              <span>Conhecer Vapt PRO</span>
            </button>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm space-y-3 border border-outline-variant/70">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-secondary">
                <Phone size={19} />
              </div>
              <div>
                <h3 className="font-headline text-xs font-bold text-on-surface">
                  Plantão VaptVaga 24h
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  Dúvidas sobre turno, atraso ou liberação do PIX?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-surface-container-low px-4 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container transition-all text-center border border-outline-variant/60"
            >
              <MessageCircle size={15} className="text-secondary" />
              <span>Acionar Suporte no Chat do App</span>
            </button>
          </div>
        </section>
      </main>

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

      <CheckinModal
        open={checkinModalOpen}
        onClose={() => setCheckinModalOpen(false)}
        onConfirm={handleConfirmCheckin}
        shiftId="demo-job-1"
        shiftTitle="Garçom de Salão Noturno"
        companyName={NEXT_SHIFT_LOCATION.name}
        addressLabel={NEXT_SHIFT_LOCATION.address}
        isSubmitting={checkinLoading}
      />

      <ConfirmPresenceModal
        open={presenceModalOpen}
        onClose={() => setPresenceModalOpen(false)}
        onConfirm={() => {
          setPresenceConfirmed(true);
          setPresenceModalOpen(false);
          toast({
            title: '✅ Presença confirmada!',
            description: `Seu comparecimento ao turno no ${NEXT_SHIFT_LOCATION.name} foi confirmado.`,
          });
        }}
        shiftTitle="Garçom de Salão Noturno"
        companyName={NEXT_SHIFT_LOCATION.name}
        shiftDateLabel="Hoje • 18:30 às 00:30"
        locationLabel={NEXT_SHIFT_LOCATION.address}
      />
    </div>
  );
};
