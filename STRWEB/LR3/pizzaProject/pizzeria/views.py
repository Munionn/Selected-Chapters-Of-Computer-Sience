from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import timezone as dt_timezone
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import (
    Company, PizzaCategory, PizzaSize, Pizza,
    Customer, Order, OrderItem, Review,
    Promotion, FAQ, Article, GlossaryTerm, Staff, Vacancy, PromoCode,
    Partner, Certificate
)
from .forms import (
    UserRegistrationForm, CustomerRegistrationForm,
    ReviewForm, OrderForm
)
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Avg, Count, Sum, F, Q
from django.db.models.functions import TruncDate
from statistics import median
from decimal import Decimal
import json
from datetime import date, datetime, timedelta
from django.views.generic import ListView, DetailView
from django.views.generic.base import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.conf import settings
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.db.models import Max
from django.db import models
import requests

import logging
logger = logging.getLogger(__name__)

# Helper functions

def get_time_context(request=None):
    """Helper function to get timezone context used in all views"""
    now = timezone.now()
    utc_time = now.astimezone(dt_timezone.utc)
    local_time = now
    
    user_timezone = None
    if request and 'user_timezone' in request.COOKIES:
        try:
            user_timezone = request.COOKIES['user_timezone']
            from pytz import timezone as pytz_timezone
            local_time = utc_time.astimezone(pytz_timezone(user_timezone))
        except Exception as e:
            logger.warning(f"Failed to parse user timezone: {e}")

    return {
        'local_time_str': local_time.strftime('%d/%m/%Y %H:%M'),
        'utc_time_str': utc_time.strftime('%d/%m/%Y %H:%M'),
        'user_timezone': user_timezone or 'UTC',
    }

def render_with_time(request, template, context_data=None):
    """Helper function to render a template with time context data"""
    context = get_time_context(request)
    if context_data:
        context.update(context_data)
    return render(request, template, context)

def safe_query(query_func, error_message, default_return=None):
    """Helper function to safely execute database queries with error handling"""
    try:
        return query_func()
    except Exception as e:
        logger.error(f"{error_message}: {e}")
        return default_return

def calculate_delivery_cost(delivery_address, total_weight=None):
    """Calculate delivery cost based on address and order weight
    
    Args:
        delivery_address (str): The delivery address
        total_weight (float, optional): Total weight of the order in kg
        
    Returns:
        Decimal: The calculated delivery cost
    """
    # Base delivery cost
    base_cost = Decimal('5.00')
    
    # Additional cost based on weight (if provided)
    weight_cost = Decimal('0.00')
    if total_weight:
        # Add 1 руб for each kg over 2kg
        if total_weight > 2:
            weight_cost = Decimal(str(total_weight - 2))
    
    # You could implement more sophisticated logic here, such as:
    # - Distance-based pricing using geocoding
    # - Zone-based pricing
    # - Time-based pricing (rush hour, etc.)
    # - Minimum order amount for free delivery
    
    return base_cost + weight_cost

# Views

def home(request):
    """View for the home page"""
    # Get featured pizzas and active promotions
    featured_pizzas = Pizza.objects.filter(
        available_sizes__isnull=False
    ).distinct().order_by('-created_at')[:6]
    
    active_promotions = Promotion.objects.filter(
        is_active=True,
        start_date__lte=date.today(),
        end_date__gte=date.today()
    )
    
    # Get best-selling pizzas
    best_sellers = Pizza.objects.annotate(
        total_orders=Count('orderitem')
    ).order_by('-total_orders')[:4]
    
    # Get top-rated pizzas
    top_rated = Pizza.objects.annotate(
        avg_rating=Avg('reviews__rating')
    ).filter(avg_rating__isnull=False).order_by('-avg_rating')[:4]
    
    # Get latest published article
    latest_article = Article.objects.filter(
        is_published=True
    ).order_by('-created_at').first()
    
    # Get active partners
    partners = Partner.objects.filter(
        is_active=True
    ).order_by('order', 'name')
    
    return render_with_time(
        request, 
        'pizzeria/home.html', 
        {
            'featured_pizzas': featured_pizzas,
            'active_promotions': active_promotions,
            'best_sellers': best_sellers,
            'top_rated': top_rated,
            'latest_article': latest_article,
            'partners': partners
        }
    )

def about(request):
    """View for the about company page"""
    company = Company.objects.prefetch_related('history_entries').first()
    certificates = Certificate.objects.filter(is_active=True).order_by('-issue_date')
    
    # Fetch random user data for team members
    try:
        response = requests.get('https://randomuser.me/api/?results=4')
        if response.status_code == 200:
            team_members = response.json()['results']
        else:
            team_members = []
    except Exception as e:
        team_members = []
    
    context = {
        'company': company,
        'team_members': team_members,
        'certificates': certificates,
        'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY
    }
    
    return render_with_time(request, 'pizzeria/about.html', context)

def menu(request):
    """View for the menu page with pagination"""
    categories = PizzaCategory.objects.all()
    sizes = PizzaSize.objects.all()
    
    # Get filters
    category_id = request.GET.get('category')
    search_query = request.GET.get('search', '').strip()
    sort_by = request.GET.get('sort', 'name')
    is_vegetarian = request.GET.get('vegetarian') == 'on'
    is_spicy = request.GET.get('spicy') == 'on'
    
    # Get per_page parameter (default: 3, max: 20)
    per_page = request.GET.get('per_page', '3')
    try:
        per_page = int(per_page)
        if per_page < 1:
            per_page = 3
        elif per_page > 20:
            per_page = 20
    except (ValueError, TypeError):
        per_page = 3
    
    # Start with all pizzas
    pizzas = Pizza.objects.filter(available_sizes__isnull=False).distinct()
    
    # Apply filters
    if category_id:
        pizzas = pizzas.filter(category_id=category_id)
    if search_query:
        pizzas = pizzas.filter(name__icontains=search_query)
    if is_vegetarian:
        pizzas = pizzas.filter(is_vegetarian=True)
    if is_spicy:
        pizzas = pizzas.filter(is_spicy=True)
    
    # Apply sorting
    if sort_by == 'price_asc':
        pizzas = pizzas.order_by('base_price')
    elif sort_by == 'price_desc':
        pizzas = pizzas.order_by('-base_price')
    elif sort_by == 'rating':
        pizzas = pizzas.annotate(avg_rating=Avg('reviews__rating')).order_by('-avg_rating')
    else:  # default sorting by name
        pizzas = pizzas.order_by('name')
    
    # Pagination
    paginator = Paginator(pizzas, per_page)
    page_number = request.GET.get('page', 1)
    try:
        page_obj = paginator.get_page(page_number)
    except:
        page_obj = paginator.get_page(1)
    
    return render_with_time(
        request, 
        'pizzeria/menu.html',
        {
            'categories': categories,
            'sizes': sizes,
            'pizzas': page_obj,
            'selected_category': category_id,
            'search_query': search_query,
            'sort_by': sort_by,
            'is_vegetarian': is_vegetarian,
            'is_spicy': is_spicy,
            'per_page': per_page,
            'total_items': paginator.count
        }
    )

def pizza_detail(request, pizza_id):
    """View for individual pizza details"""
    pizza = get_object_or_404(Pizza, id=pizza_id)
    reviews = pizza.reviews.select_related('customer__user').order_by('-created_at')
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
    
    # Get related pizzas from the same category
    related_pizzas = Pizza.objects.filter(
        category=pizza.category
    ).exclude(id=pizza_id)[:4]
    
    return render_with_time(
        request, 
        'pizzeria/pizza_detail.html',
        {
            'pizza': pizza,
            'reviews': reviews,
            'avg_rating': avg_rating,
            'related_pizzas': related_pizzas
        }
    )

@login_required
def add_to_cart(request, pizza_id):
    """View for adding a pizza to the cart"""
    if request.method == 'POST':
        logger.info(f"Starting add_to_cart process for pizza {pizza_id}")
        logger.info(f"POST data: {request.POST}")
        
        # Check if user has a customer profile
        if not hasattr(request.user, 'customer_profile'):
            logger.error(f"User {request.user.username} has no customer profile")
            messages.error(request, 'Пожалуйста, создайте профиль покупателя')
            return redirect('pizzeria:profile')
        
        try:
            # Get pizza and validate it exists
            try:
                pizza = Pizza.objects.get(id=pizza_id)
                logger.info(f"Found pizza: {pizza.name}")
            except Pizza.DoesNotExist:
                logger.error(f"Pizza with id {pizza_id} not found")
                messages.error(request, 'Пицца не найдена')
                return redirect('pizzeria:menu')

            # Get selected size
            size_id = request.POST.get('size')
            if not size_id:
                logger.error("No size selected")
                messages.error(request, 'Пожалуйста, выберите размер пиццы')
                return redirect('pizzeria:pizza_detail', pizza_id=pizza_id)

            try:
                size = PizzaSize.objects.get(id=size_id)
            except PizzaSize.DoesNotExist:
                logger.error(f"Size with id {size_id} not found")
                messages.error(request, 'Выбранный размер недоступен')
                return redirect('pizzeria:pizza_detail', pizza_id=pizza_id)

            # Get quantity (default to 1 if not specified or invalid)
            try:
                quantity = int(request.POST.get('quantity', 1))
                if quantity < 1:
                    quantity = 1
                elif quantity > 10:
                    quantity = 10
            except (TypeError, ValueError):
                quantity = 1
            
            logger.info(f"Quantity: {quantity}")

            # Calculate item price
            item_price = pizza.get_price_for_size(size)
            logger.info(f"Calculated item price: {item_price}")

            # Get or create current order
            try:
                order = Order.objects.get(
                    customer=request.user.customer_profile,
                    status='new'
                )
                logger.info(f"Found existing order: {order.id}")
            except Order.DoesNotExist:
                logger.info("Creating new order")
                order = Order.objects.create(
                    customer=request.user.customer_profile,
                    status='new',
                    total_price=Decimal('0.00')
                )
                logger.info(f"Created new order with id: {order.id}")

            # Create or update order item
            logger.info("Creating new order item")
            order_item, created = OrderItem.objects.get_or_create(
                order=order,
                pizza=pizza,
                size=size,
                defaults={
                    'quantity': quantity,
                    'price': item_price
                }
            )

            if not created:
                order_item.quantity += quantity
                if order_item.quantity > 10:
                    order_item.quantity = 10
                order_item.save()

            # Calculate total price
            subtotal = sum(item.price * item.quantity for item in order.items.all())
            logger.info(f"Calculated total price before delivery: {subtotal}")
            
            # Add standard delivery price
            delivery_price = Decimal('5.00')  # You might want to calculate this based on order details
            total_price = subtotal + delivery_price
            logger.info(f"Total price after delivery: {total_price}")

            # Update order
            order.total_price = total_price
            order.delivery_price = delivery_price
            order.save()
            logger.info(f"Final order total: {order.total_price}")

            messages.success(request, 'Пицца добавлена в корзину')
            logger.info("Successfully added to cart, redirecting to cart page")
            return redirect('pizzeria:cart')

        except Exception as e:
            logger.error(f"Error adding to cart: {str(e)}")
            messages.error(request, 'Произошла ошибка при добавлении в корзину')
            return redirect('pizzeria:pizza_detail', pizza_id=pizza_id)

    return redirect('pizzeria:pizza_detail', pizza_id=pizza_id)

@login_required
def cart(request):
    """View for the shopping cart"""
    try:
        order = Order.objects.get(
            customer=request.user.customer_profile,
            status='new'
        )
        # Calculate totals
        subtotal = sum(item.price * item.quantity for item in order.items.all())
        delivery_cost = calculate_delivery_cost(order.delivery_address, order.total_weight)
        total = subtotal + delivery_cost
    except Order.DoesNotExist:
        order = None
        subtotal = Decimal('0')
        delivery_cost = Decimal('0')
        total = Decimal('0')
    
    return render_with_time(
        request, 
        'pizzeria/cart.html',
        {
            'order': order,
            'subtotal': subtotal,
            'delivery_cost': delivery_cost,
            'total': total
        }
    )

@login_required
def update_cart(request, item_id):
    """View for updating cart items"""
    if request.method == 'POST':
        item = get_object_or_404(OrderItem, id=item_id, order__customer__user=request.user)
        quantity = int(request.POST.get('quantity', 0))
        
        if quantity > 0:
            item.quantity = quantity
            item.save()
        else:
            item.delete()
            
        return redirect('pizzeria:cart')
    return redirect('pizzeria:cart')

@login_required
def apply_promo(request):
    """View for applying promo codes to the cart"""
    if request.method == 'POST':
        promo_code = request.POST.get('promo_code')
        try:
            # Get the current active order (cart)
            order = Order.objects.get(
                customer__user=request.user,
                status='new'
            )
            
            # Try to find the promo code
            promo = PromoCode.objects.filter(
                code=promo_code,
                is_active=True,
                start_date__lte=timezone.now(),
                end_date__gte=timezone.now()
            ).first()
            
            if promo:
                # Check if promo code is valid for this order
                if order.subtotal >= promo.min_order_amount:
                    if promo.usage_limit is None or promo.times_used < promo.usage_limit:
                        # Apply the promo code
                        order.promo_code = promo
                        # Update total price with discount
                        order.total_price = order.subtotal + order.delivery_price - order.get_discount
                        order.save()
                        
                        # Increment usage counter
                        promo.times_used += 1
                        promo.save()
                        
                        messages.success(request, 'Промокод успешно применен!')
                    else:
                        messages.error(request, 'Промокод больше не действителен (превышен лимит использований)')
                else:
                    messages.error(
                        request,
                        f'Минимальная сумма заказа для этого промокода: {promo.min_order_amount} Br'
                    )
            else:
                messages.error(request, 'Недействительный промокод')
                
        except Order.DoesNotExist:
            messages.error(request, 'Корзина пуста')
            
    return redirect('pizzeria:cart')

@login_required
def checkout(request):
    """View for checkout process"""
    # Get current order
    order = Order.objects.filter(
        customer=request.user.customer_profile,
        status='new'
    ).first()
    
    if not order:
        messages.warning(request, 'У вас нет активного заказа')
        return redirect('pizzeria:cart')
    
    if request.method == 'POST':
        form = OrderForm(request.POST, instance=order)
        if form.is_valid():
            # Calculate delivery cost
            delivery_cost = calculate_delivery_cost(
                order.delivery_address,
                order.total_weight
            )
            
            # Apply promo code if exists
            if order.promo_code:
                discount = order.promo_code.calculate_discount(order.subtotal)
            else:
                discount = 0
            
            # Calculate total
            total = order.subtotal + delivery_cost - discount
            
            # Update order
            order = form.save(commit=False)
            order.delivery_price = delivery_cost
            order.total_price = total
            order.save()
            
            messages.success(request, 'Заказ оформлен. Перейдите к оплате.')
            return redirect('pizzeria:payment', order_id=order.id)
    else:
        # Pre-fill delivery address from customer profile
        initial_data = {
            'delivery_address': request.user.customer_profile.address
        }
        form = OrderForm(instance=order, initial=initial_data)
    
    return render_with_time(
        request, 
        'pizzeria/checkout.html',
        {'form': form, 'order': order}
    )

@login_required
@login_required
def payment(request, order_id):
    """View for payment page"""
    order = get_object_or_404(
        Order,
        id=order_id,
        customer=request.user.customer_profile,
        status='new'
    )
    return render_with_time(
        request,
        'pizzeria/payment.html',
        {'order': order}
    )

@login_required
def process_payment(request):
    """View for processing payment"""
    if request.method == 'POST':
        order = Order.objects.filter(
            customer=request.user.customer_profile,
            status='new'
        ).first()
        
        if not order:
            messages.error(request, 'Заказ не найден')
            return redirect('pizzeria:cart')
        
        payment_method = request.POST.get('payment_method')
        if payment_method not in dict(Order.PAYMENT_CHOICES):
            messages.error(request, 'Неверный способ оплаты')
            return redirect('pizzeria:payment', order_id=order.id)
        
        # Update order
        order.payment_method = payment_method
        order.status = 'confirmed'
        order.save()
        
        messages.success(request, 'Заказ успешно оплачен')
        return redirect('pizzeria:order_confirmation', order_id=order.id)
    
    return redirect('pizzeria:cart')

def order_confirmation(request, order_id):
    """View for order confirmation page"""
    order = get_object_or_404(
        Order,
        id=order_id,
        customer=request.user.customer_profile
    )
    return render_with_time(
        request,
        'pizzeria/order_confirmation.html',
        {'order': order}
    )

@login_required
def profile(request):
    """View for user profile"""
    if not hasattr(request.user, 'customer_profile'):
        messages.warning(request, 'Пожалуйста, создайте профиль покупателя')
        return redirect('pizzeria:register')
    
    # Get user's orders
    orders = Order.objects.filter(
        customer=request.user.customer_profile
    ).exclude(status='new').order_by('-created_at')
    
    # Get user's reviews
    reviews = Review.objects.filter(
        customer=request.user.customer_profile
    ).select_related('pizza').order_by('-created_at')
    
    return render_with_time(
        request, 
        'pizzeria/profile.html',
        {
            'customer': request.user.customer_profile,
            'orders': orders,
            'reviews': reviews
        }
    )

def register(request):
    """View for user registration"""
    if request.method == 'POST':
        user_form = UserRegistrationForm(request.POST)
        customer_form = CustomerRegistrationForm(request.POST)
        
        if user_form.is_valid() and customer_form.is_valid():
            user = user_form.save()
            customer = customer_form.save(commit=False)
            customer.user = user
            customer.save()
            
            login(request, user)
            messages.success(request, 'Регистрация успешна!')
            return redirect('pizzeria:home')
    else:
        user_form = UserRegistrationForm()
        customer_form = CustomerRegistrationForm()
    
    return render_with_time(
        request, 
        'pizzeria/register.html',
        {
            'user_form': user_form,
            'customer_form': customer_form
        }
    )

def login_view(request):
    """View for user login"""
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Добро пожаловать, {username}!')
                
                # Redirect to next page if specified
                next_page = request.GET.get('next')
                if next_page:
                    return redirect(next_page)
                return redirect('pizzeria:home')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль')
    else:
        form = AuthenticationForm()
    
    return render_with_time(
        request, 
        'pizzeria/login.html', 
        {'form': form}
    )

@login_required
def logout_view(request):
    """View for user logout"""
    logout(request)
    messages.info(request, 'Вы вышли из системы')
    return redirect('pizzeria:home')

def promotions(request):
    """View for displaying active promotions"""
    today = date.today()
    
    # Get active promotions
    active_promotions = Promotion.objects.filter(
        is_active=True,
        start_date__lte=today,
        end_date__gte=today
    ).order_by('end_date')
    
    # Get upcoming promotions
    upcoming_promotions = Promotion.objects.filter(
        is_active=True,
        start_date__gt=today
    ).order_by('start_date')
    
    return render_with_time(
        request, 
        'pizzeria/promotions.html',
        {
            'active_promotions': active_promotions,
            'upcoming_promotions': upcoming_promotions
        }
    )

@login_required
@login_required
def choose_pizza_for_review(request):
    pizzas = Pizza.objects.filter(is_active=True)
    return render(request, 'pizzeria/choose_pizza_for_review.html', {'pizzas': pizzas})

def responsive_demo(request):
    return render(request, 'pizzeria/responsive_demo.html')

@login_required
def add_review(request, pizza_id):
    """View for adding a pizza review"""
    pizza = get_object_or_404(Pizza, id=pizza_id)
    
    # Check if user has ordered this pizza
    has_ordered = OrderItem.objects.filter(
        order__customer=request.user.customer_profile,
        order__status='completed',
        pizza=pizza
    ).exists()
    
    if not has_ordered:
        messages.warning(
            request,
            'Оставлять отзывы могут только клиенты, заказавшие эту пиццу'
        )
        return redirect('pizzeria:pizza_detail', pizza_id=pizza.id)
    
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.customer = request.user.customer_profile
            review.pizza = pizza
            review.save()
            
            messages.success(request, 'Спасибо за ваш отзыв!')
            return redirect('pizzeria:pizza_detail', pizza_id=pizza.id)
    else:
        form = ReviewForm()
    
    return render_with_time(
        request, 
        'pizzeria/add_review.html', 
        {
            'form': form,
            'pizza': pizza
        }
    )

def faq(request):
    """View for FAQ page"""
    faqs = FAQ.objects.all().order_by('created_at')
    return render_with_time(request, 'pizzeria/faq.html', {'faqs': faqs})

class StatisticsView(LoginRequiredMixin, TemplateView):
    template_name = 'pizzeria/statistics.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Список клиентов в алфавитном порядке
        customers = Customer.objects.select_related('user').order_by(
            'user__first_name', 'user__last_name'
        ).annotate(
            total_spent=Sum('orders__total_price', filter=Q(orders__status='completed')),
            orders_count=Count('orders', filter=Q(orders__status='completed'))
        )
        context['customers'] = customers

        # Общая сумма продаж
        total_sales = Order.objects.filter(status='completed').aggregate(
            total=Sum('total_price')
        )['total'] or 0
        context['total_sales'] = total_sales

        # Статистика по продажам
        completed_orders = Order.objects.filter(status='completed')
        sales_amounts = list(completed_orders.values_list('total_price', flat=True))
        
        if sales_amounts:
            context['sales_stats'] = {
                'average': sum(sales_amounts) / len(sales_amounts),
                'median': median(sales_amounts),
                'mode': max(set(sales_amounts), key=sales_amounts.count)
            }
        else:
            context['sales_stats'] = {
                'average': 0,
                'median': 0,
                'mode': 0
            }

        # Статистика по возрасту клиентов
        customers_with_age = Customer.objects.exclude(birth_date__isnull=True)
        ages = [(timezone.now().date() - customer.birth_date).days // 365 
                for customer in customers_with_age]
        
        if ages:
            context['age_stats'] = {
                'average': sum(ages) / len(ages),
                'median': median(ages)
            }
        else:
            context['age_stats'] = {
                'average': 0,
                'median': 0
            }

        # Популярность типов пицц
        pizza_categories = PizzaCategory.objects.annotate(
            total_orders=Count('pizzas__orderitems', filter=Q(pizzas__orderitems__order__status='completed')),
            total_revenue=Sum(
                'pizzas__orderitems__price',
                filter=Q(pizzas__orderitems__order__status='completed')
            )
        ).order_by('-total_orders')

        context['pizza_categories'] = pizza_categories

        return context

# News Views
class ArticleListView(ListView):
    model = Article
    template_name = 'pizzeria/news_list.html'
    context_object_name = 'articles'
    paginate_by = 6
    ordering = ['-created_at']

    def get_queryset(self):
        return Article.objects.filter(is_published=True)

class ArticleDetailView(DetailView):
    model = Article
    template_name = 'pizzeria/article_detail.html'
    context_object_name = 'article'

    def get_queryset(self):
        return Article.objects.filter(is_published=True)

# Glossary Views
class GlossaryView(TemplateView):
    template_name = 'pizzeria/glossary.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        terms = GlossaryTerm.objects.all().order_by('term')
        
        # Create alphabet list and mark used letters
        alphabet = list('АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ')
        used_letters = set(term.term[0].upper() for term in terms)
        
        # Add first_letter attribute to each term
        for term in terms:
            term.first_letter = term.term[0].upper()

        context.update({
            'terms': terms,
            'alphabet': alphabet,
            'used_letters': used_letters,
        })
        return context

# Staff Views
class StaffListView(TemplateView):
    template_name = 'pizzeria/staff.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Get management staff (assuming they have specific positions)
        management = Staff.objects.filter(
            is_active=True,
            position__in=['Директор', 'Заместитель директора', 'Управляющий']
        ).order_by('order')
        
        # Get other staff members
        staff = Staff.objects.filter(
            is_active=True
        ).exclude(
            id__in=management.values_list('id', flat=True)
        ).order_by('order')

        context.update({
            'management': management,
            'staff': staff,
        })
        return context

# Vacancies Views
class VacancyListView(ListView):
    model = Vacancy
    template_name = 'pizzeria/vacancies.html'
    context_object_name = 'vacancies'
    ordering = ['-is_active', '-created_at']

# Promo Codes Views
class PromoCodeListView(ListView):
    model = PromoCode
    template_name = 'pizzeria/promo_codes.html'
    context_object_name = 'promo_codes'

    def get_queryset(self):
        now = timezone.now()
        return PromoCode.objects.filter(
            Q(end_date__gt=now) | Q(end_date__isnull=True),
            is_active=True
        ).order_by('-start_date')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(get_time_context(self.request))
        return context

class ContactsView(TemplateView):
    template_name = 'pizzeria/contacts.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['company'] = Company.objects.first()
        context['google_maps_api_key'] = settings.GOOGLE_MAPS_API_KEY
        return context

class PrivacyPolicyView(TemplateView):
    template_name = 'pizzeria/privacy.html'

class ReviewListView(ListView):
    model = Review
    template_name = 'pizzeria/reviews.html'
    context_object_name = 'reviews'
    paginate_by = 10
    ordering = ['-created_at']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['avg_rating'] = Review.objects.aggregate(Avg('rating'))['rating__avg']
        return context

def is_staff(user):
    return user.is_staff

@login_required
@user_passes_test(is_staff)
def admin_dashboard(request):
    return render(request, 'pizzeria/admin/dashboard.html', {
        'active_tab': 'dashboard'
    })

@login_required
@user_passes_test(is_staff)
def admin_pizzas(request):
    # Получение параметров фильтрации
    category = request.GET.get('category', '')
    sauce = request.GET.get('sauce', '')
    search = request.GET.get('search', '').strip()

    # Базовый QuerySet
    pizzas = Pizza.objects.select_related('category').all()

    # Применение фильтров
    if category and category != 'None':
        pizzas = pizzas.filter(category_id=category)
    if sauce and sauce != 'None':
        pizzas = pizzas.filter(sauce=sauce)
    if search:
        pizzas = pizzas.filter(
            Q(name__icontains=search) |
            Q(ingredients__icontains=search)
        )

    # Пагинация
    paginator = Paginator(pizzas, 10)
    page = request.GET.get('page')
    pizzas = paginator.get_page(page)

    # Добавляем средний рейтинг для каждой пиццы
    for pizza in pizzas:
        pizza.average_rating = pizza.reviews.aggregate(Avg('rating'))['rating__avg']

    context = {
        'active_tab': 'pizzas',
        'pizzas': pizzas,
        'categories': PizzaCategory.objects.all(),
        'sizes': PizzaSize.objects.all(),
        'sauce_choices': Pizza.SAUCE_CHOICES,
        'selected_category': category if category and category != 'None' else '',
        'selected_sauce': sauce if sauce and sauce != 'None' else '',
        'search_query': search
    }
    return render(request, 'pizzeria/admin/pizzas.html', context)

@login_required
@user_passes_test(is_staff)
def admin_orders(request):
    # Получение параметров фильтрации
    status = request.GET.get('status')
    payment_method = request.GET.get('payment_method')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    # Базовый QuerySet
    orders = Order.objects.all()

    # Применение фильтров
    if status:
        orders = orders.filter(status=status)
    if payment_method:
        orders = orders.filter(payment_method=payment_method)
    if date_from:
        orders = orders.filter(created_at__gte=datetime.strptime(date_from, '%Y-%m-%d'))
    if date_to:
        orders = orders.filter(created_at__lte=datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1))

    # Статистика
    today = timezone.now().date()
    orders_today = orders.filter(created_at__date=today).count()
    revenue_today = orders.filter(created_at__date=today).aggregate(
        total=Sum('total_price')
    )['total'] or 0
    pending_orders = orders.filter(status__in=['new', 'confirmed']).count()
    delivering_orders = orders.filter(status='delivering').count()

    # Пагинация
    paginator = Paginator(orders, 10)
    page = request.GET.get('page')
    orders = paginator.get_page(page)

    context = {
        'active_tab': 'orders',
        'orders': orders,
        'status_choices': Order.STATUS_CHOICES,
        'payment_choices': Order.PAYMENT_CHOICES,
        'selected_status': status,
        'selected_payment': payment_method,
        'date_from': date_from,
        'date_to': date_to,
        'orders_today': orders_today,
        'revenue_today': revenue_today,
        'pending_orders': pending_orders,
        'delivering_orders': delivering_orders
    }
    return render(request, 'pizzeria/admin/orders.html', context)

@login_required
@user_passes_test(is_staff)
def admin_analytics(request):
    # Общая статистика
    total_revenue = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0
    total_orders = Order.objects.count()
    total_customers = Customer.objects.count()
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

    # Данные для графика продаж
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    sales_data = Order.objects.filter(
        created_at__date__gte=last_30_days
    ).values('created_at__date').annotate(
        revenue=Sum('total_price')
    ).order_by('created_at__date')

    sales_dates = [item['created_at__date'].strftime('%d.%m') for item in sales_data]
    sales_revenue = [float(item['revenue']) for item in sales_data]

    # Топ пицц
    top_pizzas = OrderItem.objects.values(
        'pizza__name'
    ).annotate(
        total_quantity=Sum('quantity')
    ).order_by('-total_quantity')[:5]

    top_pizzas_labels = [item['pizza__name'] for item in top_pizzas]
    top_pizzas_data = [item['total_quantity'] for item in top_pizzas]

    # Способы оплаты
    payment_methods = Order.objects.filter(
        created_at__date__gte=last_30_days
    ).exclude(
        payment_method__isnull=True
    ).values(
        'payment_method'
    ).annotate(
        count=Count('id')
    ).order_by('-count')

    payment_methods_labels = [
        dict(Order.PAYMENT_CHOICES)[item['payment_method']]
        for item in payment_methods if item['payment_method'] is not None
    ]
    payment_methods_data = [item['count'] for item in payment_methods if item['payment_method'] is not None]

    # Статусы заказов
    order_statuses = Order.objects.filter(
        created_at__date__gte=last_30_days
    ).exclude(
        status__isnull=True
    ).values(
        'status'
    ).annotate(
        count=Count('id')
    ).order_by('-count')

    order_status_labels = [
        dict(Order.STATUS_CHOICES)[item['status']]
        for item in order_statuses if item['status'] in dict(Order.STATUS_CHOICES)
    ]
    order_status_data = [item['count'] for item in order_statuses if item['status'] in dict(Order.STATUS_CHOICES)]

    # Анализ по соусам
    sauce_analysis = []
    for sauce_value, sauce_name in Pizza.SAUCE_CHOICES:
        pizzas_with_sauce = Pizza.objects.filter(sauce=sauce_value)
        pizzas_count = pizzas_with_sauce.count()
        
        orders_with_sauce = OrderItem.objects.filter(
            pizza__in=pizzas_with_sauce
        ).aggregate(
            orders_count=Count('order', distinct=True),
            revenue=Sum(F('quantity') * F('price'))
        )

        sauce_analysis.append({
            'name': sauce_name,
            'pizzas_count': pizzas_count,
            'orders_count': orders_with_sauce['orders_count'] or 0,
            'revenue': orders_with_sauce['revenue'] or 0
        })

    sauce_labels = [item['name'] for item in sauce_analysis]
    sauce_sales_data = [item['orders_count'] for item in sauce_analysis]

    # Лучшие клиенты
    top_customers = Customer.objects.annotate(
        orders_count=Count('orders'),
        total_spent=Sum('orders__total_price'),
        avg_order_value=Avg('orders__total_price'),
        last_order_date=Max('orders__created_at')
    ).order_by('-total_spent')[:10]

    context = {
        'active_tab': 'analytics',
        'total_revenue': total_revenue,
        'total_orders': total_orders,
        'total_customers': total_customers,
        'avg_order_value': avg_order_value,
        'sales_dates': json.dumps(sales_dates),
        'sales_revenue': json.dumps(sales_revenue),
        'top_pizzas_labels': json.dumps(top_pizzas_labels),
        'top_pizzas_data': json.dumps(top_pizzas_data),
        'payment_methods_labels': json.dumps(payment_methods_labels),
        'payment_methods_data': json.dumps(payment_methods_data),
        'order_status_labels': json.dumps(order_status_labels),
        'order_status_data': json.dumps(order_status_data),
        'sauce_labels': json.dumps(sauce_labels),
        'sauce_sales_data': json.dumps(sauce_sales_data),
        'sauce_analysis': sauce_analysis,
        'top_customers': top_customers
    }
    return render(request, 'pizzeria/admin/analytics.html', context)

# CRUD операции
@login_required
@user_passes_test(is_staff)
def add_pizza(request):
    """View for adding a new pizza"""
    if request.method == 'POST':
        try:
            # Получение данных из формы
            name = request.POST.get('name')
            category_id = request.POST.get('category')
            description = request.POST.get('description')
            ingredients = request.POST.get('ingredients')
            sauce = request.POST.get('sauce')
            base_price = request.POST.get('base_price')
            is_vegetarian = request.POST.get('is_vegetarian') == 'on'
            is_spicy = request.POST.get('is_spicy') == 'on'
            calories = request.POST.get('calories_per_100g')
            size_ids = request.POST.getlist('available_sizes')
            image = request.FILES.get('image')

            # Валидация обязательных полей
            if not all([name, category_id, description, ingredients, sauce, base_price]):
                return JsonResponse({
                    'success': False,
                    'error': 'Пожалуйста, заполните все обязательные поля'
                })

            # Создание пиццы
            pizza = Pizza.objects.create(
                name=name,
                category_id=category_id,
                description=description,
                ingredients=ingredients,
                sauce=sauce,
                base_price=Decimal(base_price),
                is_vegetarian=is_vegetarian,
                is_spicy=is_spicy,
                calories_per_100g=calories if calories else None,
                image=image
            )

            # Добавление размеров
            if size_ids:
                pizza.available_sizes.set(size_ids)

            return JsonResponse({
                'success': True,
                'message': 'Пицца успешно добавлена'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

    return JsonResponse({
        'success': False,
        'error': 'Метод не поддерживается'
    })

@login_required
@user_passes_test(is_staff)
def edit_pizza(request, pizza_id):
    """View for editing an existing pizza"""
    pizza = get_object_or_404(Pizza, id=pizza_id)

    if request.method == 'POST':
        try:
            # Получение данных из формы
            name = request.POST.get('name')
            category_id = request.POST.get('category')
            description = request.POST.get('description')
            ingredients = request.POST.get('ingredients')
            sauce = request.POST.get('sauce')
            base_price = request.POST.get('base_price')
            is_vegetarian = request.POST.get('is_vegetarian') == 'on'
            is_spicy = request.POST.get('is_spicy') == 'on'
            calories = request.POST.get('calories_per_100g')
            size_ids = request.POST.getlist('available_sizes')

            # Валидация обязательных полей
            if not all([name, category_id, description, ingredients, sauce, base_price]):
                return JsonResponse({
                    'success': False,
                    'error': 'Пожалуйста, заполните все обязательные поля'
                })

            # Обновление данных пиццы
            pizza.name = name
            pizza.category_id = category_id
            pizza.description = description
            pizza.ingredients = ingredients
            pizza.sauce = sauce
            pizza.base_price = Decimal(base_price)
            pizza.is_vegetarian = is_vegetarian
            pizza.is_spicy = is_spicy
            pizza.calories_per_100g = calories if calories else None

            if 'image' in request.FILES:
                pizza.image = request.FILES['image']

            pizza.save()

            # Обновление размеров
            pizza.available_sizes.set(size_ids)

            return JsonResponse({
                'success': True,
                'message': 'Пицца успешно обновлена'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

    return JsonResponse({
        'success': False,
        'error': 'Метод не поддерживается'
    })

@login_required
@user_passes_test(is_staff)
def delete_pizza(request, pizza_id):
    """View for deleting a pizza"""
    if request.method == 'POST':
        try:
            pizza = get_object_or_404(Pizza, id=pizza_id)
            pizza.delete()
            return JsonResponse({
                'success': True,
                'message': 'Пицца успешно удалена'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({
        'success': False,
        'error': 'Метод не поддерживается'
    })

@login_required
@user_passes_test(is_staff)
def update_order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()

    return redirect('pizzeria:admin_orders')

@login_required
@user_passes_test(is_staff)
def admin_customers(request):
    # Get filter parameters
    search_query = request.GET.get('search', '').strip()
    sort_by = request.GET.get('sort', 'created_at')
    order = request.GET.get('order', 'desc')

    # Base queryset
    customers = Customer.objects.select_related('user').annotate(
        orders_count=Count('orders', filter=~Q(orders__status='new')),
        total_spent=Sum('orders__total_price', filter=~Q(orders__status='new')),
        avg_order_value=Avg('orders__total_price', filter=~Q(orders__status='new')),
        last_order_date=Max('orders__created_at')
    )

    # Apply search
    if search_query:
        customers = customers.filter(
            Q(user__username__icontains=search_query) |
            Q(user__first_name__icontains=search_query) |
            Q(user__last_name__icontains=search_query) |
            Q(phone_number__icontains=search_query) |
            Q(address__icontains=search_query)
        )

    # Apply sorting
    if sort_by == 'name':
        order_field = 'user__first_name' if order == 'asc' else '-user__first_name'
    elif sort_by == 'orders':
        order_field = 'orders_count' if order == 'asc' else '-orders_count'
    elif sort_by == 'spent':
        order_field = 'total_spent' if order == 'asc' else '-total_spent'
    elif sort_by == 'avg_order':
        order_field = 'avg_order_value' if order == 'asc' else '-avg_order_value'
    else:  # default sort by registration date
        order_field = 'created_at' if order == 'asc' else '-created_at'

    customers = customers.order_by(order_field)

    # Pagination
    paginator = Paginator(customers, 10)
    page = request.GET.get('page')
    customers = paginator.get_page(page)

    context = {
        'active_tab': 'customers',
        'customers': customers,
        'search_query': search_query,
        'sort_by': sort_by,
        'order': order,
        'total_customers': Customer.objects.count(),
        'active_customers': Customer.objects.filter(orders__isnull=False).distinct().count(),
        'total_revenue': Customer.objects.aggregate(
            total=Sum('orders__total_price', filter=~Q(orders__status='new'))
        )['total'] or 0
    }
    return render(request, 'pizzeria/admin/customers.html', context)

@login_required
@user_passes_test(is_staff)
def api_customer_detail(request, customer_id):
    customer = get_object_or_404(Customer.objects.select_related('user'), id=customer_id)
    
    # Get recent orders
    recent_orders = customer.orders.exclude(status='new').order_by('-created_at')[:5]
    
    data = {
        'id': customer.id,
        'full_name': customer.user.get_full_name(),
        'username': customer.user.username,
        'email': customer.user.email,
        'phone_number': customer.phone_number,
        'address': customer.address,
        'birth_date': customer.birth_date.strftime('%d.%m.%Y') if customer.birth_date else None,
        'bonus_points': customer.bonus_points,
        'created_at': customer.created_at.strftime('%d.%m.%Y'),
        'orders_count': customer.orders.exclude(status='new').count(),
        'total_spent': float(customer.orders.exclude(status='new').aggregate(
            total=Sum('total_price')
        )['total'] or 0),
        'recent_orders': [{
            'id': order.id,
            'date': order.created_at.strftime('%d.%m.%Y %H:%M'),
            'status': order.get_status_display(),
            'total': float(order.total_price)
        } for order in recent_orders]
    }
    return JsonResponse(data)

# API endpoints
@login_required
@user_passes_test(is_staff)
def api_pizza_detail(request, pizza_id):
    pizza = get_object_or_404(Pizza, id=pizza_id)
    data = {
        'id': pizza.id,
        'name': pizza.name,
        'category': pizza.category_id,
        'description': pizza.description,
        'ingredients': pizza.ingredients,
        'sauce': pizza.sauce,
        'base_price': float(pizza.base_price),
        'is_vegetarian': pizza.is_vegetarian,
        'is_spicy': pizza.is_spicy,
        'calories_per_100g': pizza.calories_per_100g,
        'available_sizes': list(pizza.available_sizes.values_list('id', flat=True)),
        'image_url': pizza.image.url if pizza.image else None
    }
    return JsonResponse(data)

@login_required
@user_passes_test(is_staff)
def api_order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    data = {
        'id': order.id,
        'customer_name': order.customer.user.get_full_name(),
        'customer_phone': order.customer.phone_number,
        'delivery_address': order.delivery_address,
        'status': order.status,
        'status_display': order.get_status_display(),
        'payment_method': order.payment_method,
        'payment_method_display': order.get_payment_method_display(),
        'created_at': order.created_at.strftime('%d.%m.%Y %H:%M'),
        'delivery_price': float(order.delivery_price),
        'total_price': float(order.total_price),
        'comment': order.comment,
        'items': [{
            'pizza_name': item.pizza.name,
            'size_name': item.size.name,
            'quantity': item.quantity,
            'price': float(item.price)
        } for item in order.items.all()]
    }
    return JsonResponse(data)

@login_required
@user_passes_test(is_staff)
def api_analytics(request):
    period = request.GET.get('period', 'month')
    today = timezone.now().date()

    if period == 'week':
        start_date = today - timedelta(days=7)
    elif period == 'month':
        start_date = today - timedelta(days=30)
    else:  # year
        start_date = today - timedelta(days=365)

    # Данные для графиков
    sales_data = Order.objects.filter(
        created_at__date__gte=start_date
    ).values('created_at__date').annotate(
        revenue=Sum('total_price')
    ).order_by('created_at__date')

    top_pizzas = OrderItem.objects.filter(
        order__created_at__date__gte=start_date
    ).values('pizza__name').annotate(
        total_quantity=Sum('quantity')
    ).order_by('-total_quantity')[:5]

    payment_methods = Order.objects.filter(
        created_at__date__gte=start_date
    ).exclude(
        payment_method__isnull=True
    ).values('payment_method').annotate(
        count=Count('id')
    ).order_by('-count')

    order_statuses = Order.objects.filter(
        created_at__date__gte=start_date
    ).exclude(
        status__isnull=True
    ).values('status').annotate(
        count=Count('id')
    ).order_by('-count')

    sauce_popularity = OrderItem.objects.filter(
        order__created_at__date__gte=start_date,
        pizza__sauce__isnull=False
    ).values('pizza__sauce').annotate(
        total_quantity=Sum('quantity')
    ).order_by('-total_quantity')

    data = {
        'sales_data': {
            'dates': [item['created_at__date'].strftime('%d.%m') for item in sales_data],
            'revenue': [float(item['revenue'] or 0) for item in sales_data]
        },
        'top_pizzas': {
            'labels': [item['pizza__name'] for item in top_pizzas],
            'data': [item['total_quantity'] for item in top_pizzas]
        },
        'payment_methods': {
            'labels': [dict(Order.PAYMENT_CHOICES)[item['payment_method']] 
                      for item in payment_methods if item['payment_method'] is not None],
            'data': [item['count'] for item in payment_methods if item['payment_method'] is not None]
        },
        'order_statuses': {
            'labels': [dict(Order.STATUS_CHOICES)[item['status']] 
                      for item in order_statuses if item['status'] is not None],
            'data': [item['count'] for item in order_statuses if item['status'] is not None]
        },
        'sauce_popularity': {
            'labels': [dict(Pizza.SAUCE_CHOICES)[item['pizza__sauce']] 
                      for item in sauce_popularity if item['pizza__sauce'] is not None],
            'data': [item['total_quantity'] for item in sauce_popularity if item['pizza__sauce'] is not None]
        }
    }
    return JsonResponse(data)

@login_required
@user_passes_test(is_staff)
def admin_slider_settings(request):
    """View for admin to configure slider settings"""
    if request.method == 'POST':
        settings = {
            'loop': request.POST.get('loop') == 'on',
            'navs': request.POST.get('navs') == 'on',
            'pags': request.POST.get('pags') == 'on',
            'auto': request.POST.get('auto') == 'on',
            'stopMouseHover': request.POST.get('stopMouseHover') == 'on',
            'delay': float(request.POST.get('delay', 5))
        }
        return render(request, 'pizzeria/admin/slider_settings.html', {'settings': settings})
    return render(request, 'pizzeria/admin/slider_settings.html', {'settings': {}})

@login_required
@user_passes_test(is_staff)
def admin_range_generator(request):
    """View for range input generator with customizable attributes"""
    context = {
        'active_tab': 'range_generator'
    }
    return render(request, 'pizzeria/admin/range_generator.html', context)

def contacts_table(request):
    """View for contacts table page with all functionality"""
    return render(request, 'pizzeria/contacts_table.html')

def api_staff_list(request):
    """API endpoint to get staff list as JSON"""
    staff_list = Staff.objects.filter(is_active=True).order_by('order')
    
    data = []
    for staff in staff_list:
        data.append({
            'id': staff.id,
            'name': staff.name,
            'position': staff.position,
            'description': staff.description,
            'photo': staff.photo.url if staff.photo else '',
            'phone': staff.phone,
            'email': staff.email,
        })
    
    return JsonResponse({'staff': data}, safe=False)
