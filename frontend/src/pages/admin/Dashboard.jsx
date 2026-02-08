// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './Dashboard.css';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
    // Verificar autenticación
    if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
    }

    // Obtener datos del usuario
    const userData = authService.getUser();
    setUser(userData);
    setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
    authService.logout();
    navigate('/login');
    };

    if (loading) {
    return (
        <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
        </div>
    );
    }

    if (!user) {
    return null;
    }

    return (
    <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
        <div className="header-left">
            <h1>🎾 Dashboard</h1>
        </div>
        <div className="header-right">
            <button onClick={handleLogout} className="btn btn-logout">
            🚪 Cerrar Sesión
            </button>
        </div>
        </header>

        {/* Welcome Section */}
        <section className="welcome-section">
        <div className="welcome-card">
            <h2>👋 Bienvenido, {user.nombre}!</h2>
            <div className="user-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rol:</strong> <span className="badge badge-admin">{user.rol}</span></p>
            </div>
        </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-section">
        <h3 className="section-title">📊 Estadísticas del Día</h3>
        <div className="stats-grid">
            <div className="stat-card card-blue">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
                <h4>Reservas Hoy</h4>
                <p className="stat-number">0</p>
                <span className="stat-label">turnos confirmados</span>
            </div>
            </div>

            <div className="stat-card card-green">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
                <h4>Ingresos del Día</h4>
                <p className="stat-number">$0</p>
                <span className="stat-label">pesos argentinos</span>
            </div>
            </div>

            <div className="stat-card card-purple">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
                <h4>Ocupación</h4>
                <p className="stat-number">0%</p>
                <span className="stat-label">de canchas ocupadas</span>
            </div>
            </div>
        </div>
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
        <h3 className="section-title">⚡ Acciones Rápidas</h3>
        <div className="actions-grid">
            <button className="action-card">
            <span className="action-icon">➕</span>
            <span className="action-text">Nueva Reserva</span>
            </button>
            <button className="action-card">
            <span className="action-icon">🎾</span>
            <span className="action-text">Gestionar Canchas</span>
            </button>
            <button className="action-card">
            <span className="action-icon">👥</span>
            <span className="action-text">Ver Clientes</span>
            </button>
            <button className="action-card">
            <span className="action-icon">📊</span>
            <span className="action-text">Reportes</span>
            </button>
        </div>
        </section>
    </div>
    );
}