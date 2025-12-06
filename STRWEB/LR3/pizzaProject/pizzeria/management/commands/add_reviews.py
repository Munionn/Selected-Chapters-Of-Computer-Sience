from django.core.management.base import BaseCommand
from pizzeria.models import Review, Pizza, Customer
from django.contrib.auth.models import User
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Add sample reviews for pizzas'

    def handle(self, *args, **kwargs):
        # List of realistic review texts
        positive_reviews = [
            "Отличная пицца! Тесто тонкое и хрустящее, начинка щедрая. Особенно понравился соус - в меру острый и ароматный.",
            "Заказываю здесь уже не первый раз, качество всегда на высоте. Доставка быстрая, пицца приезжает горячей.",
            "Восхитительное сочетание ингредиентов! Видно, что шеф-повар действительно знает своё дело.",
            "Пицца превзошла все ожидания! Идеальное соотношение теста и начинки, все ингредиенты свежие.",
            "Наконец-то нашёл пиццерию, где делают настоящую итальянскую пиццу. Тесто тонкое, края красиво запечённые.",
            "Очень вкусно! Порадовало разнообразие начинок и возможность выбрать размер. Буду заказывать ещё.",
            "Великолепный вкус! Особенно понравилось тесто - тонкое, но при этом не разваливается.",
            "Заказывали большой компанией, все остались довольны. Отдельное спасибо за пунктуальную доставку."
        ]

        neutral_reviews = [
            "Пицца неплохая, но соус мог бы быть поострее. В целом нормально.",
            "Вкусно, но немного дороговато. Порции хорошие, доставка в срок.",
            "Средняя пицца. Ничего особенного, но и явных минусов нет.",
            "Нормальное соотношение цены и качества. Доставили вовремя, но пицца уже слегка остыла.",
            "Вполне съедобно, но я пробовал и получше. Впрочем, для повседневного заказа сойдёт."
        ]

        critical_reviews = [
            "Начинки могло бы быть и побольше. Тесто хорошее, но в целом не впечатлило.",
            "Доставили с опозданием, пицца успела остыть. Вкус неплохой, но впечатление подпортилось.",
            "Ожидал большего за такую цену. Начинка распределена неравномерно.",
            "Пицца слишком соленая, а тесто местами подгорело. Надеюсь, это разовый случай."
        ]

        # Get all pizzas and customers
        pizzas = list(Pizza.objects.all())
        customers = list(Customer.objects.all())

        if not pizzas:
            self.stdout.write(self.style.ERROR('No pizzas found in database'))
            return

        if not customers:
            self.stdout.write(self.style.ERROR('No customers found in database'))
            return

        # Generate reviews
        reviews_to_create = []
        now = datetime.now()

        for pizza in pizzas:
            # Generate 3-7 reviews per pizza
            num_reviews = random.randint(3, 7)
            
            for _ in range(num_reviews):
                # Select random customer
                customer = random.choice(customers)
                
                # Determine rating and review text
                rating = random.choices([5, 4, 3, 2], weights=[0.4, 0.3, 0.2, 0.1])[0]
                
                if rating >= 4:
                    text = random.choice(positive_reviews)
                elif rating == 3:
                    text = random.choice(neutral_reviews)
                else:
                    text = random.choice(critical_reviews)

                # Generate random date within last 3 months
                days_ago = random.randint(0, 90)
                review_date = now - timedelta(days=days_ago)

                try:
                    # Create review if it doesn't exist
                    if not Review.objects.filter(customer=customer, pizza=pizza).exists():
                        review = Review.objects.create(
                            customer=customer,
                            pizza=pizza,
                            rating=rating,
                            text=text,
                            created_at=review_date
                        )
                        self.stdout.write(self.style.SUCCESS(
                            f'Added review for {pizza.name} by {customer.user.username}'
                        ))
                    else:
                        self.stdout.write(self.style.WARNING(
                            f'Review already exists for {pizza.name} by {customer.user.username}'
                        ))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(
                        f'Error adding review for {pizza.name}: {str(e)}'
                    ))

        self.stdout.write(self.style.SUCCESS('Successfully added reviews')) 