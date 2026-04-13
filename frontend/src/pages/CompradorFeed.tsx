import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout';
import { OfferCard } from '../components/OfferCard';
import { NewOfferToast } from '../components/NewOfferToast';
import { offersApi } from '../api/offers';
import { interestsApi } from '../api/interests';
import { useAuth } from '../auth/AuthContext';
import { useNewOfferListener } from '../hooks/useSocket';
import type { NewOfferEvent, Offer, OfferStatus } from '../types';

type StatusFilter = 'all' | OfferStatus;
type SortOrder = 'recent' | 'expiresSoon';

const PAGE_SIZE = 9;

const STATUS_OPTIONS: StatusFilter[] = [
  'active',
  'all',
  'sold_out',
  'inactive',
  'expired',
];

export function CompradorFeed() {
  const { user } = useAuth();
  const canRegisterInterest = user?.role === 'comprador';
  const [offers, setOffers] = useState<Offer[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('active');
  const [toast, setToast] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState<NewOfferEvent | null>(null);
  const [interestingId, setInterestingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = searchQuery.trim();
      setDebouncedQ(next);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await offersApi.findAll({
        page,
        limit: PAGE_SIZE,
        ...(filter !== 'all' ? { status: filter } : {}),
        ...(debouncedQ ? { q: debouncedQ } : {}),
        sort: sortOrder,
      });
      setOffers(res.items);
      setHasNext(res.hasNext);
    } catch {
      setError('Falha ao carregar ofertas');
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, filter, page, sortOrder]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleNewOffer = useCallback(
    (evt: NewOfferEvent) => {
      setNewOffer(evt);
      if ((filter === 'active' || filter === 'all') && page === 1) {
        void load();
      }
    },
    [filter, load, page],
  );

  useNewOfferListener(handleNewOffer);

  function offerAfterUnregister(o: Offer): Offer {
    const stock = o.stock + 1;
    const interestCount = Math.max(0, o.interestCount - 1);
    const stillValid = new Date(o.expiresAt).getTime() > Date.now();
    const status =
      o.status === 'sold_out' && stock > 0 && stillValid ? 'active' : o.status;
    return {
      ...o,
      hasMyInterest: false,
      stock,
      interestCount,
      status,
    };
  }

  async function handleRegisterInterest(offer: Offer) {
    setInterestingId(offer._id);
    setError(null);
    try {
      await interestsApi.register(offer._id);
      setOffers((prev) =>
        prev.map((o) => {
          if (o._id !== offer._id) return o;
          const nextStock = Math.max(0, o.stock - 1);
          return {
            ...o,
            hasMyInterest: true,
            stock: nextStock,
            interestCount: o.interestCount + 1,
            status:
              nextStock === 0 && o.status === 'active' ? 'sold_out' : o.status,
          };
        }),
      );
      setToast('Interesse registrado!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ??
          'Falha ao registrar interesse'
        : 'Falha ao registrar interesse';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setInterestingId(null);
    }
  }

  async function handleUnregisterInterest(offer: Offer) {
    setInterestingId(offer._id);
    setError(null);
    try {
      await interestsApi.unregister(offer._id);
      setOffers((prev) =>
        prev.map((o) => (o._id === offer._id ? offerAfterUnregister(o) : o)),
      );
      setToast('Interesse removido.');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ??
          'Falha ao remover interesse'
        : 'Falha ao remover interesse';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setInterestingId(null);
    }
  }

  const filterLabels: Record<StatusFilter, string> = {
    active: 'Ativas',
    all: 'Todas',
    sold_out: 'Esgotadas',
    inactive: 'Encerradas',
    expired: 'Expiradas',
  };

  const topBar = (
    <label className="relative mx-auto block w-full">
      <span className="sr-only">Buscar ofertas pelo título ou descrição</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar ofertas pelo título ou descrição..."
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );

  return (
    <Layout topBar={topBar}>
      <div className="relative mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Feed de Ofertas
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Gerencie e acompanhe as ofertas ativas no sistema
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterPanelOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-slate-500"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 4.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                />
              </svg>
              Filtrar
            </button>

            {filterPanelOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-20 bg-slate-900/30 md:hidden"
                  aria-label="Fechar filtros"
                  onClick={() => setFilterPanelOpen(false)}
                />
                <div className="fixed inset-x-0 bottom-0 z-30 max-h-[70vh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-4 shadow-2xl md:absolute md:bottom-auto md:left-auto md:right-0 md:top-full md:mt-2 md:max-h-none md:w-72 md:rounded-xl md:p-3 md:shadow-lg">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status da oferta
                  </p>
                  <div className="flex flex-col gap-1">
                    {STATUS_OPTIONS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setFilter(f);
                          setPage(1);
                          setFilterPanelOpen(false);
                        }}
                        className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                          filter === f
                            ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {filterLabels[f]}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative min-w-[11rem] flex-1 sm:flex-initial">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as SortOrder);
                setPage(1);
              }}
              aria-label="Ordenar ofertas"
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="recent">Mais recentes</option>
              <option value="expiresSoon">Expiram primeiro</option>
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {loading && <p className="text-slate-600">Carregando...</p>}
      {error && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}

      {!loading && offers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-600">Nenhuma oferta encontrada.</p>
        </div>
      )}

           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => {
          const showRemove =
            canRegisterInterest && offer.hasMyInterest === true;
          const showRegister =
            canRegisterInterest &&
            !offer.hasMyInterest &&
            offer.status === 'active' &&
            offer.stock > 0;

          return (
            <OfferCard
              key={offer._id}
              offer={offer}
              action={
                showRemove ? (
                  <button
                    type="button"
                    onClick={() => handleUnregisterInterest(offer)}
                    disabled={interestingId === offer._id}
                    className="btn-danger"
                  >
                    {interestingId === offer._id
                      ? 'Removendo...'
                      : 'Remover interesse'}
                  </button>
                ) : showRegister ? (
                  <button
                    type="button"
                    onClick={() => handleRegisterInterest(offer)}
                    disabled={interestingId === offer._id}
                    className="btn-primary"
                  >
                    {interestingId === offer._id
                      ? 'Registrando...'
                      : 'Registrar interesse'}
                  </button>
                ) : null
              }
            />
          );
        })}
      </div>

      {(page > 1 || hasNext) && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-200/80 pt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600">Página {page}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10">
          {toast}
        </div>
      )}

      {newOffer && (
        <NewOfferToast
          key={newOffer.id}
          offer={newOffer}
          onClose={() => setNewOffer(null)}
        />
      )}
    </Layout>
  );
}
