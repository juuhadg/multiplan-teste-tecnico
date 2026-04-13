import type { ReactNode } from 'react';

interface TopBarProps {
  onMenuClick: () => void;
  center?: ReactNode;
}

export function TopBar({ onMenuClick, center }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-slate-200/80 bg-white px-3 sm:px-4">
      <div className="relative flex w-full items-center justify-center">
        <button
          type="button"
          onClick={onMenuClick}
          className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-label="Abrir menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {center ? (
          <div className="w-full max-w-2xl pl-12 pr-3 md:pl-4 md:pr-4">
            {center}
          </div>
        ) : (
          <div className="h-10 w-full max-w-2xl" aria-hidden />
        )}
      </div>
    </header>
  );
}
