-- Asaas: link de pagamento e cache do customer ID
alter table cobrancas_avulsas add column if not exists link_pagamento text;
alter table mensalidades add column if not exists link_pagamento text;
alter table alunos add column if not exists asaas_customer_id text;
