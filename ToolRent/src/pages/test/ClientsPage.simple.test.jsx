import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import ClientsPage from '../ClientsPage';
import ClientService from '../../services/ClientService';

// Mock dependencies - minimal setup
vi.mock('../../services/ClientService');
vi.mock('@react-keycloak/web', () => ({
  useKeycloak: () => ({
    keycloak: { authenticated: true },
    initialized: true
  })
}));
vi.mock('../../tutorials/tutorialContent', () => ({
  tutorialContent: { clientes: { title: 'Tutorial', steps: [] } }
}));
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn()
}));

// Mock components with minimal implementations
vi.mock('../../components/PageLayout', () => ({
  default: ({ children }) => <div>{children}</div>
}));
vi.mock('../../components/SearchBar', () => ({
  default: ({ searchTerm, setSearchTerm }) => (
    <input
      data-testid="search-input"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  )
}));
vi.mock('../../components/AddClientButton', () => ({
  default: ({ onClick }) => (
    <button onClick={onClick} data-testid="add-client-btn">Agregar Cliente</button>
  )
}));
vi.mock('../../components/ClientList', () => ({
  default: ({ clients }) => (
    <div data-testid="client-list">
      {clients.map((c) => (
        <div key={c.idClient} data-testid="client-item">
          {c.nameClient}
        </div>
      ))}
    </div>
  )
}));
vi.mock('../../components/NewClientModal', () => ({
  default: ({ isOpen, onClose, onSave }) => (
    isOpen ? (
      <div data-testid="modal">
        <button onClick={onClose} data-testid="modal-close">Cerrar</button>
        <button onClick={() => onSave({ nameClient: 'Test', rutClient: '12345678' })} data-testid="modal-save">Guardar</button>
      </div>
    ) : null
  )
}));

const mockClients = [
  { idClient: 1, nameClient: 'Juan Pérez', rutClient: '12345678-9', statusClient: true },
  { idClient: 2, nameClient: 'María García', rutClient: '87654321-0', statusClient: true }
];

describe('ClientsPage - Coverage for Uncovered Lines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ClientService.getAll.mockResolvedValue({ data: mockClients });
    ClientService.create.mockResolvedValue({ data: { idClient: 3 } });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  // LINE 103: onClick={() => setIsModalOpen(true)} - Agregar Cliente button
  test('should open modal when Add Client button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalled();
    });

    // Click the "Agregar Cliente" button (line 103)
    const addButton = screen.getByTestId('add-client-btn');
    await user.click(addButton);

    // Modal should be visible
    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();
  });

  // LINE 129: onClose={() => setIsModalOpen(false)} - Modal close
  test('should close modal when onClose is called', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalled();
    });

    // Open modal
    const addButton = screen.getByTestId('add-client-btn');
    await user.click(addButton);

    // Verify modal is open
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close modal via onClose (line 129)
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  // LINE 111: setStatusFilter(e.target.value); fetchClients(searchTerm, e.target.value);
  test('should update status filter and trigger fetch', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });

    // Change status filter to "Activos" (true)
    const statusSelects = screen.getAllByRole('combobox');
    const statusFilter = statusSelects[statusSelects.length - 1]; // Last combobox is the status filter
    
    await user.selectOptions(statusFilter, 'true');

    // Should trigger fetchClients with new status (line 111)
    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', 'true');
    });
  });

  test('should reset status filter to all statuses', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });

    const statusSelects = screen.getAllByRole('combobox');
    const statusFilter = statusSelects[statusSelects.length - 1];
    
    // Set to "Activos"
    await user.selectOptions(statusFilter, 'true');
    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', 'true');
    });

    // Reset to "Todos los Estados" (line 111 with empty value)
    await user.selectOptions(statusFilter, '');

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });
  });

  // Modal open/close flow combined
  test('should handle complete modal workflow', async () => {
    const user = userEvent.setup();
    window.alert.mockClear();
    
    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalled();
    });

    // Open modal (line 103)
    const addButton = screen.getByTestId('add-client-btn');
    await user.click(addButton);
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Save new client
    const saveButton = screen.getByTestId('modal-save');
    await user.click(saveButton);

    // Should call create and show success (no alert due to mock)
    await waitFor(() => {
      expect(ClientService.create).toHaveBeenCalled();
    });

    // Modal should close (line 129)
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  // Test status filter with different values
  test('should filter by "Bloqueados" status', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });

    const statusSelects = screen.getAllByRole('combobox');
    const statusFilter = statusSelects[statusSelects.length - 1];
    
    // Change to "Bloqueados" (false)
    await user.selectOptions(statusFilter, 'false');

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', 'false');
    });
  });

  // Integration test: search + filter combined
  test('should handle search with status filter together', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });

    // Type in search
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'Juan');

    // Change status filter
    const statusSelects = screen.getAllByRole('combobox');
    const statusFilter = statusSelects[statusSelects.length - 1];
    await user.selectOptions(statusFilter, 'true');

    // Both should be applied
    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('Juan', 'true');
    });
  });
});
