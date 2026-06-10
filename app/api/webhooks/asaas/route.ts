import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const token = req.headers.get('asaas-access-token')
  if (process.env.ASAAS_WEBHOOK_TOKEN && token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { event, payment } = body

  if (!payment?.externalReference) return NextResponse.json({ ok: true })

  const [tipo, id] = payment.externalReference.split(':')
  if (!tipo || !id) return NextResponse.json({ ok: true })

  const supabase = createServiceClient()

  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const pagoEm = payment.paymentDate ?? new Date().toISOString().split('T')[0]

    if (tipo === 'cobranca') {
      await supabase.from('cobrancas_avulsas').update({
        status: 'pago',
        pago_em: pagoEm,
        forma_pagamento: mapForma(payment.billingType),
      }).eq('id', id)
    }

    if (tipo === 'mensalidade') {
      await supabase.from('mensalidades').update({
        status: 'recebida',
        pago_em: pagoEm,
        valor_pago: payment.value,
      }).eq('id', id)
    }
  }

  if (event === 'PAYMENT_OVERDUE') {
    if (tipo === 'cobranca') {
      await supabase.from('cobrancas_avulsas').update({ status: 'expirado' }).eq('id', id)
    }
    if (tipo === 'mensalidade') {
      await supabase.from('mensalidades').update({ status: 'em_atraso' }).eq('id', id)
    }
  }

  if (event === 'PAYMENT_DELETED') {
    if (tipo === 'cobranca') {
      await supabase.from('cobrancas_avulsas').update({ status: 'cancelado' }).eq('id', id)
    }
  }

  return NextResponse.json({ ok: true })
}

function mapForma(billingType: string): string {
  if (billingType === 'PIX') return 'pix'
  if (billingType === 'BOLETO') return 'boleto'
  if (billingType === 'CREDIT_CARD') return 'cartao'
  return 'transferencia'
}
