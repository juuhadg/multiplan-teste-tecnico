import type { Offer } from '../types';

interface Props {
  offer: Offer;
  action?: React.ReactNode;
}

const STATUS_LABEL: Record<Offer['status'], string> = {
  active: 'Ativa',
  expired: 'Expirada',
  inactive: 'Encerrada',
};

const STATUS_CLASS: Record<Offer['status'], string> = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-slate-200 text-slate-700',
  inactive: 'bg-red-100 text-red-800',
};

export function OfferCard({ offer, action }: Props) {
  const expires = new Date(offer.expiresAt).toLocaleString('pt-BR');

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{offer.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[offer.status]}`}
        >
          {STATUS_LABEL[offer.status]}
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-600">{offer.description}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-500">Desconto</span>
          <div className="font-semibold text-slate-900">{offer.discount}%</div>
        </div>
        <div>
          <span className="text-slate-500">Estoque</span>
          <div className="font-semibold text-slate-900">{offer.stock}</div>
        </div>
        <div>
          <span className="text-slate-500">Interessados</span>
          <div className="font-semibold text-slate-900">{offer.interestCount}</div>
        </div>
        <div>
          <span className="text-slate-500">Expira em</span>
          <div className="font-medium text-slate-700">{expires}</div>
        </div>
      </div>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
