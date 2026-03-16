import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { useAuth } from '@/lib/authContext';
import { useCreateJob, useMonthlyJobCount } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFree = user?.subscriber !== 'premium';
  const [showPaywall, setShowPaywall] = useState(false);
  const { data: monthlyJobCount = 0 } = useMonthlyJobCount(user?.id);
  const createJob = useCreateJob();

  const [title, setTitle] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

  const categoryOptions = ['Bares/Restaurantes', 'Vendas/Lojas', 'Limpeza', 'Eventos'];

  const handleSubmit = async () => {
    if (!user) return;
    if (isFree && monthlyJobCount >= 1) {
      setShowPaywall(true);
      return;
    }
    if (!title) {
      toast({ title: 'Preencha o título', variant: 'destructive' });
      return;
    }
    try {
      await createJob.mutateAsync({
        employer_id: user.id,
        title,
        classificacao,
        budget: budget ? `R$ ${budget}` : null,
        description,
        status: 'open',
        cidade: user.cidade,
        bairro: user.bairro,
      });
      toast({ title: '🎉 Vaga publicada!', description: 'Freelancers já podem se candidatar.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background px-5">
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-black text-foreground">Publicar Urgência</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">Título da vaga</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Garçom para evento"
            className="h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">Categoria</label>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setClassificacao(cat)}
                className={`rounded-xl border p-3 text-sm font-medium transition-colors ${
                  classificacao === cat
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">Valor da diária</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="150"
              className="tabular-nums h-12 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">Descrição curta</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva brevemente o que o profissional vai fazer..."
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <motion.div whileTap={{ scale: 0.96 }}>
          <Button
            onClick={handleSubmit}
            disabled={createJob.isPending}
            className="h-13 w-full rounded-xl text-base font-bold"
          >
            {createJob.isPending ? 'Publicando...' : 'Publicar Vaga Agora'}
          </Button>
        </motion.div>
      </motion.div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="company" />
    </div>
  );
};

export default PostJob;
