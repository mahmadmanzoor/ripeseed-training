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
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
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

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('$1000.00')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
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

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
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

    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
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

    expect(screen.getByText('Order History')).toBeInTheDocument();
    expect(screen.getByText('Gift History')).toBeInTheDocument();
  });
});
