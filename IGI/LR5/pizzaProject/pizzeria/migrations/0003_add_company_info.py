from django.db import migrations
from decimal import Decimal

def add_company_info(apps, schema_editor):
    Company = apps.get_model('pizzeria', 'Company')
    
    # Create main company information
    Company.objects.create(
        name='Пиццерия "Вкусная Пицца"',
        description='Мы готовим самую вкусную пиццу в городе с 2020 года. Используем только свежие ингредиенты и традиционные итальянские рецепты.',
        history="""Наша пиццерия начала свою работу в 2020 году с небольшой кухни и одного пиццамейкера. 
Сегодня мы - команда профессионалов, влюбленных в свое дело.

Мы используем:
- Муку высшего сорта из итальянской пшеницы
- Свежие овощи от локальных фермеров
- Настоящий итальянский соус и специи
- Сыр моцарелла высшего качества

Наши преимущества:
- Доставка в течение 60 минут или пицца бесплатно
- Собственное производство теста
- Регулярные акции и специальные предложения
- Программа лояльности для постоянных клиентов""",
        address='ул. Пиццы, д. 1, Москва',
        phone='+7 (999) 123-45-67',
        email='info@pizzeria.ru',
        registration_number='1234567890',
        tax_number='0987654321',
        bank_details='ПАО Сбербанк\nБИК: 044525225\nр/с: 40702810038000123456',
        lat=55.753215,
        lng=37.622504
    )

def remove_company_info(apps, schema_editor):
    Company = apps.get_model('pizzeria', 'Company')
    Company.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0002_add_initial_pizzas'),
    ]

    operations = [
        migrations.RunPython(add_company_info, remove_company_info),
    ] 