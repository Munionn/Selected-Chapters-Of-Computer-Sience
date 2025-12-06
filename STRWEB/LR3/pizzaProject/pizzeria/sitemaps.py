from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Pizza, Article, Promotion, Vacancy

class StaticViewSitemap(Sitemap):
    priority = 0.5
    changefreq = 'daily'

    def items(self):
        return ['home', 'about', 'menu', 'contacts', 'faq', 'reviews', 'staff', 'vacancies']

    def location(self, item):
        return reverse(f'pizzeria:{item}')

class PizzaSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.7

    def items(self):
        return Pizza.objects.all()

    def location(self, obj):
        return reverse('pizzeria:pizza_detail', args=[obj.id])

    def lastmod(self, obj):
        return obj.updated_at

class ArticleSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.6

    def items(self):
        return Article.objects.filter(is_published=True)

    def location(self, obj):
        return reverse('pizzeria:article_detail', args=[obj.id])

    def lastmod(self, obj):
        return obj.updated_at

class PromotionSitemap(Sitemap):
    changefreq = 'daily'
    priority = 0.8

    def items(self):
        return Promotion.objects.filter(is_active=True)

    def location(self, obj):
        return reverse('pizzeria:promotions')

    def lastmod(self, obj):
        return obj.updated_at

class VacancySitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.6

    def items(self):
        return Vacancy.objects.filter(is_active=True)

    def location(self, obj):
        return reverse('pizzeria:vacancies')
