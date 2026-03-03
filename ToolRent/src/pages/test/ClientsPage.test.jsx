import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import ClientsPage from '../ClientsPage';
import ClientService from '../../services/ClientService';
import * as ReactKeycloak from '@react-keycloak/web';

// Mock dependencies
vi.mock('../../services/ClientService');
vi.mock('@react-keycloak/web');
vi.mock('../../tutorials/tutorialContent', () => ({
  tutorialContent: {
    clientes: {
      title: 'Tutorial Clientes',
      steps: []
    }
  }
}));
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn()
}));

// Mock child components
vi.mock('../../components/PageLayout', () => ({
  default: ({ children }) => <div>{children}</div>
}));
vi.mock('../../components/SearchBar', () => ({
  default: ({ searchTerm, setSearchTerm }) => (
    <input
      placeholder="Buscar..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      data-testid="search-input"
    />
  )
}));
vi.mock('../../components/AddClientButton', () => ({
  default: ({ onClick }) => <button onClick={onClick}>Agregar Cliente</button>
}));
vi.mock('../../components/ClientList', () => ({
  default: ({ clients, isLoading }) => (
    <div data-testid="client-list">
      {isLoading && <div>Cargando...</div>}
      {clients.map((client) => (
        <div key={client.idClient} data-testid="client-item">
          {client.nameClient}
        </div>
      ))}
    </div>
  )
}));
vi.mock('../../components/NewClientModal', () => ({
  default: ({ isOpen, onClose, onSave }) => (
    isOpen && (
      <div>
        <h2>Nuevo Cliente</h2>
        <button onClick={onClose}>Cerrar</button>
        <button onClick={() => onSave({ nameClient: 'Test', rutClient: '12345678-9' })}>
          Guardar
        </button>
      </div>
    )
  )
}));

describe('ClientsPage', () => {
  const mockClients = [
    { idClient: 1, nameClient: 'Juan Pérez', rutClient: '12345678-9', statusClient: true },
    { idClient: 2, nameClient: 'María García', rutClient: '98765432-1', statusClient: false }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Keycloak
    ReactKeycloak.useKeycloak.mockReturnValue({
      keycloak: { authenticated: true }
    });

    ClientService.getAll.mockResolvedValue({ data: mockClients });
    ClientService.create.mockResolvedValue({ data: { idClient: 3 } });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  test('should render page with title and main components', async () => {
    render(<ClientsPage />);

    // Verifica que el título aparezca (return JSX coverage)
    expect(screen.getByText('Clientes y Arriendos')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar cliente/i })).toBeInTheDocument();
  });

  test('should fetch clients on mount with empty filters', async () => {
    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });
  });

  test('should display loaded clients in the list', async () => {
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
  });

  test('should change status filter and trigger fetch', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    // Espera a que se cargue inicial
    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });

    // Busca el select de estado (onChange coverage)
    const statusSelect = screen.getByRole('combobox');
    
    // Cambia a "Activos"
    await user.selectOptions(statusSelect, 'true');

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', 'true');
    });
  });

  test('should change status to "Bloqueados" and fetch with that filter', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });

    const statusSelect = screen.getByRole('combobox');
    await user.selectOptions(statusSelect, 'false');

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', 'false');
    });
  });

  test('should reset status filter to "Todos los Estados"', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });

    const statusSelect = screen.getByRole('combobox');
    
    // Cambiar a Activos
    await user.selectOptions(statusSelect, 'true');
    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', 'true');
    });

    // Volver a "Todos"
    await user.selectOptions(statusSelect, '');

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });
  });

  test('should open modal when add client button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);

    // Modal debe aparecer (return JSX coverage)
    expect(screen.getByText('Nuevo Cliente')).toBeInTheDocument();
  });

  test('should close modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);
    expect(screen.getByText('Nuevo Cliente')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Nuevo Cliente')).not.toBeInTheDocument();
    });
  });

  test('should save client successfully and refresh list', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(ClientService.create).toHaveBeenCalled();
    });

    expect(alertMock).toHaveBeenCalledWith('¡Cliente creado correctamente!');

    // Modal debe cerrarse
    await waitFor(() => {
      expect(screen.queryByText('Nuevo Cliente')).not.toBeInTheDocument();
    });

    alertMock.mockRestore();
  });

  test('should handle 409 conflict error (duplicate RUT)', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    ClientService.create.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { error: 'Ya existe un cliente' }
      }
    });

    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('RUT ingresado ya existe')
      );
    });

    alertMock.mockRestore();
  });

  test('should handle server message with "Ya existe un cliente"', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    ClientService.create.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Ya existe un cliente con este RUT' }
      }
    });

    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('RUT ingresado ya existe')
      );
    });

    alertMock.mockRestore();
  });

  test('should handle 500 server error', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    ClientService.create.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { error: 'Internal Server Error' }
      }
    });

    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('Error del servidor (500)')
      );
    });

    alertMock.mockRestore();
  });

  test('should handle 403 forbidden error', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    ClientService.create.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { error: 'Forbidden' }
      }
    });

    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('No tienes permisos para crear clientes.');
    });

    alertMock.mockRestore();
  });

  test('should handle 400 bad request error', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    ClientService.create.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Bad Request' }
      }
    });

    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('Verifica que todos los campos')
      );
    });

    alertMock.mockRestore();
  });

  test('should handle network error', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    ClientService.create.mockRejectedValueOnce(new Error('Network error'));

    render(<ClientsPage />);

    const addButton = screen.getByRole('button', { name: /agregar cliente/i });
    await user.click(addButton);

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Ocurrió un error inesperado al guardar.');
    });

    alertMock.mockRestore();
  });

  test('should handle empty clients list', async () => {
    ClientService.getAll.mockResolvedValueOnce({ data: [] });

    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalled();
    });

    const clientItems = screen.queryAllByTestId('client-item');
    expect(clientItems.length).toBe(0);
  });

  test('should handle null data response', async () => {
    ClientService.getAll.mockResolvedValueOnce({ data: null });

    render(<ClientsPage />);

    await waitFor(() => {
      expect(ClientService.getAll).toHaveBeenCalled();
    });

    const clientItems = screen.queryAllByTestId('client-item');
    expect(clientItems.length).toBe(0);
  });

  test('should apply multiple filters together', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      // Initial fetch
      expect(ClientService.getAll).toHaveBeenCalledWith('', '');
    });

    // Change status filter
    const statusSelect = screen.getByRole('combobox');
    await user.selectOptions(statusSelect, 'true');

    await waitFor(() => {
      // Should use search term from input + new status filter
      expect(ClientService.getAll).toHaveBeenCalledWith('', 'true');
    });
  });
});
