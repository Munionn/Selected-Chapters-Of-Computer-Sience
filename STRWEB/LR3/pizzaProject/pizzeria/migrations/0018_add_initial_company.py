from django.db import migrations
from django.utils import timezone

def add_initial_company(apps, schema_editor):
    Company = apps.get_model('pizzeria', 'Company')
    CompanyHistory = apps.get_model('pizzeria', 'CompanyHistory')
    
    # Создаем компанию
    company = Company.objects.create(
        name='PizzaMaster',
        description='Мы - команда профессионалов, влюбленных в свое дело. Наша миссия - создавать идеальную пиццу, используя только лучшие ингредиенты и следуя традиционным итальянским рецептам.',
        history='История нашей компании началась в 2018 году с небольшой пиццерии в центре города.',
        video_url='https://www.youtube.com/embed/dQw4w9WgXcQ',  # Замените на реальное видео
        address='г. Минск, ул. Пиццы, 123',
        phone='+375 (29) 123-45-67',
        email='info@pizzamaster.by',
        registration_number='123456789',
        tax_number='987654321',
        bank_details='''
        ОАО "БПС-Сбербанк"
        БИК: BPSBBY2X
        р/с: BY12BPSB3012345678901234567
        УНП: 987654321
        ''',
        working_hours='Пн-Чт: 10:00-22:00, Пт-Вс: 10:00-23:00',
        delivery_hours='Пн-Вс: 11:00-21:30',
        delivery_price=5.00,
        free_delivery_from=30.00,
        min_order_price=15.00,
        delivery_time='60 минут или пицца бесплатно',
        about_us='Мы используем только свежие ингредиенты высшего качества. Наши повара прошли обучение в Италии.',
        slogan='Вкус, который объединяет!',
        instagram='https://instagram.com/pizzamaster',
        facebook='https://facebook.com/pizzamaster',
        vk='https://vk.com/pizzamaster',
        meta_keywords='пицца, доставка пиццы, итальянская кухня, пиццерия',
        meta_description='Лучшая пиццерия в городе с доставкой. Свежие ингредиенты, быстрая доставка, отличный сервис.'
    )
    
    # Добавляем историю компании
    history_entries = [
        {
            'year': 2018,
            'title': 'Открытие первой пиццерии',
            'description': 'Открытие нашей первой пиццерии в центре города. Начало большого пути.',
            'company': company
        },
        {
            'year': 2019,
            'title': 'Запуск доставки',
            'description': 'Запуск собственной службы доставки. Теперь наша пицца доступна во всех районах города.',
            'company': company
        },
        {
            'year': 2020,
            'title': 'Открытие второй точки',
            'description': 'Открытие второй пиццерии в спальном районе. Расширение зоны доставки.',
            'company': company
        },
        {
            'year': 2021,
            'title': 'Обновление меню',
            'description': 'Полное обновление меню. Добавление новых видов пиццы и специальных предложений.',
            'company': company
        },
        {
            'year': 2022,
            'title': 'Награда "Лучшая пиццерия"',
            'description': 'Получение престижной награды "Лучшая пиццерия года" по версии городского портала.',
            'company': company
        },
        {
            'year': 2023,
            'title': 'Открытие учебного центра',
            'description': 'Открытие собственного учебного центра для подготовки профессиональных пиццамейкеров.',
            'company': company
        }
    ]
    
    for entry in history_entries:
        CompanyHistory.objects.create(**entry)

def remove_initial_company(apps, schema_editor):
    Company = apps.get_model('pizzeria', 'Company')
    Company.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0017_add_initial_certificates'),
    ]

    operations = [
        migrations.RunPython(add_initial_company, remove_initial_company),
    ]
