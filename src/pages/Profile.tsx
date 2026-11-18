import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  ChevronRight,
  Camera,
  CheckCircle2,
  MapPin,
  Save,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  FileText,
  MessageSquare,
  Crown,
  Plus,
  X,
  LocateFixed,
  Loader2,
  Pencil,
  Phone,
  ArrowLeft,
  Star,
  Calendar,
  Wallet,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ImageCropper } from '@/components/common/ImageCropper';
import { LocationMap } from '@/components/vaptvaga/LocationMap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUpdateProfile } from '@/hooks/useSupabase';
import {
  detectUserLocation,
  resolveCoordinates,
  isValidCoordinate,
} from '@/lib/geolocation';

const QUICK_SKILLS = [
  'Garçom',
  'Barista',
  'Bartender',
  'Auxiliar de Cozinha',
  'Atendimento ao Cliente',
  'Caixa',
  'Limpeza',
  'Estoquista',
  'Eventos',
];

const ESTADOS_BR = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, profile, signOut, refreshProfile, updateLocalProfile } = useAuth();
  const user = profile as (typeof profile & {
    titulo_profissional?: string | null;
    bio?: string | null;
  }) | null;
  const userId = authUser?.id || user?.id;
  const updateProfile = useUpdateProfile();

  const isCompany = user?.role === 'company';
  const isPro = user?.subscriber === 'premium';

  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable Profile Form State
  const [name, setName] = useState(
    user?.name || (authUser?.user_metadata?.full_name as string) || ''
  );
  const [titulo, setTitulo] = useState(user?.titulo_profissional || '');
  const [cidade, setCidade] = useState(user?.cidade || '');
  const [bairro, setBairro] = useState(user?.bairro || '');
  const [estado, setEstado] = useState(user?.estado || '');
  const [latitude, setLatitude] = useState<number | null>(
    isValidCoordinate(user?.latitude) ? user.latitude : null
  );
  const [longitude, setLongitude] = useState<number | null>(
    isValidCoordinate(user?.longitude) ? user.longitude : null
  );
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [customSkill, setCustomSkill] = useState('');

  const hydratedProfileIdRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);
  const editSectionRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    if (hydratedProfileIdRef.current === user.id || isDirtyRef.current) return;

    hydratedProfileIdRef.current = user.id;
    setAvatarPreview(user.avatar_url || null);
    setName(user.name || (authUser?.user_metadata?.full_name as string) || '');
    setTitulo(user.titulo_profissional || '');
    setCidade(user.cidade || '');
    setBairro(user.bairro || '');
    setEstado(user.estado || '');
    setLatitude(isValidCoordinate(user.latitude) ? user.latitude : null);
    setLongitude(isValidCoordinate(user.longitude) ? user.longitude : null);
    setTelefone(user.telefone || '');
    setBio(user.bio || '');
    setSkills(user.skills || []);
  }, [user, authUser]);

  const profileChecks = useMemo(() => {
    const items = [
      { id: 'photo', label: 'Foto de perfil', done: Boolean(avatarPreview) },
      { id: 'name', label: 'Nome completo', done: Boolean(name.trim()) },
      { id: 'role', label: isCompany ? 'Segmento' : 'Cargo / Título', done: Boolean(titulo.trim()) },
      { id: 'loc', label: 'Localização', done: Boolean(cidade.trim()) },
      { id: 'phone', label: 'WhatsApp', done: Boolean(telefone.trim()) },
      { id: 'bio', label: 'Biografia / Sobre', done: Boolean(bio.trim()) },
    ];
    if (!isCompany) {
      items.push({ id: 'skills', label: 'Habilidades', done: skills.length > 0 });
    }
    const doneCount = items.filter((i) => i.done).length;
    const percent = Math.round((doneCount / items.length) * 100);
    return { items, doneCount, percent };
  }, [avatarPreview, name, titulo, cidade, telefone, bio, skills.length, isCompany]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageSrc(URL.createObjectURL(file));
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedFile: File, croppedUrl: string) => {
    if (!userId) return;
    setSelectedImageSrc(null);
    setAvatarPreview(croppedUrl);
    setIsUploading(true);

    try {
      const ext = croppedFile.name.split('.').pop() || 'jpeg';
      const path = `${userId}/avatar_${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, croppedFile, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);

      await updateProfile.mutateAsync({
        id: userId,
        role: (user?.role as 'freelancer' | 'company') || 'freelancer',
        name: name.trim() || user?.name || 'Usuário',
        avatar_url: urlData.publicUrl,
      });

      updateLocalProfile({ id: userId, avatar_url: urlData.publicUrl });
      await refreshProfile();
      toast({ title: '✅ Foto atualizada com sucesso!' });
    } catch (err: unknown) {
      toast({
        title: 'Erro ao atualizar foto',
        description: err instanceof Error ? err.message : 'Erro inesperado.',
        variant: 'destructive',
      });
      setAvatarPreview(user?.avatar_url || null);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    isDirtyRef.current = true;
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      isDirtyRef.current = true;
      setSkills((prev) => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const handleDetectGps = async () => {
    setIsLocatingGps(true);
    try {
      const detected = await detectUserLocation();
      const nextCidade = detected.cidade || cidade;
      const nextBairro = detected.bairro || bairro;
      const nextEstado = detected.estado || estado;

      setLatitude(detected.latitude);
      setLongitude(detected.longitude);
      if (detected.cidade) setCidade(detected.cidade);
      if (detected.bairro) setBairro(detected.bairro);
      if (detected.estado) setEstado(detected.estado);

      if (!isEditing && userId) {
        const saved = await updateProfile.mutateAsync({
          id: userId,
          role: (user?.role as 'freelancer' | 'company') || 'freelancer',
          name: name.trim() || user?.name || 'Usuário',
          cidade: nextCidade || null,
          bairro: nextBairro || null,
          estado: nextEstado || null,
          latitude: detected.latitude,
          longitude: detected.longitude,
        });
        updateLocalProfile(saved);
        toast({
          title: '📍 Região atualizada via GPS!',
          description:
            [nextBairro, nextCidade, nextEstado].filter(Boolean).join(', ') ||
            'Sua localização foi salva no perfil.',
        });
      } else {
        isDirtyRef.current = true;
        toast({
          title: '📍 Localização detectada via GPS!',
          description:
            [detected.bairro, detected.cidade, detected.estado].filter(Boolean).join(', ') ||
            'Coordenadas preenchidas.',
        });
      }
    } catch (err: unknown) {
      toast({
        title: 'Não foi possível obter o GPS',
        description: err instanceof Error ? err.message : 'Verifique as permissões de localização.',
        variant: 'destructive',
      });
    } finally {
      setIsLocatingGps(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        title: 'Sessão não encontrada',
        description: 'Faça login novamente para salvar seu perfil.',
        variant: 'destructive',
      });
      return;
    }

    const finalCoords = resolveCoordinates({
      latitude,
      longitude,
      bairro: bairro.trim() || null,
      cidade: cidade.trim() || null,
    });

    const payload: Record<string, unknown> & { id: string } = {
      id: userId,
      role: user?.role || 'freelancer',
      name: name.trim() || user?.name || (authUser?.user_metadata?.full_name as string) || 'Usuário',
      cidade: cidade.trim() || null,
      bairro: bairro.trim() || null,
      estado: estado || null,
      latitude: cidade.trim() || bairro.trim() || latitude ? finalCoords.latitude : null,
      longitude: cidade.trim() || bairro.trim() || longitude ? finalCoords.longitude : null,
      telefone: telefone.trim() || null,
      skills: isCompany ? null : skills,
      titulo_profissional: titulo.trim() || null,
      bio: bio.trim() || null,
    };

    try {
      const saved = await updateProfile.mutateAsync(
        payload as Parameters<typeof updateProfile.mutateAsync>[0]
      );

      updateLocalProfile(saved);
      hydratedProfileIdRef.current = userId;
      isDirtyRef.current = false;
      await refreshProfile();
      setIsEditing(false);

      toast({
        title: '✅ Perfil atualizado!',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    } catch (err: unknown) {
      toast({
        title: 'Erro ao salvar perfil',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenEdit = () => {
    setIsEditing(true);
    window.setTimeout(() => {
      editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name || (authUser?.user_metadata?.full_name as string) || '');
      setTitulo(user.titulo_profissional || '');
      setCidade(user.cidade || '');
      setBairro(user.bairro || '');
      setEstado(user.estado || '');
      setLatitude(isValidCoordinate(user.latitude) ? user.latitude : null);
      setLongitude(isValidCoordinate(user.longitude) ? user.longitude : null);
      setTelefone(user.telefone || '');
      setBio(user.bio || '');
      setSkills(user.skills || []);
    }
    isDirtyRef.current = false;
    setIsEditing(false);
  };

  const menuItems = [
    {
      label: isCompany ? 'Assistente completo da empresa' : 'Assistente completo do freelancer',
      path: isCompany ? '/onboarding' : '/freelancer/onboarding',
      icon: Sparkles,
    },
    { label: 'Planos e Assinatura', path: '/planos', icon: Crown },
    { label: 'Dúvidas Frequentes', path: '/faq', icon: HelpCircle },
    { label: 'Contato / Suporte', path: '/contato', icon: MessageSquare },
    { label: 'Termos e Privacidade', path: '/termos', icon: FileText },
  ];

  const locationSummary = [bairro, cidade, estado].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-transparent font-body">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 lg:py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
              {isEditing ? 'Editar Perfil' : isCompany ? 'Perfil da Empresa' : 'Meu Perfil'}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {isEditing
                ? 'Atualize seus dados de exibição, localização e habilidades.'
                : 'Gerencie sua identidade, reputação, mapa de atuação e assinatura.'}
            </p>
          </div>

          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              className="h-10 px-5 rounded-full border-outline-variant text-on-surface font-headline font-bold text-xs flex items-center gap-2 self-start sm:self-center"
            >
              <ArrowLeft size={15} />
              <span>Voltar ao Perfil</span>
            </Button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Integrated Identity Card + Menu (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Unified Identity Card */}
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 p-6 shadow-sm space-y-5">
              <div className="flex items-start gap-4">
                <div className="relative group cursor-pointer shrink-0">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full overflow-hidden border-2 border-primary/25 bg-primary-container text-2xl font-black text-primary ${
                      isUploading ? 'opacity-50' : ''
                    }`}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      (name || user?.name)?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>

                  <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-primary-dark transition-colors">
                    <Camera size={13} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-headline font-extrabold text-on-surface text-lg leading-tight truncate">
                      {name || user?.name || 'Usuário'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                      <CheckCircle2 size={11} /> Verificado
                    </span>
                  </div>

                  {titulo && (
                    <p className="text-xs font-bold text-primary mt-0.5">{titulo}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs font-medium text-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-primary shrink-0" />
                      {locationSummary || 'Localização não informada'}
                    </span>
                    {telefone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={11} className="text-primary shrink-0" />
                        {telefone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio integrated inside Identity Card */}
              <div className="text-xs text-on-surface-variant leading-relaxed">
                {bio ? (
                  <p className="line-clamp-3">{bio}</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="text-primary font-semibold hover:underline text-left"
                  >
                    + Adicione uma descrição rápida sobre sua experiência
                  </button>
                )}
              </div>

              {/* Skills integrated inside Identity Card */}
              {!isCompany && skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-full bg-primary-container/70 text-primary text-[11px] font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 6 && (
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold">
                      +{skills.length - 6}
                    </span>
                  )}
                </div>
              )}

              {/* Primary Action inside Identity Card: Editar Perfil */}
              <div className="pt-1">
                <Button
                  type="button"
                  onClick={isEditing ? handleCancelEdit : handleOpenEdit}
                  variant={isEditing ? 'outline' : 'default'}
                  className={`w-full h-11 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    isEditing
                      ? 'border-outline-variant text-on-surface hover:bg-surface-container-low'
                      : 'bg-primary hover:bg-primary-dark text-on-primary shadow-sm shadow-primary/20'
                  }`}
                >
                  {isEditing ? <X size={15} /> : <Pencil size={15} />}
                  <span>{isEditing ? 'Fechar Edição' : 'Editar Perfil'}</span>
                </Button>
              </div>

              {/* Plan Card */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      {isPro ? (isCompany ? 'Plano Negócio Ágil' : 'Plano Vapt PRO') : 'Plano Grátis'}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {isCompany ? 'Conta Empresa' : 'Conta Freelancer'}
                    </p>
                  </div>
                </div>
                {!isPro && (
                  <button
                    type="button"
                    onClick={() => navigate('/planos')}
                    className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-[11px] font-bold hover:bg-primary-dark transition-colors shrink-0"
                  >
                    Fazer Upgrade
                  </button>
                )}
              </div>
            </div>

            {/* Quick Menu */}
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 p-3 shadow-sm space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className="text-on-surface-variant group-hover:text-primary transition-colors"
                      />
                      <span className="font-semibold text-on-surface text-sm">{item.label}</span>
                    </div>
                    <ChevronRight
                      size={17}
                      className="text-on-surface-variant group-hover:text-primary transition-colors"
                    />
                  </button>
                );
              })}

              <div className="pt-2 mt-2 border-t border-outline-variant/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start px-4 text-error hover:text-error hover:bg-error-container/70 h-11 rounded-xl font-bold text-sm"
                >
                  <LogOut size={17} className="mr-2.5" />
                  Sair da conta
                </Button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Dynamic Integrated Overview OR Edit Form (7 cols) */}
          {!isEditing ? (
            <motion.div
              key="profile-dynamic-overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* 1. Força do Perfil & Itens Interativos */}
              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-headline font-extrabold text-base sm:text-lg text-on-surface flex items-center gap-2">
                      <TrendingUp size={18} className="text-primary" />
                      Força do Perfil no Radar
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Perfis 100% completos aparecem primeiro nas buscas da sua região.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary-container text-primary font-headline font-black text-sm shrink-0">
                    {profileChecks.percent}%
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${profileChecks.percent}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {profileChecks.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (!item.done) handleOpenEdit();
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        item.done
                          ? 'bg-secondary-container/70 text-on-secondary-container cursor-default'
                          : 'bg-surface-container-low hover:bg-primary-container text-primary border border-dashed border-primary/40'
                      }`}
                    >
                      {item.done ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                      <span>{item.done ? item.label : `Completar ${item.label}`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Métricas de Reputação & Atalhos Integrados */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 p-4 shadow-sm flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                    <span>Avaliação Média</span>
                    <Star size={16} className="text-amber-400 fill-current" />
                  </div>
                  <p className="font-headline font-black text-2xl text-on-surface">4.9</p>
                  <span className="text-[11px] font-bold text-secondary">
                    100% recomendado
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(isCompany ? '/company/agenda' : '/freelancer/agenda')}
                  className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 hover:border-primary/40 p-4 shadow-sm flex flex-col justify-between gap-2 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                    <span>Agenda & Turnos</span>
                    <Calendar size={16} className="text-primary" />
                  </div>
                  <p className="font-headline font-black text-2xl text-on-surface group-hover:text-primary transition-colors">
                    Ativa
                  </p>
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                    Gerenciar horários <ChevronRight size={12} />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(isCompany ? '/company/vagas' : '/freelancer/dashboard')
                  }
                  className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 hover:border-primary/40 p-4 shadow-sm flex flex-col justify-between gap-2 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                    <span>{isCompany ? 'Vagas Publicadas' : 'Carteira PIX'}</span>
                    {isCompany ? (
                      <Briefcase size={16} className="text-secondary" />
                    ) : (
                      <Wallet size={16} className="text-secondary" />
                    )}
                  </div>
                  <p className="font-headline font-black text-2xl text-on-surface group-hover:text-primary transition-colors">
                    {isCompany ? 'Painel' : 'R$ 410'}
                  </p>
                  <span className="text-[11px] font-bold text-secondary flex items-center gap-1">
                    {isCompany ? 'Ver vagas abertas' : 'Ver repasses'} <ChevronRight size={12} />
                  </span>
                </button>
              </div>

              {/* 3. Área de Atuação e Mapa Dinâmico */}
              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/70 p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-headline font-extrabold text-base text-on-surface flex items-center gap-2">
                      <MapPin size={17} className="text-primary" />
                      Região de Atuação
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {locationSummary || 'Defina sua cidade para calcular rotas e distâncias das vagas.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isLocatingGps}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-container text-primary text-xs font-headline font-bold hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60"
                  >
                    {isLocatingGps ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <LocateFixed size={13} />
                    )}
                    <span>{isLocatingGps ? 'Atualizando...' : 'Atualizar via GPS'}</span>
                  </button>
                </div>

                <LocationMap
                  compact
                  addressLabel={locationSummary || 'Belo Horizonte, MG'}
                  latitude={latitude}
                  longitude={longitude}
                  bairro={bairro}
                  cidade={cidade}
                  heightClassName="h-44"
                  showRouteButtons={false}
                />
              </div>
            </motion.div>
          ) : (
            <motion.form
              ref={editSectionRef}
              key="profile-edit"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onSubmit={handleSaveProfile}
              className="lg:col-span-7 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 p-6 md:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
                <div>
                  <h2 className="font-headline font-extrabold text-lg text-on-surface">
                    Editar Informações do Perfil
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Mantenha seu cadastro completo para aumentar suas oportunidades.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-on-surface-variant hover:text-on-surface"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    {isCompany ? 'Nome Fantasia' : 'Nome Completo'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      isDirtyRef.current = true;
                      setName(e.target.value);
                    }}
                    placeholder="Seu nome"
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    {isCompany ? 'Segmento' : 'Título Profissional'}
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => {
                      isDirtyRef.current = true;
                      setTitulo(e.target.value);
                    }}
                    placeholder={isCompany ? 'Ex: Restaurante & Bar' : 'Ex: Garçom / Barista'}
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => {
                      isDirtyRef.current = true;
                      setLatitude(null);
                      setLongitude(null);
                      setCidade(e.target.value);
                    }}
                    placeholder="Ex: Belo Horizonte"
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Estado (UF)
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => {
                      isDirtyRef.current = true;
                      setEstado(e.target.value);
                    }}
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none"
                  >
                    <option value="">Selecione</option>
                    {ESTADOS_BR.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bairro, GPS Detection & Mini Map Preview */}
              <div className="space-y-3 rounded-2xl bg-surface-container-low/60 p-4 border border-outline-variant/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Bairro & Localização no Mapa
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isLocatingGps}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-primary text-xs font-headline font-bold hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60"
                  >
                    {isLocatingGps ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <LocateFixed size={13} />
                    )}
                    <span>{isLocatingGps ? 'Detectando GPS...' : 'Detectar localização via GPS'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setLatitude(null);
                    setLongitude(null);
                    setBairro(e.target.value);
                  }}
                  placeholder="Ex: Savassi, Lourdes, Pinheiros..."
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-sm font-medium text-on-surface focus:border-primary outline-none"
                />

                {(cidade || bairro || latitude) && (
                  <LocationMap
                    compact
                    addressLabel={[bairro, cidade, estado].filter(Boolean).join(', ') || 'Sua região'}
                    latitude={latitude}
                    longitude={longitude}
                    bairro={bairro}
                    cidade={cidade}
                    heightClassName="h-36"
                    showRouteButtons={false}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                  WhatsApp / Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setTelefone(e.target.value);
                  }}
                  placeholder="(31) 99999-9999"
                  className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                  {isCompany ? 'Sobre o Estabelecimento' : 'Bio / Sobre Mim'}
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setBio(e.target.value);
                  }}
                  placeholder="Conte um pouco sobre sua experiência ou seu estabelecimento..."
                  className="w-full p-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none resize-none"
                />
              </div>

              {!isCompany && (
                <div className="space-y-3">
                  <label className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                    Habilidades Operacionais
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set([...QUICK_SKILLS, ...skills])).map((skill) => {
                      const selected = skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                            selected
                              ? 'bg-primary text-on-primary shadow-sm'
                              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                          <span>{skill}</span>
                          {selected && <X size={12} />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                      placeholder="Adicionar outra habilidade..."
                      className="flex-1 h-10 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-xs text-on-surface outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      disabled={!customSkill.trim()}
                      className="h-10 px-4 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="h-12 px-6 rounded-full border-outline-variant text-on-surface font-headline font-bold text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="h-12 px-8 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm flex items-center gap-2 shadow-md shadow-primary/20"
                >
                  <Save size={16} />
                  <span>{updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}</span>
                </Button>
              </div>
            </motion.form>
          )}
        </div>
      </div>

      {selectedImageSrc && (
        <ImageCropper
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setSelectedImageSrc(null)}
          cropShape="round"
          aspect={1}
        />
      )}
    </div>
  );
};

export default Profile;
