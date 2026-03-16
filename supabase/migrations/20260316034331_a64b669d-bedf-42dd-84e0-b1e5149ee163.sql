
CREATE OR REPLACE FUNCTION public.get_skill_rankings()
RETURNS TABLE(skill text, cnt bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT unnest(required_skills) as skill, count(*) as cnt
  FROM public.jobs
  WHERE status = 'open'
  GROUP BY skill
  ORDER BY cnt DESC;
$$;
