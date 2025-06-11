from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from datetime import date
from decimal import Decimal

def validate_age(birth_date):
    today = date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    if age < 18:
        raise ValidationError('Возраст должен быть не менее 18 лет.')

class Company(models.Model):
    name = models.CharField('Название', max_length=100)
    description = models.TextField('Описание')
    history = models.TextField('История', blank=True)
    video_url = models.URLField('Ссылка на видео', blank=True)
    logo = models.ImageField('Логотип', upload_to='company/', blank=True, null=True)
    address = models.CharField('Адрес', max_length=200)
    phone = models.CharField('Телефон', max_length=20)
    email = models.EmailField('Email')
    registration_number = models.CharField('Регистрационный номер', max_length=50, blank=True)
    tax_number = models.CharField('ИНН', max_length=50, blank=True)
    bank_details = models.TextField('Банковские реквизиты', blank=True)
    lat = models.DecimalField('Широта', max_digits=10, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField('Долгота', max_digits=10, decimal_places=6, null=True, blank=True)
    working_hours = models.CharField('Часы работы', max_length=200, blank=True)
    delivery_hours = models.CharField('Часы доставки', max_length=200, blank=True)
    delivery_price = models.DecimalField('Стоимость доставки', max_digits=10, decimal_places=2, null=True, blank=True)
    free_delivery_from = models.DecimalField('Бесплатная доставка от', max_digits=10, decimal_places=2, null=True, blank=True)
    min_order_price = models.DecimalField('Минимальная сумма заказа', max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_time = models.CharField('Время доставки', max_length=100, blank=True)
    about_us = models.TextField('О нас', blank=True)
    slogan = models.CharField('Слоган', max_length=200, blank=True)
    instagram = models.CharField('Instagram', max_length=100, blank=True)
    facebook = models.CharField('Facebook', max_length=100, blank=True)
    vk = models.CharField('VK', max_length=100, blank=True)
    meta_keywords = models.CharField('Meta Keywords', max_length=255, blank=True)
    meta_description = models.TextField('Meta Description', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Компания'
        verbose_name_plural = 'Компании'

class CompanyHistory(models.Model):
    year = models.IntegerField('Год')
    title = models.CharField('Заголовок', max_length=200)
    description = models.TextField('Описание')
    image = models.ImageField('Изображение', upload_to='history/', blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='history_entries')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.year}: {self.title}"

    class Meta:
        verbose_name = 'История компании'
        verbose_name_plural = 'История компании'
        ordering = ['-year']

class PizzaCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    slug = models.SlugField(unique=True, max_length=100, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Категория пиццы"
        verbose_name_plural = "Категории пицц"

class PizzaSize(models.Model):
    name = models.CharField(max_length=50)  # например, "Маленькая", "Средняя", "Большая"
    diameter = models.IntegerField(help_text="Диаметр в сантиметрах")
    multiplier = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=1.0,
        help_text="Множитель цены относительно базовой цены"
    )

    def __str__(self):
        return f"{self.name} ({self.diameter} см)"
    
    class Meta:
        verbose_name = "Размер пиццы"
        verbose_name_plural = "Размеры пицц"

class Pizza(models.Model):
    SAUCE_CHOICES = [
        ('tomato', 'Томатный'),
        ('cream', 'Сливочный'),
        ('bbq', 'Барбекю'),
        ('garlic', 'Чесночный'),
        ('pesto', 'Песто'),
    ]

    name = models.CharField(max_length=100)
    category = models.ForeignKey(PizzaCategory, on_delete=models.CASCADE, related_name='pizzas')
    description = models.TextField()
    ingredients = models.TextField(help_text="Список ингредиентов")
    sauce = models.CharField(max_length=20, choices=SAUCE_CHOICES, default='tomato', verbose_name='Соус')
    base_price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='pizzas/', null=True, blank=True)
    available_sizes = models.ManyToManyField(PizzaSize, related_name='pizzas')
    is_vegetarian = models.BooleanField(default=False)
    is_spicy = models.BooleanField(default=False)
    calories_per_100g = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_price_for_size(self, size):
        return self.base_price * Decimal(str(size.multiplier))

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Пицца"
        verbose_name_plural = "Пиццы"

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    phone_number = models.CharField(
        max_length=20, 
        validators=[
            RegexValidator(
                regex=r'^\+375 \((?:29|33|44|25)\) \d{3}-\d{2}-\d{2}$',
                message="Phone number must be entered in the format: '+375 (29) XXX-XX-XX'"
            )
        ]
    )
    birth_date = models.DateField(validators=[validate_age])
    address = models.TextField()
    bonus_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def age(self):
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.phone_number})"
    
    class Meta:
        verbose_name = "Клиент"
        verbose_name_plural = "Клиенты"

class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('confirmed', 'Подтвержден'),
        ('preparing', 'Готовится'),
        ('delivering', 'Доставляется'),
        ('completed', 'Выполнен'),
        ('cancelled', 'Отменен'),
    ]

    PAYMENT_CHOICES = [
        ('cash', 'Наличными'),
        ('card', 'Картой'),
        ('online', 'Онлайн'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, null=True, blank=True)
    delivery_address = models.TextField(null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    delivery_price = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
    total_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='Total weight of the order in kg')
    promo_code = models.ForeignKey('PromoCode', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    bonus_points_used = models.IntegerField(default=0)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def subtotal(self):
        """Calculate order subtotal before delivery and discounts"""
        return sum(item.price * item.quantity for item in self.items.all())

    @property
    def get_discount(self):
        """Get discount amount from promo code"""
        if self.promo_code and self.promo_code.is_valid:
            return self.promo_code.calculate_discount(self.subtotal)
        return Decimal('0')

    def calculate_total_weight(self):
        """Calculate total weight of the order based on items"""
        total = Decimal('0')
        for item in self.items.all():
            # Assuming each pizza weighs 0.5kg for now
            # This should be replaced with actual pizza weights from the Pizza model
            total += Decimal('0.5') * item.quantity
        return total

    def save(self, *args, **kwargs):
        # First save to ensure we have an ID
        super().save(*args, **kwargs)
        
        # Only calculate totals if we have items
        if self.pk and self.items.exists():
            # Calculate totals
            subtotal = self.subtotal
            discount = self.get_discount
            self.total_price = subtotal + self.delivery_price - discount
            self.total_weight = self.calculate_total_weight()
            
            # Save again with updated totals
            if 'update_fields' not in kwargs:  # Prevent infinite recursion
                super().save(update_fields=['total_price', 'total_weight'])

    def __str__(self):
        return f"Заказ #{self.id} от {self.customer}"
    
    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ['-created_at']

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    pizza = models.ForeignKey(Pizza, on_delete=models.CASCADE)
    size = models.ForeignKey(PizzaSize, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    
    def save(self, *args, **kwargs):
        # Set price if not set
        if not self.price:
            self.price = self.pizza.get_price_for_size(self.size)
        
        # Save the item
        super().save(*args, **kwargs)
        
        # Update order totals
        if self.order.pk:  # Only if order exists
            subtotal = self.order.subtotal
            discount = self.order.get_discount
            self.order.total_price = subtotal + self.order.delivery_price - discount
            self.order.total_weight = self.order.calculate_total_weight()
            self.order.save()

    def __str__(self):
        return f"{self.pizza.name} ({self.size.name}) x{self.quantity}"
    
    class Meta:
        verbose_name = "Позиция заказа"
        verbose_name_plural = "Позиции заказа"

class Review(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='reviews')
    pizza = models.ForeignKey(Pizza, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Отзыв на {self.pizza.name} от {self.customer}"
    
    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ['-created_at']

class Promotion(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    discount_percentage = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    start_date = models.DateField()
    end_date = models.DateField()
    image = models.ImageField(upload_to='promotions/', null=True, blank=True)
    pizzas = models.ManyToManyField(Pizza, related_name='promotions', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_valid(self):
        today = date.today()
        return self.is_active and self.start_date <= today <= self.end_date

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Акция"
        verbose_name_plural = "Акции"
        ordering = ['-start_date']

class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question
    
    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Часто задаваемые вопросы"
        ordering = ['created_at']

class Article(models.Model):
    title = models.CharField('Заголовок', max_length=200)
    content = models.TextField('Содержание')
    short_description = models.CharField('Краткое описание', max_length=255)
    image = models.ImageField('Изображение', upload_to='articles/')
    is_published = models.BooleanField('Опубликовано', default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Статья'
        verbose_name_plural = 'Статьи'
        ordering = ['-created_at']

class GlossaryTerm(models.Model):
    term = models.CharField('Термин', max_length=100)
    definition = models.TextField('Определение')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.term

    class Meta:
        verbose_name = 'Термин'
        verbose_name_plural = 'Термины'
        ordering = ['term']

class Staff(models.Model):
    name = models.CharField('ФИО', max_length=100)
    position = models.CharField('Должность', max_length=100)
    description = models.TextField('Описание обязанностей')
    photo = models.ImageField('Фото', upload_to='staff/')
    phone = models.CharField('Телефон', max_length=20, blank=True)
    email = models.EmailField('Email', blank=True)
    birth_date = models.DateField('Дата рождения', validators=[validate_age], null=True, blank=True)
    order = models.IntegerField('Порядок', default=0)
    is_active = models.BooleanField('Активен', default=True)

    def age(self):
        if self.birth_date:
            today = date.today()
            return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        return None

    def __str__(self):
        return f"{self.name} - {self.position}"

    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'
        ordering = ['order']

class Vacancy(models.Model):
    title = models.CharField('Название вакансии', max_length=200)
    description = models.TextField('Описание')
    requirements = models.TextField('Требования')
    conditions = models.TextField('Условия')
    salary_from = models.DecimalField('Зарплата от', max_digits=10, decimal_places=2, null=True, blank=True)
    salary_to = models.DecimalField('Зарплата до', max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField('Активна', default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Вакансия'
        verbose_name_plural = 'Вакансии'
        ordering = ['-created_at']

class PromoCode(models.Model):
    code = models.CharField('Код', max_length=50, unique=True)
    description = models.TextField('Описание')
    discount_amount = models.DecimalField('Сумма скидки', max_digits=10, decimal_places=2)
    discount_type = models.CharField('Тип скидки', max_length=20, choices=[
        ('fixed', 'Фиксированная сумма'),
        ('percent', 'Процент'),
    ])
    min_order_amount = models.DecimalField('Минимальная сумма заказа', max_digits=10, decimal_places=2, default=0)
    start_date = models.DateTimeField('Дата начала')
    end_date = models.DateTimeField('Дата окончания')
    is_active = models.BooleanField('Активен', default=True)
    usage_limit = models.IntegerField('Лимит использований', null=True, blank=True)
    times_used = models.IntegerField('Использовано раз', default=0)

    def calculate_discount(self, subtotal):
        """Calculate discount amount for a given subtotal"""
        if not self.is_valid or subtotal < self.min_order_amount:
            return Decimal('0')
        
        if self.discount_type == 'fixed':
            return min(self.discount_amount, subtotal)
        else:  # percent
            return (subtotal * self.discount_amount / Decimal('100')).quantize(Decimal('0.01'))

    def __str__(self):
        return self.code

    @property
    def is_expired(self):
        return timezone.now() > self.end_date

    @property
    def is_valid(self):
        now = timezone.now()
        if not self.is_active or now < self.start_date or now > self.end_date:
            return False
        if self.usage_limit and self.times_used >= self.usage_limit:
            return False
        return True

    class Meta:
        verbose_name = 'Промокод'
        verbose_name_plural = 'Промокоды'
        ordering = ['-end_date']
