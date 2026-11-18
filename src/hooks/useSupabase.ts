import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Job, Application, Profile } from '@/lib/types';
import { getCachedProfile, setCachedProfile } from '@/lib/profileCache';

const BASE_PROFILE_COLUMNS = new Set([
  'id',
  'role',
  'name',
  'skills',
  'portfolio_url',
  'telefone',
  'estado',
  'cidade',
  'bairro',
  'idade',
  'avatar_url',
  'latitude',
  'longitude',
  'aceita_email',
  'aceita_whatsapp',
]);

export const upsertProfileResilient = async (
  payload: Record<string, unknown> & { id: string }
): Promise<Record<string, unknown>> => {
  const cached = (getCachedProfile(payload.id) || {}) as Record<string, unknown>;
  const resolvedRole = (payload.role as string) || (cached.role as string) || 'freelancer';
  const resolvedName = (payload.name as string) ?? (cached.name as string) ?? 'Usuário';

  const fullPayload: Record<string, unknown> = {
    ...payload,
    id: payload.id,
    role: resolvedRole,
    name: resolvedName,
  };

  // Persist locally first so extended fields and edits survive any schema mismatch
  setCachedProfile(payload.id, fullPayload);

  const profilesTable = supabase.from('profiles') as unknown as {
    upsert: (
      values: Record<string, unknown>,
      options?: { onConflict?: string }
    ) => {
      select: () => {
        maybeSingle: () => Promise<{
          data: Record<string, unknown> | null;
          error: { message?: string; code?: string } | null;
        }>;
      };
    };
  };

  const { data, error } = await profilesTable
    .upsert(fullPayload, { onConflict: 'id' })
    .select()
    .maybeSingle();

  if (!error) {
    const merged = { ...fullPayload, ...(data || {}) };
    setCachedProfile(payload.id, merged);
    return merged;
  }

  // Check if error is caused by missing extended columns in PostgREST schema cache
  const errMsg = (error.message || '').toLowerCase();
  const isColumnError =
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    errMsg.includes('column') ||
    errMsg.includes('schema cache');

  if (!isColumnError) {
    throw new Error(error.message || 'Erro ao salvar perfil');
  }

  // Fallback: upsert only guaranteed native columns
  const basePayload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fullPayload)) {
    if (BASE_PROFILE_COLUMNS.has(k) && v !== undefined) {
      basePayload[k] = v;
    }
  }

  const { data: fallbackData, error: fallbackError } = await profilesTable
    .upsert(basePayload, { onConflict: 'id' })
    .select()
    .maybeSingle();

  if (fallbackError) {
    throw new Error(fallbackError.message || 'Erro ao salvar perfil');
  }

  const merged = { ...(fallbackData || {}), ...fullPayload };
  setCachedProfile(payload.id, merged);
  return merged;
};

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
        .eq('company_id', employerId)
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
      // @ts-expect-error - Supabase type resolution issue with 'public' schema
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
        .select('*, freelancer:profiles!freelancer_id(id, name, skills, cidade, telefone, avatar_url)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as (Application & { freelancer: Profile })[];
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
      return data as unknown as (Application & { job: Job })[];
    },
    enabled: !!freelancerId,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ job_id, freelancer_id }: { job_id: string; freelancer_id: string }) => {
      const { data, error } = await supabase
        .from('applications')
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
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Profile> & { id: string } & Record<string, unknown>) => {
      return upsertProfileResilient({ id, ...updates });
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
        .eq('company_id', employerId)
        .gte('created_at', startOfMonth.toISOString());
      if (error) throw error;
      return count || 0;
    },
    enabled: !!employerId,
  });
};
