from django.db import migrations
from django.utils import timezone
from datetime import timedelta, date
from django.contrib.auth.models import User

def add_initial_reviews(apps, schema_editor):
    Review = apps.get_model('pizzeria', 'Review')
    Customer = apps.get_model('pizzeria', 'Customer')
    Pizza = apps.get_model('pizzeria', 'Pizza')
    User = apps.get_model('auth', 'User')
    
    # Get base date for reviews (30 days ago)
    base_date = timezone.now() - timedelta(days=30)
    
    # Get or create test users and customers
    customers_data = [
        ('anna_petrova', 'Анна', 'Петрова', date(1990, 3, 15)),
        ('mikhail_ivanov', 'Михаил', 'Иванов', date(1985, 7, 22)),
        ('elena_sokolova', 'Елена', 'Соколова', date(1992, 11, 8)),
        ('dmitry_kozlov', 'Дмитрий', 'Козлов', date(1988, 4, 30)),
        ('olga_morozova', 'Ольга', 'Морозова', date(1995, 9, 12)),
        ('sergey_volkov', 'Сергей', 'Волков', date(1987, 6, 25)),
        ('maria_nikolaeva', 'Мария', 'Николаева', date(1993, 2, 18)),
        ('alexander_fedorov', 'Александр', 'Федоров', date(1991, 8, 5)),
        ('natalia_smirnova', 'Наталья', 'Смирнова', date(1989, 12, 1)),
        ('igor_vasiliev', 'Игорь', 'Васильев', date(1986, 5, 14))
    ]
    
    customers = []
    for username, first_name, last_name, birth_date in customers_data:
        user = User.objects.create(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=f"{username}@example.com"
        )
        customer = Customer.objects.create(
            user=user,
            phone_number='+7 (999) 123-45-67',  # Example phone number
            address='г. Москва',  # Example address
            birth_date=birth_date
        )
        customers.append(customer)
    
    # Get some pizzas (assuming they exist)
    pizzas = Pizza.objects.all()[:5]  # Get first 5 pizzas
    if not pizzas:
        return  # Exit if no pizzas exist
    
    reviews_data = [
        {
            'customer_index': 0,
            'pizza_index': 0,
            'rating': 5,
            'text': 'Потрясающая пицца! Тесто тонкое, хрустящее, начинка щедрая. Доставили за 35 минут, пицца была очень горячая. Отдельное спасибо курьеру за вежливость и пунктуальность.',
            'days_ago': 29
        },
        {
            'customer_index': 1,
            'pizza_index': 1,
            'rating': 4,
            'text': 'Регулярно заказываю здесь пиццу. Качество стабильно хорошее, но в этот раз начинки могло быть побольше. Тем не менее, доставка как всегда быстрая, а пицца вкусная.',
            'days_ago': 27
        },
        {
            'customer_index': 2,
            'pizza_index': 2,
            'rating': 5,
            'text': 'Открыла для себя их вегетарианскую пиццу с грибами и трюфельным маслом - это что-то невероятное! Также порадовала возможность оплаты через Apple Pay. Всё очень удобно и вкусно.',
            'days_ago': 25
        },
        {
            'customer_index': 3,
            'pizza_index': 3,
            'rating': 3,
            'text': 'Пицца вкусная, но доставка сегодня подвела. Ждал больше часа, хотя обещали за 45 минут. Курьер извинился и объяснил, что были пробки. Надеюсь, в следующий раз будет быстрее.',
            'days_ago': 20
        },
        {
            'customer_index': 4,
            'pizza_index': 4,
            'rating': 5,
            'text': 'Заказывали большую компанию на день рождения - 6 разных пицц. Все приехали горячие, вовремя. Особенно впечатлила "Пепперони" - идеальный уровень остроты. Спасибо за отличный праздник!',
            'days_ago': 15
        },
        {
            'customer_index': 5,
            'pizza_index': 0,
            'rating': 4,
            'text': 'Хорошая пицца, адекватные цены. Особенно приятно, что при заказе от 30€ доставка бесплатная. Бонусная программа тоже неплохая - уже накопил на бесплатную пиццу.',
            'days_ago': 10
        },
        {
            'customer_index': 6,
            'pizza_index': 1,
            'rating': 5,
            'text': 'Впервые попробовала их кальцоне - это просто восторг! Тесто нежное, начинка сочная. А еще очень удобно отслеживать заказ через приложение. Буду заказывать еще!',
            'days_ago': 7
        },
        {
            'customer_index': 7,
            'pizza_index': 2,
            'rating': 2,
            'text': 'Разочарован последним заказом. Пицца приехала холодная, а половина начинки была на одной стороне. Служба поддержки извинилась и предложила компенсацию, но осадок остался.',
            'days_ago': 5
        },
        {
            'customer_index': 8,
            'pizza_index': 3,
            'rating': 5,
            'text': 'Обожаю их акцию "NIGHT50"! Часто заказываем с мужем после работы. Пицца всегда свежая, горячая, а персонал очень приветливый. Отдельный плюс за разнообразное меню.',
            'days_ago': 3
        },
        {
            'customer_index': 9,
            'pizza_index': 4,
            'rating': 4,
            'text': 'Заказываю не первый раз, всегда всё отлично. В этот раз взял новинку - пиццу с морепродуктами. Вкусно, но для меня немного дороговато. А так, сервис на высоте!',
            'days_ago': 1
        }
    ]
    
    for review_data in reviews_data:
        customer = customers[review_data['customer_index']]
        pizza = pizzas[review_data['pizza_index']]
        
        Review.objects.create(
            customer=customer,
            pizza=pizza,
            rating=review_data['rating'],
            text=review_data['text'],
            created_at=base_date + timedelta(days=30 - review_data['days_ago'])
        )

def remove_initial_reviews(apps, schema_editor):
    Review = apps.get_model('pizzeria', 'Review')
    Customer = apps.get_model('pizzeria', 'Customer')
    User = apps.get_model('auth', 'User')
    
    # Delete all reviews
    Review.objects.all().delete()
    # Delete test customers and their users
    Customer.objects.filter(user__username__in=[
        'anna_petrova', 'mikhail_ivanov', 'elena_sokolova',
        'dmitry_kozlov', 'olga_morozova', 'sergey_volkov',
        'maria_nikolaeva', 'alexander_fedorov', 'natalia_smirnova',
        'igor_vasiliev'
    ]).delete()
    User.objects.filter(username__in=[
        'anna_petrova', 'mikhail_ivanov', 'elena_sokolova',
        'dmitry_kozlov', 'olga_morozova', 'sergey_volkov',
        'maria_nikolaeva', 'alexander_fedorov', 'natalia_smirnova',
        'igor_vasiliev'
    ]).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0008_add_faq_questions'),
    ]

    operations = [
        migrations.RunPython(add_initial_reviews, remove_initial_reviews),
    ] 