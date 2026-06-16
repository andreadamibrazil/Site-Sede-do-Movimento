// Script temporário para gerar prévia da folha de pagamento
// Rodar: node scripts/preview-folha.mjs
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const BRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const H = (h) => h !== undefined ? `${Number(h).toFixed(1).replace('.', ',')}h` : ''

const data = {
  professor: 'Douglas Arruda',
  cpf: '123.456.789-00',
  mes: 'Junho 2026',
  valor_aulas: 756.00,
  valor_fixo: 50.00,
  valor_total: 886.00,
  itens: [
    { tipo: 'aula', descricao: 'Danças Urbanas — Prelim I/II', data_aula: '2026-06-02', hora_inicio: '18:00', hora_fim: '19:30', horas_aula: 1.5, num_alunos_mes: 12, valor_hora_base: 31.50, bonus_hora: 10.50, valor_hora_efetivo: 42.00, valor: 63.00, pago: true },
    { tipo: 'aula', descricao: 'Danças Urbanas — Prelim I/II', data_aula: '2026-06-05', hora_inicio: '18:00', hora_fim: '19:30', horas_aula: 1.5, num_alunos_mes: 12, valor_hora_base: 31.50, bonus_hora: 10.50, valor_hora_efetivo: 42.00, valor: 63.00, pago: true },
    { tipo: 'aula', descricao: 'Danças Urbanas — Prelim I/II', data_aula: '2026-06-09', hora_inicio: '18:00', hora_fim: '19:30', horas_aula: 1.5, num_alunos_mes: 12, valor_hora_base: 31.50, bonus_hora: 10.50, valor_hora_efetivo: 42.00, valor: 0, pago: false },
    { tipo: 'aula', descricao: 'Danças Urbanas — Prelim I/II', data_aula: '2026-06-12', hora_inicio: '18:00', hora_fim: '19:30', horas_aula: 1.5, num_alunos_mes: 12, valor_hora_base: 31.50, bonus_hora: 10.50, valor_hora_efetivo: 42.00, valor: 63.00, pago: true },
    { tipo: 'aula', descricao: 'Danças Urbanas — Prelim I/II', data_aula: '2026-06-16', hora_inicio: '18:00', hora_fim: '19:30', horas_aula: 1.5, num_alunos_mes: 12, valor_hora_base: 31.50, bonus_hora: 10.50, valor_hora_efetivo: 42.00, valor: 63.00, pago: true },
    { tipo: 'aula', descricao: 'Danças Urbanas — Prelim I/II', data_aula: '2026-06-19', hora_inicio: '18:00', hora_fim: '19:30', horas_aula: 1.5, num_alunos_mes: 12, valor_hora_base: 31.50, bonus_hora: 10.50, valor_hora_efetivo: 42.00, valor: 63.00, pago: true },
    { tipo: 'aula', descricao: 'Danças Urbanas — Prelim I/II', data_aula: '2026-06-23', hora_inicio: '18:00', hora_fim: '19:30', horas_aula: 1.5, num_alunos_mes: 12, valor_hora_base: 31.50, bonus_hora: 10.50, valor_hora_efetivo: 42.00, valor: 63.00, pago: true },
    { tipo: 'aula', descricao: 'Danças Urbanas — Prelim I/II', data_aula: '2026-06-26', hora_inicio: '18:00', hora_fim: '19:30', horas_aula: 1.5, num_alunos_mes: 12, valor_hora_base: 31.50, bonus_hora: 10.50, valor_hora_efetivo: 42.00, valor: 63.00, pago: true },
    { tipo: 'aula', descricao: 'Pre-Street — Iniciante', data_aula: '2026-06-04', hora_inicio: '16:30', hora_fim: '18:00', horas_aula: 1.5, num_alunos_mes: 8, valor_hora_base: 31.50, bonus_hora: 0, valor_hora_efetivo: 31.50, valor: 47.25, pago: true },
    { tipo: 'aula', descricao: 'Pre-Street — Iniciante', data_aula: '2026-06-11', hora_inicio: '16:30', hora_fim: '18:00', horas_aula: 1.5, num_alunos_mes: 8, valor_hora_base: 31.50, bonus_hora: 0, valor_hora_efetivo: 31.50, valor: 47.25, pago: true },
    { tipo: 'aula', descricao: 'Pre-Street — Iniciante', data_aula: '2026-06-18', hora_inicio: '16:30', hora_fim: '18:00', horas_aula: 1.5, num_alunos_mes: 8, valor_hora_base: 31.50, bonus_hora: 0, valor_hora_efetivo: 31.50, valor: 47.25, pago: true },
    { tipo: 'aula', descricao: 'Pre-Street — Iniciante', data_aula: '2026-06-25', hora_inicio: '16:30', hora_fim: '18:00', horas_aula: 1.5, num_alunos_mes: 8, valor_hora_base: 31.50, bonus_hora: 0, valor_hora_efetivo: 31.50, valor: 47.25, pago: true },
    { tipo: 'fixo', descricao: 'Transporte / passagem mensal', valor: 50.00, pago: true },
    { tipo: 'avulso', descricao: 'Workshop Sábado 20/06 — Improvisação Urbana', valor: 80.00, pago: true },
  ],
}

async function gerar() {
  const doc = await PDFDocument.create()
  const fontR = await doc.embedFont(StandardFonts.Helvetica)
  const fontB = await doc.embedFont(StandardFonts.HelveticaBold)

  const MARGEM = 50
  const LARGURA = 595
  const ALTURA = 842
  const CINZA = rgb(0.4, 0.4, 0.4)
  const ESCURO = rgb(0.1, 0.1, 0.1)
  const VERDE = rgb(0.1, 0.55, 0.3)
  const LILAS = rgb(0.35, 0.25, 0.65)

  function novaPage() {
    const p = doc.addPage([LARGURA, ALTURA])
    return { p, y: ALTURA - MARGEM }
  }

  function texto(p, x, y, t, size, font, color = ESCURO) {
    p.drawText(t, { x, y, size, font, color })
  }

  function linha(p, y, x1 = MARGEM, x2 = LARGURA - MARGEM, color = rgb(0.88, 0.88, 0.88)) {
    p.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.5, color })
  }

  let { p, y } = novaPage()

  texto(p, MARGEM, y, 'SEDE DO MOVIMENTO', 16, fontB, LILAS)
  texto(p, MARGEM, y - 18, 'Escola de Artes Cênicas', 10, fontR, CINZA)
  texto(p, LARGURA - MARGEM - 100, y, `Folha de Pagamento`, 10, fontR, CINZA)
  texto(p, LARGURA - MARGEM - 100, y - 14, data.mes, 12, fontB, ESCURO)
  y -= 40
  linha(p, y)
  y -= 20

  texto(p, MARGEM, y, data.professor, 14, fontB)
  let yProf = y - 16
  if (data.cpf) { texto(p, MARGEM, yProf, `CPF: ${data.cpf}`, 9, fontR, CINZA); yProf -= 14 }
  y = yProf - 10

  const porTurma = {}
  for (const item of data.itens) {
    if (item.tipo !== 'aula') continue
    const k = item.descricao ?? 'Turma'
    if (!porTurma[k]) porTurma[k] = []
    porTurma[k].push(item)
  }

  for (const [turma, aulas] of Object.entries(porTurma)) {
    if (y < 120) { const np = novaPage(); p = np.p; y = np.y }
    const totalTurma = aulas.reduce((s, a) => s + (a.pago ? a.valor : 0), 0)
    const primeiroItem = aulas[0]
    const faixaInfo = primeiroItem.bonus_hora && primeiroItem.bonus_hora > 0
      ? ` · R$${Number(primeiroItem.valor_hora_base).toFixed(2).replace('.',',')} base + R$${Number(primeiroItem.bonus_hora).toFixed(2).replace('.',',')} bônus/h`
      : ` · R$${Number(primeiroItem.valor_hora_efetivo ?? 0).toFixed(2).replace('.',',')}/h`

    p.drawRectangle({ x: MARGEM, y: y - 4, width: LARGURA - 2 * MARGEM, height: 18, color: rgb(0.96, 0.94, 1.0) })
    texto(p, MARGEM + 6, y, turma, 10, fontB, LILAS)
    texto(p, MARGEM + 6, y - 10, `${primeiroItem.num_alunos_mes ?? 0} alunos no mês${faixaInfo}`, 8, fontR, CINZA)
    texto(p, LARGURA - MARGEM - 70, y - 4, BRL(totalTurma), 10, fontB, VERDE)
    y -= 22

    for (const aula of aulas) {
      if (y < 60) { const np = novaPage(); p = np.p; y = np.y }
      const dataF = aula.data_aula
        ? new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
        : ''
      const horario = `${aula.hora_inicio?.slice(0,5) ?? ''}–${aula.hora_fim?.slice(0,5) ?? ''}`
      if (!aula.pago) {
        texto(p, MARGEM + 10, y, `${dataF}  ${horario}  ${H(aula.horas_aula)}`, 8, fontR, rgb(0.7, 0.3, 0.3))
        texto(p, LARGURA - MARGEM - 100, y, 'Falta não justificada', 8, fontR, rgb(0.7, 0.3, 0.3))
      } else {
        texto(p, MARGEM + 10, y, `${dataF}  ${horario}  ${H(aula.horas_aula)}`, 8, fontR, CINZA)
        texto(p, LARGURA - MARGEM - 70, y, BRL(aula.valor), 8, fontR, ESCURO)
      }
      y -= 14
    }
    y -= 8
  }

  const fixos = data.itens.filter(i => i.tipo === 'fixo')
  if (fixos.length > 0) {
    if (y < 100) { const np = novaPage(); p = np.p; y = np.y }
    p.drawRectangle({ x: MARGEM, y: y - 4, width: LARGURA - 2 * MARGEM, height: 16, color: rgb(0.96, 0.96, 0.96) })
    texto(p, MARGEM + 6, y, 'Valores fixos', 10, fontB, ESCURO)
    y -= 20
    for (const item of fixos) {
      texto(p, MARGEM + 10, y, item.descricao ?? 'Fixo', 9, fontR, CINZA)
      texto(p, LARGURA - MARGEM - 70, y, BRL(item.valor), 9, fontR, ESCURO)
      y -= 16
    }
  }

  const avulsos = data.itens.filter(i => i.tipo === 'avulso')
  if (avulsos.length > 0) {
    if (y < 100) { const np = novaPage(); p = np.p; y = np.y }
    p.drawRectangle({ x: MARGEM, y: y - 4, width: LARGURA - 2 * MARGEM, height: 16, color: rgb(0.96, 0.96, 0.96) })
    texto(p, MARGEM + 6, y, 'Lançamentos avulsos', 10, fontB, ESCURO)
    y -= 20
    for (const item of avulsos) {
      texto(p, MARGEM + 10, y, item.descricao ?? 'Avulso', 9, fontR, CINZA)
      texto(p, LARGURA - MARGEM - 70, y, BRL(item.valor), 9, fontR, ESCURO)
      y -= 16
    }
  }

  const totalAvulso = avulsos.reduce((s, i) => s + (i.pago ? i.valor : 0), 0)
  const totalFixoReal = fixos.reduce((s, i) => s + (i.pago ? i.valor : 0), 0)
  y -= 10
  linha(p, y)
  y -= 20
  if (totalFixoReal > 0 || totalAvulso > 0) {
    texto(p, MARGEM, y, 'Subtotal aulas:', 9, fontR, CINZA)
    texto(p, LARGURA - MARGEM - 70, y, BRL(data.valor_aulas), 9, fontR, CINZA)
    y -= 14
    if (totalFixoReal > 0) {
      texto(p, MARGEM, y, 'Subtotal fixo:', 9, fontR, CINZA)
      texto(p, LARGURA - MARGEM - 70, y, BRL(totalFixoReal), 9, fontR, CINZA)
      y -= 14
    }
    if (totalAvulso > 0) {
      texto(p, MARGEM, y, 'Lançamentos avulsos:', 9, fontR, CINZA)
      texto(p, LARGURA - MARGEM - 70, y, BRL(totalAvulso), 9, fontR, CINZA)
      y -= 14
    }
  }

  texto(p, MARGEM, y, 'TOTAL A RECEBER', 12, fontB, ESCURO)
  texto(p, LARGURA - MARGEM - 90, y, BRL(data.valor_total), 14, fontB, VERDE)
  y -= 40

  linha(p, y)
  y -= 30
  texto(p, MARGEM, y, 'Assinatura da Escola', 9, fontR, CINZA)
  texto(p, LARGURA / 2 + 20, y, 'Assinatura do Professor(a)', 9, fontR, CINZA)
  y -= 40
  linha(p, y, MARGEM, LARGURA / 2 - 20)
  linha(p, y, LARGURA / 2 + 20, LARGURA - MARGEM)
  y -= 12
  texto(p, MARGEM, y, 'Sede do Movimento', 8, fontR, CINZA)
  texto(p, LARGURA / 2 + 20, y, data.professor, 8, fontR, CINZA)

  texto(p, MARGEM, 30, `Fechamento dia 5 · Pagamento dia 15 via Pix · ${new Date().toLocaleDateString('pt-BR')}`, 7, fontR, CINZA)

  const bytes = await doc.save()
  writeFileSync('scripts/preview-folha.pdf', bytes)
  console.log('PDF gerado: scripts/preview-folha.pdf')
}

gerar().catch(console.error)
