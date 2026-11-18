export type ShiftPeriodId = 'manha' | 'tarde' | 'noite' | 'madrugada';
export type DayOfWeekId = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
export type AgendaEventStatus = 'confirmado' | 'em_analise' | 'concluido' | 'pessoal';

export type WeeklyAvailability = Record<DayOfWeekId, ShiftPeriodId[]>;

export interface AgendaEvent {
  id: string;
  jobId?: string;
  title: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  budget: string;
  valorDiaria: number;
  cidade: string;
  bairro: string;
  latitude?: number | null;
  longitude?: number | null;
  status: AgendaEventStatus;
  notes?: string;
  candidatesCount?: number;
  checkedIn?: boolean;
}

export interface UserScheduleState {
  weeklyAvailability: WeeklyAvailability;
  blockedDates: string[];
  expressAvailable: boolean;
  customEvents: AgendaEvent[];
  checkedInEventIds: string[];
}

export const DAYS_OF_WEEK: { id: DayOfWeekId; short: string; label: string }[] = [
  { id: 'seg', short: 'Seg', label: 'Segunda-feira' },
  { id: 'ter', short: 'Ter', label: 'Terça-feira' },
  { id: 'qua', short: 'Qua', label: 'Quarta-feira' },
  { id: 'qui', short: 'Qui', label: 'Quinta-feira' },
  { id: 'sex', short: 'Sex', label: 'Sexta-feira' },
  { id: 'sab', short: 'Sáb', label: 'Sábado' },
  { id: 'dom', short: 'Dom', label: 'Domingo' },
];

export const SHIFT_PERIODS: { id: ShiftPeriodId; label: string; range: string }[] = [
  { id: 'manha', label: 'Manhã', range: '06h – 12h' },
  { id: 'tarde', label: 'Tarde', range: '12h – 18h' },
  { id: 'noite', label: 'Noite', range: '18h – 00h' },
  { id: 'madrugada', label: 'Madrugada', range: '00h – 06h' },
];

const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailability = {
  seg: ['noite'],
  ter: ['noite'],
  qua: ['tarde', 'noite'],
  qui: ['tarde', 'noite'],
  sex: ['tarde', 'noite', 'madrugada'],
  sab: ['manha', 'tarde', 'noite', 'madrugada'],
  dom: ['tarde', 'noite'],
};

const STORAGE_PREFIX = 'vaptvaga_schedule_';

export const toLocalDateIso = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const normalizeIsoDate = (rawDate?: string | null, fallbackIso?: string): string => {
  if (!rawDate) return fallbackIso || toLocalDateIso(new Date());
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) return rawDate.trim();
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return fallbackIso || toLocalDateIso(new Date());
  return toLocalDateIso(parsed);
};

export const parseHorarioRange = (horario?: string | null): { startTime: string; endTime: string } => {
  if (!horario) return { startTime: '18:00', endTime: '00:00' };
  const matches = horario.match(/\d{2}:\d{2}/g);
  if (matches && matches.length >= 2) {
    return { startTime: matches[0], endTime: matches[1] };
  }
  if (matches && matches.length === 1) {
    return { startTime: matches[0], endTime: '00:00' };
  }
  return { startTime: '18:00', endTime: '00:00' };
};

export const getDefaultScheduleState = (): UserScheduleState => ({
  weeklyAvailability: {
    seg: [...DEFAULT_WEEKLY_AVAILABILITY.seg],
    ter: [...DEFAULT_WEEKLY_AVAILABILITY.ter],
    qua: [...DEFAULT_WEEKLY_AVAILABILITY.qua],
    qui: [...DEFAULT_WEEKLY_AVAILABILITY.qui],
    sex: [...DEFAULT_WEEKLY_AVAILABILITY.sex],
    sab: [...DEFAULT_WEEKLY_AVAILABILITY.sab],
    dom: [...DEFAULT_WEEKLY_AVAILABILITY.dom],
  },
  blockedDates: [],
  expressAvailable: true,
  customEvents: [],
  checkedInEventIds: [],
});

export const getUserScheduleState = (userId?: string | null): UserScheduleState => {
  const defaults = getDefaultScheduleState();
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId || 'guest'}`);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<UserScheduleState>;
    return {
      weeklyAvailability: {
        ...defaults.weeklyAvailability,
        ...(parsed.weeklyAvailability || {}),
      },
      blockedDates: Array.isArray(parsed.blockedDates) ? parsed.blockedDates : [],
      expressAvailable:
        typeof parsed.expressAvailable === 'boolean' ? parsed.expressAvailable : true,
      customEvents: Array.isArray(parsed.customEvents) ? parsed.customEvents : [],
      checkedInEventIds: Array.isArray(parsed.checkedInEventIds) ? parsed.checkedInEventIds : [],
    };
  } catch {
    return defaults;
  }
};

export const saveUserScheduleState = (
  userId: string | null | undefined,
  state: UserScheduleState
): void => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId || 'guest'}`, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
};

export const buildGoogleCalendarUrl = (event: AgendaEvent): string => {
  const cleanDate = event.date.replace(/-/g, '');
  const cleanStart = `${event.startTime.replace(':', '')}00`;
  const cleanEnd = `${event.endTime.replace(':', '')}00`;

  let endDateStr = cleanDate;
  if (event.endTime <= event.startTime) {
    const [y, m, d] = event.date.split('-').map(Number);
    const nextDay = new Date(y, (m || 1) - 1, (d || 1) + 1);
    endDateStr = toLocalDateIso(nextDay).replace(/-/g, '');
  }

  const locationStr = [event.companyName, event.bairro, event.cidade].filter(Boolean).join(', ');
  const details = [
    `Turno via VaptVaga • ${event.companyName}`,
    event.budget ? `Valor previsto: ${event.budget}` : '',
    event.notes || '',
  ]
    .filter(Boolean)
    .join('\n');

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', `${event.title} (${event.companyName})`);
  url.searchParams.set('dates', `${cleanDate}T${cleanStart}/${endDateStr}T${cleanEnd}`);
  if (locationStr) url.searchParams.set('location', locationStr);
  if (details) url.searchParams.set('details', details);
  return url.toString();
};

export const generateShiftCheckinCode = (shiftId?: string, companyName?: string): string => {
  const seed = (shiftId || companyName || 'VAPTVAGA-TURNO').toUpperCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const numericPart = String(1000 + (hash % 9000));
  return `VV${numericPart}`;
};
