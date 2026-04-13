import { useCallback, useEffect, useRef, useState } from 'react';
import type { NewOfferEvent } from '../types';

const AUTO_DISMISS_MS = 8000;

interface Props {
  offer: NewOfferEvent;
  onClose: () => void;
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export function NewOfferToast({ offer, onClose }: Props) {
  const [exiting, setExiting] = useState(false);
  const dismissedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setExiting(true);
    window.setTimeout(() => onCloseRef.current(), 320);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [dismiss]);

  const expires = new Date(offer.expiresAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="pointer-events-none fixed right-4 top-[4.25rem] z-50 w-[min(100vw-2rem,22.5rem)] md:top-20">
      <div
        className={`pointer-events-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover ring-1 ring-black/5 ${
          exiting ? 'animate-toast-out' : 'animate-toast-in'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex min-w-0">
          <div
            className="w-1 shrink-0 bg-gradient-to-b from-brand-500 to-brand-700"
            aria-hidden
          />
          <div className="relative min-w-0 flex-1">
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fechar notificação"
              className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <IconClose className="h-5 w-5" />
            </button>

            <div className="p-4 pr-12">
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-800 ring-1 ring-brand-200">
                Nova oferta
              </span>
              <h3 className="mt-2 text-base font-bold leading-snug tracking-tight text-slate-900">
                {offer.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                {offer.description}
              </p>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Desconto
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-brand-700">{offer.discount}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Estoque
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {offer.stock} unid.
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Expira
                  </p>
                  <p className="mt-0.5 text-sm font-semibold capitalize text-slate-800">
                    {expires}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-1 bg-slate-100">
              <div
                className="h-full origin-left bg-gradient-to-r from-brand-500 to-brand-600"
                style={{
                  animation: `toast-progress ${AUTO_DISMISS_MS}ms linear forwards`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
