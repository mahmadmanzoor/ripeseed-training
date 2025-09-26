import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

// Mock the useAuthContext hook
const mockUseAuthContext = vi.fn();
const mockTransferCredits = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render homepage with wallet balance for authenticated user', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        walletBalance: 1000,
        isAdmin: false,
      },
      logout: vi.fn(),
      transferCredits: mockTransferCredits,
    });

    renderWithRouter(<HomePage />);

    expect(screen.getByText('🛍️ Browse Products')).toBeInTheDocument();
    expect(screen.getByText('Transfer Credits')).toBeInTheDocument();
    expect(screen.getByText('Add Credits')).toBeInTheDocument();
    expect(screen.getByText('📦 Order History')).toBeInTheDocument();
    expect(screen.getByText('🎁 Gift History')).toBeInTheDocument();
  });

  it('should show login/register options for unauthenticated users', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      transferCredits: mockTransferCredits,
    });

    renderWithRouter(<HomePage />);

    expect(screen.getByText('Welcome to Mini Store')).toBeInTheDocument();
    expect(screen.getAllByText('Sign In')).toHaveLength(2); // Navbar + HomePage
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('should open credit transfer modal when transfer credits is clicked', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        walletBalance: 1000,
        isAdmin: false,
      },
      logout: vi.fn(),
      transferCredits: mockTransferCredits,
    });

    renderWithRouter(<HomePage />);

    const transferCreditsButton = screen.getByText('Transfer Credits');
    fireEvent.click(transferCreditsButton);

    expect(screen.getAllByText('💸 Transfer Credits')).toHaveLength(2); // HomePage + Modal
  });

  it('should open payment modal when add credits is clicked', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        walletBalance: 1000,
        isAdmin: false,
      },
      logout: vi.fn(),
      transferCredits: mockTransferCredits,
    });

    renderWithRouter(<HomePage />);

    const addCreditsButton = screen.getByText('Add Credits');
    fireEvent.click(addCreditsButton);

    expect(screen.getByText('Add Credits to Wallet')).toBeInTheDocument();
  });

  it('should show success message after successful credit transfer', async () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        walletBalance: 1000,
        isAdmin: false,
      },
      logout: vi.fn(),
      transferCredits: mockTransferCredits,
    });

    mockTransferCredits.mockResolvedValue({ success: true });

    renderWithRouter(<HomePage />);

    const transferCreditsButton = screen.getByText('Transfer Credits');
    fireEvent.click(transferCreditsButton);

    // Fill in the transfer form
    const emailInput = screen.getByPlaceholderText("Enter recipient's email address");
    const amountInput = screen.getByPlaceholderText('0.00');
    const messageInput = screen.getByPlaceholderText('Add a personal message...');

    fireEvent.change(emailInput, { target: { value: 'recipient@example.com' } });
    fireEvent.change(amountInput, { target: { value: '50' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const sendButton = screen.getByRole('button', { name: /💸 Transfer \$50\.00/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockTransferCredits).toHaveBeenCalledWith(
        'recipient@example.com',
        50,
        'Test message'
      );
    });
  });
});
