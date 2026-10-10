-- Scan Confidence admin read path.
--
-- scan_confidence_log has RLS enabled with an INSERT-only policy and NO SELECT
-- policy, so the anon client cannot read it. This SECURITY DEFINER function
-- reads the table under definer rights but only ever returns DE-IDENTIFIED
-- aggregates + a recent-outcomes feed (no user_id, no detected_name/brand).
-- Granting EXECUTE to `authenticated` mirrors the existing RequireAuth-only
-- admin posture without leaking per-user scan history.
--
-- Rollback: drop function public.scan_confidence_stats(timestamptz, timestamptz);

create or replace function public.scan_confidence_stats(
  p_from timestamptz default now() - interval '30 days',
  p_to   timestamptz default now()
)
returns json
language sql
security definer
set search_path = public
as $$
  with vision as (
    select brand_confidence, overall_confidence, created_at
    from scan_confidence_log
    where scan_source = 'vision'
      and created_at >= p_from
      and created_at <  p_to
  )
  select json_build_object(
    'from', p_from,
    'to', p_to,
    'total_vision', (select count(*) from vision),
    'high',    (select count(*) from vision where brand_confidence = 'high'),
    'medium',  (select count(*) from vision where brand_confidence = 'medium'),
    'low',     (select count(*) from vision where brand_confidence = 'low'),
    'unknown', (select count(*) from vision
                where brand_confidence is null
                   or brand_confidence not in ('high','medium','low')),
    'wary',    (select count(*) from vision where brand_confidence in ('low','medium')),
    'recent', coalesce((
      select json_agg(r) from (
        select created_at, brand_confidence, overall_confidence
        from vision
        order by created_at desc
        limit 25
      ) r
    ), '[]'::json)
  );
$$;

revoke all on function public.scan_confidence_stats(timestamptz, timestamptz) from public, anon;
grant execute on function public.scan_confidence_stats(timestamptz, timestamptz) to authenticated;
