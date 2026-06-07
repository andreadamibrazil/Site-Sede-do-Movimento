-- Tabela de convites: admin pré-cadastra email antes do primeiro login
create table if not exists convites (
  email text primary key,
  perfil perfil_usuario not null default 'secretaria',
  convidado_em timestamptz not null default now()
);

-- Atualiza trigger para usar o perfil do convite (se existir)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  perfil_convite perfil_usuario;
begin
  if new.email like '%@sededomovimento.art' then
    select perfil into perfil_convite from public.convites where email = new.email;

    insert into public.perfis_usuario (id, nome, email, perfil, ativo)
    values (
      new.id,
      coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
      ),
      new.email,
      coalesce(perfil_convite, 'secretaria'),
      false
    )
    on conflict (id) do nothing;

    delete from public.convites where email = new.email;
  end if;
  return new;
end;
$$ language plpgsql security definer;
