from django.core.management.base import BaseCommand
from django.core.files import File
from pizzeria.models import Staff
from datetime import date
import os

class Command(BaseCommand):
    help = 'Add staff members to the database'

    def handle(self, *args, **kwargs):
        # List of staff members to add
        staff_members = [
            {
                'name': 'Иванов Александр Петрович',
                'position': 'Директор',
                'description': 'Руководит компанией с момента её основания. Имеет более 15 лет опыта в ресторанном бизнесе.',
                'phone': '+375 (29) 555-11-00',
                'email': 'director@pizzeria.by',
                'birth_date': date(1980, 5, 15),
                'order': 1
            },
            {
                'name': 'Петрова Елена Сергеевна',
                'position': 'Заместитель директора',
                'description': 'Отвечает за операционное управление и развитие сети. Опыт работы в сфере общественного питания более 10 лет.',
                'phone': '+375 (29) 555-11-01',
                'email': 'deputy@pizzeria.by',
                'birth_date': date(1985, 8, 23),
                'order': 2
            },
            {
                'name': 'Сидоров Михаил Иванович',
                'position': 'Шеф-повар',
                'description': 'Профессиональный повар с опытом работы в Италии. Разрабатывает новые рецепты и следит за качеством блюд.',
                'phone': '+375 (29) 555-11-02',
                'email': 'chef@pizzeria.by',
                'birth_date': date(1982, 3, 10),
                'order': 3
            },
            {
                'name': 'Козлова Анна Дмитриевна',
                'position': 'Менеджер по персоналу',
                'description': 'Занимается подбором и обучением персонала. Создает дружественную атмосферу в коллективе.',
                'phone': '+375 (29) 555-11-03',
                'email': 'hr@pizzeria.by',
                'birth_date': date(1988, 11, 7),
                'order': 4
            },
            {
                'name': 'Новиков Дмитрий Александрович',
                'position': 'Старший пиццамейкер',
                'description': 'Виртуозно готовит пиццу и обучает новых сотрудников. Победитель городского конкурса пиццамейкеров 2023 года.',
                'phone': '+375 (29) 555-11-04',
                'email': 'pizza@pizzeria.by',
                'birth_date': date(1990, 6, 20),
                'order': 5
            },
            {
                'name': 'Морозова Светлана Игоревна',
                'position': 'Менеджер по маркетингу',
                'description': 'Разрабатывает маркетинговые стратегии и акции. Ведет социальные сети компании.',
                'phone': '+375 (29) 555-11-05',
                'email': 'marketing@pizzeria.by',
                'birth_date': date(1992, 9, 15),
                'order': 6
            },
            {
                'name': 'Волков Игорь Сергеевич',
                'position': 'Старший курьер',
                'description': 'Координирует работу службы доставки. Обеспечивает своевременную доставку заказов.',
                'phone': '+375 (29) 555-11-06',
                'email': 'delivery@pizzeria.by',
                'birth_date': date(1987, 4, 25),
                'order': 7
            },
            {
                'name': 'Соколова Мария Андреевна',
                'position': 'Администратор',
                'description': 'Встречает гостей и следит за качеством обслуживания. Решает все вопросы клиентов.',
                'phone': '+375 (29) 555-11-07',
                'email': 'admin@pizzeria.by',
                'birth_date': date(1993, 12, 3),
                'order': 8
            }
        ]

        # Create staff members
        for staff_data in staff_members:
            try:
                # Check if staff member already exists
                if not Staff.objects.filter(name=staff_data['name']).exists():
                    staff = Staff.objects.create(**staff_data)
                    self.stdout.write(self.style.SUCCESS(f'Successfully added staff member: {staff.name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Staff member already exists: {staff_data["name"]}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error adding staff member {staff_data["name"]}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS('Successfully added all staff members')) 