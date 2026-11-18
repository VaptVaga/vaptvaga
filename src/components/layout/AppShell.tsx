import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  ClipboardCheck,
  Wallet,
  MessageSquare,
  User,
  Users,
  PlusCircle,
  Building2,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  Crown,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/vaptvaga/BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const SAMPLE_NOTIFICATIONS_FREELANCER = [
  {
    id: 'n1',
    title: 'Turno confirmado para hoje',
    desc: 'Restaurante Adega Imperial • 18:30h às 00:30h',
    time: 'Agora',
    unread: true,
    path: '/freelancer/inicio',
  },
  {
    id: 'n2',
    title: '3 novas vagas com 98% de match',
    desc: 'Gastronomia e Eventos na sua região com PIX imediato',
    time: '15 min',
    unread: true,
    path: '/freelancer/vagas',
  },
  {
    id: 'n3',
    title: 'Repasse PIX disponível',
    desc: 'Seu saldo de R$ 410,00 já pode ser transferido',
    time: '2h atrás',
    unread: false,
    path: '/freelancer/dashboard',
  },
];

const SAMPLE_NOTIFICATIONS_COMPANY = [
  {
    id: 'c1',
    title: 'Novo candidato qualificado',
    desc: 'Ricardo Alvez (4.9★) aplicou para Garçom Noturno',
    time: '5 min',
    unread: true,
    path: '/company/candidatos',
  },
  {
    id: 'c2',
    title: 'Nova mensagem no chat',
    desc: 'Marina Santos enviou uma dúvida sobre o horário do turno',
    time: '25 min',
    unread: true,
    path: '/chat',
  },
  {
    id: 'c3',
    title: 'Vaga em destaque',
    desc: 'Sua vaga atingiu 45 visualizações nas últimas 2 horas',
    time: '3h atrás',
    unread: false,
    path: '/company/vagas',
  },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { profile, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  const isCompany = profile?.role === 'company';
  const isPro = profile?.subscriber === 'premium';

  const notifications = isCompany ? SAMPLE_NOTIFICATIONS_COMPANY : SAMPLE_NOTIFICATIONS_FREELANCER;
  const unreadCount = notifications.filter((n) => n.unread && !readIds.has(n.id)).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: NavItem[] = isCompany
    ? [
        { label: 'Painel Principal', path: '/company/dashboard', icon: LayoutDashboard },
        { label: 'Minhas Vagas', path: '/company/vagas', icon: Briefcase },
        { label: 'Agenda & Escala', path: '/company/agenda', icon: Calendar },
        { label: 'Financeiro & PIX', path: '/company/financeiro', icon: Wallet },
        { label: 'Candidatos', path: '/company/candidatos', icon: Users },
        { label: 'Publicar Urgência', path: '/post-job', icon: PlusCircle },
        { label: 'Mensagens & Chat', path: '/chat', icon: MessageSquare, badge: 'Novo' },
        { label: 'Perfil da Empresa', path: '/profile', icon: Building2 },
      ]
    : [
        { label: 'Início / Visão Geral', path: '/freelancer/inicio', icon: LayoutDashboard },
        { label: 'Vagas Disponíveis', path: '/freelancer/vagas', icon: Briefcase },
        { label: 'Minha Agenda', path: '/freelancer/agenda', icon: Calendar },
        { label: 'Minhas Candidaturas', path: '/freelancer/candidaturas', icon: ClipboardCheck },
        { label: 'Financeiro & PIX', path: '/freelancer/financeiro', icon: Wallet },
        { label: 'Mensagens & Chat', path: '/chat', icon: MessageSquare, badge: '2' },
        { label: 'Meu Perfil', path: '/profile', icon: User },
      ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (isCompany) {
      navigate(q ? `/company/vagas?q=${encodeURIComponent(q)}` : '/company/vagas');
    } else {
      navigate(q ? `/freelancer/vagas?q=${encodeURIComponent(q)}` : '/freelancer/vagas');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || (isCompany ? 'Minha Empresa' : 'Freelancer');
  const firstName = displayName.split(' ')[0];

  const isRouteActive = (path: string) => {
    if (location.pathname === path) return true;
    if (
      path === '/freelancer/financeiro' &&
      (location.pathname === '/freelancer/dashboard' ||
        location.pathname === '/freelancer/ganhos' ||
        location.pathname === '/financeiro')
    ) {
      return true;
    }
    if (path === '/company/financeiro' && location.pathname === '/financeiro') {
      return true;
    }
    if (
      (path === '/freelancer/agenda' || path === '/company/agenda') &&
      location.pathname === '/agenda'
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-background/60 text-on-surface font-body antialiased">
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-surface-container-low border-r border-outline-variant/80 z-40 flex-col justify-between p-5">
        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar">
          {/* Brand Logo */}
          <Link
            to={isCompany ? '/company/dashboard' : '/freelancer/inicio'}
            className="flex items-center gap-3 px-2 pt-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-on-primary font-headline font-extrabold text-xl shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-extrabold text-xl tracking-tight text-on-surface leading-none">
                Vapt<span className="text-primary">Vaga</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-1">
                {isCompany ? 'Portal da Empresa' : 'Área do Freelancer'}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Navegação principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                    active
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20 font-bold'
                      : 'text-on-surface-variant font-medium hover:bg-surface-container-high/70 hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Plan Card + Help & Logout */}
        <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/60">
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Plano Atual
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isPro
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {isPro && <Crown size={11} />}
                {isPro ? (isCompany ? 'Negócio Ágil' : 'Vapt PRO') : 'Grátis'}
              </span>
            </div>
            <p className="text-xs font-bold font-headline text-on-surface">
              {isPro
                ? isCompany
                  ? 'Vagas e chat ilimitados ativos'
                  : 'Candidaturas ilimitadas ativas'
                : isCompany
                  ? '1 vaga/mês e chat com 1 candidato'
                  : '2 candidaturas mensais no plano Free'}
            </p>
            {!isPro && (
              <Link
                to="/planos"
                className="w-full py-2 px-3 rounded-xl bg-primary-container hover:bg-primary hover:text-on-primary text-primary text-center font-headline font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>Desbloquear Recursos PRO</span>
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Link
              to="/faq"
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high/70 hover:text-on-surface transition-colors"
            >
              <HelpCircle size={17} />
              <span>Central de Ajuda</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error-container/70 transition-colors text-left"
            >
              <LogOut size={17} />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── RIGHT AREA (TOPBAR + MAIN CONTENT) ─── */}
      <div className="lg:pl-72 min-h-screen flex flex-col">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex sticky top-0 z-30 h-20 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/60 px-8 items-center justify-between gap-6">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/50 focus-within:bg-surface-container-lowest focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <Search size={18} className="text-on-surface-variant shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isCompany
                    ? 'Buscar vagas publicadas ou habilidades...'
                    : 'Buscar oportunidades, estabelecimentos ou cidades...'
                }
                className="w-full bg-transparent border-0 p-0 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0 outline-none"
              />
            </div>
          </form>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {isCompany ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                  <CheckCircle2 size={14} />
                  {isPro ? 'Negócio Ágil' : 'Plano Beta Gratuito'}
                </span>
                <Link
                  to="/post-job"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs shadow-md shadow-primary/20 transition-all active:scale-95"
                >
                  <Zap size={15} className="fill-current" />
                  <span>+ Publicar Urgência</span>
                </Link>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/70 text-on-secondary-container text-xs font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                  </span>
                  <span>Disponível para turnos</span>
                </div>
                <Link
                  to="/freelancer/vagas"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs shadow-md shadow-primary/20 transition-all active:scale-95"
                >
                  <Briefcase size={15} />
                  <span>Ver Vagas</span>
                </Link>
              </>
            )}

            {/* Notification Bell + Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notificações"
                className="relative w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error border-2 border-surface" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xl p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-headline font-bold text-sm text-on-surface">Notificações</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          Marcar como lidas
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {notifications.map((n) => {
                        const isUnread = n.unread && !readIds.has(n.id);
                        return (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              setReadIds((prev) => new Set(prev).add(n.id));
                              setNotifOpen(false);
                              navigate(n.path);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-colors flex flex-col gap-1 ${
                              isUnread ? 'bg-primary-container/50 hover:bg-primary-container' : 'bg-surface-container-low hover:bg-surface-container'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-on-surface">{n.title}</span>
                              <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5 shrink-0">
                                <Clock size={10} /> {n.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-snug">{n.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Support Link */}
            <Link
              to="/contato"
              title="Suporte"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <HelpCircle size={18} />
            </Link>

            {/* User Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center overflow-hidden font-headline font-bold text-xs shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  firstName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-headline font-bold text-on-surface leading-tight">{firstName}</span>
                <span className="text-[10px] font-medium text-on-surface-variant leading-none">
                  {isCompany ? 'Empresa' : isPro ? 'Freela PRO' : 'Freelancer'}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Mobile Topbar */}
        <header className="lg:hidden sticky top-0 z-40 h-16 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/60 px-4 flex items-center justify-between">
          <Link
            to={isCompany ? '/company/dashboard' : '/freelancer/inicio'}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-on-primary font-headline font-extrabold text-base shadow-sm">
              V
            </div>
            <span className="font-headline font-extrabold text-lg tracking-tight text-on-surface">
              Vapt<span className="text-primary">Vaga</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
              {isCompany ? 'Empresa' : isPro ? 'PRO' : 'Freela'}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(isCompany ? '/company/candidatos' : '/freelancer/vagas')}
              aria-label="Notificações"
              className="relative w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
              )}
            </button>
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center overflow-hidden font-headline font-bold text-xs border-2 border-primary-container"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                firstName.charAt(0).toUpperCase()
              )}
            </Link>
          </div>
        </header>

        {/* Main Workspace Content */}
        <div className="flex-1 pb-24 lg:pb-8">{children}</div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
