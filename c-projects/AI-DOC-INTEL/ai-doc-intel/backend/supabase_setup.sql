-- AI Doc Intel - Supabase database setup
-- Run this in Supabase SQL Editor (Project -> SQL).
--
-- This creates:
-- - tables: documents, chunks, queries
-- - pgvector extension
-- - RPC: match_chunks (vector similarity search)
-- - RLS policies so users can only read their own rows from the frontend

-- 1) Extensions
create extension if not exists vector;

-- 2) Tables
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  filename text not null,
  file_url text not null,
  file_type text not null check (file_type in ('pdf', 'docx')),
  status text not null default 'processing' check (status in ('processing', 'ready', 'error')),
  page_count int,
  created_at timestamptz not null default now()
);

create table if not exists public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  chunk_index int not null,
  page_number int,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists chunks_document_id_idx on public.chunks (document_id);
create index if not exists chunks_embedding_idx on public.chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  question text not null,
  answer text not null,
  sources jsonb,
  confidence double precision,
  created_at timestamptz not null default now()
);

create index if not exists queries_document_id_idx on public.queries (document_id);
create index if not exists queries_user_id_idx on public.queries (user_id);

-- 3) RLS
alter table public.documents enable row level security;
alter table public.chunks enable row level security;
alter table public.queries enable row level security;

-- documents: user can read/update only their own rows
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
on public.documents
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own"
on public.documents
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- chunks: user can read chunks that belong to their documents
drop policy if exists "chunks_select_own_documents" on public.chunks;
create policy "chunks_select_own_documents"
on public.chunks
for select
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = chunks.document_id
      and d.user_id = auth.uid()
  )
);

-- queries: user can read only their own rows
drop policy if exists "queries_select_own" on public.queries;
create policy "queries_select_own"
on public.queries
for select
to authenticated
using (auth.uid() = user_id);

-- Optional: allow frontend to insert queries too (backend uses service role, so not required)
drop policy if exists "queries_insert_own" on public.queries;
create policy "queries_insert_own"
on public.queries
for insert
to authenticated
with check (auth.uid() = user_id);

-- 4) RPC for vector similarity search
-- Returns: content, page_number, similarity (higher is better)
create or replace function public.match_chunks(
  query_embedding vector(1536),
  match_document_id uuid,
  match_count int default 5
)
returns table (
  content text,
  page_number int,
  similarity double precision
)
language sql
stable
as $$
  select
    c.content,
    c.page_number,
    (1 - (c.embedding <=> query_embedding))::double precision as similarity
  from public.chunks c
  where c.document_id = match_document_id
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

