-- Adiciona 'personalizado' ao enum tipo_plano (migração NextFit)
ALTER TYPE tipo_plano ADD VALUE IF NOT EXISTS 'personalizado';
