import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Crown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/vaptvaga/BottomNav';
import { useAuth } from '@/lib/authContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Editar perfil', path: '/onboarding' },
    { label: 'Planos e assinatura', path: '/pricing' },
    { label: 'Suporte', path: '#' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-5">
        <h1 className="text-xl font-black text-foreground">Meu Perfil</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 px-5">
        {/* Profile Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-black text-primary">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-foreground">{user?.full_name || 'Usuário'}</h2>
            <p className="text-sm text-muted-foreground">{user?.city}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            user?.subscription_tier === 'premium'
              ? 'bg-success/10 text-success'
              : 'bg-secondary text-muted-foreground'
          }`}>
            {user?.subscription_tier === 'premium' ? (
              <span className="flex items-center gap-1"><Crown size={12} /> Premium</span>
            ) : 'Free'}
          </span>
        </div>

        {/* Skills (Freelancer) */}
        {user?.role === 'freelancer' && user.skills && (
          <div className="mt-4 flex flex-wrap gap-2">
            {user.skills.map((s) => (
              <span key={s} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Menu */}
        <div className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="flex w-full items-center justify-between rounded-xl bg-card px-4 py-3.5 text-left"
            >
              <span className="font-medium text-foreground">{item.label}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="mt-6 w-full text-destructive hover:text-destructive"
        >
          <LogOut size={18} />
          Sair da conta
        </Button>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Profile;
