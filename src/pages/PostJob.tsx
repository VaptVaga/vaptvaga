import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Utensils,
  Store,
  Sparkles,
  PartyPopper,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Rocket,
  Lightbulb,
  Zap,
  Bus,
  Shirt,
  LocateFixed,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { LocationMap } from '@/components/vaptvaga/LocationMap';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateJob, useMonthlyJobCount } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';
import {
  type GeoCoordinates,
  detectUserLocation,
  resolveCoordinates,
  isValidCoordinate,
} from '@/lib/geolocation';

const CATEGORIES = [
  { id: 'Gastronomia & Salão', label: 'Gastronomia', icon: Utensils, suggested: 'R$ 160 - R$ 240' },
  { id: 'Varejo & Lojas', label: 'Varejo', icon: Store, suggested: 'R$ 130 - R$ 180' },
  { id: 'Limpeza', label: 'Limpeza', icon: Sparkles, suggested: 'R$ 120 - R$ 170' },
  { id: 'Eventos & Festas', label: 'Eventos', icon: PartyPopper, suggested: 'R$ 180 - R$ 290' },
  { id: 'Logística & Entregas', label: 'Logística', icon: Truck, suggested: 'R$ 150 - R$ 210' },
];

const BENEFIT_OPTIONS = [
  { id: 'Vale Transporte / Uber', label: 'Vale Transporte / Uber', icon: Bus },
  { id: 'Refeição no Local', label: 'Refeição no Local', icon: Utensils },
  { id: 'Uniforme Fornecido', label: 'Uniforme Fornecido', icon: Shirt },
];

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const TOMORROW_ISO = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

const PostJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, user } = useAuth();
  const isFree = profile?.subscriber !== 'premium';
  const [showPaywall, setShowPaywall] = useState(false);
  const { data: monthlyJobCount = 0 } = useMonthlyJobCount(user?.id);
  const createJob = useCreateJob();

  const [step, setStep] = useState<0 | 1 | 2>(0);

  const paramDate = searchParams.get('date');
  const initialDate =
    paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate) ? paramDate : TODAY_ISO;

  // Step 1: Details
  const [title, setTitle] = useState('');
  const [classificacao, setClassificacao] = useState('Gastronomia & Salão');
  const [description, setDescription] = useState('');
  const [cidade, setCidade] = useState(profile?.cidade || 'Belo Horizonte');
  const [bairro, setBairro] = useState(profile?.bairro || '');
  const [customCoords, setCustomCoords] = useState<GeoCoordinates | null>(
    isValidCoordinate(profile?.latitude) && isValidCoordinate(profile?.longitude)
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : null
  );
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  const resolvedCoords = useMemo(
    () => customCoords || resolveCoordinates({ bairro, cidade }),
    [customCoords, bairro, cidade]
  );

  const handleDetectGps = async () => {
    setIsLocatingGps(true);
    try {
      const detected = await detectUserLocation();
      setCustomCoords({ latitude: detected.latitude, longitude: detected.longitude });
      if (detected.cidade) setCidade(detected.cidade);
      if (detected.bairro) setBairro(detected.bairro);
      toast({
        title: '📍 Localização detectada pelo GPS!',
        description:
          [detected.bairro, detected.cidade].filter(Boolean).join(', ') ||
          'Pino atualizado no mapa.',
      });
    } catch (err: unknown) {
      toast({
        title: 'Não foi possível detectar via GPS',
        description: err instanceof Error ? err.message : 'Digite cidade e bairro manualmente.',
        variant: 'destructive',
      });
    } finally {
      setIsLocatingGps(false);
    }
  };

  // Step 2: Logistics & Pay
  const todayIso = TODAY_ISO;
  const tomorrowIso = TOMORROW_ISO;
  const [shiftDate, setShiftDate] = useState(initialDate);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('00:00');
  const [budget, setBudget] = useState('180');
  const [benefits, setBenefits] = useState<string[]>(['Refeição no Local']);

  // Step 3: Terms
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const selectedCategoryInfo =
    CATEGORIES.find((c) => c.id === classificacao) || CATEGORIES[0];

  const toggleBenefit = (benefit: string) => {
    setBenefits((prev) =>
      prev.includes(benefit) ? prev.filter((b) => b !== benefit) : [...prev, benefit]
    );
  };

  const handleNext = () => {
    if (step === 0) {
      if (!title.trim()) {
        toast({ title: 'Informe o título da vaga', variant: 'destructive' });
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!budget || Number(budget) <= 0) {
        toast({ title: 'Informe o valor da diária', variant: 'destructive' });
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFree && monthlyJobCount >= 1) {
      setShowPaywall(true);
      return;
    }
    if (!acceptedTerms) {
      toast({
        title: 'Confirme os termos de publicação',
        variant: 'destructive',
      });
      return;
    }

    const fullDescription = [
      description.trim() || `Turno de ${classificacao} das ${startTime} às ${endTime}.`,
      benefits.length > 0 ? `Benefícios: ${benefits.join(', ')}.` : '',
      `Horário: ${startTime} às ${endTime}.`,
    ]
      .filter(Boolean)
      .join(' ');

    try {
      await createJob.mutateAsync({
        company_id: user.id,
        title: title.trim(),
        budget: `R$ ${budget}`,
        valor_da_diaria: Number(budget) || null,
        required_skills: [classificacao],
        description: fullDescription,
        status: 'open',
        cidade: cidade.trim() || profile?.cidade || 'Belo Horizonte',
        bairro: bairro.trim() || profile?.bairro || '',
        latitude: resolvedCoords.latitude,
        longitude: resolvedCoords.longitude,
        data_do_turno: shiftDate || todayIso,
      });
      toast({
        title: '🎉 Vaga publicada com sucesso!',
        description: 'Freelancers da região já podem se candidatar em 1 clique.',
      });
      navigate('/company/dashboard');
    } catch (err: unknown) {
      toast({
        title: 'Erro ao publicar vaga',
        description: err instanceof Error ? err.message : 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const progressPercentage = step === 0 ? 33 : step === 1 ? 66 : 100;

  return (
    <div className="min-h-screen bg-transparent font-body">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 lg:py-10">
        {/* Top Progress Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => (step > 0 ? setStep((step - 1) as 0 | 1) : navigate(-1))}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-headline font-bold text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              <span>{step > 0 ? 'Voltar etapa' : 'Voltar ao painel'}</span>
            </button>
            <span className="text-xs font-headline font-extrabold uppercase tracking-widest text-primary">
              Passo {step + 1} de 3 • {progressPercentage}%
            </span>
          </div>

          <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
              {step === 0
                ? 'Publicar Urgência — Detalhes'
                : step === 1
                  ? 'Logística, Horário & Diária'
                  : 'Revisão Final da Vaga'}
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant mt-1">
              {step === 0
                ? 'Descreva o profissional ideal para o turno.'
                : step === 1
                  ? 'Defina data, horário e remuneração via PIX.'
                  : 'Confira como sua vaga aparecerá para os freelancers.'}
            </p>
          </div>
        </div>

        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Form Steps (8 cols) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {/* STEP 0: DETAILS */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/70 shadow-sm space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Título da vaga
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Garçom para Evento Noturno"
                      className="w-full h-14 px-5 rounded-xl bg-surface-container-low border border-outline-variant/50 text-base font-headline font-bold text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Categoria Operacional
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const active = classificacao === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setClassificacao(cat.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl gap-2 transition-all border ${
                              active
                                ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20'
                                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/50 hover:bg-surface-container hover:text-on-surface'
                            }`}
                          >
                            <Icon size={22} />
                            <span className="text-[11px] font-headline font-bold text-center">
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                        Local do Turno no Mapa
                      </span>
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
                        <span>{isLocatingGps ? 'Localizando...' : 'Detectar local pelo GPS'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                          Cidade
                        </label>
                        <input
                          value={cidade}
                          onChange={(e) => {
                            setCustomCoords(null);
                            setCidade(e.target.value);
                          }}
                          placeholder="Ex: Belo Horizonte"
                          className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                          Bairro
                        </label>
                        <input
                          value={bairro}
                          onChange={(e) => {
                            setCustomCoords(null);
                            setBairro(e.target.value);
                          }}
                          placeholder="Ex: Savassi"
                          className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-medium text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    <LocationMap
                      title={profile?.name || 'Local do Turno'}
                      addressLabel={[bairro, cidade].filter(Boolean).join(', ') || 'Belo Horizonte'}
                      latitude={resolvedCoords.latitude}
                      longitude={resolvedCoords.longitude}
                      bairro={bairro}
                      cidade={cidade}
                      heightClassName="h-44"
                      showRouteButtons={false}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Descrição das tarefas & traje
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Ex: Atendimento de salão e retirada de pedidos. Traje: calça preta e camisa preta lisa."
                      className="w-full p-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="h-12 px-8 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm flex items-center gap-2"
                    >
                      <span>Próximo Passo</span>
                      <ArrowRight size={17} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: LOGISTICS & PAY */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/70 shadow-sm space-y-6"
                >
                  <div className="space-y-3">
                    <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Data do Turno
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShiftDate(todayIso)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-headline font-bold border transition-all ${
                          shiftDate === todayIso
                            ? 'bg-tertiary text-on-tertiary border-tertiary shadow-sm'
                            : 'bg-surface-container-low text-on-surface border-outline-variant/60'
                        }`}
                      >
                        ⚡ Hoje (Urgente)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShiftDate(tomorrowIso)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-headline font-bold border transition-all ${
                          shiftDate === tomorrowIso
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-container-low text-on-surface border-outline-variant/60'
                        }`}
                      >
                        Amanhã
                      </button>
                      <input
                        type="date"
                        value={shiftDate}
                        onChange={(e) => setShiftDate(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs font-bold text-on-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                        Início
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-bold text-on-surface"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                        Término
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm font-bold text-on-surface"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Valor da Diária (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-primary">
                        R$
                      </span>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="180"
                        className="w-full h-16 pl-14 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-2xl font-headline font-black text-on-surface focus:bg-surface-container-lowest focus:border-primary outline-none"
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Faixa sugerida para {selectedCategoryInfo.label}:{' '}
                      <strong className="text-on-surface">{selectedCategoryInfo.suggested}</strong>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                      Benefícios Inclusos
                    </label>
                    <div className="space-y-2.5">
                      {BENEFIT_OPTIONS.map((item) => {
                        const Icon = item.icon;
                        const checked = benefits.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-colors ${
                              checked
                                ? 'bg-primary-container/50 border-primary/40'
                                : 'bg-surface-container-low border-outline-variant/50 hover:bg-surface-container'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={18} className={checked ? 'text-primary' : 'text-on-surface-variant'} />
                              <span className="text-sm font-semibold text-on-surface">
                                {item.label}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleBenefit(item.id)}
                              className="w-5 h-5 rounded text-primary border-outline focus:ring-primary"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(0)}
                      className="h-12 px-6 rounded-full border-outline-variant text-on-surface font-bold"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="h-12 px-8 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-sm flex items-center gap-2"
                    >
                      <span>Revisar Vaga</span>
                      <ArrowRight size={17} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: FINAL REVIEW */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/70 shadow-sm space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-extrabold uppercase tracking-wider">
                          Pré-visualização da Vaga
                        </span>
                        <h2 className="text-2xl font-headline font-extrabold text-on-surface mt-2">
                          {title || 'Garçom Freelancer'}
                        </h2>
                        <p className="text-sm text-primary font-semibold mt-0.5">
                          {profile?.name || 'Sua Empresa'} • {classificacao}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="text-xs font-bold text-primary hover:underline shrink-0"
                      >
                        Editar detalhes
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-3">
                        <Calendar size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant">
                            Data e Horário
                          </p>
                          <p className="text-sm font-bold text-on-surface">
                            {new Date(shiftDate).toLocaleDateString('pt-BR')} • {startTime} às{' '}
                            {endTime}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-3">
                        <MapPin size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant">
                            Localização
                          </p>
                          <p className="text-sm font-bold text-on-surface">
                            {[bairro, cidade].filter(Boolean).join(', ') || 'Brasil'}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-primary-container/50 border border-primary/15 flex items-center gap-3 sm:col-span-2">
                        <Zap size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-primary">
                            Valor da Diária
                          </p>
                          <p className="text-xl font-headline font-black text-primary">
                            R$ {budget || '0'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <LocationMap
                      title={profile?.name || 'Local de Apresentação'}
                      addressLabel={[bairro, cidade].filter(Boolean).join(', ') || 'Brasil'}
                      latitude={resolvedCoords.latitude}
                      longitude={resolvedCoords.longitude}
                      bairro={bairro}
                      cidade={cidade}
                      heightClassName="h-44"
                      showRouteButtons={false}
                    />

                    {description && (
                      <div className="pt-4 border-t border-outline-variant/60">
                        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                          Descrição
                        </p>
                        <p className="text-sm text-on-surface leading-relaxed">{description}</p>
                      </div>
                    )}

                    {benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {benefits.map((b) => (
                          <span
                            key={b}
                            className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-start gap-3.5 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                    />
                    <span className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      Declaro que as informações do turno estão corretas e concordo com os{' '}
                      <strong className="text-primary">Termos de Uso</strong> da plataforma VaptVaga.
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="h-12 px-6 rounded-full border-outline-variant text-on-surface font-bold"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={createJob.isPending}
                      className="flex-1 sm:flex-none sm:px-10 h-14 rounded-full bg-primary hover:bg-primary-dark text-on-primary font-headline font-extrabold text-base shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      <Rocket size={18} />
                      <span>
                        {createJob.isPending ? 'Publicando Vaga...' : 'Publicar Vaga Agora'}
                      </span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Live Preview & Tips Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-28">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/70 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-container text-primary font-headline font-black flex items-center justify-center shrink-0">
                  {(profile?.name || 'EM').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-on-surface">
                    {profile?.name || 'Sua Empresa'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary uppercase">
                    <CheckCircle2 size={11} /> Empresa Verificada
                  </span>
                </div>
              </div>

              {/* Mini Preview Card */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Resumo ao Vivo
                </span>
                <p className="font-headline font-bold text-sm text-on-surface line-clamp-1">
                  {title || 'Título da sua vaga'}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {[bairro, cidade].filter(Boolean).join(', ') || 'Cidade'} • {startTime}–{endTime}
                </p>
                <p className="text-lg font-headline font-black text-primary pt-1">
                  R$ {budget || '0'} <span className="text-xs font-normal text-on-surface-variant">/turno</span>
                </p>
              </div>

              <LocationMap
                compact
                addressLabel={[bairro, cidade].filter(Boolean).join(', ') || 'Belo Horizonte'}
                latitude={resolvedCoords.latitude}
                longitude={resolvedCoords.longitude}
                bairro={bairro}
                cidade={cidade}
                heightClassName="h-32"
                showRouteButtons={false}
              />

              <div className="space-y-4 pt-2 border-t border-outline-variant/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-container text-primary shrink-0">
                    <Lightbulb size={16} />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Dica:</strong> Vagas com Vale Transporte e
                    Refeição são preenchidas até <strong>40% mais rápido</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary-container text-secondary shrink-0">
                    <Clock size={16} />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Tempo médio de resposta nesta categoria: <strong>15 a 45 minutos</strong>.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="company" />
    </div>
  );
};

export default PostJob;
