import type { Offer } from '../types';
import { getExpiryDisplay } from '../lib/offerExpiry';

interface Props {
  offer: Offer;
  action?: React.ReactNode;
  showStatusBadge?: boolean;
}

const STATUS_LABEL: Record<Offer['status'], string> = {
  active: 'Ativa',
  expired: 'Expirada',
  inactive: 'Encerrada',
  sold_out: 'Esgotada',
};

const STATUS_CLASS: Record<Offer['status'], string> = {
  active: 'bg-brand-50 text-brand-800 ring-1 ring-brand-200',
  expired: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  inactive: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  sold_out: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
};

function StoreIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5 text-brand-700"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21V13.5C13.5 13.0858 13.8358 12.75 14.25 12.75H17.25C17.6642 12.75 18 13.0858 18 13.5V21M13.5 21H2.36088M13.5 21H18M18 21H21.6391M20.25 21V9.34876M3.75 21V9.349M3.75 9.349C4.89729 10.0121 6.38977 9.85293 7.37132 8.87139C7.41594 8.82677 7.45886 8.78109 7.50008 8.73444C8.04979 9.3572 8.85402 9.74998 9.75 9.74998C10.646 9.74998 11.4503 9.35717 12 8.73435C12.5497 9.35717 13.354 9.74998 14.25 9.74998C15.1459 9.74998 15.9501 9.35725 16.4998 8.73456C16.541 8.78114 16.5838 8.82675 16.6284 8.8713C17.61 9.85293 19.1027 10.0121 20.25 9.34876M3.75 9.349C3.52788 9.22062 3.31871 9.06142 3.12868 8.87139C1.95711 7.69982 1.95711 5.80032 3.12868 4.62875L4.31797 3.43946C4.59927 3.15816 4.9808 3.00012 5.37863 3.00012H18.6212C19.019 3.00012 19.4005 3.15816 19.6818 3.43946L20.871 4.62866C22.0426 5.80023 22.0426 7.69973 20.871 8.8713C20.6811 9.06125 20.472 9.2204 20.25 9.34876M6.75 18H10.5C10.9142 18 11.25 17.6642 11.25 17.25V13.5C11.25 13.0858 10.9142 12.75 10.5 12.75H6.75C6.33579 12.75 6 13.0858 6 13.5V17.25C6 17.6642 6.33579 18 6.75 18Z"
      />
    </svg>
  );
}

function MetricIconStock() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4 shrink-0 text-slate-400"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
      />
    </svg>
  );
}

function MetricIconPeople() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4 shrink-0 text-slate-400"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function MetricIconClock() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4 shrink-0 text-slate-400"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function OfferCard({ offer, action, showStatusBadge = false }: Props) {
  const { line: expiryLine, urgencyClass } = getExpiryDisplay(offer.expiresAt);

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-brand-50">
            <StoreIcon />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Oferecido por
            </p>
            <p className="truncate font-bold text-slate-900">
              {offer.ownerName ?? 'Loja'}
            </p>
          </div>
        </div>
        {showStatusBadge && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_CLASS[offer.status]}`}
          >
            {STATUS_LABEL[offer.status]}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight text-slate-900">
        {offer.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {offer.description}
      </p>
      <p className="mt-2 text-sm font-semibold text-brand-700">{offer.discount}% de desconto</p>

      <div className="mt-5 grid grid-cols-2 gap-0 overflow-hidden rounded-xl border border-slate-100 text-xs">
        <div className="flex items-start gap-2 border-b border-r border-slate-100 p-3">
          <MetricIconStock />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Estoque
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {offer.stock} unid.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 border-b border-slate-100 p-3">
          <MetricIconPeople />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Interesse
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {offer.interestCount} pessoa{offer.interestCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="col-span-2 flex items-start gap-2 p-3">
          <MetricIconClock />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Validade
            </p>
            <p className={`mt-0.5 text-sm font-semibold capitalize ${urgencyClass}`}>
              {expiryLine}
            </p>
          </div>
        </div>
      </div>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
