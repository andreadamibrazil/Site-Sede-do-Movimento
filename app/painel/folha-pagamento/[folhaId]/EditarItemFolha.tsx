'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

type Motivo = 'atestado' | 'falta_justificada' | 'engano' | 'dispensa'

const MOTIVOS: { value: Motivo; label: string }[] = [
  { value: 'atestado',          label: 'Atestado médico (pago)' },
  { value: 'falta_justificada', label: 'Falta justificada (pago)' },
  { value: 'engano',            label: 'Lançado por engano (R$ 0,00)' },
  { value: 'dispensa',          label: 'Dispensado neste dia (R$ 0,00)' },
]

export default function EditarItemFolha({
  itemId,
  folhaStatus,
  pago,
}: {
  itemId: string
  folhaStatus: string
  pago?: boolean
}) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const bloqueado = folhaStatus === 'assinado' || folhaStatus === 'pago'

  function toggleMenu() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const dropH = pago === false ? 48 : 160 // 1 option vs 4 options
      const spaceBelow = window.innerHeight - rect.bottom
      const rightOffset = window.innerWidth - rect.right

      if (spaceBelow < dropH) {
        setStyle({ bottom: window.innerHeight - rect.top + 4, right: rightOffset })
      } else {
        setStyle({ top: rect.bottom + 4, right: rightOffset })
      }
    }
    setAberto(v => !v)
  }

  async function aplicar(motivo: Motivo) {
    if (bloqueado) return
    setCarregando(true)
    const devePagar = motivo === 'atestado' || motivo === 'falta_justificada'
    await fetch(`/api/folha-pagamento/itens/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pago: devePagar, descricao_motivo: motivo }),
    })
    setCarregando(false)
    setAberto(false)
    router.refresh()
  }

  async function restaurar() {
    if (bloqueado) return
    setCarregando(true)
    await fetch(`/api/folha-pagamento/itens/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pago: true, descricao_motivo: null }),
    })
    setCarregando(false)
    setAberto(false)
    router.refresh()
  }

  if (bloqueado) return null

  const dropdown = (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-52 text-xs"
        style={style}
      >
        {pago === false ? (
          <button
            onClick={restaurar}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-indigo-700 font-medium"
          >
            ↩ Restaurar aula (desfazer)
          </button>
        ) : (
          MOTIVOS.map(m => (
            <button
              key={m.value}
              onClick={() => aplicar(m.value)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
            >
              {m.label}
            </button>
          ))
        )}
      </div>
    </>
  )

  return (
    <div>
      <button
        ref={btnRef}
        onClick={toggleMenu}
        disabled={carregando}
        title="Editar este item"
        className="text-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-30 text-xs px-1"
      >
        ···
      </button>

      {mounted && aberto && createPortal(dropdown, document.body)}
    </div>
  )
}
