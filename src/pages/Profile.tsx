import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
    { label: 'Editar perfil', path: user?.role === 'company' ? '/company/dashboard' : '/freelancer/onboarding', icon: 'edit' },
    { label: 'Dúvidas Frequentes', path: '/faq', icon: 'help' },
    { label: 'Termos de Serviço', path: '/termos', icon: 'description' },
    { label: 'Política de Privacidade', path: '/privacidade', icon: 'shield' },
    { label: 'Contato / Suporte', path: '/contato', icon: 'support_agent' },
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-24 font-body">
      <div className="px-6 pt-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Meu Perfil</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 px-6">
        <div className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-5 shadow-[0px_8px_16px_rgba(17,28,45,0.04)]">
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
            <h2 className="font-bold text-on-surface text-lg leading-tight mb-1">{user?.name || 'Usuário'}</h2>
            <p className="text-sm font-medium text-on-surface-variant">{user?.cidade || 'Localização não informada'}</p>
          </div>
        </div>


        {user?.role === 'freelancer' && user.skills && (
          <div className="mt-4 flex flex-wrap gap-2">
            {user.skills.map((s) => (
              <span key={s} className="rounded-full bg-surface-container-low border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="flex w-full items-center justify-between rounded-xl bg-surface-container-low px-5 py-4 text-left transition-colors active:bg-primary/5 group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant group-active:text-primary transition-colors">{item.icon}</span>
                <span className="font-bold text-on-surface text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-on-surface-variant group-active:text-primary transition-colors" />
            </motion.button>
          ))}
        </div>

        <Button
          variant={"ghost" as any}
          onClick={handleLogout}
          className="mt-8 w-full text-error hover:text-error hover:bg-error/10 h-14 rounded-xl font-bold"
        >
          <LogOut size={18} className="mr-2" />
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
    </div>
  );
};

export default Profile;
