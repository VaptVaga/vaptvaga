import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Building2, UserCircle2, ArrowRight } from 'lucide-react';

export const CompanyLandingDesktop: React.FC = () => {
  const [role, setRole] = useState<'freelancer' | 'company'>('company');

  const plans = {
    freelancer: [
      {
        name: 'Grátis',
        price: '0',
        period: '/mês',
        features: [
          'Acesso ao feed de vagas',
          '2 candidaturas por mês',
          'Chat com empresas',
        ],
        cta: 'Começar agora',
        highlighted: false,
      },
      {
        name: 'Vapt PRO',
        price: '14,90',
        period: '/mês',
        features: [
          'Candidaturas ilimitadas',
          'Selo Freela PRO no perfil',
          'Destaque nas buscas',
          'Suporte prioritário',
        ],
        cta: 'Assinar Vapt PRO',
        highlighted: true,
      },
    ],
    company: [
      {
        name: 'Grátis',
        price: '0',
        period: '/mês',
        features: [
          'Publicar 1 vaga/mês',
          'Chat liberado com 1 candidato',
          'Gestão básica de candidatos',
        ],
        cta: 'Começar agora',
        highlighted: false,
      },
      {
        name: 'Negócio Ágil',
        price: '49,90',
        period: '/mês',
        features: [
          'Vagas ilimitadas',
          'Chat liberado com TODOS os candidatos',
          'Suporte prioritário nacional',
          'Dashboard de escala mensal',
        ],
        cta: 'Assinar Agora',
        highlighted: true,
      },
    ],
  };
  return (
    <>
      {/* 2. New Hero Section (from SCREEN_2) */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Hero Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Contratação Instantânea
              </span>
              <h1 className="text-5xl md:text-[3.5rem] leading-[1.1] font-extrabold tracking-tighter text-on-surface">
                O freela perfeito para o seu <span className="text-primary">negócio local.</span> Pra ontem.
              </h1>
              <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-medium">
                Conectamos empresas que precisam de ajuda urgente com os melhores profissionais disponíveis agora. Sem burocracia, apenas agilidade.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="bg-surface-container-lowest p-3 rounded-xl shadow-[0px_24px_48px_rgba(17,28,45,0.06)] flex items-center gap-2 max-w-xl group focus-within:ring-2 ring-primary/10 transition-all">
              <div className="flex items-center gap-3 px-4 flex-grow">
                <span className="material-symbols-outlined text-outline">search</span>
                <input className="w-full border-none focus:ring-0 text-on-surface placeholder:text-outline bg-transparent py-2" placeholder="Ex: Cozinheiro, Limpeza, Garçom..." type="text"/>
              </div>
              <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] active:scale-95 transition-all">
                Buscar
              </button>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-4 border-background overflow-hidden bg-surface-container-high">
                  <img className="w-full h-full object-cover" alt="Avatar sorridente" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl3XakZGUI6tZrZ4SStdPuTuNt6eM7nMLaRj8w3wtNuH2_-aX_d9nlAoC55OJ5mOtXpzraG7ybc8KBSlZPI5yGOgaA_P6zcQq9QIpsdHU65ZY-NDQSqfqLi8hUYbEi-IYp4pp14iYvrZWXaZQbCdbls5cigNTV19MzP7Bmq1O6qpyfSLqHX98tuvuAPQsRtFMidH2G-yYZeGVpYIawnOoEYfAkZCreFBjQmyj-USRz5ogtS_RZsade8ezmTnmWya1obwwEJkVYLhI"/>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-background overflow-hidden bg-surface-container-high">
                  <img className="w-full h-full object-cover" alt="Avatar freelancer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtFK93Zx_2eJERsjRE6nhbxoWJ-vzPf0HahGIId4N5JR4afwammagNJ5qnkdSY973Ehoy0tSKgDcx7ca0qDfRCvQw6gMiL3bCoxzazR_VzKqyFe0uUhxZ7SADQEMKKzh8zI-PRsRJJcjF5llw4IDBc8uXI0ULoKR7nDH7LMbBtO6324czqzXgG2-0DN7AWlaV4lPR1lBUo29ZyHYgULhVkBQOigIbaM18FAmVFM_waisG6VuRPEFJMazdwfbG__Wp8PZLAFaixFIE"/>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-background overflow-hidden bg-surface-container-high">
                  <img className="w-full h-full object-cover" alt="Avatar cozinheiro" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0SrXdFLI9Rxpdi6MljCjf7lpajN_Yqc9AF0_zI_ODlpRFQrGU8A_wc4mioGhJ6TJqahdjoJH-pEX726hNWOmnEKAxDuc0dd34FEEOimVioQqS5yO-2vdDJ_ujIVoZahcgI7H3Qa9uhA0IQ7UmTIwNLJp-rroV4Di5DZm-74lw0era4sRRVr_aw8K8RuqmT95Wp9yRK_g-bE8ecikMPbhmEpn134WlSVNvSeF-hWhkAGXMuCmbgsyyk3Dkc_0HoOBlH4a3iqZr418"/>
                </div>
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">
                <span className="text-primary font-bold">+2.400</span> profissionais ativos na sua região
              </p>
            </div>
          </div>
          
          {/* Hero Visual (Bento Grid Style) */}
          <div className="relative grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
                <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Cozinheiro profissional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXh0Q16vYsMP3L8QdGMw02bUs_A7FRS0TXdMnUVZegKBe065UpxaXbQrLVp0i7152-RPvoqk8ESJa_Hlz-p9eFE-sR8PajUftzCN_aDzRBW7LWKRIFI_p3SbryxdPB550lPbsWRXscz2fBc5TR_1_ZtqOevI7Tb2neGBSqthaL-Xr1O7DO7DJR-kjHoIiRTwGA1x37m139-fQxSzYNKyy7Jjv6gm7Y_DEFyozxzrDczO0H4z968Kejl0vCZiYvB9tL7-qOKJhiLJg"/>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden relative group">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt="Profissional verificado" 
                  src="/verified_profiles_card_1774839592699.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                  <span className="material-symbols-outlined text-4xl text-white mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <p className="text-white font-headline font-bold text-xl leading-tight">Perfis verificados e avaliados</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="aspect-square rounded-xl bg-primary-container p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-on-primary text-3xl">timer</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-widest">REAL TIME</span>
                </div>
                <p className="text-on-primary font-headline font-bold text-xl leading-tight">Combine em menos de 15 minutos</p>
              </div>
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
                <img className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Equipe de limpeza profissional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFKcZreBkdm1PpCanB2-TTdkx2IAE2QPNyOQfGcIAYG05bC4Qu9WYwuZby_nDiVprgHxIFKRHdnRYlsvEQ327bSnISb3WgDcOhXtCBY6feW6oZRhVzKRwMmmEl5engvSoEvDchbrE6f1HGuWnG97S1VUAELWgSTl8vOWVVPGu-8axEKZcTDiNngucv1lKB3M6akCLBl-i8JrwK-9A5VjV1b4QiXBP87d8IH2Q84LzreqxYz_D-HCCeu3WGPFP-pBsKD4ayP6SJnNc"/>
              </div>
            </div>
            {/* Abstract Tonal Background Element */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-surface-container rounded-full blur-[100px] opacity-50"></div>
          </div>
        </div>
      </section>

      {/* 3. Social Proof Strip */}
      <section className="py-12 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-outline-variant font-bold text-sm uppercase tracking-widest mb-10">Empresas que já resolvem escalas conosco</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 font-black text-2xl text-on-surface">
              <span className="material-symbols-outlined text-primary">restaurant</span> Garage 99 Burger
            </div>
            <div className="flex items-center gap-2 font-black text-2xl text-on-surface">
              <span className="material-symbols-outlined text-primary">local_pizza</span> Cantina Nonna Bella
            </div>
            <div className="flex items-center gap-2 font-black text-2xl text-on-surface">
              <span className="material-symbols-outlined text-primary">store</span> Empório Central
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Value Prop */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold text-on-surface mb-4">Resolva sua escala de trabalho <br/>sem burocracia.</h2>
            <p className="text-on-surface-variant max-w-xl text-lg">Esqueça os grupos de WhatsApp lotados. Tenha controle total da sua operação com segurança.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-xl bg-surface-container-low shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Velocidade Vapt</h3>
              <p className="text-on-surface-variant">Publique em 30 segundos e receba as primeiras candidaturas em menos de 10 minutos.</p>
            </div>
            <div className="p-10 rounded-xl bg-surface-container-low shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-16 h-16 rounded-2xl bg-secondary-container/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-3xl">verified_user</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Filtro de Confiança</h3>
              <p className="text-on-surface-variant">Freelancers avaliados pela comunidade local. Sem surpresas no dia do evento.</p>
            </div>
            <div className="p-10 rounded-xl bg-surface-container-low shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-tertiary text-3xl">payments</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pagamento Direto</h3>
              <p className="text-on-surface-variant">Combine valores e pague diretamente ao profissional. Sem taxas ocultas na transação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Categories Grid */}
      <section className="py-24 px-6 bg-surface-container">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-16">O que você precisa hoje?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-surface-container-lowest p-8 rounded-xl text-center hover:bg-primary-container hover:text-white transition-all cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <span className="font-bold">Restaurantes</span>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl text-center hover:bg-primary-container hover:text-white transition-all cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20">
                <span className="material-symbols-outlined">shopping_bag</span>
              </div>
              <span className="font-bold">Varejo</span>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl text-center hover:bg-primary-container hover:text-white transition-all cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20">
                <span className="material-symbols-outlined">cleaning_services</span>
              </div>
              <span className="font-bold">Limpeza</span>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl text-center hover:bg-primary-container hover:text-white transition-all cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20">
                <span className="material-symbols-outlined">celebration</span>
              </div>
              <span className="font-bold">Eventos</span>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl text-center hover:bg-primary-container hover:text-white transition-all cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20">
                <span className="material-symbols-outlined">moped</span>
              </div>
              <span className="font-bold">Entregas</span>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl text-center hover:bg-primary-container hover:text-white transition-all cursor-pointer group shadow-sm">
              <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20">
                <span className="material-symbols-outlined">more_horiz</span>
              </div>
              <span className="font-bold">Outros</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Happening Now Live Feed */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Urgent Jobs */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold">Vagas Urgentes na sua região</h2>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between group cursor-pointer hover:bg-primary-container/5 transition-colors">
                <div className="flex items-center gap-6">
                  <img className="w-14 h-14 rounded-full object-cover" alt="Bistro" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC3_ibz2jvexLEgHXMdC0Jrt2zygXc6eRjPYeeEX9mJDZJl41o_0fwPIHUIJOeKuM3AeBcFmadROySf9lfnUt5PQsKZVWGjKxkT3ywv8Rxp8YguC6N-eQRe2fx7D8U1nhGvpaESEb6GK2bHknHQrlHboDsGRimHStjzxP_pl-u5AiufzmRTwMIjp68nGWsiILVQXDvY4IhS5mXf2gM5elg5qx1jU1fyZFCPg6ajPlkBdJKPrGbimkGy6AH2gkwTeeDCVBaW2DRYvc"/>
                  <div>
                    <h4 className="font-bold text-lg">Ajudante de Cozinha</h4>
                    <p className="text-sm text-on-surface-variant">Centro • Hoje, 18:00</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary">R$ 120,00</p>
                  <span className="text-xs font-bold text-secondary uppercase">3 Vagas</span>
                </div>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between group cursor-pointer hover:bg-primary-container/5 transition-colors">
                <div className="flex items-center gap-6">
                  <img className="w-14 h-14 rounded-full object-cover" alt="Coffee shop" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUfJQnJomPCG-p5I4YfDxbv1vIt2cq4mvWUtY6kjCZXANovN4f_5y1SVfSgYkaChBvaT1jzqDhUYRywmAXip_rDSuYrbiGjHZaQNW5kMvrHYkjVi5Ofj3c2rexgkG2jBV0DtritJ2So3w4w5mifnq2zowxJWKr-zE7vXduTaoDRlXKfVHstfYdKOzzIb0qyNkuuBMnI9eCJWXwn5_U1Vu-u--J17aeUU_tpjnrMHA_Vt3LFw7LSh-JZg4rUFlGtwRvlrl4GNnFea4"/>
                  <div>
                    <h4 className="font-bold text-lg">Barista / Atendimento</h4>
                    <p className="text-sm text-on-surface-variant">Sua Região • Amanhã</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary">R$ 90,00</p>
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Final de Semana</span>
                </div>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between group cursor-pointer hover:bg-primary-container/5 transition-colors">
                <div className="flex items-center gap-6">
                  <img className="w-14 h-14 rounded-full object-cover" alt="Clothing store" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBo7rkV8yWzoY4PucksGoKAJrdDunV859ABBf7nXF4kgTB8b_4LDRUvjhn245DFdpizBMtAijaC4nqUYnsjRrX-xUAbAr0419E0-WuXZfa38E1JaOiWhtH_Wi4KkdHWEUB1WwNqTCsQfWRKJFOw0xsRdinF7e0NUpDBHXwd2RWBDaB0gMgQjfD89SwLzTHFvtUnm7lhaK4XdCF8DKlIkXe29HZiz5mv_dRiyrkrvOkI1_SENw1aYqgG-uZfSOsODUGQerV-2iNfiJw"/>
                  <div>
                    <h4 className="font-bold text-lg">Promotor de Vendas</h4>
                    <p className="text-sm text-on-surface-variant">Shopping Próximo • 20/Out</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary">R$ 150,00</p>
                  <span className="text-xs font-bold text-secondary uppercase">Destaque</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Featured Freelancers */}
          <div>
            <h2 className="text-2xl font-bold mb-10">Freelancers Disponíveis</h2>
            <div className="space-y-4">
              <div className="p-6 bg-surface-container-high rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <img className="w-14 h-14 rounded-full object-cover ring-2 ring-primary" alt="Portrait Ricardo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRH3xvDZBH3VFaOZKPGz7OnGeZAGmKGRJOLCRV2XKTCVRUCQrQwu8rLMkR3CNHs_reEAQecJTy4rhvIso3uUb2cPNwTDm9jVVSk3mjclTj5dje2gAhjt37rhb09001RqJzVd-OmCljOnUhJ71q7EVzgr_9QbDSq-RikTgp_4tU6RWH6II3bAa8yzOp_voNArnmGd9R_KZjAfGTMwMATC0YNw_ws5S_fBDvli8XN7aPr1dv12xILQKegGs_HVK0GxQ5R2PxLD7sVRo"/>
                  <div>
                    <h4 className="font-bold text-lg flex items-center gap-2">Ricardo Silva <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span></h4>
                    <p className="text-sm text-on-surface-variant">Garçom • 4.9 ★ (22 trampos)</p>
                  </div>
                </div>
                <button className="bg-surface-container-lowest px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <span className="material-symbols-outlined text-sm">lock</span> Mensagem
                </button>
              </div>
              <div className="p-6 bg-surface-container-high rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <img className="w-14 h-14 rounded-full object-cover ring-2 ring-primary" alt="Portrait Ana Clara" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwiWkCastEUOi9tGKWhkep6_rhufLoVANm5r_CaafGKi8ZIroCEhQYr3MMum-IM9KG-S5pE2dtm79dBwOrG0gMwCs10JaG0vShe9E439FKa21630FbZQMYypEz2F1e_1XJ8ObBOBTI98OF4zaVzVFcasCBSD6tip0_fg4BmR-dntyj3BRoX2R5dBwKs35bGzgRqCqKkdN4LKeW4Bgn_Q23PZYihRglkYUdmZQmkEPw8jAgVypI0fK1sig8ctfFZ4xeojUxvXmbheo"/>
                  <div>
                    <h4 className="font-bold text-lg flex items-center gap-2">Ana Clara <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span></h4>
                    <p className="text-sm text-on-surface-variant">Recepcionista • 5.0 ★ (8 trampos)</p>
                  </div>
                </div>
                <button className="bg-surface-container-lowest px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <span className="material-symbols-outlined text-sm">lock</span> Mensagem
                </button>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-on-surface-variant italic">Assine o Plano Beta para desbloquear contatos diretos.</p>
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section className="py-24 px-6 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-on-surface mb-4">Como o VaptVaga funciona?</h2>
            <p className="text-on-surface-variant">Transparência total do anúncio ao pagamento.</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="hidden md:block absolute top-1/4 left-[30%] right-[30%] h-0.5 border-t-2 border-dashed border-outline-variant"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 text-2xl font-black shadow-lg shadow-primary/30">1</div>
              <h4 className="text-xl font-bold mb-4">Crie Perfil</h4>
              <p className="text-on-surface-variant px-6">Empresa ou Freela, cadastre-se em segundos com suas necessidades ou habilidades.</p>
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 text-2xl font-black shadow-lg shadow-primary/30">2</div>
              <h4 className="text-xl font-bold mb-4">Dê o Match</h4>
              <p className="text-on-surface-variant px-6">O sistema cruza horários e localização. Escolha o melhor perfil para o dia.</p>
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 text-2xl font-black shadow-lg shadow-primary/30">3</div>
              <h4 className="text-xl font-bold mb-4">Combine e Trampe</h4>
              <p className="text-on-surface-variant px-6">Tire dúvidas no chat, confirme a presença e pronto. Operação garantida.</p>
            </div>
            </div>
          </div>
        </section>

        <section id="planos" className="py-24 px-6 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Flexibilidade para Você
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight">
              Escolha o plano ideal <br className="hidden md:block" />
              para o seu <span className="text-primary italic">momento.</span>
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
              Transparência total e flexibilidade para você focar no que importa: 
              staff de qualidade ou renda extra imediata.
            </p>

            {/* Role Toggle */}
            <div className="flex justify-center pt-8">
              <div className="p-1.5 bg-surface-container rounded-2xl flex items-center shadow-inner">
                <button
                  onClick={() => setRole('company')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    role === 'company'
                      ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Sou Empresa
                </button>
                <button
                  onClick={() => setRole('freelancer')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    role === 'freelancer'
                      ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <UserCircle2 className="w-4 h-4" />
                  Sou Freelancer
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch relative">
            <AnimatePresence mode="wait">
              {plans[role].map((plan, index) => (
                <motion.div
                  key={`${role}-${plan.name}`}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex flex-col p-10 md:p-12 rounded-[2.5rem] relative group border-t-2 border-transparent transition-all hover:translate-y-[-4px] ${
                    plan.highlighted
                      ? 'bg-primary text-on-primary shadow-2xl shadow-primary/30 ring-4 ring-primary/20'
                      : 'bg-surface-container-low border-surface-container text-on-surface hover:shadow-xl hover:shadow-black/5'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                      Mais Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className={`text-xl font-bold uppercase tracking-widest ${
                      plan.highlighted ? 'text-primary-fixed-dim' : 'text-primary'
                    }`}>
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl font-black italic">R$ {plan.price}</span>
                      <span className={`text-sm font-bold ${
                        plan.highlighted ? 'text-primary-fixed-dim' : 'text-on-surface-variant'
                      }`}>
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <div className={`w-full h-px mb-8 ${
                    plan.highlighted ? 'bg-white/10' : 'bg-on-surface-variant/10'
                  }`} />

                  <ul className="space-y-5 mb-12 flex-1">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-4">
                        <div className={`mt-1 p-0.5 rounded-full ${
                          plan.highlighted ? 'bg-secondary-container' : 'bg-primary/10'
                        }`}>
                          <Check className={`w-3.5 h-3.5 ${
                            plan.highlighted ? 'text-on-secondary-container' : 'text-primary'
                          }`} strokeWidth={3} />
                        </div>
                        <span className="font-semibold leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={role === 'company' ? '/onboarding/role?type=company' : '/onboarding/role?type=freelancer'}
                    className={`w-full py-5 rounded-full font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95 group/btn ${
                      plan.highlighted
                        ? 'bg-white text-primary hover:bg-surface-bright shadow-lg'
                        : 'bg-on-surface text-white hover:bg-on-surface/90 shadow-lg shadow-black/5'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto rounded-xl p-12 md:p-24 text-center text-on-primary relative overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)' }}>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Chega de dor de cabeça <br/>com falta de staff.</h2>
            <p className="text-xl mb-12 text-on-primary/80 max-w-2xl mx-auto">Junte-se a centenas de empresas e profissionais em todo o Brasil que já usam o VaptVaga para girar a operação.</p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link to="/onboarding/role?type=company" className="bg-white text-primary px-10 py-5 rounded-full flex justify-center items-center font-black text-lg hover:bg-surface-container-lowest transition-colors">Quero Contratar</Link>
              <Link to="/onboarding/role?type=freelancer" className="bg-primary-container border-2 border-white/30 flex justify-center items-center text-white px-10 py-5 rounded-full font-black text-lg hover:bg-white/10 transition-colors">Quero Candidatar</Link>
            </div>
          </div>
          {/* Texture Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
      </section>
    </>
  );
};
