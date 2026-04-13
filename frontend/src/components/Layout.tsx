import { useState, type ReactNode } from 'react';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';

interface LayoutProps {
  children: ReactNode;
  topBar?: ReactNode;
}

export function Layout({ children, topBar }: LayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  return (
    <div className="min-h-screen">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          aria-label="Fechar menu"
          onClick={closeMobileNav}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[288px] max-w-[85vw] min-h-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out md:max-w-none ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar onNavigate={closeMobileNav} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col bg-slate-50 md:ml-[288px]">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} center={topBar} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
