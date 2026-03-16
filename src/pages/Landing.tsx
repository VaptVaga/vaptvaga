import { Search, ArrowRight, Zap, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/vaptvaga/CategoryCard';
import { categories } from '@/lib/mockData';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <h1 className="text-xl font-black text-foreground">
          Vapt<span className="text-primary">Vaga</span>
        </h1>
        <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
          Entrar
        </Button>
      </header>

      {/* Hero */}
      <section className="px-5 pb-8 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
        >
          <h2 className="text-3xl font-black leading-[1.1] text-foreground sm:text-4xl">
            O freela perfeito para o seu negócio local.{' '}
            <span className="text-primary">Pra ontem.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Conectamos empresas a profissionais operacionais prontos para trabalhar hoje.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.2, 0, 0, 1] }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
            <Search size={20} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Qual profissional você precisa hoje?"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.2, 0, 0, 1] }}
          className="mt-6 flex gap-3"
        >
          <Button
            variant="hero"
            className="h-13 flex-1 rounded-xl"
            onClick={() => navigate('/auth?role=company')}
          >
            Sou Empresa
            <ArrowRight size={18} />
          </Button>
          <Button
            variant="hero-outline"
            className="h-13 flex-1 rounded-xl"
            onClick={() => navigate('/auth?role=freelancer')}
          >
            Sou Freelancer
          </Button>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="px-5 pb-8">
        <h3 className="mb-4 text-lg font-bold text-foreground">Categorias em alta</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: [0.2, 0, 0, 1] }}
            >
              <CategoryCard {...cat} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 pb-10">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1">
                <Users size={18} />
                <span className="tabular-nums text-2xl font-black">89</span>
              </div>
              <p className="mt-1 text-[11px] font-medium opacity-80">Freelancers prontos</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Zap size={18} />
                <span className="tabular-nums text-2xl font-black">34</span>
              </div>
              <p className="mt-1 text-[11px] font-medium opacity-80">Vagas abertas</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Clock size={18} />
                <span className="tabular-nums text-2xl font-black">&lt;2h</span>
              </div>
              <p className="mt-1 text-[11px] font-medium opacity-80">Tempo médio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">
        © 2026 VaptVaga. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Landing;
