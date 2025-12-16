import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import axios from 'axios';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate, AuthRequest } from '../middleware/auth';

const router: express.Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Local recipe generation (fallback when Gemini API is not available)
function generateLocalRecipe(ingredients: string[], type: 'recipe' | 'recommendation'): string {
  const ingredientList = ingredients.join(', ');
  
  if (type === 'recipe') {
    return `Рецепт пиццы с ингредиентами: ${ingredientList}

Ингредиенты для теста:
- 500г муки
- 7г сухих дрожжей
- 1 ч.л. соли
- 2 ст.л. оливкового масла
- 300мл теплой воды

Ингредиенты для начинки:
- ${ingredients.map(ing => `- ${ing}`).join('\n- ')}
- 200г моцареллы
- 100г томатного соуса
- Специи по вкусу

Инструкция:
1. Приготовьте тесто: смешайте муку, дрожжи и соль. Добавьте масло и воду, замесите тесто.
2. Оставьте тесто подниматься на 1 час в теплом месте.
3. Раскатайте тесто в круг диаметром 30-35см.
4. Намажьте томатный соус на основу.
5. Равномерно распределите ${ingredientList} по пицце.
6. Посыпьте моцареллой и специями.
7. Выпекайте в предварительно разогретой духовке при 220°C в течение 12-15 минут до золотистой корочки.

Приятного аппетита! 🍕`;
  } else {
    // Recommendation mode
    const complementaryIngredients = [
      'базилик', 'орегано', 'чеснок', 'оливковое масло', 
      'пармезан', 'руккола', 'черные оливки', 'каперсы'
    ];
    const suggestions = complementaryIngredients
      .filter(ing => !ingredients.some(provided => provided.toLowerCase().includes(ing.toLowerCase())))
      .slice(0, 3);
    
    return `Рекомендации для пиццы с ингредиентами: ${ingredientList}

Дополнительные ингредиенты, которые хорошо сочетаются:
${suggestions.map(ing => `- ${ing}`).join('\n')}

Советы:
- Используйте качественную моцареллу для лучшего вкуса
- Добавьте немного оливкового масла перед выпечкой для аромата
- Попробуйте добавить свежие травы (базилик, орегано) после выпечки
- Для более насыщенного вкуса используйте несколько видов сыра

Эти ингредиенты создадут сбалансированный и вкусный профиль вашей пиццы! 🍕`;
  }
}

// Google Vision AI - ingredient recognition
// @ts-ignore - Express middleware type compatibility issue
router.post('/vision/recognize', authenticate, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_VISION_API_KEY.trim() === '') {
      console.error('Google Vision API key is not configured');
      return res.status(503).json({ 
        error: 'Google Vision API не настроен на сервере. Пожалуйста, настройте GOOGLE_VISION_API_KEY в .env файле.' 
      });
    }
    
    const imageBase64 = req.file.buffer.toString('base64');

    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
        {
          requests: [{
            image: {
              content: imageBase64
            },
            features: [{
              type: 'LABEL_DETECTION',
              maxResults: 10
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Check if response has data
      if (!response.data || !response.data.responses || response.data.responses.length === 0) {
        return res.status(200).json({ ingredients: [] });
      }

      const labels = response.data.responses[0]?.labelAnnotations || [];
      const ingredients = labels
        .filter((label: any) => label.score > 0.7)
        .map((label: any) => label.description);

      res.json({ ingredients });
    } catch (apiError: any) {
      console.error('Google Vision API error:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message
      });
      
      // Handle specific Google Vision API errors
      if (apiError.response?.status === 400) {
        return res.status(400).json({ 
          error: 'Неверный формат изображения. Пожалуйста, загрузите другое изображение.' 
        });
      } else if (apiError.response?.status === 403) {
        const errorDetail = apiError.response?.data?.error?.message || apiError.response?.data?.error || '';
        
        // Check if it's a billing error
        if (errorDetail && errorDetail.includes('billing')) {
          // Extract project ID if available
          const projectMatch = errorDetail.match(/project #(\d+)/);
          const projectId = projectMatch ? projectMatch[1] : null;
          const billingUrl = projectId 
            ? `https://console.developers.google.com/billing/enable?project=${projectId}`
            : 'https://console.cloud.google.com/billing';
          
          return res.status(503).json({ 
            error: `Для использования Google Vision API необходимо включить биллинг в проекте Google Cloud.`,
            details: errorDetail,
            billingUrl: billingUrl,
            hint: 'Google предоставляет бесплатный кредит $300 на 90 дней и бесплатный лимит 1000 запросов в месяц.'
          });
        }
        
        return res.status(503).json({ 
          error: `Google Vision API ключ недействителен или не имеет доступа. ${errorDetail ? `Детали: ${errorDetail}` : 'Проверьте настройки API ключа в Google Cloud Console.'}` 
        });
      } else if (apiError.response?.status === 429) {
        return res.status(503).json({ 
          error: 'Превышен лимит запросов к Google Vision API. Попробуйте позже.' 
        });
      } else if (!apiError.response) {
        // Network error or no response
        return res.status(503).json({ 
          error: 'Не удалось подключиться к Google Vision API. Проверьте интернет-соединение и настройки API ключа.' 
        });
      } else {
        return res.status(500).json({ 
          error: apiError.response?.data?.error?.message || 'Ошибка при обращении к Google Vision API. Проверьте настройки и попробуйте позже.' 
        });
      }
    }
  } catch (error: any) {
    console.error('Vision recognition error:', error);
    res.status(500).json({ 
      error: error.message || 'Ошибка при обработке изображения' 
    });
  }
});

// Gemini API - recipe generation and recommendations
// @ts-ignore - Express middleware type compatibility issue
router.post('/openai/recipe', authenticate, [
  body('ingredients').isArray({ min: 1 }),
  body('type').optional().isIn(['recipe', 'recommendation'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ingredients, type = 'recipe' } = req.body;

    // Generate prompt based on type
    const prompt = type === 'recipe'
      ? `Создай рецепт пиццы используя эти ингредиенты: ${ingredients.join(', ')}. Предоставь детальный рецепт с пошаговыми инструкциями на русском языке.`
      : `Рекомендуй рецепт пиццы на основе этих ингредиентов: ${ingredients.join(', ')}. Предложи дополнительные ингредиенты, которые хорошо сочетаются, и объясни почему на русском языке.`;

    // Check if Gemini API key is configured
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const geminiModel = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'; // Default to Gemini 2.0 Flash Experimental

    if (!geminiKey) {
      // Fallback: Generate recipe locally without AI API
      const content = generateLocalRecipe(ingredients, type);
      return res.json({ 
        type,
        ingredients,
        content,
        source: 'local'
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: geminiModel });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text() || 'Не удалось сгенерировать контент';

      return res.json({ 
        type,
        ingredients,
        content,
        source: 'gemini'
      });
    } catch (geminiError: any) {
      // If Gemini API fails, fallback to local generation
      const errorMessage = geminiError.message || '';
      console.warn('Gemini API error, using local fallback:', errorMessage);
      
      // Handle specific Gemini API errors
      if (errorMessage.includes('quota') || errorMessage.includes('Quota')) {
        const content = generateLocalRecipe(ingredients, type);
        return res.json({ 
          type,
          ingredients,
          content,
          source: 'local',
          warning: 'Превышен лимит запросов к Gemini API. Используется локальная генерация.'
        });
      }
      
      // Handle location not supported error
      if (errorMessage.includes('location is not supported') || errorMessage.includes('User location is not supported')) {
        const content = generateLocalRecipe(ingredients, type);
        return res.json({ 
          type,
          ingredients,
          content,
          source: 'local',
          warning: 'Ваша локация не поддерживается для использования Gemini API. Используется локальная генерация.'
        });
      }
      
      // Handle network errors
      if (errorMessage.includes('fetch failed') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        const content = generateLocalRecipe(ingredients, type);
        return res.json({ 
          type,
          ingredients,
          content,
          source: 'local',
          warning: 'Ошибка подключения к Gemini API. Проверьте интернет-соединение. Используется локальная генерация.'
        });
      }
      
      // Handle API key errors
      if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('401') || errorMessage.includes('403')) {
        const content = generateLocalRecipe(ingredients, type);
        return res.json({ 
          type,
          ingredients,
          content,
          source: 'local',
          warning: 'Ошибка аутентификации Gemini API. Проверьте API ключ. Используется локальная генерация.'
        });
      }
      
      // Generic fallback
      const content = generateLocalRecipe(ingredients, type);
      return res.json({ 
        type,
        ingredients,
        content,
        source: 'local'
      });
    }

  } catch (error: any) {
    console.error('Gemini API error:', error.response?.data || error.message);
    
    // Final fallback - return local generation
    const content = generateLocalRecipe(req.body.ingredients || [], req.body.type || 'recipe');
    return res.json({ 
      type: req.body.type || 'recipe',
      ingredients: req.body.ingredients || [],
      content,
      source: 'local'
    });
  }
});

export default router;

