'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AssistenteIA from './AssistenteIA'

type NavItemProps = {
  href: string
  icon: string
  label: string
  admin?: boolean
  collapsed?: boolean
  external?: boolean
}

function NavItem({ href, icon, label, admin = false, collapsed = false, external = false }: NavItemProps) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/painel' && pathname.startsWith(href))

  const baseClass = `flex items-center gap-3 py-2 rounded-lg text-sm transition-colors ${
    collapsed ? 'justify-center px-2' : 'px-3'
  } ${
    active
      ? admin
        ? 'bg-violet-50 text-violet-700 font-medium'
        : 'bg-gray-100 text-gray-900 font-medium'
      : admin
        ? 'text-violet-500 hover:bg-violet-50 hover:text-violet-700'
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
  }`

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={collapsed ? label : undefined}
        className={baseClass}
      >
        <span className="shrink-0 text-base">{icon}</span>
        {!collapsed && <span className="truncate">{label}</span>}
      </a>
    )
  }

  return (
    <Link
      href={href}
      prefetch={true}
      title={collapsed ? label : undefined}
      className={baseClass}
    >
      <span className="shrink-0 text-base">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

type Props = {
  email: string
  isAdmin: boolean
}

export default function PainelSidebar({ email, isAdmin }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  // Persiste estado colapsado no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-56'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 shrink-0`}
    >
      {/* Logo + toggle */}
      <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        {!collapsed && (
          <Link href="/painel" prefetch className="flex-1 min-w-0">
            <Image
              src="/logo-sede.png"
              alt="Sede do Movimento"
              width={160}
              height={48}
              className="object-contain object-left h-10 w-auto max-w-[130px]"
              priority
            />
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className={`shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${collapsed ? 'mx-auto' : 'ml-auto'}`}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavItem href="/painel"            icon="📊" label="Dashboard"  collapsed={collapsed} />
        <NavItem href="/painel/alunos"     icon="👥" label="Alunos"     collapsed={collapsed} />
        <NavItem href="/painel/turmas"     icon="🎓" label="Turmas"     collapsed={collapsed} />
        <NavItem href="/painel/agenda"     icon="📅" label="Agenda"     collapsed={collapsed} />
        <NavItem href="/painel/financeiro" icon="💰" label="Financeiro" collapsed={collapsed} />
        <NavItem href="/painel/leads"      icon="🎯" label="Leads"      collapsed={collapsed} />
        <NavItem href="/painel/relatorios" icon="📋" label="Relatórios" collapsed={collapsed} />

        {isAdmin && (
          <div className="pt-4">
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 mb-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-light tracking-widest text-violet-400 uppercase">admin</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            )}
            {collapsed && <div className="h-px bg-gray-100 mb-2 mx-1" />}

            <NavItem href="/painel/professores"     icon="👨‍🏫" label="Professores" admin collapsed={collapsed} />
            <NavItem href="/painel/folha-pagamento" icon="💵" label="Folha Pgto"  admin collapsed={collapsed} />
            <NavItem href="/painel/usuarios"        icon="🔑" label="Usuários"    admin collapsed={collapsed} />
            <NavItem href="/painel/historico"       icon="🕐" label="Histórico"   admin collapsed={collapsed} />

            {!collapsed && (
              <div className="flex items-center gap-2 px-3 mt-4 mb-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-light tracking-widest text-violet-400 uppercase">ferramentas</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            )}
            {collapsed && <div className="h-px bg-gray-100 my-2 mx-1" />}

            <NavItem href="https://plane.sededomovimento.art" icon="✈️" label="Plane" admin collapsed={collapsed} external />
            <NavItem href="https://n8n.sededomovimento.art"   icon="⚡" label="n8n"   admin collapsed={collapsed} external />
            <AssistenteIA collapsed={collapsed} />
          </div>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100 space-y-2">
        {!collapsed && (
          <>
            <p className="text-xs text-gray-400 truncate">{email}</p>
            {isAdmin && (
              <span className="inline-block text-[9px] font-light tracking-widest text-violet-400 uppercase">
                administrador
              </span>
            )}
          </>
        )}
        {collapsed && isAdmin && (
          <div className="w-2 h-2 rounded-full bg-violet-400 mx-auto" title="administrador" />
        )}
        {/* Logout precisa de <a> para forçar reload e limpar sessão */}
        <a
          href="/api/auth/signout"
          title="Sair"
          className={`flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <span>↩</span>
          {!collapsed && <span>Sair</span>}
        </a>
      </div>
    </aside>
  )
}
