import { Search, Clock, ShieldCheck, CreditCard, UtensilsCrossed, ShoppingBag, Sparkles, PartyPopper, Truck, MoreHorizontal, Lock, Check, Verified, Menu, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const heroImages = {
  chef: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7OvRHQckgqHbWYOwANCla8k_rj4ndksGx8h3c4aL29tUif05Ci3glhgwvtXc95yMjLXSeEYU2XNRTlqqaQDaE4p9YaG5bj6-4zR--84ylE42s1YeIiTdR9WQscxzq9XLrEg8bGV9fFzGTL4LkMAC63oO9Sw-kiJN1ehCafK6-fXb2rc98K7WZeippLmKSwZCq9OzBTCsoebtq2EoTP5GowSiNpajJoXbPFRl48-vld9Ur7YiPITXgb7mr6CBfRZ6SkIP3WUzaBnk",
  cleaning: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFKcZreBkdm1PpCanB2-TTdkx2IAE2QPNyOQfGcIAYG05bC4Qu9WYwuZby_nDiVprgHxIFKRHdnRYlsvEQ327bSnISb3WgDcOhXtCBY6feW6oZRhVzKRwMmmEl5engvSoEvDchbrE6f1HGuWnG97S1VUAELWgSTl8vOWVVPGu-8axEKZcTDiNngucv1lKB3M6akCLBl-i8JrwK-9A5VjV1b4QiXBP87d8IH2Q84LzreqxYz_D-HCCeu3WGPFP-pBsKD4ayP6SJnNc",
  handshake: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxQ4CEQhxdCq4W59Ab1DuXdlPM-veLWVfRwpC9z7Wp27vAr0RhE8QEqhp4LyE6EsTS_JQ6jr3mJd-q6xTQ8QtiF-9pK2LvCQLPbZrySj4IH5EtH7ddixR0aQeXlm0D1Vp0AUqU7AoDyyfvhYvR1I-oqeHwac1aVWCzSFXO_Bpz6-V5nAqx7cCR6qcZsoXn3j5VmOJWpjP37e04V_O8FSjUCED6sRkjnDZMwZrZzUQr3zKj2ql9fEOR7Tc_CbPmO3uwTYd7nH5Fg1g",
  payment: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjWKnZml6xOMCG4CqMlFmMNN-mQMsYO5rH1d-U01HsJ3VNJbgERYEtyiYoHss7GHcAdxBQO1DhK9KC-mevrH_atL9AQ6iDldHZX21XYwJUN9kpP1ZyNP5MCLov_9zZoewoppjtozV91SmcZVZAk7Ja2mrOGJ5LgfL-MOSPtk_Cu0gBFyuAIoEJmA-Ar_9aeK7b-VB1y8PlzH7hAUmhbqWUcrkw-LxR_atR4O4K_Pvg8Jlegn2l7UQqS0fW6CE9xs4CYF8seeoBl4M",
  avatars: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAl3XakZGUI6tZrZ4SStdPuTuNt6eM7nMLaRj8w3wtNuH2_-aX_d9nlAoC55OJ5mOtXpzraG7ybc8KBSlZPI5yGOgaA_P6zcQq9QIpsdHU65ZY-NDQSqfqLi8hUYbEi-IYp4pp14iYvrZWXaZQbCdbls5cigNTV19MzP7Bmq1O6qpyfSLqHX98tuvuAPQsRtFMidH2G-yYZeGVpYIawnOoEYfAkZCreFBjQmyj-USRz5ogtS_RZsade8ezmTnmWya1obwwEJkVYLhI",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBtFK93Zx_2eJERsjRE6nhbxoWJ-vzPf0HahGIId4N5JR4afwammagNJ5qnkdSY973Ehoy0tSKgDcx7ca0qDfRCvQw6gMiL3bCoxzazR_VzKqyFe0uUhxZ7SADQEMKKzh8zI-PRsRJJcjF5llw4IDBc8uXI0ULoKR7nDH7LMbBtO6324czqzXgG2-0DN7AWlaV4lPR1lBUo29ZyHYgULhVkBQOigIbaM18FAmVFM_waisG6VuRPEFJMazdwfbG__Wp8PZLAFaixFIE",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC0SrXdFLI9Rxpdi6MljCjf7lpajN_Yqc9AF0_zI_ODlpRFQrGU8A_wc4mioGhJ6TJqahdjoJH-pEX726hNWOmnEKAxDuc0dd34FEEOimVioQqS5yO-2vdDJ_ujIVoZahcgI7H3Qa9uhA0IQ7UmTIwNLJp-rroV4Di5DZm-74lw0era4sRRVr_aw8K8RuqmT95Wp9yRK_g-bE8ecikMPbhmEpn134WlSVNvSeF-hWhkAGXMuCmbgsyyk3Dkc_0HoOBlH4a3iqZr418",
  ],
};

const urgentJobs = [
  { initials: "G99", title: "Chapeiro Noturno", location: "Garage 99 Burger • 1.2km", price: "R$ 120", when: "Hoje", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCC3_ibz2jvexLEgHXMdC0Jrt2zygXc6eRjPYeeEX9mJDZJl41o_0fwPIHUIJOeKuM3AeBcFmadROySf9lfnUt5PQsKZVWGjKxkT3ywv8Rxp8YguC6N-eQRe2fx7D8U1nhGvpaESEb6GK2bHknHQrlHboDsGRimHStjzxP_pl-u5AiufzmRTwMIjp68nGWsiILVQXDvY4IhS5mXf2gM5elg5qx1jU1fyZFCPg6ajPlkBdJKPrGbimkGy6AH2gkwTeeDCVBaW2DRYvc" },
  { initials: "NB", title: "Garçom/Garçonete", location: "Nonna Bella • 0.8km", price: "R$ 95", when: "Amanhã", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUfJQnJomPCG-p5I4YfDxbv1vIt2cq4mvWUtY6kjCZXANovN4f_5y1SVfSgYkaChBvaT1jzqDhUYRywmAXip_rDSuYrbiGjHZaQNW5kMvrHYkjVi5Ofj3c2rexgkG2jBV0DtritJ2So3w4w5mifnq2zowxJWKr-zE7vXduTaoDRlXKfVHstfYdKOzzIb0qyNkuuBMnI9eCJWXwn5_U1Vu-u--J17aeUU_tpjnrMHA_Vt3LFw7LSh-JZg4rUFlGtwRvlrl4GNnFea4" },
  { initials: "PV", title: "Promotor de Vendas", location: "Shopping Itaú • 3km", price: "R$ 150", when: "20/Out", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBo7rkV8yWzoY4PucksGoKAJrdDunV859ABBf7nXF4kgTB8b_4LDRUvjhn245DFdpizBMtAijaC4nqUYnsjRrX-xUAbAr0419E0-WuXZfa38E1JaOiWhtH_Wi4KkdHWEUB1WwNqTCsQfWRKJFOw0xsRdinF7e0NUpDBHXwd2RWBDaB0gMgQjfD89SwLzTHFvtUnm7lhaK4XdCF8DKlIkXe29HZiz5mv_dRiyrkrvOkI1_SENw1aYqgG-uZfSOsODUGQerV-2iNfiJw" },
];

const freelancers = [
  { name: "Ricardo S.", role: "Cozinheiro", rating: "4.9", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDn0sXFmQ7vVifS6vklKnAScyuJeG9LDTXZ4eNR5VN2a8cM3Xi8u7wKlbZ4XjzlS3pWbnKxskhtHdPCB8SzOF-shNsPZ-m_6SN3P8hOQ7pnpL7kT9JIxzTeEE7AN8dUZeCJrZ-OQGIO4JY77HgdMSG1cxGlw98aOk_WEonK696Jl8gP4NlBP96k0XLRlR8skPGmfyEL_JCd8ofLqqW96haIkHvGs0XhFN0-pM6bh1TZJaPCO5Si4MO7aXRvJxzS-j3-ekeonVQ8xRk" },
  { name: "Ana Clara T.", role: "Atendimento", rating: "5.0", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_M6UhG1tv1wo3Z_TpzFVzs1vHFRRDNsGYETD1XOLIMYrDW1wOVoqW2XnXzeOw-qShkZcIfm9242oRbNzNMl-OePGTVb8RwMrgwV-unPitdu9f083CHk26PtYS4vQg_k3x2bCL74UgrC0MqGHoojJ-6Prwn6wT6kQgRuzry30PlF3UlxWUoXHJkHEldsAmK83W0r_fOUYy9Gu8JvzeF58uJhrDuyimNDoxQtl1NuNIksLdDkn1kNo_kzxKbbFoE_Y5Xmze7SJ32hU" },
];

const categoryItems = [
  { name: "Restaurantes", icon: UtensilsCrossed },
  { name: "Varejo", icon: ShoppingBag },
  { name: "Limpeza", icon: Sparkles },
  { name: "Eventos", icon: PartyPopper },
  { name: "Entregas", icon: Truck },
  { name: "Outros", icon: MoreHorizontal },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.2, 0, 0, 1] as [number, number, number, number] },
  },
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl">
        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between px-6 h-16">
          <div className="text-2xl font-black text-primary tracking-tighter font-headline">VaptVaga</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-on-surface-variant font-semibold px-4 py-2 hover:bg-primary/10 transition-colors rounded-full text-sm"
            >
              Entrar
            </button>
            <Menu size={24} className="text-on-surface-variant" />
          </div>
        </div>
        {/* Desktop header */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 h-20 items-center justify-between">
          <div className="text-2xl font-black text-on-surface tracking-tight font-headline">VaptVaga</div>
          <nav className="flex items-center gap-8">
            <a href="#como-funciona" className="text-on-surface-variant hover:text-primary transition-colors">Como Funciona</a>
            <a href="#planos" className="text-on-surface-variant hover:text-primary transition-colors">Planos</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/auth?role=freelancer')}>Sou Freelancer</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/auth')}>Entrar</a>
          </nav>
          <Button
            onClick={() => navigate('/auth?role=company')}
            className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold hover:opacity-90 hover:scale-[0.98] transition-all"
          >
            Publicar Vaga
          </Button>
        </div>
      </header>

      <main>
        {/* ===== HERO ===== */}
        <section className="px-6 pt-8 pb-12 md:pt-16 md:pb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <motion.div className="space-y-6 md:space-y-10" initial="hidden" animate="visible" variants={fadeUp}>
              <div className="space-y-4 md:space-y-6">
                <h1 className="font-headline font-extrabold text-[2.5rem] md:text-[3.5rem] leading-[1.1] tracking-tighter text-on-surface">
                  O freela perfeito para o seu negócio local. <span className="text-primary italic">Pra ontem.</span>
                </h1>
                <p className="text-on-surface-variant leading-relaxed md:text-lg md:max-w-lg md:font-medium">
                  Conectamos empresas a profissionais qualificados em minutos. Sem burocracia, apenas resultados.
                </p>
              </div>

              {/* Search Bar */}
              <div className="bg-surface-container-lowest p-2 rounded-full shadow-[0px_24px_48px_rgba(17,28,45,0.06)] flex items-center gap-2 border border-outline-variant/10 md:max-w-xl md:p-3 group focus-within:ring-2 ring-primary/10 transition-all">
                <div className="pl-3 md:pl-4 text-outline flex items-center gap-2 flex-1">
                  <Search size={18} />
                  <input
                    className="bg-transparent border-none focus:ring-0 text-on-surface w-full p-0 placeholder:text-outline/60 focus:outline-none text-sm md:text-base"
                    placeholder="Ex: Cozinheiro, Limpeza..."
                    type="text"
                  />
                </div>
                <button className="hero-gradient text-on-primary font-bold px-5 py-3 md:px-10 md:py-4 rounded-full hover:opacity-90 active:scale-95 transition-all text-sm md:text-base shadow-lg shadow-primary/20">
                  Buscar
                </button>
              </div>

              {/* Mobile: Horizontal Benefit Cards */}
              <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6 py-2 md:hidden">
                {[
                  { img: heroImages.chef, label: "Contratação Instantânea", icon: Zap },
                  { img: heroImages.handshake, label: "Perfis verificados", icon: Verified },
                  { img: heroImages.payment, label: "Combine em 15 min", icon: Clock },
                ].map((card) => (
                  <div key={card.label} className="min-w-[260px] bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col gap-3">
                    <div className="h-36 w-full rounded-lg bg-surface-container overflow-hidden">
                      <img className="w-full h-full object-cover" src={card.img} alt={card.label} />
                    </div>
                    <div className="flex items-center gap-2 text-secondary font-bold text-sm">
                      <card.icon size={14} />
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Avatar proof */}
              <div className="hidden md:flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {heroImages.avatars.map((src, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-surface overflow-hidden bg-surface-container-high">
                      <img className="w-full h-full object-cover" src={src} alt="Profissional" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-on-surface-variant">
                  <span className="text-primary font-bold">+2.400</span> profissionais ativos na sua região
                </p>
              </div>
            </motion.div>

            {/* Desktop Bento Grid */}
            <motion.div
              className="relative grid-cols-2 gap-4 hidden lg:grid"
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
                    <Clock className="text-on-primary-container" size={28} />
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-widest">REAL TIME</span>
                  </div>
                  <p className="text-on-primary-container font-headline font-bold text-xl leading-tight">Combine em menos de 15 minutos</p>
                </div>
                <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
                  <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" src={heroImages.cleaning} alt="Equipe de limpeza" />
                </div>
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-surface-container rounded-full blur-[100px] opacity-50" />
            </motion.div>
          </div>
        </section>

        {/* ===== SOCIAL PROOF ===== */}
        <section className="bg-surface-container-low py-8 overflow-hidden">
          <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-outline mb-6">
            Empresas que confiam no VaptVaga
          </p>
          <div className="flex gap-12 items-center opacity-40 px-6 overflow-x-auto hide-scrollbar whitespace-nowrap md:justify-center md:gap-24">
            {["Garage 99 Burger", "Cantina Nonna Bella", "Espaço Clean", "Varejo Express"].map((name) => (
              <span key={name} className="font-headline font-black text-xl italic text-on-surface">{name}</span>
            ))}
          </div>
        </section>

        {/* ===== VALUE PROPS ===== */}
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="hidden md:block mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4 font-headline">
                Resolva sua escala de trabalho<br />sem burocracia.
              </h2>
              <p className="text-on-surface-variant max-w-xl text-lg">Esqueça os grupos de WhatsApp lotados. Tenha controle total.</p>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: Clock, title: "Velocidade Vapt", desc: "Publique sua vaga e receba propostas em menos de 5 minutos.", color: "bg-primary/10 text-primary" },
                { icon: ShieldCheck, title: "Filtro de Confiança", desc: "Apenas profissionais com histórico positivo e documentos validados.", color: "bg-secondary-container/30 text-secondary" },
                { icon: CreditCard, title: "Pagamento Direto", desc: "Combine e pague diretamente ao profissional, sem taxas escondidas.", color: "bg-tertiary/10 text-tertiary" },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 border border-outline-variant/5 md:p-10 md:bg-surface-container-low md:shadow-sm md:hover:shadow-xl md:transition-shadow"
                  whileHover={{ y: -4 }}
                >
                  <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center md:w-16 md:h-16 md:rounded-2xl md:mb-4`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-headline font-bold text-xl md:text-2xl">{item.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section className="px-6 py-12 md:py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-headline font-extrabold text-2xl md:text-3xl mb-8 md:mb-16 tracking-tight md:text-center">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categoryItems.map((cat) => (
                <motion.div
                  key={cat.name}
                  className="flex flex-col items-center gap-3 bg-surface-container-lowest p-6 rounded-xl text-center shadow-sm cursor-pointer hover:bg-primary-container hover:text-on-primary-container transition-all group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-white/20">
                    <cat.icon size={28} />
                  </div>
                  <span className="font-bold text-sm">{cat.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== LIVE FEED ===== */}
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:gap-16">
            {/* Urgent Jobs */}
            <div>
              <div className="flex items-center justify-between mb-6 md:mb-10">
                <h2 className="font-headline font-extrabold text-2xl tracking-tight">Vagas Urgentes</h2>
                <span className="bg-error/10 text-error text-[0.65rem] font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                  AO VIVO
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {urgentJobs.map((job) => (
                  <motion.div
                    key={job.title}
                    className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-outline-variant/10 flex items-center gap-4 cursor-pointer hover:bg-primary-container/5 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    {/* Mobile: initials box, Desktop: image */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-full bg-surface flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
                      <span className="md:hidden">{job.initials}</span>
                      <img className="hidden md:block w-full h-full object-cover" src={job.img} alt={job.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm md:text-lg">{job.title}</h4>
                      <p className="text-xs md:text-sm text-on-surface-variant truncate">{job.location}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-secondary font-black text-sm md:text-base">{job.price}</span>
                      <span className="text-[0.6rem] text-outline font-bold uppercase">{job.when}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Freelancers */}
            <div>
              <h2 className="font-headline font-extrabold text-2xl tracking-tight mb-6 md:mb-10">Freelancers Disponíveis</h2>
              <div className="flex flex-col gap-4">
                {freelancers.map((f) => (
                  <div key={f.name} className="bg-surface-container-lowest md:bg-surface-container-high p-4 md:p-6 rounded-xl border border-outline-variant/10 md:border-0 flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover" src={f.img} alt={f.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm md:text-lg flex items-center gap-2">
                        {f.name}
                        <Verified size={14} className="text-primary fill-primary md:hidden" />
                        <Verified size={16} className="text-primary fill-primary hidden md:inline" />
                      </h4>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-secondary font-bold">
                        <Star size={12} className="fill-secondary text-secondary" />
                        {f.rating} • {f.role}
                      </div>
                    </div>
                    <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-[0.65rem] md:text-sm font-black uppercase md:normal-case md:font-bold md:bg-surface-container-lowest md:text-on-surface md:opacity-50 md:cursor-not-allowed flex items-center gap-2">
                      <Lock size={14} className="hidden md:inline" />
                      WhatsApp
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-sm text-on-surface-variant italic hidden md:block">
                Assine o Plano Beta para desbloquear contatos diretos.
              </p>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="como-funciona" className="px-6 py-16 md:py-24 bg-surface-container">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-headline font-extrabold text-3xl mb-12 md:mb-20 text-center tracking-tight">Como funciona?</h2>
            <div className="flex flex-col gap-10 md:grid md:grid-cols-3 md:gap-12 md:text-center">
              {[
                { n: "1", title: "Publique sua vaga", desc: "Diga o que você precisa, o horário e quanto pretende pagar." },
                { n: "2", title: "Receba propostas", desc: "Em minutos, profissionais qualificados entrarão em contato via chat." },
                { n: "3", title: "Combine e feche", desc: "Analise o perfil, combine os detalhes e resolva sua demanda." },
              ].map((step) => (
                <div key={step.n} className="flex gap-6 items-start md:flex-col md:items-center">
                  <div className="w-10 h-10 md:w-20 md:h-20 rounded-full hero-gradient text-on-primary flex items-center justify-center font-bold flex-shrink-0 md:text-2xl md:font-black md:shadow-lg md:shadow-primary/30 md:mb-4">
                    {step.n}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-headline font-bold text-lg md:text-xl">{step.title}</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed md:px-6">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section id="planos" className="px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight text-center mb-8 md:mb-16">Para quem é?</h2>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Freelancer */}
              <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl border-2 border-primary/5 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.65rem] font-black uppercase text-primary tracking-widest">Para Profissionais</span>
                  <h3 className="font-headline font-bold text-2xl md:text-3xl">Freelancer Free</h3>
                </div>
                <div className="hidden md:flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black">R$ 0</span>
                  <span className="text-on-surface-variant">/mês</span>
                </div>
                <p className="text-on-surface-variant text-sm">Acesse centenas de vagas diariamente sem pagar comissão sobre seus ganhos.</p>
                <ul className="flex flex-col gap-3 text-sm font-medium">
                  {["Perfil profissional gratuito", "Notificações em tempo real", "Receba 100% do valor"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check size={18} className="text-secondary" /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth?role=freelancer')}
                  className="w-full bg-surface-container-highest text-on-surface font-bold py-4 rounded-full hover:scale-[0.98] transition-transform"
                >
                  Criar meu perfil
                </button>
              </div>

              {/* Empresa */}
              <div className="bg-primary p-8 md:p-12 rounded-xl flex flex-col gap-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="hidden md:block absolute top-8 right-8 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">RECOMENDADO</div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.65rem] font-black uppercase text-primary-fixed tracking-widest">Para Negócios</span>
                  <h3 className="font-headline font-bold text-2xl md:text-3xl">Empresa Beta</h3>
                </div>
                <div className="hidden md:flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black">R$ 49,90</span>
                  <span className="text-white/70">/mês</span>
                </div>
                <p className="opacity-80 text-sm">Encontre reforço para seu time em tempo recorde e garanta que seu negócio nunca pare.</p>
                <ul className="flex flex-col gap-3 text-sm font-medium">
                  {["Vagas ilimitadas", "Filtros avançados", "Suporte priorizado"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check size={18} className="text-secondary-fixed" /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth?role=company')}
                  className="w-full bg-white text-primary font-bold py-4 rounded-full hover:scale-[0.98] transition-transform"
                >
                  Cadastrar minha empresa
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="px-6 py-12 md:py-20">
          <div className="max-w-7xl mx-auto bg-gradient-to-br from-primary to-primary-container p-10 md:p-24 rounded-xl text-center text-white flex flex-col gap-6 md:gap-8 relative overflow-hidden">
            <h2 className="font-headline font-extrabold text-3xl md:text-6xl leading-tight">
              <span className="md:hidden">Pronto para começar agora?</span>
              <span className="hidden md:inline">Chega de dor de cabeça<br />com falta de staff.</span>
            </h2>
            <p className="hidden md:block text-xl text-white/80 max-w-2xl mx-auto">
              Junte-se a centenas de empresas e profissionais de Contagem que já usam o VaptVaga.
            </p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-6 md:justify-center">
              <button
                onClick={() => navigate('/auth?role=company')}
                className="bg-white text-primary font-bold py-4 md:px-10 md:py-5 rounded-full text-lg active:scale-95 transition-transform hover:bg-surface-container-lowest"
              >
                Quero Contratar
              </button>
              <button
                onClick={() => navigate('/auth?role=freelancer')}
                className="bg-primary/20 backdrop-blur-sm border border-white/20 text-white font-bold py-4 md:px-10 md:py-5 rounded-full text-lg active:scale-95 transition-transform hover:bg-white/10"
              >
                Quero Candidatar
              </button>
            </div>
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          </div>
        </section>
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block bg-surface-container-low rounded-t-2xl mt-20">
        <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-xl font-black text-on-surface mb-6 font-headline">VaptVaga</div>
            <p className="text-on-surface-variant text-sm leading-relaxed">A primeira plataforma de matching imediato focada 100% no mercado de Contagem, MG.</p>
          </div>
          <div>
            <h5 className="font-bold text-on-surface mb-6">Plataforma</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#como-funciona">Como Funciona</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Vagas Disponíveis</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Para Empresas</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#planos">Planos</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-on-surface mb-6">Suporte</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Suporte</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Blog</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-on-surface mb-6">Legal</h5>
            <ul className="space-y-4 text-sm">
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Termos de Uso</a></li>
              <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-8 border-t border-outline-variant/10 flex justify-between items-center">
          <p className="text-sm text-on-surface-variant">© 2024 VaptVaga. Feito em Contagem, MG.</p>
        </div>
      </footer>

      {/* Mobile Bottom Nav (floating pill) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 mb-6 md:hidden">
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-full h-16 shadow-[0px_24px_48px_rgba(17,28,45,0.06)] flex justify-around items-center w-full px-4 border border-outline-variant/10">
          <div className="flex items-center justify-center bg-primary text-white rounded-full w-11 h-11">
            <Search size={20} />
          </div>
          <button onClick={() => navigate('/auth')} className="flex items-center justify-center text-on-surface-variant">
            <Sparkles size={22} />
          </button>
          <button onClick={() => navigate('/auth')} className="flex items-center justify-center text-on-surface-variant">
            <ShoppingBag size={22} />
          </button>
          <button onClick={() => navigate('/auth')} className="flex items-center justify-center text-on-surface-variant">
            <Menu size={22} />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Landing;
