create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Usuario ve os proprios papeis" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.grant_admin_email() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and lower(new.email) = 'sbarbosa097@gmail.com' then
    insert into public.user_roles(user_id, role) values (new.id,'admin') on conflict do nothing;
  end if;
  return new;
end; $$;
revoke execute on function public.grant_admin_email() from public, anon, authenticated;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.grant_admin_email();
create trigger on_auth_user_confirmed_admin after update of email_confirmed_at on auth.users for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null) execute function public.grant_admin_email();
insert into public.user_roles(user_id, role) select id,'admin' from auth.users where lower(email)='sbarbosa097@gmail.com' and email_confirmed_at is not null on conflict do nothing;

create table public.materials (id uuid primary key default gen_random_uuid(), titulo text not null, tipo text not null default 'curso', descricao text not null default '', link text not null default '', capa text not null default '', publicado boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select, insert, update, delete on public.materials to authenticated;
grant all on public.materials to service_role;
alter table public.materials enable row level security;
create policy "Participantes veem materiais publicados" on public.materials for select to authenticated using (publicado or public.has_role(auth.uid(),'admin'));
create policy "Admin gerencia materiais" on public.materials for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger update_materials_updated_at before update on public.materials for each row execute function public.update_updated_at_column();

create table public.live_settings (id int primary key default 1, titulo text not null default '', quando text not null default '', link text not null default '#', updated_at timestamptz not null default now());
grant select, insert, update on public.live_settings to authenticated;
grant all on public.live_settings to service_role;
alter table public.live_settings enable row level security;
create policy "Participantes veem a live" on public.live_settings for select to authenticated using (true);
create policy "Admin gerencia a live" on public.live_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.live_settings(id,titulo,quando,link) values (1,'Precificação sem medo: como cobrar sem pedir desconto','Sexta-feira, 9 de outubro · 19h30 (horário de Brasília)','#');