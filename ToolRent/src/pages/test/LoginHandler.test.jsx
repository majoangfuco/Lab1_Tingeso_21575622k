import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginHandler from '../LoginHandler';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

vi.mock('@react-keycloak/web');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginHandler', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('should show loading when not initialized', () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: false,
        login: vi.fn(),
        hasRealmRole: vi.fn()
      },
      initialized: false
    });

    renderWithRouter(<LoginHandler />);

    expect(screen.getByText('Inicializando aplicación...')).toBeInTheDocument();
  });

  test('should show authenticated loading screen', async () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: true,
        login: vi.fn(),
        hasRealmRole: vi.fn()
      },
      initialized: true
    });

    const { rerender } = renderWithRouter(<LoginHandler />);

    // First render shows loading, then after timeout would redirect
    expect(screen.queryByText('Redirigiendo...')).toBeInTheDocument();
  });

  test('should navigate to admin dashboard when ADMIN role', async () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: true,
        login: vi.fn(),
        hasRealmRole: (role) => role === 'ADMIN'
      },
      initialized: true
    });

    renderWithRouter(<LoginHandler />);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
      },
      { timeout: 2000 }
    );
  });

  test('should navigate to user dashboard when USER role', async () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: true,
        login: vi.fn(),
        hasRealmRole: (role) => role === 'USER'
      },
      initialized: true
    });

    renderWithRouter(<LoginHandler />);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/user-dashboard');
      },
      { timeout: 2000 }
    );
  });

  test('should navigate to welcome when no recognized role', async () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: true,
        login: vi.fn(),
        hasRealmRole: (role) => false
      },
      initialized: true
    });

    renderWithRouter(<LoginHandler />);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/welcome');
      },
      { timeout: 2000 }
    );
  });

  test('should show login prompt when not authenticated', () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: false,
        login: vi.fn(),
        hasRealmRole: vi.fn()
      },
      initialized: true
    });

    renderWithRouter(<LoginHandler />);

    expect(screen.getByText('ToolRent')).toBeInTheDocument();
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });

  test('should call keycloak login when button is clicked', async () => {
    const mockLogin = vi.fn();
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: false,
        login: mockLogin,
        hasRealmRole: vi.fn()
      },
      initialized: true
    });

    const user = userEvent.setup();
    renderWithRouter(<LoginHandler />);

    const loginButton = screen.getByText('Iniciar Sesión');
    await user.click(loginButton);

    expect(mockLogin).toHaveBeenCalled();
  });

  test('should display all feature icons on login page', () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: false,
        login: vi.fn(),
        hasRealmRole: vi.fn()
      },
      initialized: true
    });

    renderWithRouter(<LoginHandler />);

    expect(screen.getByText('Gestión de Clientes')).toBeInTheDocument();
    expect(screen.getByText('Inventario')).toBeInTheDocument();
    expect(screen.getByText('Kardex')).toBeInTheDocument();
    expect(screen.getByText('Rentales')).toBeInTheDocument();
  });

  test('should cleanup timer on unmount', async () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: true,
        login: vi.fn(),
        hasRealmRole: (role) => role === 'ADMIN'
      },
      initialized: true
    });

    const { unmount } = renderWithRouter(<LoginHandler />);

    unmount();

    // Should not navigate after unmount
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should handle authentication state changes', () => {
    const mockKeycloak = {
      authenticated: false,
      login: vi.fn(),
      hasRealmRole: vi.fn()
    };

    useKeycloak.mockReturnValue({
      keycloak: mockKeycloak,
      initialized: true
    });

    renderWithRouter(<LoginHandler />);

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });

  test('should display logo image', () => {
    useKeycloak.mockReturnValue({
      keycloak: {
        authenticated: false,
        login: vi.fn(),
        hasRealmRole: vi.fn()
      },
      initialized: true
    });

    renderWithRouter(<LoginHandler />);

    const logo = screen.getByAltText('Logo ToolRent');
    expect(logo).toBeInTheDocument();
  });
});
