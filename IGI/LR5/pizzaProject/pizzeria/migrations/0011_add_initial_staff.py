from django.db import migrations
from django.utils import timezone
from datetime import date

def add_initial_staff(apps, schema_editor):
    Staff = apps.get_model('pizzeria', 'Staff')
    
    staff_members = [
        {
            'name': 'Иванов Александр Петрович',
            'position': 'Директор',
            'description': 'Руководит компанией с момента её основания. Имеет более 15 лет опыта в ресторанном бизнесе. Отвечает за стратегическое развитие сети и поддержание высоких стандартов качества.',
            'phone': '+7 (999) 111-22-33',
            'email': 'director@pizzeria.ru',
            'birth_date': date(1980, 5, 15),
            'order': 1,
            'is_active': True
        },
        {
            'name': 'Петрова Елена Сергеевна',
            'position': 'Заместитель директора',
            'description': 'Отвечает за операционное управление и развитие сети. Опыт работы в сфере общественного питания более 10 лет. Курирует вопросы качества обслуживания и работу с персоналом.',
            'phone': '+7 (999) 111-22-34',
            'email': 'deputy@pizzeria.ru',
            'birth_date': date(1985, 8, 23),
            'order': 2,
            'is_active': True
        },
        {
            'name': 'Сидоров Михаил Иванович',
            'position': 'Шеф-повар',
            'description': 'Профессиональный повар с опытом работы в Италии. Разрабатывает новые рецепты и следит за качеством блюд. Прошел стажировку в лучших пиццериях Неаполя.',
            'phone': '+7 (999) 111-22-35',
            'email': 'chef@pizzeria.ru',
            'birth_date': date(1982, 3, 10),
            'order': 3,
            'is_active': True
        },
        {
            'name': 'Козлова Анна Дмитриевна',
            'position': 'Менеджер по персоналу',
            'description': 'Занимается подбором и обучением персонала. Создает дружественную атмосферу в коллективе. Организует корпоративные мероприятия и тренинги для сотрудников.',
            'phone': '+7 (999) 111-22-36',
            'email': 'hr@pizzeria.ru',
            'birth_date': date(1988, 11, 7),
            'order': 4,
            'is_active': True
        },
        {
            'name': 'Новиков Дмитрий Александрович',
            'position': 'Старший пиццамейкер',
            'description': 'Виртуозно готовит пиццу и обучает новых сотрудников. Победитель городского конкурса пиццамейкеров 2023 года. Специализируется на неаполитанском стиле приготовления.',
            'phone': '+7 (999) 111-22-37',
            'email': 'pizzamaker@pizzeria.ru',
            'birth_date': date(1990, 6, 20),
            'order': 5,
            'is_active': True
        },
        {
            'name': 'Морозова Светлана Игоревна',
            'position': 'Менеджер по маркетингу',
            'description': 'Разрабатывает маркетинговые стратегии и акции. Ведет социальные сети компании. Организует специальные мероприятия и промо-акции.',
            'phone': '+7 (999) 111-22-38',
            'email': 'marketing@pizzeria.ru',
            'birth_date': date(1992, 9, 15),
            'order': 6,
            'is_active': True
        },
        {
            'name': 'Волков Игорь Сергеевич',
            'position': 'Старший курьер',
            'description': 'Координирует работу службы доставки. Обеспечивает своевременную доставку заказов. Следит за качеством сервиса доставки и обучает новых курьеров.',
            'phone': '+7 (999) 111-22-39',
            'email': 'delivery@pizzeria.ru',
            'birth_date': date(1987, 4, 25),
            'order': 7,
            'is_active': True
        },
        {
            'name': 'Соколова Мария Андреевна',
            'position': 'Администратор зала',
            'description': 'Встречает гостей и следит за качеством обслуживания. Решает все вопросы клиентов. Поддерживает высокий уровень сервиса в зале.',
            'phone': '+7 (999) 111-22-40',
            'email': 'admin@pizzeria.ru',
            'birth_date': date(1993, 12, 3),
            'order': 8,
            'is_active': True
        },
        {
            'name': 'Кузнецов Артем Владимирович',
            'position': 'Технолог-разработчик',
            'description': 'Разрабатывает новые рецепты и следит за качеством ингредиентов. Проводит обучение персонала по новым позициям меню. Контролирует соблюдение технологических карт.',
            'phone': '+7 (999) 111-22-41',
            'email': 'tech@pizzeria.ru',
            'birth_date': date(1989, 7, 12),
            'order': 9,
            'is_active': True
        },
        {
            'name': 'Лебедева Екатерина Павловна',
            'position': 'Бухгалтер',
            'description': 'Ведет финансовый учет и отчетность компании. Отвечает за своевременные выплаты сотрудникам. Работает с поставщиками и контролирует расходы.',
            'phone': '+7 (999) 111-22-42',
            'email': 'accountant@pizzeria.ru',
            'birth_date': date(1986, 2, 28),
            'order': 10,
            'is_active': True
        }
    ]
    
    for staff_data in staff_members:
        Staff.objects.create(**staff_data)

def remove_initial_staff(apps, schema_editor):
    Staff = apps.get_model('pizzeria', 'Staff')
    Staff.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0010_make_staff_photo_optional'),
    ]

    operations = [
        migrations.RunPython(add_initial_staff, remove_initial_staff),
    ] 