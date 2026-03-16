import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/authContext';

const skillOptions = ['Garçom', 'Barman', 'Cozinheiro', 'Chapa', 'Vendedor', 'Faxineiro', 'Promotor', 'Hostess', 'Segurança', 'Motoboy'];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const isCompany = user?.role === 'company';

  const [name, setName] = useState(user?.full_name || '');
  const [city, setCity] = useState(user?.city || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = () => {
    updateProfile({
      full_name: name,
      city,
      whatsapp,
      ...(isCompany ? { company_name: companyName } : { skills: selectedSkills }),
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background px-5">
      <button onClick={() => navigate(-1)} className="py-4 text-muted-foreground">
        <ArrowLeft size={22} />
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-black text-foreground">Complete seu perfil</h2>
        <p className="mt-1 text-muted-foreground">
          {isCompany ? 'Informações do seu negócio' : 'Informações pessoais'}
        </p>

        <div className="mt-8 space-y-5">
          {isCompany && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">Nome do negócio</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Restaurante Sabor & Arte"
                className="h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              {isCompany ? 'Nome do responsável' : 'Nome completo'}
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: São Paulo"
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">WhatsApp</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 99988-7766"
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {!isCompany && (
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
          <Button onClick={handleSave} className="h-13 w-full rounded-xl text-base font-bold">
            Salvar e continuar
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
