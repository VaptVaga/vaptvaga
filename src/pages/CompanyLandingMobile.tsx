import React from 'react';
import { Link } from 'react-router-dom';
import { PricingSection } from '../components/sections/PricingSection';

export const CompanyLandingMobile: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="px-6 pt-8 pb-12 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="font-headline font-extrabold text-[2.5rem] leading-[1.1] tracking-tighter text-on-surface">
            O freela perfeito para o seu negócio local. <span className="text-primary italic">Pra ontem.</span>
          </h1>
          <p className="text-on-surface-variant body-lg leading-relaxed">
            Conectamos empresas a profissionais qualificados em minutos. Sem burocracia, apenas resultados.
          </p>
        </div>
        {/* Search Bar */}
        <div className="bg-surface-container-lowest p-2 rounded-full shadow-[0px_24px_48px_rgba(17,28,45,0.06)] flex items-center gap-2 border border-outline-variant/10">
          <div className="pl-4 text-outline flex items-center gap-2 flex-1">
            <span className="material-symbols-outlined">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-on-surface w-full p-0 placeholder:text-outline/60" placeholder="Ex: Cozinheiro, Limpeza..." type="text"/>
          </div>
          <button className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all">Buscar</button>
        </div>
        {/* Horizontal Benefit Cards */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6 py-4">
          <div className="min-w-[280px] bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="h-40 w-full rounded-lg bg-surface-container overflow-hidden">
              <img className="w-full h-full object-cover" alt="Chef preparation professional kitchen local restaurant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7OvRHQckgqHbWYOwANCla8k_rj4ndksGx8h3c4aL29tUif05Ci3glhgwvtXc95yMjLXSeEYU2XNRTlqqaQDaE4p9YaG5bj6-4zR--84ylE42s1YeIiTdR9WQscxzq9XLrEg8bGV9fFzGTL4LkMAC63oO9Sw-kiJN1ehCafK6-fXb2rc98K7WZeippLmKSwZCq9OzBTCsoebtq2EoTP5GowSiNpajJoXbPFRl48-vld9Ur7YiPITXgb7mr6CBfRZ6SkIP3WUzaBnk"/>
            </div>
            <div className="flex items-center gap-2 text-secondary font-bold text-sm">
              <span className="material-symbols-outlined text-base">bolt</span>
              Contratação Instantânea
            </div>
          </div>
          <div className="min-w-[280px] bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="h-40 w-full rounded-lg bg-surface-container overflow-hidden">
              <img className="w-full h-full object-cover" alt="Perfis verificados" src="/verified_profiles_card_1774839592699.png"/>
            </div>
            <div className="flex items-center gap-2 text-secondary font-bold text-sm">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Perfis verificados
            </div>
          </div>
          <div className="min-w-[280px] bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="h-40 w-full rounded-lg bg-surface-container overflow-hidden">
              <img className="w-full h-full object-cover" alt="Mobile phone payment confirmation screen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjWKnZml6xOMCG4CqMlFmMNN-mQMsYO5rH1d-U01HsJ3VNJbgERYEtyiYoHss7GHcAdxBQO1DhK9KC-mevrH_atL9AQ6iDldHZX21XYwJUN9kpP1ZyNP5MCLov_9zZoewoppjtozV91SmcZVZAk7Ja2mrOGJ5LgfL-MOSPtk_Cu0gBFyuAIoEJmA-Ar_9aeK7b-VB1y8PlzH7hAUmhbqWUcrkw-LxR_atR4O4K_Pvg8Jlegn2l7UQqS0fW6CE9xs4CYF8seeoBl4M"/>
            </div>
            <div className="flex items-center gap-2 text-secondary font-bold text-sm">
              <span className="material-symbols-outlined text-base">schedule</span>
              Combine em 15 min
            </div>
          </div>
        </div>
      </section>
      
      {/* Social Proof */}
      <section className="bg-surface-container-low py-8 overflow-hidden">
        <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-outline mb-6">Empresas que confiam no VaptVaga</p>
        <div className="flex gap-12 items-center opacity-40 px-6 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <span className="font-headline font-black text-xl italic">Garage 99 Burger</span>
          <span className="font-headline font-black text-xl italic">Cantina Nonna Bella</span>
          <span className="font-headline font-black text-xl italic">Espaço Clean</span>
          <span className="font-headline font-black text-xl italic">Varejo Express</span>
        </div>
      </section>
      
      {/* Value Prop Cards */}
      <section className="px-6 py-16 flex flex-col gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 border border-outline-variant/10 shadow-[0px_24px_48px_rgba(17,28,45,0.06)]">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">speed</span>
          </div>
          <h3 className="font-headline font-bold text-xl">Velocidade Vapt</h3>
          <p className="text-on-surface-variant leading-relaxed">Publique sua vaga e receba propostas em menos de 5 minutos.</p>
        </div>
        <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 border border-outline-variant/10 shadow-[0px_24px_48px_rgba(17,28,45,0.06)]">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">shield</span>
          </div>
          <h3 className="font-headline font-bold text-xl">Filtro de Confiança</h3>
          <p className="text-on-surface-variant leading-relaxed">Apenas profissionais com histórico positivo e documentos validados.</p>
        </div>
        <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 border border-outline-variant/10 shadow-[0px_24px_48px_rgba(17,28,45,0.06)]">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <h3 className="font-headline font-bold text-xl">Pagamento Direto</h3>
          <p className="text-on-surface-variant leading-relaxed">Combine e pague diretamente ao profissional, sem taxas escondidas.</p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-6 py-12 bg-surface-container-low">
        <h2 className="font-headline font-extrabold text-2xl mb-8 tracking-tight">Categorias</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-3 bg-surface-container-lowest p-6 rounded-xl text-center shadow-sm border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">restaurant</span>
            </div>
            <span className="font-bold text-sm">Restaurantes</span>
          </div>
          <div className="flex flex-col items-center gap-3 bg-surface-container-lowest p-6 rounded-xl text-center shadow-sm border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">shopping_bag</span>
            </div>
            <span className="font-bold text-sm">Varejo</span>
          </div>
          <div className="flex flex-col items-center gap-3 bg-surface-container-lowest p-6 rounded-xl text-center shadow-sm border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">cleaning_services</span>
            </div>
            <span className="font-bold text-sm">Limpeza</span>
          </div>
          <div className="flex flex-col items-center gap-3 bg-surface-container-lowest p-6 rounded-xl text-center shadow-sm border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">celebration</span>
            </div>
            <span className="font-bold text-sm">Eventos</span>
          </div>
          <div className="flex flex-col items-center gap-3 bg-surface-container-lowest p-6 rounded-xl text-center shadow-sm border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">delivery_dining</span>
            </div>
            <span className="font-bold text-sm">Entregas</span>
          </div>
          <div className="flex flex-col items-center gap-3 bg-surface-container-lowest p-6 rounded-xl text-center shadow-sm border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">more_horiz</span>
            </div>
            <span className="font-bold text-sm">Outros</span>
          </div>
        </div>
      </section>

      {/* Live Feed Section */}
      <section className="px-6 py-16 flex flex-col gap-12">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-extrabold text-2xl tracking-tight">Vagas Urgentes na sua região</h2>
            <span className="bg-error/10 text-error text-[0.65rem] font-black px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
              AO VIVO
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-primary font-bold">G99</div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Chapeiro Noturno</h4>
                <p className="text-xs text-on-surface-variant">Garage 99 Burger • 1.2km</p>
              </div>
              <div className="text-right">
                <span className="block text-secondary font-black text-sm">R$ 120</span>
                <span className="text-[0.6rem] text-outline font-bold uppercase">Hoje</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-primary font-bold">NB</div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Garçom/Garçonete</h4>
                <p className="text-xs text-on-surface-variant">Nonna Bella • 0.8km</p>
              </div>
              <div className="text-right">
                <span className="block text-secondary font-black text-sm">R$ 95</span>
                <span className="text-[0.6rem] text-outline font-bold uppercase">Amanhã</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-headline font-extrabold text-2xl tracking-tight mb-6">Freelancers Disponíveis</h2>
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img className="w-full h-full object-cover" alt="Professional male" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn0sXFmQ7vVifS6vklKnAScyuJeG9LDTXZ4eNR5VN2a8cM3Xi8u7wKlbZ4XjzlS3pWbnKxskhtHdPCB8SzOF-shNsPZ-m_6SN3P8hOQ7pnpL7kT9JIxzTeEE7AN8dUZeCJrZ-OQGIO4JY77HgdMSG1cxGlw98aOk_WEonK696Jl8gP4NlBP96k0XLRlR8skPGmfyEL_JCd8ofLqqW96haIkHvGs0XhFN0-pM6bh1TZJaPCO5Si4MO7aXRvJxzS-j3-ekeonVQ8xRk"/>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Ricardo S.</h4>
                <div className="flex items-center gap-1 text-xs text-secondary font-bold">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  4.9 • Cozinheiro
                </div>
              </div>
              <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-[0.65rem] font-black uppercase shadow-sm">Mensagem</button>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img className="w-full h-full object-cover" alt="Professional female" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_M6UhG1tv1wo3Z_TpzFVzs1vHFRRDNsGYETD1XOLIMYrDW1wOVoqW2XnXzeOw-qShkZcIfm9242oRbNzNMl-OePGTVb8RwMrgwV-unPitdu9f083CHk26PtYS4vQg_k3x2bCL74UgrC0MqGHoojJ-6Prwn6wT6kQgRuzry30PlF3UlxWUoXHJkHEldsAmK83W0r_fOUYy9Gu8JvzeF58uJhrDuyimNDoxQtl1NuNIksLdDkn1kNo_kzxKbbFoE_Y5Xmze7SJ32hU"/>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Ana Clara T.</h4>
                <div className="flex items-center gap-1 text-xs text-secondary font-bold">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  5.0 • Atendimento
                </div>
              </div>
              <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-[0.65rem] font-black uppercase shadow-sm">Mensagem</button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-surface-container">
        <h2 className="font-headline font-extrabold text-3xl mb-12 text-center tracking-tight">Como funciona?</h2>
        <div className="flex flex-col gap-10">
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div className="flex flex-col gap-2">
              <h4 className="font-headline font-bold text-lg">Publique sua vaga</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Diga o que você precisa, o horário e quanto pretende pagar.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div className="flex flex-col gap-2">
              <h4 className="font-headline font-bold text-lg">Receba propostas</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Em minutos, profissionais qualificados entrarão em contato via chat.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div className="flex flex-col gap-2">
              <h4 className="font-headline font-bold text-lg">Combine e feche</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Analise o perfil, combine os detalhes e resolva sua demanda.</p>
            </div>
          </div>
        </div>
      </section>

      <PricingSection initialRole="company" />

      {/* Final CTA Banner */}
      <section className="px-6 py-12">
        <div className="bg-primary p-10 rounded-xl text-center text-white flex flex-col gap-8 shadow-[0px_24px_48px_rgba(0,74,198,0.2)]">
          <h2 className="font-headline font-extrabold text-3xl leading-tight">Pronto para começar agora?</h2>
          <div className="flex flex-col gap-3">
            <Link to="/onboarding/role?type=company" className="bg-white text-primary flex items-center justify-center font-bold py-4 rounded-full text-lg active:scale-95 transition-transform">Quero Contratar</Link>
            <Link to="/onboarding/role?type=freelancer" className="bg-primary/20 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center font-bold py-4 rounded-full text-lg active:scale-95 transition-transform">Quero Candidatar</Link>
          </div>
        </div>
      </section>
    </>
  );
};
