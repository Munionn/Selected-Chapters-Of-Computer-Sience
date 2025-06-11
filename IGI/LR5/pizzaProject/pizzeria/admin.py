from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import (
    Company, CompanyHistory, Article, GlossaryTerm,
    Staff, Vacancy, PromoCode, PizzaCategory, PizzaSize,
    Pizza, Customer, Order, OrderItem, Review, Promotion, FAQ
)
from django.db import models

# Unregister and customize User admin
admin.site.unregister(User)
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email']
    search_fields = ['name', 'description', 'address']

@admin.register(CompanyHistory)
class CompanyHistoryAdmin(admin.ModelAdmin):
    list_display = ['year', 'title', 'company']
    list_filter = ['year', 'company']
    search_fields = ['title', 'description']
    ordering = ['-year']

@admin.register(PizzaCategory)
class PizzaCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(PizzaSize)
class PizzaSizeAdmin(admin.ModelAdmin):
    list_display = ['name', 'diameter', 'multiplier']
    list_editable = ['multiplier']
    ordering = ['diameter']

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Pizza)
class PizzaAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'base_price', 'is_vegetarian', 'is_spicy']
    list_filter = ['category', 'is_vegetarian', 'is_spicy']
    search_fields = ['name', 'description']
    
    # Добавляем поля для создания/редактирования пиццы
    fields = [
        'name', 'category', 'description', 'image',
        'ingredients', 'sauce', 'base_price', 'available_sizes',
        'is_vegetarian', 'is_spicy', 'calories_per_100g'
    ]
    
    # Добавляем связь many-to-many с размерами
    filter_horizontal = ['available_sizes']

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'address']
    search_fields = ['user__username', 'phone_number', 'address']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price']
    raw_id_fields = ['pizza']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['customer__user__username', 'delivery_address']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'pizza', 'size', 'quantity', 'price']
    list_filter = ['size']
    search_fields = ['order__id', 'pizza__name']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['customer', 'pizza', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['customer__user__username', 'pizza__name', 'text']

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'discount_percentage',
        'start_date', 'end_date', 'is_active'
    ]
    list_filter = ['is_active', 'start_date', 'end_date']
    search_fields = ['name', 'description']
    filter_horizontal = ['pizzas']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'image')
        }),
        ('Условия акции', {
            'fields': (
                'discount_percentage', 'start_date',
                'end_date', 'is_active', 'pizzas'
            )
        }),
        ('Дополнительная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'created_at']
    search_fields = ['question', 'answer']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['created_at']

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'created_at', 'updated_at')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

@admin.register(GlossaryTerm)
class GlossaryTermAdmin(admin.ModelAdmin):
    list_display = ('term', 'created_at', 'updated_at')
    search_fields = ('term', 'definition')
    ordering = ('term',)

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'is_active', 'order')
    list_filter = ('is_active', 'position')
    search_fields = ('name', 'position', 'description')
    ordering = ('order', 'name')

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'salary_from', 'salary_to', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'description', 'requirements', 'conditions')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_amount', 'is_active']
    list_filter = ['is_active']
    search_fields = ['code']

# Настраиваем внешний вид админ-панели
admin.site.site_header = 'Управление пиццерией'
admin.site.site_title = 'Админ-панель пиццерии'
admin.site.index_title = 'Управление'
