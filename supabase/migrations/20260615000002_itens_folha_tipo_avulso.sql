-- Adiciona 'avulso' ao CHECK constraint de itens_folha.tipo
-- Necessário para o botão "Adicionar item avulso" na folha de pagamento
ALTER TABLE itens_folha DROP CONSTRAINT IF EXISTS itens_folha_tipo_check;
ALTER TABLE itens_folha ADD CONSTRAINT itens_folha_tipo_check
  CHECK (tipo IN ('aula', 'fixo', 'bonus', 'desconto', 'avulso'));
