export interface Job {
  id: string;
  employer_id: string;
  title: string;
  category: string;
  wage_value: number;
  shift_date: string;
  description: string;
  status: 'open' | 'filled' | 'completed';
  company_name: string;
  city: string;
  created_at: string;
}

export interface Profile {
  id: string;
  role: 'company' | 'freelancer';
  subscription_tier: 'free' | 'premium';
  full_name: string;
  whatsapp: string;
  avatar_url: string;
  skills?: string[];
  company_name?: string;
  city: string;
}

export interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  freelancer_name: string;
  freelancer_skills: string[];
  freelancer_whatsapp: string;
  created_at: string;
}

export const mockJobs: Job[] = [
  {
    id: '1',
    employer_id: 'c1',
    title: 'Garçom para evento corporativo',
    category: 'Bares/Restaurantes',
    wage_value: 180,
    shift_date: '2026-03-18',
    description: 'Precisamos de garçom experiente para evento corporativo de 50 pessoas. Turno das 18h às 23h.',
    status: 'open',
    company_name: 'Restaurante Sabor & Arte',
    city: 'São Paulo',
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: '2',
    employer_id: 'c2',
    title: 'Vendedor de loja temporário',
    category: 'Vendas/Lojas',
    wage_value: 150,
    shift_date: '2026-03-19',
    description: 'Vendedor para cobrir férias. Experiência com atendimento ao público.',
    status: 'open',
    company_name: 'Magazine Central',
    city: 'São Paulo',
    created_at: '2026-03-15T11:00:00Z',
  },
  {
    id: '3',
    employer_id: 'c3',
    title: 'Auxiliar de cozinha - Almoço',
    category: 'Bares/Restaurantes',
    wage_value: 130,
    shift_date: '2026-03-17',
    description: 'Ajudante de cozinha para horário de almoço. Das 10h às 15h.',
    status: 'open',
    company_name: 'Cantina da Nonna',
    city: 'Rio de Janeiro',
    created_at: '2026-03-14T09:00:00Z',
  },
  {
    id: '4',
    employer_id: 'c1',
    title: 'Faxineiro pós-evento',
    category: 'Limpeza',
    wage_value: 120,
    shift_date: '2026-03-20',
    description: 'Limpeza completa do salão após evento. Turno das 00h às 06h.',
    status: 'open',
    company_name: 'Espaço Eventos Premium',
    city: 'São Paulo',
    created_at: '2026-03-15T14:00:00Z',
  },
  {
    id: '5',
    employer_id: 'c2',
    title: 'Promotor para ação de marketing',
    category: 'Eventos',
    wage_value: 200,
    shift_date: '2026-03-21',
    description: 'Promotor para distribuição de amostras em shopping. Das 10h às 18h.',
    status: 'open',
    company_name: 'Agência MKT Plus',
    city: 'Belo Horizonte',
    created_at: '2026-03-15T16:00:00Z',
  },
  {
    id: '6',
    employer_id: 'c3',
    title: 'Chapa para mudança comercial',
    category: 'Eventos',
    wage_value: 160,
    shift_date: '2026-03-22',
    description: 'Precisamos de 2 chapas para mudança de escritório. Turno integral.',
    status: 'open',
    company_name: 'TransMuda Express',
    city: 'São Paulo',
    created_at: '2026-03-16T08:00:00Z',
  },
];

export const mockApplications: Application[] = [
  {
    id: 'a1',
    job_id: '1',
    freelancer_id: 'f1',
    freelancer_name: 'Carlos Silva',
    freelancer_skills: ['Garçom', 'Barman'],
    freelancer_whatsapp: '11999887766',
    created_at: '2026-03-15T12:00:00Z',
  },
  {
    id: 'a2',
    job_id: '1',
    freelancer_id: 'f2',
    freelancer_name: 'Ana Oliveira',
    freelancer_skills: ['Garçom', 'Hostess'],
    freelancer_whatsapp: '11988776655',
    created_at: '2026-03-15T13:00:00Z',
  },
  {
    id: 'a3',
    job_id: '1',
    freelancer_id: 'f3',
    freelancer_name: 'Roberto Santos',
    freelancer_skills: ['Garçom', 'Cozinha'],
    freelancer_whatsapp: '11977665544',
    created_at: '2026-03-15T14:30:00Z',
  },
];

export const categories = [
  { name: 'Bares/Restaurantes', icon: 'UtensilsCrossed', count: 34 },
  { name: 'Vendas/Lojas', icon: 'ShoppingBag', count: 18 },
  { name: 'Limpeza', icon: 'Sparkles', count: 12 },
  { name: 'Eventos', icon: 'PartyPopper', count: 25 },
];
