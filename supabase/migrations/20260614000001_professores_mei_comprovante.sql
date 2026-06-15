-- MEI/CNPJ no professor (para folha de pagamento)
ALTER TABLE professores ADD COLUMN IF NOT EXISTS mei TEXT;

-- Comprovante de pagamento na folha (URL do arquivo no Drive ou link)
ALTER TABLE folhas_pagamento ADD COLUMN IF NOT EXISTS comprovante_url TEXT;
ALTER TABLE folhas_pagamento ADD COLUMN IF NOT EXISTS comprovante_adicionado_em TIMESTAMPTZ;

-- Drive URL do PDF gerado (salvo quando folha é enviada)
ALTER TABLE folhas_pagamento ADD COLUMN IF NOT EXISTS drive_pdf_url TEXT;
ALTER TABLE folhas_pagamento ADD COLUMN IF NOT EXISTS drive_pdf_id TEXT;
