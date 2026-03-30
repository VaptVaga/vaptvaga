import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Job, Application, Profile } from '@/lib/types';

// ─── JOBS ────────────────────────────────────────────────
export const useJobs = (filters?: { cidade?: string; status?: string; bairro?: string; skill?: string; search?: string }) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*, employer:profiles!company_id(id, name, cidade, avatar_url, telefone)')
        .order('created_at', { ascending: false });

      if (filters?.cidade) query = query.eq('cidade', filters.cidade);
      if (filters?.bairro) query = query.eq('bairro', filters.bairro);
      if (filters?.status) query = query.eq('status', filters.status);
      else query = query.eq('status', 'open');
      if (filters?.skill) query = query.contains('required_skills', [filters.skill]);
      if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data as (Job & { employer: Profile })[];
    },
  });
};

export const useMyJobs = (employerId: string | undefined) => {
  return useQuery({
    queryKey: ['my-jobs', employerId],
    queryFn: async () => {
      if (!employerId) return [];
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!employerId,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (job: Partial<Job>) => {
      // @ts-ignore - Supabase type resolution issue with 'public' schema
      const { data, error } = await supabase.from('jobs').insert(job).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
    },
  });
};

// ─── APPLICATIONS ────────────────────────────────────────
export const useApplicationsForJob = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('applications')
        .select('*, freelancer:profiles!freelancer_id(id, name, skills, cidade, telefone, imgUrl)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Application & { freelancer: Profile })[];
    },
    enabled: !!jobId,
  });
};

export const useMyApplications = (freelancerId: string | undefined) => {
  return useQuery({
    queryKey: ['my-applications', freelancerId],
    queryFn: async () => {
      if (!freelancerId) return [];
      const { data, error } = await supabase
        .from('applications')
        .select('*, job:jobs!job_id(*)')
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Application & { job: Job })[];
    },
    enabled: !!freelancerId,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ job_id, freelancer_id }: { job_id: string; freelancer_id: string }) => {
      const { data, error } = await (supabase
        .from('applications') as any)
        .insert({ job_id, freelancer_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
};

// ─── PROFILE ─────────────────────────────────────────────
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { data, error } = await (supabase
        .from('profiles') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// ─── COUNTS (for paywall logic) ──────────────────────────
export const useMonthlyApplicationCount = (freelancerId: string | undefined) => {
  return useQuery({
    queryKey: ['monthly-app-count', freelancerId],
    queryFn: async () => {
      if (!freelancerId) return 0;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('freelancer_id', freelancerId)
        .gte('created_at', startOfMonth.toISOString());
      if (error) throw error;
      return count || 0;
    },
    enabled: !!freelancerId,
  });
};

export const useMonthlyJobCount = (employerId: string | undefined) => {
  return useQuery({
    queryKey: ['monthly-job-count', employerId],
    queryFn: async () => {
      if (!employerId) return 0;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('employer_id', employerId)
        .gte('created_at', startOfMonth.toISOString());
      if (error) throw error;
      return count || 0;
    },
    enabled: !!employerId,
  });
};
