export interface User {
  id: string;
  email: string;
  walletBalance: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface OrderHistoryItem {
  id: string;
  productId: number;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  product: {
    id: number;
    title: string;
    thumbnail: string;
    brand: string;
    category: string;
    price: number;
    discountPercentage: number;
  } | null;
}

export interface GiftHistoryItem {
  id: string;
  productId: number;
  quantity: number;
  totalAmount: number;
  message: string | null;
  createdAt: string;
  product: {
    id: number;
    title: string;
    thumbnail: string;
    brand: string;
    category: string;
    price: number;
    discountPercentage: number;
  } | null;
  sender?: {
    id: string;
    email: string;
  };
  receiver?: {
    id: string;
    email: string;
  };
}

export interface OrderHistoryResponse {
  orders: OrderHistoryItem[];
  total: number;
}

export interface GiftHistoryResponse {
  sentGifts: GiftHistoryItem[];
  receivedGifts: GiftHistoryItem[];
  total: {
    sent: number;
    received: number;
  };
}
