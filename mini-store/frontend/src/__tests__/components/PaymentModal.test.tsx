import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentModal from '../../components/PaymentModal';

// Mock the apiClient
vi.mock('../../lib/api', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('PaymentModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render payment modal when open', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Add Credits to Your Wallet')).toBeInTheDocument();
    expect(screen.getByText('Enter the amount you want to add:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <PaymentModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Add Credits to Your Wallet')).not.toBeInTheDocument();
  });

  it('should update amount when input changes', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const amountInput = screen.getByDisplayValue('10');
    fireEvent.change(amountInput, { target: { value: '50' } });

    expect(amountInput).toHaveValue(50);
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should validate amount input', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const amountInput = screen.getByDisplayValue('10');
    fireEvent.change(amountInput, { target: { value: '0' } });

    const submitButton = screen.getByRole('button', { name: /proceed to payment/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show error for invalid amount', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const amountInput = screen.getByDisplayValue('10');
    fireEvent.change(amountInput, { target: { value: '-10' } });

    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
  });
});
