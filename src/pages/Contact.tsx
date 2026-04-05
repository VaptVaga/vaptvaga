import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Instagram, Send, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const contactChannels = [
  {
    icon: <Mail className="w-7 h-7 text-primary" />,
    title: 'E-mail',
    value: 'suporte@vaptvaga.com.br',
    description: 'Para dúvidas gerais e suporte técnico',
    action: 'mailto:suporte@vaptvaga.com.br',
    label: 'Enviar e-mail',
  },
  {
    icon: <MessageCircle className="w-7 h-7 text-primary" />,
    title: 'WhatsApp',
    value: '(31) 9 8289-5515',
    description: 'Atendimento rápido de segunda a sexta',
    action: 'https://wa.me/5531982895515',
    label: 'Abrir WhatsApp',
  },
  {
    icon: <Instagram className="w-7 h-7 text-primary" />,
    title: 'Instagram',
    value: '@vaptvaga',
    description: 'Mensagens diretas e atualizações',
    action: 'https://instagram.com/vaptvaga',
    label: 'Ver perfil',
  },
];

const faqTeaser = [
  {
    question: 'Como me cadastro na plataforma?',
    answer: 'Clique em "Entrar" e escolha se você quer entrar como Freelancer ou Empresa. O processo é rápido e gratuito.',
  },
  {
    question: 'O cadastro é gratuito?',
    answer: 'Sim! O plano gratuito permite que freelancers se candidatem a até 2 vagas por mês e empresas publiquem 1 vaga.',
  },
  {
    question: 'Qual é o prazo de resposta do suporte?',
    answer: 'Respondemos todas as mensagens em até 24 horas úteis. Para urgências, use o WhatsApp.',
  },
];

const subjects = ['Dúvida geral', 'Problema técnico', 'Sugestão', 'Parceria', 'Outro'];

export const Contact: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('[Contact] Enviando mensagem direta para o banco...');

      const { error } = await (supabase
        .from('contact_messages') as any)
        .insert([{
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message
        }]);

      if (error) {
        console.error('[Contact] Erro Supabase:', error);
        throw new Error('Não foi possível salvar sua mensagem. Por favor, verifique sua conexão ou tente o WhatsApp.');
      }

      console.log('[Contact] Mensagem salva com sucesso!');
      setFormSent(true);
      setTimeout(() => setFormSent(false), 5000);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('[Contact] Catch error:', error);
      setSubmitError(error.message || 'Ocorreu um erro ao enviar sua mensagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface w-full">
      {/* ─── Hero ─── */}
      <section className="pt-12 pb-16 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black tracking-widest uppercase">
            Resposta em até 24h
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight">
            Fale{' '}
            <span className="text-primary italic">Conosco</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
            Estamos aqui para ajudar. Escolha o canal mais conveniente para você
            ou preencha o formulário abaixo.
          </p>
        </motion.div>
      </section>

      {/* ─── Contact Channels ─── */}
      <section className="pb-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactChannels.map((ch, i) => (
            <motion.a
              key={ch.title}
              href={ch.action}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col items-start p-8 bg-surface-container-lowest rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                {ch.icon}
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-outline mb-1">{ch.title}</p>
              <p className="text-on-surface font-bold text-lg mb-2 leading-snug">{ch.value}</p>
              <p className="text-on-surface-variant text-sm leading-relaxed flex-1">{ch.description}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-primary font-bold text-sm group-hover:gap-2.5 transition-all">
                {ch.label}
                <Send className="w-3.5 h-3.5" />
              </span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ─── Form + FAQ ─── */}
      <section className="pb-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-8 lg:p-10 shadow-sm"
          >
            <h2 className="text-2xl lg:text-3xl font-extrabold text-on-surface mb-1">Envie uma mensagem</h2>
            <p className="text-on-surface-variant text-sm mb-8">Preencha os campos abaixo e retornaremos em breve.</p>

            {formSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-3"
              >
                <div className="text-5xl">✅</div>
                <p className="text-xl font-black text-on-surface">Mensagem enviada!</p>
                <p className="text-on-surface-variant">Entraremos em contato em até 24 horas.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitError && (
                  <div className="bg-error/10 text-error p-4 rounded-xl text-sm font-medium mb-4">
                    {submitError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-outline">Nome completo</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full px-5 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline font-medium transition"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-outline">E-mail</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="w-full px-5 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline font-medium transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-outline">Assunto</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium transition appearance-none"
                  >
                    <option value="">Selecione um assunto...</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-outline">Mensagem</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Descreva sua dúvida ou solicitação..."
                    className="w-full px-5 py-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline font-medium transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 rounded-full font-black text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* FAQ Teaser */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm"
          >
            <h3 className="text-xl font-extrabold text-on-surface mb-6">Perguntas Frequentes</h3>
            <div className="space-y-3">
              {faqTeaser.map((faq, i) => (
                <div key={i} className="bg-surface-container-low rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left gap-3"
                  >
                    <span className="font-bold text-sm text-on-surface leading-snug">{faq.question}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-outline flex-shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-on-surface-variant leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Link
              to="/faq"
              className="mt-6 flex items-center gap-1.5 text-primary font-bold text-sm hover:underline"
            >
              Ver todas as perguntas →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
