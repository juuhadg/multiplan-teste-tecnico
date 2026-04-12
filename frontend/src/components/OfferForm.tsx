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
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Nova oferta</h2>

      <div>
        <label className="block text-sm font-medium">Titulo</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descricao</label>
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Desconto (%)</label>
          <input
            type="number"
            required
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Estoque</label>
          <input
            type="number"
            required
            min={1}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Validade</label>
        <input
          type="datetime-local"
          required
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-slate-900 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Publicar oferta'}
      </button>
    </form>
  );
}
