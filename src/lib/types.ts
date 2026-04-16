export interface Profile {
  id: string;
  role: 'company' | 'freelancer';
  name: string;
  skills: string[] | null;
  profile_url: string | null;
  habilidades: string | null;
  subscriber: string | null;
  cidade: string | null;
  bairro: string | null;
  telefone: string | null;
  imgUrl: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  classificacao: string | null;
  description: string | null;
  budget: string | null;
  required_skills: string[] | null;
  status: string;
  created_at: string;
  cidade: string | null;
  bairro: string | null;
  longitude: number | null;
  latitude: number | null;
  // Joined data
  employer?: Profile;
}

export interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  status: string | null;
  created_at: string;
  // Joined data
  freelancer?: Profile;
  job?: Job;
}

export const categories = [
  { name: 'Bares/Restaurantes', icon: 'UtensilsCrossed', count: 0 },
  { name: 'Vendas/Lojas', icon: 'ShoppingBag', count: 0 },
  { name: 'Limpeza', icon: 'Sparkles', count: 0 },
  { name: 'Eventos', icon: 'PartyPopper', count: 0 },
];

// Parse budget string like "R$ 1.000 - R$ 3.000" to get first value as number
export const parseBudgetValue = (budget: string | null): number | null => {
  if (!budget) return null;
  const match = budget.replace(/\./g, '').match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

// Format budget for display
export const formatBudget = (budget: string | null): string => {
  if (!budget) return 'A combinar';
  return budget;
};
