-- Web search result cache (24h TTL)
-- Prevents duplicate Serper API calls for the same query
-- Used by supabase/functions/product-search/index.ts

create table if not exists web_search_cache (
  query_hash text primary key,
  search_type text not null check (search_type in ('compatible', 'similar', 'reviews')),
  query_text text not null,
  results jsonb not null default '[]'::jsonb,
  result_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Index for TTL cleanup queries
create index idx_web_search_cache_created_at on web_search_cache (created_at);

-- RLS: Edge Functions use service role key (bypasses RLS).
-- No user-facing policies needed — users never query this table directly.
alter table web_search_cache enable row level security;

-- Service role full access (Edge Functions only)
create policy "Service role full access"
  on web_search_cache
  for all
  using (true)
  with check (true);
