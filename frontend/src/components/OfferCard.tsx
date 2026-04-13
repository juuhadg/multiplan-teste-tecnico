import type { Offer } from '../types';

interface Props {
  offer: Offer;
  action?: React.ReactNode;
}

const STATUS_LABEL: Record<Offer['status'], string> = {
  active: 'Ativa',
  expired: 'Expirada',
  inactive: 'Encerrada',
  sold_out: 'Esgotada',
};

const STATUS_CLASS: Record<Offer['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  expired: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  inactive: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  sold_out: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

export function OfferCard({ offer, action }: Props) {
  const expires = new Date(offer.expiresAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-tight text-slate-900">
          {offer.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_CLASS[offer.status]}`}
        >
          {STATUS_LABEL[offer.status]}
        </span>
      </div>

      {offer.ownerName && (
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          por <span className="text-slate-700">{offer.ownerName}</span>
        </p>
      )}

      <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
        {offer.description}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-slate-500">Desconto</div>
          <div className="text-base font-semibold text-brand-600">
            {offer.discount}%
          </div>
        </div>
        <div>
          <div className="text-slate-500">Estoque</div>
          <div className="text-base font-semibold text-slate-900">{offer.stock}</div>
        </div>
        <div>
          <div className="text-slate-500">Interessados</div>
          <div className="text-base font-semibold text-slate-900">
            {offer.interestCount}
          </div>
        </div>
        <div className="col-span-3">
          <div className="text-slate-500">Expira em</div>
          <div className="font-medium text-slate-700">{expires}</div>
        </div>
      </div>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
