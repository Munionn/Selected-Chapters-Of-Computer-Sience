from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
from .models import (
    Company, Pizza, PizzaCategory, PizzaSize,
    Customer, Order, OrderItem, Review,
    Staff, Promotion, PromoCode
)
from .forms import UserRegistrationForm, CustomerRegistrationForm, ReviewForm

# Create your tests here.

class ModelTests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        
        # Create test customer
        self.customer = Customer.objects.create(
            user=self.user,
            phone_number='+375 (29) 123-45-67',
            birth_date=date(1990, 1, 1),
            address='Test Address'
        )
        
        # Create test category
        self.category = PizzaCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        
        # Create test size
        self.size = PizzaSize.objects.create(
            name='Medium',
            diameter=30,
            multiplier=1.0
        )
        
        # Create test pizza
        self.pizza = Pizza.objects.create(
            name='Test Pizza',
            category=self.category,
            description='Test Description',
            ingredients='Test Ingredients',
            base_price=Decimal('10.00')
        )
        self.pizza.available_sizes.add(self.size)

    def test_pizza_str(self):
        self.assertEqual(str(self.pizza), 'Test Pizza')

    def test_customer_str(self):
        self.assertEqual(
            str(self.customer),
            f"{self.user.get_full_name()} (+375 (29) 123-45-67)"
        )

    def test_pizza_price_calculation(self):
        self.assertEqual(
            self.pizza.get_price_for_size(self.size),
            Decimal('10.00')
        )

    def test_customer_age(self):
        self.assertTrue(self.customer.age() >= 18)

class ViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.customer = Customer.objects.create(
            user=self.user,
            phone_number='+375 (29) 123-45-67',
            birth_date=date(1990, 1, 1),
            address='Test Address'
        )

    def test_home_view(self):
        response = self.client.get(reverse('pizzeria:home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pizzeria/home.html')

    def test_menu_view(self):
        response = self.client.get(reverse('pizzeria:menu'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pizzeria/menu.html')

    def test_protected_views_redirect(self):
        # Test that protected views redirect to login
        cart_url = reverse('pizzeria:cart')
        response = self.client.get(cart_url)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith('/login/'))

    def test_protected_views_access(self):
        # Test access to protected views when logged in
        self.client.login(username='testuser', password='testpass123')
        cart_url = reverse('pizzeria:cart')
        response = self.client.get(cart_url)
        self.assertEqual(response.status_code, 200)

class FormTests(TestCase):
    def test_user_registration_form(self):
        form_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'testpass123',
            'password2': 'testpass123'
        }
        form = UserRegistrationForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_customer_registration_form(self):
        form_data = {
            'phone_number': '+375 (29) 123-45-67',
            'birth_date': '1990-01-01',
            'address': 'Test Address'
        }
        form = CustomerRegistrationForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_review_form(self):
        form_data = {
            'rating': 5,
            'text': 'Great pizza!'
        }
        form = ReviewForm(data=form_data)
        self.assertTrue(form.is_valid())

class APITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.customer = Customer.objects.create(
            user=self.user,
            phone_number='+375 (29) 123-45-67',
            birth_date=date(1990, 1, 1),
            address='Test Address'
        )

    def test_api_authentication(self):
        # Test API endpoints require authentication
        urls = [
            reverse('pizzeria:cart'),
            reverse('pizzeria:profile'),
            reverse('pizzeria:statistics')
        ]
        
        # Test unauthorized access
        for url in urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, 302)  # Redirects to login
            
        # Test authorized access
        self.client.login(username='testuser', password='testpass123')
        for url in urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200)

class ValidationTests(TestCase):
    def test_phone_number_validation(self):
        # Test invalid phone number format
        customer = Customer(
            user=User.objects.create_user('test', 'test@test.com', 'test123'),
            phone_number='invalid',
            birth_date=date(1990, 1, 1),
            address='Test'
        )
        with self.assertRaises(Exception):
            customer.full_clean()

    def test_age_validation(self):
        # Test underage customer
        user = User.objects.create_user('young', 'young@test.com', 'test123')
        customer = Customer(
            user=user,
            phone_number='+375 (29) 123-45-67',
            birth_date=date.today() - timedelta(days=365*17),  # 17 years old
            address='Test'
        )
        with self.assertRaises(Exception):
            customer.full_clean()

    def test_promo_code_validation(self):
        promo = PromoCode.objects.create(
            code='TEST10',
            description='Test promo',
            discount_amount=Decimal('10.00'),
            discount_type='fixed',
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=1)
        )
        self.assertTrue(promo.is_valid)
        
        # Test expired promo
        promo.end_date = timezone.now() - timedelta(days=1)
        promo.save()
        self.assertFalse(promo.is_valid)
