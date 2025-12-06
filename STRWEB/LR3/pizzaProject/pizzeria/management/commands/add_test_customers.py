from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from pizzeria.models import Customer
from datetime import date
import random

class Command(BaseCommand):
    help = 'Add test customers to the database'

    def handle(self, *args, **kwargs):
        # List of test customers
        customers = [
            {
                'username': 'ivan_petrov',
                'first_name': 'Иван',
                'last_name': 'Петров',
                'email': 'ivan@example.com',
                'phone': '+375 (29) 111-22-33',
                'birth_date': date(1990, 5, 15),
                'address': 'ул. Ленина, 1, кв. 10'
            },
            {
                'username': 'anna_ivanova',
                'first_name': 'Анна',
                'last_name': 'Иванова',
                'email': 'anna@example.com',
                'phone': '+375 (29) 222-33-44',
                'birth_date': date(1992, 8, 20),
                'address': 'пр. Победителей, 5, кв. 25'
            },
            {
                'username': 'pavel_sidorov',
                'first_name': 'Павел',
                'last_name': 'Сидоров',
                'email': 'pavel@example.com',
                'phone': '+375 (29) 333-44-55',
                'birth_date': date(1988, 3, 10),
                'address': 'ул. Притыцкого, 15, кв. 42'
            },
            {
                'username': 'elena_kozlova',
                'first_name': 'Елена',
                'last_name': 'Козлова',
                'email': 'elena@example.com',
                'phone': '+375 (29) 444-55-66',
                'birth_date': date(1995, 11, 25),
                'address': 'ул. Немига, 3, кв. 15'
            },
            {
                'username': 'dmitry_volkov',
                'first_name': 'Дмитрий',
                'last_name': 'Волков',
                'email': 'dmitry@example.com',
                'phone': '+375 (29) 555-66-77',
                'birth_date': date(1985, 7, 8),
                'address': 'пр. Независимости, 77, кв. 89'
            }
        ]

        for customer_data in customers:
            try:
                # Create user if doesn't exist
                if not User.objects.filter(username=customer_data['username']).exists():
                    user = User.objects.create_user(
                        username=customer_data['username'],
                        email=customer_data['email'],
                        password='testpass123',
                        first_name=customer_data['first_name'],
                        last_name=customer_data['last_name']
                    )

                    # Create customer profile
                    Customer.objects.create(
                        user=user,
                        phone_number=customer_data['phone'],
                        birth_date=customer_data['birth_date'],
                        address=customer_data['address']
                    )
                    self.stdout.write(self.style.SUCCESS(
                        f'Successfully created customer: {customer_data["first_name"]} {customer_data["last_name"]}'
                    ))
                else:
                    self.stdout.write(self.style.WARNING(
                        f'Customer {customer_data["username"]} already exists'
                    ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f'Error creating customer {customer_data["username"]}: {str(e)}'
                ))

        self.stdout.write(self.style.SUCCESS('Successfully added all test customers')) 