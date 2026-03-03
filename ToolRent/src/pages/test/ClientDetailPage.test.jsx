import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ClientDetailsPage from '../ClientDetailPage';

// Mock dependencies
vi.mock('../../services/ClientService');
vi.mock('../../services/RentalService');
vi.mock('../../components/RentalHistoryTable', () => ({
  default: ({ rentals }) => <div data-testid="rental-table">{rentals?.length || 0} rentals</div>
}));
vi.mock('../../components/NewClientModal', () => ({
  default: ({ isOpen, onClose, onSave }) => isOpen ? (
    <div data-testid="edit-modal">
      <button onClick={() => onSave({ rut: '123', clientName: 'Test' })}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
}));
vi.mock('../../components/NewRentalModal', () => ({
  default: ({ isOpen, onClose, onSave }) => isOpen ? (
    <div data-testid="rental-modal">
      <button onClick={() => onSave({ toolId: 1 })}>Create</button>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
}));
vi.mock('../../components/PageLayout', () => ({
  default: ({ children }) => <div data-testid="page-layout">{children}</div>
}));
vi.mock('../../tutorials/tutorialContent', () => ({
  tutorialContent: { clientDetail: {} }
}));

// Import mocked modules
import ClientService from '../../services/ClientService';
import RentalService from '../../services/RentalService';

// Mock data
const mockClient = {
  idClient: 1,
  clientName: 'Juan García',
  rut: '12345678-9',
  clientStatus: true,
  amountClient: 50000,
  phone: '912345678',
  mail: 'juan@example.com'
};

const mockRentals = [
  {
    idRental: 1,
    rentalStatus: 0,
    toolName: 'Taladro',
    rentalStartDate: '2024-01-15'
  },
  {
    idRental: 2,
    rentalStatus: 1,
    toolName: 'Martillo',
    rentalStartDate: '2024-01-10'
  }
];

// Helper to render with router
const renderWithRouter = (initialRoute = '/cliente/12345678-9') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/cliente/:rut" element={<ClientDetailsPage />} />
        <Route path="/clientes" element={<div>Clientes Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// Mock window.alert
global.alert = vi.fn();
global.confirm = vi.fn(() => true);

describe('ClientDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert.mockClear();
    global.confirm.mockClear();
  });

  describe('Loading and Rendering States', () => {
    it('should show loading state initially', () => {
      ClientService.getByRut.mockImplementation(() => new Promise(() => {}));
      renderWithRouter();
      
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should show not found message when client is null', async () => {
      ClientService.getByRut.mockResolvedValue({ data: null });
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('Cliente no encontrado.')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should render client details successfully', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('Juan García')).toBeInTheDocument();
        expect(screen.getByText('12345678-9')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display client status badge as ACTIVO when clientStatus is true', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('ACTIVO')).toBeInTheDocument();
      });
    });

    it('should display client status badge as BLOQUEADO when clientStatus is false', async () => {
      const blockedClient = { ...mockClient, clientStatus: false };
      ClientService.getByRut.mockResolvedValue({ data: blockedClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('BLOQUEADO')).toBeInTheDocument();
      });
    });

    it('should display page layout wrapper', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByTestId('page-layout')).toBeInTheDocument();
      });
    });
  });

  describe('Client Information Display', () => {
    beforeEach(() => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
    });

    it('should display all client personal data fields', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('Juan García')).toBeInTheDocument();
        expect(screen.getByText('12345678-9')).toBeInTheDocument();
        expect(screen.getByText('912345678')).toBeInTheDocument();
        expect(screen.getByText('juan@example.com')).toBeInTheDocument();
      });
    });

    it('should display debt amount', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('$50000')).toBeInTheDocument();
      });
    });

    it('should display dash for missing phone', async () => {
      const clientNoPhone = { ...mockClient, phone: null };
      ClientService.getByRut.mockResolvedValue({ data: clientNoPhone });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getAllByText('-')[0]).toBeInTheDocument();
      });
    });

    it('should display rental history table', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByTestId('rental-table')).toBeInTheDocument();
      });
    });
  });

  describe('Payment Functionality', () => {
    beforeEach(() => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
    });

    it('should show payment input when client has debt', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const paymentInput = screen.getByPlaceholderText('Monto');
        expect(paymentInput).toBeInTheDocument();
      });
    });

    it('should not show payment input when client has no debt', async () => {
      const debtFreeClient = { ...mockClient, amountClient: 0 };
      ClientService.getByRut.mockResolvedValue({ data: debtFreeClient });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Monto')).not.toBeInTheDocument();
      });
    });

    it('should validate payment amount is positive', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const paymentInput = screen.getByPlaceholderText('Monto');
        const payButton = screen.getByRole('button', { name: /Pagar/i });
        
        fireEvent.change(paymentInput, { target: { value: '-100' } });
        fireEvent.click(payButton);
        
        expect(global.alert).toHaveBeenCalledWith('Ingresa un monto válido.');
      });
    });

    it('should validate payment amount does not exceed debt', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const paymentInput = screen.getByPlaceholderText('Monto');
        const payButton = screen.getByRole('button', { name: /Pagar/i });
        
        fireEvent.change(paymentInput, { target: { value: '100000' } });
        fireEvent.click(payButton);
        
        expect(global.alert).toHaveBeenCalledWith('No puedes pagar más de lo que debe.');
      });
    });

    it('should request confirmation before processing payment', async () => {
      ClientService.payDebt.mockResolvedValue({ data: { ...mockClient, amountClient: 0 } });
      
      renderWithRouter();
      
      await waitFor(() => {
        const paymentInput = screen.getByPlaceholderText('Monto');
        const payButton = screen.getByRole('button', { name: /Pagar/i });
        
        fireEvent.change(paymentInput, { target: { value: '50000' } });
        fireEvent.click(payButton);
      });
      
      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith('¿Confirmar pago de $50000?');
      });
    });

    it('should process payment when confirmed', async () => {
      ClientService.payDebt.mockResolvedValue({ data: { ...mockClient, amountClient: 0 } });
      global.confirm.mockReturnValue(true);
      
      renderWithRouter();
      
      await waitFor(() => {
        const paymentInput = screen.getByPlaceholderText('Monto');
        const payButton = screen.getByRole('button', { name: /Pagar/i });
        
        fireEvent.change(paymentInput, { target: { value: '50000' } });
        fireEvent.click(payButton);
      });
      
      await waitFor(() => {
        expect(ClientService.payDebt).toHaveBeenCalledWith('12345678-9', 50000);
      });
    });

    it('should cancel payment when not confirmed', async () => {
      global.confirm.mockReturnValue(false);
      
      renderWithRouter();
      
      await waitFor(() => {
        const paymentInput = screen.getByPlaceholderText('Monto');
        const payButton = screen.getByRole('button', { name: /Pagar/i });
        
        fireEvent.change(paymentInput, { target: { value: '50000' } });
        fireEvent.click(payButton);
      });
      
      await waitFor(() => {
        expect(ClientService.payDebt).not.toHaveBeenCalled();
      });
    });

    it('should clear payment input after successful payment', async () => {
      vi.clearAllMocks();
      const cleanRentals = [{ ...mockRentals[0], rentalStatus: 0 }];
      const cleanClient = { ...mockClient, amountClient: 50000 };
      ClientService.getByRut.mockResolvedValue({ data: cleanClient });
      RentalService.getByClientId.mockResolvedValue({ data: cleanRentals });
      ClientService.payDebt.mockResolvedValue({ data: { ...cleanClient, amountClient: 0 } });
      global.alert.mockClear();
      global.confirm.mockReturnValue(true);
      
      renderWithRouter();
      
      await waitFor(() => {
        const paymentInput = screen.getByPlaceholderText('Monto');
        fireEvent.change(paymentInput, { target: { value: '50000' } });
      });
      
      const payButton = screen.getByRole('button', { name: /Pagar/i });
      fireEvent.click(payButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Pago realizado exitosamente. Estado actualizado.');
      });
    });

    it('should handle payment error', async () => {
      vi.clearAllMocks();
      const cleanRentals = [{ ...mockRentals[0], rentalStatus: 0 }];
      const cleanClient = { ...mockClient, amountClient: 50000 };
      ClientService.getByRut.mockResolvedValue({ data: cleanClient });
      RentalService.getByClientId.mockResolvedValue({ data: cleanRentals });
      ClientService.payDebt.mockRejectedValue(new Error('Payment failed'));
      global.alert.mockClear();
      global.confirm.mockReturnValue(true);
      
      renderWithRouter();
      
      await waitFor(() => {
        const paymentInput = screen.getByPlaceholderText('Monto');
        const payButton = screen.getByRole('button', { name: /Pagar/i });
        
        fireEvent.change(paymentInput, { target: { value: '10000' } });
        fireEvent.click(payButton);
      });
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Error al procesar el pago.');
      });
    });
  });

  describe('Rental History and Filtering', () => {
    beforeEach(() => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
    });

    it('should display all rentals by default', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByTestId('rental-table')).toHaveTextContent('2 rentals');
      });
    });

    it('should filter rentals by status', async () => {
      RentalService.getByClientId.mockResolvedValue({ data: [mockRentals[0]] });
      
      renderWithRouter();
      
      await waitFor(() => {
        const filterSelect = screen.getByDisplayValue('Todos');
        fireEvent.change(filterSelect, { target: { value: '0' } });
      });
      
      await waitFor(() => {
        expect(RentalService.getByClientId).toHaveBeenCalledWith(1, '0');
      });
    });

    it('should handle empty rentals list', async () => {
      RentalService.getByClientId.mockResolvedValue({ data: [] });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByTestId('rental-table')).toHaveTextContent('0 rentals');
      });
    });
  });

  describe('Edit Client Modal', () => {
    beforeEach(() => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
    });

    it('should open edit modal when clicking edit button', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /Editar Info/i });
        fireEvent.click(editButton);
      });
      
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
    });

    it('should save client changes', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /Editar Info/i });
        fireEvent.click(editButton);
      });
      
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Cliente actualizado.');
      });
    });

    it('should close modal after successful save', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /Editar Info/i });
        fireEvent.click(editButton);
      });
      
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
      });
    });

    it('should handle edit error', async () => {
      ClientService.update.mockRejectedValue(new Error('Update failed'));
      
      renderWithRouter();
      
      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /Editar Info/i });
        fireEvent.click(editButton);
      });
      
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Error al actualizar.');
      });
    });
  });

  describe('New Rental Modal', () => {
    beforeEach(() => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
    });

    it('should open new rental modal when clicking new rental button', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const newRentalButton = screen.getByRole('button', { name: /Nuevo Arriendo/i });
        fireEvent.click(newRentalButton);
      });
      
      expect(screen.getByTestId('rental-modal')).toBeInTheDocument();
    });

    it('should disable new rental button when client is blocked', async () => {
      const blockedClient = { ...mockClient, clientStatus: false };
      ClientService.getByRut.mockResolvedValue({ data: blockedClient });
      
      renderWithRouter();
      
      await waitFor(() => {
        const newRentalButton = screen.getByRole('button', { name: /Nuevo Arriendo/i });
        expect(newRentalButton).toBeDisabled();
      });
    });

    it('should create new rental successfully', async () => {
      RentalService.create.mockResolvedValue({ data: { idRental: 3 } });
      
      renderWithRouter();
      
      await waitFor(() => {
        const newRentalButton = screen.getByRole('button', { name: /Nuevo Arriendo/i });
        fireEvent.click(newRentalButton);
      });
      
      const createButton = screen.getByRole('button', { name: /Create/i });
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(RentalService.create).toHaveBeenCalled();
      });
    });

    it('should show success alert after creating rental', async () => {
      RentalService.create.mockResolvedValue({ data: { idRental: 3 } });
      
      renderWithRouter();
      
      await waitFor(() => {
        const newRentalButton = screen.getByRole('button', { name: /Nuevo Arriendo/i });
        fireEvent.click(newRentalButton);
      });
      
      const createButton = screen.getByRole('button', { name: /Create/i });
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('¡Arriendo creado!');
      });
    });

    it('should handle rental creation error', async () => {
      RentalService.create.mockRejectedValue({
        response: { data: { error: 'Tool not available' } }
      });
      
      renderWithRouter();
      
      await waitFor(() => {
        const newRentalButton = screen.getByRole('button', { name: /Nuevo Arriendo/i });
        fireEvent.click(newRentalButton);
      });
      
      const createButton = screen.getByRole('button', { name: /Create/i });
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Error: Tool not available');
      });
    });
  });

  describe('Validation Alerts', () => {
    it('should show alert for overdue rentals', async () => {
      const rentalsWithOverdue = [
        { ...mockRentals[0], rentalStatus: 1 }
      ];
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: rentalsWithOverdue });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('cliente tiene prestamos ATRASADOS')
        );
      });
    });

    it('should show alert for client debt', async () => {
      ClientService.getByRut.mockResolvedValue({ 
        data: { ...mockClient, amountClient: 100000 } 
      });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('cliente tiene una DEUDA')
        );
      });
    });

    it('should show alert for max active rentals', async () => {
      const maxRentals = Array(5).fill(null).map((_, i) => ({
        idRental: i + 1,
        rentalStatus: 0,
        toolName: `Tool ${i + 1}`,
        rentalStartDate: '2024-01-15'
      }));
      
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: maxRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('LIMITE ALCANZADO')
        );
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
    });

    it('should have back button to navigate to clients page', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /Volver a Clientes/i });
        expect(backButton).toBeInTheDocument();
      });
    });

    it('should navigate to clients page when clicking back button', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /Volver a Clientes/i });
        fireEvent.click(backButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Clientes Page')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should fetch client data on component mount', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(ClientService.getByRut).toHaveBeenCalledWith('12345678-9');
      });
    });

    it('should fetch rental data after client is loaded', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(RentalService.getByClientId).toHaveBeenCalledWith(1, 'all');
      });
    });

    it('should not fetch rentals if client is null', async () => {
      ClientService.getByRut.mockResolvedValue({ data: null });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(RentalService.getByClientId).not.toHaveBeenCalled();
      });
    });

    it('should handle loading error gracefully', async () => {
      ClientService.getByRut.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter();
      
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  describe('Debt and Status Display', () => {
    it('should show debt in red color', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        const debtValue = screen.getByText('$50000');
        expect(debtValue).toHaveClass('text-danger');
      });
    });

    it('should show no debt in green color', async () => {
      const debtFreeClient = { ...mockClient, amountClient: 0 };
      ClientService.getByRut.mockResolvedValue({ data: debtFreeClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        const debtValue = screen.getByText('$0');
        expect(debtValue).toHaveClass('text-success');
      });
    });

    it('should display section title for personal data', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('Datos Personales')).toBeInTheDocument();
      });
    });

    it('should display section title for history', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('Historial')).toBeInTheDocument();
      });
    });
  });

  describe('Filter State Management', () => {
    beforeEach(() => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
    });

    it('should change filter to "En Curso"', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const filterSelect = screen.getByDisplayValue('Todos');
        fireEvent.change(filterSelect, { target: { value: '0' } });
      });
      
      await waitFor(() => {
        expect(RentalService.getByClientId).toHaveBeenCalledWith(1, '0');
      });
    });

    it('should change filter to "Atrasados"', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const filterSelect = screen.getByDisplayValue('Todos');
        fireEvent.change(filterSelect, { target: { value: '1' } });
      });
      
      await waitFor(() => {
        expect(RentalService.getByClientId).toHaveBeenCalledWith(1, '1');
      });
    });

    it('should change filter to "Devueltos"', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const filterSelect = screen.getByDisplayValue('Todos');
        fireEvent.change(filterSelect, { target: { value: '2' } });
      });
      
      await waitFor(() => {
        expect(RentalService.getByClientId).toHaveBeenCalledWith(1, '2');
      });
    });
  });

  describe('Page Title', () => {
    beforeEach(() => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
    });

    it('should display page title "Detalle del Cliente"', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('Detalle del Cliente')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle client with no phone number', async () => {
      const clientNoPhone = { ...mockClient, phone: null };
      ClientService.getByRut.mockResolvedValue({ data: clientNoPhone });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('12345678-9')).toBeInTheDocument();
      });
    });

    it('should handle client with no email', async () => {
      const clientNoEmail = { ...mockClient, mail: null };
      ClientService.getByRut.mockResolvedValue({ data: clientNoEmail });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('12345678-9')).toBeInTheDocument();
      });
    });

    it('should handle zero debt display', async () => {
      const debtFreeClient = { ...mockClient, amountClient: 0 };
      ClientService.getByRut.mockResolvedValue({ data: debtFreeClient });
      RentalService.getByClientId.mockResolvedValue({ data: [] });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('$0')).toBeInTheDocument();
      });
    });

    it('should handle large debt amounts', async () => {
      const largeDebtClient = { ...mockClient, amountClient: 9999999 };
      ClientService.getByRut.mockResolvedValue({ data: largeDebtClient });
      RentalService.getByClientId.mockResolvedValue({ data: mockRentals });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByText('$9999999')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State Display', () => {
    it('should show loading while fetching client data', () => {
      ClientService.getByRut.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter();
      
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should show loading state with empty rentals', async () => {
      ClientService.getByRut.mockResolvedValue({ data: mockClient });
      RentalService.getByClientId.mockResolvedValue({ data: [] });
      
      renderWithRouter();
      
      await waitFor(() => {
        expect(screen.getByTestId('rental-table')).toHaveTextContent('0 rentals');
      });
    });
  });
});
