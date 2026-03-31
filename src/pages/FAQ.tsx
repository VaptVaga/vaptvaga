import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Building2, UserCircle2 } from 'lucide-react';

type Role = 'freelancer' | 'company';

interface FAQItem {
  question: string;
  answer: string;
}

const freelancerFAQs: FAQItem[] = [
  {
    question: 'Como me cadastro como freelancer?',
    answer:
      'O cadastro é simples e rápido. Basta clicar em "Entrar" e escolher a opção "Criar conta como Freelancer". Você precisará preencher seus dados básicos, habilidades e, se preferir, anexar seu currículo ou portfólio.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer:
      'O pagamento é realizado diretamente pela empresa contratante após o turno. O VaptVaga facilita o processo, mas o valor combinado na vaga é 100% seu — sem descontos ou taxas escondidas.',
  },
  {
    question: 'Preciso ter experiência?',
    answer:
      'Não necessariamente! Muitas vagas são abertas para iniciantes. Cada empresa define seus requisitos. Quanto mais você trabalha e recebe avaliações positivas, mais oportunidades surgem.',
  },
  {
    question: 'Quantas vagas posso me candidatar por mês?',
    answer:
      'No plano gratuito, você pode se candidatar a até 2 vagas por mês. Com o Vapt PRO, suas candidaturas são ilimitadas, além de outros benefícios exclusivos.',
  },
  {
    question: 'O VaptVaga cobra alguma taxa dos freelancers?',
    answer:
      'Não cobramos taxa sobre os valores que você recebe. A plataforma é gratuita para candidaturas básicas. O plano Vapt PRO (R$ 14,90/mês) desbloqueia recursos extras como candidaturas ilimitadas e alertas prioritários.',
  },
  {
    question: 'O que é o Vapt PRO?',
    answer:
      'O Vapt PRO é o plano premium para freelancers. Por R$ 14,90/mês você tem candidaturas ilimitadas, selo PRO no perfil que chama atenção das empresas, alertas instantâneos de novas vagas e suporte prioritário.',
  },
];

const companyFAQs: FAQItem[] = [
  {
    question: 'Como publico uma vaga?',
    answer:
      'Crie sua conta como empresa, acesse o dashboard e clique em "Publicar Vaga". Preencha as informações do turno (data, horário, função, remuneração) e sua vaga fica disponível para freelancers em minutos.',
  },
  {
    question: 'Posso avaliar os freelancers após o turno?',
    answer:
      'Sim! Após cada turno concluído, você pode avaliar o freelancer com uma nota e um comentário. Isso ajuda a construir a reputação dos profissionais na plataforma e facilita contratações futuras.',
  },
  {
    question: 'Os freelancers são verificados?',
    answer:
      'Todos os freelancers passam por um processo de verificação de identidade e têm seu perfil avaliado pela comunidade. Você pode ver o histórico de avaliações antes de aceitar uma candidatura.',
  },
  {
    question: 'Como funciona o plano Negócio Ágil?',
    answer:
      'Por R$ 49,90/mês, o plano Negócio Ágil permite vagas ilimitadas, chat desbloqueado com todos os candidatos, dashboard de escala mensal, filtros avançados de busca e suporte prioritário nacional.',
  },
  {
    question: 'O VaptVaga tem suporte dedicado para empresas?',
    answer:
      'Sim! Empresas no plano Negócio Ágil têm acesso a suporte prioritário via chat e e-mail com tempo de resposta garantido. O plano gratuito inclui suporte via e-mail padrão.',
  },
  {
    question: 'Posso contratar o mesmo freelancer novamente?',
    answer:
      'Com certeza! Se você curtiu o trabalho de um freelancer, pode adicioná-lo aos seus favoritos e enviar convites diretos para novos turnos. Isso torna a gestão de sua equipe de confiança muito mais ágil.',
  },
];

const AccordionItem: React.FC<{
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ item, isOpen, onToggle }) => (
  <div className="bg-surface-container-lowest rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 lg:p-7 text-left gap-4"
    >
      <span className="font-bold text-base lg:text-lg text-on-surface leading-snug">{item.question}</span>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        className="flex-shrink-0 text-primary"
      >
        <ChevronDown className="w-5 h-5" />
      </motion.span>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="px-5 lg:px-7 pb-6 text-on-surface-variant leading-relaxed text-sm lg:text-base">
            {item.answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const FAQ: React.FC = () => {
  const [role, setRole] = useState<Role>('freelancer');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = role === 'freelancer' ? freelancerFAQs : companyFAQs;

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setOpenIndex(0);
    setSearchQuery('');
  };

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-surface w-full">
      {/* ─── Hero ─── */}
      <section className="pt-12 pb-16 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black tracking-widest uppercase">
            Central de Ajuda
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight">
            Perguntas{' '}
            <span className="text-primary italic">Frequentes</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
            Tire suas dúvidas sobre a plataforma. Se não encontrar o que procura,
            entre em contato com nosso suporte.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar uma pergunta..."
            className="w-full pl-14 pr-6 py-4 rounded-full bg-surface-container-lowest shadow-md border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline font-medium transition"
          />
        </div>

        {/* Mobile CTA */}
        <Link
          to="/onboarding/role?type=freelancer"
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-primary text-white py-4 px-8 rounded-full font-black text-base shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 mb-4"
        >
          Buscar Vagas
        </Link>

        {/* Role Toggle */}
        <div className="flex justify-center">
          <div className="p-1.5 bg-surface-container rounded-2xl flex items-center shadow-inner ring-1 ring-black/5">
            <button
              onClick={() => handleRoleChange('freelancer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                role === 'freelancer'
                  ? 'bg-white text-primary shadow-md ring-1 ring-black/5 scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <UserCircle2 className="w-4 h-4" />
              Para Freelancers
            </button>
            <button
              onClick={() => handleRoleChange('company')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                role === 'company'
                  ? 'bg-white text-primary shadow-md ring-1 ring-black/5 scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Para Empresas
            </button>
          </div>
        </div>
      </section>

      {/* ─── FAQ List ─── */}
      <section className="pb-24 px-6 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={role + searchQuery}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  item={faq}
                  isOpen={openIndex === i}
                  onToggle={() => handleToggle(i)}
                />
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-on-surface-variant font-semibold">
                  Nenhuma pergunta encontrada para "{searchQuery}"
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-primary to-primary-container rounded-3xl p-10 text-center text-white"
        >
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-3">
            Não encontrou sua resposta?
          </h2>
          <p className="text-white/80 mb-8 text-base leading-relaxed">
            Nossa equipe de suporte está pronta para te ajudar com qualquer dúvida.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-black shadow-lg hover:opacity-90 transition-all active:scale-95"
          >
            Falar com o Suporte
          </Link>
        </motion.div>
      </section>
    </div>
  );
};
