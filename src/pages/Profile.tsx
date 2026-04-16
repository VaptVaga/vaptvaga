import { useNavigate } from 'react-router-dom';
import { LogOut, Crown, ChevronRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/vaptvaga/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { ImageCropper } from '@/components/common/ImageCropper';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUpdateProfile } from '@/hooks/useSupabase';

const Profile = () => {
  const navigate = useNavigate();
  const { profile: user, signOut, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();

  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageSrc(URL.createObjectURL(file));
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedFile: File, croppedUrl: string) => {
    setSelectedImageSrc(null);
    setAvatarPreview(croppedUrl);
    setIsUploading(true);

    try {
      const ext = croppedFile.name.split('.').pop() || 'jpeg';
      const path = `${user?.id}/avatar_${Date.now()}.${ext}`;
      
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, croppedFile, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      
      await updateProfile.mutateAsync({
        id: user!.id,
        avatar_url: urlData.publicUrl
      });
      
      await refreshProfile();
      toast({ title: '✅ Foto atualizada com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar foto', description: err.message, variant: 'destructive' });
      setAvatarPreview(user?.avatar_url || null);
    } finally {
      setIsUploading(false);
    }
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
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="relative group cursor-pointer shrink-0">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 text-xl font-black text-primary ${isUploading ? 'opacity-50' : ''}`}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
            </label>
            
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-foreground">{user?.name || 'Usuário'}</h2>
            <p className="text-sm text-muted-foreground">{user?.cidade}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            user?.subscriber === 'premium'
              ? 'bg-success/10 text-success'
              : 'bg-secondary text-muted-foreground'
          }`}>
            {user?.subscriber === 'premium' ? (
              <span className="flex items-center gap-1"><Crown size={12} /> Premium</span>
            ) : 'Free'}
          </span>
        </div>

        {user?.role === 'freelancer' && user.skills && (
          <div className="mt-4 flex flex-wrap gap-2">
            {user.skills.map((s) => (
              <span key={s} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                {s}
              </span>
            ))}
          </div>
        )}

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
          variant={"ghost" as any}
          onClick={handleLogout}
          className="mt-6 w-full text-destructive hover:text-destructive"
        >
          <LogOut size={18} />
          Sair da conta
        </Button>
      </motion.div>

      {selectedImageSrc && (
        <ImageCropper
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setSelectedImageSrc(null)}
          cropShape="round"
          aspect={1}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Profile;
