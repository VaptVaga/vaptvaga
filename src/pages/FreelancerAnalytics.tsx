import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CalendarClock,
  TrendingUp,
  Star,
  Edit3,
  Check,
  CheckCircle2,
  ArrowRight,
  Utensils,
  Coffee,
  PartyPopper,
  Truck,
  Eye,
  Zap,
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

const WEEKLY_DATA = [
  { label: 'Seg', valor: 150 },
  { label: 'Ter', valor: 0 },
  { label: 'Qua', valor: 180 },
  { label: 'Qui', valor: 220 },
  { label: 'Sex', valor: 310 },
  { label: 'Sáb', valor: 450 },
  { label: 'Dom', valor: 340 },
];

const MONTHLY_DATA = [
  { label: 'Sem 1', valor: 540 },
  { label: 'Sem 2', valor: 720 },
  { label: 'Sem 3', valor: 610 },
  { label: 'Sem 4', valor: 880 },
];

const TRANSACTIONS = [
  {
    id: 'tx-1',
    role: 'Garçom de Salão Noturno',
    company: 'Cantina Nonna Bella',
    date: 'Hoje, 18:30h',
    status: 'Agendado',
    amount: 'R$ 190,00',
    icon: Utensils,
  },
  {
    id: 'tx-2',
    role: 'Chapeiro Especialista',
    company: 'Burger Garage 99',
    date: '25 Out',
    status: 'Pago',
    amount: 'R$ 220,00',
    icon: Utensils,
  },
  {
    id: 'tx-3',
    role: 'Bartender VIP',
    company: 'Arena Eventos Prime',
    date: '22 Out',
    status: 'Pago',
    amount: 'R$ 290,00',
    icon: PartyPopper,
  },
  {
    id: 'tx-4',
    role: 'Barista Matutino',
    company: 'Café do Ponto Gourmet',
    date: '19 Out',
    status: 'Pago',
    amount: 'R$ 160,00',
    icon: Coffee,
  },
  {
    id: 'tx-5',
    role: 'Auxiliar de Picking',
    company: 'Express Logística Hub',
    date: '15 Out',
    status: 'Pago',
    amount: 'R$ 175,00',
    icon: Truck,
  },
];

const FreelancerAnalytics: React.FC = () => {
  const { profile, user } = useAuth();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [pixKey, setPixKey] = useState(user?.email || 'gabriel.lima@email.com');
  const [editingPix, setEditingPix] = useState(false);
  const [tempPixKey, setTempPixKey] = useState(pixKey);
  const [balance, setBalance] = useState(410);
  const [withdrawnDone, setWithdrawnDone] = useState(false);

  const chartData = period === 'weekly' ? WEEKLY_DATA : MONTHLY_DATA;
  const firstName = profile?.name?.split(' ')[0] || 'Freelancer';

  const handleWithdrawPix = () => {
    if (balance <= 0) {
      toast({
        title: 'Sem saldo disponível',
        description: 'Conclua um novo turno para liberar saldo para saque.',
      });
      return;
    }
    const amountStr = balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    setBalance(0);
    setWithdrawnDone(true);
    toast({
      title: '💸 Saque PIX enviado!',
      description: `${amountStr} transferido instantaneamente para a chave ${pixKey}.`,
    });
  };

  const handleSavePixKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPixKey.trim()) return;
    setPixKey(tempPixKey.trim());
    setEditingPix(false);
    toast({
      title: 'Chave PIX atualizada!',
      description: `Seus próximos repasses serão enviados para ${tempPixKey.trim()}.`,
    });
  };

  return (
    <div className="min-h-screen bg-transparent w-full font-body">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 lg:py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold mb-2">
              <Zap size={13} className="fill-current" /> Central Financeira & Performance
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
              Ganhos & PIX, {firstName}
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant mt-1">
              Acompanhe seus repasses instantâneos, histórico de turnos e reputação na plataforma.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container-lowest px-4 py-2.5 rounded-full border border-outline-variant/70">
            <Eye size={15} className="text-primary" />
            <span>
              <strong className="text-on-surface">142 visualizações</strong> no seu perfil esta semana
            </span>
          </div>
        </div>

        {/* Bento Grid: 4 KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Saldo Disponível + Saque PIX */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 bg-primary-container rounded-xl text-primary">
                  <Wallet size={20} />
                </span>
                <span className="text-[11px] font-bold text-on-secondary-container uppercase tracking-wider bg-secondary-container px-2.5 py-1 rounded-full">
                  {balance > 0 ? 'Disponível' : 'Transferido'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                Saldo Disponível
              </p>
              <h2 className="text-3xl font-headline font-black text-on-surface mt-1">
                {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleWithdrawPix}
              disabled={balance <= 0}
              className={`w-full py-3 rounded-xl font-headline font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                balance > 0
                  ? 'bg-primary hover:bg-primary-dark text-on-primary shadow-md shadow-primary/20 active:scale-95'
                  : 'bg-secondary-container text-on-secondary-container cursor-default'
              }`}
            >
              {withdrawnDone && balance === 0 ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>Saque Enviado via PIX</span>
                </>
              ) : (
                <>
                  <span>Sacar agora via PIX</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </motion.div>

          {/* Card 2: Próximo Pagamento Agendado */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-surface-container-low rounded-xl text-primary">
                <CalendarClock size={20} />
              </span>
              <span className="text-[10px] px-2.5 py-1 bg-primary-container text-primary font-bold rounded-full uppercase">
                Agendado
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                Próximo Pagamento
              </p>
              <h3 className="text-3xl font-headline font-black text-on-surface mt-1">R$ 190,00</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Cantina Nonna Bella • <strong className="text-on-surface">Hoje até 01:00h</strong>
              </p>
            </div>
          </motion.div>

          {/* Card 3: Total Ganho no Mês */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-secondary-container rounded-xl text-secondary">
                <TrendingUp size={20} />
              </span>
              <span className="text-xs font-bold text-secondary">+18% vs mês anterior</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                Total Ganho no Mês
              </p>
              <h3 className="text-3xl font-headline font-black text-on-surface mt-1">
                R$ 2.450,00
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                14 turnos concluídos • Média R$ 175/turno
              </p>
            </div>
          </motion.div>

          {/* Card 4: Reputação & Visualizações */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-amber-50 rounded-xl text-amber-500">
                <Star size={20} className="fill-current" />
              </span>
              <span className="text-xs font-bold text-primary bg-primary-container px-2.5 py-1 rounded-full">
                100% Pontual
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                Reputação Geral
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-headline font-black text-on-surface">4.9</h3>
                <span className="text-xs font-semibold text-on-surface-variant">/ 5.0</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                14 avaliações 5 estrelas verificadas
              </p>
            </div>
          </motion.div>
        </section>

        {/* Chart & PIX Configuration Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evolução de Ganhos Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/70 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-headline font-extrabold text-on-surface">
                  Evolução de Ganhos
                </h3>
                <p className="text-xs md:text-sm text-on-surface-variant">
                  {period === 'weekly'
                    ? 'Desempenho nos últimos 7 dias'
                    : 'Consolidado semanal dos últimos 30 dias'}
                </p>
              </div>
              <div className="flex gap-2 bg-surface-container-low p-1 rounded-full self-start">
                <button
                  type="button"
                  onClick={() => setPeriod('weekly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    period === 'weekly'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Semanal
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    period === 'monthly'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Mensal
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vaptEarningsGradient" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value) => [`R$ ${Number(value ?? 0).toFixed(2)}`, 'Ganhos']}
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
                    fill="url(#vaptEarningsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Configurar Chave PIX Card */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/70 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-headline font-extrabold text-lg text-on-surface">
                  Configurar Chave PIX
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                  Ativa
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Mantenha sua chave PIX atualizada para receber logo após o encerramento de cada
                turno, sem taxas escondidas.
              </p>

              <AnimatePresence mode="wait">
                {editingPix ? (
                  <motion.form
                    key="edit-pix"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSavePixKey}
                    className="space-y-3 pt-2"
                  >
                    <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                      CPF, E-mail, Celular ou Chave Aleatória
                    </label>
                    <input
                      type="text"
                      value={tempPixKey}
                      onChange={(e) => setTempPixKey(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant text-sm text-on-surface focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none"
                      placeholder="Digite sua chave PIX"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} /> Salvar Chave
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTempPixKey(pixKey);
                          setEditingPix(false);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-bold text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="view-pix"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 mt-2"
                  >
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                      Chave Cadastrada
                    </p>
                    <p className="font-bold text-primary text-sm truncate mt-1">{pixKey}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!editingPix && (
              <button
                type="button"
                onClick={() => {
                  setTempPixKey(pixKey);
                  setEditingPix(true);
                }}
                className="w-full py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center justify-center gap-2 border border-outline-variant/70 transition-colors"
              >
                <Edit3 size={15} />
                <span>Alterar Chave PIX</span>
              </button>
            )}
          </div>
        </section>

        {/* Transaction History Table */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-headline font-extrabold text-on-surface">
                Histórico de Transações e Repasses
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Últimos turnos realizados e repasses agendados via PIX
              </p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary-container px-3 py-1 rounded-full">
              {TRANSACTIONS.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/50">
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Serviço / Estabelecimento
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
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {TRANSACTIONS.map((tx) => {
                  const Icon = tx.icon;
                  const isPaid = tx.status === 'Pago';
                  return (
                    <tr key={tx.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-on-surface">{tx.role}</p>
                            <p className="text-xs text-on-surface-variant">{tx.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs sm:text-sm text-on-surface-variant font-medium">
                        {tx.date}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-primary-container text-primary'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-headline font-extrabold text-sm text-on-surface">
                        {tx.amount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FreelancerAnalytics;
