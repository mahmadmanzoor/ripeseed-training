import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

// Mock the useAuthContext hook
const mockUseAuthContext = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

describe('Navbar', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render navbar with logo and navigation links', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByText('Mini Store')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should show user info when authenticated', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        walletBalance: '1000',
        isAdmin: false,
      },
      logout: vi.fn(),
    });

    renderWithRouter(<Navbar />);

    expect(screen.getByText('Welcome back, test@example.com')).toBeInTheDocument();
    expect(screen.getByText('$1000.00')).toBeInTheDocument();
    expect(screen.getAllByText('Logout')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText('🛍️ Products')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText('📦 Orders')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText('🎁 Gifts')).toHaveLength(2); // Desktop + Mobile
  });

  it('should show admin dashboard link for admin users', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'admin@example.com',
        walletBalance: '1000',
        isAdmin: true,
      },
      logout: vi.fn(),
    });

    renderWithRouter(<Navbar />);

    expect(screen.getAllByText('🛡️ Admin Dashboard')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should not show admin dashboard link for regular users', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'user@example.com',
        walletBalance: '1000',
        isAdmin: false,
      },
      logout: vi.fn(),
    });

    renderWithRouter(<Navbar />);

    expect(screen.queryByText('🛡️ Admin Dashboard')).not.toBeInTheDocument();
  });

  it('should show order history and gift history for authenticated users', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        walletBalance: '1000',
        isAdmin: false,
      },
      logout: vi.fn(),
    });

    renderWithRouter(<Navbar />);

    expect(screen.getAllByText('📦 Orders')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText('🎁 Gifts')).toHaveLength(2); // Desktop + Mobile
    expect(screen.getAllByText('💸 Transfer History')).toHaveLength(2); // Desktop + Mobile
  });
});
