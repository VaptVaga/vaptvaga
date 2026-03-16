import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/authContext';
import { useUpdateProfile } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const defaultSkillOptions = [
  'Garçom', 'Barman', 'Cozinheiro', 'Auxiliar de Cozinha', 'Chapa',
  'Vendedor', 'Operador de Caixa', 'Atendente', 'Faxineiro', 'Copeira',
  'Promotor', 'Hostess', 'Recepcionista', 'Segurança', 'Motoboy',
  'Entregador', 'DJ', 'Fotógrafo', 'Montador', 'Carregador',
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, authUser, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();
  const isCompany = user?.role === 'company';

  const [name, setName] = useState(user?.name || '');
  const [cidade, setCidade] = useState(user?.cidade || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
  const [role, setRole] = useState<'company' | 'freelancer' | null>(user?.role || null);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = async () => {
    if (!authUser) return;
    try {
      await updateProfile.mutateAsync({
        id: authUser.id,
        name,
        cidade,
        telefone,
        role: role || 'freelancer',
        ...(role !== 'company' ? { skills: selectedSkills } : {}),
      });
      await refreshProfile();
      toast({ title: '✅ Perfil salvo!' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    }
  };

  // If no role selected yet and profile has no role, show role picker
  const showRolePicker = !user?.role && !role;

  return (
    <div className="min-h-screen bg-background px-5">
      <button onClick={() => navigate(-1)} className="py-4 text-muted-foreground">
        <ArrowLeft size={22} />
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-black text-foreground">Complete seu perfil</h2>

        {showRolePicker ? (
          <div className="mt-8 space-y-4">
            <p className="text-lg font-bold text-foreground">Como você quer usar o VaptVaga?</p>
            <motion.div whileTap={{ scale: 0.96 }}>
              <button
                onClick={() => setRole('company')}
                className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">🏢</div>
                <div>
                  <h3 className="font-bold text-foreground">Sou Empresa</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">Quero encontrar freelancers</p>
                </div>
              </button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }}>
              <button
                onClick={() => setRole('freelancer')}
                className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-2xl">💼</div>
                <div>
                  <h3 className="font-bold text-foreground">Sou Freelancer</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">Quero encontrar diárias</p>
                </div>
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            <p className="mt-1 text-muted-foreground">
              {(role || user?.role) === 'company' ? 'Informações do seu negócio' : 'Informações pessoais'}
            </p>
            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-foreground">
                  {(role || user?.role) === 'company' ? 'Nome do negócio' : 'Nome completo'}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-foreground">Cidade</label>
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-foreground">WhatsApp</label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99988-7766"
                  className="h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {(role || user?.role) === 'freelancer' && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-foreground">Habilidades</label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                      <motion.button
                        key={skill}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => toggleSkill(skill)}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                          selectedSkills.includes(skill)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        {skill}
                        {selectedSkills.includes(skill) && <X size={14} />}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <motion.div whileTap={{ scale: 0.96 }} className="mt-8 pb-10">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="h-13 w-full rounded-xl text-base font-bold"
              >
                {updateProfile.isPending ? 'Salvando...' : 'Salvar e continuar'}
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
