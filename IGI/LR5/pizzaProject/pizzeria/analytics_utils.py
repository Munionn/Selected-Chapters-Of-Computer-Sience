import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import List, Dict, Union, Tuple
from .models import Order, OrderItem, Pizza, Customer, Review

def generate_analytics_plots(
    start_date: datetime,
    end_date: datetime,
    save_path: str = None
) -> Dict[str, Union[str, plt.Figure]]:
    """
    Генерирует набор аналитических графиков для пиццерии
    
    Args:
        start_date (datetime): Начальная дата для анализа
        end_date (datetime): Конечная дата для анализа
        save_path (str, optional): Путь для сохранения графиков. По умолчанию None.
    
    Returns:
        Dict[str, Union[str, plt.Figure]]: Словарь с графиками и их описаниями
    """
    
    # Подготовка данных
    orders = Order.objects.filter(
        created_at__range=(start_date, end_date),
        status='completed'
    ).select_related('customer')
    
    order_items = OrderItem.objects.filter(
        order__in=orders
    ).select_related('pizza', 'size')
    
    # 1. График продаж по дням
    def plot_daily_sales() -> plt.Figure:
        daily_sales = pd.DataFrame(
            list(orders.values('created_at', 'total_price'))
        )
        daily_sales['date'] = daily_sales['created_at'].dt.date
        daily_sales = daily_sales.groupby('date')['total_price'].sum().reset_index()
        
        fig, ax = plt.subplots(figsize=(12, 6))
        sns.lineplot(data=daily_sales, x='date', y='total_price', ax=ax)
        ax.set_title('Динамика продаж по дням')
        ax.set_xlabel('Дата')
        ax.set_ylabel('Сумма продаж (BYN)')
        plt.xticks(rotation=45)
        plt.tight_layout()
        return fig
    
    # 2. Круговая диаграмма популярности пицц
    def plot_pizza_popularity() -> plt.Figure:
        pizza_counts = (
            order_items.values('pizza__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        fig = go.Figure(data=[go.Pie(
            labels=[item['pizza__name'] for item in pizza_counts],
            values=[item['count'] for item in pizza_counts],
            hole=.3
        )])
        fig.update_layout(title='Популярность пицц')
        return fig
    
    # 3. График среднего чека по часам
    def plot_average_check_by_hour() -> plt.Figure:
        hourly_avg = pd.DataFrame(
            list(orders.values('created_at', 'total_price'))
        )
        hourly_avg['hour'] = hourly_avg['created_at'].dt.hour
        hourly_avg = hourly_avg.groupby('hour')['total_price'].mean().reset_index()
        
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.barplot(data=hourly_avg, x='hour', y='total_price', ax=ax)
        ax.set_title('Средний чек по часам')
        ax.set_xlabel('Час')
        ax.set_ylabel('Средний чек (BYN)')
        plt.tight_layout()
        return fig
    
    # 4. Тепловая карта заказов по дням недели и часам
    def plot_orders_heatmap() -> plt.Figure:
        orders_df = pd.DataFrame(
            list(orders.values('created_at'))
        )
        orders_df['weekday'] = orders_df['created_at'].dt.day_name()
        orders_df['hour'] = orders_df['created_at'].dt.hour
        
        pivot_table = pd.crosstab(orders_df['weekday'], orders_df['hour'])
        
        plt.figure(figsize=(12, 8))
        sns.heatmap(pivot_table, cmap='YlOrRd', annot=True, fmt='d')
        plt.title('Распределение заказов по дням недели и часам')
        plt.xlabel('Час')
        plt.ylabel('День недели')
        plt.tight_layout()
        return plt.gcf()
    
    # 5. График распределения размеров пицц
    def plot_size_distribution() -> plt.Figure:
        size_dist = (
            order_items.values('size__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        fig, ax = plt.subplots(figsize=(8, 6))
        sns.barplot(
            x=[item['size__name'] for item in size_dist],
            y=[item['count'] for item in size_dist],
            ax=ax
        )
        ax.set_title('Распределение размеров заказанных пицц')
        ax.set_xlabel('Размер')
        ax.set_ylabel('Количество заказов')
        plt.xticks(rotation=45)
        plt.tight_layout()
        return fig
    
    # 6. График рейтингов пицц
    def plot_pizza_ratings() -> plt.Figure:
        ratings = Review.objects.filter(
            created_at__range=(start_date, end_date)
        ).values('pizza__name').annotate(
            avg_rating=Avg('rating'),
            count=Count('id')
        ).order_by('-avg_rating')
        
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=[r['pizza__name'] for r in ratings],
            y=[r['avg_rating'] for r in ratings],
            name='Средний рейтинг',
            text=[f"{r['avg_rating']:.2f}" for r in ratings],
            textposition='auto',
        ))
        fig.add_trace(go.Scatter(
            x=[r['pizza__name'] for r in ratings],
            y=[r['count'] for r in ratings],
            name='Количество отзывов',
            yaxis='y2'
        ))
        
        fig.update_layout(
            title='Рейтинги пицц и количество отзывов',
            yaxis=dict(title='Средний рейтинг'),
            yaxis2=dict(title='Количество отзывов', overlaying='y', side='right')
        )
        return fig
    
    # Генерация всех графиков
    plots = {
        'daily_sales': plot_daily_sales(),
        'pizza_popularity': plot_pizza_popularity(),
        'average_check_by_hour': plot_average_check_by_hour(),
        'orders_heatmap': plot_orders_heatmap(),
        'size_distribution': plot_size_distribution(),
        'pizza_ratings': plot_pizza_ratings()
    }
    
    # Сохранение графиков если указан путь
    if save_path:
        for name, fig in plots.items():
            if isinstance(fig, plt.Figure):
                fig.savefig(f"{save_path}/{name}.png")
            else:  # Для plotly графиков
                fig.write_image(f"{save_path}/{name}.png")
    
    return plots

def generate_customer_analytics(customer_id: int) -> Dict[str, plt.Figure]:
    """
    Генерирует аналитику по конкретному клиенту
    
    Args:
        customer_id (int): ID клиента
    
    Returns:
        Dict[str, plt.Figure]: Словарь с графиками
    """
    customer = Customer.objects.get(id=customer_id)
    customer_orders = Order.objects.filter(
        customer=customer,
        status='completed'
    ).order_by('created_at')
    
    # 1. История заказов клиента
    def plot_customer_order_history() -> plt.Figure:
        orders_df = pd.DataFrame(
            list(customer_orders.values('created_at', 'total_price'))
        )
        
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.scatterplot(
            data=orders_df,
            x='created_at',
            y='total_price',
            ax=ax
        )
        sns.regplot(
            data=orders_df,
            x='created_at',
            y='total_price',
            scatter=False,
            ax=ax
        )
        ax.set_title(f'История заказов клиента {customer.user.get_full_name()}')
        ax.set_xlabel('Дата')
        ax.set_ylabel('Сумма заказа (BYN)')
        plt.xticks(rotation=45)
        plt.tight_layout()
        return fig
    
    # 2. Предпочтения по пиццам
    def plot_customer_preferences() -> plt.Figure:
        preferences = (
            OrderItem.objects.filter(order__in=customer_orders)
            .values('pizza__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        fig = go.Figure(data=[go.Bar(
            x=[p['pizza__name'] for p in preferences],
            y=[p['count'] for p in preferences],
            text=[p['count'] for p in preferences],
            textposition='auto',
        )])
        fig.update_layout(
            title=f'Предпочтения клиента {customer.user.get_full_name()}',
            xaxis_title='Пицца',
            yaxis_title='Количество заказов'
        )
        return fig
    
    return {
        'order_history': plot_customer_order_history(),
        'preferences': plot_customer_preferences()
    }

def generate_comparative_analytics(
    period1: Tuple[datetime, datetime],
    period2: Tuple[datetime, datetime]
) -> Dict[str, plt.Figure]:
    """
    Генерирует сравнительную аналитику между двумя периодами
    
    Args:
        period1 (Tuple[datetime, datetime]): Первый период (начало, конец)
        period2 (Tuple[datetime, datetime]): Второй период (начало, конец)
    
    Returns:
        Dict[str, plt.Figure]: Словарь с графиками
    """
    
    def get_period_stats(start_date, end_date):
        return Order.objects.filter(
            created_at__range=(start_date, end_date),
            status='completed'
        ).aggregate(
            total_sales=Sum('total_price'),
            avg_check=Avg('total_price'),
            orders_count=Count('id')
        )
    
    stats1 = get_period_stats(*period1)
    stats2 = get_period_stats(*period2)
    
    # График сравнения ключевых метрик
    fig = go.Figure(data=[
        go.Bar(
            name='Период 1',
            x=['Общие продажи', 'Средний чек', 'Количество заказов'],
            y=[stats1['total_sales'], stats1['avg_check'], stats1['orders_count']]
        ),
        go.Bar(
            name='Период 2',
            x=['Общие продажи', 'Средний чек', 'Количество заказов'],
            y=[stats2['total_sales'], stats2['avg_check'], stats2['orders_count']]
        )
    ])
    
    fig.update_layout(
        title='Сравнение периодов',
        barmode='group'
    )
    
    return {'comparison': fig} 