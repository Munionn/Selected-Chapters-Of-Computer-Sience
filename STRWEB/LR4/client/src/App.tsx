import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Catalog from './pages/Catalog';
import PizzaDetail from './pages/PizzaDetail';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Customizer from './pages/Customizer';
import Admin from './pages/Admin';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/pizza/:id" element={<PizzaDetail />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/customizer"
        element={
          <ProtectedRoute>
            <Customizer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <AppRoutes />
          </main>
          <footer className="footer">
            <p>&copy; 2025 Pizzeria. Все права защищены.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

