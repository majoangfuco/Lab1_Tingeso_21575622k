import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewRentalModal from '../NewRentalModal';
import InventoryService from '../../services/InventoryService';

// Mock InventoryService
vi.mock('../../services/InventoryService', () => ({
  default: {
    getAll: vi.fn(),
    getUnitsByTypeId: vi.fn()
  }
}));

// Mock alert globally
global.alert = vi.fn();

describe('NewRentalModal - Enhanced Coverage', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const mockCatalog = [
    { idInformationTool: 1, nameTool: 'Taladro', categoryTool: 'Herramientas de Poder' },
    { idInformationTool: 2, nameTool: 'Sierra', categoryTool: 'Herramientas de Corte' },
    { idInformationTool: 3, nameTool: 'Martillo', categoryTool: 'Herramientas Manuales' }
  ];

  const mockUnits = [
    { toolId: 101, toolCode: 'T001', toolStatus: 0, typeName: 'Taladro' },
    { toolId: 102, toolCode: 'T002', toolStatus: 0, typeName: 'Taladro' },
    { toolId: 103, toolCode: 'T003', toolStatus: 0, typeName: 'Taladro' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.alert.mockClear();
    InventoryService.getAll.mockResolvedValue({ data: mockCatalog });
    InventoryService.getUnitsByTypeId.mockResolvedValue({ data: mockUnits });
  });

  describe('Uncovered Line: fetchCatalog effects', () => {
    it('should call fetchCatalog and handle successful response with data array', async () => {
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(InventoryService.getAll).toHaveBeenCalled();
      });

      // Verify catalog is populated
      expect(screen.getByText(/Taladro/)).toBeInTheDocument();
    });

    it('should handle empty catalog response (falsy data)', async () => {
      InventoryService.getAll.mockResolvedValueOnce({ data: null });

      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
        // Should handle null data gracefully and not crash
        expect(typeSelect).toBeInTheDocument();
      });
    });

    it('should call catch block on fetch error and log to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      InventoryService.getAll.mockRejectedValueOnce(new Error('Network error'));

      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error al cargar catálogo',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should set isLoadingCatalog to false after fetch completes', async () => {
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      // Initially, select should eventually be enabled (not disabled by loading state)
      await waitFor(() => {
        const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
        expect(typeSelect).not.toBeDisabled();
      });
    });
  });

  describe('Uncovered Line: useEffect selectedTypeId branch logic', () => {
    it('should load units when selectedTypeId is truthy', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(InventoryService.getUnitsByTypeId).toHaveBeenCalled();
      });
    });

    it('should clear availableUnits when selectedTypeId is empty', async () => {
      const user = userEvent.setup();
      InventoryService.getUnitsByTypeId.mockResolvedValueOnce({ data: mockUnits });

      const { rerender } = render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('T001 - Disponible')).toBeInTheDocument();
      });

      // Reset type selection
      const resetTypeSelect = screen.getByDisplayValue('1');
      await user.selectOptions(resetTypeSelect, '');

      // Unit selection should be cleared
      await waitFor(() => {
        const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
        expect(unitSelects[0]).toHaveValue('');
      });
    });
  });

  describe('Uncovered Line: loadUnits response handling', () => {
    it('should filter units by toolStatus === 0', async () => {
      const user = userEvent.setup();
      InventoryService.getUnitsByTypeId.mockResolvedValueOnce({
        data: [
          { toolId: 101, toolCode: 'T001', toolStatus: 0 },
          { toolId: 102, toolCode: 'T002', toolStatus: 1 }, // unavailable
          { toolId: 103, toolCode: 'T003', toolStatus: 0 }
        ]
      });

      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        // T001 and T003 should appear (status 0)
        expect(screen.getByText('T001 - Disponible')).toBeInTheDocument();
        expect(screen.getByText('T003 - Disponible')).toBeInTheDocument();
        // T002 should NOT appear (status 1)
        expect(screen.queryByText('T002 - Disponible')).not.toBeInTheDocument();
      });
    });

    it('should handle null response data in loadUnits', async () => {
      const user = userEvent.setup();
      InventoryService.getUnitsByTypeId.mockResolvedValueOnce({ data: null });

      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        // Should not crash and show empty units option
        const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
        expect(unitSelects[0]).toBeInTheDocument();
      });
    });

    it('should handle exception in loadUnits and log to console', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      InventoryService.getUnitsByTypeId.mockRejectedValueOnce(new Error('API error'));

      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Uncovered Line: handleAddTool validation branches', () => {
    it('should alert when availableUnits.length === 0 (line branch)', async () => {
      const user = userEvent.setup();
      InventoryService.getUnitsByTypeId.mockResolvedValueOnce({ data: [] }); // Empty units

      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('Sin unidades disponibles')).toBeInTheDocument();
      });

      const addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      expect(global.alert).toHaveBeenCalledWith(
        'No hay unidades disponibles para este tipo de herramienta. Selecciona otro tipo.'
      );
    });

    it('should find correct unit and type info for successful add', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('T001 - Disponible')).toBeInTheDocument();
      });

      const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      const addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        // Should find T001 and Taladro info and add successfully
        expect(screen.getByText('Taladro')).toBeInTheDocument();
        expect(screen.getByText('T001')).toBeInTheDocument();
      });
    });

    it('should handle missing unitToAdd and return early', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('T001 - Disponible')).toBeInTheDocument();
      });

      const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      const addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      // Cart should have 1 item
      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });
    });
  });

  describe('Uncovered Line: Duplicate prevention in cart', () => {
    it('should alert when adding duplicate tool (same toolId)', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('T001 - Disponible')).toBeInTheDocument();
      });

      // Add first time
      let unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      let addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });

      // Try to add same unit again
      unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      expect(global.alert).toHaveBeenCalledWith('Ya está en la lista.');
    });

    it('should alert when adding second tool of same type', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('T001 - Disponible')).toBeInTheDocument();
      });

      // Add first Taladro unit
      let unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      let addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });

      // Try to add different Taladro unit
      unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '102');

      addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      expect(global.alert).toHaveBeenCalledWith('Ya seleccionaste un "Taladro". Solo una por tipo.');
    });
  });

  describe('Uncovered Line: removeFromCart logic', () => {
    it('should filter out the removed tool by toolId', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('T001 - Disponible')).toBeInTheDocument();
      });

      const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      const addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });

      // Remove the tool
      const removeButton = screen.getByRole('button', { name: /✕/ });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (0)')).toBeInTheDocument();
      });
    });
  });

  describe('Uncovered Line: handleSubmit validation and formatting', () => {
    it('should format dates with seconds appended (formatIso function)', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      // Set dates
      const startDateInput = screen.getByLabelText('Fecha y hora de Inicio');
      const endDateInput = screen.getByLabelText('Fecha y hora de Término');

      await user.type(startDateInput, '2026-03-15T10:30');
      await user.type(endDateInput, '2026-03-20T15:45');

      // Add tool
      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
        expect(unitSelects[0]).not.toBeDisabled();
      });

      let unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      const addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });

      // Submit
      const submitButton = screen.getByRole('button', { name: 'Confirmar' });
      await user.click(submitButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        startDate: '2026-03-15T10:30:00',
        endDate: '2026-03-20T15:45:00',
        toolIds: [101]
      });
    });

    it('should call onSave with toolIds array from cart', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
        expect(unitSelects[0]).not.toBeDisabled();
      });

      let unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      const addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Confirmar' });
      await user.click(submitButton);

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          toolIds: [101]
        })
      );
    });
  });

  describe('Uncovered Line: Input onChange handlers', () => {
    it('should update startDate state on input change', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      const startDateInput = screen.getByLabelText('Fecha y hora de Inicio');
      await user.type(startDateInput, '2026-03-15T10:00');

      expect(startDateInput).toHaveValue('2026-03-15T10:00');
    });

    it('should update endDate state on input change', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      const endDateInput = screen.getByLabelText('Fecha y hora de Término');
      await user.type(endDateInput, '2026-03-20T15:00');

      expect(endDateInput).toHaveValue('2026-03-20T15:00');
    });

    it('should update selectedTypeId on type select change', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByDisplayValue('1')).toBeInTheDocument();
      });
    });

    it('should update selectedUnitId on unit select change', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
        expect(unitSelects[0]).not.toBeDisabled();
      });

      const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      expect(unitSelects[0]).toHaveValue('101');
    });
  });

  describe('Uncovered Line: Conditional rendering', () => {
    it('should show "Sin unidades disponibles" option when no units and type selected', async () => {
      const user = userEvent.setup();
      InventoryService.getUnitsByTypeId.mockResolvedValueOnce({ data: [] });

      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('Sin unidades disponibles')).toBeInTheDocument();
      });
    });

    it('should show "No hay herramientas" when cart is empty', () => {
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      expect(screen.getByText('No hay herramientas.')).toBeInTheDocument();
    });

    it('should show cart items summary with count', async () => {
      const user = userEvent.setup();
      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="Cliente" />
      );

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
        expect(unitSelects[0]).not.toBeDisabled();
      });

      const unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      const addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });
    });
  });

  describe('Integration: Complex workflows', () => {
    it('should handle complete workflow: select, add, remove, add different type, submit', async () => {
      const user = userEvent.setup();
      InventoryService.getUnitsByTypeId.mockImplementation((typeId) => {
        if (typeId === 1) {
          return Promise.resolve({
            data: [
              { toolId: 101, toolCode: 'T001', toolStatus: 0 },
              { toolId: 102, toolCode: 'T002', toolStatus: 0 }
            ]
          });
        } else if (typeId === 2) {
          return Promise.resolve({
            data: [{ toolId: 201, toolCode: 'S001', toolStatus: 0 }]
          });
        }
      });

      render(
        <NewRentalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} clientName="cliente" />
      );

      // Set dates
      const startDateInput = screen.getByLabelText('Fecha y hora de Inicio');
      const endDateInput = screen.getByLabelText('Fecha y hora de Término');
      await user.type(startDateInput, '2026-03-15T09:00');
      await user.type(endDateInput, '2026-03-22T17:00');

      await waitFor(() => {
        expect(screen.getByText(/Taladro/)).toBeInTheDocument();
      });

      // Add Taladro
      let typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '1');

      await waitFor(() => {
        expect(screen.getByText('T001 - Disponible')).toBeInTheDocument();
      });

      let unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '101');

      let addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });

      // Remove it
      let removeButton = screen.getByRole('button', { name: /✕/ });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('No hay herramientas.')).toBeInTheDocument();
      });

      // Add Sierra instead
      typeSelect = screen.getByDisplayValue('-- Selecciona un Tipo --');
      await user.selectOptions(typeSelect, '2');

      await waitFor(() => {
        expect(screen.getByText('S001 - Disponible')).toBeInTheDocument();
      });

      unitSelects = screen.getAllByDisplayValue('-- Selecciona Unidad --');
      await user.selectOptions(unitSelects[0], '201');

      addButton = screen.getByText('+ Agregar al Arriendo');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Resumen (1)')).toBeInTheDocument();
      });

      // Submit
      const submitButton = screen.getByRole('button', { name: 'Confirmar' });
      await user.click(submitButton);

      expect(mockOnSave).toHaveBeenCalledWith({
        startDate: '2026-03-15T09:00:00',
        endDate: '2026-03-22T17:00:00',
        toolIds: [201]
      });
    });
  });
});
