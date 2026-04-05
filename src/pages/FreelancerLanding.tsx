import React from 'react';
import { Link } from 'react-router-dom';
import { PricingSection } from '../components/sections/PricingSection';

export const FreelancerLanding: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Section: The Fluid Architect Philosophy */}
      <section className="relative px-6 pt-0 pb-20 lg:pt-0 lg:pb-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase bg-secondary-container text-secondary rounded-full">
              Disponível em todo o Brasil
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-6">
              Fature alto no seu tempo livre.
            </h1>
            <p className="text-base lg:text-xl text-on-surface-variant leading-relaxed mb-10 max-w-xl">
              Encontre turnos em restaurantes, lojas e eventos perto de você. Sem taxas na sua diária. O valor que você vê é o valor que você recebe.
            </p>
            {/* Asymmetrical Search Bar */}
            <div className="p-3 md:p-2 bg-surface-container-lowest rounded-3xl md:rounded-full shadow-xl flex flex-col md:flex-row gap-3 md:gap-2 max-w-2xl border border-outline-variant/10">
              <div className="flex items-center flex-1 px-4 md:px-6 py-2 md:py-0 gap-3">
                <span className="material-symbols-outlined text-primary">search</span>
                <input
                  className="w-full min-w-0 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline text-sm sm:text-base font-medium overflow-hidden text-ellipsis"
                  placeholder="Que tipo de freela você busca?"
                  type="text"
                />
              </div>
              <button className="w-full md:w-auto bg-primary hover:bg-primary-container text-on-primary px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-primary/20">
                Buscar Vagas
              </button>
            </div>
          </div>
          <div className="relative block mt-12 lg:mt-0">
            <div className="lg:aspect-square h-64 lg:h-auto bg-gradient-to-br from-primary to-primary-container rounded-xl rotate-3 absolute inset-0 opacity-10"></div>
            <img
              alt="Freelancer sorridente trabalhando"
              className="rounded-xl shadow-2xl relative z-10 w-full h-64 lg:h-full lg:aspect-square object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_Ytq4-sq1ClyAmmFUJECuC51BdSpT_wdUksiWs3rwWwyedQfmlZnNnuRpVsybwBJPtxWwh42qvuWxyhs2-Twy_FeR5qfKBx7fpM9SQJUGrNF4YbUT_AO6FJSRplTVWvBFf44AEfqOFtfsNuY68IR_ED5HsA__EX_ePOH001h5pOA_LU1ddyYkCneJd7XPf1qkXWalqg1BlRKWwhFwEslWcWennMnompdvhqVYOxQRc66NhSD0zyG5DvoqwXKZLdUBSrOR1dxTgNA"
            />
            {/* Floating Badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:-left-6 lg:bottom-12 bg-surface-container-lowest p-4 lg:p-6 rounded-lg shadow-2xl z-20 flex sm:flex items-center gap-4 whitespace-nowrap">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary-container rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary text-xl lg:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <div>
                <p className="text-[10px] lg:text-xs text-on-surface-variant font-bold uppercase tracking-widest">Pagamento</p>
                <p className="text-base lg:text-lg font-bold text-on-surface">Direto na conta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-surface-container-low py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-outline mb-10 uppercase tracking-[0.2em]">
            Empresas que contratam pelo VaptVaga
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl">lunch_dining</span>
              <span className="text-xl font-bold font-headline">Garage 99 Burger</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl">restaurant</span>
              <span className="text-xl font-bold font-headline">Cantina Nonna Bella</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl">shopping_bag</span>
              <span className="text-xl font-bold font-headline">Moda Brasil</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl">celebration</span>
              <span className="text-xl font-bold font-headline">Eventos Pro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-10 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-xl transition-all border border-outline-variant/10 group">
            <div className="w-16 h-16 bg-primary-fixed rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Dinheiro na Mão</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Pagamento direto e sem taxas abusivas. O que você ganha no turno é 100% seu, direto via PIX.
            </p>
          </div>
          <div className="p-10 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-xl transition-all border border-outline-variant/10 group">
            <div className="w-16 h-16 bg-secondary-container rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Liberdade Total</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Trabalhe quando e onde quiser. Você faz sua própria agenda e escolhe os estabelecimentos favoritos.
            </p>
          </div>
          <div className="p-10 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-xl transition-all border border-outline-variant/10 group">
            <div className="w-16 h-16 bg-tertiary-fixed rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Reputação PRO</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Construa seu perfil com avaliações reais e torne-se um profissional disputado pelas melhores empresas.
            </p>
          </div>
        </div>
      </section>

      {/* NEW COMPANY SECTION */}
      <section className="py-16 lg:py-24 px-6 bg-surface-container-low border-y border-outline-variant/10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 lg:items-center gap-12 lg:gap-16">
          <div className="flex flex-col items-start text-left order-2 lg:order-1">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase bg-primary-container text-on-primary-container rounded-full">Para Estabelecimentos</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
              Precisa de freelancers para sua operação?
            </h2>
            <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Evite dores de cabeça com falta de equipe. Publique suas vagas em minutos e conecte-se com profissionais qualificados da cidade, prontos para o turno. Pra ontem.
            </p>
            <Link
              to="/empresas"
              className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 w-full justify-center md:w-auto"
            >
              Quero contratar freelas
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-primary/20 transform translate-x-4 translate-y-4 rounded-3xl -z-10 blur-xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=60" 
              alt="Dono de estabelecimento satisfeito" 
              className="rounded-3xl shadow-2xl w-full h-64 lg:h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories & Live Feed Section */}
      <section className="py-24 bg-surface" id="vagas">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-extrabold mb-4">Categorias em Alta</h2>
              <p className="text-on-surface-variant max-w-md">Explore os setores que mais contratam freelancers qualificados na nossa plataforma hoje.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-24">
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] group cursor-pointer shadow-md">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60" alt="Restaurante" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white flex flex-col gap-2">
                <span className="material-symbols-outlined text-3xl">restaurant</span>
                <span className="font-bold text-xl">Restaurante</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] group cursor-pointer shadow-md">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60" alt="Varejo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white flex flex-col gap-2">
                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                <span className="font-bold text-xl">Varejo</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] group cursor-pointer shadow-md">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60" alt="Limpeza" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white flex flex-col gap-2">
                <span className="material-symbols-outlined text-3xl">cleaning_services</span>
                <span className="font-bold text-xl">Limpeza</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] group cursor-pointer shadow-md">
              <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60" alt="Eventos" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white flex flex-col gap-2">
                <span className="material-symbols-outlined text-3xl">local_activity</span>
                <span className="font-bold text-xl">Eventos</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] group cursor-pointer shadow-md col-span-2 md:col-span-1 lg:col-span-1">
              <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&auto=format&fit=crop&q=60" alt="Entrega" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white flex flex-col gap-2">
                <span className="material-symbols-outlined text-3xl">delivery_dining</span>
                <span className="font-bold text-xl">Entrega</span>
              </div>
            </div>
          </div>

          {/* Live Feed - Swipeable Carousel */}
          <div className="bg-surface-container-highest/30 rounded-xl p-6 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <h2 className="text-xl lg:text-2xl font-bold">Vagas urgentes abertas agora</h2>
            </div>

            {/* Desktop: stacked list */}
            <div className="hidden lg:flex flex-col gap-4">
              {[
                { icon: 'person', title: 'Garçom Extra', location: 'São Paulo, Jardins', salary: 'R$ 120' },
                { icon: 'support_agent', title: 'Auxiliar de Eventos', location: 'Curitiba, Batel', salary: 'R$ 100' },
                { icon: 'cleaning_services', title: 'Auxiliar de Limpeza', location: 'Belo Horizonte, Centro', salary: 'R$ 90' },
              ].map((job) => (
                <div key={job.title} className="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between gap-4 border border-outline-variant/10 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">{job.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{job.title}</h4>
                      <p className="text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_on</span> {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-on-surface-variant font-medium">Diária</p>
                      <p className="text-2xl font-black text-primary">{job.salary}</p>
                    </div>
                    <Link to="/onboarding/role?type=freelancer" className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold">Candidatar</Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: full-width swipeable carousel */}
            <div className="lg:hidden">
              <div
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {[
                  { icon: 'person', title: 'Garçom Extra', location: 'São Paulo, Jardins', salary: 'R$ 120', tag: 'Restaurante' },
                  { icon: 'support_agent', title: 'Auxiliar de Eventos', location: 'Curitiba, Batel', salary: 'R$ 100', tag: 'Eventos' },
                  { icon: 'cleaning_services', title: 'Auxiliar de Limpeza', location: 'BH, Centro', salary: 'R$ 90', tag: 'Limpeza' },
                  { icon: 'shopping_cart', title: 'Promotor de Vendas', location: 'Rio de Janeiro, Lapa', salary: 'R$ 110', tag: 'Varejo' },
                ].map((job) => (
                  <div
                    key={job.title}
                    className="flex-none w-full snap-center bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">{job.icon}</span>
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-secondary bg-secondary-container px-2 py-0.5 rounded-full">{job.tag}</span>
                        <h4 className="text-xl font-bold mt-1">{job.title}</h4>
                        <p className="text-on-surface-variant text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span> {job.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-on-surface-variant font-medium">Diária</p>
                        <p className="text-3xl font-black text-primary">{job.salary}</p>
                      </div>
                      <Link
                        to="/onboarding/role?type=freelancer"
                        className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                      >
                        Candidatar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Scroll hint */}
              <p className="text-center text-xs text-outline mt-4 font-medium">← Arraste para ver mais vagas →</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden" id="como-funciona">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-center mb-20">Como funciona para você</h2>
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Step 1 */}
          <div className="flex-1 text-center relative z-10 bg-surface md:bg-transparent">
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-8 shadow-2xl shadow-primary/30">1</div>
            <h3 className="text-2xl font-bold mb-4">Baixe o App</h3>
            <p className="text-on-surface-variant">Crie seu perfil profissional em menos de 2 minutos e valide sua identidade.</p>
          </div>
          {/* Line */}
          <div className="hidden lg:block h-0.5 bg-gradient-to-r from-primary to-secondary flex-1 -mt-16 opacity-30"></div>
          {/* Step 2 */}
          <div className="flex-1 text-center relative z-10 bg-surface md:bg-transparent">
            <div className="w-24 h-24 bg-secondary text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-8 shadow-2xl shadow-secondary/30">2</div>
            <h3 className="text-2xl font-bold mb-4">Escolha o Turno</h3>
            <p className="text-on-surface-variant">Navegue pelo mapa e selecione a vaga que melhor se encaixa na sua rotina.</p>
          </div>
          {/* Line */}
          <div className="hidden lg:block h-0.5 bg-gradient-to-r from-secondary to-primary flex-1 -mt-16 opacity-30"></div>
          {/* Step 3 */}
          <div className="flex-1 text-center relative z-10 bg-surface md:bg-transparent">
            <div className="w-24 h-24 bg-primary-container text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-8 shadow-2xl shadow-primary-container/30">3</div>
            <h3 className="text-2xl font-bold mb-4">Trampe e Receba</h3>
            <p className="text-on-surface-variant">Faça o seu melhor no turno e receba o pagamento direto no app logo após a conclusão.</p>
          </div>
        </div>
      </section>

      <PricingSection initialRole="freelancer" />

      {/* Final CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-xl p-12 lg:p-24 text-center text-on-primary shadow-2xl relative overflow-hidden">
          {/* Abstract Pattern Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 100 Q 50 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"></path>
              <path d="M0 50 Q 50 0 100 50" fill="none" stroke="currentColor" strokeWidth="2"></path>
            </svg>
          </div>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-8 relative z-10">Pronto para o próximo turno?</h2>
          <p className="text-xl lg:text-2xl text-on-primary/80 mb-12 max-w-2xl mx-auto relative z-10">Junte-se a milhares de freelancers que estão transformando seu tempo livre em dinheiro real.</p>
          <Link to="/onboarding/role?type=freelancer" className="inline-block px-12 py-6 bg-surface-container-lowest text-primary rounded-full font-black text-xl shadow-xl hover:scale-105 transition-transform active:scale-95 relative z-10">
            Quero me cadastrar agora
          </Link>
        </div>
      </section>
    </div>
  );
};
