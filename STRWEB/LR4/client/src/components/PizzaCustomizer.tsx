import React, { useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { handleImageError } from '../utils/imageUtils';
import './PizzaCustomizer.css';

interface Ingredient {
  _id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

interface BasePizza {
  _id: string;
  name: string;
  basePrice: number;
  image: string;
  description: string;
  isAvailable?: boolean;
}

interface PizzaState {
  basePizza: BasePizza | null;
  selectedIngredients: Ingredient[];
  totalPrice: number;
}

type PizzaAction =
  | { type: 'SET_BASE_PIZZA'; payload: BasePizza }
  | { type: 'ADD_INGREDIENT'; payload: Ingredient }
  | { type: 'REMOVE_INGREDIENT'; payload: string }
  | { type: 'RESET' };

const pizzaReducer = (state: PizzaState, action: PizzaAction): PizzaState => {
  switch (action.type) {
    case 'SET_BASE_PIZZA':
      const ingredientsTotal = state.selectedIngredients.reduce((sum, ing) => sum + ing.price, 0);
      return {
        ...state,
        basePizza: action.payload,
        totalPrice: action.payload.basePrice + ingredientsTotal
      };
    case 'ADD_INGREDIENT':
      if (state.selectedIngredients.find(ing => ing._id === action.payload._id)) {
        return state;
      }
      return {
        ...state,
        selectedIngredients: [...state.selectedIngredients, action.payload],
        totalPrice: state.totalPrice + action.payload.price
      };
    case 'REMOVE_INGREDIENT':
      const ingredient = state.selectedIngredients.find(ing => ing._id === action.payload);
      if (!ingredient) return state;
      return {
        ...state,
        selectedIngredients: state.selectedIngredients.filter(ing => ing._id !== action.payload),
        totalPrice: state.totalPrice - ingredient.price
      };
    case 'RESET':
      return {
        basePizza: null,
        selectedIngredients: [],
        totalPrice: 0
      };
    default:
      return state;
  }
};

function PizzaCustomizer() {
  const [state, dispatch] = useReducer(pizzaReducer, {
    basePizza: null,
    selectedIngredients: [],
    totalPrice: 0
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [pizzas, setPizzas] = useState<BasePizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showPizzaSelector, setShowPizzaSelector] = useState(true); // Show by default
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [hoveredIngredient, setHoveredIngredient] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ingredientsResponse, pizzasResponse] = await Promise.all([
          api.get('/ingredients'),
          api.get('/pizzas')
        ]);
        setIngredients(ingredientsResponse.data);
        const fetchedPizzas = pizzasResponse.data || [];
        console.log('Loaded pizzas:', fetchedPizzas.length);
        setPizzas(fetchedPizzas);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.response?.data?.error || 'Failed to load data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleIngredientSelect = (ingredient: Ingredient) => {
    dispatch({ type: 'ADD_INGREDIENT', payload: ingredient });
  };

  const handleIngredientRemove = (ingredientId: string) => {
    dispatch({ type: 'REMOVE_INGREDIENT', payload: ingredientId });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setShowOrderForm(false);
    setDeliveryAddress('');
    setShowPizzaSelector(true); // Show selector after reset
  };

  const handleBasePizzaSelect = (pizza: BasePizza) => {
    console.log('handleBasePizzaSelect called with:', pizza);
    try {
      dispatch({ type: 'SET_BASE_PIZZA', payload: pizza });
      setShowPizzaSelector(false);
      console.log('Pizza selected successfully');
    } catch (error) {
      console.error('Error selecting pizza:', error);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему для создания заказа');
      navigate('/login');
      return;
    }

    if (!state.basePizza) {
      alert('Пожалуйста, выберите базовую пиццу');
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Пожалуйста, введите адрес доставки');
      return;
    }

    try {
      const totalPrice = state.totalPrice;
      const response = await api.post('/orders', {
        items: [{
          pizza: state.basePizza._id,
          customIngredients: state.selectedIngredients.map(ing => ing._id),
          quantity: 1,
          price: totalPrice
        }],
        deliveryAddress
      });
      alert('Заказ успешно создан!');
      navigate('/orders');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка при создании заказа');
    }
  };

  const filteredIngredients = categoryFilter === 'all'
    ? ingredients
    : ingredients.filter(ing => ing.category === categoryFilter);

  if (loading) return <div className="loading">Загрузка ингредиентов...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pizza-customizer">
      <h2 className="customizer-title">Конструктор пиццы</h2>
      
      <div className="customizer-content">
        <div className="ingredients-panel">
          <div className="pizza-selector-section">
            <h3>Базовая пицца</h3>
            {!state.basePizza ? (
              <button 
                onClick={() => setShowPizzaSelector(!showPizzaSelector)}
                className="select-pizza-btn"
              >
                {showPizzaSelector ? 'Скрыть список' : 'Выбрать базовую пиццу'}
              </button>
            ) : (
              <div className="selected-base-pizza">
                <div className="base-pizza-info">
                  <strong>{state.basePizza.name}</strong>
                  <span className="base-pizza-price">${state.basePizza.basePrice.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setShowPizzaSelector(!showPizzaSelector)}
                  className="change-pizza-btn"
                >
                  Изменить
                </button>
              </div>
            )}
            
            {showPizzaSelector && (
              <div className="pizza-selector">
                {pizzas.length === 0 ? (
                  <div className="no-pizzas-message">
                    <p>Пиццы не найдены. Пожалуйста, попробуйте позже.</p>
                  </div>
                ) : (
                  pizzas
                    .filter(p => p.isAvailable !== false)
                    .map((pizza) => (
                      <div
                        key={pizza._id}
                        className={`pizza-option ${state.basePizza?._id === pizza._id ? 'selected' : ''}`}
                        onClick={() => {
                          console.log('Selecting pizza:', pizza.name);
                          handleBasePizzaSelect(pizza);
                        }}
                      >
                        <img 
                          src={pizza.image} 
                          alt={pizza.name} 
                          className="pizza-option-image"
                          onError={handleImageError}
                        />
                        <div className="pizza-option-info">
                          <div className="pizza-option-name">{pizza.name}</div>
                          <div className="pizza-option-price">${pizza.basePrice.toFixed(2)}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>

          <div className="filter-section">
            <label htmlFor="category-filter">Категория ингредиентов:</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="category-select"
            >
              <option value="all">Все</option>
              <option value="cheese">Сыры</option>
              <option value="meat">Мясо</option>
              <option value="vegetables">Овощи</option>
              <option value="sauce">Соусы</option>
              <option value="spices">Специи</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <div className="ingredients-grid">
            {filteredIngredients.map((ingredient) => (
              <div
                key={ingredient._id}
                className={`ingredient-card ${
                  state.selectedIngredients.find(ing => ing._id === ingredient._id) ? 'selected' : ''
                } ${hoveredIngredient === ingredient._id ? 'hovered' : ''}`}
                onClick={() => handleIngredientSelect(ingredient)}
                onMouseEnter={() => setHoveredIngredient(ingredient._id)}
                onMouseLeave={() => setHoveredIngredient(null)}
              >
                <div className="ingredient-name">{ingredient.name}</div>
                <div className="ingredient-price">${ingredient.price.toFixed(2)}</div>
                <div className="ingredient-category">{ingredient.category}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="custom-pizza-panel">
          <div className="selected-pizza">
            <h3>Ваша пицца</h3>
            {state.basePizza ? (
              <div className="pizza-preview">
                <div className="pizza-name">{state.basePizza.name}</div>
                <div className="pizza-image-container">
                  <img 
                    src={state.basePizza.image} 
                    alt={state.basePizza.name}
                    onError={handleImageError}
                  />
                </div>
                <div className="pizza-description">{state.basePizza.description}</div>
              </div>
            ) : (
              <div className="no-base-pizza">
                <p>Выберите базовую пиццу из списка слева</p>
                <p className="hint">Затем добавьте дополнительные ингредиенты</p>
              </div>
            )}

            <div className="selected-ingredients">
              <h4>Добавленные ингредиенты:</h4>
              {state.selectedIngredients.length === 0 ? (
                <p className="no-ingredients">Нет добавленных ингредиентов</p>
              ) : (
                <ul className="ingredients-list">
                  {state.selectedIngredients.map((ingredient) => (
                    <li key={ingredient._id} className="ingredient-item">
                      <span>{ingredient.name}</span>
                      <span className="ingredient-item-price">${ingredient.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleIngredientRemove(ingredient._id)}
                        className="remove-btn"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="total-price">
              <strong>Итого: ${state.totalPrice.toFixed(2)}</strong>
            </div>

            {state.basePizza && (
              <>
                {!showOrderForm ? (
                  <button 
                    onClick={() => setShowOrderForm(true)}
                    className="order-btn"
                    disabled={!isAuthenticated}
                  >
                    {isAuthenticated ? 'Оформить заказ' : 'Войдите для заказа'}
                  </button>
                ) : (
                  <form onSubmit={handleOrderSubmit} className="order-form">
                    <div className="form-group">
                      <label htmlFor="delivery-address">Адрес доставки:</label>
                      <input
                        id="delivery-address"
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        onFocus={() => {}}
                        onBlur={() => {}}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setShowOrderForm(false);
                          }
                        }}
                        placeholder="Введите адрес доставки"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-order-btn">
                        Подтвердить заказ
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOrderForm(false)}
                        className="cancel-order-btn"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            <button onClick={handleReset} className="reset-btn">
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PizzaCustomizer;

