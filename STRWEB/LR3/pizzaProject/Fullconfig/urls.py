"""
URL configuration for Tailor project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from django.views.generic import TemplateView
from pizzeria.sitemaps import (
    StaticViewSitemap, PizzaSitemap, ArticleSitemap,
    PromotionSitemap, VacancySitemap
)
from pizzeria import views as pizzeria_views

sitemaps = {
    'static': StaticViewSitemap,
    'pizzas': PizzaSitemap,
    'articles': ArticleSitemap,
    'promotions': PromotionSitemap,
    'vacancies': VacancySitemap,
}

urlpatterns = [
    # Custom admin routes (must be before Django admin to avoid conflicts)
    path('admin/range-generator/', pizzeria_views.admin_range_generator, name='admin_range_generator'),
    path('admin/', admin.site.urls),
    path('pizzeria/', include('pizzeria.urls', namespace='pizzeria')),
    path('', include('pizzeria.urls', namespace='pizzeria_root')),  # Keep root URLs for homepage etc.
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
