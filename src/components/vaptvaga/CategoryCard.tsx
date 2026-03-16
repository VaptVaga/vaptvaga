import { UtensilsCrossed, ShoppingBag, Sparkles, PartyPopper, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
  PartyPopper,
};

interface CategoryCardProps {
  name: string;
  icon: string;
  count: number;
  onClick?: () => void;
}

export const CategoryCard = ({ name, icon, count, onClick }: CategoryCardProps) => {
  const Icon = iconMap[icon] || Sparkles;
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-foreground">{name}</span>
      <span className="text-[10px] text-muted-foreground">{count} vagas</span>
    </motion.button>
  );
};
