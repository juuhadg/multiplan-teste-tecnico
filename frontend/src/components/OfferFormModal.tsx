import { useEffect } from 'react';
import { OfferForm } from './OfferForm';
import type { Offer } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  editing: Offer | null;
  onCreated: (offer: Offer) => void;
  onUpdated: (offer: Offer) => void;
}

export function OfferFormModal({
  open,
  onClose,
  editing,
  onCreated,
  onUpdated,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isEdit = !!editing;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-form-modal-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="offer-form-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEdit ? 'Editar oferta' : 'Nova oferta'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isEdit
                ? 'Altere os campos e salve as mudanças'
                : 'Publique e notifique compradores em tempo real'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Fechar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-4">
          <OfferForm
            embedded
            editing={editing}
            onCancelEdit={onClose}
            onCreated={(offer) => {
              onCreated(offer);
              onClose();
            }}
            onUpdated={(offer) => {
              onUpdated(offer);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
