import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MessageCircle, 
  Instagram, 
  ChevronDown, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const contactChannels = [
  {
    icon: <Mail className="w-6 h-6 text-primary" />,
    title: 'E-mail oficial',
    value: 'suporte@vaptvaga.com.br',
    description: 'Para dúvidas gerais e suporte técnico especializado.',
    action: 'mailto:suporte@vaptvaga.com.br',
    label: 'Enviar e-mail',
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-primary" />,
    title: 'WhatsApp Business',
    value: '(31) 9 8289-5515',
    description: 'Atendimento humanizado de segunda a sexta, 09h às 18h.',
    action: 'https://wa.me/5531982895515',
    label: 'Iniciar conversa',
  },
  {
    icon: <Instagram className="w-6 h-6 text-primary" />,
    title: 'Nossa Comunidade',
    value: '@vaptvaga',
    description: 'Siga-nos para dicas de carreira e novidades sobre o mercado.',
    action: 'https://instagram.com/vaptvaga',
    label: 'Acompanhar perfil',
  },
];

const faqs = [
  {
    question: 'Como faço para me cadastrar como freelancer?',
    answer: 'É muito simples! Clique no botão "Entrar" no topo da página, escolha a opção "Freelancer" e siga os passos para criar seu perfil com portfólio e habilidades.',
  },
  {
    question: 'O VaptVaga cobra para as empresas publicarem vagas?',
    answer: 'Oferecemos um plano gratuito que permite a publicação de uma vaga por mês. Para maior visibilidade e volume, temos planos premium adaptados à sua necessidade.',
  },
  {
    question: 'Como funciona o sistema de candidaturas?',
    answer: 'Após encontrar uma vaga compatível, o freelancer se candidata enviando seu perfil. A empresa recebe a notificação e pode entrar em contato direto para entrevista.',
  },
];

const subjects = ['Dúvida geral', 'Problema técnico', 'Sugestão / Feedback', 'Parceria Comercial', 'Outro assunto'];

export const Contact: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      
      if (error) throw error;

      setFormState('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormState('idle'), 6000);
    } catch (err: any) {
      console.error('[Contact] Erro:', err);
      setFormState('error');
      setErrorMessage(err.message || 'Não foi possível enviar. Tente pelo WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] selection:bg-primary/20 selection:text-primary">
      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-black tracking-[0.2em] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Estamos Online Agora
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-[#1C1B1F] tracking-tight leading-[0.95] mb-8">
              Vamos criar algo <br />
              <span className="text-primary italic">incrível juntos?</span>
            </h1>
            <p className="text-xl text-[#49454F] font-medium leading-relaxed max-w-2xl">
              Nossa equipe está pronta para te ajudar a encontrar o talento perfeito ou 
              conectar você ao seu próximo grande projeto.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* ─── Left Side: Channels & FAQ ─── */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Quick Contacts */}
            <div className="grid grid-cols-1 gap-4">
              {contactChannels.map((ch, i) => (
                <motion.a
                  key={ch.title}
                  href={ch.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex items-center gap-6 p-6 bg-white border border-[#E6E1E5] rounded-[2rem] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                    {ch.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#79747E] mb-1">{ch.title}</p>
                    <p className="text-lg font-bold text-[#1C1B1F] truncate group-hover:text-primary transition-colors">{ch.value}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#CAC4D0] group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.a>
              ))}
            </div>

            {/* Specialized FAQ */}
            <div className="pt-8">
              <h3 className="text-2xl font-black text-[#1C1B1F] mb-8">Dúvidas rápidas</h3>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <motion.div 
                    key={i}
                    className="border-b border-[#E6E1E5] last:border-0"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full py-5 flex items-center justify-between gap-4 text-left group"
                    >
                      <span className="font-bold text-[#49454F] group-hover:text-primary transition-colors">{faq.question}</span>
                      <div className={`p-2 rounded-full bg-[#F4EFF4] transition-all duration-300 ${openFaq === i ? 'rotate-180 bg-primary/10 text-primary' : 'text-[#79747E]'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-6 text-[#79747E] text-sm leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right Side: Contact Form ─── */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-white border border-[#E6E1E5] rounded-[3rem] p-8 lg:p-12 shadow-sm"
            >
              {/* Form Status Overlays */}
              <AnimatePresence mode="wait">
                {formState === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-3xl font-black text-[#1C1B1F] mb-4">Mensagem Enviada!</h3>
                    <p className="text-[#49454F] max-w-xs mx-auto mb-8 font-medium italic">
                      "Sua jornada para o sucesso começa agora. Responderemos em breve."
                    </p>
                    <button 
                      onClick={() => setFormState('idle')}
                      className="px-8 py-3 rounded-full bg-[#F4EFF4] text-[#49454F] font-bold hover:bg-[#E6E1E5] transition-all"
                    >
                      Enviar outra mensagem
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1C1B1F] mb-2">Envie seu projeto</h2>
                <p className="text-[#79747E] font-medium">Preencha os detalhes e nossa equipe entrará em contato.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#79747E] ml-4">Quem está falando?</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      type="text"
                      placeholder="Seu nome completo"
                      className="w-full px-6 py-4 rounded-full bg-[#FDFCFE] border border-[#E6E1E5] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-[#1C1B1F] placeholder:text-[#CAC4D0]"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#79747E] ml-4">Seu melhor e-mail</label>
                    <input
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      type="email"
                      placeholder="contato@empresa.com"
                      className="w-full px-6 py-4 rounded-full bg-[#FDFCFE] border border-[#E6E1E5] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-[#1C1B1F] placeholder:text-[#CAC4D0]"
                    />
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#79747E] ml-4">Qual a sua necessidade?</label>
                  <div className="relative">
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-6 py-4 rounded-full bg-[#FDFCFE] border border-[#E6E1E5] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-[#1C1B1F] appearance-none"
                    >
                      <option value="">Selecione o assunto...</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#79747E] pointer-events-none" />
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#79747E] ml-4">Conte-nos mais</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    placeholder="Descreva seu projeto ou dúvida em detalhes..."
                    className="w-full px-6 py-6 rounded-3xl bg-[#FDFCFE] border border-[#E6E1E5] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-[#1C1B1F] placeholder:text-[#CAC4D0] resize-none"
                  />
                </div>

                {/* Error Message */}
                {formState === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium leading-relaxed">
                      {errorMessage}
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden px-8 py-5 rounded-full bg-primary text-white font-black text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Validando envio...
                      </>
                    ) : (
                      <>
                        Enviar Mensagem Agora
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                      </>
                    )}
                  </div>
                  {/* Hover Background Animation */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <p className="text-center text-[11px] text-[#CAC4D0] font-bold uppercase tracking-widest leading-relaxed">
                  Ao clicar em enviar, você aceita nossos <br /> termos e política de privacidade.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
