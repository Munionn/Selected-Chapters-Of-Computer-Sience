from django.db import migrations
from datetime import date, timedelta

def add_initial_promotions(apps, schema_editor):
    Promotion = apps.get_model('pizzeria', 'Promotion')
    Pizza = apps.get_model('pizzeria', 'Pizza')
    
    # Get today's date for start dates
    today = date.today()
    
    promotions = [
        {
            'name': 'Счастливые часы',
            'description': 'Скидка 25% на все пиццы с 14:00 до 17:00. Идеальное время для обеда! Акция действует на все виды пицц в меню.',
            'discount_percentage': 25,
            'start_date': today,
            'end_date': today + timedelta(days=90),
            'is_active': True
        },
        {
            'name': 'Большая компания',
            'description': 'При заказе 3 больших пицц - скидка 30% на весь заказ. Отличное предложение для дружеских встреч и корпоративов!',
            'discount_percentage': 30,
            'start_date': today,
            'end_date': today + timedelta(days=60),
            'is_active': True
        },
        {
            'name': 'Студенческая среда',
            'description': 'Каждую среду скидка 20% для студентов при предъявлении студенческого билета. Сделаем учебные будни вкуснее!',
            'discount_percentage': 20,
            'start_date': today,
            'end_date': today + timedelta(days=180),
            'is_active': True
        },
        {
            'name': 'Утренний завтрак',
            'description': 'Скидка 15% на все пиццы до 12:00. Начните день с вкусной пиццы по специальной цене!',
            'discount_percentage': 15,
            'start_date': today,
            'end_date': today + timedelta(days=45),
            'is_active': True
        },
        {
            'name': 'Семейный weekend',
            'description': 'Скидка 35% на большие пиццы в выходные дни. Проведите время с семьей за вкусной пиццей!',
            'discount_percentage': 35,
            'start_date': today,
            'end_date': today + timedelta(days=120),
            'is_active': True
        },
        {
            'name': 'Комбо дня',
            'description': 'Закажите пиццу дня со скидкой 40%. Каждый день новая пицца по специальной цене!',
            'discount_percentage': 40,
            'start_date': today,
            'end_date': today + timedelta(days=30),
            'is_active': True
        },
        {
            'name': 'Ночной дожор',
            'description': 'Скидка 45% на все пиццы после 22:00. Для тех, кто любит поздние ужины!',
            'discount_percentage': 45,
            'start_date': today,
            'end_date': today + timedelta(days=75),
            'is_active': True
        },
        {
            'name': 'Праздничное настроение',
            'description': 'Скидка 50% на вторую пиццу в заказе. Добавьте праздника в свой день!',
            'discount_percentage': 50,
            'start_date': today,
            'end_date': today + timedelta(days=15),
            'is_active': True
        },
        {
            'name': 'Первый заказ',
            'description': 'Скидка 25% на первый заказ для новых клиентов. Попробуйте нашу пиццу и влюбитесь в её вкус!',
            'discount_percentage': 25,
            'start_date': today,
            'end_date': today + timedelta(days=365),
            'is_active': True
        },
        {
            'name': 'Большая пицца',
            'description': 'Скидка 30% на все пиццы размера XL. Больше пиццы - больше удовольствия!',
            'discount_percentage': 30,
            'start_date': today,
            'end_date': today + timedelta(days=45),
            'is_active': True
        }
    ]
    
    # Create promotions
    for promo_data in promotions:
        promotion = Promotion.objects.create(**promo_data)
        
        # Add some random pizzas to each promotion
        pizzas = Pizza.objects.all().order_by('?')[:3]  # Get 3 random pizzas
        promotion.pizzas.add(*pizzas)

def remove_initial_promotions(apps, schema_editor):
    Promotion = apps.get_model('pizzeria', 'Promotion')
    Promotion.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0012_merge_0010_add_initial_staff_0011_add_initial_staff'),
    ]

    operations = [
        migrations.RunPython(add_initial_promotions, remove_initial_promotions),
    ] 