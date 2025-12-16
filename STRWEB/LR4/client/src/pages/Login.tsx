import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle Google OAuth callback
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (error) {
      let errorMessage = 'Ошибка авторизации через Google.';
      if (error === 'oauth_not_configured') {
        errorMessage = 'Google OAuth не настроен на сервере. Используйте обычную регистрацию.';
      } else if (error === 'oauth_failed') {
        errorMessage = 'Ошибка авторизации через Google. Пожалуйста, попробуйте снова или используйте обычную регистрацию.';
      } else if (error === 'token_failed') {
        errorMessage = 'Ошибка создания токена. Попробуйте войти снова.';
      }
      setErrors({ submit: errorMessage });
    }
    
    if (token) {
      localStorage.setItem('token', token);
      // Reload to update auth context
      window.location.href = '/';
    }

    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email обязателен';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!password) {
      newErrors.password = 'Пароль обязателен';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (!isLogin && !name) {
      newErrors.name = 'Имя обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate('/');
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.error || 'Произошла ошибка' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    // Check if Google OAuth is available before redirecting
    try {
      const response = await fetch(`${apiUrl}/api/auth/google`, { method: 'HEAD' });
      if (!response.ok && response.status === 503) {
        const errorData = await fetch(`${apiUrl}/api/auth/google`).then(r => r.json());
        setErrors({ submit: errorData.error || 'Google OAuth не настроен. Используйте обычную регистрацию.' });
        return;
      }
    } catch (error) {
      // If check fails, still try to redirect (might be CORS issue)
    }
    
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">🍕 Pizzeria</h1>
        <h2 className="login-subtitle">{isLogin ? 'Вход' : 'Регистрация'}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={errors.name ? 'error' : focusedField === 'name' ? 'focused' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={errors.email ? 'error' : focusedField === 'email' ? 'focused' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className={errors.password ? 'error' : focusedField === 'password' ? 'focused' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="divider">
          <span>или</span>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="google-btn"
          title="Google OAuth может быть не настроен на сервере"
        >
          <span>🔍</span> Войти через Google
        </button>
        <p className="oauth-note">
          * Google OAuth доступен только если настроен на сервере
        </p>

        <div className="switch-form">
          <span>{isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}</span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="switch-btn"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

