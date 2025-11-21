export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'draft';
export type Priority = 'normal' | 'urgent';

export interface Seller {
  id: number;
  name: string;
  rating: string;
  totalAds: number;
  registeredAt: string;
}

export interface ModerationHistoryEntry {
  id: number;
  moderatorId: number;
  moderatorName: string;
  action: ModerationStatus | 'requestChanges';
  reason: string | null;
  comment: string | null;
  timestamp: string;
}

export interface Characteristics {
  [key: string]: string;
}

export interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  status: ModerationStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  images: string[];
  seller: Seller;
  characteristics: Characteristics;
  moderationHistory: ModerationHistoryEntry[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AdsResponse {
  ads: Ad[];
  pagination: Pagination;
}

