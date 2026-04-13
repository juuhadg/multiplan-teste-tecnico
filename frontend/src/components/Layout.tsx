import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              to={user?.role === 'lojista' ? '/dashboard' : '/feed'}
              className="flex items-center gap-2 text-base font-bold tracking-tight"
            >
              <img src="/multiplan.png" alt="Multiplan" className="h-8 w-8 rounded-lg object-contain" />
              <span>Multiplan Ofertas</span>
            </Link>
            {user?.role === 'lojista' && (
              <nav className="flex items-center gap-1">
                <NavLink to="/dashboard" className={navLinkClass}>
                  Minhas ofertas
                </NavLink>
                <NavLink to="/feed" className={navLinkClass}>
                  Feed
                </NavLink>
              </nav>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-3 text-sm">
              <div className="hidden text-right sm:block">
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-xs capitalize text-brand-600">
                  {user.role}
                </div>
              </div>
              <button onClick={handleLogout} className="btn-ghost">
                Sair
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
