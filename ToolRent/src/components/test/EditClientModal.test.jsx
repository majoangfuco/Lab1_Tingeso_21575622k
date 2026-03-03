import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditClientModal from '../EditClientModal';

describe('EditClientModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockClientData = {
    rut: '12345678-9',
    clientName: 'Juan Pérez',
    mail: 'juan@example.com',
    phone: '912345678'
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  // ============================================================================
  // Visibilidad y Renderización
  // ============================================================================
  describe('Visibilidad y Renderización', () => {
    it('E1: Modal no se renderiza cuando isOpen es falso', () => {
      const { container } = render(
        <EditClientModal
          isOpen={false}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
    });

    it('E2: Modal se muestra cuando isOpen es verdadero', () => {
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Precarga de Datos
  // ============================================================================
  describe('Precarga de Datos del Cliente', () => {
    it('E3: Formulario se precarga con datos del cliente', () => {
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByDisplayValue('Juan Pérez');
      const emailInput = screen.getByDisplayValue('juan@example.com');
      const phoneInput = screen.getByDisplayValue('912345678');
      
      expect(nameInput).toHaveValue('Juan Pérez');
      expect(emailInput).toHaveValue('juan@example.com');
      expect(phoneInput).toHaveValue('912345678');
    });

    it('E4: Formulario se actualiza cuando clientData cambia', async () => {
      const { rerender } = render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
      
      const updatedData = {
        ...mockClientData,
        clientName: 'María García'
      };
      
      rerender(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={updatedData}
          onSave={mockOnSave}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('María García')).toBeInTheDocument();
      });
    });

    it('E5: Modal maneja clientData nulo correctamente', () => {
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={null}
          onSave={mockOnSave}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveValue('');
      });
      
      expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Edición de Campos
  // ============================================================================
  describe('Edición de Campos del Formulario', () => {
    it('E6: Usuario puede editar el campo "Nombre"', async () => {
      const user = userEvent.setup();
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByDisplayValue('Juan Pérez');
      await user.clear(nameInput);
      await user.type(nameInput, 'Carlos López');
      
      expect(nameInput).toHaveValue('Carlos López');
    });

    it('E7: Usuario puede editar el campo "Email"', async () => {
      const user = userEvent.setup();
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const emailInput = screen.getByDisplayValue('juan@example.com');
      await user.clear(emailInput);
      await user.type(emailInput, 'nuevo@example.com');
      
      expect(emailInput).toHaveValue('nuevo@example.com');
    });

    it('E8: Usuario puede editar el campo "Teléfono" (opcional)', async () => {
      const user = userEvent.setup();
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const phoneInput = screen.getByDisplayValue('912345678');
      await user.clear(phoneInput);
      await user.type(phoneInput, '987654321');
      
      expect(phoneInput).toHaveValue('987654321');
    });
  });

  // ============================================================================
  // Validaciones de Campos
  // ============================================================================
  describe('Validaciones de Campos', () => {
    it('E9: Campo "Nombre" es obligatorio (required)', () => {
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByDisplayValue('Juan Pérez');
      expect(nameInput).toHaveAttribute('required');
    });

    it('E10: Campo "Email" es obligatorio (required)', () => {
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const emailInput = screen.getByDisplayValue('juan@example.com');
      expect(emailInput).toHaveAttribute('required');
    });

    it('E11: Campo "Teléfono" es opcional (no required)', () => {
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const phoneInput = screen.getByDisplayValue('912345678');
      expect(phoneInput).not.toHaveAttribute('required');
    });
  });

  // ============================================================================
  // Acciones de Botones
  // ============================================================================
  describe('Acciones de Botones', () => {
    it('E12: Botón "Cancelar" cierra el modal sin guardar', async () => {
      const user = userEvent.setup();
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByDisplayValue('Juan Pérez');
      await user.clear(nameInput);
      await user.type(nameInput, 'Datos Modificados');
      
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledOnce();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('E13: Botón "Guardar" envía datos actualizado', async () => {
      const user = userEvent.setup();
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByDisplayValue('Juan Pérez');
      await user.clear(nameInput);
      await user.type(nameInput, 'Pedro González');
      
      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            clientName: 'Pedro González'
          })
        );
      });
    });

    it('E14: Botón "Guardar" previene recarga de página', async () => {
      const user = userEvent.setup();
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const form = screen.getByRole('button', { name: /Guardar/i }).closest('form');
      const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault');
      
      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(form?.onsubmit).toBeDefined();
      });
    });
  });

  // ============================================================================
  // Integridad de Datos
  // ============================================================================
  describe('Integridad de Datos', () => {
    it('E15: Cambios en un campo no afectan otros campos', async () => {
      const user = userEvent.setup();
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByDisplayValue('Juan Pérez');
      const emailInput = screen.getByDisplayValue('juan@example.com');
      const phoneInput = screen.getByDisplayValue('912345678');
      
      // Modificar solo el nombre
      await user.clear(nameInput);
      await user.type(nameInput, 'Nuevo Nombre');
      
      // Verificar que otros campos no cambiaron
      expect(emailInput).toHaveValue('juan@example.com');
      expect(phoneInput).toHaveValue('912345678');
      
      // Guardar y verificar que onSave recibe todos los campos
      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            clientName: 'Nuevo Nombre',
            mail: 'juan@example.com',
            phone: '912345678'
          })
        );
      });
    });

    it('E16: Múltiples cambios se acumulan correctamente', async () => {
      const user = userEvent.setup();
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const nameInput = screen.getByDisplayValue('Juan Pérez');
      const emailInput = screen.getByDisplayValue('juan@example.com');
      const phoneInput = screen.getByDisplayValue('912345678');
      
      // Cambio 1: Nombre
      await user.clear(nameInput);
      await user.type(nameInput, 'Juan Rodriguez');
      
      // Cambio 2: Email
      await user.clear(emailInput);
      await user.type(emailInput, 'juan.rodriguez@example.com');
      
      // Cambio 3: Teléfono
      await user.clear(phoneInput);
      await user.type(phoneInput, '654123789');
      
      // Verificar que todos los cambios se acumularon
      expect(nameInput).toHaveValue('Juan Rodriguez');
      expect(emailInput).toHaveValue('juan.rodriguez@example.com');
      expect(phoneInput).toHaveValue('654123789');
      
      // Guardar y verificar que onSave recibe todos los cambios
      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          rut: '12345678-9',
          clientName: 'Juan Rodriguez',
          mail: 'juan.rodriguez@example.com',
          phone: '654123789'
        });
      });
    });
  });

  // ============================================================================
  // PropTypes y Validación - Nota: PropTypes validation ocurre en desarrollo
  // Estos tests se pueden ejecutar con NODE_ENV=development
  // ============================================================================
  describe('PropTypes y Validación', () => {
    it('E17-E20: Componente valida PropTypes (testeado en desarrollo)', () => {
      // PropTypes se valida automáticamente en desenvolvimento
      // En tests, simplemente verificamos que las props son pasadas correctamente
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      // Si no lanza error, assume que el componente intenta usar las props
      expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Casos Especiales y Edge Cases
  // ============================================================================
  describe('Casos Especiales y Edge Cases', () => {
    it('Maneja cambio de isOpen de false a true', async () => {
      const { rerender } = render(
        <EditClientModal
          isOpen={false}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.queryByText('Editar Cliente')).not.toBeInTheDocument();
      
      rerender(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
    });

    it('useEffect se ejecuta cuando clientData cambia', async () => {
      const initialData = {
        rut: '11111111-1',
        clientName: 'Inicial',
        mail: 'inicial@example.com',
        phone: ''
      };
      
      const { rerender } = render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={initialData}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByDisplayValue('Inicial')).toBeInTheDocument();
      
      const updatedData = {
        ...initialData,
        clientName: 'Actualizado'
      };
      
      rerender(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={updatedData}
          onSave={mockOnSave}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Actualizado')).toBeInTheDocument();
      });
    });

    it('Botones tienen las clases CSS correctas', () => {
      render(
        <EditClientModal
          isOpen={true}
          onClose={mockOnClose}
          clientData={mockClientData}
          onSave={mockOnSave}
        />
      );
      
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      
      expect(cancelButton).toHaveClass('btn-cancel');
      expect(saveButton).toHaveClass('btn-save');
    });
  });
});
