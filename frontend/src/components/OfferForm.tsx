import { useMemo, useState, type FormEvent } from 'react';
import axios from 'axios';
import { offersApi } from '../api/offers';
import type { Offer } from '../types';

interface Props {
  onCreated: (offer: Offer) => void;
}

const EXPIRY_PRESETS = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '3 dias', hours: 72 },
  { label: '7 dias', hours: 168 },
];

function toLocalInputValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function humanizeRemaining(iso: string): string | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return null;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `expira em ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `expira em ${hours}h`;
  const days = Math.floor(hours / 24);
  return `expira em ${days} dia${days > 1 ? 's' : ''}`;
}

export function OfferForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState(10);
  const [stock, setStock] = useState(10);
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const minExpiry = useMemo(() => toLocalInputValue(new Date()), []);
  const remaining = humanizeRemaining(expiresAt);

  function setPreset(hours: number) {
    setExpiresAt(toLocalInputValue(new Date(Date.now() + hours * 3600_000)));
  }

  function bumpStock(delta: number) {
    setStock((s) => Math.max(1, s + delta));
  }

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

      <div>
        <div className="flex items-center justify-between">
          <label className="label">Desconto</label>
          <span className="text-sm font-semibold text-indigo-600">
            {discount}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          className="mt-2 w-full accent-indigo-600"
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div>
        <label className="label">Estoque</label>
        <div className="mt-1 flex items-stretch">
          <button
            type="button"
            onClick={() => bumpStock(-1)}
            aria-label="Diminuir estoque"
            className="flex h-11 w-11 items-center justify-center rounded-l-lg border border-r-0 border-slate-200 bg-white text-lg font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            −
          </button>
          <input
            type="number"
            required
            min={1}
            value={stock}
            onChange={(e) => setStock(Math.max(1, Number(e.target.value) || 1))}
            className="h-11 w-full border border-slate-200 bg-white text-center text-base font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            onClick={() => bumpStock(1)}
            aria-label="Aumentar estoque"
            className="flex h-11 w-11 items-center justify-center rounded-r-lg border border-l-0 border-slate-200 bg-white text-lg font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label">Validade</label>
          {remaining && (
            <span className="text-xs font-medium text-indigo-600">
              {remaining}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EXPIRY_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(p.hours)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              +{p.label}
            </button>
          ))}
        </div>
        <input
          type="datetime-local"
          required
          min={minExpiry}
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="input mt-2"
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
