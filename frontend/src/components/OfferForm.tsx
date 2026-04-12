import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { offersApi } from '../api/offers';
import type { Offer } from '../types';

interface Props {
  onCreated: (offer: Offer) => void;
}

export function OfferForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState(10);
  const [stock, setStock] = useState(10);
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const offer = await offersApi.create({
        title,
        description,
        discount: Number(discount),
        stock: Number(stock),
        expiresAt: new Date(expiresAt).toISOString(),
      });
      onCreated(offer);
      setTitle('');
      setDescription('');
      setDiscount(10);
      setStock(10);
      setExpiresAt('');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Falha ao criar'
        : 'Falha ao criar';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
    >
      <div>
        <h2 className="text-lg font-semibold">Nova oferta</h2>
        <p className="text-xs text-slate-500">
          Publique e notifique compradores em tempo real
        </p>
      </div>

      <div>
        <label className="label">Titulo</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label className="label">Descricao</label>
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Desconto (%)</label>
          <input
            type="number"
            required
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="input"
          />
        </div>
        <div>
          <label className="label">Estoque</label>
          <input
            type="number"
            required
            min={1}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Validade</label>
        <input
          type="datetime-local"
          required
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Salvando...' : 'Publicar oferta'}
      </button>
    </form>
  );
}
