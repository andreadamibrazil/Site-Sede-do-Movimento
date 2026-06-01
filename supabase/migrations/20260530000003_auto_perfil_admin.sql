-- Trigger: quando email @sededomovimento.art faz login pela primeira vez,
-- cria perfil de admin automaticamente na tabela perfis_usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.email like '%@sededomovimento.art' then
    insert into public.perfis_usuario (id, nome, email, perfil, ativo)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.email,
      'admin',
      true
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
