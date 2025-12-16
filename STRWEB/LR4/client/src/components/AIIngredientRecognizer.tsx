import React, { useState } from 'react';
import api from '../services/api';
import './AIIngredientRecognizer.css';

/**
 * AI Ingredient Recognizer Component
 * 
 * Uses Google Vision API to recognize ingredients from uploaded images.
 * Demonstrates AI API integration on the frontend.
 * 
 * Features:
 * - Image upload with preview
 * - Google Vision API integration
 * - Ingredient recognition and display
 * - Error handling
 */
const AIIngredientRecognizer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [recognizedIngredients, setRecognizedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setRecognizedIngredients([]);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecognize = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setLoading(true);
    setError(null);
    setRecognizedIngredients([]);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await api.post('/ai/vision/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setRecognizedIngredients(response.data.ingredients || []);
    } catch (err: any) {
      console.error('Recognition error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 503) {
        const errorData = err.response?.data || {};
        const errorMsg = errorData.error || 'Google Vision API не настроен на сервере';
        
        // Check if it's a billing error
        if (errorData.details && errorData.details.includes('billing')) {
          setError(errorMsg);
          setErrorDetails({
            billingUrl: errorData.billingUrl,
            hint: errorData.hint
          });
        } else {
          setError(errorMsg);
          setErrorDetails(null);
        }
      } else if (err.response?.status === 401) {
        setError('Требуется авторизация. Пожалуйста, войдите в систему.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Неверный формат изображения. Пожалуйста, выберите другое изображение.');
      } else if (err.response?.status === 500) {
        setError(err.response?.data?.error || 'Ошибка сервера при обработке изображения. Попробуйте другое изображение или обратитесь к администратору.');
      } else {
        setError(err.response?.data?.error || 'Ошибка при распознавании ингредиентов. Попробуйте другое изображение.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setRecognizedIngredients([]);
    setError(null);
    setErrorDetails(null);
  };

  return (
    <div className="ai-ingredient-recognizer">
      <h3 className="recognizer-title">🔍 Распознавание ингредиентов по фото</h3>
      <p className="recognizer-description">
        Загрузите фото ингредиентов, и AI определит, что на изображении
      </p>

      <div className="recognizer-content">
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="image-upload" className="file-input-label">
              {selectedFile ? 'Изменить фото' : 'Выбрать фото'}
            </label>
          </div>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" className="preview-image" />
              <button onClick={handleReset} className="reset-image-btn">
                ✕ Удалить
              </button>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={handleRecognize}
              disabled={loading}
              className="recognize-btn"
            >
              {loading ? 'Распознавание...' : 'Распознать ингредиенты'}
            </button>
          )}
        </div>

        {error && (
          <div className="recognizer-error">
            <strong>⚠️ Ошибка:</strong> {error}
            {error.includes('не настроен') && (
              <div className="error-hint">
                <p>Для работы этой функции необходимо:</p>
                <ul>
                  <li>Настроить GOOGLE_VISION_API_KEY в файле server/.env</li>
                  <li>Перезапустить сервер после настройки</li>
                  <li>Подробные инструкции: см. файл <code>GOOGLE_VISION_SETUP.md</code></li>
                </ul>
              </div>
            )}
            {(error.includes('биллинг') || errorDetails?.billingUrl) && (
              <div className="error-hint">
                <p><strong>Для использования Google Vision API необходимо включить биллинг:</strong></p>
                <ol>
                  <li>
                    Перейдите в{' '}
                    <a 
                      href={errorDetails?.billingUrl || 'https://console.cloud.google.com/billing'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#4A90E2', textDecoration: 'underline' }}
                    >
                      Google Cloud Console - Billing
                    </a>
                  </li>
                  <li>Выберите ваш проект</li>
                  <li>Нажмите "Link a billing account" и следуйте инструкциям</li>
                  <li>Подождите несколько минут после включения</li>
                </ol>
                {errorDetails?.hint && (
                  <p style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
                    <strong>💡 {errorDetails.hint}</strong>
                  </p>
                )}
                {!errorDetails?.hint && (
                  <p style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
                    <strong>💡 Не волнуйтесь:</strong> Google предоставляет бесплатный кредит $300 на 90 дней и бесплатный лимит 1000 запросов в месяц!
                  </p>
                )}
                <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                  Подробные инструкции: см. файл <code>GOOGLE_VISION_SETUP.md</code>
                </p>
              </div>
            )}
          </div>
        )}

        {recognizedIngredients.length > 0 && (
          <div className="recognized-ingredients">
            <h4>Распознанные ингредиенты:</h4>
            <div className="ingredients-list">
              {recognizedIngredients.map((ingredient, index) => (
                <span key={index} className="ingredient-tag">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>AI анализирует изображение...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIIngredientRecognizer;

