export interface User {
  id: string;
  email: string;
  walletBalance: number;
  isAdmin: boolean;
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

export interface CreditTransferRequest {
  recipientEmail: string;
  amount: number;
  message?: string;
}

export interface CreditTransferResponse {
  message: string;
  transfer: {
    id: string;
    amount: number;
    recipientEmail: string;
    message: string | null;
    createdAt: string;
  };
  sender: {
    id: string;
    email: string;
    walletBalance: number;
    isAdmin: boolean;
  };
  recipient: {
    id: string;
    email: string;
    walletBalance: number;
    isAdmin: boolean;
  };
}

export interface CreditTransferHistoryItem {
  id: string;
  amount: number;
  message: string | null;
  createdAt: string;
  sender?: {
    id: string;
    email: string;
  };
  receiver?: {
    id: string;
    email: string;
  };
}

export interface CreditTransferHistoryResponse {
  sentTransfers: CreditTransferHistoryItem[];
  receivedTransfers: CreditTransferHistoryItem[];
  total: {
    sent: number;
    received: number;
  };
}

// Admin Dashboard Types
export interface AdminUser {
  id: string;
  email: string;
  walletBalance: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    sentGifts: number;
    receivedGifts: number;
    sentCreditTransfers: number;
    receivedCreditTransfers: number;
  };
}

export interface AdminOrder {
  id: string;
  userId: string;
  productId: number;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

export interface AdminGift {
  id: string;
  senderId: string;
  receiverId: string;
  productId: number;
  quantity: number;
  totalAmount: number;
  message: string | null;
  createdAt: string;
  sender: {
    id: string;
    email: string;
  };
  receiver: {
    id: string;
    email: string;
  };
}

export interface AdminCreditTransfer {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  message: string | null;
  createdAt: string;
  sender: {
    id: string;
    email: string;
  };
  receiver: {
    id: string;
    email: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalGifts: number;
  totalCreditTransfers: number;
  totalRevenue: number;
  adminUsers: number;
  regularUsers: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
}

export interface AdminGiftsResponse {
  gifts: AdminGift[];
}

export interface AdminCreditTransfersResponse {
  creditTransfers: AdminCreditTransfer[];
}

export interface AdminStatsResponse {
  stats: AdminStats;
}
