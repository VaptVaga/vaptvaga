import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Receipt,
  Copy,
  Check,
  X,
  Edit3,
  Zap,
  Sparkles,
  Calculator,
  PlusCircle,
  Send,
  Crown,
  Link2,
  Building2,
  CreditCard,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  type FinancialTransaction,
  type PixKeyType,
  type UserFinancialState,
  getUserFinancialState,
  saveUserFinancialState,
  formatCurrencyBRL,
  exportFinancialStatementCsv,
} from '@/lib/financialStorage';
import {
  startStripeConnectOnboarding,
  executeStripeConnectTransfer,
  getStripeEnvStatus,
  getPlanStripeCatalog,
  STRIPE_CATALOG,
} from '@/lib/stripeConnect';

type FinancialTab = 'overview' | 'statement' | 'planning';
type ChartRange = 'weekly' | 'monthly' | 'sixMonths';
type StatementFilter = 'all' | 'in' | 'out' | 'escrow';

const CHART_DATA_FREELANCER: Record<ChartRange, Array<{ label: string; valor: number }>> = {
  weekly: [
    { label: 'Seg', valor: 150 },
    { label: 'Ter', valor: 0 },
    { label: 'Qua', valor: 180 },
    { label: 'Qui', valor: 220 },
    { label: 'Sex', valor: 310 },
    { label: 'Sáb', valor: 450 },
    { label: 'Dom', valor: 340 },
  ],
  monthly: [
    { label: 'Sem 1', valor: 540 },
    { label: 'Sem 2', valor: 720 },
    { label: 'Sem 3', valor: 610 },
    { label: 'Sem 4', valor: 880 },
  ],
  sixMonths: [
    { label: 'Jun', valor: 1620 },
    { label: 'Jul', valor: 1890 },
    { label: 'Ago', valor: 2140 },
    { label: 'Set', valor: 1980 },
    { label: 'Out', valor: 2310 },
    { label: 'Nov', valor: 2450 },
  ],
};

const CHART_DATA_COMPANY: Record<ChartRange, Array<{ label: string; valor: number }>> = {
  weekly: [
    { label: 'Seg', valor: 180 },
    { label: 'Ter', valor: 360 },
    { label: 'Qua', valor: 190 },
    { label: 'Qui', valor: 420 },
    { label: 'Sex', valor: 580 },
    { label: 'Sáb', valor: 740 },
    { label: 'Dom', valor: 400 },
  ],
  monthly: [
    { label: 'Sem 1', valor: 960 },
    { label: 'Sem 2', valor: 1240 },
    { label: 'Sem 3', valor: 1120 },
    { label: 'Sem 4', valor: 1580 },
  ],
  sixMonths: [
    { label: 'Jun', valor: 2900 },
    { label: 'Jul', valor: 3420 },
    { label: 'Ago', valor: 3180 },
    { label: 'Set', valor: 4100 },
    { label: 'Out', valor: 3890 },
    { label: 'Nov', valor: 4480 },
  ],
};

const PIX_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf: 'CPF / CNPJ',
  celular: 'Celular',
  email: 'E-mail',
  aleatoria: 'Chave Aleatória',
};

const FinancialWorkspace: React.FC<{
  userId?: string;
  role: string;
  userName?: string | null;
  userEmail?: string | null;
}> = ({ userId, role, userName, userEmail }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isCompany = role === 'company';
  const isPro = profile?.subscriber === 'premium';

  const [state, setState] = useState<UserFinancialState>(() =>
    getUserFinancialState(userId, role, userName, userEmail)
  );

  const [activeTab, setActiveTab] = useState<FinancialTab>('overview');
  const [chartRange, setChartRange] = useState<ChartRange>('weekly');
  const [statementFilter, setStatementFilter] = useState<StatementFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Inline edit controls
  const [editingPix, setEditingPix] = useState(false);
  const [draftPixType, setDraftPixType] = useState<PixKeyType>(state.pixKeyType);
  const [draftPixValue, setDraftPixValue] = useState(state.pixKeyValue);
  const [editingGoal, setEditingGoal] = useState(false);
  const [draftGoal, setDraftGoal] = useState(String(state.monthlyGoal));

  // Modals
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(String(state.availableBalance || 100));
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500');
  const [receiptTx, setReceiptTx] = useState<FinancialTransaction | null>(null);
  const [copiedProtocol, setCopiedProtocol] = useState(false);

  // Stripe Connect Onboarding Modal
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeConnecting, setStripeConnecting] = useState(false);
  const [stripeDocInput, setStripeDocInput] = useState('');
  const [stripeBankInput, setStripeBankInput] = useState(state.stripeBankName || 'Nubank');
  const [stripeLast4Input, setStripeLast4Input] = useState(state.stripeBankLast4 || '4829');
  const stripeEnv = getStripeEnvStatus();
  const planCatalog = getPlanStripeCatalog(isCompany ? 'company' : 'freelancer');

  // Simulator (Freelancer Planning)
  const [simShiftsPerWeek, setSimShiftsPerWeek] = useState(4);
  const [simAvgRate, setSimAvgRate] = useState(190);

  const txCounterRef = useRef(500);

  const persist = (updater: (prev: UserFinancialState) => UserFinancialState) => {
    setState((prev) => {
      const next = updater(prev);
      saveUserFinancialState(userId, role, next);
      return next;
    });
  };

  const monthVolume = useMemo(() => {
    return state.transactions
      .filter((tx) => (isCompany ? tx.amount < 0 : tx.amount > 0))
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  }, [state.transactions, isCompany]);

  const goalPercent = useMemo(() => {
    if (!state.monthlyGoal || state.monthlyGoal <= 0) return 0;
    return Math.min(100, Math.round((monthVolume / state.monthlyGoal) * 100));
  }, [monthVolume, state.monthlyGoal]);

  const averageTicket = useMemo(() => {
    const relevant = state.transactions.filter((tx) =>
      isCompany ? tx.type === 'pagamento_freela' : tx.type === 'diaria_recebida'
    );
    if (relevant.length === 0) return 180;
    const sum = relevant.reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    return Math.round(sum / relevant.length);
  }, [state.transactions, isCompany]);

  const escrowTransactions = useMemo(
    () => state.transactions.filter((tx) => tx.status === 'em_garantia'),
    [state.transactions]
  );

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      if (statementFilter === 'in' && tx.amount <= 0) return false;
      if (statementFilter === 'out' && tx.amount >= 0) return false;
      if (statementFilter === 'escrow' && tx.status !== 'em_garantia') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const hay = `${tx.title} ${tx.counterparty} ${tx.protocol} ${tx.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [state.transactions, statementFilter, searchTerm]);

  const chartData = (isCompany ? CHART_DATA_COMPANY : CHART_DATA_FREELANCER)[chartRange];

  const handleSavePix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPixValue.trim()) {
      toast({ title: 'Informe sua chave PIX', variant: 'destructive' });
      return;
    }
    persist((prev) => ({
      ...prev,
      pixKeyType: draftPixType,
      pixKeyValue: draftPixValue.trim(),
    }));
    setEditingPix(false);
    toast({
      title: '✅ Chave PIX salva!',
      description: `Configurada (${PIX_TYPE_LABELS[draftPixType]}): ${draftPixValue.trim()}.`,
    });
  };

  const handleToggleAutoWithdraw = () => {
    const nextVal = !state.autoWithdraw;
    persist((prev) => ({ ...prev, autoWithdraw: nextVal }));
    toast({
      title: nextVal
        ? '⚡ Repasse Automático PIX Ativado'
        : 'Repasse Automático Pausado',
      description: nextVal
        ? 'Seu saldo será transferido automaticamente após cada turno concluído.'
        : 'Você poderá solicitar saques manuais quando preferir.',
    });
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(draftGoal);
    if (!numeric || numeric <= 0) {
      toast({ title: 'Informe um valor válido para a meta', variant: 'destructive' });
      return;
    }
    persist((prev) => ({ ...prev, monthlyGoal: numeric }));
    setEditingGoal(false);
    toast({ title: '🎯 Meta mensal atualizada!' });
  };

  const handleSubmitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(withdrawAmount);
    if (!value || value <= 0) {
      toast({ title: 'Informe um valor de saque válido', variant: 'destructive' });
      return;
    }
    if (value > state.availableBalance) {
      toast({
        title: 'Saldo insuficiente',
        description: `Seu saldo disponível atual é de ${formatCurrencyBRL(state.availableBalance)}.`,
        variant: 'destructive',
      });
      return;
    }

    const transferResult = await executeStripeConnectTransfer({
      amount: value,
      destinationAccountId: state.stripeAccountId,
      counterparty: state.pixKeyValue,
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    txCounterRef.current += 1;
    const protocol = state.stripeAccountId
      ? transferResult.transferId
      : `VV-SAQ-${910000 + txCounterRef.current}`;

    const newTx: FinancialTransaction = {
      id: `tx-saq-${txCounterRef.current}`,
      title: state.stripeAccountId
        ? 'Transferência Stripe Connect (PIX)'
        : 'Saque PIX para Conta Bancária',
      counterparty: state.pixKeyValue,
      date: dateStr,
      time: timeStr,
      type: 'saque_pix',
      status: 'concluido',
      amount: -value,
      protocol,
      category: state.stripeAccountId ? 'Stripe Connect' : 'Transferência PIX',
    };

    persist((prev) => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - value),
      transactions: [newTx, ...prev.transactions],
    }));
    setWithdrawModalOpen(false);
    setReceiptTx(newTx);
    toast({
      title: '💸 Saque PIX realizado!',
      description: `${formatCurrencyBRL(value)} enviado para ${state.pixKeyValue} (${protocol}).`,
    });
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(depositAmount);
    if (!value || value < 20) {
      toast({
        title: 'Valor mínimo de recarga é R$ 20,00',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    txCounterRef.current += 1;
    const protocol = `VV-DEP-${920000 + txCounterRef.current}`;

    const newTx: FinancialTransaction = {
      id: `tx-dep-${txCounterRef.current}`,
      title: 'Recarga de Saldo PIX Empresa',
      counterparty: state.holderName,
      date: dateStr,
      time: timeStr,
      type: 'deposito_garantia',
      status: 'concluido',
      amount: value,
      protocol,
      category: 'Recarga PIX',
    };

    persist((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + value,
      transactions: [newTx, ...prev.transactions],
    }));
    setDepositModalOpen(false);
    setReceiptTx(newTx);
    toast({
      title: '✅ Saldo adicionado via PIX!',
      description: `${formatCurrencyBRL(value)} disponível para garantir novos turnos.`,
    });
  };

  const handleReleaseEscrow = async (tx: FinancialTransaction) => {
    const absValue = Math.abs(tx.amount);
    const splitRes = await executeStripeConnectTransfer({
      amount: absValue,
      destinationAccountId: state.stripeAccountId,
      counterparty: tx.counterparty,
      transferGroup: tx.protocol,
    });

    persist((prev) => ({
      ...prev,
      escrowBalance: Math.max(0, prev.escrowBalance - absValue),
      transactions: prev.transactions.map((item) =>
        item.id === tx.id
          ? {
              ...item,
              status: 'concluido',
              protocol: splitRes.transferId,
              title: item.title.replace('(Em Garantia)', '(Stripe Split Liberado)'),
            }
          : item
      ),
    }));
    toast({
      title: '🚀 Diária PIX liberada via Stripe Connect!',
      description: `${formatCurrencyBRL(absValue)} transferido para ${tx.counterparty} (${splitRes.transferId}).`,
    });
  };

  const handleConnectStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeDocInput.trim()) {
      toast({
        title: isCompany ? 'Informe o CNPJ da empresa' : 'Informe seu CPF',
        variant: 'destructive',
      });
      return;
    }

    setStripeConnecting(true);
    try {
      const result = await startStripeConnectOnboarding({
        userId,
        email: userEmail,
        name: state.holderName,
        role,
        cpfOrCnpj: stripeDocInput.trim(),
        bankName: stripeBankInput,
        accountLast4: stripeLast4Input.trim() || '0000',
      });

      persist((prev) => ({
        ...prev,
        stripeAccountId: result.accountId,
        stripeCustomerId: result.customerId,
        stripeStatus: 'connected',
        stripePayoutsEnabled: result.payoutsEnabled,
        stripeBankName: stripeBankInput,
        stripeBankLast4: stripeLast4Input.trim() || '0000',
      }));

      setStripeModalOpen(false);
      if (result.onboardingUrl && result.mode === 'live') {
        window.open(result.onboardingUrl, '_blank', 'noreferrer');
      }

      toast({
        title: '⚡ Stripe Connect vinculado!',
        description: `Conta Express ${result.accountId} conectada com liquidação bancária habilitada.`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Erro ao conectar Stripe Connect',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setStripeConnecting(false);
    }
  };

  const handleCopyProtocol = async (protocol: string) => {
    try {
      await navigator.clipboard.writeText(protocol);
      setCopiedProtocol(true);
      window.setTimeout(() => setCopiedProtocol(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const firstName = profile?.name?.split(' ')[0] || (isCompany ? 'Empresa' : 'Freelancer');

  return (
    <div className="min-h-screen bg-transparent w-full font-body">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 lg:py-8 space-y-7">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
              <Zap size={13} className="fill-current" />
              {isCompany ? 'Gestão Financeira & Custódia PIX' : 'Área Financeira & Carteira PIX'}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-on-surface mt-1">
              {isCompany ? `Financeiro • ${firstName}` : `Carteira & Ganhos, ${firstName}`}
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant">
              {isCompany
                ? 'Controle o saldo para contratação de turnos, pagamentos em garantia (escrow) e comprovantes PIX.'
                : 'Gerencie seus repasses PIX, valores em custódia, extrato completo e simulação de metas.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                exportFinancialStatementCsv(filteredTransactions);
                toast({ title: '📥 Extrato exportado em CSV!' });
              }}
              className="px-4 py-3 rounded-2xl bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/70 font-headline font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Download size={16} className="text-primary" />
              <span>Exportar Extrato</span>
            </button>

            {isCompany ? (
              <button
                type="button"
                onClick={() => setDepositModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-95"
              >
                <PlusCircle size={16} />
                <span>Adicionar Saldo PIX</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setWithdrawAmount(String(state.availableBalance || 0));
                  setWithdrawModalOpen(true);
                }}
                disabled={state.availableBalance <= 0}
                className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-on-primary font-headline font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-95"
              >
                <Send size={15} />
                <span>Sacar via PIX</span>
              </button>
            )}
          </div>
        </header>

        {/* 4 Financial KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {/* Saldo Disponível */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-[#002b7a] text-on-primary shadow-lg shadow-primary/20 flex flex-col justify-between gap-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-blue-100">
                Saldo Disponível
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Wallet size={18} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-headline font-black tracking-tight">
                {formatCurrencyBRL(state.availableBalance)}
              </p>
              <p className="text-[11px] text-[#6ffbbe] font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} />
                {isCompany ? 'Pronto para publicar turnos' : 'Disponível para saque PIX imediato'}
              </p>
            </div>
          </div>

          {/* Em Garantia / Custódia */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                {isCompany ? 'Reservado em Garantia' : 'Em Garantia (Turnos)'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-secondary-container text-secondary flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-headline font-black text-on-surface">
                {formatCurrencyBRL(state.escrowBalance)}
              </p>
              <p className="text-[11px] text-on-surface-variant mt-1">
                {escrowTransactions.length}{' '}
                {escrowTransactions.length === 1 ? 'turno protegido' : 'turnos protegidos'} via
                VaptVaga Escrow
              </p>
            </div>
          </div>

          {/* Meta Mensal */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                {isCompany ? 'Investido no Mês' : 'Faturado no Mês'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setDraftGoal(String(state.monthlyGoal));
                  setEditingGoal((prev) => !prev);
                }}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Edit3 size={12} /> Meta
              </button>
            </div>

            {editingGoal ? (
              <form onSubmit={handleSaveGoal} className="flex gap-2">
                <input
                  type="number"
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant text-sm font-bold text-on-surface outline-none"
                />
                <button
                  type="submit"
                  className="px-3 h-9 rounded-xl bg-primary text-on-primary text-xs font-bold"
                >
                  OK
                </button>
              </form>
            ) : (
              <div>
                <p className="text-3xl font-headline font-black text-on-surface">
                  {formatCurrencyBRL(monthVolume)}
                </p>
                <div className="w-full h-2 rounded-full bg-surface-container-low mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium mt-1">
                  <span>Meta: {formatCurrencyBRL(state.monthlyGoal)}</span>
                  <span className="font-bold text-primary">{goalPercent}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Médio & Reputação */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                Ticket Médio / Turno
              </span>
              <div className="w-9 h-9 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-headline font-black text-on-surface">
                {formatCurrencyBRL(averageTicket)}
              </p>
              <p className="text-[11px] text-secondary font-bold mt-1">
                Taxa zero no PIX para planos ativos
              </p>
            </div>
          </div>
        </section>

        {/* Sub-navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-outline-variant/60">
          {[
            { id: 'overview' as const, label: 'Visão Geral & Carteira PIX' },
            { id: 'statement' as const, label: `Extrato Completo (${state.transactions.length})` },
            {
              id: 'planning' as const,
              label: isCompany ? `Liberações em Garantia (${escrowTransactions.length})` : 'Simulador & Plano',
            },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-xl font-headline font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
                  active
                    ? 'border-primary text-primary bg-primary-container/30'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stripe Connect Integration Card */}
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center shrink-0">
                  <CreditCard size={24} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-headline font-extrabold text-base sm:text-lg text-on-surface">
                      Stripe Connect • Pagamentos & Split Automático
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        state.stripeStatus === 'connected'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {state.stripeStatus === 'connected' ? 'Conta Conectada ✓' : 'Configurar Repasses'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {state.stripeStatus === 'connected'
                      ? `Conta Express vinculada (${state.stripeAccountId}) à plataforma ${stripeEnv.platformAccountName} (${stripeEnv.platformAccountId}) • Liquidação automática via ${state.stripeBankName || 'Banco'} (•••• ${state.stripeBankLast4 || '0000'}) com taxa zero VaptVaga.`
                      : `Plataforma ${stripeEnv.platformAccountName} (${stripeEnv.platformAccountId}) ativa em modo Sandbox BRL. Vincule sua Conta Express abaixo para repasses e custódia Escrow.`}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-[#635BFF]">
                    Plataforma: {stripeEnv.platformAccountId} • Escrow: {STRIPE_CATALOG.escrowShift.productId}
                    {state.stripeAccountId ? ` • Express: ${state.stripeAccountId}` : ''}
                    {stripeEnv.hasPublishableKey ? ' • Live/Key Ativa' : ' • Sandbox BRL'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setStripeModalOpen(true)}
                  className={`px-5 py-3 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    state.stripeStatus === 'connected'
                      ? 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant'
                      : 'bg-[#635BFF] hover:brightness-110 text-white shadow-md shadow-[#635BFF]/25'
                  }`}
                >
                  <Link2 size={15} />
                  <span>
                    {state.stripeStatus === 'connected'
                      ? 'Gerenciar Stripe Connect'
                      : 'Conectar com Stripe Connect'}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Fluxo Financeiro Chart (8 cols) */}
              <div className="lg:col-span-8 bg-surface-container-lowest p-6 md:p-7 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-headline font-extrabold text-on-surface">
                      {isCompany ? 'Fluxo de Repasses por Turno' : 'Evolução de Ganhos'}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Acompanhe a curva de movimentação via PIX
                    </p>
                  </div>
                  <div className="flex gap-1.5 bg-surface-container-low p-1 rounded-full self-start">
                    {[
                      { id: 'weekly' as const, label: '7 dias' },
                      { id: 'monthly' as const, label: '30 dias' },
                      { id: 'sixMonths' as const, label: '6 meses' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setChartRange(opt.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          chartRange === opt.id
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="financialAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0066FF" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#E9ECEF" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#495057', fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#495057', fontSize: 11 }}
                        tickFormatter={(v) => `R$${v}`}
                      />
                      <Tooltip
                        formatter={(val) => [formatCurrencyBRL(Number(val ?? 0)), 'Movimentação']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #E9ECEF',
                          boxShadow: '0 10px 25px rgba(10,19,43,0.08)',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="valor"
                        stroke="#0066FF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#financialAreaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chave PIX & Saque Automático (4 cols) */}
              <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-extrabold text-base sm:text-lg text-on-surface">
                      Dados Bancários & PIX
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                      Verificada
                    </span>
                  </div>

                  {editingPix ? (
                    <form onSubmit={handleSavePix} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          Tipo de Chave
                        </label>
                        <select
                          value={draftPixType}
                          onChange={(e) => setDraftPixType(e.target.value as PixKeyType)}
                          className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface outline-none"
                        >
                          {Object.entries(PIX_TYPE_LABELS).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          Chave PIX
                        </label>
                        <input
                          value={draftPixValue}
                          onChange={(e) => setDraftPixValue(e.target.value)}
                          placeholder="Digite sua chave PIX"
                          className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-medium text-on-surface outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs"
                        >
                          Salvar PIX
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDraftPixType(state.pixKeyType);
                            setDraftPixValue(state.pixKeyValue);
                            setEditingPix(false);
                          }}
                          className="px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-bold text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        <span>{PIX_TYPE_LABELS[state.pixKeyType]}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setDraftPixType(state.pixKeyType);
                            setDraftPixValue(state.pixKeyValue);
                            setEditingPix(true);
                          }}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Edit3 size={11} /> Alterar
                        </button>
                      </div>
                      <p className="font-bold text-sm text-primary truncate">{state.pixKeyValue}</p>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        Titular: {state.holderName}
                      </p>
                    </div>
                  )}

                  {!isCompany && (
                    <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-headline font-bold text-on-surface">
                          Saque Automático Pós-Turno
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          Transferir assim que liberar
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleAutoWithdraw}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors shrink-0 ${
                          state.autoWithdraw
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {state.autoWithdraw ? 'Ativo ✓' : 'Manual'}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('statement')}
                  className="w-full py-2.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-low font-headline font-bold text-xs transition-colors"
                >
                  Ver Extrato Detalhado →
                </button>
              </div>
            </div>

            {/* Latest Transactions Snapshot */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-outline-variant/60 flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-extrabold text-base sm:text-lg text-on-surface">
                    Movimentações Recentes
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Clique em qualquer lançamento para abrir o comprovante PIX
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('statement')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Ver todas ({state.transactions.length})
                </button>
              </div>

              <div className="divide-y divide-outline-variant/50">
                {state.transactions.slice(0, 4).map((tx) => {
                  const isPositive = tx.amount >= 0;
                  return (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => setReceiptTx(tx)}
                      className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-container-low/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isPositive
                              ? 'bg-secondary-container text-secondary'
                              : 'bg-primary-container text-primary'
                          }`}
                        >
                          {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-headline font-bold text-sm text-on-surface truncate">
                            {tx.title}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {tx.counterparty} • {tx.date} às {tx.time}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`font-headline font-black text-sm ${
                            isPositive ? 'text-secondary' : 'text-on-surface'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatCurrencyBRL(tx.amount)}
                        </p>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'concluido'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.status === 'concluido' ? 'Concluído' : 'Em Garantia'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL STATEMENT */}
        {activeTab === 'statement' && (
          <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por turno, estabelecimento ou protocolo..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-xs sm:text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all' as const, label: 'Todas' },
                  { id: 'in' as const, label: 'Entradas' },
                  { id: 'out' as const, label: 'Saídas / Saques' },
                  { id: 'escrow' as const, label: 'Em Garantia' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatementFilter(f.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
                      statementFilter === f.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/50">
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Lançamento / Contraparte
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Protocolo
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-center">
                      Data
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-center">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-right">
                      Valor
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-right">
                      Comprovante
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => {
                      const isPositive = tx.amount >= 0;
                      return (
                        <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-sm text-on-surface">{tx.title}</p>
                            <p className="text-xs text-on-surface-variant">{tx.counterparty}</p>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                            {tx.protocol}
                          </td>
                          <td className="px-6 py-4 text-center text-xs text-on-surface-variant font-medium whitespace-nowrap">
                            {tx.date} • {tx.time}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                tx.status === 'concluido'
                                  ? 'bg-secondary-container text-on-secondary-container'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {tx.status === 'concluido' ? 'Concluído' : 'Em Garantia'}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-headline font-extrabold text-sm whitespace-nowrap ${
                              isPositive ? 'text-secondary' : 'text-on-surface'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {formatCurrencyBRL(tx.amount)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setReceiptTx(tx)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-primary-container text-primary text-xs font-bold transition-colors"
                            >
                              <Receipt size={13} />
                              <span>Abrir</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                        Nenhuma movimentação encontrada para este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: PLANNING / SIMULATOR OR ESCROW RELEASES */}
        {activeTab === 'planning' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl border border-outline-variant/70 p-6 md:p-8 shadow-sm space-y-6">
              {isCompany ? (
                <>
                  <div>
                    <h2 className="font-headline font-extrabold text-lg text-on-surface flex items-center gap-2">
                      <ShieldCheck size={19} className="text-secondary" />
                      Liberação de Diárias em Garantia (Escrow)
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Assim que o freelancer finalizar o check-in e o turno, libere o pagamento PIX
                      com segurança pelo app.
                    </p>
                  </div>

                  {escrowTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {escrowTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              <Clock size={10} /> Aguardando Liberação
                            </span>
                            <h3 className="font-headline font-bold text-sm text-on-surface mt-1">
                              {tx.counterparty} — {tx.title}
                            </h3>
                            <p className="text-xs text-on-surface-variant">
                              {tx.date} às {tx.time} • Protocolo {tx.protocol}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-headline font-black text-base text-primary">
                              {formatCurrencyBRL(Math.abs(tx.amount))}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleReleaseEscrow(tx)}
                              className="px-4 py-2.5 rounded-xl bg-secondary hover:brightness-95 text-on-secondary font-headline font-bold text-xs shadow-sm transition-all"
                            >
                              Liberar PIX Agora
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-surface-container-low border border-dashed border-outline text-center space-y-2">
                      <CheckCircle2 size={28} className="mx-auto text-secondary" />
                      <p className="font-headline font-bold text-sm text-on-surface">
                        Todas as diárias em garantia já foram liberadas!
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <h2 className="font-headline font-extrabold text-lg text-on-surface flex items-center gap-2">
                      <Calculator size={19} className="text-primary" />
                      Simulador de Renda com Turnos
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Planeje quantos turnos por semana você deseja fazer na VaptVaga e veja sua
                      projeção de ganhos líquidos via PIX.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-on-surface-variant">Turnos por semana</span>
                        <span className="text-primary font-headline text-base">
                          {simShiftsPerWeek} turnos/sem
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={7}
                        value={simShiftsPerWeek}
                        onChange={(e) => setSimShiftsPerWeek(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-on-surface-variant">Valor médio da diária</span>
                        <span className="text-primary font-headline text-base">
                          {formatCurrencyBRL(simAvgRate)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={120}
                        max={350}
                        step={10}
                        value={simAvgRate}
                        onChange={(e) => setSimAvgRate(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">
                        Por Semana
                      </p>
                      <p className="font-headline font-black text-xl text-on-surface mt-1">
                        {formatCurrencyBRL(simShiftsPerWeek * simAvgRate)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary-container/50 border border-primary/20">
                      <p className="text-[10px] font-bold uppercase text-primary">Por Mês (4 sem)</p>
                      <p className="font-headline font-black text-xl text-primary mt-1">
                        {formatCurrencyBRL(simShiftsPerWeek * simAvgRate * 4)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary-container/60 border border-secondary/20">
                      <p className="text-[10px] font-bold uppercase text-on-secondary-container">
                        Projeção Anual
                      </p>
                      <p className="font-headline font-black text-xl text-secondary mt-1">
                        {formatCurrencyBRL(simShiftsPerWeek * simAvgRate * 52)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Sidebar: Subscription & Financial Protection */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl bg-gradient-to-br from-on-surface to-[#16254d] p-6 text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#6ffbbe] text-[10px] font-bold uppercase tracking-wider">
                    <Crown size={12} /> Assinatura VaptVaga
                  </span>
                  <span className="text-xs font-bold text-white/80">
                    {isPro ? 'Ativo' : 'Plano Grátis'}
                  </span>
                </div>
                <h3 className="font-headline font-extrabold text-xl">
                  {isPro
                    ? isCompany
                      ? 'Negócio Ágil Ativo'
                      : 'Vapt PRO Ativo'
                    : isCompany
                      ? 'Potencialize suas Contratações'
                      : 'Destrave Candidaturas Ilimitadas'}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isPro
                    ? 'Você conta com todos os recursos ilimitados e atendimento prioritário nos repasses PIX.'
                    : isCompany
                      ? 'Assine Negócio Ágil por R$ 49,90/mês para publicar vagas ilimitadas e conversar com toda a escala.'
                      : 'Assine Vapt PRO por R$ 14,90/mês e candidate-se a todos os turnos de alto valor.'}
                </p>
                {!isPro && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(planCatalog.paymentLinkUrl, '_blank', 'noopener,noreferrer')
                      }
                      className="w-full py-3 rounded-xl bg-[#6ffbbe] text-[#002113] font-headline font-extrabold text-xs hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Assinar via Stripe ({planCatalog.priceLabel})</span>
                      <ExternalLink size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/planos')}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-headline font-bold text-[11px] transition-colors"
                    >
                      Comparar Planos na Plataforma
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5 text-secondary font-headline font-bold text-sm">
                  <ShieldCheck size={18} />
                  <span>Garantia VaptVaga Escrow</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Todos os valores de turnos ficam protegidos dentro da plataforma desde a
                  confirmação até o check-in por QR Code no local, evitando inadimplência e
                  garantindo segurança para freelancer e contratante.
                </p>
                <p className="text-[11px] font-mono text-primary font-semibold">
                  Produto Escrow Stripe: {STRIPE_CATALOG.escrowShift.productId} • Conta:{' '}
                  {stripeEnv.platformAccountId}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Saque PIX (Freelancer) */}
      <AnimatePresence>
        {withdrawModalOpen && (
          <div className="fixed inset-0 z-[94] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWithdrawModalOpen(false)}
              className="fixed inset-0 bg-on-surface/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative z-[95] w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between">
                <h3 className="font-headline font-extrabold text-base text-on-surface">
                  Solicitar Saque PIX
                </h3>
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitWithdraw} className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60">
                  <p className="text-[11px] font-bold text-on-surface-variant">Chave PIX de Destino</p>
                  <p className="text-sm font-bold text-primary mt-0.5 truncate">
                    {state.pixKeyValue}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Saldo disponível: <strong>{formatCurrencyBRL(state.availableBalance)}</strong>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Valor do Saque (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant text-xl font-headline font-black text-on-surface outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(state.availableBalance))}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Usar saldo total ({formatCurrencyBRL(state.availableBalance)})
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm shadow-md shadow-primary/20"
                >
                  Confirmar Transferência PIX
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Adicionar Saldo PIX (Empresa) */}
      <AnimatePresence>
        {depositModalOpen && (
          <div className="fixed inset-0 z-[94] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDepositModalOpen(false)}
              className="fixed inset-0 bg-on-surface/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative z-[95] w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between">
                <h3 className="font-headline font-extrabold text-base text-on-surface">
                  Adicionar Saldo PIX na Empresa
                </h3>
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitDeposit} className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {['200', '500', '1000', '2000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        depositAmount === val
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-low text-on-surface border-outline-variant/60'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Valor da Recarga (R$)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant text-xl font-headline font-black text-on-surface outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm shadow-md shadow-primary/20"
                >
                  Confirmar Recarga Instantânea
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Comprovante Oficial PIX */}
      <AnimatePresence>
        {receiptTx && (
          <div className="fixed inset-0 z-[94] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReceiptTx(null)}
              className="fixed inset-0 bg-on-surface/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative z-[95] w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/60">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-primary" />
                  <h3 className="font-headline font-extrabold text-base text-on-surface">
                    Comprovante de Movimentação
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptTx(null)}
                  className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <div className="text-center p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Valor da Operação
                  </p>
                  <p
                    className={`text-3xl font-headline font-black mt-1 ${
                      receiptTx.amount >= 0 ? 'text-secondary' : 'text-on-surface'
                    }`}
                  >
                    {receiptTx.amount >= 0 ? '+' : ''}
                    {formatCurrencyBRL(receiptTx.amount)}
                  </p>
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                    {receiptTx.status === 'concluido' ? 'Transação Concluída' : 'Em Garantia (Escrow)'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Descrição:</span>
                    <span className="font-bold text-on-surface text-right">{receiptTx.title}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Contraparte / Destino:</span>
                    <span className="font-bold text-on-surface text-right">
                      {receiptTx.counterparty}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Data e Hora:</span>
                    <span className="font-bold text-on-surface">
                      {receiptTx.date} às {receiptTx.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/50">
                    <span className="text-on-surface-variant">Código de Autenticação:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyProtocol(receiptTx.protocol)}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-primary hover:underline"
                    >
                      <span>{receiptTx.protocol}</span>
                      {copiedProtocol ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReceiptTx(null)}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm"
                >
                  Fechar Comprovante
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Stripe Connect Express Onboarding */}
      <AnimatePresence>
        {stripeModalOpen && (
          <div className="fixed inset-0 z-[94] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStripeModalOpen(false)}
              className="fixed inset-0 bg-on-surface/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative z-[95] w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-[#635BFF]/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#635BFF] text-white flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#635BFF]">
                      Stripe Connect Express
                    </p>
                    <h3 className="font-headline font-extrabold text-base text-on-surface">
                      Vincular Conta de Pagamentos
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStripeModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleConnectStripe} className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-1 text-xs text-on-surface-variant leading-relaxed">
                  <p className="font-headline font-bold text-on-surface flex items-center gap-1.5">
                    <Building2 size={14} className="text-[#635BFF]" />
                    Split Marketplace VaptVaga + Stripe
                  </p>
                  <p>
                    {isCompany
                      ? 'Configure os dados fiscais da empresa para custódia de diárias via Cartão e PIX na Stripe.'
                      : 'Informe seu documento e banco para criar sua Conta Conectada Express e receber repasses automáticos.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    {isCompany ? 'CNPJ da Empresa' : 'CPF do Titular'}
                  </label>
                  <input
                    required
                    value={stripeDocInput}
                    onChange={(e) => setStripeDocInput(e.target.value)}
                    placeholder={isCompany ? '00.000.000/0001-00' : '000.000.000-00'}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant text-sm font-medium text-on-surface outline-none focus:border-[#635BFF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Banco
                    </label>
                    <select
                      value={stripeBankInput}
                      onChange={(e) => setStripeBankInput(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant text-sm font-bold text-on-surface outline-none"
                    >
                      <option value="Nubank">Nubank</option>
                      <option value="Itaú">Itaú</option>
                      <option value="Banco do Brasil">Banco do Brasil</option>
                      <option value="Bradesco">Bradesco</option>
                      <option value="Inter">Inter</option>
                      <option value="Santander">Santander</option>
                      <option value="Caixa">Caixa Econômica</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Últimos 4 dígitos
                    </label>
                    <input
                      maxLength={4}
                      value={stripeLast4Input}
                      onChange={(e) => setStripeLast4Input(e.target.value.replace(/\D/g, ''))}
                      placeholder="4829"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant text-sm font-mono font-bold text-on-surface outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-primary-container/40 border border-primary/20 text-[11px] text-on-surface-variant space-y-1">
                  <p>
                    <strong>Plataforma Stripe:</strong> {stripeEnv.platformAccountName} (
                    <code className="font-mono">{stripeEnv.platformAccountId}</code>)
                  </p>
                  <p>
                    <strong>Status API:</strong>{' '}
                    {stripeEnv.hasPublishableKey
                      ? `Chave pública detectada (${stripeEnv.publishableKeyPreview}) • Sandbox BRL.`
                      : 'Catálogo e Payment Links conectados em Sandbox BRL (adicione VITE_STRIPE_PUBLISHABLE_KEY e STRIPE_SECRET_KEY para onboarding Express ao vivo).'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={stripeConnecting}
                  className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:brightness-110 text-white font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#635BFF]/25"
                >
                  {stripeConnecting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Conectando com a Stripe...</span>
                    </>
                  ) : (
                    <>
                      <Link2 size={16} />
                      <span>
                        {state.stripeStatus === 'connected'
                          ? 'Atualizar Conta Stripe Connect'
                          : 'Conectar Conta Stripe Express'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Financial: React.FC = () => {
  const { user, profile } = useAuth();
  const userId = user?.id || profile?.id;
  const role = profile?.role || 'freelancer';
  const key = `${userId || 'guest'}-${role}`;

  return (
    <FinancialWorkspace
      key={key}
      userId={userId}
      role={role}
      userName={profile?.name}
      userEmail={user?.email}
    />
  );
};

export default Financial;
