import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
        console.log('🔐 Intentando login...');
        const response = await authService.login(email, password);
        
        console.log('✅ Login exitoso:', response);
        
        // Redirigir al dashboard
        navigate('/admin/dashboard');
        } catch (err) {
        console.error('❌ Error en login:', err);
        setError(err.message || 'Error al iniciar sesión');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="login-container">
        <div className="login-box">
            <div className="login-header">
            <h1 className="login-title">🎾 PadelBook</h1>
            <p className="login-subtitle">Panel de Administración</p>
            </div>

            {error && (
            <div className="alert alert-error">
                <span>⚠️</span>
                <span>{error}</span>
            </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@padelbook.com"
                required
                disabled={loading}
                autoComplete="email"
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
                />
            </div>

            <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
            >
                {loading ? '⏳ Cargando...' : '🚀 Iniciar Sesión'}
            </button>
            </form>

            <div className="login-footer">
            <p className="help-text">
                💡 Credenciales por defecto:<br />
                <strong>admin@padelbook.com</strong> / <strong>admin123</strong>
            </p>
            </div>
        </div>
        </div>
    );
}