import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import NewRentalModal from '../NewRentalModal';
import InventoryService from '../../services/InventoryService';

// Mock InventoryService
vi.mock('../../services/InventoryService');

describe('NewRentalModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockClientName = 'Juan Pérez';

  const mockCatalog = [
    { idInformationTool: 1, nameTool: 'Taladro', categoryTool: 'Eléctrica' },
    { idInformationTool: 2, nameTool: 'Sierra', categoryTool: 'Manual' }
  ];

  const mockUnits = [
    { toolId: 101, toolCode: 'TAL-001', toolStatus: 0, informationTool: { nameTool: 'Taladro' } },
    { toolId: 102, toolCode: 'TAL-002', toolStatus: 0, informationTool: { nameTool: 'Taladro' } }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    InventoryService.getAll.mockResolvedValue({ data: mockCatalog });
    InventoryService.getUnitsByTypeId.mockResolvedValue({ data: mockUnits });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should return null when isOpen is false (early return)', () => {
    const { container } = render(
      <NewRentalModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );
    
    // El contenedor debe estar vacío (componente retorna null)
    expect(container.firstChild).toBeNull();
  });

  test('should render modal when isOpen is true', async () => {
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    // Verifica que aparezca el título y el nombre del cliente
    expect(screen.getByText('Nuevo Arriendo')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockClientName))).toBeInTheDocument();
  });

  test('should fetch catalog on modal open', async () => {
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    await waitFor(() => {
      expect(InventoryService.getAll).toHaveBeenCalled();
    });
  });

  test('should reset state when modal opens', async () => {
    const { rerender } = render(
      <NewRentalModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    // Abre el modal
    rerender(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    await waitFor(() => {
      expect(InventoryService.getAll).toHaveBeenCalled();
    });
  });

  test('should display catalog options in first dropdown', async () => {
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Taladro (Eléctrica)')).toBeInTheDocument();
      expect(screen.getByText('Sierra (Manual)')).toBeInTheDocument();
    });
  });

  test('should load units when type is selected', async () => {
    const user = userEvent.setup();
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Taladro (Eléctrica)')).toBeInTheDocument();
    });

    // Selecciona tipo de herramienta
    const typeSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(typeSelect, '1');

    await waitFor(() => {
      expect(InventoryService.getUnitsByTypeId).toHaveBeenCalledWith('1');
    });
  });

  test('should display available units after selecting type', async () => {
    const user = userEvent.setup();
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Taladro (Eléctrica)')).toBeInTheDocument();
    });

    const typeSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(typeSelect, '1');

    await waitFor(() => {
      expect(screen.getByText('TAL-001 - Disponible')).toBeInTheDocument();
      expect(screen.getByText('TAL-002 - Disponible')).toBeInTheDocument();
    });
  });

  test('should add tool to cart when selected and button clicked', async () => {
    const user = userEvent.setup();
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    // Espera a que se cargue el catálogo
    await waitFor(() => {
      expect(screen.getByText('Taladro (Eléctrica)')).toBeInTheDocument();
    });

    // Selecciona tipo
    const typeSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(typeSelect, '1');

    // Espera a que se carguen las unidades
    await waitFor(() => {
      expect(screen.getByText('TAL-001 - Disponible')).toBeInTheDocument();
    });

    // Selecciona unidad
    const unitSelect = screen.getAllByRole('combobox')[1];
    await user.selectOptions(unitSelect, '101');

    // Haz clic en "Agregar al Arriendo"
    const addButton = screen.getByRole('button', { name: /agregar al arriendo/i });
    await user.click(addButton);

    // Verifica que aparezca en el resumen - búsqueda más específica
    await waitFor(() => {
      const cartItems = screen.getAllByText(/TAL-001/);
      expect(cartItems.length).toBeGreaterThan(0);
    });
  });


  test('should prevent duplicate tools in cart', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Taladro (Eléctrica)')).toBeInTheDocument();
    });

    // Selecciona tipo y unidad
    const typeSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(typeSelect, '1');

    await waitFor(() => {
      expect(screen.getByText('TAL-001 - Disponible')).toBeInTheDocument();
    });

    const unitSelect = screen.getAllByRole('combobox')[1];
    await user.selectOptions(unitSelect, '101');

    // Agrega la primera vez
    const addButton = screen.getByRole('button', { name: /agregar al arriendo/i });
    await user.click(addButton);

    // Intenta agregar la misma unidad de nuevo
    await user.selectOptions(unitSelect, '101');
    await user.click(addButton);

    expect(alertMock).toHaveBeenCalledWith('Ya está en la lista.');
    alertMock.mockRestore();
  });

  test('should remove tool from cart', async () => {
    const user = userEvent.setup();
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    // Agregar herramienta al carrito
    await waitFor(() => {
      expect(screen.getByText('Taladro (Eléctrica)')).toBeInTheDocument();
    });

    const typeSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(typeSelect, '1');

    await waitFor(() => {
      expect(screen.getByText('TAL-001 - Disponible')).toBeInTheDocument();
    });

    const unitSelect = screen.getAllByRole('combobox')[1];
    await user.selectOptions(unitSelect, '101');

    const addButton = screen.getByRole('button', { name: /agregar al arriendo/i });
    await user.click(addButton);

    // Espera a que aparezca el botón de eliminar
    await waitFor(() => {
      const removeButtons = screen.getAllByRole('button', { name: /✕/i });
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    // Eliminar del carrito
    const removeButtons = screen.getAllByRole('button', { name: /✕/i });
    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/No hay herramientas/)).toBeInTheDocument();
    });
  });

  test('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });


  test('should submit rental with correct format', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    // Espera a que se cargue el catálogo
    await waitFor(() => {
      expect(screen.getByText('Taladro (Eléctrica)')).toBeInTheDocument();
    });

    // Llena las fechas usando querySelector
    const dateInputs = container.querySelectorAll('input[type="datetime-local"]');
    if (dateInputs.length >= 2) {
      await user.type(dateInputs[0], '2026-03-15T10:00');
      await user.type(dateInputs[1], '2026-03-20T10:00');
    }

    // Selecciona tipo y unidad
    const typeSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(typeSelect, '1');

    await waitFor(() => {
      expect(screen.getByText('TAL-001 - Disponible')).toBeInTheDocument();
    });

    const unitSelect = screen.getAllByRole('combobox')[1];
    await user.selectOptions(unitSelect, '101');

    // Agrega al carrito
    const addButton = screen.getByRole('button', { name: /agregar al arriendo/i });
    await user.click(addButton);

    // Envía el formulario
    const submitButton = screen.getByRole('button', { name: /confirmar/i });
    await user.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      startDate: '2026-03-15T10:00:00',
      endDate: '2026-03-20T10:00:00',
      toolIds: [101]
    });
  });

  test('should show no units available message if filtering returns empty', async () => {
    InventoryService.getUnitsByTypeId.mockResolvedValue({
      data: [{ toolId: 150, toolCode: 'TAL-150', toolStatus: 1 }] // Status 1 = unavailable
    });

    const user = userEvent.setup();
    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Taladro (Eléctrica)')).toBeInTheDocument();
    });

    const typeSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(typeSelect, '1');

    await waitFor(() => {
      expect(screen.getByText(/Sin unidades disponibles/)).toBeInTheDocument();
    });
  });

  test('should handle InventoryService error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    InventoryService.getAll.mockRejectedValue(new Error('Network error'));

    render(
      <NewRentalModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clientName={mockClientName}
      />
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
