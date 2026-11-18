import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  ArrowLeft,
  Star,
  Lock,
  CheckCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Wallet,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  UserCheck,
  Headphones,
  Ban,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { ConfirmPresenceModal } from '@/components/vaptvaga/ConfirmPresenceModal';
import { toast } from '@/hooks/use-toast';
import {
  type ChatAccessManifest,
  type ChatViewerIdentity,
  canAccessConversation,
  encryptChatPayload,
  decryptChatPayload,
  detectExternalContactViolation,
  getChannelSecurityFingerprint,
  hasSensitiveTransmittedData,
  loadEncryptedThreadMessages,
  saveEncryptedThreadMessages,
} from '@/lib/chatSecurity';

interface ChatMessage {
  id: string;
  sender: 'me' | 'them' | 'support';
  text: string;
  time: string;
}

interface ConversationSeed {
  id: string;
  applicationId?: string;
  counterpartyId: string;
  name: string;
  subtitle: string;
  roleOrSector: string;
  rating: number;
  online: boolean;
  locked?: boolean;
  jobTitle: string;
  shiftDate: string;
  shiftPay: string;
  location: string;
  skills: string[];
  bio: string;
  messages: ChatMessage[];
}

interface ConversationThread extends ConversationSeed {
  access: ChatAccessManifest;
  fingerprint: string;
}

const COMPANY_CONVERSATIONS: ConversationSeed[] = [
  {
    id: 'conv-c1',
    counterpartyId: 'freela-ricardo-alvez',
    name: 'Ricardo Alvez',
    subtitle: 'Garçom & Barman Sênior',
    roleOrSector: 'Garçom para Sexta',
    rating: 4.9,
    online: true,
    locked: false,
    jobTitle: 'Garçom para Sexta à Noite',
    shiftDate: 'Hoje • 18:30 às 00:30',
    shiftPay: 'R$ 180,00',
    location: 'Lourdes, Belo Horizonte',
    skills: ['Garçom', 'Atendimento VIP', 'Bandeja'],
    bio: '3 anos de experiência em restaurantes à la carte e eventos corporativos. Pontualidade 100%.',
    messages: [
      {
        id: 'm1',
        sender: 'them',
        text: 'Olá! Vi a vaga de Garçom para hoje à noite. Tenho 3 anos de experiência e disponibilidade imediata.',
        time: '12:30',
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Olá Ricardo! Excelente perfil. Você consegue chegar às 18:15 para alinharmos o salão?',
        time: '12:42',
      },
      {
        id: 'm3',
        sender: 'them',
        text: 'Com certeza! Já separei o traje social preto conforme descrito na vaga.',
        time: '12:45',
      },
    ],
  },
  {
    id: 'conv-c2',
    counterpartyId: 'freela-marina-santos',
    name: 'Marina Santos',
    subtitle: 'Atendente & Hostess',
    roleOrSector: 'Garçom para Sexta',
    rating: 4.8,
    online: true,
    locked: true,
    jobTitle: 'Garçom para Sexta à Noite',
    shiftDate: 'Hoje • 18:30 às 00:30',
    shiftPay: 'R$ 180,00',
    location: 'Savassi, Belo Horizonte',
    skills: ['Hostess', 'Atendimento', 'Caixa'],
    bio: 'Especialista em recepção de clientes e serviço ágil de salão em bares movimentados.',
    messages: [
      {
        id: 'm4',
        sender: 'them',
        text: 'Oi! Moro a 10 minutos do restaurante e já atuei em bares da Savassi.',
        time: '11:20',
      },
      {
        id: 'm5',
        sender: 'them',
        text: 'Caso precisem de apoio extra no salão ou caixa, estou à disposição!',
        time: '11:21',
      },
    ],
  },
  {
    id: 'conv-c3',
    counterpartyId: 'freela-lucas-ferreira',
    name: 'Lucas Ferreira',
    subtitle: 'Chapeiro Master',
    roleOrSector: 'Chapeiro Smash Burger',
    rating: 5.0,
    online: false,
    locked: true,
    jobTitle: 'Chapeiro Master (Smash Burger)',
    shiftDate: 'Amanhã • 17:00 às 00:00',
    shiftPay: 'R$ 220,00',
    location: 'Centro, Belo Horizonte',
    skills: ['Chapa', 'Smash Burger', 'Cozinha'],
    bio: '51 turnos concluídos com nota máxima na plataforma.',
    messages: [
      {
        id: 'm6',
        sender: 'them',
        text: 'Tenho experiência com smash burger em chapa quente e saída rápida de delivery.',
        time: 'Ontem',
      },
    ],
  },
];

const FREELANCER_CONVERSATIONS: ConversationSeed[] = [
  {
    id: 'conv-f1',
    counterpartyId: 'emp-adega-imperial',
    name: 'Restaurante Adega Imperial',
    subtitle: 'Gerente Marcelo Santos',
    roleOrSector: 'Garçom de Salão Noturno',
    rating: 4.9,
    online: true,
    locked: false,
    jobTitle: 'Garçom de Salão Noturno',
    shiftDate: 'Hoje • 18:30 às 00:30',
    shiftPay: 'R$ 180,00',
    location: 'Vila da Serra (4.2 km)',
    skills: ['PIX até 01:00h', 'Jantar Incluso', 'Ajuda Uber R$ 20'],
    bio: 'Estabelecimento verificado com 42 turnos concluídos e média de avaliação 4.9 pelos freelancers.',
    messages: [
      {
        id: 'f1',
        sender: 'them',
        text: 'Olá! Sua candidatura para Garçom hoje foi aprovada. Pode chegar pela portaria lateral às 18:15.',
        time: '10:15',
      },
      {
        id: 'f2',
        sender: 'me',
        text: 'Perfeito! Confirmado, estarei lá no horário combinado.',
        time: '10:20',
      },
      {
        id: 'f3',
        sender: 'them',
        text: 'Combinado! Qualquer dúvida sobre a rota é só chamar por aqui.',
        time: '10:22',
      },
    ],
  },
  {
    id: 'conv-f2',
    counterpartyId: 'emp-burger-garage-99',
    name: 'Burger Garage 99',
    subtitle: 'Coordenação de Turno',
    roleOrSector: 'Chapeiro Smash',
    rating: 5.0,
    online: true,
    locked: false,
    jobTitle: 'Chapeiro Especialista & Montador Smash',
    shiftDate: 'Amanhã • 17:00 às 00:00',
    shiftPay: 'R$ 220,00',
    location: 'Savassi, BH (3.1 km)',
    skills: ['PIX no Fechamento', 'Lanche Incluso'],
    bio: 'Hamburgueria artesanal de alto giro na Savassi.',
    messages: [
      {
        id: 'f4',
        sender: 'them',
        text: 'Recebemos sua candidatura! Você já trabalhou com smash burger antes?',
        time: '09:40',
      },
    ],
  },
];

const ChatWorkspace: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const isCompany = profile?.role === 'company';
  const isFree = profile?.subscriber !== 'premium';
  const currentUserId =
    user?.id || profile?.id || (isCompany ? 'company-local-owner' : 'freelancer-local-owner');
  const currentUserName =
    profile?.name || (isCompany ? 'Minha Empresa' : 'Você (Freelancer)');

  const viewerIdentity = useMemo<ChatViewerIdentity>(
    () => ({
      userId: currentUserId,
      role: profile?.role || (isCompany ? 'company' : 'freelancer'),
    }),
    [currentUserId, profile?.role, isCompany]
  );

  const initialThreads = useMemo<ConversationThread[]>(() => {
    const base = isCompany ? COMPANY_CONVERSATIONS : FREELANCER_CONVERSATIONS;
    return base
      .map((c, idx) => {
        const access: ChatAccessManifest = isCompany
          ? {
              conversationId: c.id,
              applicationId: c.applicationId,
              freelancerId: c.counterpartyId,
              freelancerName: c.name,
              companyId: currentUserId,
              companyName: currentUserName,
              supportId: 'vaptvaga-support-official',
            }
          : {
              conversationId: c.id,
              applicationId: c.applicationId,
              freelancerId: currentUserId,
              freelancerName: currentUserName,
              companyId: c.counterpartyId,
              companyName: c.name,
              supportId: 'vaptvaga-support-official',
            };

        return {
          ...c,
          locked: isCompany && isFree ? idx > 0 : false,
          access,
          fingerprint: getChannelSecurityFingerprint(access),
        };
      })
      .filter((t) => canAccessConversation(t.access, viewerIdentity));
  }, [isCompany, isFree, currentUserId, currentUserName, viewerIdentity]);

  const [customMessages, setCustomMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const hydrated: Record<string, ChatMessage[]> = {};
    for (const t of initialThreads) {
      const saved = loadEncryptedThreadMessages(t.id, t.access, viewerIdentity);
      if (saved.length > 0) {
        hydrated[t.id] = saved;
      }
    }
    return hydrated;
  });

  const [selectedId, setSelectedId] = useState<string>('');
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draft, setDraft] = useState('');
  const [confirmedShiftIds, setConfirmedShiftIds] = useState<Set<string>>(new Set());
  const [showPaywall, setShowPaywall] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [presenceModalOpen, setPresenceModalOpen] = useState(false);
  const [violationModalData, setViolationModalData] = useState<{
    matchedTerm: string;
    reason: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCounterRef = useRef(100);

  const threads = useMemo<ConversationThread[]>(
    () =>
      initialThreads.map((t) => {
        const storedCustom = customMessages[t.id] || [];
        const protectedMessages = [...t.messages, ...storedCustom].map((msg) => {
          const encrypted = encryptChatPayload(msg.text, t.access, viewerIdentity);
          const decrypted = decryptChatPayload(encrypted, t.access, viewerIdentity);
          return {
            ...msg,
            text: decrypted.text,
          };
        });
        return {
          ...t,
          messages: protectedMessages,
        };
      }),
    [initialThreads, customMessages, viewerIdentity]
  );

  const filteredThreads = useMemo(() => {
    if (!searchTerm.trim()) return threads;
    const q = searchTerm.toLowerCase();
    return threads.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.jobTitle.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q)
    );
  }, [threads, searchTerm]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === selectedId) || threads[0],
    [threads, selectedId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? draft).trim();
    if (!text || !activeThread || activeThread.locked) return;

    const violation = detectExternalContactViolation(text);
    if (violation.violated) {
      setViolationModalData({
        matchedTerm: violation.matchedTerm || 'Contato externo / WhatsApp',
        reason:
          violation.reason ||
          'É terminantemente proibido sair do chat para o WhatsApp ou outro canal externo.',
      });
      toast({
        title: '🚫 Mensagem bloqueada pela regra VaptVaga',
        description:
          'É proibido sair da conversa para o WhatsApp. Tudo deve ser resolvido dentro do app.',
        variant: 'destructive',
      });
      return;
    }

    if (!canAccessConversation(activeThread.access, viewerIdentity)) {
      toast({
        title: 'Acesso bloqueado',
        description:
          'Apenas os 2 participantes da conversa e o suporte oficial da VaptVaga podem transmitir dados neste canal.',
        variant: 'destructive',
      });
      return;
    }

    const encryptedPayload = encryptChatPayload(text, activeThread.access, viewerIdentity);

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    msgCounterRef.current += 1;
    const newMsg: ChatMessage = {
      id: `msg-${msgCounterRef.current}`,
      sender: 'me',
      text,
      time: now,
    };

    const threadId = activeThread.id;
    setCustomMessages((prev) => {
      const updatedThreadCustom = [...(prev[threadId] || []), newMsg];
      saveEncryptedThreadMessages(
        threadId,
        activeThread.access,
        viewerIdentity,
        updatedThreadCustom
      );
      return {
        ...prev,
        [threadId]: updatedThreadCustom,
      };
    });
    if (!textToSend) setDraft('');

    // Persist encrypted payload to Supabase if a real applicationId is linked
    if (activeThread.applicationId && user?.id) {
      try {
        await supabase.from('messages').insert({
          application_id: activeThread.applicationId,
          sender_id: user.id,
          content: encryptedPayload,
        });
      } catch {
        // Non-blocking fallback for demo threads
      }
    }
  };

  const handleRequestSupportMediation = () => {
    if (!activeThread || !canAccessConversation(activeThread.access, viewerIdentity)) return;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    msgCounterRef.current += 1;
    const supportMsg: ChatMessage = {
      id: `sup-${msgCounterRef.current}`,
      sender: 'support',
      text: `Protocolo de Segurança VaptVaga (${activeThread.fingerprint}) aberto. O Suporte Oficial da VaptVaga ingressou neste canal exclusivo de ${activeThread.access.freelancerName} e ${activeThread.access.companyName} para prestar atendimento.`,
      time: now,
    };

    const threadId = activeThread.id;
    setCustomMessages((prev) => {
      const updated = [...(prev[threadId] || []), supportMsg];
      saveEncryptedThreadMessages(threadId, activeThread.access, viewerIdentity, updated);
      return { ...prev, [threadId]: updated };
    });
    setSecurityModalOpen(false);
    toast({
      title: '🛡️ Suporte VaptVaga acionado no chat!',
      description: 'Um atendente oficial recebeu acesso autenticado a este canal seguro.',
    });
  };

  const quickReplies = isCompany
    ? ['Pode chegar 15 min antes?', 'Turno confirmado! Te esperamos lá.', 'Qual seu tamanho de camiseta?']
    : ['Chegarei com 15 min de antecedência.', 'Traje separado e confirmado!', 'Qual o ponto de referência?'];

  const handleConfirmAction = () => {
    if (!activeThread) return;
    if (!isCompany) {
      setPresenceModalOpen(true);
      return;
    }
    setConfirmedShiftIds((prev) => new Set(prev).add(activeThread.id));
    toast({
      title: '✅ Contratação confirmada!',
      description: `Tudo certo com ${activeThread.name} para "${activeThread.jobTitle}".`,
    });
  };

  const handleConfirmFreelancerPresence = async () => {
    if (!activeThread) return;
    setConfirmedShiftIds((prev) => new Set(prev).add(activeThread.id));
    setPresenceModalOpen(false);
    await handleSendMessage(
      '✅ Presença confirmada oficialmente no aplicativo. Compromisso registrado para o turno combinado.'
    );
    toast({
      title: '✅ Presença confirmada!',
      description: `Comparecimento confirmado com ${activeThread.name} para "${activeThread.jobTitle}".`,
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] bg-transparent p-0 lg:p-6 overflow-hidden">
      <div className="h-full max-w-[1440px] mx-auto bg-surface-container-lowest lg:rounded-2xl lg:border lg:border-outline-variant/70 lg:shadow-sm flex overflow-hidden">
        {/* LEFT COLUMN: Conversations List */}
        <aside
          className={`w-full md:w-80 lg:w-88 shrink-0 border-r border-outline-variant/60 flex flex-col bg-surface-container-low/50 ${
            mobileShowThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 lg:p-5 border-b border-outline-variant/60 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="font-headline font-extrabold text-xl text-on-surface">Mensagens</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold flex items-center gap-1">
                <Lock size={10} /> Canal Seguro
              </span>
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar conversa ou vaga..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {filteredThreads.map((conv) => {
              const isSelected = activeThread?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(conv.id);
                    setMobileShowThread(true);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 transition-all border ${
                    isSelected
                      ? 'bg-surface-container-lowest border-primary shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-surface-container-lowest/80'
                  } ${conv.locked ? 'opacity-75' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-primary-container text-primary font-headline font-bold text-sm flex items-center justify-center">
                      {conv.name.substring(0, 2).toUpperCase()}
                    </div>
                    {conv.online && !conv.locked && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary border-2 border-surface-container-lowest" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-headline font-bold text-sm text-on-surface truncate ${
                          conv.locked ? 'blur-[3px] select-none' : ''
                        }`}
                      >
                        {conv.name}
                      </span>
                      <span className="text-[10px] font-bold text-on-surface-variant shrink-0">
                        {lastMsg?.time || ''}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-primary truncate">
                      {conv.roleOrSector}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">
                      {conv.locked ? '🔒 Desbloqueie no plano Negócio Ágil' : lastMsg?.text}
                    </p>
                  </div>

                  {conv.locked && <Lock size={15} className="text-on-surface-variant shrink-0" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER COLUMN: Active Chat Window */}
        {activeThread && (
          <section
            className={`flex-1 flex flex-col bg-surface relative overflow-hidden ${
              mobileShowThread ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Chat Header */}
            <header className="px-4 md:px-6 py-3.5 bg-surface-container-lowest border-b border-outline-variant/60 flex items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  aria-label="Voltar para conversas"
                  className="md:hidden w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant shrink-0"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="w-10 h-10 rounded-full bg-primary-container text-primary font-headline font-bold text-sm flex items-center justify-center shrink-0">
                  {activeThread.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      className={`font-headline font-extrabold text-sm sm:text-base text-on-surface truncate ${
                        activeThread.locked ? 'blur-[4px] select-none' : ''
                      }`}
                    >
                      {activeThread.name}
                    </h2>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold shrink-0">
                      <Star size={10} className="fill-current" /> {activeThread.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {activeThread.online ? 'Online agora' : 'Ativo recentemente'} •{' '}
                    <span className="text-on-surface-variant font-normal truncate">
                      {activeThread.jobTitle}
                    </span>
                  </p>
                </div>
              </div>

              {!activeThread.locked && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSecurityModalOpen(true)}
                    title="Verificar controle de acesso e criptografia do chat"
                    className="px-3 py-2 rounded-full bg-secondary-container/70 hover:bg-secondary-container text-on-secondary-container text-[11px] font-headline font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck size={14} />
                    <span className="hidden lg:inline">Acesso Restrito (2 + Suporte)</span>
                    <span className="lg:hidden">Seguro</span>
                  </button>

                  <button
                    type="button"
                    disabled={confirmedShiftIds.has(activeThread.id)}
                    onClick={handleConfirmAction}
                    className={`px-3.5 py-2 rounded-full text-xs font-headline font-bold flex items-center gap-1.5 transition-all ${
                      confirmedShiftIds.has(activeThread.id)
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-primary hover:bg-primary-dark text-on-primary shadow-sm'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span className="hidden sm:inline">
                      {confirmedShiftIds.has(activeThread.id)
                        ? 'Confirmado ✓'
                        : isCompany
                          ? 'Confirmar Contratação'
                          : 'Confirmar Presença'}
                    </span>
                  </button>
                </div>
              )}
            </header>

            {/* Messages Canvas */}
            <div
              className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-surface-container-low/40 ${
                activeThread.locked ? 'blur-[6px] pointer-events-none select-none' : ''
              }`}
            >
              {/* Permanent Strict Access & Channel Encryption Notice */}
              <div className="p-3.5 rounded-2xl bg-secondary-container/45 border border-secondary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={17} className="text-secondary shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs text-on-surface leading-relaxed">
                    <strong>Conversa Privada e Protegida:</strong> Apenas os{' '}
                    <strong>2 participantes</strong> ({activeThread.access.freelancerName} e{' '}
                    {activeThread.access.companyName}) e o{' '}
                    <strong>Suporte Oficial da VaptVaga</strong> têm acesso às mensagens e aos dados
                    transmitidos neste chat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(true)}
                  className="text-[11px] font-headline font-bold text-primary hover:underline shrink-0 self-end sm:self-center"
                >
                  Auditar Acesso ({activeThread.fingerprint})
                </button>
              </div>

              {/* Mandatory Anti-Evasion Rule: No WhatsApp / Off-App Contact */}
              <div className="p-3.5 rounded-2xl bg-error-container/55 border border-error/30 flex items-start gap-2.5">
                <Ban size={17} className="text-error shrink-0 mt-0.5" />
                <p className="text-[11px] sm:text-xs text-on-error-container leading-relaxed">
                  <strong>Proibido sair do app para o WhatsApp:</strong> É{' '}
                  <strong>terminantemente proibido</strong> levar esta conversa para o WhatsApp,
                  telefone ou qualquer canal externo. Tudo deve ser resolvido exclusivamente pelo
                  app VaptVaga, sujeito a <strong>punições e suspensão da conta</strong>.
                </p>
              </div>

              <div className="flex justify-center">
                <span className="px-3.5 py-1 rounded-full bg-surface-container text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Hoje
                </span>
              </div>

              {activeThread.messages.map((msg) => {
                const isMe = msg.sender === 'me';
                const isSupport = msg.sender === 'support';
                const hasSensitive = hasSensitiveTransmittedData(msg.text);

                if (isSupport) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="max-w-md px-4 py-3 rounded-2xl bg-primary-container/60 border border-primary/25 text-xs text-on-surface space-y-1 shadow-sm">
                        <div className="flex items-center justify-between gap-2 font-headline font-bold text-primary">
                          <span className="inline-flex items-center gap-1">
                            <Headphones size={13} /> Suporte Oficial VaptVaga
                          </span>
                          <span className="text-[10px] font-semibold">{msg.time}</span>
                        </div>
                        <p className="leading-relaxed text-on-surface-variant">{msg.text}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                      isMe ? 'ml-auto items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 text-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary text-on-primary rounded-2xl rounded-br-sm shadow-sm'
                          : 'bg-surface-container-lowest text-on-surface rounded-2xl rounded-bl-sm border border-outline-variant/60'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 px-1">
                      {hasSensitive && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-secondary">
                          <Lock size={10} /> Dado protegido
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-on-surface-variant">
                        {msg.time}
                      </span>
                      {isMe && <CheckCheck size={12} className="text-primary" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies + Input */}
            <div
              className={`p-3 md:p-4 bg-surface-container-lowest border-t border-outline-variant/60 space-y-2.5 ${
                activeThread.locked ? 'blur-[3px] pointer-events-none' : ''
              }`}
            >
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleSendMessage(reply)}
                    className="px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-primary-container text-[11px] font-semibold text-on-surface-variant hover:text-primary whitespace-nowrap transition-colors border border-outline-variant/50"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Escreva sua mensagem no canal seguro..."
                  className="flex-1 h-11 px-4 rounded-full bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:border-primary outline-none"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="w-11 h-11 rounded-full bg-primary hover:bg-primary-dark text-on-primary flex items-center justify-center shadow-md shadow-primary/20 disabled:opacity-40 transition-all active:scale-95 shrink-0"
                >
                  <Send size={17} />
                </button>
              </form>
            </div>

            {/* Paywall Overlay for Locked Thread (Free Company 2nd+ applicant) */}
            {activeThread.locked && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-on-surface/15 backdrop-blur-sm">
                <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl p-8 text-center flex flex-col items-center gap-5 border border-outline-variant">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center">
                    <Lock size={30} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                      Limite Gratuito Atingido 🔒
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      No plano grátis, você conversa com 1 candidato por vaga. Assine{' '}
                      <strong className="text-on-surface">Negócio Ágil (R$ 49,90/mês)</strong> para
                      liberar o chat com todos os candidatos.
                    </p>
                  </div>
                  <div className="w-full space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setShowPaywall(true)}
                      className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm shadow-lg shadow-primary/25 transition-all"
                    >
                      Desbloquear Todos os Chats
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/planos')}
                      className="text-xs font-bold text-on-surface-variant hover:text-primary py-2"
                    >
                      Comparar planos disponíveis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* RIGHT COLUMN: Context Info Panel (Desktop XL) */}
        {activeThread && !activeThread.locked && (
          <aside className="hidden xl:flex w-80 shrink-0 border-l border-outline-variant/60 bg-surface-container-lowest flex-col p-6 overflow-y-auto no-scrollbar space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-primary-container text-primary font-headline font-black text-2xl flex items-center justify-center ring-4 ring-primary-container/50">
                {activeThread.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-headline font-extrabold text-lg text-on-surface">
                  {activeThread.name}
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">
                  {activeThread.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSecurityModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold hover:brightness-95 transition-all"
              >
                <ShieldCheck size={13} /> Protegido: 2 Participantes + Suporte
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-headline font-extrabold uppercase tracking-wider text-secondary">
                <span className="flex items-center gap-1">
                  <KeyRound size={12} /> Criptografia de Canal
                </span>
                <span>Ativa</span>
              </div>
              <p className="text-[11px] font-mono font-bold text-on-surface">
                ID: {activeThread.fingerprint}
              </p>
              <p className="text-[11px] text-on-surface-variant leading-snug">
                Dados bloqueados via RLS estrito e criptografia para terceiros.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                Resumo
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">{activeThread.bio}</p>
            </div>

            <div className="space-y-2.5 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                Detalhes do Turno
              </h4>
              <div className="flex items-center gap-2 text-xs text-on-surface font-semibold">
                <Calendar size={14} className="text-primary shrink-0" />
                <span>{activeThread.shiftDate}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface font-semibold">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>{activeThread.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary font-extrabold">
                <Wallet size={14} className="shrink-0" />
                <span>{activeThread.shiftPay} / turno</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                Destaques
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeThread.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-full bg-primary-container text-primary text-[11px] font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 mt-auto space-y-2">
              <button
                type="button"
                onClick={() => setSecurityModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-secondary-container/70 hover:bg-secondary-container text-on-secondary-container font-headline font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldAlert size={14} />
                <span>Auditoria & Suporte no Chat</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(isCompany ? '/company/candidatos' : '/freelancer/candidaturas')
                }
                className="w-full py-3 rounded-xl border border-outline-variant text-on-surface font-headline font-bold text-xs hover:bg-surface-container-low transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} className="text-primary" />
                <span>{isCompany ? 'Ver Lista de Candidatos' : 'Ver Minhas Candidaturas'}</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Modal: Controle de Acesso e Auditoria de Segurança do Chat */}
      <AnimatePresence>
        {securityModalOpen && activeThread && (
          <div className="fixed inset-0 z-[94] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSecurityModalOpen(false)}
              className="fixed inset-0 bg-on-surface/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative z-[95] w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-secondary">
                      Canal Criptografado & RLS Estrito
                    </p>
                    <h3 className="font-headline font-extrabold text-base text-on-surface">
                      Controle de Acesso da Conversa
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  aria-label="Fechar modal de segurança"
                  className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-3.5 rounded-2xl bg-primary-container/40 border border-primary/20 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-primary">
                      Assinatura Criptográfica do Canal
                    </p>
                    <p className="font-mono font-black text-sm text-on-surface mt-0.5">
                      {activeThread.fingerprint}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                    Canal Verificado ✓
                  </span>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Quem tem acesso aos dados desta conversa:
                  </p>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <UserCheck size={16} className="text-secondary shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-on-surface">
                          1. {activeThread.access.freelancerName}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">Participante Freelancer</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-secondary">Autorizado ✓</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <UserCheck size={16} className="text-secondary shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-on-surface">
                          2. {activeThread.access.companyName}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">Participante Contratante</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-secondary">Autorizado ✓</span>
                  </div>

                  <div className="p-3 rounded-xl bg-primary-container/35 border border-primary/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Headphones size={16} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-on-surface">
                          3. Suporte Oficial VaptVaga
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          Acesso exclusivo para mediação, segurança e auditoria
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-primary">Autorizado ✓</span>
                  </div>

                  <div className="p-3 rounded-xl bg-error-container/35 border border-error/25 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Ban size={16} className="text-error shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-on-surface">
                          Quaisquer outros usuários ou terceiros
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          Sem chave de descriptografia e bloqueados por RLS
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-error">Bloqueado ✕</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 leading-relaxed">
                    <strong>Regra Anti-Evasão (Proibição de WhatsApp):</strong> É terminantemente
                    proibido sair da conversa para o WhatsApp ou telefone. Desvios acarretam punições
                    automáticas na plataforma.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleRequestSupportMediation}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-primary hover:text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Headphones size={15} />
                    <span>Acionar Suporte VaptVaga no Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecurityModalOpen(false)}
                    className="py-3 px-5 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="company" />

      <ConfirmPresenceModal
        open={presenceModalOpen && !!activeThread}
        onClose={() => setPresenceModalOpen(false)}
        onConfirm={handleConfirmFreelancerPresence}
        shiftTitle={activeThread?.jobTitle || 'Turno'}
        companyName={activeThread?.name || 'Contratante'}
        shiftDateLabel={activeThread?.shiftDate}
        locationLabel={activeThread?.location}
      />

      {/* Modal: Infração Anti-Evasão (Proibição de WhatsApp) */}
      <AnimatePresence>
        {violationModalData && (
          <div className="fixed inset-0 z-[96] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViolationModalData(null)}
              className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 14 }}
              className="relative z-[97] w-full max-w-md bg-surface-container-lowest rounded-3xl border-2 border-error/50 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-error text-on-error flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Ban size={20} />
                  <h3 className="font-headline font-extrabold text-base">
                    Ação Proibida no Chat
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViolationModalData(null)}
                  aria-label="Fechar aviso"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-error-container/60 border border-error/30 space-y-1.5">
                  <p className="font-headline font-extrabold text-sm text-on-error-container">
                    É terminantemente proibido sair da conversa e ir ao WhatsApp!
                  </p>
                  <p className="text-xs text-on-error-container/90 leading-relaxed">
                    {violationModalData.reason}
                  </p>
                  <p className="text-[11px] font-bold text-error pt-1">
                    Termo bloqueado: &ldquo;{violationModalData.matchedTerm}&rdquo;
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-1.5 text-xs text-on-surface-variant leading-relaxed">
                  <p className="font-headline font-bold text-on-surface">
                    Regras e Punições Aplicáveis:
                  </p>
                  <p>
                    • Tudo (horários, check-in, dúvidas, alterações e repasse PIX) deve ser
                    resolvido <strong>exclusivamente pelo aplicativo VaptVaga</strong>.
                  </p>
                  <p>
                    • Insistir em transferir a conversa para o WhatsApp ou telefone gera{' '}
                    <strong>punições na conta</strong>, perda de garantia do turno e possível
                    banimento da plataforma.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViolationModalData(null)}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm transition-colors"
                >
                  Entendido, continuar pelo Chat do App
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Chat: React.FC = () => {
  const { profile, user } = useAuth();
  const viewerKey = `${user?.id || profile?.id || 'guest'}-${profile?.role || 'freelancer'}`;
  return <ChatWorkspace key={viewerKey} />;
};

export default Chat;
