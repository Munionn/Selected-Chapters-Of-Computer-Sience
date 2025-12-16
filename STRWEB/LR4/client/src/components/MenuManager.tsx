import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { handleImageError } from '../utils/imageUtils';
import './MenuManager.css';

interface Pizza {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: string;
  isAvailable: boolean;
  rating?: number;
}

interface Ingredient {
  _id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

const MenuManager = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pizzas' | 'ingredients'>('pizzas');
  const [editingItem, setEditingItem] = useState<Pizza | Ingredient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pizzas') {
        const response = await api.get('/pizzas');
        setPizzas(response.data);
      } else {
        const response = await api.get('/ingredients');
        setIngredients(response.data);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'pizzas' | 'ingredients') => {
    setActiveTab(tab);
    setEditingItem(null);
    setShowForm(false);
    setFormData({});
  };

  const handleEdit = (item: Pizza | Ingredient) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      return;
    }

    try {
      if (activeTab === 'pizzas') {
        await api.delete(`/pizzas/${id}`);
      } else {
        await api.delete(`/ingredients/${id}`);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'pizzas') {
        if (editingItem) {
          await api.put(`/pizzas/${editingItem._id}`, formData);
        } else {
          await api.post('/pizzas', formData);
        }
      } else {
        if (editingItem) {
          await api.put(`/ingredients/${editingItem._id}`, formData);
        } else {
          await api.post('/ingredients', formData);
        }
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePromoApply = () => {
    // Simulate promo application
    alert('Промо-акция применена!');
  };

  const handleFeedback = () => {
    // Simulate feedback submission
    alert('Спасибо за ваш отзыв!');
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="menu-manager">
      <h2 className="manager-title">Управление меню</h2>

      <div className="manager-tabs">
        <button
          className={`tab-btn ${activeTab === 'pizzas' ? 'active' : ''}`}
          onClick={() => handleTabChange('pizzas')}
        >
          Пиццы
        </button>
        <button
          className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
          onClick={() => handleTabChange('ingredients')}
        >
          Ингредиенты
        </button>
      </div>

      <div className="manager-actions">
        <button
          className="add-btn"
          onClick={() => {
            setEditingItem(null);
            setFormData({});
            setShowForm(true);
          }}
        >
          Добавить {activeTab === 'pizzas' ? 'пиццу' : 'ингредиент'}
        </button>
        <button className="promo-btn" onClick={handlePromoApply}>
          Применить промо
        </button>
        <button className="feedback-btn" onClick={handleFeedback}>
          Обратная связь
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingItem ? 'Редактировать' : 'Добавить'} {activeTab === 'pizzas' ? 'пиццу' : 'ингредиент'}</h3>
            <form onSubmit={handleFormSubmit}>
              {activeTab === 'pizzas' ? (
                <>
                  <div className="form-group">
                    <label>Название</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Описание</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Цена</label>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Изображение (URL)</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Категория</label>
                    <select
                      name="category"
                      value={formData.category || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Выберите категорию</option>
                      <option value="classic">Классическая</option>
                      <option value="premium">Премиум</option>
                      <option value="vegetarian">Вегетарианская</option>
                      <option value="spicy">Острая</option>
                      <option value="custom">Кастомная</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable !== false}
                        onChange={handleInputChange}
                      />
                      Доступна
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Название</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Категория</label>
                    <select
                      name="category"
                      value={formData.category || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Выберите категорию</option>
                      <option value="cheese">Сыр</option>
                      <option value="meat">Мясо</option>
                      <option value="vegetables">Овощи</option>
                      <option value="sauce">Соус</option>
                      <option value="spices">Специи</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Цена</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable !== false}
                        onChange={handleInputChange}
                      />
                      Доступен
                    </label>
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="submit" className="save-btn">Сохранить</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="items-list">
        {activeTab === 'pizzas' ? (
          <div className="items-grid">
            {pizzas.map((pizza) => (
              <div key={pizza._id} className="item-card">
                <img 
                  src={pizza.image} 
                  alt={pizza.name} 
                  className="item-image"
                  onError={handleImageError}
                />
                <div className="item-info">
                  <h4>{pizza.name}</h4>
                  <p className="item-description">{pizza.description}</p>
                  <div className="item-details">
                    <span className="item-price">${pizza.basePrice.toFixed(2)}</span>
                    <span className="item-category">{pizza.category}</span>
                    <span className={`item-status ${pizza.isAvailable ? 'available' : 'unavailable'}`}>
                      {pizza.isAvailable ? 'Доступна' : 'Недоступна'}
                    </span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(pizza)} className="edit-btn">
                      Редактировать
                    </button>
                    <button onClick={() => handleDelete(pizza._id)} className="delete-btn">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="items-table">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => (
                  <tr key={ingredient._id}>
                    <td>{ingredient.name}</td>
                    <td>{ingredient.category}</td>
                    <td>${ingredient.price.toFixed(2)}</td>
                    <td>
                      <span className={`item-status ${ingredient.isAvailable ? 'available' : 'unavailable'}`}>
                        {ingredient.isAvailable ? 'Доступен' : 'Недоступен'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(ingredient)} className="edit-btn">
                        Редактировать
                      </button>
                      <button onClick={() => handleDelete(ingredient._id)} className="delete-btn">
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManager;

