from django.db import migrations
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

def add_initial_promocodes(apps, schema_editor):
    PromoCode = apps.get_model('pizzeria', 'PromoCode')
    
    # Get current time for start dates
    now = timezone.now()
    
    promocodes = [
        {
            'code': 'WELCOME2024',
            'description': 'Скидка 15% на первый заказ для новых клиентов',
            'discount_amount': Decimal('15'),
            'discount_type': 'percent',
            'min_order_amount': Decimal('20.00'),
            'start_date': now,
            'end_date': now + timedelta(days=90),
            'is_active': True,
            'usage_limit': 1000,
            'times_used': 0
        },
        {
            'code': 'PIZZA10',
            'description': 'Скидка 10% на все пиццы',
            'discount_amount': Decimal('10'),
            'discount_type': 'percent',
            'min_order_amount': Decimal('15.00'),
            'start_date': now,
            'end_date': now + timedelta(days=30),
            'is_active': True,
            'usage_limit': None,
            'times_used': 0
        },
        {
            'code': 'FREEDEL',
            'description': 'Бесплатная доставка при заказе от 30€',
            'discount_amount': Decimal('5.00'),
            'discount_type': 'fixed',
            'min_order_amount': Decimal('30.00'),
            'start_date': now,
            'end_date': now + timedelta(days=60),
            'is_active': True,
            'usage_limit': 500,
            'times_used': 0
        },
        {
            'code': 'FAMILY25',
            'description': 'Скидка 25% на заказ от 50€',
            'discount_amount': Decimal('25'),
            'discount_type': 'percent',
            'min_order_amount': Decimal('50.00'),
            'start_date': now,
            'end_date': now + timedelta(days=45),
            'is_active': True,
            'usage_limit': 200,
            'times_used': 0
        },
        {
            'code': 'MONDAY20',
            'description': 'Скидка 20% по понедельникам',
            'discount_amount': Decimal('20'),
            'discount_type': 'percent',
            'min_order_amount': Decimal('25.00'),
            'start_date': now,
            'end_date': now + timedelta(days=180),
            'is_active': True,
            'usage_limit': None,
            'times_used': 0
        },
        {
            'code': 'STUDENT15',
            'description': 'Скидка 15% для студентов',
            'discount_amount': Decimal('15'),
            'discount_type': 'percent',
            'min_order_amount': Decimal('15.00'),
            'start_date': now,
            'end_date': now + timedelta(days=365),
            'is_active': True,
            'usage_limit': None,
            'times_used': 0
        },
        {
            'code': 'BDAY10EUR',
            'description': 'Скидка 10€ в день рождения',
            'discount_amount': Decimal('10.00'),
            'discount_type': 'fixed',
            'min_order_amount': Decimal('20.00'),
            'start_date': now,
            'end_date': now + timedelta(days=365),
            'is_active': True,
            'usage_limit': None,
            'times_used': 0
        },
        {
            'code': 'PARTY30',
            'description': 'Скидка 30% на заказ от 100€',
            'discount_amount': Decimal('30'),
            'discount_type': 'percent',
            'min_order_amount': Decimal('100.00'),
            'start_date': now,
            'end_date': now + timedelta(days=90),
            'is_active': True,
            'usage_limit': 100,
            'times_used': 0
        },
        {
            'code': 'WEEKEND5',
            'description': 'Скидка 5€ на заказы в выходные',
            'discount_amount': Decimal('5.00'),
            'discount_type': 'fixed',
            'min_order_amount': Decimal('25.00'),
            'start_date': now,
            'end_date': now + timedelta(days=180),
            'is_active': True,
            'usage_limit': None,
            'times_used': 0
        },
        {
            'code': 'NIGHT50',
            'description': 'Скидка 50% на второю пиццу после 22:00',
            'discount_amount': Decimal('50'),
            'discount_type': 'percent',
            'min_order_amount': Decimal('30.00'),
            'start_date': now,
            'end_date': now + timedelta(days=90),
            'is_active': True,
            'usage_limit': 300,
            'times_used': 0
        }
    ]
    
    for promo_data in promocodes:
        PromoCode.objects.create(**promo_data)

def remove_initial_promocodes(apps, schema_editor):
    PromoCode = apps.get_model('pizzeria', 'PromoCode')
    PromoCode.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0005_add_initial_vacancies'),
    ]

    operations = [
        migrations.RunPython(add_initial_promocodes, remove_initial_promocodes),
    ] 