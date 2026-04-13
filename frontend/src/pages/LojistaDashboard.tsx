import { useCallback, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { OfferCard } from '../components/OfferCard';
import { OfferForm } from '../components/OfferForm';
import { offersApi } from '../api/offers';
import { useAuth } from '../auth/AuthContext';
import type { Offer } from '../types';

const PAGE_SIZE = 6;

export function LojistaDashboard() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Offer | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await offersApi.findAll({
        ownerId: user.id,
        page,
        limit: PAGE_SIZE,
      });
      setOffers(res.items);
      setHasNext(res.hasNext);
    } catch {
      setError('Falha ao carregar ofertas');
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleClose(id: string) {
    try {
      const updated = await offersApi.close(id);
      setOffers((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch {
      setError('Falha ao encerrar oferta');
    }
  }

  function handleCreated() {
    if (page === 1) {
      void load();
    } else {
      setPage(1);
    }
  }

  function handleUpdated(offer: Offer) {
    setOffers((prev) => prev.map((o) => (o._id === offer._id ? offer : o)));
    setEditing(null);
  }

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">Minhas ofertas</h1>
            <p className="mt-1 text-sm text-slate-600">
              Gerencie suas ofertas e acompanhe os interessados
            </p>
          </div>

          {loading && <p className="text-slate-600">Carregando...</p>}
          {error && (
            <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </p>
          )}

          {!loading && offers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
              <p className="text-sm text-slate-600">
                Voce ainda nao publicou nenhuma oferta.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use o formulario ao lado para criar a primeira.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {offers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                action={
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(offer)}
                      className="flex-1 rounded-lg border border-brand-200 bg-brand-50 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                    >
                      Editar
                    </button>
                    {offer.status === 'active' && (
                      <button
                        onClick={() => handleClose(offer._id)}
                        className="flex-1 rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Encerrar
                      </button>
                    )}
                  </div>
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
        </section>

        <aside>
          <OfferForm
            onCreated={handleCreated}
            editing={editing}
            onUpdated={handleUpdated}
            onCancelEdit={() => setEditing(null)}
          />
        </aside>
      </div>
    </Layout>
  );
}
