import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'lojista' ? '/dashboard' : '/feed', {
        replace: true,
      });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Falha no login'
        : 'Falha no login';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="mb-8 flex w-full flex-col items-center text-center md:mb-10">
        <img
          src="/multiplan-logo.svg"
          alt="Multiplan"
          className="mb-3 h-10 w-auto md:h-12"
        />
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Multiplan Ofertas
        </h1>
        <p className="mt-1 text-sm text-slate-600 md:text-base">
          Entre para ver ofertas em tempo real
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card md:max-w-md md:space-y-5 md:p-8"
      >
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="label">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-slate-600">
          Nao tem conta?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
