import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TimeDisplay from '../components/TimeDisplay';
import OrderProcess from '../components/OrderProcess';
import { showNotification } from '../utils/asyncOperations';
import { handleImageError } from '../utils/imageUtils';
import './PizzaDetail.css';

interface Ingredient {
  _id: string;
  name: string;
  category: string;
  price: number;
}

interface Pizza {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  ingredients: Ingredient[];
  category: string;
  isAvailable: boolean;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

function PizzaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPizza();
    }
  }, [id]);

  const fetchPizza = async () => {
    try {
      const response = await api.get(`/pizzas/${id}`);
      setPizza(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load pizza');
      setLoading(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryAddress(e.target.value);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Пожалуйста, введите адрес доставки');
      return;
    }

    try {
      const totalPrice = pizza ? pizza.basePrice * quantity : 0;
      const response = await api.post('/orders', {
        items: [{
          pizza: pizza?._id,
          quantity,
          price: totalPrice
        }],
        deliveryAddress
      });
      showNotification('Заказ успешно создан!');
      navigate('/orders');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create order');
    }
  };

  const formatDate = (dateString: string, timezone: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pizza) return <div className="error">Пицца не найдена</div>;

  return (
    <div className="pizza-detail">
      <TimeDisplay />

      <button onClick={() => navigate(-1)} className="back-btn">
        ← Назад
      </button>

      <div className="detail-content">
        <div className="detail-image">
          <img 
            src={pizza.image} 
            alt={pizza.name}
            onError={handleImageError}
          />
        </div>

        <div className="detail-info">
          <h1 className="detail-name">{pizza.name}</h1>
          <p className="detail-description">{pizza.description}</p>

          <div className="detail-meta">
            <div className="meta-item">
              <span className="meta-label">Категория:</span>
              <span className="meta-value">{pizza.category}</span>
            </div>
            {pizza.rating && (
              <div className="meta-item">
                <span className="meta-label">Рейтинг:</span>
                <span className="meta-value">⭐ {pizza.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">Цена:</span>
              <span className="meta-value price">${pizza.basePrice.toFixed(2)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Статус:</span>
              <span className={`meta-value ${pizza.isAvailable ? 'available' : 'unavailable'}`}>
                {pizza.isAvailable ? 'Доступна' : 'Недоступна'}
              </span>
            </div>
          </div>

          <div className="detail-ingredients">
            <h3>Ингредиенты:</h3>
            <div className="ingredients-list">
              {pizza.ingredients.map((ingredient) => (
                <div key={ingredient._id} className="ingredient-tag">
                  {ingredient.name}
                </div>
              ))}
            </div>
          </div>

          <div className="detail-dates">
            <h3>Информация о датах:</h3>
            <div className="dates-grid">
              <div className="date-item">
                <span className="date-label">Создано (локально):</span>
                <span className="date-value">
                  {formatDate(pizza.createdAt, Intl.DateTimeFormat().resolvedOptions().timeZone)}
                </span>
              </div>
              <div className="date-item">
                <span className="date-label">Создано (UTC):</span>
                <span className="date-value">
                  {formatDate(pizza.createdAt, 'UTC')}
                </span>
              </div>
              <div className="date-item">
                <span className="date-label">Обновлено (локально):</span>
                <span className="date-value">
                  {formatDate(pizza.updatedAt, Intl.DateTimeFormat().resolvedOptions().timeZone)}
                </span>
              </div>
              <div className="date-item">
                <span className="date-label">Обновлено (UTC):</span>
                <span className="date-value">
                  {formatDate(pizza.updatedAt, 'UTC')}
                </span>
              </div>
            </div>
          </div>

          {pizza.isAvailable && (
            <>
              <div className="order-section">
                {!showOrderForm ? (
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="order-btn"
                  >
                    Заказать
                  </button>
                ) : (
                  <form onSubmit={handleOrderSubmit} className="order-form">
                    <div className="form-group">
                      <label htmlFor="quantity">Количество:</label>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        onFocus={() => setFocusedInput('quantity')}
                        onBlur={() => setFocusedInput(null)}
                        onKeyUp={(e) => {
                          if (e.key === 'ArrowUp') {
                            setQuantity(prev => prev + 1);
                          } else if (e.key === 'ArrowDown' && quantity > 1) {
                            setQuantity(prev => prev - 1);
                          }
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Адрес доставки:</label>
                      <input
                        id="address"
                        type="text"
                        value={deliveryAddress}
                        onChange={handleAddressChange}
                        onFocus={() => setFocusedInput('address')}
                        onBlur={() => setFocusedInput(null)}
                        placeholder="Введите адрес доставки"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-total">
                      Итого: ${(pizza.basePrice * quantity).toFixed(2)}
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">
                        Оформить заказ
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOrderForm(false)}
                        className="cancel-btn"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                )}
              </div>
              {isAuthenticated && (
                <OrderProcess orderId={pizza._id} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PizzaDetail;

