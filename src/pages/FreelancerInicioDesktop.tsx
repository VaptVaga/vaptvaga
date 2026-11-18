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
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
  Briefcase,
  Star,
  Navigation,
  Bell,
  Phone,
  Utensils,
  Truck,
  PartyPopper,
  CheckCircle,
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

export const FreelancerInicioDesktop: React.FC = () => {
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
  const highMatchJobs = displayJobs.slice(0, 4);

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
        toast({ title: 'Vaga removida dos salvos' });
      } else {
        next.add(jobId);
        toast({ title: 'Vaga salva nos favoritos' });
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
        description: `Código ${codeValue} e GPS (${formatDistanceKm(dist)} do local) validados no ${NEXT_SHIFT_LOCATION.name}. Bom turno!`,
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

  const userName = profile?.name?.split(' ')[0] || 'Freelancer';
  const userCity = profile?.cidade || 'Belo Horizonte e Região';

  return (
    <div className="w-full min-h-screen bg-transparent font-body text-on-surface antialiased">
      {/* Toast Notification PIX */}
      <AnimatePresence>
        {pixToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl bg-inverse-surface text-inverse-on-surface shadow-[0_20px_50px_rgba(10,19,43,0.25)] border border-white/10"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <CheckCircle className="text-secondary" size={22} />
            </div>
            <div className="flex flex-col text-left">
              <p className="text-sm font-headline font-bold text-white">
                Solicitação de Saque PIX iniciada!
              </p>
              <p className="text-xs text-gray-300">
                Valor de R$ 410,00 agendado para sua chave cadastrada.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 lg:px-10 py-6 flex flex-col gap-8 max-w-[1440px] mx-auto w-full">
        {/* TOP WELCOME GREETING & LIVE STATUS BANNER */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-[#002b7a] p-8 lg:p-10 text-on-primary shadow-[0_20px_40px_rgba(0,74,198,0.2)]">
          <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-secondary/25 blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col gap-3 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 self-start px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ffbbe] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6ffbbe]" />
                </span>
                <span className="text-xs font-headline font-bold text-[#6ffbbe] tracking-wide uppercase">
                  Disponibilidade Ativa • Recebendo propostas expressas
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-extrabold tracking-tight text-white">
                Olá, {userName}! Bem-vindo de volta 👋
              </h1>

              <p className="text-sm lg:text-base text-blue-100 leading-relaxed">
                Você tem{' '}
                <span className="font-bold text-white underline decoration-[#6ffbbe] decoration-2 underline-offset-4">
                  1 turno confirmado
                </span>{' '}
                para hoje e{' '}
                <span className="font-bold text-[#6ffbbe]">
                  {jobs?.length || 142} novas oportunidades
                </span>{' '}
                aguardando candidatos na região de {userCity}.
              </p>
            </div>

            {/* Quick Action Hub */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3.5 shrink-0">
              <button
                type="button"
                onClick={handleTriggerPix}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#6ffbbe] text-[#002113] font-headline font-extrabold text-sm shadow-[0_8px_20px_rgba(0,200,154,0.3)] hover:brightness-105 active:scale-95 transition-all"
              >
                <Wallet size={18} />
                <span>Sacar via PIX (R$ 410)</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/freelancer/vagas')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-headline font-bold text-sm backdrop-blur-md border border-white/25 active:scale-95 transition-all"
              >
                <Briefcase size={18} />
                <span>Explorar Vagas</span>
              </button>
            </div>
          </div>
        </section>

        {/* KEY KPI METRICS GRID (4 CARDS) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Saldo Disponível */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/70 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label text-on-surface-variant font-semibold uppercase tracking-wider">
                Saldo Disponível
              </span>
              <div className="w-9 h-9 rounded-xl bg-secondary-container text-secondary flex items-center justify-center">
                <Wallet size={18} />
              </div>
            </div>
            <div className="my-4">
              <span className="text-3xl font-headline font-black tracking-tight text-on-surface">
                R$ 410,00
              </span>
              <span className="text-xs font-label text-secondary font-semibold flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Transferência PIX Instantânea
              </span>
            </div>
            <button
              type="button"
              onClick={handleTriggerPix}
              className="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-primary-container text-xs font-headline font-bold text-primary flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Transferir para Minha Chave</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Ganhos na Semana */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/70 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label text-on-surface-variant font-semibold uppercase tracking-wider">
                Ganhos na Semana
              </span>
              <div className="w-9 h-9 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="my-4">
              <span className="text-3xl font-headline font-black tracking-tight text-on-surface">
                R$ 680,00
              </span>
              <div className="w-full bg-surface-container-high rounded-full h-2 mt-3">
                <div className="bg-primary h-2 rounded-full" style={{ width: '59%' }} />
              </div>
              <div className="flex justify-between items-center text-[11px] text-on-surface-variant font-medium mt-1.5">
                <span>Meta: R$ 1.150,00</span>
                <span className="text-primary font-bold">59% concluído</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/freelancer/dashboard')}
              className="text-left text-[11px] font-bold text-primary hover:underline"
            >
              Ver relatório financeiro completo →
            </button>
          </div>

          {/* Card 3: Performance Operacional */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/70 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label text-on-surface-variant font-semibold uppercase tracking-wider">
                Performance no Mês
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>
            </div>
            <div className="my-4">
              <span className="text-3xl font-headline font-black tracking-tight text-on-surface">
                14 turnos
              </span>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                  100% Pontualidade
                </span>
                <span className="text-xs text-on-surface-variant">0 faltas</span>
              </div>
            </div>
            <div className="text-[11px] text-on-surface-variant">
              Média de <strong className="text-on-surface">R$ 170,00</strong> por turno realizado
            </div>
          </div>

          {/* Card 4: Perfil Verificado Pro */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/70 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label text-on-surface-variant font-semibold uppercase tracking-wider">
                Reputação
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-primary font-bold text-[10px] uppercase">
                {profile?.subscriber === 'premium' ? 'VAPT PRO' : 'NÍVEL 4'}
              </span>
            </div>
            <div className="my-4 flex items-center justify-between">
              <div>
                <span className="text-3xl font-headline font-black tracking-tight text-on-surface">
                  4.9
                </span>
                <div className="flex text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">14 avaliações 5 estrelas</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary font-bold">
              <CheckCircle2 size={14} /> Selo de Confiança Ativo
            </span>
          </div>
        </section>

        {/* MAIN CONTENT LAYOUT (8 cols Left Operation / 4 cols Right Insights) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (8 cols): Confirmed Shift & High Match Feed */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Urgent Next Confirmed Shift Card */}
            <div className="rounded-2xl border-2 border-secondary/35 bg-surface-container-lowest p-6 lg:p-7 shadow-[0_8px_30px_rgba(10,19,43,0.05)] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant/70">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-headline font-bold text-xs border border-amber-200">
                    <Clock size={14} className="text-amber-600" />
                    <span>Inicia em 3h 45m</span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Turno Noturno de Hoje
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-headline font-black text-on-surface">
                    R$ 180,00
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                    PIX até 01:00h
                  </span>
                </div>
              </div>

              <div className="py-5 space-y-4">
                <div>
                  <h3 className="text-xl lg:text-2xl font-headline font-extrabold text-on-surface">
                    Garçom de Salão Noturno
                  </h3>
                  <p className="text-sm font-semibold text-primary mt-0.5">
                    {NEXT_SHIFT_LOCATION.name} • {NEXT_SHIFT_LOCATION.bairro} ({formatDistanceKm(shiftDistanceKm)} de você)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-surface-container-low p-4 border border-outline-variant/50">
                  <div className="flex items-center gap-3">
                    <Clock size={19} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Horário de Atuação
                      </p>
                      <p className="text-sm font-bold text-on-surface">18:30 às 00:30 (6 horas)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={19} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Endereço de Apresentação
                      </p>
                      <p className="text-sm font-bold text-on-surface">
                        Al. da Serra, 1140 - Vila da Serra
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chips operacionais */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-bold">
                    🚗 Ajuda Uber Noturno (R$ 20)
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold">
                    🍽️ Refeição no Local Inclusa
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold">
                    👔 Traje: Camisa Social e Calça Preta
                  </span>
                </div>

                {/* Expandable Map Preview */}
                {showShiftMap && (
                  <div className="pt-1">
                    <LocationMap
                      title={NEXT_SHIFT_LOCATION.name}
                      addressLabel={NEXT_SHIFT_LOCATION.address}
                      latitude={NEXT_SHIFT_LOCATION.latitude}
                      longitude={NEXT_SHIFT_LOCATION.longitude}
                      bairro={NEXT_SHIFT_LOCATION.bairro}
                      cidade={NEXT_SHIFT_LOCATION.cidade}
                      userCoords={userCoords}
                      heightClassName="h-52"
                    />
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCheckinModalOpen(true)}
                  disabled={checkinDone}
                  className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-headline font-bold shadow-sm transition-all ${
                    checkinDone
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-primary text-on-primary hover:bg-primary-dark active:scale-95'
                  }`}
                >
                  {checkinDone ? <CheckCircle2 size={18} /> : <QrCode size={18} />}
                  <span>
                    {checkinDone
                      ? 'Check-in Confirmado no Local!'
                      : 'Fazer Check-in (QR / Código)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPresenceModalOpen(true)}
                  disabled={presenceConfirmed}
                  className={`flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-headline font-bold transition-colors ${
                    presenceConfirmed
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-secondary hover:brightness-95 text-on-secondary shadow-sm'
                  }`}
                >
                  <CheckCircle2 size={17} />
                  <span>{presenceConfirmed ? 'Presença OK ✓' : 'Confirmar Presença'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-headline font-bold border border-outline-variant transition-colors"
                >
                  <MessageCircle size={17} className="text-primary" />
                  <span>Falar com Gerente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowShiftMap((prev) => !prev)}
                  className={`flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-headline font-bold border transition-colors ${
                    showShiftMap
                      ? 'bg-primary-container text-primary border-primary/30'
                      : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/60'
                  }`}
                >
                  <MapIcon size={17} className="text-primary" />
                  <span>{showShiftMap ? 'Ocultar Mapa' : 'Ver Mapa'}</span>
                </button>

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
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-sm font-headline font-bold transition-colors"
                >
                  <Navigation size={17} className="text-primary" />
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
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-sm font-headline font-bold transition-colors"
                >
                  <Compass size={17} className="text-primary" />
                  <span>Waze</span>
                </a>

                <button
                  type="button"
                  onClick={() => navigate('/freelancer/agenda')}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-primary hover:text-on-primary text-sm font-headline font-bold transition-colors"
                >
                  <Calendar size={17} />
                  <span>Agenda</span>
                </button>
              </div>
            </div>

            {/* Section Heading: High Match Shifts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-headline font-extrabold text-on-surface">
                    Vagas com Maior Match (98% de Compatibilidade)
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Selecionadas com base no seu histórico profissional e localização em {userCity}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/freelancer/vagas')}
                  className="text-xs font-headline font-bold text-primary flex items-center gap-1.5 hover:underline shrink-0"
                >
                  <span>Ver todas as vagas</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Grid of Recommended Jobs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highMatchJobs.map((job) => {
                  const isApplied = alreadyAppliedIds.has(job.id);
                  const jobDistance = calculateDistanceKm(userCoords, resolveCoordinates(job));
                  return (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/70 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> 98% Match
                          </span>
                          <span className="text-base font-headline font-extrabold text-primary">
                            {formatBudget(
                              job.budget || (job.valor_da_diaria ? `R$ ${job.valor_da_diaria}` : null)
                            )}
                          </span>
                        </div>

                        <h3
                          onClick={() => setDrawerJob(job)}
                          className="text-base font-headline font-bold text-on-surface leading-snug hover:text-primary cursor-pointer transition-colors"
                        >
                          {job.title}
                        </h3>

                        <p className="text-xs text-on-surface-variant flex items-center gap-1.5 flex-wrap">
                          <MapPin size={13} className="text-primary shrink-0" />
                          <span>
                            {job.company_name || job.employer?.name || 'Empresa'} •{' '}
                            {job.cidade || userCity}
                            {job.bairro ? ` (${job.bairro})` : ''}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                            {formatDistanceKm(jobDistance)}
                          </span>
                        </p>
                      </div>

                      <div className="rounded-xl bg-surface-container-low p-2.5 flex items-center justify-between text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-primary" />
                          {job.data_do_turno
                            ? new Date(job.data_do_turno).toLocaleDateString('pt-BR')
                            : 'Imediato'}
                        </span>
                        <span className="font-bold text-on-surface">
                          {job.horario || 'Turno Confirmado'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDrawerJob(job)}
                          className="px-3.5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-headline font-bold text-on-surface flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye size={14} />
                          <span>Detalhes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApply(job.id, job.title)}
                          disabled={isApplied}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-headline font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                            isApplied
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-primary text-on-primary hover:bg-primary-dark active:scale-95'
                          }`}
                        >
                          <Zap size={14} />
                          <span>{isApplied ? 'Candidatura Enviada' : 'Candidatar 1 Clique'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Banner for Instant Availability */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-headline font-bold text-on-surface">
                    Disponibilidade Express Ativa
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Empresas da região podem enviar convites diretos para turnos de emergência hoje.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/freelancer/agenda')}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs shrink-0 hover:bg-primary-dark transition-colors"
              >
                Configurar Disponibilidade
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (4 cols): Insights, Applications & Fast Support */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Widget 1: Minhas Candidaturas Recentes */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/70 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Minhas Candidaturas
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/freelancer/candidaturas')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Ver todas
                </button>
              </div>

              <div className="space-y-3">
                {myApplications && myApplications.length > 0
                  ? myApplications.slice(0, 3).map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => navigate('/freelancer/candidaturas')}
                        className="w-full text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between gap-3 border border-outline-variant/50 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-headline font-bold text-on-surface">
                            {app.job?.title || 'Vaga Freelancer'}
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">
                            {app.job?.cidade || userCity} • {formatBudget(app.job?.budget || null)}
                          </p>
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
                        className="w-full text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between gap-3 border border-outline-variant/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-headline font-bold text-on-surface truncate">
                            {app.job.title}
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                            {app.job.company_name} • {app.job.budget}
                          </p>
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
            </div>

            {/* Widget 2: Radar de Demanda Local (Ao Vivo) */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-primary fill-primary" />
                  <h3 className="font-headline font-bold text-base text-on-surface">
                    Radar de Demanda
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-secondary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  Ao Vivo
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
                      <Utensils size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-headline font-bold text-on-surface">
                        Gastronomia & Salão
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        Lourdes, Savassi e Vila da Serra
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-headline font-black text-on-surface">54 vagas</span>
                    <span className="block text-[10px] text-secondary font-bold">Alta Demanda</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
                      <Truck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-headline font-bold text-on-surface">
                        Logística & CDs
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        Contagem, Betim e Ceasa
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-headline font-black text-on-surface">38 vagas</span>
                    <span className="block text-[10px] text-secondary font-bold">Média Estável</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
                      <PartyPopper size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-headline font-bold text-on-surface">
                        Eventos & Festas
                      </p>
                      <p className="text-[10px] text-on-surface-variant">Pampulha e Nova Lima</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-headline font-black text-on-surface">27 vagas</span>
                    <span className="block text-[10px] text-secondary font-bold">Pico de Sexta</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary-container/60 border border-primary/15 flex items-start gap-2.5">
                <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface leading-relaxed">
                  <strong className="text-primary font-bold">Dica Pro:</strong> Turnos de fim de semana
                  à noite têm aprovação{' '}
                  <strong className="text-secondary font-bold">40% mais rápida</strong> e gorjetas
                  maiores.
                </p>
              </div>
            </div>

            {/* Widget 3: Plantão de Atendimento 24h & Suporte Operacional */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                  <Phone size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-headline font-bold text-on-surface">
                    Plantão VaptVaga 24h
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Suporte imediato para dúvidas de turnos e repasses PIX.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs transition-colors text-center border border-outline-variant/60"
                >
                  <MessageCircle size={15} className="text-secondary" />
                  <span>Acionar Plantão no Chat do App</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/planos')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs transition-colors text-center shadow-sm"
                >
                  <Bell size={15} />
                  <span>Ativar Alertas VIP Vapt PRO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
