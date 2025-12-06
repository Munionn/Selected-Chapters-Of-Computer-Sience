from django import template
from django.template.defaultfilters import floatformat
from django.utils import timezone
from django.db.models import Avg
from decimal import Decimal

register = template.Library()

@register.filter(name='currency')
def currency(value):
    """Format value as currency"""
    try:
        return f"{float(value):.2f} ₽"
    except (ValueError, TypeError):
        return value

@register.filter(name='discount_amount')
def discount_amount(promo_code, order_total=0):
    """Calculate discount amount based on promo code type"""
    if not promo_code:
        return 0
    
    if promo_code.discount_type == 'fixed':
        return promo_code.discount_amount
    elif promo_code.discount_type == 'percent':
        return (float(order_total) * float(promo_code.discount_amount)) / 100
    return 0

@register.filter(name='is_valid_promo')
def is_valid_promo(promo_code):
    """Check if promo code is currently valid"""
    if not promo_code or not promo_code.is_active:
        return False
        
    now = timezone.now()
    if promo_code.start_date > now or promo_code.end_date < now:
        return False
        
    if promo_code.usage_limit and promo_code.times_used >= promo_code.usage_limit:
        return False
        
    return True

@register.filter(name='remaining_uses')
def remaining_uses(promo_code):
    """Calculate remaining uses for promo code"""
    if not promo_code or not promo_code.usage_limit:
        return "∞"
    remaining = promo_code.usage_limit - promo_code.times_used
    return max(0, remaining)

@register.filter(name='format_discount')
def format_discount(promo_code):
    """Format discount value based on type"""
    if not promo_code:
        return ""
    if promo_code.discount_type == 'fixed':
        return f"{promo_code.discount_amount:.0f} ₽"
    else:
        return f"{promo_code.discount_amount:.0f}%"

@register.filter(name='subtract')
def subtract(value, arg):
    """Subtract the arg from the value"""
    try:
        return int(value) - int(arg)
    except (ValueError, TypeError):
        return value

@register.filter(name='avg')
def avg(queryset, field):
    """Calculate average value for a field in a queryset"""
    if not queryset:
        return 0
    try:
        result = queryset.aggregate(avg=Avg(field))['avg']
        return result if result is not None else 0
    except Exception:
        return 0

@register.filter(name='multiply')
def multiply(value, arg):
    """Multiply the value by the argument"""
    try:
        if isinstance(value, (int, float, Decimal)):
            return value * Decimal(str(arg))
        return 0
    except (ValueError, TypeError):
        return 0

@register.filter(name='percentage')
def percentage(value, total):
    """Calculate percentage of value relative to total"""
    try:
        if total and total != 0:
            return (float(value) / float(total)) * 100
        return 0
    except (ValueError, TypeError, ZeroDivisionError):
        return 0

@register.filter(name='sub')
def sub(value, arg):
    """Subtract the arg from the value (alias for subtract)"""
    return subtract(value, arg) 