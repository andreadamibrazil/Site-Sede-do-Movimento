export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          bairro: string | null
          celular: string | null
          cep: string | null
          codigo_nextfit: string | null
          como_conheceu: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          info_saude: string | null
          nome: string
          nome_social: string | null
          observacoes: string | null
          origem: string | null
          responsavel_principal_id: string | null
          responsavel_secundario_id: string | null
          rg: string | null
          sexo: string | null
          status_financeiro: Database["public"]["Enums"]["status_financeiro"]
          status_pedagogico: Database["public"]["Enums"]["status_pedagogico"]
          tentativas_contato: number
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          celular?: string | null
          cep?: string | null
          codigo_nextfit?: string | null
          como_conheceu?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          info_saude?: string | null
          nome: string
          nome_social?: string | null
          observacoes?: string | null
          origem?: string | null
          responsavel_principal_id?: string | null
          responsavel_secundario_id?: string | null
          rg?: string | null
          sexo?: string | null
          status_financeiro?: Database["public"]["Enums"]["status_financeiro"]
          status_pedagogico?: Database["public"]["Enums"]["status_pedagogico"]
          tentativas_contato?: number
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          celular?: string | null
          cep?: string | null
          codigo_nextfit?: string | null
          como_conheceu?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          info_saude?: string | null
          nome?: string
          nome_social?: string | null
          observacoes?: string | null
          origem?: string | null
          responsavel_principal_id?: string | null
          responsavel_secundario_id?: string | null
          rg?: string | null
          sexo?: string | null
          status_financeiro?: Database["public"]["Enums"]["status_financeiro"]
          status_pedagogico?: Database["public"]["Enums"]["status_pedagogico"]
          tentativas_contato?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_responsavel_principal_id_fkey"
            columns: ["responsavel_principal_id"]
            isOneToOne: false
            referencedRelation: "responsaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_responsavel_secundario_id_fkey"
            columns: ["responsavel_secundario_id"]
            isOneToOne: false
            referencedRelation: "responsaveis"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          campos_alterados: string[] | null
          criado_em: string
          dados_antes: Json | null
          dados_depois: Json | null
          id: string
          operacao: string
          registro_id: string | null
          tabela: string
          usuario_email: string | null
          usuario_id: string | null
        }
        Insert: {
          campos_alterados?: string[] | null
          criado_em?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          operacao: string
          registro_id?: string | null
          tabela: string
          usuario_email?: string | null
          usuario_id?: string | null
        }
        Update: {
          campos_alterados?: string[] | null
          criado_em?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          operacao?: string
          registro_id?: string | null
          tabela?: string
          usuario_email?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      aulas: {
        Row: {
          chamada_concluida_em: string | null
          created_at: string
          data: string
          hora_fim: string
          hora_inicio: string
          id: string
          observacoes: string | null
          professor_id: string | null
          sala_id: string | null
          status: Database["public"]["Enums"]["status_aula"]
          turma_id: string
          updated_at: string
        }
        Insert: {
          chamada_concluida_em?: string | null
          created_at?: string
          data: string
          hora_fim: string
          hora_inicio: string
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          sala_id?: string | null
          status?: Database["public"]["Enums"]["status_aula"]
          turma_id: string
          updated_at?: string
        }
        Update: {
          chamada_concluida_em?: string | null
          created_at?: string
          data?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          sala_id?: string | null
          status?: Database["public"]["Enums"]["status_aula"]
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          aluno_id: string
          ano: number
          comentario: string | null
          created_at: string
          id: string
          liberada_em: string | null
          liberada_por: string | null
          media_final: number | null
          nota_banca: number | null
          nota_professor: number | null
          semestre: number
          status: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          ano: number
          comentario?: string | null
          created_at?: string
          id?: string
          liberada_em?: string | null
          liberada_por?: string | null
          media_final?: number | null
          nota_banca?: number | null
          nota_professor?: number | null
          semestre: number
          status?: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          ano?: number
          comentario?: string | null
          created_at?: string
          id?: string
          liberada_em?: string | null
          liberada_por?: string | null
          media_final?: number | null
          nota_banca?: number | null
          nota_professor?: number | null
          semestre?: number
          status?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      cobrancas_avulsas: {
        Row: {
          aluno_id: string
          categoria: Database["public"]["Enums"]["categoria_cobranca"]
          categoria_custom: string | null
          codigo_asaas: string | null
          comprovante_url: string | null
          created_at: string
          criado_por: string | null
          descricao: string
          descricao_detalhada: string | null
          espetaculo_id: string | null
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          pago_em: string | null
          preco_unitario: number | null
          quantidade: number
          status: Database["public"]["Enums"]["status_cobranca"]
          updated_at: string
          valor: number
          vencimento: string | null
        }
        Insert: {
          aluno_id: string
          categoria: Database["public"]["Enums"]["categoria_cobranca"]
          categoria_custom?: string | null
          codigo_asaas?: string | null
          comprovante_url?: string | null
          created_at?: string
          criado_por?: string | null
          descricao: string
          descricao_detalhada?: string | null
          espetaculo_id?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pago_em?: string | null
          preco_unitario?: number | null
          quantidade?: number
          status?: Database["public"]["Enums"]["status_cobranca"]
          updated_at?: string
          valor: number
          vencimento?: string | null
        }
        Update: {
          aluno_id?: string
          categoria?: Database["public"]["Enums"]["categoria_cobranca"]
          categoria_custom?: string | null
          codigo_asaas?: string | null
          comprovante_url?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string
          descricao_detalhada?: string | null
          espetaculo_id?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pago_em?: string | null
          preco_unitario?: number | null
          quantidade?: number
          status?: Database["public"]["Enums"]["status_cobranca"]
          updated_at?: string
          valor?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_avulsas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_avulsas_espetaculo_id_fkey"
            columns: ["espetaculo_id"]
            isOneToOne: false
            referencedRelation: "espetaculos"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_aluno: {
        Row: {
          aluno_id: string
          arquivado_em: string | null
          created_at: string
          criado_por: string | null
          dados_extraidos: Json | null
          drive_url: string | null
          id: string
          nome: string
          observacao: string | null
          presenca_id: string | null
          storage_path: string
          tipo: string
        }
        Insert: {
          aluno_id: string
          arquivado_em?: string | null
          created_at?: string
          criado_por?: string | null
          dados_extraidos?: Json | null
          drive_url?: string | null
          id?: string
          nome: string
          observacao?: string | null
          presenca_id?: string | null
          storage_path: string
          tipo: string
        }
        Update: {
          aluno_id?: string
          arquivado_em?: string | null
          created_at?: string
          criado_por?: string | null
          dados_extraidos?: Json | null
          drive_url?: string | null
          id?: string
          nome?: string
          observacao?: string | null
          presenca_id?: string | null
          storage_path?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_aluno_presenca_id_fkey"
            columns: ["presenca_id"]
            isOneToOne: false
            referencedRelation: "presencas"
            referencedColumns: ["id"]
          },
        ]
      }
      espetaculos: {
        Row: {
          ano: number
          created_at: string
          data_estreia: string | null
          data_limite_inscricao: string | null
          id: string
          inscricoes_abertas: boolean
          nome: string
          teatro: string | null
        }
        Insert: {
          ano: number
          created_at?: string
          data_estreia?: string | null
          data_limite_inscricao?: string | null
          id?: string
          inscricoes_abertas?: boolean
          nome: string
          teatro?: string | null
        }
        Update: {
          ano?: number
          created_at?: string
          data_estreia?: string | null
          data_limite_inscricao?: string | null
          id?: string
          inscricoes_abertas?: boolean
          nome?: string
          teatro?: string | null
        }
        Relationships: []
      }
      experimentais: {
        Row: {
          aula_id: string
          created_at: string | null
          id: string
          lead_id: string
          notificou_professor: boolean
          observacoes: string | null
          status: string
        }
        Insert: {
          aula_id: string
          created_at?: string | null
          id?: string
          lead_id: string
          notificou_professor?: boolean
          observacoes?: string | null
          status?: string
        }
        Update: {
          aula_id?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          notificou_professor?: boolean
          observacoes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "experimentais_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experimentais_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      faixas_hora_aula: {
        Row: {
          ativo: boolean
          created_at: string | null
          id: string
          max_alunos: number | null
          min_alunos: number
          turma_id: string | null
          valor_hora: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          max_alunos?: number | null
          min_alunos?: number
          turma_id?: string | null
          valor_hora: number
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          max_alunos?: number | null
          min_alunos?: number
          turma_id?: string | null
          valor_hora?: number
        }
        Relationships: [
          {
            foreignKeyName: "faixas_hora_aula_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      folhas_pagamento: {
        Row: {
          assinado_em: string | null
          autentique_doc_id: string | null
          created_at: string | null
          gerado_por: string | null
          id: string
          mes_referencia: string
          observacoes: string | null
          pago_em: string | null
          professor_id: string
          status: string
          valor_aulas: number
          valor_fixo: number
          valor_total: number
        }
        Insert: {
          assinado_em?: string | null
          autentique_doc_id?: string | null
          created_at?: string | null
          gerado_por?: string | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          pago_em?: string | null
          professor_id: string
          status?: string
          valor_aulas?: number
          valor_fixo?: number
          valor_total?: number
        }
        Update: {
          assinado_em?: string | null
          autentique_doc_id?: string | null
          created_at?: string | null
          gerado_por?: string | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          pago_em?: string | null
          professor_id?: string
          status?: string
          valor_aulas?: number
          valor_fixo?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "folhas_pagamento_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes_espetaculo: {
        Row: {
          aluno_id: string
          created_at: string
          e_bolsista: boolean
          espetaculo_id: string
          id: string
          lote: number
          quantidade_figurinos: number
          status: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          e_bolsista?: boolean
          espetaculo_id: string
          id?: string
          lote: number
          quantidade_figurinos?: number
          status?: string
          updated_at?: string
          valor_total: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          e_bolsista?: boolean
          espetaculo_id?: string
          id?: string
          lote?: number
          quantidade_figurinos?: number
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_espetaculo_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_espetaculo_espetaculo_id_fkey"
            columns: ["espetaculo_id"]
            isOneToOne: false
            referencedRelation: "espetaculos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_folha: {
        Row: {
          aula_id: string | null
          bonus_hora: number | null
          created_at: string | null
          data_aula: string | null
          descricao: string | null
          folha_id: string
          hora_fim: string | null
          hora_inicio: string | null
          horas_aula: number | null
          id: string
          num_alunos_mes: number | null
          pago: boolean
          tipo: string
          turma_id: string | null
          valor: number
          valor_hora_base: number | null
          valor_hora_efetivo: number | null
        }
        Insert: {
          aula_id?: string | null
          bonus_hora?: number | null
          created_at?: string | null
          data_aula?: string | null
          descricao?: string | null
          folha_id: string
          hora_fim?: string | null
          hora_inicio?: string | null
          horas_aula?: number | null
          id?: string
          num_alunos_mes?: number | null
          pago?: boolean
          tipo?: string
          turma_id?: string | null
          valor?: number
          valor_hora_base?: number | null
          valor_hora_efetivo?: number | null
        }
        Update: {
          aula_id?: string | null
          bonus_hora?: number | null
          created_at?: string | null
          data_aula?: string | null
          descricao?: string | null
          folha_id?: string
          hora_fim?: string | null
          hora_inicio?: string | null
          horas_aula?: number | null
          id?: string
          num_alunos_mes?: number | null
          pago?: boolean
          tipo?: string
          turma_id?: string | null
          valor?: number
          valor_hora_base?: number | null
          valor_hora_efetivo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_folha_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_folha_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "folhas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_folha_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          aluno_id: string | null
          celular: string
          como_conheceu: string | null
          created_at: string
          dia_experimental: string | null
          email: string | null
          horario_preferido: string | null
          id: string
          modalidade_interesse: string | null
          nome: string
          observacoes: string | null
          origem: string | null
          status: Database["public"]["Enums"]["status_lead"]
          updated_at: string
        }
        Insert: {
          aluno_id?: string | null
          celular: string
          como_conheceu?: string | null
          created_at?: string
          dia_experimental?: string | null
          email?: string | null
          horario_preferido?: string | null
          id?: string
          modalidade_interesse?: string | null
          nome: string
          observacoes?: string | null
          origem?: string | null
          status?: Database["public"]["Enums"]["status_lead"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string | null
          celular?: string
          como_conheceu?: string | null
          created_at?: string
          dia_experimental?: string | null
          email?: string | null
          horario_preferido?: string | null
          id?: string
          modalidade_interesse?: string | null
          nome?: string
          observacoes?: string | null
          origem?: string | null
          status?: Database["public"]["Enums"]["status_lead"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes_chamada: {
        Row: {
          aula_id: string
          enviado_em: string
          id: string
          tipo: string
        }
        Insert: {
          aula_id: string
          enviado_em?: string
          id?: string
          tipo: string
        }
        Update: {
          aula_id?: string
          enviado_em?: string
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_chamada_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      matricula_turmas: {
        Row: {
          created_at: string
          data_entrada: string
          data_saida: string | null
          id: string
          matricula_id: string
          turma_id: string
        }
        Insert: {
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          id?: string
          matricula_id: string
          turma_id: string
        }
        Update: {
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          id?: string
          matricula_id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matricula_turmas_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matricula_turmas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          aluno_id: string
          codigo_nextfit: string | null
          contrato_assinado_em: string | null
          contrato_autentique_id: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          dia_vencimento: number
          id: string
          observacao_desconto: string | null
          observacoes: string | null
          percentual_desconto: number | null
          plano: Database["public"]["Enums"]["tipo_plano"]
          status: Database["public"]["Enums"]["status_matricula"]
          tipo_desconto: Database["public"]["Enums"]["tipo_desconto"] | null
          trancamentos_usados: number
          updated_at: string
          valor_final: number
        }
        Insert: {
          aluno_id: string
          codigo_nextfit?: string | null
          contrato_assinado_em?: string | null
          contrato_autentique_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          dia_vencimento?: number
          id?: string
          observacao_desconto?: string | null
          observacoes?: string | null
          percentual_desconto?: number | null
          plano: Database["public"]["Enums"]["tipo_plano"]
          status?: Database["public"]["Enums"]["status_matricula"]
          tipo_desconto?: Database["public"]["Enums"]["tipo_desconto"] | null
          trancamentos_usados?: number
          updated_at?: string
          valor_final: number
        }
        Update: {
          aluno_id?: string
          codigo_nextfit?: string | null
          contrato_assinado_em?: string | null
          contrato_autentique_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dia_vencimento?: number
          id?: string
          observacao_desconto?: string | null
          observacoes?: string | null
          percentual_desconto?: number | null
          plano?: Database["public"]["Enums"]["tipo_plano"]
          status?: Database["public"]["Enums"]["status_matricula"]
          tipo_desconto?: Database["public"]["Enums"]["tipo_desconto"] | null
          trancamentos_usados?: number
          updated_at?: string
          valor_final?: number
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensalidades: {
        Row: {
          codigo_asaas: string | null
          competencia: string
          created_at: string
          desconto_aplicado: number | null
          id: string
          juros_aplicados: number | null
          matricula_id: string
          pago_em: string | null
          status: Database["public"]["Enums"]["status_mensalidade"]
          updated_at: string
          valor: number
          valor_pago: number | null
          vencimento: string
        }
        Insert: {
          codigo_asaas?: string | null
          competencia: string
          created_at?: string
          desconto_aplicado?: number | null
          id?: string
          juros_aplicados?: number | null
          matricula_id: string
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_mensalidade"]
          updated_at?: string
          valor: number
          valor_pago?: number | null
          vencimento: string
        }
        Update: {
          codigo_asaas?: string | null
          competencia?: string
          created_at?: string
          desconto_aplicado?: number | null
          id?: string
          juros_aplicados?: number | null
          matricula_id?: string
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_mensalidade"]
          updated_at?: string
          valor?: number
          valor_pago?: number | null
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensalidades_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      modalidades: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          tipo?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          codigo_asaas: string | null
          comprovante_url: string | null
          created_at: string
          data_pagamento: string
          forma: string
          id: string
          mensalidade_id: string
          registrado_por: string | null
          valor: number
        }
        Insert: {
          codigo_asaas?: string | null
          comprovante_url?: string | null
          created_at?: string
          data_pagamento: string
          forma: string
          id?: string
          mensalidade_id: string
          registrado_por?: string | null
          valor: number
        }
        Update: {
          codigo_asaas?: string | null
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string
          forma?: string
          id?: string
          mensalidade_id?: string
          registrado_por?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_mensalidade_id_fkey"
            columns: ["mensalidade_id"]
            isOneToOne: false
            referencedRelation: "mensalidades"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_usuario: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
          professor_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id: string
          nome: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          professor_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          professor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_usuario_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      precos_referencia: {
        Row: {
          ativo: boolean
          categoria: Database["public"]["Enums"]["categoria_cobranca"]
          created_at: string
          descricao: string
          id: string
          valor: number | null
        }
        Insert: {
          ativo?: boolean
          categoria: Database["public"]["Enums"]["categoria_cobranca"]
          created_at?: string
          descricao: string
          id?: string
          valor?: number | null
        }
        Update: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["categoria_cobranca"]
          created_at?: string
          descricao?: string
          id?: string
          valor?: number | null
        }
        Relationships: []
      }
      presencas: {
        Row: {
          aluno_id: string
          aula_id: string
          created_at: string
          id: string
          observacao: string | null
          registrado_por: string | null
          status: Database["public"]["Enums"]["status_presenca"]
        }
        Insert: {
          aluno_id: string
          aula_id: string
          created_at?: string
          id?: string
          observacao?: string | null
          registrado_por?: string | null
          status: Database["public"]["Enums"]["status_presenca"]
        }
        Update: {
          aluno_id?: string
          aula_id?: string
          created_at?: string
          id?: string
          observacao?: string | null
          registrado_por?: string | null
          status?: Database["public"]["Enums"]["status_presenca"]
        }
        Relationships: [
          {
            foreignKeyName: "presencas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          ativo: boolean
          celular: string | null
          cpf: string | null
          created_at: string
          email: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento_professor"]
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
          valor_base: number | null
        }
        Insert: {
          ativo?: boolean
          celular?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento_professor"]
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
          valor_base?: number | null
        }
        Update: {
          ativo?: boolean
          celular?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento_professor"]
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
          valor_base?: number | null
        }
        Relationships: []
      }
      renegociacoes: {
        Row: {
          aprovado_por: string | null
          created_at: string
          id: string
          mensalidade_id: string
          motivo: string | null
          valor_negociado: number
          valor_original: number
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string
          id?: string
          mensalidade_id: string
          motivo?: string | null
          valor_negociado: number
          valor_original: number
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string
          id?: string
          mensalidade_id?: string
          motivo?: string | null
          valor_negociado?: number
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "renegociacoes_mensalidade_id_fkey"
            columns: ["mensalidade_id"]
            isOneToOne: false
            referencedRelation: "mensalidades"
            referencedColumns: ["id"]
          },
        ]
      }
      reposicoes: {
        Row: {
          aula_reposicao_id: string | null
          created_at: string | null
          id: string
          notificou_secretaria: boolean
          prazo: string
          professor_id: string
          status: string
          substituicao_id: string
          turma_id: string
        }
        Insert: {
          aula_reposicao_id?: string | null
          created_at?: string | null
          id?: string
          notificou_secretaria?: boolean
          prazo: string
          professor_id: string
          status?: string
          substituicao_id: string
          turma_id: string
        }
        Update: {
          aula_reposicao_id?: string | null
          created_at?: string | null
          id?: string
          notificou_secretaria?: boolean
          prazo?: string
          professor_id?: string
          status?: string
          substituicao_id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposicoes_aula_reposicao_id_fkey"
            columns: ["aula_reposicao_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposicoes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposicoes_substituicao_id_fkey"
            columns: ["substituicao_id"]
            isOneToOne: true
            referencedRelation: "substituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposicoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      responsaveis: {
        Row: {
          celular: string
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          notificacao: Database["public"]["Enums"]["tipo_notif_responsavel"]
          parentesco: string | null
          updated_at: string
        }
        Insert: {
          celular: string
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          notificacao?: Database["public"]["Enums"]["tipo_notif_responsavel"]
          parentesco?: string | null
          updated_at?: string
        }
        Update: {
          celular?: string
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          notificacao?: Database["public"]["Enums"]["tipo_notif_responsavel"]
          parentesco?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      salas: {
        Row: {
          ativo: boolean
          capacidade_max: number | null
          created_at: string
          id: string
          nome: string
          restricoes: string | null
        }
        Insert: {
          ativo?: boolean
          capacidade_max?: number | null
          created_at?: string
          id?: string
          nome: string
          restricoes?: string | null
        }
        Update: {
          ativo?: boolean
          capacidade_max?: number | null
          created_at?: string
          id?: string
          nome?: string
          restricoes?: string | null
        }
        Relationships: []
      }
      substituicoes: {
        Row: {
          aprovado_por: string | null
          aula_id: string
          created_at: string
          id: string
          motivo: string | null
          professor_ausente_id: string
          professor_substituto_id: string | null
          tem_atestado: boolean
        }
        Insert: {
          aprovado_por?: string | null
          aula_id: string
          created_at?: string
          id?: string
          motivo?: string | null
          professor_ausente_id: string
          professor_substituto_id?: string | null
          tem_atestado?: boolean
        }
        Update: {
          aprovado_por?: string | null
          aula_id?: string
          created_at?: string
          id?: string
          motivo?: string | null
          professor_ausente_id?: string
          professor_substituto_id?: string | null
          tem_atestado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "substituicoes_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substituicoes_professor_ausente_id_fkey"
            columns: ["professor_ausente_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substituicoes_professor_substituto_id_fkey"
            columns: ["professor_substituto_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_config: {
        Row: {
          chave: string
          updated_at: string | null
          value: string
        }
        Insert: {
          chave: string
          updated_at?: string | null
          value: string
        }
        Update: {
          chave?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      termos_aditivos: {
        Row: {
          created_at: string
          data_vigencia: string
          descricao_anterior: string | null
          descricao_nova: string | null
          id: string
          matricula_id: string
          tipo: string
          valor_anterior: number | null
          valor_novo: number | null
        }
        Insert: {
          created_at?: string
          data_vigencia: string
          descricao_anterior?: string | null
          descricao_nova?: string | null
          id?: string
          matricula_id: string
          tipo: string
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Update: {
          created_at?: string
          data_vigencia?: string
          descricao_anterior?: string | null
          descricao_nova?: string | null
          id?: string
          matricula_id?: string
          tipo?: string
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "termos_aditivos_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      trancamentos: {
        Row: {
          aprovado_por: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          matricula_id: string
          motivo: string | null
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          id?: string
          matricula_id: string
          motivo?: string | null
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          matricula_id?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trancamentos_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      turma_horarios: {
        Row: {
          created_at: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          hora_fim: string
          hora_inicio: string
          id: string
          turma_id: string
        }
        Insert: {
          created_at?: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          hora_fim: string
          hora_inicio: string
          id?: string
          turma_id: string
        }
        Update: {
          created_at?: string
          dia_semana?: Database["public"]["Enums"]["dia_semana"]
          hora_fim?: string
          hora_inicio?: string
          id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turma_horarios_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          capacidade: number
          created_at: string
          descricao: string | null
          faixa_etaria_max: number | null
          faixa_etaria_min: number | null
          id: string
          modalidade_id: string
          nivel: string | null
          nome: string
          observacoes: string | null
          preco_padrao: number
          professor_id: string | null
          sala_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          capacidade?: number
          created_at?: string
          descricao?: string | null
          faixa_etaria_max?: number | null
          faixa_etaria_min?: number | null
          id?: string
          modalidade_id: string
          nivel?: string | null
          nome: string
          observacoes?: string | null
          preco_padrao: number
          professor_id?: string | null
          sala_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          capacidade?: number
          created_at?: string
          descricao?: string | null
          faixa_etaria_max?: number | null
          faixa_etaria_min?: number | null
          id?: string
          modalidade_id?: string
          nivel?: string | null
          nome?: string
          observacoes?: string | null
          preco_padrao?: number
          professor_id?: string | null
          sala_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      categoria_cobranca:
        | "taxa_matricula"
        | "espetaculo_participacao"
        | "espetaculo_figurino"
        | "espetaculo_foto"
        | "espetaculo_programa"
        | "pratica_montagem"
        | "workshop"
        | "aula_particular"
        | "uniforme"
        | "aluguel_sala"
        | "ensaio_extra"
        | "outro"
      dia_semana:
        | "segunda"
        | "terca"
        | "quarta"
        | "quinta"
        | "sexta"
        | "sabado"
        | "domingo"
      forma_pagamento_professor:
        | "fixo_mensal"
        | "por_aluno"
        | "percentual"
        | "diaria"
      perfil_usuario: "admin" | "secretaria" | "professor"
      status_aula: "agendada" | "aberta" | "concluida" | "cancelada"
      status_cobranca: "pendente" | "pago" | "cancelado" | "expirado"
      status_financeiro:
        | "em_dia"
        | "em_atraso"
        | "inadimplente"
        | "renegociando"
        | "isento"
      status_lead:
        | "novo"
        | "em_contato"
        | "experimental_agendada"
        | "convertido"
        | "perdido"
      status_matricula: "ativa" | "trancada" | "cancelada" | "encerrada"
      status_mensalidade:
        | "aberta"
        | "recebida"
        | "em_atraso"
        | "renegociada"
        | "cancelada"
      status_pedagogico:
        | "lead"
        | "experimental"
        | "ativo"
        | "trancado"
        | "cancelado"
        | "ex_aluno"
      status_presenca:
        | "presente"
        | "falta"
        | "falta_justificada"
        | "reposicao"
        | "experimental"
        | "professor_faltou"
      tipo_desconto:
        | "bairro"
        | "familia"
        | "all_dance"
        | "vip"
        | "bolsa"
        | "outro"
      tipo_notif_responsavel:
        | "notificacao_e_cobranca"
        | "so_notificacao"
        | "so_cobranca"
        | "nenhum"
      tipo_plano: "mensal" | "trimestral" | "semestral" | "anual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_cobranca: [
        "taxa_matricula",
        "espetaculo_participacao",
        "espetaculo_figurino",
        "espetaculo_foto",
        "espetaculo_programa",
        "pratica_montagem",
        "workshop",
        "aula_particular",
        "uniforme",
        "aluguel_sala",
        "ensaio_extra",
        "outro",
      ],
      dia_semana: [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
      ],
      forma_pagamento_professor: [
        "fixo_mensal",
        "por_aluno",
        "percentual",
        "diaria",
      ],
      perfil_usuario: ["admin", "secretaria", "professor"],
      status_aula: ["agendada", "aberta", "concluida", "cancelada"],
      status_cobranca: ["pendente", "pago", "cancelado", "expirado"],
      status_financeiro: [
        "em_dia",
        "em_atraso",
        "inadimplente",
        "renegociando",
        "isento",
      ],
      status_lead: [
        "novo",
        "em_contato",
        "experimental_agendada",
        "convertido",
        "perdido",
      ],
      status_matricula: ["ativa", "trancada", "cancelada", "encerrada"],
      status_mensalidade: [
        "aberta",
        "recebida",
        "em_atraso",
        "renegociada",
        "cancelada",
      ],
      status_pedagogico: [
        "lead",
        "experimental",
        "ativo",
        "trancado",
        "cancelado",
        "ex_aluno",
      ],
      status_presenca: [
        "presente",
        "falta",
        "falta_justificada",
        "reposicao",
        "experimental",
        "professor_faltou",
      ],
      tipo_desconto: [
        "bairro",
        "familia",
        "all_dance",
        "vip",
        "bolsa",
        "outro",
      ],
      tipo_notif_responsavel: [
        "notificacao_e_cobranca",
        "so_notificacao",
        "so_cobranca",
        "nenhum",
      ],
      tipo_plano: ["mensal", "trimestral", "semestral", "anual"],
    },
  },
} as const
