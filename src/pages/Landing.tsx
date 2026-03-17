import { Search, Clock, ShieldCheck, CreditCard, UtensilsCrossed, ShoppingBag, Sparkles, PartyPopper, Truck, MoreHorizontal, Lock, Check, Verified } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const heroImages = {
  chef: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXh0Q16vYsMP3L8QdGMw02bUs_A7FRS0TXdMnUVZegKBe065UpxaXbQrLVp0i7152-RPvoqk8ESJa_Hlz-p9eFE-sR8PajUftzCN_aDzRBW7LWKRIFI_p3SbryxdPB550lPbsWRXscz2fBc5TR_1_ZtqOevI7Tb2neGBSqthaL-Xr1O7DO7DJR-kjHoIiRTwGA1x37m139-fQxSzYNKyy7Jjv6gm7Y_DEFyozxzrDczO0H4z968Kejl0vCZiYvB9tL7-qOKJhiLJg",
  cleaning: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFKcZreBkdm1PpCanB2-TTdkx2IAE2QPNyOQfGcIAYG05bC4Qu9WYwuZby_nDiVprgHxIFKRHdnRYlsvEQ327bSnISb3WgDcOhXtCBY6feW6oZRhVzKRwMmmEl5engvSoEvDchbrE6f1HGuWnG97S1VUAELWgSTl8vOWVVPGu-8axEKZcTDiNngucv1lKB3M6akCLBl-i8JrwK-9A5VjV1b4QiXBP87d8IH2Q84LzreqxYz_D-HCCeu3WGPFP-pBsKD4ayP6SJnNc",
  avatars: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAl3XakZGUI6tZrZ4SStdPuTuNt6eM7nMLaRj8w3wtNuH2_-aX_d9nlAoC55OJ5mOtXpzraG7ybc8KBSlZPI5yGOgaA_P6zcQq9QIpsdHU65ZY-NDQSqfqLi8hUYbEi-IYp4pp14iYvrZWXaZQbCdbls5cigNTV19MzP7Bmq1O6qpyfSLqHX98tuvuAPQsRtFMidH2G-yYZeGVpYIawnOoEYfAkZCreFBjQmyj-USRz5ogtS_RZsade8ezmTnmWya1obwwEJkVYLhI",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBtFK93Zx_2eJERsjRE6nhbxoWJ-vzPf0HahGIId4N5JR4afwammagNJ5qnkdSY973Ehoy0tSKgDcx7ca0qDfRCvQw6gMiL3bCoxzazR_VzKqyFe0uUhxZ7SADQEMKKzh8zI-PRsRJJcjF5llw4IDBc8uXI0ULoKR7nDH7LMbBtO6324czqzXgG2-0DN7AWlaV4lPR1lBUo29ZyHYgULhVkBQOigIbaM18FAmVFM_waisG6VuRPEFJMazdwfbG__Wp8PZLAFaixFIE",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC0SrXdFLI9Rxpdi6MljCjf7lpajN_Yqc9AF0_zI_ODlpRFQrGU8A_wc4mioGhJ6TJqahdjoJH-pEX726hNWOmnEKAxDuc0dd34FEEOimVioQqS5yO-2vdDJ_ujIVoZahcgI7H3Qa9uhA0IQ7UmTIwNLJp-rroV4Di5DZm-74lw0era4sRRVr_aw8K8RuqmT95Wp9yRK_g-bE8ecikMPbhmEpn134WlSVNvSeF-hWhkAGXMuCmbgsyyk3Dkc_0HoOBlH4a3iqZr418",
  ],
};

const urgentJobs = [
  { title: "Ajudante de Cozinha", location: "Bairro Eldorado • Hoje, 18:00", price: "R$ 120,00", badge: "3 Vagas", badgeColor: "text-secondary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCC3_ibz2jvexLEgHXMdC0Jrt2zygXc6eRjPYeeEX9mJDZJl41o_0fwPIHUIJOeKuM3AeBcFmadROySf9lfnUt5PQsKZVWGjKxkT3ywv8Rxp8YguC6N-eQRe2fx7D8U1nhGvpaESEb6GK2bHknHQrlHboDsGRimHStjzxP_pl-u5AiufzmRTwMIjp68nGWsiILVQXDvY4IhS5mXf2gM5elg5qx1jU1fyZFCPg6ajPlkBdJKPrGbimkGy6AH2gkwTeeDCVBaW2DRYvc" },
  { title: "Barista / Atendimento", location: "Bairro Cabral • Amanhã", price: "R$ 90,00", badge: "Final de Semana", badgeColor: "text-muted-foreground", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUfJQnJomPCG-p5I4YfDxbv1vIt2cq4mvWUtY6kjCZXANovN4f_5y1SVfSgYkaChBvaT1jzqDhUYRywmAXip_rDSuYrbiGjHZaQNW5kMvrHYkjVi5Ofj3c2rexgkG2jBV0DtritJ2So3w4w5mifnq2zowxJWKr-zE7vXduTaoDRlXKfVHstfYdKOzzIb0qyNkuuBMnI9eCJWXwn5_U1Vu-u--J17aeUU_tpjnrMHA_Vt3LFw7LSh-JZg4rUFlGtwRvlrl4GNnFea4" },
  { title: "Promotor de Vendas", location: "Shopping Itaú • 20/Out", price: "R$ 150,00", badge: "Destaque", badgeColor: "text-secondary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBo7rkV8yWzoY4PucksGoKAJrdDunV859ABBf7nXF4kgTB8b_4LDRUvjhn245DFdpizBMtAijaC4nqUYnsjRrX-xUAbAr0419E0-WuXZfa38E1JaOiWhtH_Wi4KkdHWEUB1WwNqTCsQfWRKJFOw0xsRdinF7e0NUpDBHXwd2RWBDaB0gMgQjfD89SwLzTHFvtUnm7lhaK4XdCF8DKlIkXe29HZiz5mv_dRiyrkrvOkI1_SENw1aYqgG-uZfSOsODUGQerV-2iNfiJw" },
];

const freelancers = [
  { name: "Ricardo Silva", role: "Garçom • 4.9 ★ (22 trampos)", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRH3xvDZBH3VFaOZKPGz7OnGeZAGmKGRJOLCRV2XKTCVRUCQrQwu8rLMkR3CNHs_reEAQecJTy4rhvIso3uUb2cPNwTDm9jVVSk3mjclTj5dje2gAhjt37rhb09001RqJzVd-OmCljOnUhJ71q7EVzgr_9QbDSq-RikTgp_4tU6RWH6II3bAa8yzOp_voNArnmGd9R_KZjAfGTMwMATC0YNw_ws5S_fBDvli8XN7aPr1dv12xILQKegGs_HVK0GxQ5R2PxLD7sVRo" },
  { name: "Ana Clara", role: "Recepcionista • 5.0 ★ (8 trampos)", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwiWkCastEUOi9tGKWhkep6_rhufLoVANm5r_CaafGKi8ZIroCEhQYr3MMum-IM9KG-S5pE2dtm79dBwOrG0gMwCs10JaG0vShe9E439FKa21630FbZQMYypEz2F1e_1XJ8ObBOBTI98OF4zaVzVFcasCBSD6tip0_fg4BmR-dntyj3BRoX2R5dBwKs35bGzgRqCqKkdN4LKeW4Bgn_Q23PZYihRglkYUdmZQmkEPw8jAgVypI0fK1sig8ctfFZ4xeojUxvXmbheo" },
];

const categoryItems = [
  { name: "Restaurantes", icon: UtensilsCrossed, bg: "bg-primary/10" },
  { name: "Varejo", icon: ShoppingBag, bg: "bg-secondary/10" },
  { name: "Limpeza", icon: Sparkles, bg: "bg-tertiary/10" },
  { name: "Eventos", icon: PartyPopper, bg: "bg-primary/10" },
  { name: "Entregas", icon: Truck, bg: "bg-secondary/10" },
  { name: "Outros", icon: MoreHorizontal, bg: "bg-tertiary/10" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.2, 0, 0, 1] },
  }),
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black text-foreground tracking-tight font-headline">VaptVaga</div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-on-surface-variant hover:text-primary transition-colors">Como Funciona</a>
            <a href="#planos" className="text-on-surface-variant hover:text-primary transition-colors">Planos</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/auth?role=freelancer')}>Sou Freelancer</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/auth')}>Entrar</a>
          </nav>
          <Button
            onClick={() => navigate('/auth?role=company')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:opacity-90 hover:scale-[0.98] transition-all"
          >
            Publicar Vaga
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div className="space-y-10" initial="hidden" animate="visible" variants={fadeUp}>
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-secondary text-xs font-bold tracking-widest uppercase">
                  ⚡ Contratação Instantânea
                </span>
                <h1 className="text-4xl md:text-[3.5rem] leading-[1.1] font-extrabold tracking-tighter text-foreground font-headline">
                  O freela perfeito para o seu <span className="text-primary">negócio local.</span> Pra ontem.
                </h1>
                <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-medium">
                  Conectamos empresas que precisam de ajuda urgente com os melhores profissionais disponíveis agora. Sem burocracia, apenas agilidade.
                </p>
              </div>
              {/* Search Bar */}
              <div className="bg-surface-container-lowest p-3 rounded-xl shadow-[0px_24px_48px_rgba(17,28,45,0.06)] flex items-center gap-2 max-w-xl group focus-within:ring-2 ring-primary/10 transition-all">
                <div className="flex items-center gap-3 px-4 flex-grow">
                  <Search size={20} className="text-outline" />
                  <input
                    className="w-full border-none focus:ring-0 text-foreground placeholder:text-outline bg-transparent py-2 focus:outline-none"
                    placeholder="Ex: Cozinheiro, Limpeza, Garçom..."
                    type="text"
                  />
                </div>
                <button className="hero-gradient text-primary-foreground px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] active:scale-95 transition-all">
                  Buscar
                </button>
              </div>
              {/* Avatars */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {heroImages.avatars.map((src, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-background overflow-hidden bg-surface-container-high">
                      <img className="w-full h-full object-cover" src={src} alt="Profissional" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-on-surface-variant">
                  <span className="text-primary font-bold">+2.400</span> profissionais ativos na sua região
                </p>
              </div>
            </motion.div>

            {/* Hero Visual Bento Grid */}
            <motion.div
              className="relative grid grid-cols-2 gap-4 hidden lg:grid"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
            >
              <div className="space-y-4">
                <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
                  <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" src={heroImages.chef} alt="Cozinheiro profissional" />
                </div>
                <div className="aspect-square rounded-xl bg-secondary-container p-8 flex flex-col justify-end">
                  <ShieldCheck className="text-secondary mb-4" size={36} />
                  <p className="text-secondary font-headline font-bold text-xl leading-tight">Perfis verificados e avaliados</p>
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="aspect-square rounded-xl bg-primary-container p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <Clock className="text-primary-foreground" size={28} />
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-widest">REAL TIME</span>
                  </div>
                  <p className="text-primary-foreground font-headline font-bold text-xl leading-tight">Combine em menos de 15 minutos</p>
                </div>
                <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
                  <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" src={heroImages.cleaning} alt="Equipe de limpeza" />
                </div>
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-surface-container rounded-full blur-[100px] opacity-50" />
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-outline-variant font-bold text-sm uppercase tracking-widest mb-10">Empresas que já resolvem escalas conosco</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
              {["🍔 Garage 99 Burger", "🍕 Cantina Nonna Bella", "🏪 Empório Central"].map((name) => (
                <div key={name} className="font-black text-2xl text-foreground font-headline">{name}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Value Props */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 font-headline">Resolva sua escala de trabalho<br />sem burocracia.</h2>
              <p className="text-on-surface-variant max-w-xl text-lg">Esqueça os grupos de WhatsApp lotados. Tenha controle total da sua operação com segurança.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Clock, title: "Velocidade Vapt", desc: "Publique em 30 segundos e receba as primeiras candidaturas em menos de 10 minutos.", color: "bg-primary/10 text-primary" },
                { icon: ShieldCheck, title: "Filtro de Confiança", desc: "Freelancers avaliados pela comunidade local. Sem surpresas no dia do evento.", color: "bg-secondary-container/30 text-secondary" },
                { icon: CreditCard, title: "Pagamento Direto", desc: "Combine valores e pague diretamente ao profissional. Sem taxas ocultas na transação.", color: "bg-tertiary/10 text-tertiary" },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  className="p-10 rounded-xl bg-surface-container-low shadow-sm hover:shadow-xl transition-shadow group"
                  whileHover={{ y: -4 }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">{item.title}</h3>
                  <p className="text-on-surface-variant">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-24 px-6 bg-surface-container">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-16 font-headline">O que você precisa hoje?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categoryItems.map((cat) => (
                <motion.div
                  key={cat.name}
                  className="bg-surface-container-lowest p-8 rounded-xl text-center hover:bg-primary-container hover:text-primary-foreground transition-all cursor-pointer group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className={`w-12 h-12 ${cat.bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20`}>
                    <cat.icon size={22} />
                  </div>
                  <span className="font-bold">{cat.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Feed */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Urgent Jobs */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <h2 className="text-2xl font-bold font-headline">Vagas Urgentes (Contagem)</h2>
              </div>
              <div className="space-y-4">
                {urgentJobs.map((job) => (
                  <motion.div
                    key={job.title}
                    className="p-6 bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-primary-container/5 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-6">
                      <img className="w-14 h-14 rounded-full object-cover" src={job.img} alt={job.title} />
                      <div>
                        <h4 className="font-bold text-lg">{job.title}</h4>
                        <p className="text-sm text-on-surface-variant">{job.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary">{job.price}</p>
                      <span className={`text-xs font-bold ${job.badgeColor} uppercase`}>{job.badge}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Freelancers */}
            <div>
              <h2 className="text-2xl font-bold mb-10 font-headline">Freelancers Disponíveis</h2>
              <div className="space-y-4">
                {freelancers.map((f) => (
                  <div key={f.name} className="p-6 bg-surface-container-high rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <img className="w-14 h-14 rounded-full object-cover ring-2 ring-primary" src={f.img} alt={f.name} />
                      <div>
                        <h4 className="font-bold text-lg flex items-center gap-2">{f.name} <Verified size={16} className="text-primary fill-primary" /></h4>
                        <p className="text-sm text-on-surface-variant">{f.role}</p>
                      </div>
                    </div>
                    <button className="bg-surface-container-lowest px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 opacity-50 cursor-not-allowed">
                      <Lock size={14} /> WhatsApp
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-sm text-on-surface-variant italic">Assine o Plano Beta para desbloquear contatos diretos.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="como-funciona" className="py-24 px-6 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 font-headline">Como o VaptVaga funciona?</h2>
              <p className="text-on-surface-variant">Transparência total do anúncio ao pagamento.</p>
            </div>
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="hidden md:block absolute top-1/4 left-[30%] right-[30%] h-0.5 border-t-2 border-dashed border-outline-variant" />
              {[
                { n: "1", title: "Crie Perfil", desc: "Empresa ou Freela, cadastre-se em segundos com suas necessidades ou habilidades." },
                { n: "2", title: "Dê o Match", desc: "O sistema cruza horários e localização. Escolha o melhor perfil para o dia." },
                { n: "3", title: "Combine e Trampe", desc: "Tire dúvidas no chat, confirme a presença e pronto. Operação garantida." },
              ].map((step) => (
                <div key={step.n} className="relative z-10">
                  <div className="w-20 h-20 hero-gradient text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-8 text-2xl font-black shadow-lg shadow-primary/30">{step.n}</div>
                  <h4 className="text-xl font-bold mb-4 font-headline">{step.title}</h4>
                  <p className="text-on-surface-variant px-6">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="planos" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 font-headline">Planos para a fase Beta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Freelancer */}
              <div className="p-12 rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col h-full">
                <div className="mb-8">
                  <span className="text-primary font-bold uppercase tracking-widest text-xs">Para profissionais</span>
                  <h3 className="text-3xl font-black mt-2 font-headline">Freelancer Free</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black">R$ 0</span>
                    <span className="text-on-surface-variant">/mês</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-12 flex-1">
                  {["Perfil verificado gratuito", "Notificações de vagas urgentes", "Recebimento integral (sem taxas)"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check size={18} className="text-secondary" /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth?role=freelancer')}
                  className="w-full py-4 rounded-full bg-foreground text-background font-bold hover:scale-[0.98] transition-transform"
                >
                  Cadastrar Currículo
                </button>
              </div>
              {/* Empresa */}
              <div className="p-12 rounded-xl hero-gradient text-primary-foreground flex flex-col h-full relative overflow-hidden shadow-2xl shadow-primary/20">
                <div className="absolute top-8 right-8 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">RECOMENDADO</div>
                <div className="mb-8">
                  <span className="text-primary-foreground/70 font-bold uppercase tracking-widest text-xs">Para contratantes</span>
                  <h3 className="text-3xl font-black mt-2 font-headline">Empresa Beta</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black">R$ 49,90</span>
                    <span className="text-primary-foreground/70">/mês</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-12 flex-1">
                  {["Publicações ilimitadas", "Desbloqueio de WhatsApp dos Freelas", "Suporte Prioritário em Contagem", "Dashboard de Escala Mensal"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check size={18} className="text-secondary-container" /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth?role=company')}
                  className="w-full py-4 rounded-full bg-white text-primary font-bold hover:scale-[0.98] transition-transform"
                >
                  Contratar Plano Beta
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto hero-gradient rounded-xl p-12 md:p-24 text-center text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-6xl font-black mb-8 leading-tight font-headline">
                Chega de dor de cabeça<br />com falta de staff.
              </h2>
              <p className="text-xl mb-12 text-primary-foreground/80 max-w-2xl mx-auto">
                Junte-se a centenas de empresas e profissionais de Contagem que já usam o VaptVaga para girar a operação.
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <button
                  onClick={() => navigate('/auth?role=company')}
                  className="bg-white text-primary px-10 py-5 rounded-full font-black text-lg hover:bg-surface-container-lowest transition-colors"
                >
                  Quero Contratar
                </button>
                <button
                  onClick={() => navigate('/auth?role=freelancer')}
                  className="bg-primary-container border-2 border-white/30 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-white/10 transition-colors"
                >
                  Quero Candidatar
                </button>
              </div>
            </div>
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low rounded-t-2xl mt-20">
        <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-xl font-black text-foreground mb-6 font-headline">VaptVaga</div>
            <p className="text-on-surface-variant text-sm leading-relaxed">A primeira plataforma de matching imediato focada 100% no mercado de Contagem, MG.</p>
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-6">Plataforma</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#como-funciona">Como Funciona</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Vagas Disponíveis</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Para Empresas</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#planos">Planos</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-6">Suporte</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Suporte</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Blog</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">FAQ</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Contato</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-6">Legal</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Termos de Uso</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacidade</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Sitemap</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-on-surface-variant">© 2024 VaptVaga. Feito em Contagem, MG.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
