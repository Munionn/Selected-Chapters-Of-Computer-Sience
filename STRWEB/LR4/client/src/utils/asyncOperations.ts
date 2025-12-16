// Utility functions demonstrating async operations

// Promise-based order process chain
export const processOrder = async (
  orderId: string,
  onProgress?: (step: string) => void
): Promise<void> => {
  try {
    // Step 1: Check ingredients
    onProgress?.('Проверка ингредиентов...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Preparation
    onProgress?.('Приготовление пиццы...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Packaging
    onProgress?.('Упаковка заказа...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 4: Delivery
    onProgress?.('Доставка...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onProgress?.('Заказ доставлен!');
  } catch (error) {
    throw new Error('Ошибка при обработке заказа');
  }
};

// Parallel API requests using Promise.all
export const fetchMultipleResources = async <T>(
  urls: string[]
): Promise<T[]> => {
  try {
    const responses = await Promise.all(
      urls.map(url => fetch(url).then(res => res.json()))
    );
    return responses;
  } catch (error) {
    throw new Error('Ошибка при загрузке данных');
  }
};

// XMLHttpRequest with progress tracking
export const uploadWithProgress = (
  file: File,
  url: string,
  onProgress?: (progress: number) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress?.(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', url);
    xhr.send(formData);
  });
};

// Timer with localStorage persistence
export class PersistentTimer {
  private timerId: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private duration: number;
  private key: string;

  constructor(key: string, duration: number) {
    this.key = key;
    this.duration = duration;
    this.loadState();
  }

  private loadState(): void {
    const saved = localStorage.getItem(this.key);
    if (saved) {
      const state = JSON.parse(saved);
      const elapsed = Date.now() - state.startTime;
      if (elapsed < this.duration) {
        this.startTime = state.startTime;
        const remaining = this.duration - elapsed;
        this.start(remaining);
      }
    }
  }

  private saveState(): void {
    localStorage.setItem(this.key, JSON.stringify({
      startTime: this.startTime,
      duration: this.duration
    }));
  }

  start(remaining?: number): void {
    this.startTime = Date.now();
    this.saveState();
    
    const timeout = remaining || this.duration;
    this.timerId = setTimeout(() => {
      this.onComplete();
      this.clear();
    }, timeout);
  }

  clear(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    localStorage.removeItem(this.key);
  }

  protected onComplete(): void {
    // Override in subclass
  }
}

// Auto-hide notification with setTimeout
export const showNotification = (
  message: string,
  duration: number = 3000
): void => {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-red);
    color: white;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);
};

