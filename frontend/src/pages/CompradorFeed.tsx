import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout';
import { OfferCard } from '../components/OfferCard';
import { NewOfferToast } from '../components/NewOfferToast';
import { offersApi } from '../api/offers';
import { interestsApi } from '../api/interests';
import { useNewOfferListener } from '../hooks/useSocket';
import type { NewOfferEvent, Offer, OfferStatus } from '../types';

type StatusFilter = 'all' | OfferStatus;

export function CompradorFeed() {
  const [offers, setOffers] = useState<Offer[]>([]);
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
      const data = await offersApi.findAll({
        limit: 50,
        ...(filter !== 'all' ? { status: filter } : {}),
      });
      setOffers(data);
    } catch {
      setError('Falha ao carregar ofertas');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleNewOffer = useCallback(
    (evt: NewOfferEvent) => {
      setNewOffer(evt);
      if (filter === 'active' || filter === 'all') {
        void load();
      }
    },
    [filter, load],
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

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Feed de ofertas</h1>
        <div className="flex gap-1 rounded border border-slate-300 bg-white p-1 text-sm">
          {(['active', 'all', 'inactive', 'expired'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1 capitalize ${
                filter === f ? 'bg-slate-900 text-white' : 'text-slate-700'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : f === 'inactive' ? 'Encerradas' : 'Expiradas'}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-slate-600">Carregando...</p>}
      {error && <p className="mb-3 text-red-600">{error}</p>}

      {!loading && offers.length === 0 && (
        <p className="text-slate-600">Nenhuma oferta encontrada.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <OfferCard
            key={offer._id}
            offer={offer}
            action={
              offer.status === 'active' && offer.stock > 0 ? (
                <button
                  onClick={() => handleInterest(offer)}
                  disabled={interestingId === offer._id}
                  className="w-full rounded bg-slate-900 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {interestingId === offer._id ? 'Registrando...' : 'Tenho interesse'}
                </button>
              ) : null
            }
          />
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {newOffer && (
        <NewOfferToast offer={newOffer} onClose={() => setNewOffer(null)} />
      )}
    </Layout>
  );
}
