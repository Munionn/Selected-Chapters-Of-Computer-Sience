import React, { useState } from 'react';
import PizzaCustomizer from '../components/PizzaCustomizer';
import TimeDisplay from '../components/TimeDisplay';
import AIIngredientRecognizer from '../components/AIIngredientRecognizer';
import AIRecipeGenerator from '../components/AIRecipeGenerator';
import './Customizer.css';

function Customizer() {
  const [activeTab, setActiveTab] = useState<'customizer' | 'vision' | 'recipe'>('customizer');

  return (
    <div className="customizer-page">
      <TimeDisplay />
      
      <div className="customizer-tabs">
        <button
          className={`tab-btn ${activeTab === 'customizer' ? 'active' : ''}`}
          onClick={() => setActiveTab('customizer')}
        >
          🍕 Конструктор пиццы
        </button>
        <button
          className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`}
          onClick={() => setActiveTab('vision')}
        >
          🔍 Распознавание ингредиентов
        </button>
        <button
          className={`tab-btn ${activeTab === 'recipe' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipe')}
        >
          🤖 Генератор рецептов
        </button>
      </div>

      <div className="customizer-content">
        {activeTab === 'customizer' && <PizzaCustomizer />}
        {activeTab === 'vision' && <AIIngredientRecognizer />}
        {activeTab === 'recipe' && <AIRecipeGenerator />}
      </div>
    </div>
  );
}

export default Customizer;

