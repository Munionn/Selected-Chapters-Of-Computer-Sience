import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🍕 Pizzeria
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Каталог
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/customizer" 
                className={`nav-link ${location.pathname === '/customizer' ? 'active' : ''}`}
              >
                Конструктор
              </Link>
              <Link 
                to="/orders" 
                className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
              >
                Заказы
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  Управление
                </Link>
              )}
            </>
          )}
          {!isAuthenticated ? (
            <Link 
              to="/login" 
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Войти
            </Link>
          ) : (
            <div className="nav-user">
              <span className="nav-user-name">{user?.name}</span>
              <button onClick={handleLogout} className="nav-logout-btn">
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

