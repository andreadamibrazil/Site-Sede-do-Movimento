-- Corrige trigger: novos @sededomovimento.art entram como 'secretaria'
-- Admins promovem manualmente pelo painel de usuários
create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.email like '%@sededomovimento.art' then
    insert into public.perfis_usuario (id, nome, email, perfil, ativo)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.email,
      'secretaria',
      false  -- inativo até admin habilitar
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;
