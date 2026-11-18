import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Lock,
  Unlock,
  Navigation,
  Compass,
  ExternalLink,
  CalendarPlus,
  Eye,
  Trash2,
  Zap,
  Wallet,
  Sparkles,
  Sliders,
  ListChecks,
  X,
  QrCode,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyApplications, useMyJobs } from '@/hooks/useSupabase';
import { formatBudget } from '@/lib/types';
import { DEMO_APPLICATIONS, DEMO_COMPANY_JOBS } from '@/lib/demoData';
import { JobDetailsDrawer, type JobDrawerData } from '@/components/vaptvaga/JobDetailsDrawer';
import { CheckinModal, CompanyCheckinPassModal } from '@/components/vaptvaga/CheckinModal';
import { toast } from '@/hooks/use-toast';
import {
  type AgendaEvent,
  type DayOfWeekId,
  type ShiftPeriodId,
  type UserScheduleState,
  DAYS_OF_WEEK,
  SHIFT_PERIODS,
  toLocalDateIso,
  normalizeIsoDate,
  parseHorarioRange,
  getUserScheduleState,
  saveUserScheduleState,
  buildGoogleCalendarUrl,
} from '@/lib/scheduleStorage';
import {
  resolveCoordinates,
  calculateDistanceKm,
  formatDistanceKm,
  detectUserLocation,
  getGoogleMapsDirectionsUrl,
  getWazeNavigationUrl,
} from '@/lib/geolocation';

type ViewMode = 'month' | 'week' | 'availability';

const TODAY_DATE = new Date();
const TODAY_ISO = toLocalDateIso(TODAY_DATE);

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STATUS_BADGE_MAP = {
  confirmado: {
    label: 'Confirmado',
    chipClass: 'bg-secondary-container text-on-secondary-container',
    dotClass: 'bg-secondary',
  },
  em_analise: {
    label: 'Em Análise',
    chipClass: 'bg-primary-container text-primary',
    dotClass: 'bg-primary',
  },
  concluido: {
    label: 'Concluído',
    chipClass: 'bg-surface-container text-on-surface-variant',
    dotClass: 'bg-outline',
  },
  pessoal: {
    label: 'Compromisso',
    chipClass: 'bg-amber-100 text-amber-800',
    dotClass: 'bg-amber-500',
  },
} as const;

const parseCurrencyValue = (budget?: string | null, numericVal?: number | null): number => {
  if (typeof numericVal === 'number' && !Number.isNaN(numericVal)) return numericVal;
  if (!budget) return 0;
  const match = budget.replace(/\./g, '').match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const ScheduleWorkspace: React.FC<{ userId?: string }> = ({ userId }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isCompany = profile?.role === 'company';

  const [scheduleState, setScheduleState] = useState<UserScheduleState>(() =>
    getUserScheduleState(userId)
  );
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [cursorYear, setCursorYear] = useState<number>(TODAY_DATE.getFullYear());
  const [cursorMonth, setCursorMonth] = useState<number>(TODAY_DATE.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_ISO);
  const [drawerJob, setDrawerJob] = useState<JobDrawerData | null>(null);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [activeCheckinEvent, setActiveCheckinEvent] = useState<AgendaEvent | null>(null);
  const [companyPassEvent, setCompanyPassEvent] = useState<AgendaEvent | null>(null);

  // Modal state for adding custom shift/appointment
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDate, setNewDate] = useState(TODAY_ISO);
  const [newStart, setNewStart] = useState('18:00');
  const [newEnd, setNewEnd] = useState('00:00');
  const [newValor, setNewValor] = useState('180');
  const [newCidade, setNewCidade] = useState(profile?.cidade || 'Belo Horizonte');
  const [newBairro, setNewBairro] = useState(profile?.bairro || '');
  const [newNotes, setNewNotes] = useState('');

  const eventCounterRef = useRef(1);

  const { data: realApplications } = useMyApplications(!isCompany ? userId : undefined);
  const { data: realCompanyJobs } = useMyJobs(isCompany ? userId : undefined);

  const userCoords = useMemo(() => resolveCoordinates(profile || undefined), [profile]);

  const persistSchedule = (updater: (prev: UserScheduleState) => UserScheduleState) => {
    setScheduleState((prev) => {
      const next = updater(prev);
      saveUserScheduleState(userId, next);
      return next;
    });
  };

  // Build unified agenda events from platform data + custom events
  const baseEvents = useMemo<AgendaEvent[]>(() => {
    if (isCompany) {
      const sourceJobs =
        realCompanyJobs && realCompanyJobs.length > 0 ? realCompanyJobs : DEMO_COMPANY_JOBS;
      return sourceJobs.map((job) => {
        const dateIso = normalizeIsoDate(job.data_do_turno, TODAY_ISO);
        const budgetText = formatBudget(job.budget || null);
        const valor = parseCurrencyValue(
          job.budget,
          'valor_da_diaria' in job ? (job.valor_da_diaria as number | null) : null
        );
        return {
          id: `job-${job.id}`,
          jobId: job.id,
          title: job.title || 'Turno Publicado',
          companyName: profile?.name || 'Minha Empresa',
          date: dateIso,
          startTime: '18:00',
          endTime: '00:00',
          budget: budgetText,
          valorDiaria: valor,
          cidade: job.cidade || profile?.cidade || 'Belo Horizonte',
          bairro: job.bairro || '',
          latitude: 'latitude' in job ? (job.latitude as number | null) : null,
          longitude: 'longitude' in job ? (job.longitude as number | null) : null,
          status: job.status === 'closed' || job.status === 'completed' ? 'concluido' : 'confirmado',
          notes: job.description || undefined,
          candidatesCount: 3,
        };
      });
    }

    if (realApplications && realApplications.length > 0) {
      return realApplications.map((app) => {
        const rawStatus = (app.status || '').toLowerCase();
        const status: AgendaEvent['status'] =
          rawStatus === 'accepted' || rawStatus === 'confirmed' || rawStatus === 'confirmado'
            ? 'confirmado'
            : rawStatus === 'completed' || rawStatus === 'finalizado'
              ? 'concluido'
              : 'em_analise';
        const valor = parseCurrencyValue(app.job?.budget, app.job?.valor_da_diaria);
        return {
          id: `app-${app.id}`,
          jobId: app.job_id,
          title: app.job?.title || 'Turno Freelancer',
          companyName: app.job?.employer?.name || 'Empresa Parceira',
          date: normalizeIsoDate(app.job?.data_do_turno || app.created_at, TODAY_ISO),
          startTime: '18:00',
          endTime: '00:00',
          budget: formatBudget(app.job?.budget || null),
          valorDiaria: valor,
          cidade: app.job?.cidade || profile?.cidade || 'Belo Horizonte',
          bairro: app.job?.bairro || '',
          latitude: app.job?.latitude ?? null,
          longitude: app.job?.longitude ?? null,
          status,
          notes: app.job?.description || undefined,
        };
      });
    }

    return DEMO_APPLICATIONS.map((app) => {
      const { startTime, endTime } = parseHorarioRange(app.job.horario);
      const status: AgendaEvent['status'] =
        app.status === 'confirmado'
          ? 'confirmado'
          : app.status === 'finalizado'
            ? 'concluido'
            : 'em_analise';
      return {
        id: `demo-app-${app.id}`,
        jobId: app.job_id,
        title: app.job.title,
        companyName: app.job.company_name || app.job.employer?.name || 'Empresa Parceira',
        date: normalizeIsoDate(app.job.data_do_turno || app.created_at, TODAY_ISO),
        startTime,
        endTime,
        budget: app.job.budget || 'R$ 180,00',
        valorDiaria: parseCurrencyValue(app.job.budget, app.job.valor_da_diaria),
        cidade: app.job.cidade || 'Belo Horizonte',
        bairro: app.job.bairro || '',
        latitude: app.job.latitude ?? null,
        longitude: app.job.longitude ?? null,
        status,
        notes: app.job.description || undefined,
      };
    });
  }, [isCompany, realCompanyJobs, realApplications, profile?.name, profile?.cidade]);

  const checkedInSet = useMemo(
    () => new Set(scheduleState.checkedInEventIds),
    [scheduleState.checkedInEventIds]
  );

  const blockedSet = useMemo(
    () => new Set(scheduleState.blockedDates),
    [scheduleState.blockedDates]
  );

  const allEvents = useMemo<AgendaEvent[]>(() => {
    const merged = [...baseEvents, ...scheduleState.customEvents].map((ev) => ({
      ...ev,
      checkedIn: checkedInSet.has(ev.id),
    }));
    return merged.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  }, [baseEvents, scheduleState.customEvents, checkedInSet]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const ev of allEvents) {
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [allEvents]);

  const selectedDayEvents = useMemo(
    () => eventsByDate.get(selectedDate) || [],
    [eventsByDate, selectedDate]
  );

  // Month grid computation
  const monthDays = useMemo(() => {
    const firstDay = new Date(cursorYear, cursorMonth, 1);
    const startWeekday = firstDay.getDay(); // 0 (Dom) - 6 (Sab)
    const daysInMonth = new Date(cursorYear, cursorMonth + 1, 0).getDate();

    const cells: Array<{ iso: string; dayNumber: number; inCurrentMonth: boolean }> = [];

    // Leading days from previous month
    const prevMonthDays = new Date(cursorYear, cursorMonth, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(cursorYear, cursorMonth - 1, prevMonthDays - i);
      cells.push({
        iso: toLocalDateIso(d),
        dayNumber: d.getDate(),
        inCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(cursorYear, cursorMonth, day);
      cells.push({
        iso: toLocalDateIso(d),
        dayNumber: day,
        inCurrentMonth: true,
      });
    }

    // Trailing days to complete weeks
    const remainder = cells.length % 7;
    if (remainder > 0) {
      const needed = 7 - remainder;
      for (let i = 1; i <= needed; i++) {
        const d = new Date(cursorYear, cursorMonth + 1, i);
        cells.push({
          iso: toLocalDateIso(d),
          dayNumber: d.getDate(),
          inCurrentMonth: false,
        });
      }
    }

    return cells;
  }, [cursorYear, cursorMonth]);

  // Current week dates anchored around selectedDate
  const weekDays = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const base = new Date(y, (m || 1) - 1, d || 1);
    const sunday = new Date(base);
    sunday.setDate(base.getDate() - base.getDay());

    return Array.from({ length: 7 }, (_, idx) => {
      const dayObj = new Date(sunday);
      dayObj.setDate(sunday.getDate() + idx);
      return {
        iso: toLocalDateIso(dayObj),
        dayNumber: dayObj.getDate(),
        weekdayShort: WEEKDAY_HEADERS[idx],
        monthShort: MONTH_NAMES_PT[dayObj.getMonth()].slice(0, 3),
      };
    });
  }, [selectedDate]);

  // KPI metrics
  const kpis = useMemo(() => {
    const confirmed = allEvents.filter((e) => e.status === 'confirmado');
    const forecastTotal = allEvents
      .filter((e) => e.status !== 'concluido')
      .reduce((acc, e) => acc + (e.valorDiaria || 0), 0);
    const activeWeekDays = Object.values(scheduleState.weeklyAvailability).filter(
      (periods) => periods.length > 0
    ).length;
    const totalCheckins = scheduleState.checkedInEventIds.length;
    return {
      confirmedCount: confirmed.length,
      forecastTotal,
      activeWeekDays,
      totalCheckins,
      totalEventsCount: allEvents.length,
    };
  }, [allEvents, scheduleState.weeklyAvailability, scheduleState.checkedInEventIds]);

  const goToPrevMonth = () => {
    if (cursorMonth === 0) {
      setCursorMonth(11);
      setCursorYear((y) => y - 1);
    } else {
      setCursorMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (cursorMonth === 11) {
      setCursorMonth(0);
      setCursorYear((y) => y + 1);
    } else {
      setCursorMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCursorYear(TODAY_DATE.getFullYear());
    setCursorMonth(TODAY_DATE.getMonth());
    setSelectedDate(TODAY_ISO);
  };

  const toggleBlockedDate = (dateIso: string) => {
    const alreadyBlocked = blockedSet.has(dateIso);
    persistSchedule((prev) => ({
      ...prev,
      blockedDates: alreadyBlocked
        ? prev.blockedDates.filter((d) => d !== dateIso)
        : [...prev.blockedDates, dateIso],
    }));
    toast({
      title: alreadyBlocked ? '📅 Dia liberado na agenda!' : '🔒 Dia marcado como folga',
      description: alreadyBlocked
        ? 'Você voltará a receber convites para este dia.'
        : 'Empresas verão que você não está disponível nesta data.',
    });
  };

  const toggleExpressAvailable = () => {
    const nextVal = !scheduleState.expressAvailable;
    persistSchedule((prev) => ({ ...prev, expressAvailable: nextVal }));
    toast({
      title: nextVal
        ? '⚡ Disponibilidade Express Ativada!'
        : 'Disponibilidade Express Pausada',
      description: nextVal
        ? 'Você aparecerá no radar prioritário para turnos urgentes hoje.'
        : 'Você não receberá convites de última hora enquanto estiver pausado.',
    });
  };

  const toggleAvailabilitySlot = (day: DayOfWeekId, period: ShiftPeriodId) => {
    persistSchedule((prev) => {
      const current = prev.weeklyAvailability[day] || [];
      const updated = current.includes(period)
        ? current.filter((p) => p !== period)
        : [...current, period];
      return {
        ...prev,
        weeklyAvailability: {
          ...prev.weeklyAvailability,
          [day]: updated,
        },
      };
    });
  };

  const handleSaveAvailability = () => {
    saveUserScheduleState(userId, scheduleState);
    toast({
      title: '✅ Disponibilidade semanal salva!',
      description: 'Seus horários preferenciais já estão ativos no radar de vagas.',
    });
  };

  const handleEventCheckin = async (
    event: AgendaEvent,
    method: 'code' | 'qr',
    codeValue: string
  ) => {
    setCheckingInId(event.id);
    const methodLabel = method === 'qr' ? 'QR Code' : 'Código';
    const targetCoords = resolveCoordinates({
      latitude: event.latitude,
      longitude: event.longitude,
      bairro: event.bairro,
      cidade: event.cidade,
    });
    try {
      const detected = await detectUserLocation();
      const dist = calculateDistanceKm(detected, targetCoords);
      persistSchedule((prev) => ({
        ...prev,
        checkedInEventIds: prev.checkedInEventIds.includes(event.id)
          ? prev.checkedInEventIds
          : [...prev.checkedInEventIds, event.id],
      }));
      setActiveCheckinEvent(null);
      toast({
        title: `📍 Check-in via ${methodLabel} Confirmado!`,
        description: `Código ${codeValue} e GPS (${formatDistanceKm(dist)} do local) validados em ${event.companyName}.`,
      });
    } catch {
      persistSchedule((prev) => ({
        ...prev,
        checkedInEventIds: prev.checkedInEventIds.includes(event.id)
          ? prev.checkedInEventIds
          : [...prev.checkedInEventIds, event.id],
      }));
      setActiveCheckinEvent(null);
      toast({
        title: `📍 Check-in via ${methodLabel} Registrado!`,
        description: `Código ${codeValue} confirmado na agenda para ${event.companyName}.`,
      });
    } finally {
      setCheckingInId(null);
    }
  };

  const handleOpenNewModal = (prefillDate?: string) => {
    setNewDate(prefillDate || selectedDate);
    setNewTitle('');
    setNewCompany(isCompany ? profile?.name || 'Minha Empresa' : '');
    setNewNotes('');
    setModalOpen(true);
  };

  const handleCreateCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast({ title: 'Informe o título do turno ou compromisso', variant: 'destructive' });
      return;
    }

    const numericValor = Number(newValor) || 0;
    const coords = resolveCoordinates({ bairro: newBairro, cidade: newCidade });
    const id = `custom-${eventCounterRef.current++}-${newDate}`;

    const newEvent: AgendaEvent = {
      id,
      title: newTitle.trim(),
      companyName: newCompany.trim() || (isCompany ? profile?.name || 'Minha Empresa' : 'Evento Particular'),
      date: newDate,
      startTime: newStart || '18:00',
      endTime: newEnd || '00:00',
      budget: numericValor > 0 ? `R$ ${numericValor.toFixed(0)},00` : 'A combinar',
      valorDiaria: numericValor,
      cidade: newCidade.trim() || 'Belo Horizonte',
      bairro: newBairro.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      status: 'pessoal',
      notes: newNotes.trim() || undefined,
    };

    persistSchedule((prev) => ({
      ...prev,
      customEvents: [...prev.customEvents, newEvent],
    }));

    const [y, m] = newDate.split('-').map(Number);
    if (y && m) {
      setCursorYear(y);
      setCursorMonth(m - 1);
    }
    setSelectedDate(newDate);
    setModalOpen(false);
    toast({
      title: '🗓️ Adicionado à agenda!',
      description: `${newEvent.title} agendado para ${new Date(`${newDate}T12:00:00`).toLocaleDateString('pt-BR')}.`,
    });
  };

  const handleDeleteCustomEvent = (eventId: string) => {
    persistSchedule((prev) => ({
      ...prev,
      customEvents: prev.customEvents.filter((ev) => ev.id !== eventId),
    }));
    toast({ title: 'Compromisso removido da agenda' });
  };

  const openEventDrawer = (ev: AgendaEvent) => {
    setDrawerJob({
      id: ev.jobId || ev.id,
      title: ev.title,
      company_name: ev.companyName,
      cidade: ev.cidade,
      bairro: ev.bairro,
      latitude: ev.latitude,
      longitude: ev.longitude,
      budget: ev.budget,
      valor_da_diaria: ev.valorDiaria,
      data_do_turno: ev.date,
      horario: `${ev.startTime} às ${ev.endTime}`,
      description: ev.notes,
      distanceKm: calculateDistanceKm(
        userCoords,
        resolveCoordinates({
          latitude: ev.latitude,
          longitude: ev.longitude,
          bairro: ev.bairro,
          cidade: ev.cidade,
        })
      ),
    });
  };

  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-transparent w-full font-body">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 lg:py-8 space-y-6">
        {/* Header & Primary Controls */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                <CalendarIcon size={13} />
                {isCompany ? 'Escala Operacional' : 'Agenda Profissional'}
              </span>
              {!isCompany && (
                <button
                  type="button"
                  onClick={toggleExpressAvailable}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    scheduleState.expressAvailable
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <Zap size={12} className={scheduleState.expressAvailable ? 'fill-current' : ''} />
                  <span>
                    {scheduleState.expressAvailable
                      ? 'Disponível Express ✓'
                      : 'Express Pausado'}
                  </span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-on-surface mt-1">
              {isCompany ? 'Agenda de Turnos & Escalas' : 'Minha Agenda de Turnos'}
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant">
              {isCompany
                ? 'Visualize seus turnos publicados por dia, acompanhe escalas e publique novas urgências.'
                : 'Organize seus turnos confirmados, faça check-in GPS, bloqueie folgas e configure sua disponibilidade.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenNewModal(selectedDate)}
              className="px-5 py-3 rounded-2xl bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/70 font-headline font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus size={16} className="text-primary" />
              <span>Novo Compromisso</span>
            </button>

            {isCompany ? (
              <button
                type="button"
                onClick={() => navigate(`/post-job?date=${selectedDate}`)}
                className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-95"
              >
                <Zap size={16} className="fill-current" />
                <span>+ Publicar no Dia</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/freelancer/vagas')}
                className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-95"
              >
                <Sparkles size={16} />
                <span>Preencher Horários Livres</span>
              </button>
            )}
          </div>
        </header>

        {/* KPI Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/70 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              {isCompany ? 'Turnos Escalados' : 'Turnos Confirmados'}
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-headline font-black text-on-surface">
                {kpis.confirmedCount}
              </span>
              <span className="text-xs font-bold text-secondary">ativos</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/70 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              {isCompany ? 'Orçamento Previsto' : 'Receita na Agenda'}
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-headline font-black text-primary">
                R$ {kpis.forecastTotal}
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/70 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              {isCompany ? 'Dias de Operação' : 'Dias Disponíveis'}
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-headline font-black text-on-surface">
                {kpis.activeWeekDays}/7
              </span>
              <span className="text-xs font-medium text-on-surface-variant">na semana</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/70 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              {isCompany ? 'Total de Eventos' : 'Check-ins GPS'}
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-headline font-black text-on-surface">
                {isCompany ? kpis.totalEventsCount : kpis.totalCheckins}
              </span>
              <span className="text-xs font-bold text-secondary">
                {isCompany ? 'no calendário' : 'confirmados'}
              </span>
            </div>
          </div>
        </section>

        {/* View Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/70 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'month' as const, label: 'Calendário Mensal', icon: CalendarIcon },
              { id: 'week' as const, label: 'Visão Semanal', icon: ListChecks },
              {
                id: 'availability' as const,
                label: isCompany ? 'Janelas de Pico' : 'Disponibilidade & Folgas',
                icon: Sliders,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                    active
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {viewMode === 'month' && (
            <div className="flex items-center gap-2 px-1">
              <button
                type="button"
                onClick={goToPrevMonth}
                aria-label="Mês anterior"
                className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-[140px] text-center font-headline font-extrabold text-sm text-on-surface">
                {MONTH_NAMES_PT[cursorMonth]} {cursorYear}
              </span>
              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="Próximo mês"
                className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-1.5 rounded-xl bg-primary-container text-primary font-headline font-bold text-xs hover:bg-primary hover:text-on-primary transition-colors"
              >
                Hoje
              </button>
            </div>
          )}
        </div>

        {/* Main Workspace Grid: Calendar / Week / Availability (Left 8 cols) + Selected Day Inspector (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT WORKSPACE */}
          <div className="lg:col-span-8 space-y-6">
            {viewMode === 'month' && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-sm p-4 sm:p-6">
                {/* Weekday Header */}
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {WEEKDAY_HEADERS.map((wd) => (
                    <div
                      key={wd}
                      className="text-center text-[11px] font-headline font-extrabold uppercase tracking-wider text-on-surface-variant py-1.5"
                    >
                      {wd}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {monthDays.map((cell) => {
                    const dayEvents = eventsByDate.get(cell.iso) || [];
                    const isSelected = selectedDate === cell.iso;
                    const isToday = TODAY_ISO === cell.iso;
                    const isBlocked = blockedSet.has(cell.iso);

                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        onClick={() => setSelectedDate(cell.iso)}
                        className={`min-h-[76px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-primary-container/35 border-primary ring-2 ring-primary/20 shadow-sm'
                            : isBlocked
                              ? 'bg-error-container/30 border-error/25'
                              : cell.inCurrentMonth
                                ? 'bg-surface-container-low/50 border-outline-variant/50 hover:bg-surface-container-low'
                                : 'bg-surface-container-low/20 border-transparent opacity-45 hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-headline font-bold flex items-center justify-center ${
                              isToday
                                ? 'bg-primary text-on-primary shadow-sm'
                                : isSelected
                                  ? 'text-primary font-black'
                                  : 'text-on-surface'
                            }`}
                          >
                            {cell.dayNumber}
                          </span>
                          {isBlocked && (
                            <Lock size={11} className="text-error shrink-0" />
                          )}
                        </div>

                        <div className="space-y-1 w-full overflow-hidden">
                          {dayEvents.slice(0, 2).map((ev) => {
                            const style = STATUS_BADGE_MAP[ev.status];
                            return (
                              <div
                                key={ev.id}
                                className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate ${style.chipClass}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`}
                                />
                                <span className="truncate">{ev.title}</span>
                              </div>
                            );
                          })}
                          {dayEvents.length > 0 && (
                            <div className="flex sm:hidden items-center gap-1 pt-1">
                              {dayEvents.slice(0, 3).map((ev) => (
                                <span
                                  key={ev.id}
                                  className={`w-2 h-2 rounded-full ${STATUS_BADGE_MAP[ev.status].dotClass}`}
                                />
                              ))}
                            </div>
                          )}
                          {dayEvents.length > 2 && (
                            <span className="hidden sm:block text-[10px] font-bold text-primary pl-1">
                              +{dayEvents.length - 2} mais
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-5 pt-4 border-t border-outline-variant/50 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Confirmado
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Em Análise
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Compromisso Manual
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Lock size={12} className="text-error" /> Folga / Bloqueado
                  </span>
                </div>
              </div>
            )}

            {viewMode === 'week' && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline font-extrabold text-lg text-on-surface">
                      Agenda da Semana
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Clique em qualquer dia para inspecionar rotas ou adicionar turno.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={goToToday}
                    className="px-3 py-1.5 rounded-xl bg-primary-container text-primary text-xs font-bold"
                  >
                    Semana Atual
                  </button>
                </div>

                <div className="space-y-3">
                  {weekDays.map((day) => {
                    const dayEvents = eventsByDate.get(day.iso) || [];
                    const isSelected = selectedDate === day.iso;
                    const isToday = TODAY_ISO === day.iso;
                    const isBlocked = blockedSet.has(day.iso);

                    return (
                      <div
                        key={day.iso}
                        onClick={() => setSelectedDate(day.iso)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-primary-container/25 border-primary ring-1 ring-primary/20'
                            : 'bg-surface-container-low/60 border-outline-variant/60 hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-[140px]">
                          <div
                            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                              isToday
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface-container-lowest border border-outline-variant/60 text-on-surface'
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase opacity-80">
                              {day.weekdayShort}
                            </span>
                            <span className="text-base font-headline font-black leading-none">
                              {day.dayNumber}
                            </span>
                          </div>
                          <div>
                            <p className="font-headline font-bold text-sm text-on-surface">
                              {day.dayNumber} de {day.monthShort}
                              {isToday ? ' (Hoje)' : ''}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              {isBlocked
                                ? 'Dia bloqueado (Folga)'
                                : dayEvents.length > 0
                                  ? `${dayEvents.length} ${dayEvents.length === 1 ? 'turno' : 'turnos'}`
                                  : 'Horário livre'}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-wrap gap-2">
                          {dayEvents.length > 0 ? (
                            dayEvents.map((ev) => (
                              <span
                                key={ev.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                                  STATUS_BADGE_MAP[ev.status].chipClass
                                }`}
                              >
                                <Clock size={12} />
                                <span>
                                  {ev.startTime} • {ev.title}
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-on-surface-variant italic">
                              Sem turnos agendados
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'availability' && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-sm p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-headline font-extrabold text-lg text-on-surface">
                      {isCompany
                        ? 'Janelas de Maior Demanda Operacional'
                        : 'Disponibilidade Semanal por Turno'}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {isCompany
                        ? 'Marque os dias e períodos em que seu estabelecimento costuma precisar de reforço.'
                        : 'Selecione os dias e turnos em que você está disponível para receber convites automáticos.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAvailability}
                    className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs shadow-sm transition-colors self-start"
                  >
                    Salvar Disponibilidade
                  </button>
                </div>

                {/* Availability Matrix */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/60">
                        <th className="py-3 px-2 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                          Dia
                        </th>
                        {SHIFT_PERIODS.map((p) => (
                          <th
                            key={p.id}
                            className="py-3 px-2 text-center text-xs font-headline font-bold text-on-surface"
                          >
                            <div>{p.label}</div>
                            <div className="text-[10px] font-normal text-on-surface-variant">
                              {p.range}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/40">
                      {DAYS_OF_WEEK.map((day) => {
                        const activePeriods = scheduleState.weeklyAvailability[day.id] || [];
                        return (
                          <tr key={day.id} className="hover:bg-surface-container-low/50">
                            <td className="py-3 px-2 font-headline font-bold text-xs sm:text-sm text-on-surface whitespace-nowrap">
                              {day.label}
                            </td>
                            {SHIFT_PERIODS.map((period) => {
                              const checked = activePeriods.includes(period.id);
                              return (
                                <td key={period.id} className="py-2.5 px-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleAvailabilitySlot(day.id, period.id)}
                                    className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                                      checked
                                        ? 'bg-secondary-container text-on-secondary-container border-secondary/30 shadow-sm'
                                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container'
                                    }`}
                                  >
                                    {checked ? 'Disponível ✓' : '—'}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Selected Day Inspector */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-28">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-sm p-5 sm:p-6 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-outline-variant/50 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-primary">
                      {selectedDate === TODAY_ISO ? 'Agenda de Hoje' : 'Dia Selecionado'}
                    </span>
                    {blockedSet.has(selectedDate) && (
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[10px] font-bold">
                        Folga / Bloqueado
                      </span>
                    )}
                  </div>
                  <h2 className="font-headline font-extrabold text-lg text-on-surface capitalize mt-0.5">
                    {formattedSelectedDate}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenNewModal(selectedDate)}
                  aria-label="Adicionar compromisso neste dia"
                  className="w-9 h-9 rounded-full bg-primary-container text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center transition-colors shrink-0"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Day Quick Action */}
              {!isCompany ? (
                <button
                  type="button"
                  onClick={() => toggleBlockedDate(selectedDate)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-headline font-bold flex items-center justify-center gap-2 border transition-colors ${
                    blockedSet.has(selectedDate)
                      ? 'bg-secondary-container text-on-secondary-container border-secondary/25'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant/60'
                  }`}
                >
                  {blockedSet.has(selectedDate) ? (
                    <>
                      <Unlock size={14} />
                      <span>Liberar Dia para Turnos</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Bloquear Dia (Marcar Folga)</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(`/post-job?date=${selectedDate}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-primary hover:text-on-primary text-xs font-headline font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap size={14} />
                  <span>Publicar Vaga para Este Dia</span>
                </button>
              )}

              {/* Events List for Selected Date */}
              <div className="space-y-3">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((ev) => {
                    const badge = STATUS_BADGE_MAP[ev.status];
                    const coords = resolveCoordinates({
                      latitude: ev.latitude,
                      longitude: ev.longitude,
                      bairro: ev.bairro,
                      cidade: ev.cidade,
                    });
                    const distance = calculateDistanceKm(userCoords, coords);
                    const gmapsUrl = getGoogleMapsDirectionsUrl({
                      destLat: coords.latitude,
                      destLng: coords.longitude,
                      destQuery: `${ev.companyName} ${ev.bairro} ${ev.cidade}`.trim(),
                      originLat: userCoords.latitude,
                      originLng: userCoords.longitude,
                    });
                    const wazeUrl = getWazeNavigationUrl({
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      query: `${ev.companyName} ${ev.cidade}`.trim(),
                    });
                    const gcalUrl = buildGoogleCalendarUrl(ev);

                    return (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.chipClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                              {badge.label}
                            </span>
                            <h3 className="font-headline font-bold text-sm text-on-surface mt-1.5">
                              {ev.title}
                            </h3>
                            <p className="text-xs text-primary font-semibold">{ev.companyName}</p>
                          </div>
                          <span className="font-headline font-black text-sm text-on-surface shrink-0">
                            {ev.budget}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-on-surface-variant">
                          <p className="flex items-center gap-1.5 font-medium">
                            <Clock size={13} className="text-primary shrink-0" />
                            <span>
                              {ev.startTime} às {ev.endTime}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5 font-medium">
                            <MapPin size={13} className="text-primary shrink-0" />
                            <span>
                              {[ev.bairro, ev.cidade].filter(Boolean).join(', ') || 'Região Local'}
                              {' • '}
                              <strong className="text-on-surface">
                                {formatDistanceKm(distance)}
                              </strong>
                            </span>
                          </p>
                        </div>

                        {ev.notes && (
                          <p className="text-[11px] text-on-surface-variant bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40">
                            {ev.notes}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {isCompany && ev.status === 'confirmado' && (
                            <button
                              type="button"
                              onClick={() => setCompanyPassEvent(ev)}
                              className="w-full py-2.5 px-3 rounded-xl bg-secondary text-on-secondary hover:brightness-105 font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                              <QrCode size={14} />
                              <span>QR Code / Código de Check-in</span>
                            </button>
                          )}

                          {!isCompany && ev.status === 'confirmado' && (
                            <button
                              type="button"
                              onClick={() => setActiveCheckinEvent(ev)}
                              disabled={ev.checkedIn}
                              className={`w-full py-2.5 px-3 rounded-xl font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                ev.checkedIn
                                  ? 'bg-secondary text-on-secondary'
                                  : 'bg-primary hover:bg-primary-dark text-on-primary shadow-sm'
                              }`}
                            >
                              {ev.checkedIn ? <CheckCircle2 size={14} /> : <QrCode size={14} />}
                              <span>
                                {ev.checkedIn
                                  ? 'Check-in Realizado ✓'
                                  : 'Fazer Check-in (QR / Código)'}
                              </span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEventDrawer(ev)}
                            className="flex-1 py-2 px-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/60 text-on-surface text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <Eye size={12} />
                            <span>Mapa</span>
                          </button>

                          <a
                            href={gmapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 px-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/60 text-on-surface text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <Navigation size={12} className="text-primary" />
                            <span>Maps</span>
                          </a>

                          <a
                            href={wazeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/60 text-on-surface text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <Compass size={12} className="text-primary" />
                            <span>Waze</span>
                          </a>

                          <a
                            href={gcalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 px-3 rounded-xl bg-surface-container-lowest hover:bg-primary-container border border-outline-variant/60 text-primary text-[11px] font-headline font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CalendarPlus size={13} />
                            <span>Exportar para Google Agenda</span>
                            <ExternalLink size={11} />
                          </a>

                          {ev.status === 'pessoal' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomEvent(ev.id)}
                              className="w-full py-1.5 px-3 rounded-xl text-error hover:bg-error-container/50 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Trash2 size={12} />
                              <span>Remover da agenda</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 rounded-2xl bg-surface-container-low/60 border border-dashed border-outline-variant text-center space-y-2">
                    <Wallet size={24} className="mx-auto text-on-surface-variant opacity-50" />
                    <p className="font-headline font-bold text-sm text-on-surface">
                      Nenhum turno nesta data
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {isCompany
                        ? 'Publique uma vaga para este dia ou adicione um turno à escala.'
                        : 'Horário livre! Explore vagas urgentes ou adicione um compromisso.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal: Adicionar Compromisso / Turno */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-[91] w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <div>
                  <h3 className="font-headline font-extrabold text-lg text-on-surface">
                    Adicionar na Agenda
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Registre um turno particular, escala ou lembrete operacional.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateCustomEvent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Título do Turno / Compromisso
                  </label>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Garçom Evento Corporativo"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Local / Estabelecimento
                    </label>
                    <input
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="Ex: Buffet Palazzo"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Data
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Início
                    </label>
                    <input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-bold text-on-surface outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Término
                    </label>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-bold text-on-surface outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Diária (R$)
                    </label>
                    <input
                      type="number"
                      value={newValor}
                      onChange={(e) => setNewValor(e.target.value)}
                      placeholder="180"
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-bold text-on-surface outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Cidade
                    </label>
                    <input
                      value={newCidade}
                      onChange={(e) => setNewCidade(e.target.value)}
                      placeholder="Belo Horizonte"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Bairro
                    </label>
                    <input
                      value={newBairro}
                      onChange={(e) => setNewBairro(e.target.value)}
                      placeholder="Savassi"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Observações / Traje
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Ex: Camisa social preta, chegar 15 min antes."
                    className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-surface-container-low text-on-surface font-headline font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs shadow-md shadow-primary/20"
                  >
                    Salvar na Agenda
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <JobDetailsDrawer
        job={drawerJob}
        open={!!drawerJob}
        onClose={() => setDrawerJob(null)}
        onOpenChat={() => {
          setDrawerJob(null);
          navigate('/chat');
        }}
        isApplied={!isCompany}
        userCoords={userCoords}
      />

      <CheckinModal
        open={!!activeCheckinEvent}
        onClose={() => setActiveCheckinEvent(null)}
        onConfirm={(method, codeValue) => {
          if (activeCheckinEvent) {
            return handleEventCheckin(activeCheckinEvent, method, codeValue);
          }
        }}
        shiftId={activeCheckinEvent?.jobId || activeCheckinEvent?.id}
        shiftTitle={activeCheckinEvent?.title || 'Turno Confirmado'}
        companyName={activeCheckinEvent?.companyName || 'Contratante'}
        addressLabel={
          activeCheckinEvent
            ? [activeCheckinEvent.bairro, activeCheckinEvent.cidade].filter(Boolean).join(', ')
            : undefined
        }
        isSubmitting={Boolean(activeCheckinEvent && checkingInId === activeCheckinEvent.id)}
      />

      <CompanyCheckinPassModal
        open={!!companyPassEvent}
        onClose={() => setCompanyPassEvent(null)}
        shiftId={companyPassEvent?.jobId || companyPassEvent?.id}
        shiftTitle={companyPassEvent?.title || 'Turno'}
        companyName={companyPassEvent?.companyName || profile?.name || 'Minha Empresa'}
      />
    </div>
  );
};

const Schedule: React.FC = () => {
  const { user, profile } = useAuth();
  const userId = user?.id || profile?.id;
  return <ScheduleWorkspace key={userId || 'guest'} userId={userId} />;
};

export default Schedule;
