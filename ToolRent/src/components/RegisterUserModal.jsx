import React, { useState } from 'react';
import UserService from '../services/UserService';
import './RegisterUserModal.css'; 

const RegisterUserModal = ({ isOpen, onClose }) => {
    // Why: We group related fields into a single object to simplify state updates and mass resets (clearing the form).
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'employee'
    });
    const [loading, setLoading] = useState(false);

    // Why: "Fail Fast" approach. If the modal is closed, we abort immediately to avoid rendering invisible DOM elements that consume memory.
    if (!isOpen) return null;

    const handleChange = (e) => {
        // Why: Computed property names ([name]: value) allow us to reuse a single handler function for all 4 inputs, reducing code duplication.
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        // Why: Prevents the browser from refreshing the page, which is the default behavior of HTML forms and would kill the React state.
        e.preventDefault();
        setLoading(true);
        try {
            // ENDPOINT TRIGGER: Initiates the HTTP POST request to create the user identity in the backend (Keycloak/DB).
            await UserService.register(formData);
            alert("Usuario registrado exitosamente.");
            
            // Why: Post-success cleanup. We close the modal and wipe the form so the next use starts fresh.
            onClose();
            setFormData({ username: '', password: '', email: '', role: 'employee' });
        } catch (error) {
            console.error(error);
            // Why: Optional chaining (?.) safely accesses nested error messages without crashing if the response object is missing or null.
            alert("Error: " + (error.response?.data?.error || "Error desconocido"));
        } finally {
            // Why: The 'finally' block ensures the loading spinner stops even if the request crashes, preventing the UI from freezing.
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay"> 
            <div className="modal-content"> 
                <h2 className="modal-title">Registrar Nuevo Usuario</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Usuario</label>
                        <input 
                            name="username" 
                            required 
                            className="form-input" 
                            onChange={handleChange} 
                            // Why: Controlled Component pattern. The React state is the single source of truth for what is displayed in the input.
                            value={formData.username}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input 
                            name="email" 
                            type="email" 
                            className="form-input" 
                            onChange={handleChange} 
                            value={formData.email}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input 
                            name="password" 
                            type="password" 
                            required 
                            className="form-input" 
                            onChange={handleChange} 
                            value={formData.password}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Rol</label>
                        <select 
                            name="role" 
                            className="form-select" 
                            onChange={handleChange} 
                            value={formData.role}
                        >
                            <option value="employee">Empleado</option>
                            {/* Why: The value sent to the backend ('Admin') might differ from the label shown to the user ('Administrador'). */}
                            <option value="Admin">Administrador</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancelar
                        </button>
                        {/* Why: Disabling the button during the network request physically prevents the user from accidentally creating duplicate users by double-clicking. */}
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterUserModal;