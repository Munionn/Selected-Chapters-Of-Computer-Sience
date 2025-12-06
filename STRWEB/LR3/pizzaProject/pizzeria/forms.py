from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.validators import RegexValidator
from django.contrib.auth.password_validation import validate_password
from .models import Customer, Review, Pizza, Order
from django.utils import timezone
from datetime import date

class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Этот email уже используется.')
        return email

class DateInput(forms.DateInput):
    input_type = 'date'
    format = '%d/%m/%Y'

class CustomerRegistrationForm(forms.ModelForm):
    phone_regex = RegexValidator(
        regex=r'^\+375 \((?:29|33|44|25)\) \d{3}-\d{2}-\d{2}$',
        message="Номер телефона должен быть в формате: '+375 (29) XXX-XX-XX'"
    )
    phone_number = forms.CharField(validators=[phone_regex], max_length=20)
    birth_date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'}),
        help_text='Вам должно быть не менее 18 лет'
    )
    
    class Meta:
        model = Customer
        fields = ('phone_number', 'birth_date', 'address')
        widgets = {
            'address': forms.Textarea(attrs={'rows': 3, 'class': 'form-control', 'placeholder': 'Введите адрес доставки'}),
        }
    
    def clean_birth_date(self):
        birth_date = self.cleaned_data.get('birth_date')
        if not birth_date:
            return birth_date
            
        today = date.today()
        min_date = date(today.year - 18, today.month, today.day)
        
        if birth_date > min_date:
            raise forms.ValidationError('Вам должно быть не менее 18 лет')
        return birth_date

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ('rating', 'text')
        widgets = {
            'rating': forms.NumberInput(attrs={'min': 1, 'max': 5}),
            'text': forms.Textarea(attrs={'rows': 4})
        }

    def clean_rating(self):
        rating = self.cleaned_data.get('rating')
        if rating < 1 or rating > 5:
            raise forms.ValidationError('Оценка должна быть от 1 до 5.')
        return rating

class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['delivery_address', 'payment_method', 'comment']
        widgets = {
            'delivery_address': forms.Textarea(attrs={
                'rows': 3,
                'class': 'form-control',
                'placeholder': 'Укажите точный адрес доставки'
            }),
            'payment_method': forms.Select(attrs={'class': 'form-select'}),
            'comment': forms.Textarea(attrs={
                'rows': 2,
                'class': 'form-control',
                'placeholder': 'Дополнительные пожелания к заказу'
            }),
        }
        labels = {
            'delivery_address': 'Адрес доставки',
            'payment_method': 'Способ оплаты',
            'comment': 'Комментарий к заказу',
        } 