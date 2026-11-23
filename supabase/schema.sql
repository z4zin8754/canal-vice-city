-- Canal Vice City · banco do app de membros (rodar no SQL Editor do Supabase)
create table if not exists public.compras (
  id bigserial primary key,
  email text not null,
  produto text not null,          -- chave de CVC.produtos: start, completo, estudio, kitfeed, piloto, piloto_lite
  status text not null default 'aprovada',  -- aprovada | reembolsada | cancelada
  pedido text,
  origem text default 'hubla',
  bruto jsonb,
  criado timestamptz default now(),
  unique (email, produto)
);
create index if not exists compras_email on public.compras (lower(email));

create table if not exists public.perfis (
  id uuid primary key references auth.users on delete cascade,
  email text,
  primeiro_login timestamptz default now()
);

create table if not exists public.progresso (
  user_id uuid references auth.users on delete cascade,
  chave text,
  valor jsonb,
  atualizado timestamptz default now(),
  primary key (user_id, chave)
);

alter table public.compras enable row level security;
alter table public.perfis enable row level security;
alter table public.progresso enable row level security;

-- cada pessoa só vê as próprias compras (pelo e-mail do login)
drop policy if exists "ver minhas compras" on public.compras;
create policy "ver minhas compras" on public.compras for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "meu perfil" on public.perfis;
create policy "meu perfil" on public.perfis for select using (id = auth.uid());

drop policy if exists "meu progresso" on public.progresso;
create policy "meu progresso" on public.progresso for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- cria o perfil (e a data do 1º login, que libera a Estrutura de Vendas no 7º dia) quando a conta nasce
create or replace function public.novo_usuario() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, email) values (new.id, new.email) on conflict do nothing;
  return new;
end $$;
drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users for each row execute function public.novo_usuario();

-- log de todo evento recebido da Hubla (só o servidor lê; serve para conferir os testes)
create table if not exists public.eventos (
  id bigserial primary key,
  tipo text,
  bruto jsonb,
  recebido timestamptz default now()
);
alter table public.eventos enable row level security;

-- o servidor (webhook /api/hubla e login /api/acesso) usa a chave service_role
grant usage on schema public to service_role;
grant select, insert, update, delete on public.compras, public.eventos to service_role;
grant usage, select on all sequences in schema public to service_role;
