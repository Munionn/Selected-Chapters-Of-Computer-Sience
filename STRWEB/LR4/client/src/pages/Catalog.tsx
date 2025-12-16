import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TimeDisplay from '../components/TimeDisplay';
import { handleImageError } from '../utils/imageUtils';
import './Catalog.css';

interface Ingredient {
  _id: string;
  name: string;
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

function Catalog() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hoveredPizza, setHoveredPizza] = useState<string | null>(null);

  useEffect(() => {
    fetchPizzas();
  }, [sortBy, sortOrder, categoryFilter, searchTerm]);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const params: any = {
        sort: sortBy,
        order: sortOrder
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      const response = await api.get('/pizzas', { params });
      setPizzas(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load pizzas');
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchPizzas();
    }
  };

  if (loading) return <div className="loading">Загрузка каталога...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="catalog">
      <h1 className="catalog-title">Каталог пицц</h1>
      
      <TimeDisplay />

      <div className="catalog-filters">
        <div className="filter-group">
          <label htmlFor="search">Поиск:</label>
          <input
            id="search"
            type="text"
            placeholder="Название или описание..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category">Категория:</label>
          <select
            id="category"
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="filter-select"
          >
            <option value="all">Все</option>
            <option value="classic">Классические</option>
            <option value="premium">Премиум</option>
            <option value="vegetarian">Вегетарианские</option>
            <option value="spicy">Острые</option>
            <option value="custom">Кастомные</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort">Сортировка:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="filter-select"
          >
            <option value="name">По названию</option>
            <option value="basePrice">По цене</option>
            <option value="rating">По рейтингу</option>
            <option value="createdAt">По дате добавления</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="order">Порядок:</label>
          <select
            id="order"
            value={sortOrder}
            onChange={handleOrderChange}
            className="filter-select"
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
      </div>

      <div className="pizzas-grid">
        {pizzas.length === 0 ? (
          <p className="no-pizzas">Пиццы не найдены</p>
        ) : (
          pizzas.map((pizza) => (
            <Link 
              key={pizza._id} 
              to={`/pizza/${pizza._id}`} 
              className="pizza-card"
              onMouseEnter={() => setHoveredPizza(pizza._id)}
              onMouseLeave={() => setHoveredPizza(null)}
            >
              <div className="pizza-image-container">
                <img 
                  src={pizza.image} 
                  alt={pizza.name} 
                  className="pizza-image"
                  onError={handleImageError}
                />
                {!pizza.isAvailable && (
                  <div className="unavailable-badge">Недоступна</div>
                )}
              </div>
              <div className="pizza-info">
                <h3 className="pizza-name">{pizza.name}</h3>
                <p className="pizza-description">{pizza.description}</p>
                <div className="pizza-details">
                  <div className="pizza-ingredients">
                    {pizza.ingredients.slice(0, 3).map((ing) => ing.name).join(', ')}
                    {pizza.ingredients.length > 3 && '...'}
                  </div>
                  {pizza.rating && (
                    <div className="pizza-rating">⭐ {pizza.rating.toFixed(1)}</div>
                  )}
                </div>
                <div className="pizza-footer">
                  <div className="pizza-price">${pizza.basePrice.toFixed(2)}</div>
                  <div className="pizza-category">{pizza.category}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Catalog;

