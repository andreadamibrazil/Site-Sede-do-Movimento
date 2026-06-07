-- Adiciona 'fidelidade' ao enum tipo_plano
ALTER TYPE tipo_plano ADD VALUE IF NOT EXISTS 'fidelidade';
