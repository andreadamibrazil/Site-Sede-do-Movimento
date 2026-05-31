import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface ItemFolha {
  tipo: string
  descricao?: string
  data_aula?: string
  hora_inicio?: string
  hora_fim?: string
  horas_aula?: number
  num_alunos_mes?: number
  valor_hora_base?: number
  bonus_hora?: number
  valor_hora_efetivo?: number
  valor: number
  pago: boolean
}

interface FolhaPDF {
  professor: string
  cpf?: string
  mes: string       // ex: "Maio 2026"
  valor_aulas: number
  valor_fixo: number
  valor_total: number
  itens: ItemFolha[]
}

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const H = (h?: number) => h !== undefined ? `${Number(h).toFixed(1).replace('.', ',')}h` : ''

export async function gerarPDFFolha(data: FolhaPDF): Promise<Uint8Array> {
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

  function texto(p: any, x: number, y: number, t: string, size: number, font: any, color = ESCURO) {
    p.drawText(t, { x, y, size, font, color })
  }

  function linha(p: any, y: number, x1 = MARGEM, x2 = LARGURA - MARGEM, color = rgb(0.88, 0.88, 0.88)) {
    p.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.5, color })
  }

  let { p, y } = novaPage()

  // Cabeçalho
  texto(p, MARGEM, y, 'SEDE DO MOVIMENTO', 16, fontB, LILAS)
  texto(p, MARGEM, y - 18, 'Escola de Artes Cênicas', 10, fontR, CINZA)
  texto(p, LARGURA - MARGEM - 100, y, `Folha de Pagamento`, 10, fontR, CINZA)
  texto(p, LARGURA - MARGEM - 100, y - 14, data.mes, 12, fontB, ESCURO)
  y -= 40
  linha(p, y)
  y -= 20

  // Dados do professor
  texto(p, MARGEM, y, data.professor, 14, fontB)
  if (data.cpf) texto(p, MARGEM, y - 16, `CPF: ${data.cpf}`, 9, fontR, CINZA)
  y -= 40

  // Aulas por turma
  const porTurma: Record<string, ItemFolha[]> = {}
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

    // Header da turma
    p.drawRectangle({ x: MARGEM, y: y - 4, width: LARGURA - 2 * MARGEM, height: 18, color: rgb(0.96, 0.94, 1.0) })
    texto(p, MARGEM + 6, y, turma, 10, fontB, LILAS)
    texto(p, MARGEM + 6, y - 10, `${primeiroItem.num_alunos_mes ?? 0} alunos no mês${faixaInfo}`, 8, fontR, CINZA)
    texto(p, LARGURA - MARGEM - 70, y - 4, BRL(totalTurma), 10, fontB, VERDE)
    y -= 22

    // Aulas
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

  // Itens fixos
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

  // Total
  y -= 10
  linha(p, y)
  y -= 20
  if (data.valor_fixo > 0) {
    texto(p, MARGEM, y, 'Subtotal aulas:', 9, fontR, CINZA)
    texto(p, LARGURA - MARGEM - 70, y, BRL(data.valor_aulas), 9, fontR, CINZA)
    y -= 14
    texto(p, MARGEM, y, 'Subtotal fixo:', 9, fontR, CINZA)
    texto(p, LARGURA - MARGEM - 70, y, BRL(data.valor_fixo), 9, fontR, CINZA)
    y -= 14
  }
  texto(p, MARGEM, y, 'TOTAL A RECEBER', 12, fontB, ESCURO)
  texto(p, LARGURA - MARGEM - 90, y, BRL(data.valor_total), 14, fontB, VERDE)
  y -= 40

  // Assinaturas
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

  // Rodapé
  texto(p, MARGEM, 30, `Fechamento dia 5 · Pagamento dia 15 via Pix · ${new Date().toLocaleDateString('pt-BR')}`, 7, fontR, CINZA)

  return doc.save()
}
