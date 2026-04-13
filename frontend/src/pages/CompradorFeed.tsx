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

const PAGE_SIZE = 9;

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await offersApi.findAll({
        page,
        limit: PAGE_SIZE,
        ...(filter !== 'all' ? { status: filter } : {}),
      });
      setOffers(res.items);
      setHasNext(res.hasNext);
    } catch {
      setError('Falha ao carregar ofertas');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

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

  async function handleInterest(offer: Offer) {
    setInterestingId(offer._id);
    setError(null);
    try {
      await interestsApi.register(offer._id);
      setOffers((prev) =>
        prev.map((o) =>
          o._id === offer._id
            ? {
                ...o,
                stock: Math.max(0, o.stock - 1),
                interestCount: o.interestCount + 1,
              }
            : o,
        ),
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

  const filterLabels: Record<StatusFilter, string> = {
    active: 'Ativas',
    all: 'Todas',
    sold_out: 'Esgotadas',
    inactive: 'Encerradas',
    expired: 'Expiradas',
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feed de ofertas</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ofertas em tempo real dos lojistas
          </p>
        </div>
        <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-sm">
          {(['active', 'all', 'sold_out', 'inactive', 'expired'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                filter === f
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-slate-600">Carregando...</p>}
      {error && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}

      {!loading && offers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
          <p className="text-sm text-slate-600">Nenhuma oferta encontrada.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <OfferCard
            key={offer._id}
            offer={offer}
            action={
              canRegisterInterest && offer.status === 'active' && offer.stock > 0 ? (
                <button
                  onClick={() => handleInterest(offer)}
                  disabled={interestingId === offer._id}
                  className="btn-primary"
                >
                  {interestingId === offer._id ? 'Registrando...' : 'Tenho interesse'}
                </button>
              ) : null
            }
          />
        ))}
      </div>

      {(page > 1 || hasNext) && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600">Pagina {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proxima
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10">
          {toast}
        </div>
      )}

      {newOffer && (
        <NewOfferToast offer={newOffer} onClose={() => setNewOffer(null)} />
      )}
    </Layout>
  );
}
