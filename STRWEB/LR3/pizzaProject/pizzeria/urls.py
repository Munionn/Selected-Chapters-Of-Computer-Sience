from django.urls import path
from . import views
from .views import (
    ArticleListView, ArticleDetailView,
    GlossaryView, StaffListView,
    VacancyListView, PromoCodeListView,
    ReviewListView, PrivacyPolicyView
)

app_name = 'pizzeria'

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('menu/', views.menu, name='menu'),
    path('pizza/<int:pizza_id>/', views.pizza_detail, name='pizza_detail'),
    path('cart/', views.cart, name='cart'),
    path('add-to-cart/<int:pizza_id>/', views.add_to_cart, name='add_to_cart'),
    path('update-cart/<int:item_id>/', views.update_cart, name='update_cart'),
    path('apply-promo/', views.apply_promo, name='apply_promo'),
    path('checkout/', views.checkout, name='checkout'),
    path('payment/<int:order_id>/', views.payment, name='payment'),
    path('process-payment/', views.process_payment, name='process_payment'),
    path('order-confirmation/<int:order_id>/', views.order_confirmation, name='order_confirmation'),
    path('profile/', views.profile, name='profile'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('promotions/', views.promotions, name='promotions'),
    path('faq/', views.faq, name='faq'),
    path('add-review/<int:pizza_id>/', views.add_review, name='add_review'),
    path('statistics/', views.StatisticsView.as_view(), name='statistics'),
    path('news/', ArticleListView.as_view(), name='news_list'),
    path('news/<int:pk>/', ArticleDetailView.as_view(), name='article_detail'),
    path('glossary/', GlossaryView.as_view(), name='glossary'),
    path('staff/', StaffListView.as_view(), name='staff'),
    path('vacancies/', VacancyListView.as_view(), name='vacancies'),
    path('promo-codes/', PromoCodeListView.as_view(), name='promo_codes'),
    path('contacts/', views.ContactsView.as_view(), name='contacts'),
    path('contacts-table/', views.contacts_table, name='contacts_table'),
    path('api/staff/', views.api_staff_list, name='api_staff_list'),
    path('privacy/', PrivacyPolicyView.as_view(), name='privacy'),
    path('reviews/', ReviewListView.as_view(), name='reviews'),
    path('reviews/new/', views.choose_pizza_for_review, name='new_review'),
    path('responsive-demo/', views.responsive_demo, name='responsive_demo'),
    
    # Admin URLs
    
    path('admin/pizzas/', views.admin_pizzas, name='admin_pizzas'),
    path('admin/orders/', views.admin_orders, name='admin_orders'),
    path('admin/customers/', views.admin_customers, name='admin_customers'),
    path('admin/analytics/', views.admin_analytics, name='admin_analytics'),
    path('admin/pizzas/add/', views.add_pizza, name='add_pizza'),
    path('admin/pizzas/<int:pizza_id>/edit/', views.edit_pizza, name='edit_pizza'),
    path('admin/pizzas/<int:pizza_id>/delete/', views.delete_pizza, name='delete_pizza'),
    path('admin/orders/<int:order_id>/status/', views.update_order_status, name='update_order_status'),
    path('admin/slider-settings/', views.admin_slider_settings, name='admin_slider_settings'),
    path('admin/range-generator/', views.admin_range_generator, name='admin_range_generator'),
    
    # API URLs
    path('api/pizzas/<int:pizza_id>/', views.api_pizza_detail, name='api_pizza_detail'),
    path('api/orders/<int:order_id>/', views.api_order_detail, name='api_order_detail'),
    path('api/customers/<int:customer_id>/', views.api_customer_detail, name='api_customer_detail'),
    path('api/analytics/', views.api_analytics, name='api_analytics'),
] 