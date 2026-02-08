import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/api";
import "./Login.css";

export default function Login () {
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(email,password);
            navigate ('/admin/dashboard');
        } catch (err){
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
        <div className="login-box">
            <h1 className="login-title">goPadel</h1>
            <p className="login-subtitle">Panel de Administración</p>

            {error && (
            <div className="alert alert-error">
                {error}
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
                />
            </div>

            <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
            >
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
            </form>
        </div>
        </div>
    );
}