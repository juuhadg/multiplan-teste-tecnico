import { useCallback, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { OfferCard } from '../components/OfferCard';
import { OfferForm } from '../components/OfferForm';
import { offersApi } from '../api/offers';
import { useAuth } from '../auth/AuthContext';
import type { Offer } from '../types';

export function LojistaDashboard() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await offersApi.findAll({ ownerId: user.id, limit: 50 });
      setOffers(data);
    } catch {
      setError('Falha ao carregar ofertas');
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  function handleCreated(offer: Offer) {
    setOffers((prev) => [offer, ...prev]);
  }

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section>
          <h1 className="mb-4 text-2xl font-semibold">Minhas ofertas</h1>

          {loading && <p className="text-slate-600">Carregando...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && offers.length === 0 && (
            <p className="text-slate-600">
              Voce ainda nao publicou nenhuma oferta.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {offers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                action={
                  offer.status === 'active' ? (
                    <button
                      onClick={() => handleClose(offer._id)}
                      className="w-full rounded border border-red-300 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Encerrar
                    </button>
                  ) : null
                }
              />
            ))}
          </div>
        </section>

        <aside>
          <OfferForm onCreated={handleCreated} />
        </aside>
      </div>
    </Layout>
  );
}
