import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => void;
  updateUserWalletBalance: (newBalance: number) => void;
  purchaseProduct: (productId: number, quantity: number) => Promise<any>;
  giftProduct: (productId: number, quantity: number, recipientEmail: string, message?: string) => Promise<any>;
  fetchOrderHistory: () => Promise<any>;
  fetchGiftHistory: () => Promise<any>;
  transferCredits: (recipientEmail: string, amount: number, message?: string) => Promise<any>;
  fetchCreditTransferHistory: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();

  const contextValue: AuthContextType = {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: async (email: string, password: string) => {
      return await auth.login({ email, password });
    },
    register: async (email: string, password: string) => {
      return await auth.register({ email, password });
    },
    logout: auth.logout,
    updateUserWalletBalance: auth.updateUserWalletBalance,
    purchaseProduct: auth.purchaseProduct,
    giftProduct: auth.giftProduct,
    fetchOrderHistory: auth.fetchOrderHistory,
    fetchGiftHistory: auth.fetchGiftHistory,
    transferCredits: async (recipientEmail: string, amount: number, message?: string) => {
      return await auth.transferCredits({ recipientEmail, amount, message });
    },
    fetchCreditTransferHistory: auth.fetchCreditTransferHistory,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
