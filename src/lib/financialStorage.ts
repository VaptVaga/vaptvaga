export type PixKeyType = 'cpf' | 'celular' | 'email' | 'aleatoria';

export type StripeConnectStatus = 'not_connected' | 'pending' | 'connected';

export type FinancialTxType =
  | 'diaria_recebida'
  | 'saque_pix'
  | 'deposito_garantia'
  | 'pagamento_freela'
  | 'bonus'
  | 'assinatura';

export type FinancialTxStatus = 'concluido' | 'em_garantia' | 'agendado';

export interface FinancialTransaction {
  id: string;
  title: string;
  counterparty: string;
  date: string;
  time: string;
  type: FinancialTxType;
  status: FinancialTxStatus;
  amount: number;
  protocol: string;
  category: string;
}

export interface UserFinancialState {
  availableBalance: number;
  escrowBalance: number;
  monthlyGoal: number;
  pixKeyType: PixKeyType;
  pixKeyValue: string;
  holderName: string;
  autoWithdraw: boolean;
  stripeAccountId: string | null;
  stripeCustomerId: string | null;
  stripeStatus: StripeConnectStatus;
  stripePayoutsEnabled: boolean;
  stripeBankLast4: string;
  stripeBankName: string;
  transactions: FinancialTransaction[];
}

const STORAGE_PREFIX = 'vaptvaga_finance_v1_';

export const formatCurrencyBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const getDefaultFreelancerState = (
  userName?: string | null,
  userEmail?: string | null
): UserFinancialState => ({
  availableBalance: 410,
  escrowBalance: 190,
  monthlyGoal: 3000,
  pixKeyType: 'email',
  pixKeyValue: userEmail || 'freelancer@vaptvaga.com.br',
  holderName: userName || 'Freelancer VaptVaga',
  autoWithdraw: false,
  stripeAccountId: null,
  stripeCustomerId: null,
  stripeStatus: 'not_connected',
  stripePayoutsEnabled: false,
  stripeBankLast4: '',
  stripeBankName: '',
  transactions: [
    {
      id: 'tx-f1',
      title: 'Diária Garçom Noturno (Custódia PIX)',
      counterparty: 'Restaurante Adega Imperial',
      date: '18/11/2026',
      time: '18:30',
      type: 'diaria_recebida',
      status: 'em_garantia',
      amount: 190,
      protocol: 'VV-PIX-884120',
      category: 'Gastronomia',
    },
    {
      id: 'tx-f2',
      title: 'Diária Chapeiro Especialista',
      counterparty: 'Burger Garage 99',
      date: '16/11/2026',
      time: '00:15',
      type: 'diaria_recebida',
      status: 'concluido',
      amount: 220,
      protocol: 'VV-PIX-883904',
      category: 'Gastronomia',
    },
    {
      id: 'tx-f3',
      title: 'Bônus Pontualidade Check-in',
      counterparty: 'Arena Eventos Prime',
      date: '14/11/2026',
      time: '03:20',
      type: 'bonus',
      status: 'concluido',
      amount: 30,
      protocol: 'VV-PIX-883219',
      category: 'Eventos',
    },
    {
      id: 'tx-f4',
      title: 'Diária Bartender VIP',
      counterparty: 'Arena Eventos Prime',
      date: '14/11/2026',
      time: '03:18',
      type: 'diaria_recebida',
      status: 'concluido',
      amount: 290,
      protocol: 'VV-PIX-883218',
      category: 'Eventos',
    },
    {
      id: 'tx-f5',
      title: 'Saque PIX para Conta Bancária',
      counterparty: userName || 'Titular da Conta',
      date: '12/11/2026',
      time: '09:42',
      type: 'saque_pix',
      status: 'concluido',
      amount: -350,
      protocol: 'VV-SAQ-771092',
      category: 'Transferência PIX',
    },
    {
      id: 'tx-f6',
      title: 'Diária Auxiliar de Picking',
      counterparty: 'Express Logística Hub',
      date: '10/11/2026',
      time: '16:25',
      type: 'diaria_recebida',
      status: 'concluido',
      amount: 220,
      protocol: 'VV-PIX-881540',
      category: 'Logística',
    },
  ],
});

const getDefaultCompanyState = (
  userName?: string | null,
  userEmail?: string | null
): UserFinancialState => ({
  availableBalance: 920,
  escrowBalance: 400,
  monthlyGoal: 3500,
  pixKeyType: 'email',
  pixKeyValue: userEmail || 'financeiro@empresa.com.br',
  holderName: userName || 'Empresa Parceira VaptVaga',
  autoWithdraw: false,
  stripeAccountId: null,
  stripeCustomerId: null,
  stripeStatus: 'not_connected',
  stripePayoutsEnabled: false,
  stripeBankLast4: '',
  stripeBankName: '',
  transactions: [
    {
      id: 'tx-c1',
      title: 'Turno Garçom Sexta (Em Garantia)',
      counterparty: 'Ricardo Alvez',
      date: '18/11/2026',
      time: '18:30',
      type: 'pagamento_freela',
      status: 'em_garantia',
      amount: -180,
      protocol: 'VV-ESC-992014',
      category: 'Salão',
    },
    {
      id: 'tx-c2',
      title: 'Turno Chapeiro Master (Em Garantia)',
      counterparty: 'Lucas Ferreira',
      date: '19/11/2026',
      time: '17:00',
      type: 'pagamento_freela',
      status: 'em_garantia',
      amount: -220,
      protocol: 'VV-ESC-992041',
      category: 'Cozinha',
    },
    {
      id: 'tx-c3',
      title: 'Depósito PIX Carteira Empresa',
      counterparty: userName || 'Conta Corporativa',
      date: '15/11/2026',
      time: '11:08',
      type: 'deposito_garantia',
      status: 'concluido',
      amount: 1500,
      protocol: 'VV-DEP-441802',
      category: 'Recarga PIX',
    },
    {
      id: 'tx-c4',
      title: 'Repasse PIX Turno Concluído',
      counterparty: 'Marina Santos',
      date: '12/11/2026',
      time: '00:35',
      type: 'pagamento_freela',
      status: 'concluido',
      amount: -180,
      protocol: 'VV-PAG-441290',
      category: 'Atendimento',
    },
  ],
});

export const getUserFinancialState = (
  userId?: string | null,
  role?: string | null,
  userName?: string | null,
  userEmail?: string | null
): UserFinancialState => {
  const isCompany = role === 'company';
  const defaults = isCompany
    ? getDefaultCompanyState(userName, userEmail)
    : getDefaultFreelancerState(userName, userEmail);

  try {
    const key = `${STORAGE_PREFIX}${userId || 'guest'}_${isCompany ? 'company' : 'freelancer'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<UserFinancialState>;
    return {
      ...defaults,
      ...parsed,
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : defaults.transactions,
    };
  } catch {
    return defaults;
  }
};

export const saveUserFinancialState = (
  userId: string | null | undefined,
  role: string | null | undefined,
  state: UserFinancialState
): void => {
  const isCompany = role === 'company';
  try {
    const key = `${STORAGE_PREFIX}${userId || 'guest'}_${isCompany ? 'company' : 'freelancer'}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Ignore storage quota issues
  }
};

export const exportFinancialStatementCsv = (transactions: FinancialTransaction[]): void => {
  const header = ['Protocolo', 'Data', 'Hora', 'Descrição', 'Contraparte', 'Categoria', 'Status', 'Valor (R$)'];
  const rows = transactions.map((tx) => [
    tx.protocol,
    tx.date,
    tx.time,
    tx.title,
    tx.counterparty,
    tx.category,
    tx.status,
    tx.amount.toFixed(2).replace('.', ','),
  ]);

  const csvContent =
    '\uFEFF' +
    [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'extrato-financeiro-vaptvaga.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
