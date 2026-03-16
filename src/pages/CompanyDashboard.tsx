import { useState } from 'react';
import { Plus, Eye, Lock, MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { BottomNav } from '@/components/vaptvaga/BottomNav';
import { useAuth } from '@/lib/authContext';
import { useMyJobs, useApplicationsForJob } from '@/hooks/useSupabase';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatBudget } from '@/lib/types';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const isFree = user?.subscriber !== 'premium';

  const { data: myJobs, isLoading } = useMyJobs(user?.id);

  const handleWhatsApp = (phone: string | null, index: number) => {
    if (isFree && index > 0) {
      setShowPaywall(true);
      return;
    }
    if (phone) {
      window.open(`https://wa.me/55${phone.replace(/\D/g, '')}`, '_blank');
    } else {
      toast({ title: 'Telefone não disponível' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pb-2 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Olá 👋</p>
            <h1 className="text-xl font-black text-foreground">{user?.name || 'Minha Empresa'}</h1>
          </div>
          {isFree && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Plano Free
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 px-5">
        <h2 className="mb-3 text-lg font-bold text-foreground">Minhas Vagas</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : myJobs && myJobs.length > 0 ? (
          <div className="space-y-3">
            {myJobs.map((job) => (
              <JobWithApplicants
                key={job.id}
                job={job}
                isSelected={selectedJobId === job.id}
                onToggle={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                isFree={isFree}
                onWhatsApp={handleWhatsApp}
                onPaywall={() => setShowPaywall(true)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-bold">Nenhuma vaga publicada</p>
            <p className="mt-1 text-sm">Clique no + para publicar sua primeira vaga.</p>
          </div>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/post-job')}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="company" />
      <BottomNav />
    </div>
  );
};

// Sub-component for job with expandable applicants
const JobWithApplicants = ({ job, isSelected, onToggle, isFree, onWhatsApp, onPaywall }: any) => {
  const { data: applications } = useApplicationsForJob(isSelected ? job.id : undefined);

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground">{job.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatBudget(job.budget)} • {job.cidade || 'Sem local'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight size={18} className={`text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-4 space-y-2.5 border-t border-border pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pessoas prontas para trabalhar
              </p>
              {applications && applications.length > 0 ? (
                applications.map((app: any, index: number) => (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between rounded-xl p-3 ${
                      isFree && index > 0 ? 'bg-secondary/50' : 'bg-secondary'
                    }`}
                  >
                    <div className={isFree && index > 0 ? 'blur-sm select-none' : ''}>
                      <p className="font-bold text-foreground">{app.freelancer?.name || 'Freelancer'}</p>
                      <div className="mt-0.5 flex gap-1">
                        {app.freelancer?.skills?.map((s: string) => (
                          <span key={s} className="text-[11px] text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </div>
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Button
                        size="sm"
                        onClick={() => onWhatsApp(app.freelancer?.telefone, index)}
                        className={`h-9 rounded-lg text-xs font-bold ${
                          isFree && index > 0
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-success text-success-foreground hover:bg-success/90'
                        }`}
                      >
                        {isFree && index > 0 ? (
                          <><Lock size={13} /> Bloqueado</>
                        ) : (
                          <><MessageCircle size={13} /> WhatsApp</>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">Nenhum candidato ainda</p>
              )}
              {isFree && applications && applications.length > 1 && (
                <button
                  onClick={onPaywall}
                  className="w-full rounded-xl bg-primary/5 p-3 text-center text-sm font-bold text-primary"
                >
                  🔓 Assine Premium para ver todos os candidatos
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default CompanyDashboard;
