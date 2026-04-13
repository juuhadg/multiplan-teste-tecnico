import { useCallback, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { OfferCard } from '../components/OfferCard';
import { OfferFormModal } from '../components/OfferFormModal';
import { offersApi } from '../api/offers';
import { useAuth } from '../auth/AuthContext';
import type { Offer } from '../types';

const PAGE_SIZE = 9;

export function LojistaDashboard() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

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
  }

  return (
    <Layout>
      <section>
        <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Minhas ofertas
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Gerencie suas ofertas e acompanhe os interessados
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            Nova oferta
          </button>
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
              Clique em Nova oferta para publicar a primeira.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              showStatusBadge
              action={
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(offer);
                      setFormOpen(true);
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    Editar
                  </button>
                  {offer.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleClose(offer._id)}
                      className="inline-flex flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
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
      </section>

      <OfferFormModal
        open={formOpen}
        onClose={closeForm}
        editing={editing}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />
    </Layout>
  );
}
