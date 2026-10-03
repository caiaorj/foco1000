create policy "Participantes veem fotos" on storage.objects for select to authenticated using (bucket_id = 'checkins');
create policy "Usuario envia fotos na propria pasta" on storage.objects for insert to authenticated with check (bucket_id = 'checkins' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Usuario apaga as proprias fotos" on storage.objects for delete to authenticated using (bucket_id = 'checkins' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));

create policy "Admin apaga checkins" on public.checkins for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.admin_remover_participante(_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Sem permissao'; end if;
  if _user_id = auth.uid() then raise exception 'Nao e possivel remover a propria conta'; end if;
  delete from auth.users where id = _user_id;
end; $$;
revoke execute on function public.admin_remover_participante(uuid) from public, anon;
grant execute on function public.admin_remover_participante(uuid) to authenticated;