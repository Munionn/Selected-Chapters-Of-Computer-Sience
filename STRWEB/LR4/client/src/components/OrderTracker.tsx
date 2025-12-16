import React, { Component } from 'react';
import api from '../services/api';
import './OrderTracker.css';

interface OrderItem {
  pizza: {
    _id: string;
    name: string;
    image: string;
  };
  customIngredients?: Array<{
    _id: string;
    name: string;
  }>;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'packaging' | 'delivering' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  courierLocation?: {
    lat: number;
    lng: number;
  };
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface OrderTrackerState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  trackingInterval: number | null;
  user: User | null;
}

class OrderTracker extends Component<{}, OrderTrackerState> {
  private trackingTimer: NodeJS.Timeout | null = null;
  private cancellationTimer: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      orders: [],
      loading: true,
      error: null,
      selectedOrder: null,
      trackingInterval: null,
      user: null
    };
  }

  componentDidMount() {
    this.fetchUser();
    this.fetchOrders();
    this.startTracking();
  }

  componentWillUnmount() {
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
    }
    if (this.cancellationTimer) {
      clearTimeout(this.cancellationTimer);
    }
  }

  fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.user) {
        this.setState({ user: response.data.user });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      this.setState({ orders: response.data, loading: false });
    } catch (error: any) {
      this.setState({ 
        error: error.response?.data?.error || 'Failed to load orders',
        loading: false 
      });
    }
  };

  startTracking = () => {
    // Track orders every 5 seconds
    this.trackingTimer = setInterval(() => {
      this.updateOrderStatuses();
    }, 5000);

    // Auto-cancel pending orders after 30 minutes
    this.cancellationTimer = setTimeout(() => {
      this.autoCancelPendingOrders();
    }, 30 * 60 * 1000);
  };

  updateOrderStatuses = async () => {
    try {
      const response = await api.get('/orders');
      const orders = response.data;
      
      // Update courier locations for delivering orders
      const deliveringOrders = orders.filter((order: Order) => order.status === 'delivering');
      
      for (const order of deliveringOrders) {
        await this.updateCourierLocation(order._id);
      }

      this.setState({ orders });
    } catch (error) {
      console.error('Failed to update order statuses:', error);
    }
  };

  updateCourierLocation = async (orderId: string) => {
    try {
      // Simulate courier location update
      const lat = 55.7558 + (Math.random() - 0.5) * 0.01;
      const lng = 37.6173 + (Math.random() - 0.5) * 0.01;
      
      await api.patch(`/orders/${orderId}/location`, { lat, lng });
    } catch (error) {
      console.error('Failed to update courier location:', error);
    }
  };

  autoCancelPendingOrders = async () => {
    const pendingOrders = this.state.orders.filter(
      order => order.status === 'pending'
    );

    // Save cancellation timer state to localStorage
    const timerState = {
      startTime: Date.now(),
      pendingOrders: pendingOrders.map(o => o._id)
    };
    localStorage.setItem('cancellationTimer', JSON.stringify(timerState));

    for (const order of pendingOrders) {
      try {
        await api.patch(`/orders/${order._id}/status`, { status: 'cancelled' });
      } catch (error) {
        console.error('Failed to cancel order:', error);
      }
    }

    localStorage.removeItem('cancellationTimer');
    this.fetchOrders();
  };

  handleOrderSelect = (order: Order) => {
    this.setState({ selectedOrder: order });
  };

  handleCancelOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
      this.fetchOrders();
      if (this.state.selectedOrder?._id === orderId) {
        this.setState({ selectedOrder: null });
      }
    } catch (error: any) {
      alert(error instanceof Error ? error.message : 'Failed to cancel order');
    }
  };

  handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      this.fetchOrders();
      if (this.state.selectedOrder?._id === orderId) {
        this.setState({ selectedOrder: null });
      }
    } catch (error: any) {
      alert(error.response?.data?.error || error instanceof Error ? error.message : 'Failed to delete order');
    }
  };

  getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      packaging: '#ec4899',
      delivering: '#10b981',
      delivered: '#059669',
      cancelled: '#ef4444'
    };
    return statusColors[status] || '#6b7280';
  };

  getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтвержден',
      preparing: 'Готовится',
      packaging: 'Упаковывается',
      delivering: 'Доставляется',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    return labels[status] || status;
  };

  formatDate = (dateString: string, timezone: string = 'UTC') => {
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

  render() {
    const { orders, loading, error, selectedOrder, user } = this.state;

    if (loading) {
      return <div className="loading">Загрузка заказов...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    return (
      <div className="order-tracker">
        <h2 className="tracker-title">Отслеживание заказов</h2>

        <div className="tracker-content">
          <div className="orders-list">
            <h3>Ваши заказы</h3>
            {orders.length === 0 ? (
              <p className="no-orders">У вас пока нет заказов</p>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                    onClick={() => this.handleOrderSelect(order)}
                  >
                    <div className="order-header">
                      <span className="order-id">Заказ #{order._id.slice(-6)}</span>
                      <span
                        className="order-status"
                        style={{ backgroundColor: this.getStatusColor(order.status) }}
                      >
                        {this.getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="order-info">
                      <div className="order-items-count">
                        {order.items.length} {order.items.length === 1 ? 'пицца' : 'пицц'}
                      </div>
                      <div className="order-total">${order.totalPrice.toFixed(2)}</div>
                    </div>
                    <div className="order-dates">
                      <div>Создан: {this.formatDate(order.createdAt, Intl.DateTimeFormat().resolvedOptions().timeZone)}</div>
                      <div>UTC: {this.formatDate(order.createdAt, 'UTC')}</div>
                    </div>
                    <div className="order-actions">
                      {order.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handleCancelOrder(order._id);
                          }}
                          className="cancel-order-btn"
                        >
                          Отменить
                        </button>
                      )}
                      {(user?.role === 'admin' || (order.status === 'cancelled' && user?.role === 'user')) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handleDeleteOrder(order._id);
                          }}
                          className="delete-order-btn"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedOrder && (
            <div className="order-details">
              <h3>Детали заказа</h3>
              <div className="detail-section">
                <h4>Статус</h4>
                <div
                  className="status-badge"
                  style={{ backgroundColor: this.getStatusColor(selectedOrder.status) }}
                >
                  {this.getStatusLabel(selectedOrder.status)}
                </div>
              </div>

              <div className="detail-section">
                <h4>Пиццы</h4>
                <div className="order-items">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.pizza.image} alt={item.pizza.name} className="item-image" />
                      <div className="item-info">
                        <div className="item-name">{item.pizza.name}</div>
                        {item.customIngredients && item.customIngredients.length > 0 && (
                          <div className="item-ingredients">
                            Дополнительно: {item.customIngredients.map(ing => ing.name).join(', ')}
                          </div>
                        )}
                        <div className="item-quantity">Количество: {item.quantity}</div>
                        <div className="item-price">${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Адрес доставки</h4>
                <p>{selectedOrder.deliveryAddress}</p>
              </div>

              {selectedOrder.courierLocation && (
                <div className="detail-section">
                  <h4>Местоположение курьера</h4>
                  <p>
                    Широта: {selectedOrder.courierLocation.lat.toFixed(4)}, 
                    Долгота: {selectedOrder.courierLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}

              {selectedOrder.estimatedDeliveryTime && (
                <div className="detail-section">
                  <h4>Ожидаемое время доставки</h4>
                  <p>{this.formatDate(selectedOrder.estimatedDeliveryTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}</p>
                </div>
              )}

              <div className="detail-section">
                <h4>Общая сумма</h4>
                <div className="total-amount">${selectedOrder.totalPrice.toFixed(2)}</div>
              </div>

              <div className="detail-section">
                <h4>Даты</h4>
                <div className="dates-info">
                  <div>Создан (локально): {this.formatDate(selectedOrder.createdAt, Intl.DateTimeFormat().resolvedOptions().timeZone)}</div>
                  <div>Создан (UTC): {this.formatDate(selectedOrder.createdAt, 'UTC')}</div>
                  <div>Обновлен (локально): {this.formatDate(selectedOrder.updatedAt, Intl.DateTimeFormat().resolvedOptions().timeZone)}</div>
                  <div>Обновлен (UTC): {this.formatDate(selectedOrder.updatedAt, 'UTC')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default OrderTracker;

