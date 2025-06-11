from django.core.management.base import BaseCommand
from pizzeria.models import Review
from django.db.models import Avg

class Command(BaseCommand):
    help = 'List all reviews in the database'

    def handle(self, *args, **kwargs):
        reviews = Review.objects.select_related('customer__user', 'pizza').order_by('-created_at')
        avg_rating = Review.objects.aggregate(Avg('rating'))['rating__avg']

        self.stdout.write(self.style.SUCCESS(f'\nTotal reviews: {reviews.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Average rating: {avg_rating:.1f} stars\n'))

        for review in reviews:
            self.stdout.write(self.style.SUCCESS('='*80))
            self.stdout.write(
                f'Author: {review.customer.user.get_full_name()} ({review.customer.user.username})\n'
                f'Pizza: {review.pizza.name}\n'
                f'Rating: {"★" * review.rating}{"☆" * (5-review.rating)}\n'
                f'Date: {review.created_at.strftime("%d.%m.%Y %H:%M")}\n'
                f'Text: {review.text}\n'
            ) 