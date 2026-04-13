import { useEffect } from 'react';
import type { NewOfferEvent } from '../types';

interface Props {
  offer: NewOfferEvent;
  onClose: () => void;
}

export function NewOfferToast({ offer, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [offer, onClose]);

  const expires = new Date(offer.expiresAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed right-4 top-20 z-50 w-[22rem] max-w-[calc(100vw-2rem)]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Nova oferta
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-white/70 transition hover:text-white"
          >
            x
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold leading-tight text-slate-900">
            {offer.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {offer.description}
          </p>

          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Desconto</span>
              <span className="font-semibold text-brand-600">
                {offer.discount}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estoque</span>
              <span className="font-semibold text-slate-900">{offer.stock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expira</span>
              <span className="font-medium text-slate-700">{expires}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
