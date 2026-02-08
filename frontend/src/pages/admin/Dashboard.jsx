import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './Dashboard.css';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = authService.getUser();
        if (!userData) {
        navigate('/login');
        } else {
            setUser(userData);
        }
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (!user) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="dashboard-container">
        <header className="dashboard-header">
            <h1>Dashboard</h1>
            <button onClick={handleLogout} className="btn btn-logout">
            Cerrar Sesión
            </button>
        </header>

        <div className="welcome-message">
            <h2>Bienvenido, {user.nombre}!</h2>
            <p>Email: {user.email}</p>
            <p>Rol: {user.rol}</p>
        </div>

        <div className="stats-grid">
            <div className="stat-card">
            <h3>Reservas Hoy</h3>
            <p className="stat-number">0</p>
            </div>

            <div className="stat-card">
            <h3>Ingresos del Día</h3>
            <p className="stat-number">$0</p>
            </div>

            <div className="stat-card">
            <h3>Ocupación</h3>
            <p className="stat-number">0%</p>
            </div>
        </div>
        </div>
    );
}