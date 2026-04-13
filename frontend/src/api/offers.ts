import { api } from './client';
import type { CreateOfferInput, Offer, OfferStatus, PaginatedOffers } from '../types';

export interface OffersQuery {
  page?: number;
  limit?: number;
  status?: OfferStatus;
  ownerId?: string;
}

export const offersApi = {
  findAll: (query: OffersQuery = {}) =>
    api.get<PaginatedOffers>('/offers', { params: query }).then((r) => r.data),

  create: (input: CreateOfferInput) =>
    api.post<Offer>('/offers', input).then((r) => r.data),

  update: (
    id: string,
    input: Partial<CreateOfferInput> & { status?: OfferStatus },
  ) => api.patch<Offer>(`/offers/${id}`, input).then((r) => r.data),

  close: (id: string) =>
    api.patch<Offer>(`/offers/${id}/close`).then((r) => r.data),
};
