import type { JobDrawerData } from '@/components/vaptvaga/JobDetailsDrawer';

export const DEMO_JOBS: (JobDrawerData & {
  status: string;
  created_at: string;
  valor_da_diaria: number;
  category: string;
  imageUrl?: string;
})[] = [
  {
    id: 'demo-job-1',
    title: 'Garçom / Atendente de Salão Noturno',
    company_name: 'Cantina Nonna Bella',
    category: 'Gastronomia',
    budget: 'R$ 190,00',
    valor_da_diaria: 190,
    cidade: 'Belo Horizonte',
    bairro: 'Lourdes',
    latitude: -19.9325,
    longitude: -43.9452,
    data_do_turno: new Date().toISOString().slice(0, 10),
    horario: '18:30 às 00:30 (6h)',
    required_skills: ['Garçom', 'Atendimento ao Cliente', 'Gastronomia'],
    description:
      'Atendimento direto às mesas no salão principal, apoio na entrega de pratos e bebidas e organização pós-expediente. Equipe acolhedora e ambiente de alto movimento.',
    perks: ['PIX até 01:00h', 'Jantar incluso no local', 'Ajuda Uber noturno (R$ 20)'],
    requirements: [
      'Experiência mínima de 6 meses com atendimento de salão ou bandeja.',
      'Traje: Camisa ou camiseta preta lisa e calça escura.',
    ],
    isUrgent: true,
    status: 'open',
    created_at: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    employer: { id: 'emp-1', name: 'Cantina Nonna Bella', cidade: 'Belo Horizonte' },
  },
  {
    id: 'demo-job-2',
    title: 'Chapeiro Especialista & Montador Smash',
    company_name: 'Burger Garage 99',
    category: 'Gastronomia',
    budget: 'R$ 220,00',
    valor_da_diaria: 220,
    cidade: 'Belo Horizonte',
    bairro: 'Savassi',
    latitude: -19.9388,
    longitude: -43.9348,
    data_do_turno: new Date().toISOString().slice(0, 10),
    horario: '17:00 às 00:00 (7h)',
    required_skills: ['Chapa', 'Auxiliar de Cozinha', 'Gastronomia'],
    description:
      'Operação de chapa quente para smash burgers artesanais, controle de ponto da carne e montagem ágil de pedidos no balcão e delivery.',
    perks: ['PIX no fechamento do caixa', 'Lanche da casa incluso', 'Ajuda transporte R$ 20'],
    requirements: [
      'Agilidade em cozinha de hamburgueria ou fast-food.',
      'Conhecimento básico de boas práticas de manipulação de alimentos.',
    ],
    isUrgent: true,
    status: 'open',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600',
    employer: { id: 'emp-2', name: 'Burger Garage 99', cidade: 'Belo Horizonte' },
  },
  {
    id: 'demo-job-3',
    title: 'Bartender & Mixologista para Área VIP',
    company_name: 'Arena Eventos Prime',
    category: 'Eventos',
    budget: 'R$ 290,00',
    valor_da_diaria: 290,
    cidade: 'Belo Horizonte',
    bairro: 'Estoril',
    latitude: -19.9698,
    longitude: -43.9632,
    data_do_turno: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    horario: '19:00 às 03:00 (8h)',
    required_skills: ['Bartender', 'Barman', 'Eventos'],
    description:
      'Preparo de drinks clássicos e autorais em evento corporativo VIP. Estrutura completa de bar montada com equipe de apoio e reposição.',
    perks: ['PIX imediato às 03:15', 'Van ou Uber volta pago', 'Bônus pontualidade +R$ 30'],
    requirements: [
      'Domínio de drinks clássicos (Gin Tônica, Caipirinha, Moscow Mule, Negroni).',
      'Traje Total Black alinhado.',
    ],
    isUrgent: false,
    status: 'open',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    employer: { id: 'emp-3', name: 'Arena Eventos Prime', cidade: 'Belo Horizonte' },
  },
  {
    id: 'demo-job-4',
    title: 'Auxiliar de Separação & Conferência (Picking)',
    company_name: 'Express Logística Hub',
    category: 'Logística',
    budget: 'R$ 175,00',
    valor_da_diaria: 175,
    cidade: 'Belo Horizonte',
    bairro: 'Contagem / Ceasa',
    latitude: -19.8867,
    longitude: -44.0419,
    data_do_turno: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    horario: '07:00 às 16:00 (8h)',
    required_skills: ['Estoquista', 'Carregador', 'Logística'],
    description:
      'Separação de pedidos com coletor óptico, conferência de notas e organização de paletes para despacho diário.',
    perks: ['PIX no encerramento', 'Almoço no refeitório da empresa', 'EPI fornecido no local'],
    requirements: [
      'Disposição física para movimentação em centro de distribuição.',
      'Calçado fechado / bota de segurança (fornecemos capa caso necessário).',
    ],
    isUrgent: false,
    status: 'open',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    employer: { id: 'emp-4', name: 'Express Logística Hub', cidade: 'Contagem' },
  },
  {
    id: 'demo-job-5',
    title: 'Barista & Operador de Caixa Matutino',
    company_name: 'Café do Ponto Gourmet',
    category: 'Cafeteria',
    budget: 'R$ 160,00',
    valor_da_diaria: 160,
    cidade: 'São Paulo',
    bairro: 'Pinheiros',
    latitude: -23.5673,
    longitude: -46.6927,
    data_do_turno: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    horario: '06:45 às 12:45 (6h)',
    required_skills: ['Barista', 'Caixa', 'Cafeteria'],
    description:
      'Extração de espressos, vaporização de leite e atendimento no balcão de cafeteria de alto fluxo no período da manhã.',
    perks: ['PIX às 13:30h', 'Café da manhã liberado', 'Turno curto de 6h'],
    requirements: [
      'Experiência com máquina de espresso profissional.',
      'Simpatia e agilidade no atendimento matutino.',
    ],
    isUrgent: false,
    status: 'open',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600',
    employer: { id: 'emp-5', name: 'Café do Ponto Gourmet', cidade: 'São Paulo' },
  },
];

export interface DemoApplicationItem {
  id: string;
  job_id: string;
  status: 'confirmado' | 'em_analise' | 'finalizado';
  created_at: string;
  job: JobDrawerData;
  paidPix?: boolean;
  rating?: number;
}

export const DEMO_APPLICATIONS: DemoApplicationItem[] = [
  {
    id: 'demo-app-1',
    job_id: 'demo-job-1',
    status: 'confirmado',
    created_at: new Date().toISOString(),
    job: {
      ...DEMO_JOBS[0],
      title: 'Garçom de Salão Noturno',
      company_name: 'Restaurante Adega Imperial',
      bairro: 'Vila da Serra',
      latitude: -19.9794,
      longitude: -43.9408,
      budget: 'R$ 180,00',
      horario: '18:30 às 00:30 (6h)',
    },
  },
  {
    id: 'demo-app-2',
    job_id: 'demo-job-2',
    status: 'em_analise',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    job: DEMO_JOBS[1],
  },
  {
    id: 'demo-app-3',
    job_id: 'demo-job-3',
    status: 'finalizado',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    paidPix: true,
    rating: 5,
    job: {
      ...DEMO_JOBS[2],
      title: 'Bartender VIP • Mixologia',
      company_name: 'Mixologia Lounge',
      budget: 'R$ 220,00',
      horario: '20:00 às 03:00 (7h)',
    },
  },
];

export const DEMO_COMPANY_JOBS = [
  {
    id: 'comp-job-1',
    title: 'Garçom para Sexta à Noite',
    classificacao: 'Gastronomia & Salão',
    budget: 'R$ 180,00',
    status: 'open',
    cidade: 'Belo Horizonte',
    bairro: 'Lourdes',
    latitude: -19.9325,
    longitude: -43.9452,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    data_do_turno: new Date().toISOString().slice(0, 10),
    description: 'Reforço no salão para movimento noturno de sexta-feira. Traje preto e experiência com bandeja.',
    required_skills: ['Garçom', 'Atendimento ao Cliente'],
  },
  {
    id: 'comp-job-2',
    title: 'Chapeiro Master (Smash Burger)',
    classificacao: 'Gastronomia & Salão',
    budget: 'R$ 220,00',
    status: 'open',
    cidade: 'Belo Horizonte',
    bairro: 'Savassi',
    latitude: -19.9388,
    longitude: -43.9348,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    data_do_turno: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    description: 'Operação de chapa durante turno de pico. Lanche e transporte inclusos.',
    required_skills: ['Chapa', 'Auxiliar de Cozinha'],
  },
];

export const DEMO_APPLICANTS_BY_JOB: Record<
  string,
  Array<{
    id: string;
    freelancer_id: string;
    name: string;
    titulo: string;
    rating: number;
    turnos: number;
    cidade: string;
    skills: string[];
    telefone: string;
    bio: string;
    status: 'pendente' | 'contratado';
    avatar_url?: string;
  }>
> = {
  'comp-job-1': [
    {
      id: 'cand-1',
      freelancer_id: 'f-1',
      name: 'Ricardo Alvez',
      titulo: 'Garçom & Barman Sênior',
      rating: 4.9,
      turnos: 38,
      cidade: 'Belo Horizonte',
      skills: ['Garçom', 'Atendimento VIP', 'Bandeja'],
      telefone: '31999887766',
      bio: '3 anos de experiência em restaurantes à la carte e eventos corporativos. Pontualidade 100%.',
      status: 'pendente',
    },
    {
      id: 'cand-2',
      freelancer_id: 'f-2',
      name: 'Marina Santos',
      titulo: 'Atendente & Hostess',
      rating: 4.8,
      turnos: 24,
      cidade: 'Belo Horizonte',
      skills: ['Garçom', 'Hostess', 'Caixa'],
      telefone: '31988776655',
      bio: 'Especialista em recepção de clientes e serviço ágil de salão em bares movimentados.',
      status: 'pendente',
    },
    {
      id: 'cand-3',
      freelancer_id: 'f-3',
      name: 'João Peixoto',
      titulo: 'Garçom para Eventos',
      rating: 4.7,
      turnos: 19,
      cidade: 'Contagem',
      skills: ['Garçom', 'Cumim', 'Eventos'],
      telefone: '31977665544',
      bio: 'Disponibilidade imediata para turnos noturnos e fins de semana.',
      status: 'pendente',
    },
  ],
  'comp-job-2': [
    {
      id: 'cand-4',
      freelancer_id: 'f-4',
      name: 'Lucas Ferreira',
      titulo: 'Chapeiro & Cozinheiro Rápido',
      rating: 5.0,
      turnos: 51,
      cidade: 'Belo Horizonte',
      skills: ['Chapa', 'Smash Burger', 'Cozinha'],
      telefone: '31966554433',
      bio: 'Experiência em grandes hamburguerias artesanais e controle de saída simultânea.',
      status: 'pendente',
    },
    {
      id: 'cand-5',
      freelancer_id: 'f-5',
      name: 'Camila Rocha',
      titulo: 'Auxiliar de Cozinha & Montagem',
      rating: 4.8,
      turnos: 22,
      cidade: 'Belo Horizonte',
      skills: ['Auxiliar de Cozinha', 'Montagem', 'Limpeza'],
      telefone: '31955443322',
      bio: 'Rápida na finalização de pedidos, organização de praça e apoio de chapa.',
      status: 'pendente',
    },
  ],
};
