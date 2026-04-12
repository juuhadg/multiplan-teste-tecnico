export type Role = 'lojista' | 'comprador';

export type OfferStatus = 'active' | 'expired' | 'inactive';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: number;
  stock: number;
  expiresAt: string;
  status: OfferStatus;
  ownerId: string;
  interestCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferInput {
  title: string;
  description: string;
  discount: number;
  stock: number;
  expiresAt: string;
}

export interface NewOfferEvent {
  id: string;
  title: string;
  description: string;
  discount: number;
  stock: number;
  expiresAt: string;
}
