import React, { useState } from 'react';
import { processOrder } from '../utils/asyncOperations';
import './OrderProcess.css';

interface OrderProcessProps {
  orderId: string;
  onComplete?: () => void;
}

/**
 * OrderProcess Component
 * 
 * Demonstrates default props using two approaches:
 * 1. Default parameter values in function signature (ES6+ approach)
 * 2. defaultProps static property (classic React approach)
 * 
 * @param orderId - Required: The ID of the order to process
 * @param onComplete - Optional: Callback function executed after order processing completes
 *                     Default value: empty function () => {}
 */
const OrderProcess: React.FC<OrderProcessProps> = ({ orderId, onComplete = () => {} } : OrderProcessProps) => {
  const [currentStep, setCurrentStep] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartProcess = async () => {
    setIsProcessing(true);
    setError(null);
    setCurrentStep('Начало обработки заказа...');

    try {
      await processOrder(orderId, (step: string) => {
        setCurrentStep(step);
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обработки');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { key: 'ingredients', label: 'Проверка ингредиентов' },
    { key: 'preparing', label: 'Приготовление' },
    { key: 'packaging', label: 'Упаковка' },
    { key: 'delivery', label: 'Доставка' }
  ];

  const getStepStatus = (stepLabel: string) => {
    if (!currentStep) return 'pending';
    if (currentStep.includes(stepLabel)) return 'active';
    if (currentStep === 'Заказ доставлен!') return 'completed';
    const stepIndex = steps.findIndex(s => currentStep.includes(s.label));
    const currentIndex = steps.findIndex(s => stepLabel === s.label);
    return currentIndex <= stepIndex ? 'completed' : 'pending';
  };

  return (
    <div className="order-process">
      <h3>Процесс обработки заказа</h3>
      {!isProcessing && !currentStep && (
        <button onClick={handleStartProcess} className="start-process-btn">
          Начать обработку заказа
        </button>
      )}

      {isProcessing && (
        <div className="process-steps">
          {steps.map((step, index) => {
            const status = getStepStatus(step.label);
            return (
              <div key={step.key} className={`process-step ${status}`}>
                <div className="step-number">{index + 1}</div>
                <div className="step-label">{step.label}</div>
                {status === 'active' && <div className="step-spinner"></div>}
              </div>
            );
          })}
        </div>
      )}

      {currentStep && (
        <div className="current-step">
          <p>{currentStep}</p>
        </div>
      )}

      {error && (
        <div className="process-error">
          {error}
        </div>
      )}
    </div>
  );
};

// Default props using defaultProps (classic React approach)
OrderProcess.defaultProps = {
  onComplete: () => {}
};

export default OrderProcess;

