/** User role enum */
export type UserRole = 'user' | 'photographer' | 'admin';

/** Authenticated user */
export interface User {
  username: string;
  role: UserRole;
}

/** Event from backend */
export interface EventData {
  eventId: string;
  name: string;
  date: string;
  location: string;
  price: number;
  status: 'active' | 'processing' | 'inactive';
  createdAt: string;
  foundCount: number;
  matchScore: number;
  photos?: PhotoData[];
}

/** Photo from backend */
export interface PhotoData {
  id: string;
  eventId: string;
  url: string;
  price: number;
  watermark: boolean;
  faceEmbeddings?: number[][];
  createdAt: string;
}

/** Gallery photo (frontend enriched) */
export interface GalleryPhoto {
  id: string;
  url: string;
  price: number;
  watermark: boolean;
  purchased: boolean;
  similarity?: number;
}

/** Face match result from search */
export interface FaceMatch {
  photoId: string;
  similarity: number;
  url: string;
}

/** Search result from backend */
export interface SearchResult {
  matchedFaces: number;
  matches: FaceMatch[];
}

/** Transaction data */
export interface Transaction {
  id: string;
  code: string;
  user: string;
  desc: string;
  amount: string;
  method: string;
  time: string;
  status: 'pending' | 'success' | 'rejected';
}

/** Withdrawal request */
export interface Withdrawal {
  id: string;
  code: string;
  name: string;
  bank: string;
  amount: string;
  initial: string;
  time: string;
  status: 'pending' | 'success' | 'rejected';
}

/** Create event request */
export interface CreateEventRequest {
  name: string;
  date: string;
  location: string;
  price: number;
}

/** API base URL — use env variable in production */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
