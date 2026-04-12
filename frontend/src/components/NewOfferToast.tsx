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

  const expires = new Date(offer.expiresAt).toLocaleString('pt-BR');

  return (
    <div className="fixed right-4 top-4 z-50 w-[22rem] max-w-[calc(100vw-2rem)] animate-in slide-in-from-top-2">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white">
            Nova oferta
          </span>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-300 hover:text-white"
          >
            x
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold text-slate-900">{offer.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {offer.description}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-800">
              -{offer.discount}%
            </div>
            <div className="text-xs text-slate-600">
              <div>
                Estoque: <span className="font-semibold text-slate-900">{offer.stock}</span>
              </div>
              <div>
                Expira: <span className="font-medium text-slate-700">{expires}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
