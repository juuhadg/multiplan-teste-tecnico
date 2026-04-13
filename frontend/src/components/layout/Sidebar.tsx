import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import type { Role } from '../../types';

function roleLabel(role: Role): string {
  return role === 'lojista' ? 'Lojista' : 'Comprador';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '??';
}

function IconHome({ className = 'h-5 w-5 shrink-0 text-current' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function IconSearch({ className = 'h-5 w-5 shrink-0 text-current' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function IconLogout({ className = 'h-5 w-5 shrink-0 text-current' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V18M18 9l3 3m0 0-3 3m3-3H9"
      />
    </svg>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-600/5'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`;

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    onNavigate?.();
    navigate('/login', { replace: true });
  }

  if (!user) return null;

  const homeTo = user.role === 'lojista' ? '/dashboard' : '/feed';

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 px-5 pb-2 pt-5">
        <Link
          to={homeTo}
          onClick={onNavigate}
          className="flex items-center gap-3 font-bold tracking-tight text-slate-900"
        >
          <img
            src="/multiplan.png"
            alt="Multiplan"
            className="h-9 w-9 shrink-0 rounded-lg object-contain"
          />
          <span className="text-base leading-tight">Multiplan Ofertas</span>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 pb-6 pt-2">
        {user.role === 'lojista' && (
          <NavLink to="/dashboard" className={navClass} onClick={onNavigate} end>
            <IconHome />
            Dashboard
          </NavLink>
        )}
        <NavLink to="/feed" className={navClass} onClick={onNavigate}>
          <IconSearch />
          Feed de Ofertas
        </NavLink>
      </nav>

      <div className="mt-auto shrink-0 border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white"
            aria-hidden
          >
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1 leading-snug">
            <p className="truncate text-sm font-semibold text-slate-800">
              Olá, {user.name}
            </p>
            <p className="truncate text-xs text-slate-500">{roleLabel(user.role)}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700"
          >
            <IconLogout className="h-4 w-4 shrink-0 text-red-600/90" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
