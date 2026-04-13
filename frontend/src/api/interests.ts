import { api } from './client';

export const interestsApi = {
  register: (offerId: string) =>
    api.post(`/offers/${offerId}/interests`).then((r) => r.data),

  unregister: (offerId: string) =>
    api.delete(`/offers/${offerId}/interests`).then(() => undefined),
};
