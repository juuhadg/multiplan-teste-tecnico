import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            to={user?.role === 'lojista' ? '/dashboard' : '/feed'}
            className="flex items-center gap-2 text-base font-bold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
              M
            </span>
            <span>Multiplan Ofertas</span>
          </Link>
          {user && (
            <div className="flex items-center gap-3 text-sm">
              <div className="hidden text-right sm:block">
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-xs capitalize text-indigo-600">
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
