import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter } from 'lucide-react';
import { JobCard } from '@/components/vaptvaga/JobCard';
import { PaywallModal } from '@/components/vaptvaga/PaywallModal';
import { BottomNav } from '@/components/vaptvaga/BottomNav';
import { useAuth } from '@/lib/authContext';
import { mockJobs } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [appliedCount, setAppliedCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const isFree = user?.subscription_tier === 'free';
  const limit = 2;

  const handleApply = (jobId: string) => {
    if (appliedJobs.has(jobId)) {
      toast({ title: 'Você já se candidatou', description: 'Aguarde o contato da empresa.' });
      return;
    }
    if (isFree && appliedCount >= limit) {
      setShowPaywall(true);
      return;
    }
    setAppliedCount((c) => c + 1);
    setAppliedJobs((prev) => new Set(prev).add(jobId));
    toast({
      title: '✅ Candidatura enviada!',
      description: 'A empresa entrará em contato via WhatsApp.',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pb-2 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Olá, {user?.full_name?.split(' ')[0]} 👋</p>
            <h1 className="text-xl font-black text-foreground">Vagas na sua região</h1>
          </div>
          {isFree && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {limit - appliedCount} restantes
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground">
          <MapPin size={16} />
          <span>{user?.city || 'São Paulo'}</span>
          <button className="ml-auto text-primary">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Job Feed */}
      <div className="mt-4 space-y-3 px-5">
        {mockJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onApply={() => handleApply(job.id)}
            showApply={!appliedJobs.has(job.id)}
          />
        ))}
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} type="freelancer" />
      <BottomNav />
    </div>
  );
};

export default FreelancerDashboard;
