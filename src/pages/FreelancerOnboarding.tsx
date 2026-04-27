import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ImageCropper } from '../components/common/ImageCropper';

const SKILL_OPTIONS = [
  'Atendimento ao Cliente', 'Barista', 'Garçom', 'Caixa', 'Auxiliar de Cozinha',
  'Limpeza', 'Estoquista', 'Bartender', 'Recepcionista', 'Segurança',
  'Promotor de Vendas', 'Manobrista', 'Copeiro', 'Churrasqueiro', 'Confeiteiro',
];

const ESTADOS_BR = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA',
  'PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

const STEPS = [
  { id: 'identity', label: 'Identidade', icon: 'person' },
  { id: 'experience', label: 'Experiência', icon: 'work' },
  { id: 'portfolio', label: 'Portfólio', icon: 'folder_shared' },
  { id: 'review', label: 'Revisão', icon: 'fact_check' },
];

interface Experience {
  empresa: string;
  cargo: string;
  inicio: string;
  fim: string;
}

export const FreelancerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { profile, session, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Identity
  const [nome, setNome] = useState(profile?.name || '');
  const [tituloProfissional, setTituloProfissional] = useState((profile as any)?.titulo_profissional || '');
  const [bio, setBio] = useState((profile as any)?.bio || '');
  const [estado, setEstado] = useState(profile?.estado || '');
  const [cidade, setCidade] = useState(profile?.cidade || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>((profile as any)?.experiencias || [{ empresa: '', cargo: '', inicio: '', fim: '' }]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile?.skills || []);
  const [customSkill, setCustomSkill] = useState('');

  // Portfolio
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url || '');
  const [instagram, setInstagram] = useState((profile as any)?.instagram || '');
  const [linkedin, setLinkedin] = useState(''); // LinkedIn is merged into portfolio_url but we keep state if needed.

  const { data: skillRankings } = useQuery({
    queryKey: ['skill_rankings'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_skill_rankings');
      return data || [];
    },
  });

  const rankedSkillOptions = useMemo(() => {
    const rankedNames = (skillRankings || []).map((s: any) => s.skill);
    const sorted = [...SKILL_OPTIONS].sort((a, b) => {
      const ai = rankedNames.indexOf(a);
      const bi = rankedNames.indexOf(b);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return sorted;
  }, [skillRankings]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, { empresa: '', cargo: '', inicio: '', fim: '' }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setExperiences(prev => prev.map((exp, i) => i === index ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImageSrc(imageUrl);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedFile: File, croppedUrl: string) => {
    setAvatarFile(croppedFile);
    setAvatarPreview(croppedUrl);
    setSelectedImageSrc(null);
  };

  const handleCropCancel = () => {
    setSelectedImageSrc(null);
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      alert('Você precisa estar logado para salvar seu perfil. Redirecionando para o login...');
      navigate('/login');
      return;
    }
    setLoading(true);

    try {
      let avatarUrl = avatarPreview;

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${session.user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Upsert profile to guarantee it saves even if the row was somehow missing
      // Add retry logic for Supabase lock token error
      let saveError;
      for (let i = 0; i < 3; i++) {
        const { error } = await (supabase.from('profiles') as any).upsert({
          id: session.user.id,
          role: profile?.role || 'freelancer',
          name: nome,
          avatar_url: avatarUrl,
          skills: selectedSkills,
          estado,
          cidade,
          portfolio_url: portfolioUrl || linkedin || null,
          bio: bio,
          titulo_profissional: tituloProfissional,
          instagram: instagram,
          experiencias: experiences,
        });
        
        saveError = error;
        if (!error || !error.message.includes('Lock')) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (saveError) {
        console.error('Error in upsert:', saveError);
        alert(`Erro ao salvar no banco: ${saveError.message}`);
        setLoading(false);
        return;
      }

      await refreshProfile();
      navigate('/freelancer/dashboard');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      alert(`Erro ao salvar perfil: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div className="bg-surface min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col p-6 bg-surface-container-low border-r border-outline-variant/10 z-40">
        <div className="mb-12">
          <span className="text-2xl font-bold text-primary tracking-tighter font-headline">VaptVaga</span>
          <div className="mt-4">
            <p className="text-sm font-bold text-on-surface uppercase tracking-widest">Onboarding</p>
            <p className="text-xs text-on-surface-variant font-medium mt-1">Etapa {step + 1} de {STEPS.length}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex items-center gap-4 px-6 py-4 rounded-full transition-all text-left ${
                i === step
                  ? 'bg-primary text-on-primary shadow-sm'
                  : i < step
                    ? 'text-secondary hover:bg-surface-container-highest/50'
                    : 'text-on-surface-variant hover:bg-surface-container-highest/50'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={i === step || i < step ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {i < step ? 'check_circle' : s.icon}
              </span>
              <span className={`text-sm ${i === step ? 'font-bold' : 'font-medium'}`}>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold font-headline">{nome || 'Freelancer'}</span>
              <span className="text-xs text-on-surface-variant">Completando perfil</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-10 bg-surface/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <span className="font-headline text-xl font-black text-primary tracking-tighter">VaptVaga</span>
          <span className="text-sm text-on-surface-variant font-bold">Etapa {step + 1}/{STEPS.length}</span>
        </header>

        {/* Mobile Step Indicators */}
        <div className="lg:hidden px-6 py-3 flex gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i <= step ? 'bg-primary' : 'bg-outline-variant/30'
              }`}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          <AnimatePresence mode="wait">
              {/* Step 0: Identity */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <header className="mb-10">
                    <div className="flex items-center gap-2 text-primary font-bold mb-3">
                      <span className="text-sm tracking-widest uppercase">Etapa 01</span>
                      <div className="h-1 w-12 bg-primary-container rounded-full" />
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-3">
                      Bem-vindo ao VaptVaga!
                    </h2>
                    <p className="text-on-surface-variant text-base lg:text-lg max-w-2xl">
                      Vamos criar seu perfil profissional. Essas informações ajudarão os contratantes a encontrar você.
                    </p>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-6">
                      <div className="bg-surface-container-low p-6 lg:p-10 rounded-xl space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold font-headline ml-1 text-on-surface-variant">Nome Completo</label>
                            <input
                              className="w-full px-5 py-4 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 font-medium"
                              value={nome}
                              onChange={e => setNome(e.target.value)}
                              placeholder="Ex: João Silva"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold font-headline ml-1 text-on-surface-variant">Título Profissional</label>
                            <input
                              className="w-full px-5 py-4 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 font-medium"
                              value={tituloProfissional}
                              onChange={e => setTituloProfissional(e.target.value)}
                              placeholder="Ex: Barman / Garçom"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold font-headline ml-1 text-on-surface-variant">Bio / Sobre mim</label>
                          <textarea
                            className="w-full px-5 py-4 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 font-medium resize-none"
                            rows={4}
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Conte um pouco sobre sua experiência..."
                          />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold font-headline ml-1 text-on-surface-variant">Estado</label>
                            <div className="relative">
                              <select
                                className="w-full appearance-none px-5 py-4 bg-surface-container-lowest bg-none border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface font-medium cursor-pointer pr-12"
                                value={estado}
                                onChange={e => setEstado(e.target.value)}
                              >
                                <option value="">Selecione</option>
                                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                              </select>
                              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold font-headline ml-1 text-on-surface-variant">Cidade</label>
                            <input
                              className="w-full px-5 py-4 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 font-medium"
                              value={cidade}
                              onChange={e => setCidade(e.target.value)}
                              placeholder="Ex: São Paulo"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32">
                      <div className="bg-surface-container-low p-6 lg:p-8 rounded-xl flex flex-col items-center text-center">
                        <h3 className="text-xl font-bold font-headline mb-6">Foto de Perfil</h3>
                        <div className="relative group cursor-pointer mb-6">
                          <div className="w-36 h-36 lg:w-48 lg:h-48 rounded-full bg-surface-container-highest border-4 border-surface-container-lowest overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-on-surface-variant/30 text-6xl">add_a_photo</span>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50" />
                              </>
                            )}
                          </div>
                          <label className="absolute bottom-2 right-2 w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary-container transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">edit</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                          </label>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-4 px-4">
                          Use uma foto frontal, nítida e com fundo neutro.
                        </p>
                      </div>

                      <div className="mt-6 bg-secondary-container/20 p-5 rounded-xl border border-secondary/10">
                        <div className="flex gap-3 items-start">
                          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface text-sm mb-1">Dica Pro</h4>
                            <p className="text-xs leading-relaxed text-on-surface-variant">
                              Perfis com fotos profissionais e bios detalhadas têm 3x mais chances de serem selecionados.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Experience & Skills */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <header className="mb-10">
                    <div className="flex items-center gap-2 text-primary font-bold mb-3">
                      <span className="text-sm tracking-widest uppercase">Etapa 02</span>
                      <div className="h-1 w-12 bg-primary-container rounded-full" />
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-3">
                      Sua Experiência e Habilidades
                    </h2>
                    <p className="text-on-surface-variant text-base lg:text-lg max-w-2xl">
                      Conte-nos sobre sua trajetória profissional. Isso ajuda as empresas a encontrarem o perfil ideal.
                    </p>
                  </header>

                  <div className="space-y-6">
                    {experiences.map((exp, i) => (
                      <section key={i} className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm border border-outline-variant/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-container" />
                        {experiences.length > 1 && (
                          <button
                            onClick={() => removeExperience(i)}
                            className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">close</span>
                          </button>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Empresa</label>
                            <input
                              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                              value={exp.empresa}
                              onChange={e => updateExperience(i, 'empresa', e.target.value)}
                              placeholder="Nome da empresa"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Cargo</label>
                            <input
                              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                              value={exp.cargo}
                              onChange={e => updateExperience(i, 'cargo', e.target.value)}
                              placeholder="Seu cargo"
                            />
                          </div>
                          <div className="lg:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Período</label>
                            <div className="flex flex-col lg:flex-row gap-4">
                              <input
                                className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                                value={exp.inicio}
                                onChange={e => updateExperience(i, 'inicio', e.target.value)}
                                placeholder="Ex: Jan 2021"
                              />
                              <div className="flex items-center justify-center text-outline font-bold">até</div>
                              <input
                                className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                                value={exp.fim}
                                onChange={e => updateExperience(i, 'fim', e.target.value)}
                                placeholder="Ex: Atualmente"
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    ))}

                    <button
                      onClick={addExperience}
                      className="flex items-center justify-center gap-3 w-full py-5 rounded-xl border-2 border-dashed border-primary/30 text-primary font-bold hover:bg-primary/5 transition-all active:scale-[0.98] group"
                    >
                      <span className="material-symbols-outlined transition-transform group-hover:rotate-90">add</span>
                      <span>Adicionar outra experiência</span>
                    </button>

                    {/* Skills */}
                    <section className="mt-8">
                      <h3 className="text-xl lg:text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
                        Habilidades Principais
                        <span className="text-xs bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-bold uppercase tracking-tighter">Essencial</span>
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {rankedSkillOptions.map(skill => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={`px-5 py-3 rounded-full flex items-center gap-2 text-sm font-bold tracking-tight transition-all active:scale-95 ${
                              selectedSkills.includes(skill)
                                ? 'bg-primary text-on-primary shadow-md hover:brightness-110'
                                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                            }`}
                          >
                            {selectedSkills.includes(skill) && (
                              <span className="material-symbols-outlined text-sm">check</span>
                            )}
                            {skill}
                          </button>
                        ))}
                        {/* Custom skills that aren't in the default list */}
                        {selectedSkills
                          .filter(s => !SKILL_OPTIONS.includes(s))
                          .map(skill => (
                            <button
                              key={skill}
                              onClick={() => toggleSkill(skill)}
                              className="bg-primary text-on-primary px-5 py-3 rounded-full flex items-center gap-2 text-sm font-bold shadow-md active:scale-95"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                              {skill}
                            </button>
                          ))}
                        {/* Add custom */}
                        <div className="flex items-center gap-2">
                          <input
                            className="bg-surface-container-low border border-outline-variant/30 rounded-full px-5 py-3 text-sm font-medium text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 w-40"
                            value={customSkill}
                            onChange={e => setCustomSkill(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                            placeholder="Outra habilidade..."
                          />
                          {customSkill && (
                            <button
                              onClick={addCustomSkill}
                              className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Portfolio */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <header className="mb-10">
                    <div className="flex items-center gap-2 text-primary font-bold mb-3">
                      <span className="text-sm tracking-widest uppercase">Etapa 03</span>
                      <div className="h-1 w-12 bg-primary-container rounded-full" />
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-3">
                      Mostre seu talento em ação
                    </h2>
                    <p className="text-on-surface-variant text-base lg:text-lg max-w-2xl">
                      Adicione links e redes sociais para que as empresas possam conhecer melhor o seu trabalho.
                      <span className="text-primary font-semibold"> Perfis completos têm 5x mais chances de serem contratados.</span>
                    </p>
                  </header>

                  <div className="space-y-8">
                    {/* Social Links */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">link</span>
                        <h3 className="text-xl font-bold text-on-surface">Links e Redes Sociais</h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-on-surface-variant ml-2">Instagram</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">@</span>
                            <input
                              className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50"
                              value={instagram}
                              onChange={e => setInstagram(e.target.value)}
                              placeholder="seu_perfil"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-on-surface-variant ml-2">LinkedIn URL</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">work_history</span>
                            <input
                              className="w-full h-14 pl-12 pr-4 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50"
                              value={linkedin}
                              onChange={e => setLinkedin(e.target.value)}
                              placeholder="linkedin.com/in/usuario"
                            />
                          </div>
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                          <label className="block text-sm font-bold text-on-surface-variant ml-2">Portfólio / Site pessoal</label>
                          <input
                            className="w-full h-14 px-5 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50"
                            value={portfolioUrl}
                            onChange={e => setPortfolioUrl(e.target.value)}
                            placeholder="https://meusite.com"
                          />
                        </div>
                      </div>
                    </section>

                    <div className="bg-secondary-container/20 p-6 rounded-xl border border-secondary/10">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface text-sm mb-1">Dica</h4>
                          <p className="text-xs leading-relaxed text-on-surface-variant">
                            Ter perfis em redes sociais ativas e um portfólio ajuda empresas a visualizarem suas habilidades na prática.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <header className="mb-10">
                    <div className="flex items-center gap-2 text-primary font-bold mb-3">
                      <span className="text-sm tracking-widest uppercase">Etapa 04</span>
                      <div className="h-1 w-12 bg-primary-container rounded-full" />
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-3">
                      Revisão Final
                    </h2>
                    <p className="text-on-surface-variant text-base lg:text-lg">
                      Confirme os detalhes do seu perfil antes de publicá-lo.
                    </p>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                      {/* Profile Header */}
                      <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl flex flex-col lg:flex-row items-center gap-6 shadow-sm">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center shrink-0 ring-4 ring-secondary-container">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant text-4xl">person</span>
                          )}
                        </div>
                        <div className="text-center lg:text-left">
                          <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">{nome || 'Seu Nome'}</h3>
                          {tituloProfissional && <p className="text-primary font-semibold text-lg">{tituloProfissional}</p>}
                          {(cidade || estado) && (
                            <div className="flex items-center gap-2 mt-2 text-on-surface-variant justify-center lg:justify-start">
                              <span className="material-symbols-outlined text-base">location_on</span>
                              <span className="text-sm font-medium">{[cidade, estado].filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Bio */}
                      {bio && (
                        <section className="bg-surface-container-low p-6 lg:p-8 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold text-on-surface">Bio</h4>
                            <button onClick={() => setStep(0)} className="material-symbols-outlined text-outline hover:text-primary">edit</button>
                          </div>
                          <p className="text-on-surface-variant leading-relaxed">{bio}</p>
                        </section>
                      )}
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                      {/* Skills */}
                      {selectedSkills.length > 0 && (
                        <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-on-surface">Habilidades</h4>
                            <button onClick={() => setStep(1)} className="material-symbols-outlined text-outline hover:text-primary">edit</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedSkills.map(skill => (
                              <span key={skill} className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-sm font-bold">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Experience */}
                      {experiences.some(e => e.empresa || e.cargo) && (
                        <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-on-surface">Experiência</h4>
                            <button onClick={() => setStep(1)} className="material-symbols-outlined text-outline hover:text-primary">edit</button>
                          </div>
                          <div className="space-y-4">
                            {experiences.filter(e => e.empresa || e.cargo).map((exp, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="w-1 bg-primary rounded-full" />
                                <div>
                                  <h5 className="font-bold text-on-surface">{exp.empresa}</h5>
                                  <p className="text-sm text-on-surface-variant font-medium">
                                    {exp.cargo}{exp.inicio ? ` • ${exp.inicio}` : ''}{exp.fim ? ` - ${exp.fim}` : ''}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          {/* Footer Navigation */}
          <footer className="mt-12 lg:mt-20 flex items-center justify-between pt-8 border-t border-outline-variant/10 pb-32 lg:pb-12">
            {step > 0 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-primary transition-colors group"
              >
                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
                Voltar
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-8 lg:px-12 py-4 lg:py-5 bg-primary text-on-primary font-extrabold text-base lg:text-lg rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                Próximo Passo
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 lg:px-12 py-4 lg:py-5 bg-primary text-on-primary font-extrabold text-base lg:text-lg rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Publicar Perfil
                    <span className="material-symbols-outlined">check_circle</span>
                  </>
                )}
              </button>
            )}
          </footer>
        </div>
      </main>

      {/* Image Cropper Modal */}
      {selectedImageSrc && (
        <ImageCropper
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};
