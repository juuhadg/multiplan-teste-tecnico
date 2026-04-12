import { api } from './client';
import type { AuthResponse, Role } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api
      .post<AuthResponse>('/auth/login', { email, password })
      .then((r) => r.data),

  register: (name: string, email: string, password: string, role: Role) =>
    api
      .post<AuthResponse>('/auth/register', { name, email, password, role })
      .then((r) => r.data),
};
