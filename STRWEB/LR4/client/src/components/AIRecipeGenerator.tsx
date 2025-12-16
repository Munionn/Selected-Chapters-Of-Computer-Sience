import React, { useState } from 'react';
import api from '../services/api';
import './AIRecipeGenerator.css';

/**
 * AI Recipe Generator Component
 * 
 * Uses Google Gemini API to generate pizza recipes and recommendations based on ingredients.
 * Demonstrates AI API integration on the frontend.
 * 
 * Features:
 * - Input ingredients list
 * - Recipe generation mode
 * - Recommendation mode
 * - Real-time AI-generated content
 */
const AIRecipeGenerator: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeType, setRecipeType] = useState<'recipe' | 'recommendation'>('recipe');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingredient));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Добавьте хотя бы один ингредиент');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await api.post('/ai/openai/recipe', {
        ingredients,
        type: recipeType
      });

      const content = response.data.content || 'Не удалось сгенерировать контент';
      setGeneratedContent(content);
    } catch (err: any) {
      console.error('Generation error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 503) {
        const errorMsg = err.response?.data?.error || 'Gemini API не настроен на сервере';
        setError(errorMsg + '. Пожалуйста, настройте Gemini API ключ. См. GEMINI_SETUP.md для инструкций.');
      } else if (err.response?.status === 401) {
        setError('Требуется авторизация. Пожалуйста, войдите в систему.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Неверный запрос. Проверьте введенные данные.');
      } else {
        setError(err.response?.data?.error || 'Ошибка при генерации рецепта. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setGeneratedContent(null);
    setError(null);
    setNewIngredient('');
  };

  return (
    <div className="ai-recipe-generator">
      <h3 className="generator-title">🤖 Генератор рецептов AI</h3>
      <p className="generator-description">
        Введите ингредиенты, и AI создаст рецепт пиццы или даст рекомендации
      </p>

      <div className="generator-content">
        <div className="ingredients-input-section">
          <form onSubmit={handleAddIngredient} className="ingredient-form">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Введите ингредиент..."
              className="ingredient-input"
            />
            <button type="submit" className="add-ingredient-btn">
              Добавить
            </button>
          </form>

          {ingredients.length > 0 && (
            <div className="ingredients-list">
              <h4>Ингредиенты:</h4>
              <div className="ingredients-tags">
                {ingredients.map((ingredient, index) => (
                  <span key={index} className="ingredient-tag">
                    {ingredient}
                    <button
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="remove-tag-btn"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="generation-controls">
          <div className="type-selector">
            <label>
              <input
                type="radio"
                value="recipe"
                checked={recipeType === 'recipe'}
                onChange={(e) => setRecipeType(e.target.value as 'recipe' | 'recommendation')}
              />
              Генерация рецепта
            </label>
            <label>
              <input
                type="radio"
                value="recommendation"
                checked={recipeType === 'recommendation'}
                onChange={(e) => setRecipeType(e.target.value as 'recipe' | 'recommendation')}
              />
              Рекомендации
            </label>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleGenerate}
              disabled={loading || ingredients.length === 0}
              className="generate-btn"
            >
              {loading ? 'Генерация...' : recipeType === 'recipe' ? 'Сгенерировать рецепт' : 'Получить рекомендации'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="reset-btn"
            >
              Сбросить
            </button>
          </div>
        </div>

        {error && (
          <div className="generator-error">
            <strong>⚠️ Ошибка:</strong> {error}
            {error.includes('не настроен') && (
              <div className="error-hint">
                <p>Для работы этой функции необходимо:</p>
                <ul>
                  <li>Настроить GEMINI_API_KEY в файле server/.env</li>
                  <li>Перезапустить сервер после настройки</li>
                  <li>См. GEMINI_SETUP.md для подробных инструкций</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>AI генерирует {recipeType === 'recipe' ? 'рецепт' : 'рекомендации'}...</p>
          </div>
        )}

        {generatedContent && (
          <div className="generated-content">
            <h4>{recipeType === 'recipe' ? 'Сгенерированный рецепт:' : 'Рекомендации:'}</h4>
            <div className="content-text">
              {generatedContent.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecipeGenerator;

