import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, Plus, Check, Fingerprint, Building2, CreditCard, FileText, QrCode, HelpCircle, Bell, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImageCropper } from '@/components/common/ImageCropper';

const defaultSkillOptions = [
  'Garçom', 'Barman', 'Cozinheiro', 'Auxiliar de Cozinha', 'Chapa',
  'Vendedor', 'Operador de Caixa', 'Atendente', 'Faxineiro', 'Copeira',
  'Promotor', 'Hostess', 'Recepcionista', 'Segurança', 'Motoboy',
  'Entregador', 'DJ', 'Fotógrafo', 'Montador', 'Carregador',
];

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const ESTABLISHMENT_TYPES = ['Restaurante', 'Bar', 'Loja', 'Mercado', 'Eventos', 'Outros'];
const SEGMENTS = ['Tecnologia', 'Varejo', 'Serviços', 'Logística', 'Alimentação', 'Outros'];
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const COMPANY_STEPS = [
  { id: 'identity', label: 'Identidade', icon: Fingerprint },
  { id: 'business', label: 'Empresa', icon: Building2 },
  { id: 'payment', label: 'Pagamento', icon: CreditCard },
  { id: 'documents', label: 'Docs', icon: FileText },
];

const inputClass = 'w-full h-14 bg-surface-container-low border-none rounded-full px-6 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all font-body outline-none';
const labelClass = 'block text-xs font-bold font-headline text-on-surface-variant uppercase tracking-wider ml-1 mb-2';

const Onboarding = () => {
  const navigate = useNavigate();
  const { profile: user, user: authUser, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();

  // Role picker
  const [role, setRole] = useState<'company' | 'freelancer' | null>((user?.role as 'company' | 'freelancer') || null);
  const showRolePicker = !user?.role && !role;

  // Company step
  const [step, setStep] = useState(0);

  // Step 1: Identity
  const [name, setName] = useState(user?.name || '');
  const [cnpj, setCnpj] = useState('');
  const [segmento, setSegmento] = useState('');
  const [cidade, setCidade] = useState(user?.cidade || '');
  const [estado, setEstado] = useState('');
  const [telefone, setTelefone] = useState(user?.telefone || '');

  // Step 2: Business Details
  const [descricao, setDescricao] = useState('');
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState('');
  const [diasMovimento, setDiasMovimento] = useState<string[]>([]);
  const [horaPicoInicio, setHoraPicoInicio] = useState('18:00');
  const [horaPicoFim, setHoraPicoFim] = useState('23:00');

  // Step 3: Payment
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');

  // Images state
  const [freelancerAvatarFile, setFreelancerAvatarFile] = useState<File | null>(null);
  const [freelancerAvatarPreview, setFreelancerAvatarPreview] = useState<string | null>(user?.avatar_url || null);

  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(user?.avatar_url || null);

  const [companyBannerFile, setCompanyBannerFile] = useState<File | null>(null);
  const [companyBannerPreview, setCompanyBannerPreview] = useState<string | null>(null);

  const [croppingTarget, setCroppingTarget] = useState<'freelancer' | 'logo' | 'banner' | null>(null);
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);

  // Freelancer fields
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
  const [customSkill, setCustomSkill] = useState('');

  const { data: skillRankings } = useQuery({
    queryKey: ['skill-rankings'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_skill_rankings');
      if (error) return [];
      return data as { skill: string; cnt: number }[];
    },
  });

  const rankedSkillOptions = useMemo(() => {
    if (!skillRankings?.length) return defaultSkillOptions;
    const rankMap = new Map(skillRankings.map((r) => [r.skill.toLowerCase(), r.cnt]));
    return [...defaultSkillOptions].sort((a, b) => {
      const ra: number = rankMap.get(a.toLowerCase()) ?? 0;
      const rb: number = rankMap.get(b.toLowerCase()) ?? 0;
      return rb - ra;
    });
  }, [skillRankings]);

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed || trimmed.length > 30 || selectedSkills.includes(trimmed)) { setCustomSkill(''); return; }
    setSelectedSkills((prev) => [...prev, trimmed]);
    setCustomSkill('');
  };

  const toggleDay = (day: string) =>
    setDiasMovimento((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>, target: 'freelancer' | 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      setCroppingImageSrc(URL.createObjectURL(file));
      setCroppingTarget(target);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedFile: File, croppedUrl: string) => {
    if (croppingTarget === 'freelancer') {
      setFreelancerAvatarFile(croppedFile);
      setFreelancerAvatarPreview(croppedUrl);
    } else if (croppingTarget === 'logo') {
      setCompanyLogoFile(croppedFile);
      setCompanyLogoPreview(croppedUrl);
    } else if (croppingTarget === 'banner') {
      setCompanyBannerFile(croppedFile);
      setCompanyBannerPreview(croppedUrl);
    }
    setCroppingImageSrc(null);
    setCroppingTarget(null);
  };

  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    try {
      let finalAvatarUrl = role === 'company' ? companyLogoPreview : freelancerAvatarPreview;
      let finalBannerUrl = companyBannerPreview;

      // Upload Freelancer Avatar
      if (role !== 'company' && freelancerAvatarFile) {
        const ext = freelancerAvatarFile.name.split('.').pop() || 'jpeg';
        const path = `${authUser.id}/avatar_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('avatars').upload(path, freelancerAvatarFile, { upsert: true });
        if (!error) {
          finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
        }
      }

      // Upload Company Logo
      if (role === 'company' && companyLogoFile) {
        const ext = companyLogoFile.name.split('.').pop() || 'jpeg';
        const path = `${authUser.id}/logo_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('avatars').upload(path, companyLogoFile, { upsert: true });
        if (!error) {
          finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
        }
      }

      // Upload Company Banner
      if (role === 'company' && companyBannerFile) {
        const ext = companyBannerFile.name.split('.').pop() || 'jpeg';
        // Placed in avatars bucket for simplicity, named properly
        const path = `${authUser.id}/banner_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('avatars').upload(path, companyBannerFile, { upsert: true });
        if (!error) {
          finalBannerUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
        }
      }

      await updateProfile.mutateAsync({
        id: authUser.id,
        name,
        cidade,
        telefone,
        role: role || 'freelancer',
        avatar_url: finalAvatarUrl,
        banner_url: finalBannerUrl,
        ...(role !== 'company' ? { skills: selectedSkills } : {}),
        ...(estado ? { estado } : {}),
      } as any);
      
      await refreshProfile();
      toast({ title: '✅ Perfil salvo com sucesso!' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const isCompany = (role || user?.role) === 'company';

  // ═══════════════════════════════════════════
  // ROLE PICKER
  // ═══════════════════════════════════════════
  if (showRolePicker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-headline text-on-surface">Como você quer usar o VaptVaga?</h1>
            <p className="mt-2 text-on-surface-variant">Escolha seu perfil para começar.</p>
          </div>
          {[
            { r: 'company' as const, icon: '🏢', title: 'Sou Empresa', desc: 'Quero encontrar freelancers para meu negócio' },
            { r: 'freelancer' as const, icon: '💼', title: 'Sou Freelancer', desc: 'Quero encontrar diárias e ganhar dinheiro' },
          ].map((opt) => (
            <motion.button
              key={opt.r}
              whileTap={{ scale: 0.96 }}
              onClick={() => setRole(opt.r)}
              className="flex w-full items-start gap-4 rounded-2xl bg-surface-container-lowest p-6 text-left shadow-sm hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">{opt.icon}</div>
              <div>
                <h3 className="font-bold font-headline text-on-surface text-lg">{opt.title}</h3>
                <p className="mt-0.5 text-sm text-on-surface-variant">{opt.desc}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // FREELANCER FLOW (single step)
  // ═══════════════════════════════════════════
  if (!isCompany) {
    return (
      <div className="min-h-screen bg-background px-5 pb-10">
        <button onClick={() => navigate(-1)} className="py-4 text-on-surface-variant"><ArrowLeft size={22} /></button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
          <h2 className="text-2xl font-extrabold font-headline text-on-surface">Complete seu perfil</h2>
          <p className="mt-1 text-on-surface-variant">Informações pessoais</p>
          
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer">
              <div className="h-28 w-28 rounded-full bg-surface-container-low border-4 border-background shadow-md flex items-center justify-center overflow-hidden">
                {freelancerAvatarPreview ? (
                  <img src={freelancerAvatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <Upload size={32} className="text-on-surface-variant/40" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-container hover:text-on-primary-container transition-colors">
                <Upload size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, 'freelancer')} />
              </label>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">Sua foto de perfil</span>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className={labelClass}>Nome completo</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99988-7766" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Habilidades</label>
              <div className="flex flex-wrap gap-2">
                {rankedSkillOptions.map((skill) => (
                  <motion.button key={skill} whileTap={{ scale: 0.93 }} onClick={() => toggleSkill(skill)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && <X size={14} />}
                  </motion.button>
                ))}
                {selectedSkills.filter((s) => !defaultSkillOptions.includes(s)).map((skill) => (
                  <motion.button key={skill} whileTap={{ scale: 0.93 }} onClick={() => toggleSkill(skill)}
                    className="flex items-center gap-1.5 rounded-full bg-secondary-container text-on-secondary-container px-4 py-2.5 text-sm font-medium"
                  >
                    {skill}<X size={14} />
                  </motion.button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input value={customSkill} onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  placeholder="Adicionar outra habilidade..." maxLength={30} className={`${inputClass} h-11 text-sm`} />
                <button onClick={addCustomSkill} disabled={!customSkill.trim()}
                  className="h-11 w-11 shrink-0 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest disabled:opacity-40 transition-all">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.96 }} className="mt-8">
            <button onClick={handleSave} disabled={saving || updateProfile.isPending}
              className="w-full h-14 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {saving || updateProfile.isPending ? 'Salvando...' : 'Salvar e continuar'}
              <ArrowRight size={20} />
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // COMPANY FLOW (4 steps)
  // ═══════════════════════════════════════════
  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl flex justify-between items-center px-6 md:px-8 h-16 md:h-20">
        <span className="text-xl md:text-2xl font-black text-primary tracking-tighter font-headline">VaptVaga</span>
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <div className="flex min-h-screen pt-16 md:pt-20">
        {/* Side Nav (desktop) */}
        <aside className="hidden md:flex flex-col fixed left-0 top-0 pt-24 pb-8 h-screen w-72 bg-surface-container-low z-40">
          <div className="px-8 mb-10">
            <h2 className="font-headline font-bold text-on-surface text-xl">Onboarding</h2>
            <p className="text-sm text-on-surface-variant">Etapa {step + 1} de 4</p>
          </div>
          <nav className="flex flex-col gap-2">
            {COMPANY_STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <button key={s.id} onClick={() => i <= step && setStep(i)}
                  className={`flex items-center gap-4 mx-4 px-6 py-4 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                      : isCompleted
                        ? 'text-on-surface-variant opacity-60 hover:bg-surface-container-highest'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check size={20} className="text-secondary" />
                  ) : (
                    <Icon size={20} />
                  )}
                  <span className="font-headline font-medium text-sm">{s.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Bottom Nav (mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl md:hidden flex justify-around items-center py-3 px-6 z-50 border-t border-outline/10">
          {COMPANY_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <button key={s.id} onClick={() => i <= step && setStep(i)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-on-surface-variant/40'
                }`}
              >
                {isCompleted && !isActive ? <Check size={20} /> : <Icon size={20} />}
                <span className="text-[10px] font-bold font-headline">{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 md:ml-72 p-6 md:p-12 lg:p-20 pb-24 md:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              {/* ─── STEP 1: IDENTITY ─── */}
              {step === 0 && (
                <div>
                  <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
                      Bem-vindo ao VaptVaga para Empresas!
                    </h1>
                    <p className="mt-3 text-on-surface-variant text-lg max-w-lg leading-relaxed">
                      Precisamos de algumas informações básicas para validar a identidade do seu negócio.
                    </p>
                  </header>

                  <div className="bg-surface-container-lowest p-6 md:p-10 rounded-2xl shadow-sm space-y-6">
                    <div>
                      <label className={labelClass}>Nome Fantasia</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: VaptVaga Soluções LTDA" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>CNPJ</label>
                      <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Segmento</label>
                      <select value={segmento} onChange={(e) => setSegmento(e.target.value)}
                        className={`${inputClass} appearance-none cursor-pointer`}>
                        <option value="">Selecione um segmento</option>
                        {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Cidade</label>
                        <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Sua cidade" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Estado</label>
                        <select value={estado} onChange={(e) => setEstado(e.target.value)}
                          className={`${inputClass} appearance-none cursor-pointer`}>
                          <option value="">UF</option>
                          {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>WhatsApp</label>
                      <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99988-7766" className={inputClass} />
                    </div>
                  </div>

                  {/* Logo and Banner Upload */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface-container-low p-6 rounded-2xl text-center flex flex-col items-center">
                      <h4 className="font-bold font-headline text-on-surface mb-4">Logotipo da Empresa</h4>
                      <div className="relative group cursor-pointer inline-block">
                        <div className="w-32 h-32 rounded-full bg-surface-container-lowest border-4 border-dashed border-outline/20 flex flex-col items-center justify-center gap-2 group-hover:border-primary/40 transition-colors overflow-hidden">
                          {companyLogoPreview ? (
                            <img src={companyLogoPreview} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Upload size={24} className="text-primary-container" />
                              <span className="text-[10px] font-bold font-headline text-on-surface-variant">Upload Logo</span>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImagePick(e, 'logo')} />
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-4">Redondo. Máximo 5MB.</p>
                    </div>

                    <div className="bg-surface-container-low p-6 rounded-2xl text-center flex flex-col items-center">
                      <h4 className="font-bold font-headline text-on-surface mb-4">Banner da Empresa</h4>
                      <div className="relative group cursor-pointer inline-block w-full">
                        <div className="w-full h-32 rounded-2xl bg-surface-container-lowest border-4 border-dashed border-outline/20 flex flex-col items-center justify-center gap-2 group-hover:border-primary/40 transition-colors overflow-hidden">
                          {companyBannerPreview ? (
                            <img src={companyBannerPreview} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Upload size={24} className="text-primary-container" />
                              <span className="text-[10px] font-bold font-headline text-on-surface-variant">Upload Banner</span>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImagePick(e, 'banner')} />
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-4">Retangular (16:9). Máximo 5MB.</p>
                    </div>
                  </div>

                  {/* Info card */}
                  <div className="mt-6 bg-secondary-container/20 p-5 rounded-2xl flex items-center gap-5">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary shrink-0">
                      <Check size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold font-headline text-on-surface text-sm">Verificação Instantânea</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        Consulta automática do CNPJ junto à Receita Federal para acelerar sua aprovação.
                      </p>
                    </div>
                  </div>

                  <div className="mt-10">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={nextStep}
                      className="w-full md:w-auto md:px-12 h-14 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                      Continuar para Detalhes <ArrowRight size={20} />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: BUSINESS DETAILS ─── */}
              {step === 1 && (
                <div>
                  <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
                      Conte mais sobre o seu negócio
                    </h1>
                    <p className="mt-3 text-on-surface-variant text-lg max-w-lg">
                      Isso nos ajuda a encontrar os melhores talentos para o seu perfil operacional.
                    </p>
                  </header>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className={labelClass}>Breve descrição da empresa</label>
                      <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Ex: Hamburgueria artesanal com foco em delivery" rows={3}
                        className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest rounded-2xl p-6 text-on-surface placeholder:text-outline transition-all font-body outline-none resize-none" />
                    </div>

                    <div className="space-y-3">
                      <label className={labelClass}>Tipo de Estabelecimento</label>
                      <select value={tipoEstabelecimento} onChange={(e) => setTipoEstabelecimento(e.target.value)}
                        className={`${inputClass} appearance-none cursor-pointer`}>
                        <option value="">Selecione uma opção...</option>
                        {ESTABLISHMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className={labelClass}>Dias de maior movimento</label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map((day) => (
                          <button key={day} onClick={() => toggleDay(day)}
                            className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                              diasMovimento.includes(day)
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className={labelClass}>Horário de Pico</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input type="time" value={horaPicoInicio} onChange={(e) => setHoraPicoInicio(e.target.value)}
                            className={inputClass} />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-outline font-bold uppercase pointer-events-none">Das</span>
                        </div>
                        <span className="text-on-surface-variant font-medium text-sm">até às</span>
                        <div className="flex-1 relative">
                          <input type="time" value={horaPicoFim} onChange={(e) => setHoraPicoFim(e.target.value)}
                            className={inputClass} />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-outline font-bold uppercase pointer-events-none">Às</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 space-y-4">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={nextStep}
                      className="w-full h-16 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                      Continuar para Pagamento <ArrowRight size={20} />
                    </motion.button>
                    <button onClick={prevStep} className="flex items-center justify-center gap-2 w-full text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">
                      <ArrowLeft size={16} /> Voltar para Identificação
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: PAYMENT ─── */}
              {step === 2 && (
                <div>
                  <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
                      Escolha seu Plano e Pagamento
                    </h1>
                    <p className="mt-3 text-on-surface-variant text-lg">
                      Aproveite o acesso Beta com condições especiais.
                    </p>
                  </header>

                  {/* Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Free */}
                    <button onClick={() => setSelectedPlan('free')}
                      className={`bg-surface-container-lowest p-8 rounded-2xl flex flex-col text-left transition-all ${
                        selectedPlan === 'free' ? 'ring-2 ring-primary' : 'ring-1 ring-outline/10'
                      }`}>
                      <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-widest uppercase">PLANO INICIAL</span>
                      <h3 className="font-headline text-xl font-bold mt-2">Empresa Grátis</h3>
                      <div className="flex items-baseline mt-3">
                        <span className="text-3xl font-extrabold text-on-surface tracking-tighter">R$ 0</span>
                        <span className="text-on-surface-variant ml-2 text-sm">/mês</span>
                      </div>
                      <ul className="space-y-3 mt-6 mb-6 flex-grow">
                        {['1 postagem mensal', 'Ver 1 candidato por post'].map((f) => (
                          <li key={f} className="flex items-center gap-3 text-on-surface-variant text-sm">
                            <Check size={16} className="text-secondary shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <div className={`w-full py-3 rounded-full font-bold text-center text-sm ${
                        selectedPlan === 'free' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {selectedPlan === 'free' ? 'Selecionado' : 'Selecionar'}
                      </div>
                    </button>

                    {/* Premium */}
                    <button onClick={() => setSelectedPlan('premium')}
                      className={`bg-surface-container-lowest p-8 rounded-2xl flex flex-col text-left relative transition-all ${
                        selectedPlan === 'premium' ? 'ring-2 ring-primary' : 'ring-1 ring-outline/10'
                      }`}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl shadow-primary/30">
                        Recomendado
                      </div>
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase">BETA EXCLUSIVE</span>
                      <h3 className="font-headline text-xl font-bold mt-2">Empresa Premium (Beta)</h3>
                      <div className="flex items-baseline mt-3">
                        <span className="text-3xl font-extrabold text-on-surface tracking-tighter">R$ 49,90</span>
                        <span className="text-on-surface-variant ml-2 text-sm">/mês</span>
                      </div>
                      <ul className="space-y-3 mt-6 mb-6 flex-grow">
                        {['Postagens ilimitadas', 'WhatsApp liberado para todos', 'Suporte prioritário 24/7'].map((f) => (
                          <li key={f} className="flex items-center gap-3 text-on-surface text-sm">
                            <Check size={16} className="text-secondary shrink-0" /> <span className="font-medium">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className={`w-full py-3 rounded-full font-bold text-center text-sm ${
                        selectedPlan === 'premium' ? 'bg-primary text-on-primary' : 'bg-gradient-to-r from-primary to-primary-container text-on-primary'
                      }`}>
                        {selectedPlan === 'premium' ? 'Selecionado' : 'Selecionar Premium'}
                      </div>
                    </button>
                  </div>

                  {/* Payment Method */}
                  {selectedPlan === 'premium' && (
                    <div className="bg-surface-container-low p-6 md:p-10 rounded-2xl mb-8">
                      <h2 className="font-headline text-xl font-bold mb-6 flex items-center gap-3">
                        <CreditCard size={22} className="text-primary" /> Método de Pagamento
                      </h2>
                      <div className="flex gap-3 mb-8">
                        <button onClick={() => setPaymentMethod('card')}
                          className={`flex-1 py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                            paymentMethod === 'card' ? 'bg-surface-container-lowest border-2 border-primary text-on-surface' : 'bg-surface-container-lowest border-2 border-transparent text-on-surface-variant hover:border-outline/20'
                          }`}>
                          <CreditCard size={18} /> Cartão de Crédito
                        </button>
                        <button onClick={() => setPaymentMethod('pix')}
                          className={`flex-1 py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                            paymentMethod === 'pix' ? 'bg-surface-container-lowest border-2 border-primary text-on-surface' : 'bg-surface-container-lowest border-2 border-transparent text-on-surface-variant hover:border-outline/20'
                          }`}>
                          <QrCode size={18} /> PIX
                        </button>
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="md:col-span-2">
                            <label className={labelClass}>Número do Cartão</label>
                            <input placeholder="0000 0000 0000 0000" className={`${inputClass} ring-1 ring-outline/10`} />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Nome Impresso no Cartão</label>
                            <input placeholder="EX: JOÃO S SILVA" className={`${inputClass} ring-1 ring-outline/10 uppercase`} />
                          </div>
                          <div>
                            <label className={labelClass}>Validade (MM/AA)</label>
                            <input placeholder="MM/AA" className={`${inputClass} ring-1 ring-outline/10 text-center`} />
                          </div>
                          <div>
                            <label className={labelClass}>CVV</label>
                            <input placeholder="123" className={`${inputClass} ring-1 ring-outline/10 text-center`} />
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'pix' && (
                        <div className="text-center py-8">
                          <div className="w-48 h-48 bg-surface-container-lowest rounded-2xl mx-auto flex items-center justify-center border-2 border-dashed border-outline/20">
                            <QrCode size={64} className="text-on-surface-variant/30" />
                          </div>
                          <p className="mt-4 text-on-surface-variant text-sm">O QR Code será gerado após a confirmação.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-10 flex flex-col md:flex-row md:justify-between gap-4">
                    <button onClick={prevStep} className="flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm order-2 md:order-1">
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={nextStep}
                      className="h-14 px-12 bg-primary text-on-primary rounded-full font-headline font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 order-1 md:order-2">
                      Continuar para Documentos <ArrowRight size={20} />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* ─── STEP 4: DOCUMENTS ─── */}
              {step === 3 && (
                <div>
                  <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
                      Documentos e Verificação
                    </h1>
                    <p className="mt-3 text-on-surface-variant text-lg max-w-lg">
                      Envie os documentos necessários para ativar seu perfil. Isso garante a segurança de todos na plataforma.
                    </p>
                  </header>

                  <div className="space-y-6">
                    {[
                      { title: 'Contrato Social ou MEI', desc: 'PDF ou imagem do documento de constituição da empresa.' },
                      { title: 'Comprovante de Endereço', desc: 'Conta de luz, água ou telefone (últimos 3 meses).' },
                      { title: 'Documento do Responsável', desc: 'RG ou CNH do responsável legal da empresa.' },
                    ].map((doc) => (
                      <div key={doc.title} className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-5 ring-1 ring-outline/10">
                        <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-primary shrink-0">
                          <Upload size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold font-headline text-on-surface text-sm">{doc.title}</h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">{doc.desc}</p>
                        </div>
                        <button className="px-5 py-2.5 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-bold hover:bg-surface-container-highest transition-all">
                          Enviar
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-secondary-container/20 p-5 rounded-2xl flex items-start gap-4">
                    <Check size={20} className="text-secondary mt-0.5 shrink-0" />
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Seus documentos são analisados em até <strong>24 horas</strong>. Você receberá uma notificação assim que seu perfil for aprovado.
                    </p>
                  </div>

                  <div className="mt-10 space-y-4">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving || updateProfile.isPending}
                      className="w-full h-16 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60">
                      {saving || updateProfile.isPending ? 'Salvando...' : 'Finalizar Cadastro'}
                      {!(saving || updateProfile.isPending) && <Check size={20} />}
                    </motion.button>
                    <button onClick={prevStep} className="flex items-center justify-center gap-2 w-full text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">
                      <ArrowLeft size={16} /> Voltar para Pagamento
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {croppingImageSrc && (
        <ImageCropper
          imageSrc={croppingImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCroppingImageSrc(null);
            setCroppingTarget(null);
          }}
          cropShape={croppingTarget === 'banner' ? 'rect' : 'round'}
          aspect={croppingTarget === 'banner' ? 16 / 9 : 1}
        />
      )}
    </div>
  );
};

export default Onboarding;
